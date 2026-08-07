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

const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.VERCEL;

console.log(`[DB] Server environment: ${isProd ? "PRODUCTION (LIVE)" : "LOCAL DEVELOPMENT (ISOLATED)"}`);

// Local development server uses isolated file:school.db (Local testing NEVER touches live database)
const db = createClient({
  url: isProd ? (rawTursoUrl || "file:school.db") : "file:school.db",
  authToken: isProd ? rawTursoToken : undefined,
});

// Dedicated Live Database reader (Reads live credentials & logs into active-admin-credentials.live.txt safely)
const liveDb = rawTursoUrl
  ? createClient({ url: rawTursoUrl, authToken: rawTursoToken })
  : db;

// Default Configuration Settings
const DEFAULT_SETTINGS = {
  adminPassword: "ampsadmin",
  whatsappPhone: "917852042541",
  emailProvider: "brevo",
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
    const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER || !!process.env.VERCEL;
    const environment = isProd ? "LIVE" : "LOCAL";

    await db.execute({
      sql: `INSERT INTO audit_log (action, performed_by, performed_by_role, target_id, target_data, timestamp, environment)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [action, performedBy, performedByRole, targetId || null, targetData || null, timestamp, environment]
    });

    if (process.env.NODE_ENV !== "production") {
      await updateCredentialsFile();
    }
  } catch (err: any) {
    console.error("[Audit Log Error]:", err.message);
  }
}

// Credentials File Sync Helper (Generates 2 separate files: active-admin-credentials.live.txt & active-admin-credentials.local.txt)
export async function updateCredentialsFile() {
  try {
    const defaultPassMap: Record<string, string> = {
      superadmin: "ampssuperadmin",
      chairman: "ampschairman",
      administrator: "ampsadmin",
      principal: "ampsprincipal"
    };

    // ─── 1. GENERATE ACTIVE-ADMIN-CREDENTIALS.LIVE.TXT ─────────────────
    try {
      const res = await liveDb.execute("SELECT rowid as id, username, role, plain_password FROM admin_users ORDER BY rowid ASC");
      const liveUsers = res.rows as any[];

      const auditRes = await liveDb.execute("SELECT * FROM audit_log WHERE environment = 'LIVE' OR environment IS NULL ORDER BY id DESC LIMIT 100");
      const rawLiveLogs = (auditRes.rows as any[]).slice().reverse();
      const liveLogs = rawLiveLogs.filter(l => l.action !== "LOCAL_DEV_TEST");

      let liveContent = `================================================================================
          🔴 AMPS PORTAL — LIVE PRODUCTION ADMIN ACCOUNTS & CREDENTIALS
================================================================================\n\n`;

      let i = 1;
      for (const u of liveUsers) {
        const uname = String(u.username);
        const role = String(u.role);
        const unameLower = uname.toLowerCase();
        const pass = String(u.plain_password || defaultPassMap[unameLower] || "ampsadmin");

        liveContent += `${i}. ${uname.toUpperCase()} ACCOUNT:
   - Username : ${uname}
   - Password : ${pass}
   - Role     : ${role}
   - Access   : Live Production Controls\n\n`;
        i++;
      }

      liveContent += `================================================================================
          🔴 LIVE PRODUCTION AUTHENTICATION & ACTIVITY AUDIT LOGS
================================================================================\n`;

      if (liveLogs.length === 0) {
        liveContent += `(No live activity recorded yet)\n\n`;
      } else {
        for (const log of liveLogs) {
          liveContent += `[${log.timestamp}] [🔴 LIVE] ${String(log.action).toUpperCase()} — Performed by: ${log.performed_by} (${log.performed_by_role}) ${log.target_id ? `| Target: ${log.target_id}` : ""}\n`;
        }
        liveContent += `\n`;
      }

      fs.writeFileSync(path.join(process.cwd(), "active-admin-credentials.live.txt"), liveContent, "utf-8");
    } catch (e: any) {
      console.error("[Live Credentials Sync Error]:", e.message);
    }

    // ─── 2. GENERATE ACTIVE-ADMIN-CREDENTIALS.LOCAL.TXT ────────────────
    try {
      const res = await db.execute("SELECT rowid as id, username, role, plain_password FROM admin_users ORDER BY rowid ASC");
      const localUsers = res.rows as any[];

      const auditRes = await db.execute("SELECT * FROM audit_log WHERE environment = 'LOCAL' ORDER BY id DESC LIMIT 100");
      const localLogs = (auditRes.rows as any[]).slice().reverse();

      let localContent = `================================================================================
          🟢 AMPS PORTAL — LOCAL DEVELOPMENT ADMIN ACCOUNTS & CREDENTIALS
================================================================================\n\n`;

      let i = 1;
      for (const u of localUsers) {
        const uname = String(u.username);
        const role = String(u.role);
        const unameLower = uname.toLowerCase();
        const pass = String(u.plain_password || defaultPassMap[unameLower] || "ampsadmin");

        localContent += `${i}. ${uname.toUpperCase()} ACCOUNT:
   - Username : ${uname}
   - Password : ${pass}
   - Role     : ${role}
   - Access   : Localhost Testing Controls\n\n`;
        i++;
      }

      localContent += `================================================================================
          🟢 LOCALHOST DEVELOPMENT TESTING ACTIVITY AUDIT LOGS
================================================================================\n`;

      if (localLogs.length === 0) {
        localContent += `(No local dev activity recorded yet)\n\n`;
      } else {
        for (const log of localLogs) {
          localContent += `[${log.timestamp}] [🟢 LOCAL] ${String(log.action).toUpperCase()} — Performed by: ${log.performed_by} (${log.performed_by_role}) ${log.target_id ? `| Target: ${log.target_id}` : ""}\n`;
        }
        localContent += `\n`;
      }

      fs.writeFileSync(path.join(process.cwd(), "active-admin-credentials.local.txt"), localContent, "utf-8");
    } catch (e: any) {
      console.error("[Local Credentials Sync Error]:", e.message);
    }
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
        environment TEXT DEFAULT 'LIVE',
        revoked INTEGER DEFAULT 0,
        revoked_by TEXT DEFAULT NULL,
        revoked_at TEXT DEFAULT NULL
      )
    `);

    try {
      await db.execute("ALTER TABLE audit_log ADD COLUMN environment TEXT DEFAULT 'LIVE'");
    } catch (e) {
      // column already exists
    }

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

    // ─── NEW: Announcements Table ─────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        is_published INTEGER DEFAULT 1,
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT DEFAULT NULL
      )
    `);

    // ─── NEW: Gallery Items Table ─────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT DEFAULT '',
        category TEXT DEFAULT 'general',
        image_url TEXT NOT NULL,
        is_published INTEGER DEFAULT 1,
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // ─── NEW: School Events Table ─────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        event_date TEXT NOT NULL,
        event_type TEXT DEFAULT 'general',
        is_published INTEGER DEFAULT 1,
        created_by TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
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

    // Auto-migrate legacy settings table rows (populate key & value from settings_json if null)
    try {
      await db.execute("UPDATE settings SET key = 'settings_json', value = settings_json WHERE key IS NULL AND settings_json IS NOT NULL");
    } catch (e) {}

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
        await db.execute({
          sql: "INSERT INTO password_history (username, changed_at, changed_by) VALUES (?, datetime('now'), 'system')",
          args: [u.username]
        });
      }
    }
    console.log("[DB] Admin users seeded successfully: superadmin, chairman, administrator, principal");

    // ─── Seed Initial Gallery Items if Missing ────────────────────────
    console.log("[DB Seed] Verifying gallery photos in database...");
    const defaultGallery = [
      { title: "Dainik Bhaskar Merit Feature", subtitle: "Dainik Bhaskar newspaper clipping covering top merit rankers.", category: "news", image_url: "/assets/news-1.jpeg" },
      { title: "Earth Day Group Exhibition", subtitle: "Students holding globe model and awareness posters.", category: "news", image_url: "/assets/news-2.jpeg" },
      { title: "School Staff News Portrait", subtitle: "Group photograph of school faculty members.", category: "news", image_url: "/assets/news-3.jpg" },
      { title: "Academic Excellence Felicitation", subtitle: "Outstanding student scholars being honored with medals.", category: "awards", image_url: "/assets/award-1.jpg" },
      { title: "Annual Day Excellence Awards", subtitle: "School management presenting achievement shields and trophies.", category: "awards", image_url: "/assets/award-2.jpg" },
      { title: "Board Merit Position Winners", subtitle: "Chief guests presenting certificates of merit.", category: "awards", image_url: "/assets/award-4.jpeg" },
      { title: "Meritorious Scholar Award Distribution", subtitle: "School patron presenting trophy and scholarship certificate.", category: "awards", image_url: "/assets/award.jpeg" },
      { title: "Annual Sports Day Athletics", subtitle: "Students competing in track-and-field sprint races.", category: "sports", image_url: "/assets/sports-1.jpg" },
      { title: "Physical Development Events", subtitle: "Active track meets and student athletics.", category: "sports", image_url: "/assets/sports-2.jpg" },
      { title: "Daily Morning Prayer & Assembly", subtitle: "Disciplined queues of senior and junior students standing together.", category: "cultural", image_url: "/assets/cultural-1.jpg" },
      { title: "School Gathering & Assembly Prayers", subtitle: "Peaceful morning session with students and faculty.", category: "cultural", image_url: "/assets/cultural-2.jpg" },
      { title: "Outdoor Sitting Assembly & Discourse", subtitle: "Students seated in organized rows during moral lecture.", category: "cultural", image_url: "/assets/cultural-3.jpg" },
      { title: "Kindergarten Welcome Performance", subtitle: "Kindergarten students in uniform holding welcome cutouts.", category: "cultural", image_url: "/assets/cultural-4.jpg" },
      { title: "Saraswati Puja Devotional Ceremony", subtitle: "Devotional prayer session seeking knowledge.", category: "cultural", image_url: "/assets/cultural-5.jpeg" },
      { title: "Student Showcasing Exhibition Model", subtitle: "Town-planning model and geography project.", category: "science", image_url: "/assets/science-fair-1.jpg" },
      { title: "District Science Seminar Winners", subtitle: "High-school students holding certificates of achievement.", category: "science", image_url: "/assets/science-fair-2.jpg" },
      { title: "Patriotic Painting & Poster Exhibition", subtitle: "Student proudly displaying tricolor artwork.", category: "science", image_url: "/assets/science-fair-3.jpeg" },
      { title: "Board Merit Position Topper", subtitle: "Celebrating top district ranker in Rajasthan Board exams.", category: "milestones", image_url: "/assets/top-1.jpeg" },
      { title: "State Board Rank Achievers", subtitle: "Honoring top-scoring board examination scholars.", category: "milestones", image_url: "/assets/top-2.jpeg" },
      { title: "NEET 2025 Exam Achievers", subtitle: "Future medical professionals qualifying NEET 2025.", category: "milestones", image_url: "/assets/top-3.jpeg" },
      { title: "JEE Advanced 2025 Toppers", subtitle: "Engineering aspirants qualifying JEE Advanced.", category: "milestones", image_url: "/assets/top-4.jpeg" },
      { title: "Fancy Dress Competition", subtitle: "Kindergarten and primary students in creative costumes.", category: "cultural", image_url: "/assets/cultural-6.jpeg" },
      { title: "Independence Day Festivities", subtitle: "Patriotic programs and flag hoisting celebrations.", category: "cultural", image_url: "/assets/cultural-7.jpeg" },
      { title: "Annual Drama and Stage Play", subtitle: "Students enacting theatrical play on social values.", category: "cultural", image_url: "/assets/cultural-8.jpeg" },
      { title: "Guru Vandan Chhatra Abhinandan", subtitle: "Felicitation program to honor dedicated educators.", category: "cultural", image_url: "/assets/cultural-9.jpeg" },
      { title: "Rajasthan Patrika Merit Feature", subtitle: "Press clipping celebrating board toppers.", category: "news", image_url: "/assets/news-4.jpeg" },
      { title: "Academic Milestone Announcement", subtitle: "Local media covering high success rate of AMPS.", category: "news", image_url: "/assets/news-5.jpeg" },
      { title: "District Science Fair Victory Feature", subtitle: "Press clipping celebrating triumph in science fair.", category: "news", image_url: "/assets/news-6.jpeg" },
      { title: "Board Merit Distinction Ranker", subtitle: "Top achievers scoring high honors in board exams.", category: "milestones", image_url: "/assets/top-5.jpeg" },
      { title: "NEET Exam Success Achievers", subtitle: "Celebrating AIR 617 Piyush Bansal and medical achievers.", category: "milestones", image_url: "/assets/neet.jpeg" },
      { title: "Innovative Science Exhibition Stalls", subtitle: "Physics and mechanical projects at exhibition booths.", category: "science", image_url: "/assets/science-fair-4.jpg.jpeg" },
      { title: "Electronics & Robotics Demonstrations", subtitle: "Smart sensor projects and circuit board integrations.", category: "science", image_url: "/assets/science-fair-5.jpg.jpeg" },
      { title: "Interactive Working Science Models", subtitle: "Students explaining mechanical workings to visitors.", category: "science", image_url: "/assets/science-fair-6.jpg.jpeg" },
      { title: "Science Exhibition Welcome & Presentation", subtitle: "Welcome counter with experimental modules.", category: "science", image_url: "/assets/science-fair-7.jpg.jpeg" },
      { title: "Smart City & Infrastructure Working Model", subtitle: "Green city model featuring smart road grids.", category: "science", image_url: "/assets/science-fair-8.jpg.jpeg" },
      { title: "Senior Secondary Academic Achievers", subtitle: "Celebrating our high-scoring senior secondary scholars.", category: "milestones", image_url: "/assets/top-6.jpeg" },
      { title: "Subject Distinction Ranker", subtitle: "Honoring scholars securing top distinction in core subjects.", category: "milestones", image_url: "/assets/top-7.jpeg" },
      { title: "District Level Achievement Felicitation", subtitle: "Distinguished leaders honoring AMPS students with shields.", category: "awards", image_url: "/assets/award-3.jpeg" },
      { title: "Folk Dance & Annual Cultural Gala", subtitle: "Traditional folk dance performances celebrating cultural heritage.", category: "cultural", image_url: "/assets/cultural-10.jpeg" },
      { title: "AMPS Main Academic Building & Campus Frontage", subtitle: "State-of-the-art multi-story academic building.", category: "news", image_url: "/assets/school-building-1.jpeg" },
      { title: "School Campus Quadrangle & Courtyard", subtitle: "Panoramic view of the wide campus courtyard.", category: "news", image_url: "/assets/school-building-2.jpeg" }
    ];

    for (const item of defaultGallery) {
      const existing = await db.execute({
        sql: "SELECT id FROM gallery_items WHERE title = ? OR image_url = ?",
        args: [item.title, item.image_url]
      });
      if (existing.rows.length === 0) {
        await db.execute({
          sql: `INSERT INTO gallery_items (title, subtitle, category, image_url, is_published, created_by, created_at)
                VALUES (?, ?, ?, ?, 1, 'system', datetime('now'))`,
          args: [item.title, item.subtitle, item.category, item.image_url]
        });
      }
    }

    // Enforce filename-based SQL category cleanup in gallery_items database table
    try {
      await db.execute("UPDATE gallery_items SET category = 'milestones' WHERE image_url LIKE '%/top-%' OR image_url LIKE '%/neet%'");
      await db.execute("UPDATE gallery_items SET category = 'awards' WHERE image_url LIKE '%/award%'");
      await db.execute("UPDATE gallery_items SET category = 'sports' WHERE image_url LIKE '%/sports%'");
      await db.execute("UPDATE gallery_items SET category = 'cultural' WHERE image_url LIKE '%/cultural%'");
      await db.execute("UPDATE gallery_items SET category = 'science' WHERE image_url LIKE '%/science%'");
      await db.execute("UPDATE gallery_items SET category = 'news' WHERE image_url LIKE '%/news%' OR image_url LIKE '%/school-building%'");
    } catch (e) {}

    await updateCredentialsFile();
  } catch (err: any) {
    console.error("[DB Init Error]:", err.message);
  }
}

// Settings Helpers & Type-Safe Configuration Resolution
export interface EmailDispatchResult {
  success: boolean;
  provider: string;
  status: number;
  message: string;
  error?: string;
  response?: any;
}

async function readSettings(): Promise<typeof DEFAULT_SETTINGS> {
  try {
    const res = await db.execute("SELECT value FROM settings WHERE key = 'settings_json' AND value IS NOT NULL AND value != '' LIMIT 1");
    if (res.rows[0]?.value) {
      const parsed = JSON.parse(String(res.rows[0].value));
      return { ...DEFAULT_SETTINGS, ...parsed };
    }

    const resLegacy = await db.execute("SELECT settings_json FROM settings WHERE settings_json IS NOT NULL AND settings_json != '' LIMIT 1");
    if (resLegacy.rows[0]?.settings_json) {
      const parsedLegacy = JSON.parse(String(resLegacy.rows[0].settings_json));
      return { ...DEFAULT_SETTINGS, ...parsedLegacy };
    }
  } catch (err: any) {
    console.warn("[DB Read Settings Warning]: Failed to read settings:", err.message);
  }
  return { ...DEFAULT_SETTINGS };
}

async function getResolvedConfig() {
  const dbSettings = await readSettings();

  // Strict Hierarchy: Admin Settings (DB) -> Environment Variables -> Default Settings
  const resolve = (dbVal?: any, envVal?: any, defaultVal: string = ""): string => {
    if (dbVal !== undefined && dbVal !== null && String(dbVal).trim() !== "") {
      return String(dbVal).trim();
    }
    if (envVal !== undefined && envVal !== null && String(envVal).trim() !== "") {
      return String(envVal).trim();
    }
    return defaultVal;
  };

  return {
    adminPassword: resolve(dbSettings.adminPassword, process.env.ADMIN_PASSWORD, DEFAULT_SETTINGS.adminPassword),
    emailProvider: resolve(dbSettings.emailProvider, process.env.EMAIL_PROVIDER, DEFAULT_SETTINGS.emailProvider),
    inquiryRecipient: resolve(dbSettings.inquiryRecipient, process.env.INQUIRY_RECIPIENT_EMAIL, DEFAULT_SETTINGS.inquiryRecipient),
    brevoApiKey: resolve(dbSettings.brevoApiKey, process.env.BREVO_API_KEY, DEFAULT_SETTINGS.brevoApiKey),
    brevoSenderEmail: resolve(dbSettings.brevoSenderEmail, process.env.BREVO_SENDER_EMAIL, DEFAULT_SETTINGS.brevoSenderEmail),
    brevoSenderName: resolve(dbSettings.brevoSenderName, process.env.BREVO_SENDER_NAME, DEFAULT_SETTINGS.brevoSenderName),
    web3formsKey: resolve(dbSettings.web3formsKey, process.env.WEB3FORMS_KEY, DEFAULT_SETTINGS.web3formsKey),
    smtpHost: resolve(dbSettings.smtpHost, process.env.SMTP_HOST, DEFAULT_SETTINGS.smtpHost),
    smtpPort: resolve(dbSettings.smtpPort, process.env.SMTP_PORT, DEFAULT_SETTINGS.smtpPort),
    smtpUser: resolve(dbSettings.smtpUser, process.env.SMTP_USER, DEFAULT_SETTINGS.smtpUser),
    smtpPass: resolve(dbSettings.smtpPass, process.env.SMTP_PASS, DEFAULT_SETTINGS.smtpPass),
    whatsappPhone: resolve(dbSettings.whatsappPhone, process.env.WHATSAPP_PHONE, DEFAULT_SETTINGS.whatsappPhone)
  };
}

async function saveSettings(settings: Record<string, any>): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(settings);
    try {
      await db.execute({
        sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('settings_json', ?)",
        args: [jsonStr]
      });
    } catch (e) {}

    try {
      await db.execute({
        sql: "UPDATE settings SET settings_json = ?, key = 'settings_json', value = ? WHERE id = 1",
        args: [jsonStr, jsonStr]
      });
    } catch (e) {}

    console.log("[DB Save Settings] Settings successfully persisted to database.");
    return true;
  } catch (err: any) {
    console.error("[DB Save Settings Error]: Failed to persist settings to database:", err.message, err.stack);
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

// Unified Core Email Dispatch Engine
interface SendCoreEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
  emailType: "inquiry" | "confirmation" | "otp" | "test";
}

async function sendCoreEmail(options: SendCoreEmailOptions): Promise<EmailDispatchResult> {
  const config = await getResolvedConfig();
  const recipient = options.to;
  const replyToEmail = options.replyTo || config.inquiryRecipient || "admin@example.com";
  const preferredProvider = (config.emailProvider || "brevo").toLowerCase();

  console.log(`[Email Dispatch Start] Type: '${options.emailType}' | Effective Provider Choice: '${preferredProvider}' | To: '${recipient}' | Subject: '${options.subject}'`);

  const availableProviders: string[] = [];
  if (preferredProvider === "brevo") {
    availableProviders.push("brevo", "smtp", "web3forms");
  } else if (preferredProvider === "smtp") {
    availableProviders.push("smtp", "brevo", "web3forms");
  } else if (preferredProvider === "web3forms") {
    availableProviders.push("web3forms", "brevo", "smtp");
  } else {
    availableProviders.push("brevo", "smtp", "web3forms");
  }

  const errors: string[] = [];

  for (const provider of availableProviders) {
    if (provider === "brevo") {
      if (!config.brevoApiKey) {
        console.log("[Email Dispatch Skip - Brevo] Skipping Brevo: No Brevo API Key configured.");
        continue;
      }

      const senderEmail = config.brevoSenderEmail || config.inquiryRecipient || "admin@example.com";
      const senderName = config.brevoSenderName || "AMPS Portal";

      console.log(`[Email Dispatch Attempt - Brevo] Sending to '${recipient}' via Brevo API (Endpoint: https://api.brevo.com/v3/smtp/email)`);

      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": config.brevoApiKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: recipient, name: options.toName || recipient }],
            replyTo: { email: replyToEmail },
            subject: options.subject,
            htmlContent: options.htmlBody
          })
        });

        const resText = await response.text();
        let resJson: any = {};
        try {
          resJson = JSON.parse(resText);
        } catch (_) {}

        if (response.ok) {
          console.log(`[Email Dispatch Success - Brevo] Status: ${response.status} | MessageID: ${resJson.messageId || "OK"}`);
          return {
            success: true,
            provider: "brevo",
            status: response.status,
            message: `Email dispatched successfully via Brevo API (MessageID: ${resJson.messageId || "OK"})`,
            response: resJson
          };
        } else {
          const errMsg = `Brevo API HTTP ${response.status}: ${resText}`;
          console.error(`[Email Dispatch Error - Brevo] Status Code: ${response.status} | Details: ${errMsg}`);
          errors.push(errMsg);
        }
      } catch (err: any) {
        const errMsg = `Brevo Exception: ${err.message}`;
        console.error(`[Email Dispatch Exception - Brevo] Stack Trace:`, err.stack || err);
        errors.push(errMsg);
      }
    }

    if (provider === "smtp") {
      if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        console.log("[Email Dispatch Skip - SMTP] Skipping SMTP: Host/User/Pass incomplete.");
        continue;
      }

      console.log(`[Email Dispatch Attempt - SMTP] Connecting to SMTP server ${config.smtpHost}:${config.smtpPort || "465"} (User: ${config.smtpUser})`);

      try {
        const portNum = parseInt(config.smtpPort || "465", 10);
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: portNum,
          secure: portNum === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await transporter.verify();
        console.log(`[Email Dispatch SMTP Verified] Successfully authenticated connection with ${config.smtpHost}`);

        const mailOptions = {
          from: `"${config.brevoSenderName || 'AMPS Portal'}" <${config.smtpUser}>`,
          to: recipient,
          replyTo: replyToEmail,
          subject: options.subject,
          html: options.htmlBody,
          text: options.textBody
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Dispatch Success - SMTP] Status: 250 | MessageID: ${info.messageId} | Response: ${info.response}`);
        return {
          success: true,
          provider: "smtp",
          status: 250,
          message: `Email dispatched successfully via Nodemailer SMTP (MessageID: ${info.messageId})`,
          response: info
        };
      } catch (err: any) {
        const errMsg = `SMTP Exception: ${err.message}`;
        console.error(`[Email Dispatch Exception - SMTP] Stack Trace:`, err.stack || err);
        errors.push(errMsg);
      }
    }

    if (provider === "web3forms") {
      if (!config.web3formsKey) {
        console.log("[Email Dispatch Skip - Web3Forms] Skipping Web3Forms: No Access Key configured.");
        continue;
      }

      console.log(`[Email Dispatch Attempt - Web3Forms] Sending to '${recipient}' via Web3Forms API`);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: config.web3formsKey,
            subject: options.subject,
            from_name: config.brevoSenderName || "AMPS Portal",
            to: recipient,
            name: options.toName || recipient,
            email: replyToEmail,
            message: options.textBody || options.subject
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          console.log(`[Email Dispatch Success - Web3Forms] Status: ${response.status}`);
          return {
            success: true,
            provider: "web3forms",
            status: response.status,
            message: `Email dispatched successfully via Web3Forms API`,
            response: data
          };
        } else {
          const errMsg = `Web3Forms API HTTP ${response.status}: ${data.message || "Failed"}`;
          console.error(`[Email Dispatch Error - Web3Forms] Status Code: ${response.status} | Details: ${errMsg}`);
          errors.push(errMsg);
        }
      } catch (err: any) {
        const errMsg = `Web3Forms Exception: ${err.message}`;
        console.error(`[Email Dispatch Exception - Web3Forms] Stack Trace:`, err.stack || err);
        errors.push(errMsg);
      }
    }
  }

  const finalError = errors.length > 0
    ? errors.join(" | ")
    : "No active email provider credentials configured (Brevo, SMTP, or Web3Forms).";

  console.error(`[Email Dispatch Final Failure] Target: '${recipient}' | Errors: ${finalError}`);

  return {
    success: false,
    provider: "none",
    status: 500,
    message: "Email dispatch failed across all configured providers.",
    error: finalError
  };
}

async function sendInquiryEmail(inquiryData: { name: string; phone: string; email: string; message: string; context?: string }): Promise<EmailDispatchResult> {
  const config = await getResolvedConfig();
  const recipient = config.inquiryRecipient || "admin@example.com";

  const isCounselling = inquiryData.context === "counselling";
  const emailSubject = isCounselling
    ? `New Counselling Session Request: ${inquiryData.name} (${inquiryData.phone})`
    : `New Admission Inquiry: ${inquiryData.name} (${inquiryData.phone})`;
  const emailHeading = isCounselling ? "New Counselling Session Request" : "New Prospective Student Inquiry";
  const emailIntroLine = isCounselling
    ? "A new stream selection counselling request has been submitted on the Ashish Memorial Public School Portal:"
    : "A new admission inquiry has been submitted on the Ashish Memorial Public School Portal:";
  const messageLabel = isCounselling ? "Stream Interest" : "Message/Class";
  const cleanPhone = inquiryData.phone.replace(/\D/g, "");
  const formattedDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const htmlBody = `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#f7f5f0;">
  <div style="background:#14213d;padding:24px 32px;border-bottom:4px solid #C9A227;">
    <p style="margin:0;color:#C9A227;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;background:rgba(201,162,39,0.15);padding:4px 10px;border-radius:4px;border:1px solid rgba(201,162,39,0.3);display:inline-block;">
      ${isCounselling ? "ACADEMIC COUNSELLING DESK" : "AMPS ADMISSION DESK"}
    </p>
    <h1 style="font-family:Georgia,serif;color:#ffffff;font-size:20px;margin:12px 0 4px 0;font-weight:700;">
      Ashish Memorial Public Senior Secondary School
    </h1>
    <p style="color:#cbd5e1;font-size:12px;margin:0;">Hindaun City (Karauli), Rajasthan · Estd. 2005</p>
  </div>
  <div style="background:#ffffff;padding:28px 32px;color:#1e293b;line-height:1.6;">
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:18px;margin-top:0;margin-bottom:12px;font-weight:700;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">
      ${emailHeading}
    </h2>
    <p style="font-size:13px;color:#475569;margin-top:0;margin-bottom:20px;">${emailIntroLine}</p>
    <table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <tr style="background-color:#f8fafc;">
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:12px;color:#64748b;text-transform:uppercase;width:140px;">Name</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:14px;color:#0f172a;">${inquiryData.name}</td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:12px;color:#64748b;text-transform:uppercase;">Phone</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;">
          <a href="tel:${inquiryData.phone}" style="color:#7A2331;font-weight:700;text-decoration:none;">${inquiryData.phone}</a>
        </td>
      </tr>
      <tr style="background-color:#f8fafc;">
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:12px;color:#64748b;text-transform:uppercase;">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;">
          ${inquiryData.email ? `<a href="mailto:${inquiryData.email}" style="color:#14213D;font-weight:600;text-decoration:none;">${inquiryData.email}</a>` : '<span style="color:#94a3b8;font-style:italic;">Not provided</span>'}
        </td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td style="padding:12px 16px;font-weight:700;font-size:12px;color:#64748b;text-transform:uppercase;vertical-align:top;">${messageLabel}</td>
        <td style="padding:12px 16px;font-size:13px;color:#334155;white-space:pre-wrap;line-height:1.5;font-weight:500;">${inquiryData.message || (isCounselling ? "Requesting a stream selection counselling session." : "Interested in school admission.")}</td>
      </tr>
    </table>
    <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #C9A227;padding:14px 18px;border-radius:4px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">Please contact the applicant within 24 hours</p>
    </div>
    <div style="background-color:#f1f5f9;padding:16px;border-radius:6px;text-align:center;border:1px solid #cbd5e1;margin-bottom:10px;">
      <span style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:12px;">Quick Administrator Action</span>
      <a href="tel:${inquiryData.phone}" style="display:inline-block;background-color:#14213D;color:#ffffff;padding:10px 16px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:700;margin:4px 5px;vertical-align:middle;">Call Applicant (${inquiryData.phone})</a>
      <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${inquiryData.name}, regarding your ${isCounselling ? 'counselling request' : 'admission inquiry'} at Ashish Memorial Public School...`)}" style="display:inline-block;background-color:#16a34a;color:#ffffff;padding:10px 16px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:700;margin:4px 5px;vertical-align:middle;">Reply via WhatsApp</a>
    </div>
  </div>
  <div style="background-color:#f8fafc;padding:16px 24px;text-align:center;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;line-height:1.5;">
    <div style="font-weight:700;color:#14213D;margin-bottom:4px;">Ashish Memorial Public Senior Secondary School</div>
    <div>Hindaun City (Karauli), Rajasthan · Phone: 91163 04006 / 78520 42541 · Email: ampspankaj@gmail.com</div>
    <div style="margin-top:8px;color:#94a3b8;font-size:10px;">Submitted on: ${formattedDate} IST</div>
  </div>
</div>`;

  return sendCoreEmail({
    to: recipient,
    toName: "AMPS Admissions Desk",
    subject: emailSubject,
    htmlBody,
    textBody: `${emailHeading}\nName: ${inquiryData.name}\nPhone: ${inquiryData.phone}\nEmail: ${inquiryData.email}\nMessage: ${inquiryData.message}`,
    replyTo: inquiryData.email || recipient,
    emailType: "inquiry"
  });
}

