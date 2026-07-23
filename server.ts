import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        username: string;
        role: string;
      };
      adminUser?: {
        username: string;
        role: string;
        impersonatedBy?: string | null;
      };
    }
  }
}

// Load environment variables
dotenv.config();

/**
 * AMPS School Portal - Server & Turso DB Configuration
 */

const rawTursoUrl = process.env.TURSO_DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
const rawTursoToken = process.env.TURSO_AUTH_TOKEN?.trim().replace(/^["']|["']$/g, "");

console.log("[DB] Connecting to Turso database...");
if (!rawTursoUrl) {
  console.warn(
    "[DB WARNING] TURSO_DATABASE_URL not set — using local file:school.db which will reset on Render restarts. Set TURSO_DATABASE_URL in environment variables for persistence."
  );
} else {
  console.log(`[DB] Using TURSO_DATABASE_URL: ${rawTursoUrl}`);
}

const db = createClient({
  url: rawTursoUrl || "file:school.db",
  authToken: rawTursoToken,
});

// Default Configuration Settings
const DEFAULT_SETTINGS = {
  adminPassword: "ampsadmin",
  whatsappPhone: "919999999999",
  emailProvider: "formsubmit",
  web3formsKey: "",
  smtpHost: "",
  smtpPort: "465",
  smtpUser: "",
  smtpPass: "",
  inquiryRecipient: "admin@example.com",
  brevoApiKey: "",
  brevoSenderEmail: "",
  brevoSenderName: "AMPS Portal"
};

// Audit Log Helper
async function recordAuditLog(
  action: string,
  performedBy: string,
  performedByRole: string,
  targetId?: string,
  targetData?: string
) {
  try {
    const timestamp = new Date().toISOString();
    await db.execute({
      sql: `INSERT INTO audit_log (action, performed_by, performed_by_role, target_id, target_data, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [action, performedBy, performedByRole, targetId || null, targetData || null, timestamp]
    });

    if (process.env.NODE_ENV !== "production") {
      const logFile = path.join(process.cwd(), "active-admin-credentials.local.txt");
      const logLine = `[${timestamp}] ${action.toUpperCase()} — Performed by: ${performedBy} (${performedByRole}) ${
        targetId ? `| Target: ${targetId}` : ""
      }\n`;
      fs.appendFileSync(logFile, logLine, "utf-8");
    }
  } catch (err: any) {
    console.error("[Audit Log Error]:", err.message);
  }
}

// Credentials File Sync Helper
async function updateCredentialsFile() {
  if (process.env.NODE_ENV === "production") return;
  try {
    const res = await db.execute("SELECT rowid as id, username, role, plain_password FROM admin_users ORDER BY rowid ASC");
    const users = res.rows as any[];

    let content = `================================================================================
          AMPS PORTAL — ACTIVE ADMIN ACCOUNTS & CREDENTIALS
================================================================================\n\n`;

    let i = 1;
    for (const u of users) {
      const uname = String(u.username);
      const role = String(u.role);
      const pass = String(u.plain_password || "ampsadmin");
      content += `${i}. ${uname.toUpperCase()} ACCOUNT:
   - Username : ${uname}
   - Password : ${pass}
   - Role     : ${role}
   - Access   : Management & Security Controls\n\n`;
      i++;
    }

    content += `================================================================================
          LIVE PASSWORD & AUTHENTICATION AUDIT LOGS
================================================================================\n`;

    const auditRes = await db.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 50");
    const logs = (auditRes.rows as any[]).slice().reverse();
    for (const log of logs) {
      content += `[${log.timestamp}] ${String(log.action).toUpperCase()} — Performed by: ${log.performed_by} (${log.performed_by_role}) ${log.target_id ? `| Target: ${log.target_id}` : ""}\n`;
    }

    const logFile = path.join(process.cwd(), "active-admin-credentials.local.txt");
    fs.writeFileSync(logFile, content, "utf-8");
  } catch (err: any) {
    console.error("[Credentials Sync Error]:", err.message);
  }
}

// Database Schema Initialization & Seeding
async function initializeDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        created_by TEXT DEFAULT 'system'
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        changed_at TEXT DEFAULT (datetime('now')),
        changed_by TEXT NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        impersonated_by TEXT DEFAULT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        performed_by_role TEXT NOT NULL,
        target_id TEXT,
        target_data TEXT,
        timestamp TEXT DEFAULT (datetime('now')),
        revoked INTEGER DEFAULT 0,
        revoked_by TEXT DEFAULT NULL,
        revoked_at TEXT DEFAULT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        message TEXT,
        formContext TEXT DEFAULT 'admission',
        timestamp TEXT DEFAULT (datetime('now')),
        isRead INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        dispatchStatus TEXT DEFAULT 'Pending',
        dispatchedVia TEXT,
        dispatchError TEXT,
        deleted INTEGER DEFAULT 0,
        deleted_by TEXT DEFAULT NULL,
        deleted_at TEXT DEFAULT NULL
      )
    `);

    // Ensure columns exist on existing databases (Schema Migrations)
    const migrationQueries = [
      "ALTER TABLE admin_sessions ADD COLUMN username TEXT",
      "ALTER TABLE admin_sessions ADD COLUMN role TEXT",
      "ALTER TABLE admin_sessions ADD COLUMN created_at TEXT",
      "ALTER TABLE admin_sessions ADD COLUMN expires_at TEXT",
      "ALTER TABLE admin_sessions ADD COLUMN impersonated_by TEXT",
      "ALTER TABLE admin_users ADD COLUMN password_hash TEXT",
      "ALTER TABLE admin_users ADD COLUMN plain_password TEXT",
      "ALTER TABLE admin_users ADD COLUMN created_at TEXT",
      "ALTER TABLE admin_users ADD COLUMN created_by TEXT",
      "ALTER TABLE audit_log ADD COLUMN revoked INTEGER DEFAULT 0",
      "ALTER TABLE audit_log ADD COLUMN revoked_by TEXT",
      "ALTER TABLE audit_log ADD COLUMN revoked_at TEXT",
      "ALTER TABLE inquiries ADD COLUMN formContext TEXT DEFAULT 'admission'",
      "ALTER TABLE inquiries ADD COLUMN dispatchStatus TEXT DEFAULT 'Pending'",
      "ALTER TABLE inquiries ADD COLUMN dispatchedVia TEXT",
      "ALTER TABLE inquiries ADD COLUMN dispatchError TEXT",
      "ALTER TABLE inquiries ADD COLUMN deleted INTEGER DEFAULT 0",
      "ALTER TABLE inquiries ADD COLUMN deleted_by TEXT",
      "ALTER TABLE inquiries ADD COLUMN deleted_at TEXT",
      "ALTER TABLE settings ADD COLUMN key TEXT",
      "ALTER TABLE settings ADD COLUMN value TEXT",
      "ALTER TABLE password_history ADD COLUMN changed_at TEXT",
      "ALTER TABLE password_history ADD COLUMN changed_by TEXT"
    ];

    for (const q of migrationQueries) {
      try {
        await db.execute(q);
      } catch (e) {
        // Column already exists or table structure matches
      }
    }

    // Verify admin_sessions table schema completeness; recreate if invalid
    try {
      await db.execute("SELECT token, username, role, created_at, expires_at, impersonated_by FROM admin_sessions LIMIT 1");
    } catch (e) {
      console.log("[DB Migration] Recreating admin_sessions table with complete schema...");
      try {
        await db.execute("DROP TABLE IF EXISTS admin_sessions");
        await db.execute(`
          CREATE TABLE admin_sessions (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT NOT NULL,
            impersonated_by TEXT DEFAULT NULL
          )
        `);
      } catch (dropErr: any) {
        console.error("[DB Session Table Repair Error]:", dropErr.message);
      }
    }

    // Verify password_history table schema completeness; recreate if invalid
    try {
      await db.execute("SELECT id, username, changed_at, changed_by FROM password_history LIMIT 1");
    } catch (e) {
      console.log("[DB Migration] Recreating password_history table with complete schema...");
      try {
        await db.execute("DROP TABLE IF EXISTS password_history");
        await db.execute(`
          CREATE TABLE password_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            changed_at TEXT DEFAULT (datetime('now')),
            changed_by TEXT NOT NULL
          )
        `);
      } catch (dropErr: any) {
        console.error("[DB Password History Table Repair Error]:", dropErr.message);
      }
    }

    console.log("[DB] Tables initialized and auto-migrated successfully");

    const defaults = [
      { username: "superadmin", role: "Superadmin", password: process.env.SUPERADMIN_PASSWORD || "ampssuperadmin" },
      { username: "chairman", role: "Chairman", password: process.env.CHAIRMAN_PASSWORD || "ampschairman" },
      { username: "administrator", role: "Administrator", password: process.env.ADMIN_PASSWORD || "ampsadmin" },
      { username: "principal", role: "Principal", password: process.env.PRINCIPAL_PASSWORD || "ampsprincipal" }
    ];

    for (const u of defaults) {
      const existing = await db.execute({
        sql: "SELECT * FROM admin_users WHERE LOWER(username) = ?",
        args: [u.username.toLowerCase()]
      });
      const row = existing.rows[0] as any;
      if (!row) {
        const hash = await bcrypt.hash(u.password, 12);
        await db.execute({
          sql: "INSERT INTO admin_users (username, role, password_hash, plain_password, created_at, created_by) VALUES (?, ?, ?, ?, datetime('now'), 'system')",
          args: [u.username, u.role, hash, u.password]
        });
        await db.execute({
          sql: "INSERT INTO password_history (username, changed_at, changed_by) VALUES (?, datetime('now'), 'System Initializer')",
          args: [u.username]
        });
      } else if (!row.password_hash || !String(row.password_hash).startsWith("$2")) {
        const existingPlain = row.plain_password || u.password;
        const hash = await bcrypt.hash(existingPlain, 12);
        await db.execute({
          sql: "UPDATE admin_users SET password_hash = ? WHERE LOWER(username) = ?",
          args: [hash, u.username.toLowerCase()]
        });
      }
    }

    console.log("[DB] Admin users seeded successfully: superadmin, chairman, administrator, principal");
    await updateCredentialsFile();
  } catch (err: any) {
    console.error("[DB Init Error]:", err.message);
  }
}

// Settings Helpers
async function readSettings() {
  try {
    const res = await db.execute("SELECT value FROM settings WHERE key = 'settings_json'");
    if (res.rows[0]?.value) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(String(res.rows[0].value)) };
    }
  } catch (err) {
    try {
      const resLegacy = await db.execute("SELECT settings_json FROM settings WHERE id = 1");
      if (resLegacy.rows[0]?.settings_json) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(String(resLegacy.rows[0].settings_json)) };
      }
    } catch (e) {
      // Fallthrough to defaults
    }
  }
  return { ...DEFAULT_SETTINGS };
}

