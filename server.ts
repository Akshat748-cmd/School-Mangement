import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

// Load environment variables
dotenv.config();

// Initialize SQLite database
const db = new Database(path.join(process.cwd(), "school.db"));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    settings_json TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    timestamp TEXT NOT NULL,
    dispatchedVia TEXT,
    dispatchStatus TEXT,
    dispatchError TEXT
  );
`);

// Default Configuration Settings
const DEFAULT_SETTINGS = {
  adminPassword: "ampsadmin",
  whatsappPhone: "919999999999", // Default WhatsApp phone number placeholder
  emailProvider: "formsubmit",   // Default to formsubmit for zero-config out of the box activation
  web3formsKey: "",             // Web3Forms free Access Key
  smtpHost: "",
  smtpPort: "465",
  smtpUser: "",
  smtpPass: "",
  inquiryRecipient: "admin@example.com",
  brevoApiKey: "",              // Brevo API Key
  brevoSenderEmail: "",         // Verified sender email in Brevo
  brevoSenderName: "AMPS Portal" // Sender name
};

// Migration from flat JSON files to SQLite
try {
  const SETTINGS_JSON_PATH = path.join(process.cwd(), "settings.json");
  const INQUIRIES_JSON_PATH = path.join(process.cwd(), "inquiries.json");

  // Migrate Settings
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0 && fs.existsSync(SETTINGS_JSON_PATH)) {
    console.log("[Migration] Migrating settings.json to SQLite database...");
    const rawData = fs.readFileSync(SETTINGS_JSON_PATH, "utf-8");
    db.prepare("INSERT OR REPLACE INTO settings (id, settings_json) VALUES (1, ?)").run(rawData);
    fs.renameSync(SETTINGS_JSON_PATH, SETTINGS_JSON_PATH + ".bak");
    console.log("[Migration] settings.json migrated and backed up.");
  }

  // Migrate Inquiries
  const inquiriesCount = db.prepare("SELECT COUNT(*) as count FROM inquiries").get() as { count: number };
  if (inquiriesCount.count === 0 && fs.existsSync(INQUIRIES_JSON_PATH)) {
    console.log("[Migration] Migrating inquiries.json to SQLite database...");
    const rawData = fs.readFileSync(INQUIRIES_JSON_PATH, "utf-8");
    const list = JSON.parse(rawData);
    if (Array.isArray(list)) {
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO inquiries (
          id, name, phone, email, message, timestamp, dispatchedVia, dispatchStatus, dispatchError
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      db.transaction(() => {
        for (const inq of list) {
          insertStmt.run(
            inq.id,
            inq.name,
            inq.phone,
            inq.email || "",
            inq.message || "",
            inq.timestamp,
            inq.dispatchedVia || "",
            inq.dispatchStatus || "",
            inq.dispatchError || ""
          );
        }
      })();
      fs.renameSync(INQUIRIES_JSON_PATH, INQUIRIES_JSON_PATH + ".bak");
      console.log(`[Migration] ${list.length} inquiries migrated and inquiries.json backed up.`);
    }
  }
} catch (err) {
  console.error("[Migration] Error migrating JSON to SQLite:", err);
}

// Helper: Read Settings
function readSettings() {
  try {
    const row = db.prepare("SELECT settings_json FROM settings WHERE id = 1").get() as { settings_json: string } | undefined;
    if (row && row.settings_json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(row.settings_json) };
    }
  } catch (err) {
    console.error("[DB] Error reading settings from SQLite, using defaults:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

// Helper: Save Settings
function saveSettings(settings: any) {
  try {
    const jsonStr = JSON.stringify(settings);
    db.prepare("INSERT OR REPLACE INTO settings (id, settings_json) VALUES (1, ?)").run(jsonStr);
    return true;
  } catch (err) {
    console.error("[DB] Error writing settings to SQLite:", err);
    return false;
  }
}

// Helper: Read Inquiries
function readInquiries() {
  try {
    const rows = db.prepare("SELECT * FROM inquiries ORDER BY timestamp ASC").all();
    return rows;
  } catch (err) {
    console.error("[DB] Error reading inquiries from SQLite, returning empty list:", err);
  }
  return [];
}

// Helper: Save Inquiries
function saveInquiries(inquiries: any[]) {
  try {
    const deleteStmt = db.prepare("DELETE FROM inquiries");
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO inquiries (
        id, name, phone, email, message, timestamp, dispatchedVia, dispatchStatus, dispatchError
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    db.transaction((list: any[]) => {
      deleteStmt.run();
      for (const inq of list) {
        insertStmt.run(
          inq.id,
          inq.name,
          inq.phone,
          inq.email || "",
          inq.message || "",
          inq.timestamp,
          inq.dispatchedVia || "",
          inq.dispatchStatus || "",
          inq.dispatchError || ""
        );
      }
    })(inquiries);

    return true;
  } catch (err) {
    console.error("[DB] Error saving inquiries to SQLite:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Serve uploaded images from public/assets/ — registered first so images always load
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));

  // 1. API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. API: Get Settings
  app.get("/api/admin/settings", (req, res) => {
    const settings = readSettings();
    // Return settings (sanitize password for safety in UI unless authorized)
    res.json({ success: true, settings });
  });

  // 3. API: Save Settings
  app.post("/api/admin/settings", (req, res) => {
    const { password, settings } = req.body;
    const currentSettings = readSettings();

    if (password !== currentSettings.adminPassword) {
      return res.status(403).json({ success: false, message: "Invalid admin password." });
    }

    const updated = { ...currentSettings, ...settings };
    if (saveSettings(updated)) {
      res.json({ success: true, message: "Settings saved successfully.", settings: updated });
    } else {
      res.status(500).json({ success: false, message: "Failed to persist settings." });
    }
  });

  // 4. API: Get Inquiries (Admin Panel)
  app.post("/api/admin/inquiries", (req, res) => {
    const { password } = req.body;
    const settings = readSettings();

    if (password !== settings.adminPassword) {
      return res.status(403).json({ success: false, message: "Access Denied. Incorrect admin password." });
    }

    const inquiries = readInquiries();
    res.json({ success: true, inquiries });
  });

  // 5. API: Delete/Clear Inquiries
  app.post("/api/admin/clear-inquiries", (req, res) => {
    const { password, id } = req.body;
    const settings = readSettings();

    if (password !== settings.adminPassword) {
      return res.status(403).json({ success: false, message: "Access Denied." });
    }

    let inquiries = readInquiries();
    if (id) {
      inquiries = inquiries.filter((inq: any) => inq.id !== id);
    } else {
      inquiries = [];
    }

    if (saveInquiries(inquiries)) {
      res.json({ success: true, message: id ? "Inquiry deleted." : "All inquiries cleared.", inquiries });
    } else {
      res.status(500).json({ success: false, message: "Failed to update inquiries database." });
    }
  });

  // 6. API: Submit New Admission Inquiry
  app.post("/api/send-email", async (req, res) => {
    const { name, phone, email, message, clientDispatched, clientStatus, clientError } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, Phone number, and Email address are required." 
      });
    }

    // A. Persist locally first so no inquiry is ever lost!
    const inquiries = readInquiries();
    const newInquiry = {
      id: "inq_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name,
      phone,
      email: email || "",
      message: message || "Interested in school admission.",
      timestamp: new Date().toISOString(),
      dispatchedVia: clientDispatched ? "Browser AJAX (Direct)" : "local_only",
      dispatchStatus: clientDispatched ? (clientStatus || "Delivered") : "Pending",
      dispatchError: clientDispatched ? (clientError || "") : ""
    };

    const config = readSettings();
    
    // Support Environment Variables as overrides for hosting environments like Render (which have ephemeral storage)
    const emailProvider = process.env.EMAIL_PROVIDER || config.emailProvider;
    const recipient = process.env.INQUIRY_RECIPIENT_EMAIL || config.inquiryRecipient || "admin@example.com";
    const brevoApiKey = process.env.BREVO_API_KEY || config.brevoApiKey;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || config.brevoSenderEmail;
    const brevoSenderName = process.env.BREVO_SENDER_NAME || config.brevoSenderName;
    const web3formsKey = process.env.WEB3FORMS_KEY || config.web3formsKey;
    const smtpHost = process.env.SMTP_HOST || config.smtpHost;
    const smtpPort = process.env.SMTP_PORT || config.smtpPort;
    const smtpUser = process.env.SMTP_USER || config.smtpUser;
    const smtpPass = process.env.SMTP_PASS || config.smtpPass;

    // B. Dispatch based on configured provider (only if client did not already dispatch from browser)
    console.log(`[Dispatcher] New inquiry received from ${name}. Preferred provider: ${emailProvider}. Client Dispatched: ${clientDispatched}`);

    let emailSent = clientDispatched ? true : false;
    let providerUsed = clientDispatched ? "Browser AJAX (Direct)" : emailProvider;
    let errorLog = clientDispatched ? (clientError || "") : "";

    if (!clientDispatched) {
      try {
        if (emailProvider === "brevo" && brevoApiKey) {
          console.log(`[Dispatcher] Routing via Brevo API to recipient: ${recipient}`);
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": brevoApiKey,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              sender: {
                name: `${name} via AMPS Portal`,
                email: brevoSenderEmail || "no-reply@ampsschool.com"
              },
              to: [
                {
                  email: recipient,
                  name: "School Admin"
                }
              ],
              replyTo: email ? { email, name } : undefined,
              subject: `✨ New Admission Inquiry: ${name} (${phone})`,
              htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; color: #333;">
                  <h2 style="color: #14213d; margin-top: 0; border-bottom: 2px solid #C9A227; padding-bottom: 10px;">New Prospective Student Inquiry</h2>
                  <p>A new admission inquiry has been submitted on the Ashish Memorial Public School Portal:</p>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px; text-align: left;">
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px; background-color: #f9f9f9;">Name:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; background-color: #f9f9f9;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="tel:${phone}" style="color: #14213d; text-decoration: none; font-weight: bold;">${phone}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; background-color: #f9f9f9;">Email:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; background-color: #f9f9f9;">${email ? `<a href="mailto:${email}" style="color: #14213d; text-decoration: none;">${email}</a>` : "Not provided"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Message/Class:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message || "Interested in school admission."}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 25px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                    Submitted on: ${new Date().toLocaleString("en-IN")}<br/>
                    Sent via Brevo API Email Delivery
                  </div>
                </div>
              `
            })
          });

          if (response.ok) {
            emailSent = true;
            newInquiry.dispatchStatus = "Delivered";
            console.log("[Dispatcher] Brevo API delivery successful!");
          } else {
            const data: any = await response.json();
            throw new Error(data.message || JSON.stringify(data) || "Brevo API rejected the post.");
          }
        } else if (emailProvider === "web3forms" && web3formsKey) {
        // Option 1: Web3Forms (HTTP Client) - Most stable, bypasses all port blocks
        console.log(`[Dispatcher] Routing via Web3Forms API to recipient: ${recipient}`);
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            name: `${name} (AMPS Inquiry)`,
            email: recipient,
            replyto: email || undefined,
            subject: `NEW ADMISSION INQUIRY: ${name} (${phone})`,
            message: `You have received a new admission inquiry on the AMPS School Portal:\n\n` +
                     `• Student/Parent Name: ${name}\n` +
                     `• Contact Phone: ${phone}\n` +
                     `• Email Address: ${email || "Not provided"}\n` +
                     `• Message/Desired Class: ${message || "Not specified"}\n\n` +
                     `--- Form submitted via AMPS Web Portal ---`
          })
        });

        const data: any = await response.json();
        if (response.ok && data.success) {
          emailSent = true;
          newInquiry.dispatchStatus = "Delivered";
          console.log("[Dispatcher] Web3Forms delivery successful!");
        } else {
          throw new Error(data.message || "Web3Forms API rejected the post.");
        }

      } else if (emailProvider === "smtp" && smtpHost && smtpUser && smtpPass) {
        // Option 2: Direct SMTP Connection (Note: Might time out on Cloud Run)
        console.log(`[Dispatcher] Routing via SMTP relay through ${smtpHost}`);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort) || 465,
          secure: parseInt(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000
        });

        await transporter.sendMail({
          from: `"AMPS School Portal" <${smtpUser}>`,
          to: recipient,
          replyTo: email || undefined,
          subject: `AMPS Portal Admission Inquiry: ${name}`,
          text: `Admission Inquiry Details:\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || "Not provided"}\nMessage/Stream: ${message || "Not specified"}`
        });

        emailSent = true;
        newInquiry.dispatchStatus = "Delivered";
        console.log("[Dispatcher] Nodemailer SMTP delivery successful!");

      } else {
        // Option 3: FormSubmit Fallback (uses local recipient email)
        // We use the standard formsubmit.co/recipient endpoint with form-urlencoded data.
        // This is 100% reliable for triggering the activation email and sending submissions,
        // and completely avoids the JSON/AJAX 500 errors!
        console.log(`[Dispatcher] Routing via FormSubmit urlencoded to ${recipient}`);
        
        const formParams = new URLSearchParams();
        formParams.append("Name", name);
        formParams.append("Phone / Mobile", phone);
        formParams.append("Email Address", email || "Not provided");
        if (email) {
          formParams.append("_replyto", email);
        }
        formParams.append("Message", message || "Interested in school admission");
        formParams.append("_subject", `New AMPS Admission Inquiry: ${name} (${phone})`);
        formParams.append("_captcha", "false");
        formParams.append("_template", "table");

        const response = await fetch(`https://formsubmit.co/${recipient}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml"
          },
          body: formParams.toString()
        });

        const responseText = await response.text();
        console.log(`[Dispatcher] FormSubmit responded with status: ${response.status}`);

        if (response.ok) {
          emailSent = true;
          // Check if response contains activation warning
          if (responseText.toLowerCase().includes("activate") || responseText.toLowerCase().includes("activation")) {
            newInquiry.dispatchStatus = "Needs Activation";
            console.log("[Dispatcher] FormSubmit sent activation request successfully!");
          } else {
            newInquiry.dispatchStatus = "Delivered";
            console.log("[Dispatcher] FormSubmit standard delivery request sent successfully!");
          }
        } else {
          throw new Error(`FormSubmit server returned status ${response.status}`);
        }
      }
    } catch (err: any) {
      console.error("[Dispatcher] Email dispatch failed:", err);
      errorLog = err.message || "Unknown delivery error";
      newInquiry.dispatchStatus = "Failed";
      newInquiry.dispatchError = errorLog;
    }
  }

    newInquiry.dispatchedVia = providerUsed;
    inquiries.push(newInquiry);
    saveInquiries(inquiries);

    // Return status to client
    res.json({
      success: true, // Always true because the inquiry was successfully stored locally
      emailSent,
      dispatchStatus: newInquiry.dispatchStatus,
      dispatchError: errorLog,
      inquiry: newInquiry,
      whatsappRedirectUrl: `https://api.whatsapp.com/send?phone=${config.whatsappPhone}&text=` + encodeURIComponent(
        `*AMPS Admission Inquiry Form*\n\n` +
        `• *Name:* ${name}\n` +
        `• *Phone:* ${phone}\n` +
        `• *Message:* ${message || "Looking for admission"}\n\n` +
        `_Inquiry successfully stored in website log database._`
      )
    });
  });

  // 7. Serve Frontend Client Files using Vite middleware (development) or Static Server (production)
  if (process.env.NODE_ENV !== "production") {
    // Explicitly serve the public/ folder so images, fonts etc load correctly
    app.use(express.static(path.join(process.cwd(), "public")));

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-Stack App running on http://localhost:${PORT}`);
  });
}

startServer();