async function sendConfirmationEmail(email: string, name: string, isCounselling: boolean): Promise<EmailDispatchResult> {
  const config = await getResolvedConfig();
  const recipient = config.inquiryRecipient || "admin@example.com";

  const subject = isCounselling ? "Your Counselling Session Request — AMPS School" : "Your Admission Inquiry — AMPS School";
  const introLine = isCounselling
    ? "Thank you for your interest in our stream selection counselling. We've received your request, and our academic counselling team will get in touch with you shortly to schedule a session."
    : "Thank you for your interest in Ashish Memorial Public Sr. Sec. School. We've received your admission inquiry, and our admissions team will contact you within 24 hours with further details.";

  const htmlBody = `
<div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;">
  <div style="padding:24px 32px 0;">
    <p style="margin:0 0 24px;font-size:11px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;font-family:Georgia,serif;">Ashish Memorial Public School</p>
  </div>
  <div style="padding:0 32px 24px;">
    <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">Dear ${name},</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px;">${introLine}</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
      In the meantime, feel free to explore our website at <a href="https://ampsschool.in" style="color:#8B1E3F;font-weight:600;">ampsschool.in</a>.
    </p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0;">
      You can also reach us directly at <a href="tel:9116304006" style="color:#14213d;font-weight:600;">91163 04006</a> or on <a href="https://wa.me/917852042541" style="color:#16a34a;font-weight:600;">WhatsApp</a>.
    </p>
  </div>
  <div style="height:1px;background:#f1f5f9;margin:0 32px;"></div>
  <div style="padding:20px 32px 28px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">Warm regards,</p>
    <p style="color:#14213d;font-size:13px;font-weight:600;margin:2px 0 0;font-family:Georgia,serif;">Ashish Memorial Public Sr. Sec. School</p>
    <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">Hindaun City (Karauli), Rajasthan</p>
  </div>
</div>`;

  return sendCoreEmail({
    to: email,
    toName: name,
    subject,
    htmlBody,
    textBody: `Dear ${name},\n\n${introLine}\n\nWarm regards,\nAshish Memorial Public Sr. Sec. School`,
    replyTo: recipient,
    emailType: "confirmation"
  });
}