async function getResolvedConfig() {
  const dbSettings = await readSettings();
  return {
    ...dbSettings,
    adminPassword: process.env.ADMIN_PASSWORD || dbSettings.adminPassword || "ampsadmin",
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

async function saveSettings(settings: any) {
  try {
    const jsonStr = JSON.stringify(settings);
    try {
      await db.execute({
        sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('settings_json', ?)",
        args: [jsonStr]
      });
    } catch (e) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO settings (id, settings_json) VALUES (1, ?)",
        args: [jsonStr]
      });
    }
    return true;
  } catch (err) {
    console.error("[DB Save Settings Error]:", err);
    return false;
  }
}

// Authentication Middleware
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Missing token." });
  }

  try {
    const resSession = await db.execute({
      sql: "SELECT * FROM admin_sessions WHERE token = ?",
      args: [token]
    });
    const session = resSession.rows[0] as any;

    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized. Invalid session." });
    }

    const nowIso = new Date().toISOString();
    if (session.expires_at && String(session.expires_at) < nowIso) {
      await db.execute({ sql: "DELETE FROM admin_sessions WHERE token = ?", args: [token] });
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    req.adminUser = {
      username: String(session.username),
      role: String(session.role),
      impersonatedBy: session.impersonated_by ? String(session.impersonated_by) : null
    };

    req.admin = {
      username: req.adminUser.username,
      role: req.adminUser.role
    };

    next();
  } catch (err: any) {
    console.error("[Auth Middleware Error]:", err.message);
    res.status(500).json({ success: false, message: "Authentication database error." });
  }
}

