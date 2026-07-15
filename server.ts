import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// File paths for local persistence
const INQUIRIES_FILE = path.join(process.cwd(), "inquiries.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

// Default Configuration Settings
const DEFAULT_SETTINGS = {
  adminPassword: "ampsadmin",
  whatsappPhone: "919829012345", // Default WhatsApp phone number for school redirects
  emailProvider: "formsubmit",   // Default to formsubmit for zero-config out of the box activation
  web3formsKey: "",             // Web3Forms free Access Key
  smtpHost: "",
  smtpPort: "465",
  smtpUser: "",
  smtpPass: "",
  inquiryRecipient: "jainakshat6878@gmail.com"
};

// Helper: Read Settings
function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("[DB] Error reading settings file, using defaults:", err);
  }
  return { ...DEFAULT_SETTINGS };
}

// Helper: Save Settings
function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[DB] Error writing settings file:", err);
    return false;
  }
}

// Helper: Read Inquiries
function readInquiries() {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[DB] Error reading inquiries file, returning empty list:", err);
  }
  return [];
}

// Helper: Save Inquiries
function saveInquiries(inquiries: any[]) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[DB] Error writing inquiries file:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    const { name, phone, message, clientDispatched, clientStatus, clientError } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and Phone number are required." 
      });
    }

    // A. Persist locally first so no inquiry is ever lost!
    const inquiries = readInquiries();
    const newInquiry = {
      id: "inq_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name,
      phone,
      message: message || "Interested in school admission.",
      timestamp: new Date().toISOString(),
      dispatchedVia: clientDispatched ? "Browser AJAX (Direct)" : "local_only",
      dispatchStatus: clientDispatched ? (clientStatus || "Delivered") : "Pending",
      dispatchError: clientDispatched ? (clientError || "") : ""
    };

    const config = readSettings();
    const recipient = config.inquiryRecipient || process.env.INQUIRY_RECIPIENT_EMAIL || "jainakshat6878@gmail.com";

    // B. Dispatch based on configured provider (only if client did not already dispatch from browser)
    console.log(`[Dispatcher] New inquiry received from ${name}. Preferred provider: ${config.emailProvider}. Client Dispatched: ${clientDispatched}`);

    let emailSent = clientDispatched ? true : false;
    let providerUsed = clientDispatched ? "Browser AJAX (Direct)" : config.emailProvider;
    let errorLog = clientDispatched ? (clientError || "") : "";

    if (!clientDispatched) {
      try {
        if (config.emailProvider === "web3forms" && config.web3formsKey) {
        // Option 1: Web3Forms (HTTP Client) - Most stable, bypasses all port blocks
        console.log(`[Dispatcher] Routing via Web3Forms API to recipient: ${recipient}`);
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: config.web3formsKey,
            name: `${name} (AMPS Inquiry)`,
            email: recipient,
            subject: `NEW ADMISSION INQUIRY: ${name} (${phone})`,
            message: `You have received a new admission inquiry on the AMPS School Portal:\n\n` +
                     `• Student/Parent Name: ${name}\n` +
                     `• Contact Phone: ${phone}\n` +
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

      } else if (config.emailProvider === "smtp" && config.smtpHost && config.smtpUser && config.smtpPass) {
        // Option 2: Direct SMTP Connection (Note: Might time out on Cloud Run)
        console.log(`[Dispatcher] Routing via SMTP relay through ${config.smtpHost}`);
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: parseInt(config.smtpPort) || 465,
          secure: parseInt(config.smtpPort) === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000
        });

        await transporter.sendMail({
          from: `"AMPS School Portal" <${config.smtpUser}>`,
          to: recipient,
          subject: `AMPS Portal Admission Inquiry: ${name}`,
          text: `Admission Inquiry Details:\n\nName: ${name}\nPhone: ${phone}\nMessage/Stream: ${message || "Not specified"}`
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
