import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

// Load environment variables
dotenv.config();

/**
 * AMPS School Portal - Email Dispatcher & Server Configuration
 * 
 * RECOMMENDED PRODUCTION CONFIGURATION (e.g. Render / GCP Cloud Run):
 * Configure these environment variables in your hosting provider's dashboard FIRST:
 *   - EMAIL_PROVIDER="brevo" (or "web3forms", "formsubmit", "smtp")
 *   - BREVO_API_KEY="xkeysib-..."
 *   - BREVO_SENDER_EMAIL="verified-sender@domain.com" (Must be a verified sender email in Brevo under Senders)
 *   - BREVO_SENDER_NAME="AMPS Portal"
 *   - INQUIRY_RECIPIENT_EMAIL="admin@example.com"
 * 
 * Environment variables take precedence over settings stored in SQLite / settings.json,
 * which reset on Render redeploys/restarts due to ephemeral filesystem storage.
 */

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

  CREATE TABLE IF NOT EXISTS otps (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    timestamp INTEGER NOT NULL
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

// Helper: Read Settings from DB
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

// Helper: Get Resolved Configuration (Environment Variables take precedence over SQLite/JSON)
function getResolvedConfig() {
  const dbSettings = readSettings();
  return {
    ...dbSettings,
    emailProvider: process.env.EMAIL_PROVIDER || dbSettings.emailProvider,
    inquiryRecipient: process.env.INQUIRY_RECIPIENT_EMAIL || dbSettings.inquiryRecipient || "admin@example.com",
    brevoApiKey: process.env.BREVO_API_KEY || dbSettings.brevoApiKey,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || dbSettings.brevoSenderEmail,
    brevoSenderName: process.env.BREVO_SENDER_NAME || dbSettings.brevoSenderName || "AMPS Portal",
    web3formsKey: process.env.WEB3FORMS_KEY || dbSettings.web3formsKey,
    smtpHost: process.env.SMTP_HOST || dbSettings.smtpHost,
    smtpPort: process.env.SMTP_PORT || dbSettings.smtpPort,
    smtpUser: process.env.SMTP_USER || dbSettings.smtpUser,
    smtpPass: process.env.SMTP_PASS || dbSettings.smtpPass,
    whatsappPhone: process.env.WHATSAPP_PHONE || dbSettings.whatsappPhone
  };
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

  // Startup Validation Check for Brevo Configuration
  const bootConfig = getResolvedConfig();
  console.log(`[Config] Server booting. Selected Email Provider: '${bootConfig.emailProvider}'`);
  if (bootConfig.emailProvider === "brevo") {
    if (!bootConfig.brevoApiKey) {
      console.warn("[Config Warning] Brevo is selected as email provider, but BREVO_API_KEY is not set.");
    }
    if (!bootConfig.brevoSenderEmail) {
      console.warn("[Config Warning] Brevo is selected as email provider, but BREVO_SENDER_EMAIL is not set.");
    }
  }

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
    const settings = getResolvedConfig();
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
      res.json({ success: true, message: "Settings saved successfully.", settings: getResolvedConfig() });
    } else {
      res.status(500).json({ success: false, message: "Failed to persist settings." });
    }
  });

  // 4. API: Get Inquiries (Admin Panel)
  app.post("/api/admin/inquiries", (req, res) => {
    const { password } = req.body;
    const settings = getResolvedConfig();

    if (password !== settings.adminPassword) {
      return res.status(403).json({ success: false, message: "Access Denied. Incorrect admin password." });
    }

    const inquiries = readInquiries();
    res.json({ success: true, inquiries });
  });

  // 5. API: Delete/Clear Inquiries
  app.post("/api/admin/clear-inquiries", (req, res) => {
    const { password, id } = req.body;
    const settings = getResolvedConfig();

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

  // 6. API: Diagnostic Test Email Endpoint
  app.get("/api/admin/test-email", async (req, res) => {
    const config = getResolvedConfig();
    const { emailProvider, inquiryRecipient, brevoApiKey, brevoSenderEmail, brevoSenderName, web3formsKey, smtpHost, smtpPort, smtpUser, smtpPass } = config;

    console.log(`[Diagnostic] Diagnostic test email initiated. Provider: '${emailProvider}', Recipient: '${inquiryRecipient}'`);

    try {
      if (emailProvider === "brevo") {
        if (!brevoApiKey) {
          console.warn("[Config Warning] Brevo is selected but brevoApiKey is not set.");
          return res.status(400).json({
            success: false,
            provider: "brevo",
            error: "BREVO_API_KEY is missing from environment/settings.",
            config: { emailProvider, inquiryRecipient, brevoSenderEmail, brevoApiKeySet: false }
          });
        }
        if (!brevoSenderEmail) {
          console.warn("[Config Warning] Brevo is selected but brevoSenderEmail is not set.");
        }

        console.log(`[Diagnostic] Brevo test email payload sending to ${inquiryRecipient} from sender ${brevoSenderEmail || "unspecified"}`);

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            sender: {
              name: brevoSenderName || "AMPS Portal Diagnostic",
              email: brevoSenderEmail || "no-reply@ampsschool.com"
            },
            to: [
              {
                email: inquiryRecipient,
                name: "School Admin"
              }
            ],
            subject: `🧪 Diagnostic Test Email - AMPS Portal (${new Date().toLocaleTimeString("en-IN")})`,
            htmlContent: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #14213d; border-radius: 5px; color: #333;">
                <h3 style="color: #14213d; margin-top: 0; border-bottom: 2px solid #C9A227; padding-bottom: 10px;">🧪 Brevo Email Delivery Diagnostic Test</h3>
                <p>This test email confirms that your Brevo API Key and Sender Email are properly configured and operational.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; text-align: left;">
                  <tr>
                    <td style="padding: 8px; font-weight: bold; width: 140px;">Recipient Email:</td>
                    <td style="padding: 8px;">${inquiryRecipient}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">Sender Email:</td>
                    <td style="padding: 8px;">${brevoSenderEmail || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">Sender Name:</td>
                    <td style="padding: 8px;">${brevoSenderName || "AMPS Portal Diagnostic"}</td>
                  </tr>
                </table>
                <div style="margin-top: 20px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
                  Sent via GET /api/admin/test-email at ${new Date().toLocaleString("en-IN")}
                </div>
              </div>
            `
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[Diagnostic] Brevo test email dispatched successfully!", data);
          return res.json({
            success: true,
            provider: "brevo",
            statusCode: response.status,
            brevoResponse: data,
            recipient: inquiryRecipient,
            sender: brevoSenderEmail,
            message: "Test email dispatched successfully via Brevo API."
          });
        } else {
          let errorData: any;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { rawText: await response.text() };
          }
          console.error(`[Brevo Error] HTTP Status Code: ${response.status}`, JSON.stringify(errorData, null, 2));
          return res.status(response.status || 500).json({
            success: false,
            provider: "brevo",
            statusCode: response.status,
            brevoError: errorData,
            rawError: JSON.stringify(errorData),
            message: "Brevo API rejected the test email dispatch."
          });
        }
      } else if (emailProvider === "web3forms") {
        if (!web3formsKey) {
          return res.status(400).json({ success: false, provider: "web3forms", error: "WEB3FORMS_KEY is missing." });
        }
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: web3formsKey,
            name: "AMPS Diagnostic Test",
            email: inquiryRecipient,
            subject: "🧪 Web3Forms Diagnostic Test Email",
            message: "Diagnostic test email from AMPS Portal."
          })
        });
        const data = await response.json();
        return res.status(response.ok && data.success ? 200 : 500).json({
          success: !!(response.ok && data.success),
          provider: "web3forms",
          statusCode: response.status,
          responseData: data
        });
      } else if (emailProvider === "smtp") {
        if (!smtpHost || !smtpUser || !smtpPass) {
          return res.status(400).json({ success: false, provider: "smtp", error: "SMTP credentials incomplete." });
        }
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort) || 465,
          secure: parseInt(smtpPort) === 465,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 8000
        });
        const info = await transporter.sendMail({
          from: `"AMPS Diagnostic" <${smtpUser}>`,
          to: inquiryRecipient,
          subject: "🧪 SMTP Relay Diagnostic Test Email",
          text: "Diagnostic test email from AMPS Portal."
        });
        return res.json({ success: true, provider: "smtp", info });
      } else {
        // FormSubmit fallback
        const formParams = new URLSearchParams();
        formParams.append("Name", "AMPS Diagnostic Test");
        formParams.append("Email Address", inquiryRecipient);
        formParams.append("Message", "Diagnostic test email from AMPS Portal");
        formParams.append("_subject", "🧪 FormSubmit Diagnostic Test Email");
        formParams.append("_captcha", "false");

        const response = await fetch(`https://formsubmit.co/${inquiryRecipient}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formParams.toString()
        });
        const text = await response.text();
        return res.status(response.ok ? 200 : 500).json({
          success: response.ok,
          provider: "formsubmit",
          statusCode: response.status,
          responseText: text.substring(0, 300)
        });
      }
    } catch (err: any) {
      console.error("[Diagnostic] Error executing diagnostic test email:", err);
      return res.status(500).json({
        success: false,
        provider: emailProvider,
        error: err.message || "Unknown error executing diagnostic test email",
        rawError: JSON.stringify(err, Object.getOwnPropertyNames(err))
      });
    }
  });

  // Helper: Send OTP Email
  async function sendOtpEmail(email: string, name: string, code: string, formContext: string = "admission"): Promise<boolean> {
    const config = getResolvedConfig();
    const { emailProvider, brevoApiKey, brevoSenderEmail, brevoSenderName, web3formsKey, smtpHost, smtpPort, smtpUser, smtpPass } = config;

    const isCounselling = formContext === "counselling";
    const subject = `🔒 ${code} is your AMPS Portal Email Verification Code`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background-color: #14213D; padding: 20px; border-bottom: 4px solid #C9A227; text-align: center;">
          <h2 style="font-family: Georgia, serif; color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">
            Ashish Memorial Public Senior Secondary School
          </h2>
          <p style="color: #C9A227; font-size: 11px; margin: 4px 0 0 0; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            ${isCounselling ? "ACADEMIC COUNSELLING DESK" : "ADMISSION INQUIRY DESK"}
          </p>
        </div>
        <div style="padding: 24px 28px; text-align: center; color: #1e293b;">
          <p style="font-size: 14px; color: #475569; margin-top: 0;">Hello <strong>${name || "Student / Parent"}</strong>,</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
            Please use the 6-digit OTP code below to verify your email address for your ${isCounselling ? "counselling request" : "admission inquiry"}:
          </p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #C9A227; border-radius: 8px; padding: 16px; margin: 0 auto 20px auto; max-width: 260px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #14213D;">
              ${code}
            </span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            ⏱️ This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 12px 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Ashish Memorial Public Senior Secondary School · Hindaun City, Rajasthan
        </div>
      </div>
    `;

    try {
      if (emailProvider === "brevo" && brevoApiKey) {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            sender: { name: brevoSenderName || "AMPS Verification Desk", email: brevoSenderEmail || "no-reply@ampsschool.com" },
            to: [{ email, name: name || "Applicant" }],
            subject,
            htmlContent: htmlBody
          })
        });
        return response.ok;
      } else if (emailProvider === "web3forms" && web3formsKey) {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: web3formsKey,
            name: "AMPS Verification Desk",
            email: email,
            subject,
            message: `Your AMPS Email Verification OTP is: ${code} (Valid for 10 minutes).`
          })
        });
        return response.ok;
      } else if (emailProvider === "smtp" && smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort) || 465,
          secure: parseInt(smtpPort) === 465,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 8000
        });
        await transporter.sendMail({
          from: `"AMPS Verification" <${smtpUser}>`,
          to: email,
          subject,
          html: htmlBody
        });
        return true;
      } else {
        // FormSubmit Fallback
        const formParams = new URLSearchParams();
        formParams.append("Verification Code", code);
        formParams.append("Name", name || "Applicant");
        formParams.append("_subject", subject);
        formParams.append("_captcha", "false");
        const response = await fetch(`https://formsubmit.co/${email}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formParams.toString()
        });
        return response.ok;
      }
    } catch (err) {
      console.error("[OTP Email Error]", err);
      return false;
    }
  }

  // Helper: Check Rate Limit for Email Addresses (Max 2 emails per 24 hours, minimum 5 minutes gap)
  function checkEmailRateLimit(email: string): { allowed: boolean; message?: string } {
    const emailStr = String(email || "").trim().toLowerCase();
    if (!emailStr) return { allowed: true };

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const MINIMUM_GAP_MS = 5 * 60 * 1000; // 5 minutes gap between emails
    const twentyFourHoursAgo = now - TWENTY_FOUR_HOURS_MS;

    try {
      // Cleanup logs older than 24 hours
      db.prepare("DELETE FROM email_logs WHERE timestamp < ?").run(twentyFourHoursAgo);

      // Get emails sent to this email address in the last 24 hours
      const logs = db.prepare("SELECT timestamp FROM email_logs WHERE email = ? AND timestamp >= ? ORDER BY timestamp DESC")
        .all(emailStr, twentyFourHoursAgo) as { timestamp: number }[];

      // Rule 1: Max 2 emails per 24 hours
      if (logs.length >= 2) {
        return {
          allowed: false,
          message: "Security Limit: A maximum of 2 emails per 24 hours is allowed for this email address. Please try again tomorrow or contact the school office directly."
        };
      }

      // Rule 2: Minimum 5 minutes gap between emails
      if (logs.length > 0) {
        const lastSentTime = logs[0].timestamp;
        const timeDiff = now - lastSentTime;
        if (timeDiff < MINIMUM_GAP_MS) {
          const waitSeconds = Math.ceil((MINIMUM_GAP_MS - timeDiff) / 1000);
          const waitMinutes = Math.ceil(waitSeconds / 60);
          return {
            allowed: false,
            message: `Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} (${waitSeconds}s) before requesting another email.`
          };
        }
      }
    } catch (err) {
      console.error("[Rate Limit DB Error]", err);
    }

    return { allowed: true };
  }

  function recordEmailLog(email: string) {
    const emailStr = String(email || "").trim().toLowerCase();
    if (!emailStr) return;
    try {
      db.prepare("INSERT INTO email_logs (email, timestamp) VALUES (?, ?)").run(emailStr, Date.now());
    } catch (err) {
      console.error("[DB Error] Failed to log email timestamp:", err);
    }
  }

  // 6.1. API: Send OTP to Email
  app.post("/api/send-otp", async (req, res) => {
    const { email, name, formContext } = req.body;
    const emailStr = String(email || "").trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailStr || !emailRegex.test(emailStr)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // Rate Limit Check (Max 2 per 24h & 5 min gap)
    const rateCheck = checkEmailRateLimit(emailStr);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateCheck.message
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
      db.prepare("INSERT OR REPLACE INTO otps (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
        emailStr,
        code,
        expiresAt,
        new Date().toISOString()
      );

      console.log(`[OTP GENERATED] Email: ${emailStr} | Code: ${code} | Context: ${formContext || "admission"}`);

      const emailSent = await sendOtpEmail(emailStr, name || "Student/Parent", code, formContext);

      if (emailSent) {
        recordEmailLog(emailStr);
      }

      res.json({
        success: true,
        emailSent,
        message: `OTP verification code sent to ${emailStr}.`
      });
    } catch (err: any) {
      console.error("[OTP Generation Error]", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate OTP code. Please try again."
      });
    }
  });

  // 6.2. API: Verify OTP Code
  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const emailStr = String(email || "").trim().toLowerCase();
    const codeStr = String(otp || "").trim();

    if (!emailStr || !codeStr) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit OTP code are required."
      });
    }

    const row = db.prepare("SELECT * FROM otps WHERE email = ?").get(emailStr) as { code: string; expires_at: number } | undefined;

    if (!row) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please click 'Send OTP' again."
      });
    }

    if (Date.now() > row.expires_at) {
      db.prepare("DELETE FROM otps WHERE email = ?").run(emailStr);
      return res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new OTP code."
      });
    }

    if (row.code !== codeStr) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP code. Please check your email and try again."
      });
    }

    // Successfully verified! Clear OTP from DB so it cannot be reused
    db.prepare("DELETE FROM otps WHERE email = ?").run(emailStr);

    res.json({
      success: true,
      verified: true,
      message: "Email address verified successfully!"
    });
  });

  // 7. API: Submit New Admission / Counselling Inquiry
  app.post("/api/send-email", async (req, res) => {
    const { name, phone, email, message, clientDispatched, clientStatus, clientError, formContext } = req.body;

    const cleanPhone = phone ? String(phone).replace(/[\s\-\+\(\)]/g, "").replace(/^91(?=\d{10}$)/, "") : "";

    if (!name || !cleanPhone || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, Mobile number, and Email address are required."
      });
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number"
      });
    }

    const emailStr = String(email).trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailStr) || emailStr.split("@")[1]?.includes("..")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address with a valid domain (e.g. name@gmail.com)."
      });
    }

    // Determine if this is a counselling booking request or a standard admission inquiry
    const isCounselling = (formContext === "counselling") ||
      (typeof message === "string" && (message.toLowerCase().includes("counselling") || message.toLowerCase().includes("stream selection")));
    const resolvedContext = isCounselling ? "counselling" : "admission";

    const emailSubject = isCounselling
      ? `New Counselling Session Request: ${name} (${phone})`
      : `New Admission Inquiry: ${name} (${phone})`;

    const emailHeading = isCounselling
      ? "New Counselling Session Request"
      : "New Prospective Student Inquiry";

    const emailIntroLine = isCounselling
      ? "A new stream selection counselling request has been submitted on the Ashish Memorial Public School Portal:"
      : "A new admission inquiry has been submitted on the Ashish Memorial Public School Portal:";

    const messageLabel = isCounselling ? "Stream Interest" : "Message/Class";

    // A. Persist locally first so no inquiry is ever lost!
    const inquiries = readInquiries();
    const newInquiry = {
      id: "inq_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name,
      phone,
      email: email || "",
      message: message || (isCounselling ? "Requesting a stream selection counselling session (Science/Commerce/Arts)." : "Interested in school admission."),
      timestamp: new Date().toISOString(),
      dispatchedVia: clientDispatched ? "Browser AJAX (Direct)" : "local_only",
      dispatchStatus: clientDispatched ? (clientStatus || "Delivered") : "Pending",
      dispatchError: clientDispatched ? (clientError || "") : ""
    };

    const config = getResolvedConfig();

    // Config fields resolved from process.env with SQLite fallback
    const emailProvider = config.emailProvider;
    const recipient = config.inquiryRecipient;
    const brevoApiKey = config.brevoApiKey;
    const brevoSenderEmail = config.brevoSenderEmail;
    const brevoSenderName = config.brevoSenderName;
    const web3formsKey = config.web3formsKey;
    const smtpHost = config.smtpHost;
    const smtpPort = config.smtpPort;
    const smtpUser = config.smtpUser;
    const smtpPass = config.smtpPass;

    // B. Dispatch based on configured provider (only if client did not already dispatch from browser)
    console.log(`[Dispatcher] New inquiry received from ${name} (Type: ${resolvedContext}). Preferred provider: ${emailProvider}. Client Dispatched: ${clientDispatched}`);

    let emailSent = clientDispatched ? true : false;
    let providerUsed = clientDispatched ? "Browser AJAX (Direct)" : emailProvider;
    let errorLog = clientDispatched ? (clientError || "") : "";

    const formattedDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <!-- Top Brand Header Banner with Navy Background + Gold Accent Line -->
        <div style="background-color: #14213D; padding: 24px; border-bottom: 4px solid #C9A227; text-align: left;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <span style="font-family: monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #C9A227; text-transform: uppercase; background-color: rgba(201, 162, 39, 0.15); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(201, 162, 39, 0.3); display: inline-block;">
                  ${isCounselling ? "ACADEMIC COUNSELLING DESK" : "AMPS ADMISSION DESK"}
                </span>
                <h1 style="font-family: Georgia, serif; color: #ffffff; font-size: 20px; margin: 12px 0 4px 0; font-weight: 700;">
                  Ashish Memorial Public Senior Secondary School
                </h1>
                <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                  Hindaun City (Karauli), Rajasthan · Estd. 2005
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Main Body Content -->
        <div style="padding: 26px 28px; color: #1e293b; line-height: 1.6;">
          
          <!-- Dynamic Email Heading -->
          <h2 style="color: #14213D; font-family: Georgia, serif; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            ${emailHeading}
          </h2>

          <p style="font-size: 13px; color: #475569; margin-top: 0; margin-bottom: 20px;">
            ${emailIntroLine}
          </p>

          <!-- Details Table with Alternating Shading & Consistent 12px 16px Padding -->
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 12px; color: #64748b; text-transform: uppercase; width: 140px;">Name</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 14px; color: #0f172a;">${name}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 12px; color: #64748b; text-transform: uppercase;">Phone</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                <a href="tel:${phone}" style="color: #7A2331; font-weight: 700; text-decoration: none;">${phone}</a>
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 12px; color: #64748b; text-transform: uppercase;">Email</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                ${email ? `<a href="mailto:${email}" style="color: #14213D; font-weight: 600; text-decoration: none;">${email}</a>` : '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'}
              </td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px 16px; font-weight: 700; font-size: 12px; color: #64748b; text-transform: uppercase; vertical-align: top;">${messageLabel}</td>
              <td style="padding: 12px 16px; font-size: 13px; color: #334155; white-space: pre-wrap; line-height: 1.5; font-weight: 500;">${message || (isCounselling ? "Requesting a stream selection counselling session (Science/Commerce/Arts)." : "Interested in school admission.")}</td>
            </tr>
          </table>

          <!-- Highlighted Call-to-Action Box -->
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #C9A227; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #92400e;">
              Please contact the applicant within 24 hours
            </p>
          </div>

          <!-- Quick Action Buttons for Admin -->
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; border: 1px solid #cbd5e1; margin-bottom: 10px;">
            <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 12px;">Quick Administrator Action</span>
            <table style="width: 100%; max-width: 380px; margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; text-align: center;">
                  <a href="tel:${phone}" style="display: block; background-color: #14213D; color: #ffffff; padding: 10px 16px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 700; line-height: 1.4;">
                    Call Applicant (${phone})
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; text-align: center;">
                  <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${name}, regarding your ${isCounselling ? 'counselling request' : 'admission inquiry'} at Ashish Memorial Public School...`)}" style="display: block; background-color: #16a34a; color: #ffffff; padding: 10px 16px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 700; line-height: 1.4;">
                    Reply via WhatsApp
                  </a>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <!-- School Contact Info Footer with Timestamp -->
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5;">
          <div style="font-weight: 700; color: #14213D; margin-bottom: 4px;">
            Ashish Memorial Public Senior Secondary School
          </div>
          <div>
            Hindaun City (Karauli), Rajasthan · Phone: 91163 04006 / 94131 82619 · Email: ampspankaj@gmail.com
          </div>
          <div style="margin-top: 8px; color: #94a3b8; font-size: 10px;">
            Submitted on: ${formattedDate} IST
          </div>
        </div>

      </div>
    `;

    if (!clientDispatched) {
      try {
        if (emailProvider === "brevo") {
          if (!brevoApiKey) {
            const missingKeyErr = "[Brevo Error] BREVO_API_KEY is not configured.";
            console.error(missingKeyErr);
            throw new Error(missingKeyErr);
          }

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
                name: isCounselling ? `${name} (Counselling Desk)` : `${name} via AMPS Portal`,
                email: brevoSenderEmail || "no-reply@ampsschool.com"
              },
              to: [
                {
                  email: recipient,
                  name: "School Admin"
                }
              ],
              replyTo: email ? { email, name } : undefined,
              subject: emailSubject,
              htmlContent: htmlBody
            })
          });

          if (response.ok) {
            emailSent = true;
            newInquiry.dispatchStatus = "Delivered";
            console.log("[Dispatcher] Brevo API delivery successful!");
          } else {
            let errorJson: any;
            try {
              errorJson = await response.json();
            } catch (e) {
              errorJson = { message: await response.text() };
            }
            console.error(`[Brevo Error] HTTP Status Code: ${response.status}`, JSON.stringify(errorJson, null, 2));
            const fullRawError = `[HTTP ${response.status}] ${typeof errorJson === "string" ? errorJson : JSON.stringify(errorJson)}`;
            throw new Error(fullRawError);
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
              name: `${name} (${isCounselling ? 'Counselling Request' : 'AMPS Inquiry'})`,
              email: recipient,
              replyto: email || undefined,
              subject: emailSubject,
              message: `${emailIntroLine}\n\n` +
                `• Name: ${name}\n` +
                `• Phone: ${phone}\n` +
                `• Email: ${email || "Not provided"}\n` +
                `• ${messageLabel}: ${message || "Not specified"}\n\n` +
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
            subject: emailSubject,
            html: htmlBody
          });

          emailSent = true;
          newInquiry.dispatchStatus = "Delivered";
          console.log("[Dispatcher] Nodemailer SMTP delivery successful!");

        } else {
          // Option 3: FormSubmit Fallback (uses local recipient email)
          console.log(`[Dispatcher] Routing via FormSubmit urlencoded to ${recipient}`);

          const formParams = new URLSearchParams();
          formParams.append("Category", isCounselling ? "Stream Selection Counselling Request" : "Standard Admission Inquiry");
          formParams.append("Name", name);
          formParams.append("Phone / Mobile", phone);
          formParams.append("Email Address", email || "Not provided");
          if (email) {
            formParams.append("_replyto", email);
          }
          formParams.append(messageLabel, message || "Not specified");
          formParams.append("_subject", emailSubject);
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

    if (emailSent && emailStr) {
      recordEmailLog(emailStr);
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