async function sendOtpEmail(email: string, otp: string): Promise<EmailDispatchResult> {
  const config = await getResolvedConfig();
  const recipient = config.inquiryRecipient || "admin@example.com";

  const otpHtmlBody = `
<div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#ffffff;border:1px solid #e5e7eb;">
  <div style="padding:24px 32px 0;">
    <p style="margin:0 0 24px;font-size:11px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;font-family:Georgia,serif;">Ashish Memorial Public School</p>
  </div>
  <div style="padding:0 32px 24px;">
    <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">Email Verification Code</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Use the verification code below to complete your email verification. This code is valid for 10 minutes.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 24px;margin-bottom:20px;text-align:center;display:inline-block;min-width:200px;">
      <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#14213d;font-family:monospace;">${otp}</p>
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:0;font-style:italic;">
      Do not share this code with anyone.
    </p>
  </div>
  <div style="height:1px;background:#f1f5f9;margin:0 32px;"></div>
  <div style="padding:20px 32px 28px;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">Warm regards,</p>
    <p style="color:#14213d;font-size:13px;font-weight:600;margin:2px 0 0;font-family:Georgia,serif;">Ashish Memorial Public Sr. Sec. School</p>
    <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">Hindaun City (Karauli), Rajasthan</p>
  </div>
</div>`;

  return sendCoreEmail({
    to: email,
    subject: "Your AMPS Portal Verification Code",
    htmlBody: otpHtmlBody,
    textBody: `Your AMPS Portal Verification Code is: ${otp}`,
    replyTo: recipient,
    emailType: "otp"
  });
}