function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.adminUser?.role !== "Superadmin") {
    return res.status(403).json({ success: false, message: "Superadmin access required." });
  }
  next();
}

interface LoginAttempt {
  failedCount: number;
  blockUntil: number;
}
const loginAttempts: Record<string, LoginAttempt> = {};

function rateLimitLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const attempt = loginAttempts[ip];

  if (attempt && attempt.blockUntil > now) {
    const timeLeft = Math.ceil((attempt.blockUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Please try again in ${timeLeft} minute(s).`
    });
  }

  next();
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { failedCount: 0, blockUntil: 0 };
  }
  const attempt = loginAttempts[ip];
  attempt.failedCount += 1;
  if (attempt.failedCount >= 5) {
    attempt.blockUntil = now + 15 * 60 * 1000;
    attempt.failedCount = 0;
  }
}

// Email Delivery Engine
async function sendInquiryEmail(inquiryData: { name: string; phone: string; email: string; message: string; context?: string }) {
  const config = await getResolvedConfig();
  const provider = config.emailProvider;
  const recipient = config.inquiryRecipient || "admin@example.com";
  const contextLabel = inquiryData.context === "counselling" ? "Stream Counselling Request" : "Admission Inquiry";

  console.log(`[Email Dispatch] Sending via '${provider}' to '${recipient}' for context '${contextLabel}'`);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">AMPS Portal - New ${contextLabel}</h2>
      <p><strong>Context:</strong> <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${contextLabel}</span></p>
      <p><strong>Name:</strong> ${inquiryData.name}</p>
      <p><strong>Phone:</strong> ${inquiryData.phone}</p>
      <p><strong>Email:</strong> ${inquiryData.email || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin: 0;">
        ${inquiryData.message || 'No additional details provided.'}
      </blockquote>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
      <p style="font-size: 11px; color: #64748b;">This inquiry was captured automatically by Ashish Memorial Public School Portal.</p>
    </div>
  `;

  if (provider === "web3forms" && config.web3formsKey) {
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: config.web3formsKey,
          subject: `[AMPS Portal] New ${contextLabel} from ${inquiryData.name}`,
          from_name: "AMPS School Portal",
          to: recipient,
          name: inquiryData.name,
          phone: inquiryData.phone,
          email: inquiryData.email,
          message: `${contextLabel}: ${inquiryData.message}`
        })
      });
      const data = await response.json();
      if (data.success) return { success: true, via: "Web3Forms API" };
      throw new Error(data.message || "Web3Forms API error");
    } catch (err: any) {
      return { success: false, via: "Web3Forms API", error: err.message };
    }
  }

  if (provider === "brevo" && config.brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": config.brevoApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          sender: {
            name: config.brevoSenderName || "AMPS Portal",
            email: config.brevoSenderEmail || recipient
          },
          to: [{ email: recipient }],
          subject: `[AMPS Portal] New ${contextLabel} from ${inquiryData.name}`,
          htmlContent: htmlBody
        })
      });
      if (response.ok) return { success: true, via: "Brevo Transactional API" };
      const errText = await response.text();
      throw new Error(`Brevo API status ${response.status}: ${errText}`);
    } catch (err: any) {
      return { success: false, via: "Brevo API", error: err.message };
    }
  }

  if (provider === "smtp" && config.smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort || "465", 10),
        secure: config.smtpPort === "465",
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        }
      });
      await transporter.sendMail({
        from: `"AMPS School Portal" <${config.smtpUser || recipient}>`,
        to: recipient,
        subject: `[AMPS Portal] New ${contextLabel} from ${inquiryData.name}`,
        html: htmlBody
      });
      return { success: true, via: "Nodemailer SMTP" };
    } catch (err: any) {
      return { success: false, via: "Nodemailer SMTP", error: err.message };
    }
  }

  // Fallback to FormSubmit tunnel
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: `[AMPS Portal] New ${contextLabel} from ${inquiryData.name}`,
        _template: "table",
        Name: inquiryData.name,
        Phone: inquiryData.phone,
        Email: inquiryData.email,
        Context: contextLabel,
        Message: inquiryData.message
      })
    });
    const data = await response.json();
    if (data.success === "true" || response.ok) return { success: true, via: "FormSubmit Tunnel" };
    throw new Error(data.message || "FormSubmit tunnel fallback failed");
  } catch (err: any) {
    return { success: false, via: "FormSubmit Tunnel", error: err.message };
  }
}