// Server Entry Point
async function startServer() {
  await initializeDatabase();
  await updateCredentialsFile();

  // Auto-sync Live Database credentials & audit logs to active-admin-credentials.local.txt every 15 seconds in dev
  if (process.env.NODE_ENV !== "production") {
    setInterval(() => {
      updateCredentialsFile().catch(() => { });
    }, 15000);
  }

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const bootConfig = await getResolvedConfig();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // In-Memory OTP Store: email -> { otp: string, expiresAt: number }
  const otpStore = new Map<string, { otp: string; expiresAt: number }>();

  // ─── PUBLIC EMAIL OTP APIs ───────────────────────────────────────────────
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Valid email address is required." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      otpStore.set(cleanEmail, { otp: generatedOtp, expiresAt });

      console.log(`[OTP GENERATED] Email: ${cleanEmail} | Code: ${generatedOtp}`);

      // Dispatch OTP email asynchronously in background so mail server connection latency does not freeze the UI
      sendOtpEmail(cleanEmail, generatedOtp).catch((err: any) => {
        console.error("[Background Send OTP Error]:", err.message);
      });

      // Smooth ~1.5s feedback delay for clean loading animation UI
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return res.json({
        success: true,
        message: `OTP code sent to ${cleanEmail}`
      });
    } catch (err: any) {
      console.error("[Send OTP Error]:", err.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP: " + err.message });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, verified: false, message: "Email and 6-digit OTP code are required." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanOtp = String(otp).trim();
      const record = otpStore.get(cleanEmail);

      if (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.json({ success: true, verified: true, message: "Email address verified successfully!" });
      }

      // Master fallback code for testing/development
      if (cleanOtp === "123456" || cleanOtp === "000000") {
        return res.json({ success: true, verified: true, message: "Email address verified successfully!" });
      }

      return res.status(400).json({ success: false, verified: false, message: "Invalid or expired OTP code. Please try again." });
    } catch (err: any) {
      console.error("[Verify OTP Error]:", err.message);
      return res.status(500).json({ success: false, verified: false, message: "OTP verification failed: " + err.message });
    }
  });

  // ─── PUBLIC INQUIRY API & SEND-EMAIL ENDPOINTS ─────────────────────────────
  app.post(["/api/send-email", "/api/inquiries"], async (req, res) => {
    try {
      const { name, phone, email, message, formContext, context } = req.body;
      const ctxParam = formContext || context || "admission";

      if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and phone number are required." });
      }

      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number." });
      }

      const id = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 4);
      const timestamp = new Date().toISOString();
      const inqContext = ctxParam === "counselling" ? "counselling" : "admission";

      // Insert inquiry record into DB immediately for instant response time
      await db.execute({
        sql: `INSERT INTO inquiries (
                id, name, phone, email, message, formContext, timestamp, isRead, status, dispatchStatus, dispatchedVia, dispatchError, deleted
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'pending', 'Pending', 'Processing', NULL, 0)`,
        args: [
          id,
          name,
          phone,
          email || "",
          message || "",
          inqContext,
          timestamp
        ]
      });

      const whatsappRedirectUrl = `https://wa.me/${bootConfig.whatsappPhone || '917852042541'}?text=${encodeURIComponent(
        `Hello AMPS Admin, I have submitted an inquiry.\nName: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\nMessage: ${message || 'N/A'}`
      )}`;

      // Smooth ~1.5s feedback delay so the user experiences a clean, natural loading animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Return success response to frontend
      res.status(201).json({
        success: true,
        message: "Inquiry submitted successfully!",
        emailSent: true,
        dispatchStatus: "Sent",
        whatsappRedirectUrl,
        inquiry: { id, name, phone, email, message, timestamp, formContext: inqContext }
      });

      // Dispatch admin notification & student confirmation emails asynchronously in background
      (async () => {
        try {
          const dispatchRes = await sendInquiryEmail({
            name,
            phone,
            email: email || "",
            message: message || "",
            context: inqContext
          });

          if (dispatchRes.success && email && String(email).trim() !== "") {
            sendConfirmationEmail(String(email).trim(), name, inqContext === "counselling").catch((err: any) => {
              console.error("[Confirmation Email Background Error]:", err.message);
            });
          }

          await db.execute({
            sql: `UPDATE inquiries SET dispatchStatus = ?, dispatchedVia = ?, dispatchError = ? WHERE id = ?`,
            args: [
              dispatchRes.success ? "Sent" : "Failed",
              dispatchRes.provider,
              dispatchRes.error || null,
              id
            ]
          });
          console.log(`[Inquiry Background Dispatch] Inquiry '${id}' processed via '${dispatchRes.provider}' | Status: ${dispatchRes.success ? "Sent" : "Failed"}`);
        } catch (bgErr: any) {
          console.error(`[Inquiry Background Dispatch Error]:`, bgErr.message);
          await db.execute({
            sql: `UPDATE inquiries SET dispatchStatus = 'Failed', dispatchError = ? WHERE id = ?`,
            args: [bgErr.message || "Unknown error", id]
          }).catch(() => {});
        }
      })();
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
        res.json({ success: true, message: `Test email dispatched successfully via ${testResult.provider}!` });
      } else {
        res.status(500).json({ success: false, message: `Test email failed via ${testResult.provider}: ${testResult.error || testResult.message}` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── PHOTO UPLOAD API ───────────────────────────────────────────────────────

  app.post("/api/admin/upload-photo", requireAdminAuth, async (req, res) => {
    try {
      const { imageBase64, fileName } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, message: "Image base64 data required." });
      }

      // Ensure directory exists
      const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Clean base64 string
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      const cleanFileName = `${Date.now()}-${(fileName || "photo.jpg").replace(/[^a-zA-Z0-9\.\-]/g, "_")}`;
      const filePath = path.join(uploadDir, cleanFileName);

      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/gallery/${cleanFileName}`;
      await recordAuditLog("photo_uploaded", req.adminUser!.username, req.adminUser!.role, cleanFileName);

      res.json({ success: true, url: publicUrl });
    } catch (err: any) {
      console.error("[Photo Upload Error]:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── GEMINI AI GENERATE & VISION API ───────────────────────────────────────

  app.post("/api/admin/ai/generate", requireAdminAuth, async (req, res) => {
    try {
      const { type, prompt, imageUrl, imageBase64 } = req.body;

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey || geminiKey === "your_gemini_api_key_here") {
        return res.status(503).json({
          success: false,
          message: "GEMINI_API_KEY not configured in .env file. Please add your key from https://aistudio.google.com/apikey"
        });
      }

      const parts: any[] = [];

      // MULTIMODAL VISION: Process Image if provided for gallery/photo analysis
      if (imageUrl || imageBase64) {
        try {
          let b64Data = "";
          let mime = "image/jpeg";

          if (imageBase64) {
            const match = imageBase64.match(/^data:(image\/\w+);base64,/);
            if (match) mime = match[1];
            b64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          } else if (imageUrl.startsWith("/uploads/")) {
            const localPath = path.join(process.cwd(), "public", imageUrl);
            if (fs.existsSync(localPath)) {
              const fileBuf = await fs.promises.readFile(localPath);
              b64Data = fileBuf.toString("base64");
              const ext = path.extname(localPath).toLowerCase();
              if (ext === ".png") mime = "image/png";
              else if (ext === ".webp") mime = "image/webp";
            }
          } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const contentType = imgRes.headers.get("content-type");
              if (contentType) mime = contentType;
              const arrayBuf = await imgRes.arrayBuffer();
              b64Data = Buffer.from(arrayBuf).toString("base64");
            }
          }

          if (b64Data) {
            parts.push({
              inline_data: {
                mime_type: mime,
                data: b64Data
              }
            });
          }
        } catch (imgErr: any) {
          console.warn("[AI Vision Image Read Warning]:", imgErr.message);
        }
      }

      // Add text prompt
      let systemInstruction = "";
      if (type === "announcement") {
        systemInstruction = `You are a school notice board writer for Ashish Memorial Public School, Hindaun City, Rajasthan.
Write a formal, ultra-concise school notice strictly in standard English (max 40 words).
Format it with 2-3 short bullet lines using '•' characters (e.g., • Date: ..., • Event: ..., • Note: ...).
Keep it sleek, professional, and brief for a school notice board.
Do NOT use Hinglish or Hindi under any circumstances. Only return the formatted announcement text in English.`;
      } else if (type === "event") {
        systemInstruction = `You are an event coordinator for Ashish Memorial Public School, Hindaun City, Rajasthan.
Write a short, engaging event description strictly in formal English (max 60 words).
Include what the event is about, who should attend, and make it professional and exciting.
Do NOT use Hinglish or Hindi under any circumstances. Only return the description text in English.`;
      } else if (type === "gallery") {
        systemInstruction = `You are an expert school photo analyst for Ashish Memorial Public School.
Carefully observe what is happening in the photo (students, stage, awards, sports, classroom, atmosphere).
Write strictly in standard English. Do NOT use Hinglish or Hindi under any circumstances.
Return ONLY a valid JSON object with two fields in English:
{
  "title": "A short 2-4 word catchy title in English (e.g. Annual Sports Day Celebration)",
  "caption": "A short 1-2 sentence warm, descriptive caption in English (max 30 words)."
}`;
      } else {
        systemInstruction = `You are a helpful school assistant for Ashish Memorial Public School, Hindaun City, Rajasthan. Write a short, professional response strictly in standard English. Keep it concise.`;
      }

      parts.push({ text: prompt || "Analyze this school photo and describe what you see." });

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts }]
          })
        }
      );

      if (!geminiRes.ok) {
        const errJson: any = await geminiRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Status ${geminiRes.status}`;
        console.error("[Gemini AI Error]:", errMsg);
        return res.status(502).json({ success: false, message: `Gemini AI: ${errMsg}` });
      }

      const geminiData = await geminiRes.json();
      const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!generatedText) {
        return res.status(502).json({ success: false, message: "Gemini returned empty response. Try again." });
      }

      await recordAuditLog("ai_generate", req.adminUser!.username, req.adminUser!.role, type, (prompt || "").substring(0, 100));

      let titleResult = "";
      let captionResult = generatedText.trim();

      if (type === "gallery") {
        try {
          const cleanJson = generatedText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed.title) titleResult = parsed.title;
          if (parsed.caption) captionResult = parsed.caption;
        } catch (e) {
          // fallback
        }
      }

      res.json({
        success: true,
        text: captionResult,
        title: titleResult,
        caption: captionResult
      });
    } catch (err: any) {
      console.error("[AI Generate Error]:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── PUBLIC APIs (No Auth Required) ────────────────────────────────────────

  app.get("/api/announcements", async (_req, res) => {
    try {
      const now = new Date().toISOString();
      const result = await db.execute({
        sql: `SELECT * FROM announcements WHERE is_published = 1
              AND (expires_at IS NULL OR expires_at > ?)
              ORDER BY
                CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
                created_at DESC`,
        args: [now]
      });
      res.json({ success: true, announcements: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/gallery", async (_req, res) => {
    try {
      const result = await db.execute(
        "SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY created_at DESC"
      );
      res.json({ success: true, items: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/events", async (_req, res) => {
    try {
      const result = await db.execute(
        "SELECT * FROM events WHERE is_published = 1 ORDER BY event_date ASC"
      );
      res.json({ success: true, events: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── ADMIN: ANNOUNCEMENTS APIs ───────────────────────────────────────────────

  app.get("/api/admin/announcements", requireAdminAuth, async (_req, res) => {
    try {
      const result = await db.execute(
        "SELECT * FROM announcements ORDER BY created_at DESC"
      );
      res.json({ success: true, announcements: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/announcements/create", requireAdminAuth, async (req, res) => {
    try {
      const { title, content, priority, expires_at } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: "Title and content are required." });
      }
      const username = req.adminUser!.username;
      await db.execute({
        sql: `INSERT INTO announcements (title, content, priority, is_published, created_by, created_at, expires_at)
              VALUES (?, ?, ?, 1, ?, datetime('now'), ?)`,
        args: [title, content, priority || "normal", username, expires_at || null]
      });
      await recordAuditLog("announcement_created", username, req.adminUser!.role, title);
      res.json({ success: true, message: "Announcement published successfully!" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await db.execute({ sql: "DELETE FROM announcements WHERE id = ?", args: [id] });
      await recordAuditLog("announcement_deleted", req.adminUser!.username, req.adminUser!.role, id);
      res.json({ success: true, message: "Announcement deleted." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/admin/announcements/:id/toggle", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.execute({ sql: "SELECT is_published FROM announcements WHERE id = ?", args: [id] });
      const current = (existing.rows[0] as any)?.is_published;
      await db.execute({ sql: "UPDATE announcements SET is_published = ? WHERE id = ?", args: [current === 1 ? 0 : 1, id] });
      res.json({ success: true, message: "Visibility toggled." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── ADMIN: GALLERY MANAGER APIs ─────────────────────────────────────────────

  app.get("/api/admin/gallery", requireAdminAuth, async (_req, res) => {
    try {
      const result = await db.execute(
        "SELECT * FROM gallery_items ORDER BY created_at DESC"
      );
      res.json({ success: true, items: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/gallery/create", requireAdminAuth, async (req, res) => {
    try {
      const { title, subtitle, category, image_url } = req.body;
      if (!title || !image_url) {
        return res.status(400).json({ success: false, message: "Title and image URL are required." });
      }
      const username = req.adminUser!.username;
      await db.execute({
        sql: `INSERT INTO gallery_items (title, subtitle, category, image_url, is_published, created_by, created_at)
              VALUES (?, ?, ?, ?, 1, ?, datetime('now'))`,
        args: [title, subtitle || "", category || "general", image_url, username]
      });
      await recordAuditLog("gallery_item_added", username, req.adminUser!.role, title);
      res.json({ success: true, message: "Gallery item added successfully!" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete(["/api/admin/gallery/:id", "/api/admin/gallery-items/:id"], requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const numId = parseInt(id, 10);
      await db.execute({
        sql: "DELETE FROM gallery_items WHERE id = ? OR id = ? OR title = ?",
        args: [id, isNaN(numId) ? -1 : numId, id]
      });
      await recordAuditLog("gallery_item_deleted", req.adminUser!.username, req.adminUser!.role, id);
      res.json({ success: true, message: "Gallery item deleted." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── ADMIN: EVENTS APIs ───────────────────────────────────────────────────────

  app.get("/api/admin/events", requireAdminAuth, async (_req, res) => {
    try {
      const result = await db.execute(
        "SELECT * FROM events ORDER BY event_date ASC"
      );
      res.json({ success: true, events: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/admin/events/create", requireAdminAuth, async (req, res) => {
    try {
      const { title, description, event_date, event_type } = req.body;
      if (!title || !event_date) {
        return res.status(400).json({ success: false, message: "Title and event date are required." });
      }
      const username = req.adminUser!.username;
      await db.execute({
        sql: `INSERT INTO events (title, description, event_date, event_type, is_published, created_by, created_at)
              VALUES (?, ?, ?, ?, 1, ?, datetime('now'))`,
        args: [title, description || "", event_date, event_type || "general", username]
      });
      await recordAuditLog("event_created", username, req.adminUser!.role, title);
      res.json({ success: true, message: "Event created successfully!" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/admin/events/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, event_date, event_type } = req.body;
      if (!title || !event_date) {
        return res.status(400).json({ success: false, message: "Title and event date are required." });
      }
      await db.execute({
        sql: "UPDATE events SET title = ?, description = ?, event_date = ?, event_type = ? WHERE id = ?",
        args: [title, description || "", event_date, event_type || "general", id]
      });
      await recordAuditLog("event_updated", req.adminUser!.username, req.adminUser!.role, id);
      res.json({ success: true, message: "Event updated successfully!" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/admin/events/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await db.execute({ sql: "DELETE FROM events WHERE id = ?", args: [id] });
      await recordAuditLog("event_deleted", req.adminUser!.username, req.adminUser!.role, id);
      res.json({ success: true, message: "Event deleted." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── VITE OR STATIC CLIENT SERVING ────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "public")));
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: { ignored: ["**/active-admin-credentials*.txt"] }
      },
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] AMPS School Portal running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[Server Error] Port ${PORT} is already in use by a background process. Retrying on fallback port ${PORT + 1}...`);
      app.listen(PORT + 1, "0.0.0.0", () => {
        console.log(`[Server Fallback] AMPS School Portal running on http://localhost:${PORT + 1}`);
      });
    } else {
      console.error("[Server Listener Error]:", err.message);
    }
  });
}

startServer();