// Server Entry Point
async function startServer() {
  await initializeDatabase();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const bootConfig = await getResolvedConfig();
  console.log(`[Config] Server booted. Selected Email Provider: '${bootConfig.emailProvider}'`);

  app.use(express.json());

  // ─── PUBLIC INQUIRY API ──────────────────────────────────────────────────
  app.post("/api/inquiries", async (req, res) => {
    try {
      const { name, phone, email, message, context } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and phone number are required." });
      }

      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number." });
      }

      const id = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 4);
      const timestamp = new Date().toISOString();
      const inqContext = context === "counselling" ? "counselling" : "admission";

      const dispatchRes = await sendInquiryEmail({ name, phone, email: email || "", message: message || "", context: inqContext });

      await db.execute({
        sql: `INSERT INTO inquiries (
                id, name, phone, email, message, formContext, timestamp, isRead, status, dispatchStatus, dispatchedVia, dispatchError, deleted
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?, ?, 0)`,
        args: [
          id,
          name,
          phone,
          email || "",
          message || "",
          inqContext,
          timestamp,
          dispatchRes.success ? "Sent" : "Failed",
          dispatchRes.via,
          dispatchRes.error || null
        ]
      });

      res.status(201).json({
        success: true,
        message: "Inquiry submitted successfully!",
        inquiry: { id, name, phone, email, message, timestamp, formContext: inqContext, dispatchRes }
      });
    } catch (err: any) {
      console.error("[Inquiry Error]:", err.message);
      res.status(500).json({ success: false, message: "Failed to submit inquiry: " + err.message });
    }
  });

  // ─── ADMIN AUTHENTICATION APIs ───────────────────────────────────────────
  app.post("/api/admin/login", rateLimitLogin, async (req, res) => {
    const { username, password } = req.body;
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown").split(",")[0].trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
      const cleanUser = String(username).toLowerCase().trim();
      const resUser = await db.execute({
        sql: "SELECT * FROM admin_users WHERE LOWER(username) = ?",
        args: [cleanUser]
      });
      const user = resUser.rows[0] as any;

      if (!user) {
        recordFailedLogin(ip);
        await recordAuditLog("login_failed", cleanUser, "Unknown");
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }

      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, String(user.password_hash));
      } catch (e) {
        isMatch = false;
      }

      // Fallback 1: Plaintext match with stored plain_password
      if (!isMatch && user.plain_password && password === String(user.plain_password)) {
        isMatch = true;
        try {
          const newHash = await bcrypt.hash(password, 12);
          await db.execute({
            sql: "UPDATE admin_users SET password_hash = ? WHERE LOWER(username) = LOWER(?)",
            args: [newHash, cleanUser]
          });
        } catch (err) {
          console.error("[Hash Upgrade Error]:", err);
        }
      }

      // Fallback 2: Check default initial role passwords ONLY if account hasn't custom updated password
      if (!isMatch && (!user.plain_password || ["ampssuperadmin", "ampschairman", "ampsadmin", "ampsprincipal"].includes(String(user.plain_password)))) {
        const roleDefaults: Record<string, string[]> = {
          superadmin: [process.env.SUPERADMIN_PASSWORD || "ampssuperadmin", "ampssuperadmin", "ampsadmin"],
          chairman: [process.env.CHAIRMAN_PASSWORD || "ampschairman", "ampschairman", "ampsadmin"],
          administrator: [process.env.ADMIN_PASSWORD || "ampsadmin", "ampsadmin"],
          principal: [process.env.PRINCIPAL_PASSWORD || "ampsprincipal", "ampsprincipal", "ampsadmin"]
        };
        const validPasswords = roleDefaults[cleanUser] || ["ampsadmin"];
        if (validPasswords.includes(password)) {
          isMatch = true;
          try {
            const newHash = await bcrypt.hash(password, 12);
            await db.execute({
              sql: "UPDATE admin_users SET password_hash = ?, plain_password = ? WHERE LOWER(username) = LOWER(?)",
              args: [newHash, password, cleanUser]
            });
          } catch (err) {
            console.error("[Hash Upgrade Error]:", err);
          }
        }
      }

      if (!isMatch) {
        recordFailedLogin(ip);
        await recordAuditLog("login_failed", String(user.username), String(user.role));
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }

      if (loginAttempts[ip]) {
        delete loginAttempts[ip];
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      await db.execute({
        sql: "INSERT INTO admin_sessions (token, username, role, created_at, expires_at) VALUES (?, ?, ?, datetime('now'), ?)",
        args: [token, String(user.username), String(user.role), expiresAt]
      });

      await recordAuditLog("login_success", String(user.username), String(user.role));

      res.json({
        success: true,
        token,
        username: String(user.username),
        role: String(user.role)
      });
    } catch (err: any) {
      console.error("[Login Error]:", err.message);
      res.status(500).json({ success: false, message: `Server login error: ${err.message || "Unknown error"}` });
    }
  });

  app.post("/api/admin/logout", requireAdminAuth, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await db.execute({ sql: "DELETE FROM admin_sessions WHERE token = ?", args: [token] });
    }
    if (req.adminUser) {
      await recordAuditLog("logout", req.adminUser.username, req.adminUser.role);
    }
    res.json({ success: true, message: "Logged out successfully." });
  });

  // ─── INQUIRY MANAGEMENT APIs ─────────────────────────────────────────────
  app.post("/api/admin/inquiries", requireAdminAuth, async (req, res) => {
    try {
      const result = await db.execute("SELECT * FROM inquiries WHERE deleted = 0 ORDER BY timestamp DESC");
      const unreadCountRes = await db.execute("SELECT count(*) as count FROM inquiries WHERE deleted = 0 AND isRead = 0");
      const unreadCount = Number(unreadCountRes.rows[0]?.count || 0);

      res.json({ success: true, inquiries: result.rows, unreadCount });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/admin/inquiry/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.execute({ sql: "SELECT * FROM inquiries WHERE id = ?", args: [id] });
      const inq = existing.rows[0] as any;

      if (!inq) {
        return res.status(404).json({ success: false, message: "Inquiry not found." });
      }

      const nowIso = new Date().toISOString();
      const username = req.adminUser!.username;

      await db.execute({
        sql: "UPDATE inquiries SET deleted = 1, deleted_by = ?, deleted_at = ? WHERE id = ?",
        args: [username, nowIso, id]
      });

      await recordAuditLog("inquiry_deleted", username, req.adminUser!.role, id, JSON.stringify(inq));

      res.json({ success: true, message: "Inquiry moved to trash." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/clear-inquiries", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const username = req.adminUser!.username;
      const nowIso = new Date().toISOString();

      await db.execute({
        sql: "UPDATE inquiries SET deleted = 1, deleted_by = ?, deleted_at = ?",
        args: [username, nowIso]
      });

      await recordAuditLog("wipe_all", username, req.adminUser!.role);

      res.json({ success: true, message: "All inquiries cleared." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/update-status", requireAdminAuth, async (req, res) => {
    try {
      const { inquiryId, status } = req.body;
      if (!inquiryId || !status) {
        return res.status(400).json({ success: false, message: "Inquiry ID and status required." });
      }

      await db.execute({
        sql: "UPDATE inquiries SET status = ? WHERE id = ?",
        args: [status, inquiryId]
      });

      res.json({ success: true, message: "Status updated successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/mark-read", requireAdminAuth, async (req, res) => {
    try {
      const { inquiryId } = req.body;
      if (!inquiryId) {
        return res.status(400).json({ success: false, message: "Inquiry ID is required." });
      }

      await db.execute({
        sql: "UPDATE inquiries SET isRead = 1 WHERE id = ?",
        args: [inquiryId]
      });

      res.json({ success: true, message: "Inquiry marked as read." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── PASSWORD & USER MANAGEMENT APIs ────────────────────────────────────
  app.post("/api/admin/change-password", requireAdminAuth, async (req, res) => {
    try {
      const username = req.adminUser!.username;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Current password and new password are required." });
      }

      const cleanUser = String(username).toLowerCase().trim();
      const resUser = await db.execute({
        sql: "SELECT * FROM admin_users WHERE LOWER(username) = ?",
        args: [cleanUser]
      });
      const user = resUser.rows[0] as any;

      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(currentPassword, String(user.password_hash));
      } catch (e) {
        isMatch = false;
      }

      if (!isMatch && user.plain_password && currentPassword === String(user.plain_password)) {
        isMatch = true;
      }

      if (!isMatch) {
        const roleDefaults: Record<string, string[]> = {
          superadmin: [process.env.SUPERADMIN_PASSWORD || "ampssuperadmin", "ampssuperadmin", "ampsadmin"],
          chairman: [process.env.CHAIRMAN_PASSWORD || "ampschairman", "ampschairman", "ampsadmin"],
          administrator: [process.env.ADMIN_PASSWORD || "ampsadmin", "ampsadmin"],
          principal: [process.env.PRINCIPAL_PASSWORD || "ampsprincipal", "ampsprincipal", "ampsadmin"]
        };
        const validDefaults = roleDefaults[cleanUser] || ["ampsadmin"];
        if (validDefaults.includes(currentPassword)) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password is incorrect." });
      }

      const newHash = await bcrypt.hash(newPassword, 12);

      await db.execute({
        sql: "UPDATE admin_users SET password_hash = ?, plain_password = ? WHERE LOWER(username) = LOWER(?)",
        args: [newHash, newPassword, username.toLowerCase()]
      });

      await db.execute({
        sql: "INSERT INTO password_history (username, changed_at, changed_by) VALUES (?, ?, ?)",
        args: [cleanUser, new Date().toISOString(), cleanUser]
      });

      await recordAuditLog("password_changed", cleanUser, req.adminUser!.role);
      await updateCredentialsFile();

      res.json({ success: true, message: "Password updated successfully in database!" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/reset-password", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { targetUsername, newPassword } = req.body;
      if (!targetUsername || !newPassword) {
        return res.status(400).json({ success: false, message: "Target username and new password are required." });
      }

      const superadminUser = req.adminUser!.username;
      const cleanTarget = String(targetUsername).toLowerCase().trim();
      const newHash = await bcrypt.hash(newPassword, 12);

      await db.execute({
        sql: "UPDATE admin_users SET password_hash = ?, plain_password = ? WHERE LOWER(username) = ?",
        args: [newHash, newPassword, cleanTarget]
      });

      await db.execute({
        sql: "INSERT INTO password_history (username, changed_at, changed_by) VALUES (?, ?, ?)",
        args: [cleanTarget, new Date().toISOString(), superadminUser]
      });

      await recordAuditLog("password_reset", superadminUser, req.adminUser!.role, cleanTarget);
      await updateCredentialsFile();

      res.json({ success: true, message: `Password reset successfully for '${cleanTarget}'.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/admin/users", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const result = await db.execute("SELECT rowid as id, username, role, plain_password, created_at, created_by FROM admin_users ORDER BY rowid ASC");
      res.json({ success: true, users: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/admin/password-history", requireAdminAuth, async (req, res) => {
    try {
      const username = req.adminUser!.username;
      const role = req.adminUser!.role;
      let result;

      if (role === "Superadmin") {
        result = await db.execute("SELECT * FROM password_history ORDER BY id DESC LIMIT 50");
      } else {
        result = await db.execute({
          sql: "SELECT * FROM password_history WHERE LOWER(username) = LOWER(?) ORDER BY id DESC LIMIT 50",
          args: [username]
        });
      }

      res.json({ success: true, history: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/impersonate", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { targetUsername } = req.body;
      if (!targetUsername) {
        return res.status(400).json({ success: false, message: "Target username is required." });
      }

      const cleanTarget = String(targetUsername).toLowerCase().trim();
      const resUser = await db.execute({
        sql: "SELECT * FROM admin_users WHERE LOWER(username) = ?",
        args: [cleanTarget]
      });
      const targetUser = resUser.rows[0] as any;

      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Target admin user not found." });
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
      const superadminUser = req.adminUser!.username;

      await db.execute({
        sql: "INSERT INTO admin_sessions (token, username, role, created_at, expires_at, impersonated_by) VALUES (?, ?, ?, datetime('now'), ?, ?)",
        args: [token, targetUser.username, targetUser.role, expiresAt, superadminUser]
      });

      await recordAuditLog("impersonate_start", superadminUser, req.adminUser!.role, String(targetUser.username));

      res.json({
        success: true,
        token,
        username: String(targetUser.username),
        role: String(targetUser.role),
        impersonatedBy: superadminUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/exit-impersonation", requireAdminAuth, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let token = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (token) {
        await db.execute({ sql: "DELETE FROM admin_sessions WHERE token = ?", args: [token] });
      }

      const superadminUser = req.adminUser!.impersonatedBy || req.adminUser!.username;
      const newToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      await db.execute({
        sql: "INSERT INTO admin_sessions (token, username, role, created_at, expires_at) VALUES (?, ?, 'Superadmin', datetime('now'), ?)",
        args: [newToken, superadminUser, expiresAt]
      });

      await recordAuditLog("impersonate_exit", superadminUser, "Superadmin");

      res.json({
        success: true,
        token: newToken,
        username: superadminUser,
        role: "Superadmin"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── AUDIT LOG APIs ───────────────────────────────────────────────────────
  app.get("/api/admin/audit-log", requireAdminAuth, async (req, res) => {
    try {
      const userRole = req.adminUser!.role;
      let result;
      if (userRole === "Superadmin") {
        result = await db.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 100");
      } else {
        result = await db.execute({
          sql: "SELECT * FROM audit_log WHERE action IN ('inquiry_deleted', 'wipe_all', 'inquiry_restored') ORDER BY id DESC LIMIT 100",
          args: []
        });
      }
      res.json({ success: true, auditLog: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/audit-log/:id/revoke", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const resLog = await db.execute({ sql: "SELECT * FROM audit_log WHERE id = ?", args: [id] });
      const logItem = resLog.rows[0] as any;

      if (!logItem) {
        return res.status(404).json({ success: false, message: "Audit log entry not found." });
      }

      if (logItem.action !== "inquiry_deleted" || !logItem.target_id) {
        return res.status(400).json({ success: false, message: "Only deleted inquiry actions can be revoked." });
      }

      const superadminUser = req.adminUser!.username;
      const nowIso = new Date().toISOString();

      await db.execute({
        sql: "UPDATE inquiries SET deleted = 0, deleted_by = NULL, deleted_at = NULL WHERE id = ?",
        args: [logItem.target_id]
      });

      await db.execute({
        sql: "UPDATE audit_log SET revoked = 1, revoked_by = ?, revoked_at = ? WHERE id = ?",
        args: [superadminUser, nowIso, id]
      });

      await recordAuditLog("inquiry_restored", superadminUser, req.adminUser!.role, String(logItem.target_id));

      res.json({ success: true, message: "Inquiry restored successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/admin/audit-log/:id", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { target_data } = req.body;

      await db.execute({
        sql: "UPDATE audit_log SET target_data = ? WHERE id = ?",
        args: [target_data || "", id]
      });

      res.json({ success: true, message: "Audit log entry updated." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── SETTINGS APIs ────────────────────────────────────────────────────────
  app.get("/api/admin/settings", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const config = await getResolvedConfig();
      res.json({ success: true, settings: config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/settings", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { settings } = req.body;
      if (!settings) {
        return res.status(400).json({ success: false, message: "Settings payload required." });
      }

      const ok = await saveSettings(settings);
      if (ok) {
        await recordAuditLog("settings_updated", req.adminUser!.username, req.adminUser!.role);
        res.json({ success: true, message: "Settings saved successfully!" });
      } else {
        res.status(500).json({ success: false, message: "Failed to save settings." });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/test-email", requireAdminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const testResult = await sendInquiryEmail({
        name: "Test Administrator",
        phone: "9999999999",
        email: "test@example.com",
        message: "This is a test notification email triggered from the AMPS Admin Console.",
        context: "admission"
      });

      if (testResult.success) {
        res.json({ success: true, message: `Test email dispatched successfully via ${testResult.via}!` });
      } else {
        res.status(500).json({ success: false, message: `Test email failed via ${testResult.via}: ${testResult.error}` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── VITE OR STATIC CLIENT SERVING ────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "public")));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "public")));
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] AMPS School Portal running on http://localhost:${PORT}`);
  });
}

startServer();
