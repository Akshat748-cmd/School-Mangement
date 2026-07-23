import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Lock, Eye, EyeOff, LogOut, Users, Key,
  History, Settings, ClipboardList, RefreshCw, Download,
  Trash2, ChevronDown, ChevronUp, Phone, Mail, MessageSquare,
  Loader2, CheckCircle, XCircle, AlertTriangle, Bell,
  UserPlus, RotateCcw, X, ShieldAlert, TestTube, Menu,
  HelpCircle, Crown, User, Activity, UserCheck, CornerUpLeft, Edit3, FileText, BarChart3, Calendar
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

interface Toast {
  id: number;
  msg: string;
  type: "success" | "error" | "warning";
}

let toastCounter = 0;

export default function AdminPanel({ onClose }: AdminPanelProps) {
  // ─── Core Auth States ───────────────────────────────────────────────────────
  const [adminUsernameInput, setAdminUsernameInput] = useState("chairman");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [adminRole, setAdminRole] = useState(() => sessionStorage.getItem("admin_role") || "");
  const [adminUsername, setAdminUsername] = useState(() => sessionStorage.getItem("admin_username") || "");
  const [impersonatedBy, setImpersonatedBy] = useState<string | null>(() => sessionStorage.getItem("admin_impersonated_by") || null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => !!sessionStorage.getItem("admin_token"));

  const [adminInquiries, setAdminInquiries] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>({
    adminPassword: "ampsadmin",
    whatsappPhone: "919999999999",
    emailProvider: "web3forms",
    web3formsKey: "",
    smtpHost: "",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    inquiryRecipient: "admin@example.com",
    brevoApiKey: "",
    brevoSenderEmail: "",
    brevoSenderName: "AMPS Portal"
  });

  const [adminActiveTab, setAdminActiveTab] = useState<"inquiries" | "audit_log" | "users" | "settings" | "my_profile">("inquiries");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");

  // ─── Account & Audit States ──────────────────────────────────────────────────
  const [passwordHistory, setPasswordHistory] = useState<any[]>([]);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [auditLogList, setAuditLogList] = useState<any[]>([]);

  // Password Change Form States (My Profile)
  const [changePwCurrent, setChangePwCurrent] = useState("");
  const [changePwNew, setChangePwNew] = useState("");
  const [changePwConfirm, setChangePwConfirm] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Superadmin Reset & Impersonate States
  const [userResetPasswords, setUserResetPasswords] = useState<Record<string, string>>({});
  const [showResetRow, setShowResetRow] = useState<Record<string, boolean>>({});
  const [showUserPassword, setShowUserPassword] = useState<Record<string, boolean>>({});
  const [isResettingPw, setIsResettingPw] = useState<Record<string, boolean>>({});
  const [isImpersonating, setIsImpersonating] = useState<Record<string, boolean>>({});

  // Audit Log Edit Modal States
  const [editingAuditLogId, setEditingAuditLogId] = useState<number | null>(null);
  const [editingAuditLogData, setEditingAuditLogData] = useState("");
  const [isSavingAuditEdit, setIsSavingAuditEdit] = useState(false);

  // ─── Inquiry & Filter States ────────────────────────────────────────────────
  const [isClosing, setIsClosing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedInquiries, setExpandedInquiries] = useState<Record<string, boolean>>({});
  const [inquiryFilter, setInquiryFilter] = useState<"all" | "unread" | "last7" | "last30">("all");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<"all" | "pending" | "contacted" | "done">("all");
  const [inquirySort, setInquirySort] = useState<"newest" | "oldest" | "pending_first" | "done_last">("newest");

  // ─── UI Modal States ────────────────────────────────────────────────────────
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ─── Toast System ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ─── Inactivity Auto-logout ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminAuthenticated || !sessionToken) return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout("Logged out due to inactivity — please log in again.");
      }, 20 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAdminAuthenticated, sessionToken]);

  // ─── Authenticated Fetch Helper ──────────────────────────────────────────────
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${sessionToken}`
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_role");
      sessionStorage.removeItem("admin_username");
      sessionStorage.removeItem("admin_impersonated_by");
      setIsAdminAuthenticated(false);
      setSessionToken("");
      setImpersonatedBy(null);
      showToast("Session expired. Please log in again.", "warning");
      throw new Error("Unauthorized");
    }
    return response;
  }, [sessionToken, showToast]);

  // ─── Data Loaders ────────────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (token = sessionToken) => {
    if (!token) return;
    try {
      // 1. Fetch Inquiries
      const inqRes = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const inqData = await inqRes.json();
      if (inqRes.ok && inqData.success) {
        setAdminInquiries(inqData.inquiries || []);
        setUnreadCount(inqData.unreadCount || 0);
      }

      // 2. Fetch Audit Log
      loadAuditLogSilent(token);

      // 3. Fetch Password History
      loadPasswordHistorySilent(token);

      // 4. Fetch Users (if Superadmin)
      const role = sessionStorage.getItem("admin_role");
      if (role === "Superadmin") {
        loadAdminUsersSilent(token);
        loadSettingsSilent(token);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, [sessionToken]);

  const loadAuditLogSilent = async (token = sessionToken) => {
    try {
      const res = await fetch("/api/admin/audit-log", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setAuditLogList(data.auditLog || []);
    } catch (err) {
      console.error("Error fetching audit log:", err);
    }
  };

  const loadPasswordHistorySilent = async (token = sessionToken) => {
    try {
      const res = await fetch("/api/admin/password-history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setPasswordHistory(data.history || []);
    } catch (err) {
      console.error("Error fetching password history:", err);
    }
  };

  const loadAdminUsersSilent = async (token = sessionToken) => {
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users) && data.users.length > 0) {
        setAdminUsersList(data.users);
      } else {
        setAdminUsersList([
          { id: 1, username: "superadmin", role: "Superadmin", created_at: new Date().toISOString(), created_by: "system" },
          { id: 2, username: "chairman", role: "Chairman", created_at: new Date().toISOString(), created_by: "system" },
          { id: 3, username: "administrator", role: "Administrator", created_at: new Date().toISOString(), created_by: "system" },
          { id: 4, username: "principal", role: "Principal", created_at: new Date().toISOString(), created_by: "system" }
        ]);
      }
    } catch (err) {
      console.error("Error fetching admin users:", err);
      setAdminUsersList([
        { id: 1, username: "superadmin", role: "Superadmin", created_at: new Date().toISOString(), created_by: "system" },
        { id: 2, username: "chairman", role: "Chairman", created_at: new Date().toISOString(), created_by: "system" },
        { id: 3, username: "administrator", role: "Administrator", created_at: new Date().toISOString(), created_by: "system" },
        { id: 4, username: "principal", role: "Principal", created_at: new Date().toISOString(), created_by: "system" }
      ]);
    }
  };

  const loadSettingsSilent = async (token = sessionToken) => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setAdminSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && sessionToken) {
      loadDashboardData(sessionToken);
    }
  }, [isAdminAuthenticated, sessionToken, loadDashboardData]);

  useEffect(() => {
    if (isAdminAuthenticated && sessionToken && (adminActiveTab === "users" || adminRole?.toLowerCase() === "superadmin")) {
      loadAdminUsersSilent(sessionToken);
    }
  }, [adminActiveTab, isAdminAuthenticated, sessionToken, adminRole]);

  // ─── Auth Handlers ───────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    setAdminErrorMsg("");
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsernameInput, password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_role", data.role);
        sessionStorage.setItem("admin_username", data.username);
        sessionStorage.removeItem("admin_impersonated_by");

        setSessionToken(data.token);
        setAdminRole(data.role);
        setAdminUsername(data.username);
        setImpersonatedBy(null);
        setIsAdminAuthenticated(true);
        setAdminPasswordInput("");
        showToast(`Welcome back, ${data.username}!`, "success");
      } else {
        setAdminErrorMsg(data.message || "Invalid username or password.");
      }
    } catch (err) {
      setAdminErrorMsg("Unable to connect to the administration server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async (toastMsg?: string) => {
    try {
      if (sessionToken) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${sessionToken}` }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_role");
      sessionStorage.removeItem("admin_username");
      sessionStorage.removeItem("admin_impersonated_by");
      setIsAdminAuthenticated(false);
      setSessionToken("");
      setAdminRole("");
      setAdminUsername("");
      setImpersonatedBy(null);
      setAdminActiveTab("inquiries");
      showToast(toastMsg || "Logged out of admin console.", "warning");
    }
  };

  // ─── Password Change Handler (My Profile) ────────────────────────────────────
  const handlePasswordChange = async () => {
    setPasswordChangeMsg(null);
    if (!changePwCurrent) {
      showToast("Please enter your current password.", "warning");
      setPasswordChangeMsg({ text: "Please enter your current password.", type: "error" });
      return;
    }
    if (!changePwNew || changePwNew.length < 4) {
      showToast("New password must be at least 4 characters long.", "warning");
      setPasswordChangeMsg({ text: "New password must be at least 4 characters long.", type: "error" });
      return;
    }
    if (changePwNew !== changePwConfirm) {
      showToast("New password and confirm password do not match.", "error");
      setPasswordChangeMsg({ text: "New password and confirm password do not match.", type: "error" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: changePwCurrent, newPassword: changePwNew })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Password Updated !", "success");
        setPasswordChangeMsg({ text: "Password updated successfully !", type: "success" });
        setChangePwCurrent("");
        setChangePwNew("");
        setChangePwConfirm("");
        loadPasswordHistorySilent();
        loadAuditLogSilent();
        loadAdminUsersSilent();
      } else {
        showToast(data.message || "Failed to update password.", "error");
        setPasswordChangeMsg({ text: data.message || "Failed to update password.", type: "error" });
      }
    } catch (err: any) {
      showToast(err.message || "Error updating password.", "error");
      setPasswordChangeMsg({ text: err.message || "Error updating password.", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── Reset Password Handler (Superadmin Only) ────────────────────────────────
  const handleResetUserPassword = async (targetUsername: string) => {
    const newPass = userResetPasswords[targetUsername];
    if (!newPass || newPass.length < 4) {
      showToast("Password must be at least 4 characters long.", "warning");
      return;
    }

    setIsResettingPw(prev => ({ ...prev, [targetUsername]: true }));
    try {
      const res = await adminFetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Password reset successfully for ${targetUsername}!`, "success");
        setUserResetPasswords(prev => ({ ...prev, [targetUsername]: "" }));
        setShowResetRow(prev => ({ ...prev, [targetUsername]: false }));
        loadAdminUsersSilent();
        loadAuditLogSilent();
      } else {
        showToast(data.message || "Failed to reset password.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error resetting password.", "error");
    } finally {
      setIsResettingPw(prev => ({ ...prev, [targetUsername]: false }));
    }
  };

  // ─── Impersonation Handlers ─────────────────────────────────────────────────
  const handleImpersonate = async (targetUsername: string) => {
    setIsImpersonating(prev => ({ ...prev, [targetUsername]: true }));
    try {
      const res = await adminFetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_role", data.role);
        sessionStorage.setItem("admin_username", data.username);
        sessionStorage.setItem("admin_impersonated_by", data.impersonatedBy);

        setSessionToken(data.token);
        setAdminRole(data.role);
        setAdminUsername(data.username);
        setImpersonatedBy(data.impersonatedBy);

        showToast(`Now impersonating ${data.username} (${data.role})`, "warning");
        loadDashboardData(data.token);
      } else {
        showToast(data.message || "Failed to start impersonation session.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error starting impersonation.", "error");
    } finally {
      setIsImpersonating(prev => ({ ...prev, [targetUsername]: false }));
    }
  };

  const handleExitImpersonation = async () => {
    try {
      const res = await adminFetch("/api/admin/exit-impersonation", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_role", data.role);
        sessionStorage.setItem("admin_username", data.username);
        sessionStorage.removeItem("admin_impersonated_by");

        setSessionToken(data.token);
        setAdminRole(data.role);
        setAdminUsername(data.username);
        setImpersonatedBy(null);

        showToast("Exited impersonation session.", "success");
        loadDashboardData(data.token);
      }
    } catch (err: any) {
      showToast(err.message || "Error exiting impersonation.", "error");
    }
  };

  // ─── Audit Log Handlers (Superadmin Only) ───────────────────────────────────
  const handleRevokeAuditLog = async (id: number) => {
    try {
      const res = await adminFetch(`/api/admin/audit-log/${id}/revoke`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Inquiry restored successfully!", "success");
        loadDashboardData();
      } else {
        showToast(data.message || "Failed to revoke action.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error revoking action.", "error");
    }
  };

  const handleSaveAuditEdit = async () => {
    if (!editingAuditLogId) return;
    setIsSavingAuditEdit(true);
    try {
      const res = await adminFetch(`/api/admin/audit-log/${editingAuditLogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_data: editingAuditLogData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Audit log payload updated.", "success");
        setEditingAuditLogId(null);
        setEditingAuditLogData("");
        loadAuditLogSilent();
      } else {
        showToast(data.message || "Failed to update audit log entry.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error updating audit log entry.", "error");
    } finally {
      setIsSavingAuditEdit(false);
    }
  };

  // ─── Inquiry Handlers ───────────────────────────────────────────────────────
  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      const response = await adminFetch(`/api/admin/inquiry/${inquiryId}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Inquiry moved to trash.", "warning");
        loadDashboardData();
      } else {
        showToast(data.message || "Failed to delete inquiry.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error deleting inquiry.", "error");
    }
  };

  const handleClearAllInquiries = async () => {
    if (!window.confirm("ARE YOU SURE? This will move ALL inquiries to trash.")) return;
    try {
      const response = await adminFetch("/api/admin/clear-inquiries", { method: "POST" });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("All inquiries cleared.", "warning");
        loadDashboardData();
      } else {
        showToast(data.message || "Failed to clear inquiries.", "error");
      }
    } catch (err: any) {
      showToast("Error clearing inquiries: " + err.message, "error");
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: string) => {
    setAdminInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status } : inq));
    try {
      const response = await adminFetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || "Failed to update status on server.", "error");
      }
    } catch (err: any) {
      showToast("Error updating status: " + err.message, "error");
    }
  };

  const handleMarkAsRead = async (inquiryId: string) => {
    setAdminInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, isRead: 1 } : inq));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await adminFetch("/api/admin/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleInquiryExpand = (id: string, isRead: number) => {
    setExpandedInquiries(prev => ({ ...prev, [id]: !prev[id] }));
    if (isRead === 0) handleMarkAsRead(id);
  };

  const handleSaveSettings = async () => {
    try {
      const response = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: adminSettings })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Settings saved successfully!", "success");
      } else {
        showToast(data.message || "Failed to save settings.", "error");
      }
    } catch (err: any) {
      showToast("Error saving settings: " + err.message, "error");
    }
  };

  const handleTestEmail = async () => {
    showToast("Dispatching test email...", "warning");
    try {
      const response = await adminFetch("/api/admin/test-email", { method: "POST" });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Test email failed.", "error");
      }
    } catch (err: any) {
      showToast("Error sending test email: " + err.message, "error");
    }
  };

  const handleExportCSV = () => {
    if (!adminInquiries || adminInquiries.length === 0) {
      showToast("No inquiries available to export.", "warning");
      return;
    }
    const headers = ["Name", "Phone", "Email", "Message", "Context", "Timestamp", "Status", "Dispatch Status"];
    const escapeCsvValue = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = adminInquiries.map(inq => [
      escapeCsvValue(inq.name),
      escapeCsvValue(inq.phone),
      escapeCsvValue(inq.email),
      escapeCsvValue(inq.message),
      escapeCsvValue(inq.formContext || inq.context || "admission"),
      escapeCsvValue(inq.timestamp),
      escapeCsvValue(inq.status || "pending"),
      escapeCsvValue(inq.dispatchStatus || "Pending")
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AMPS_Inquiries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported inquiries to CSV!", "success");
  };

  // ─── Filtered Inquiries List ──────────────────────────────────────────────────
  const getFilteredInquiries = () => {
    let list = [...adminInquiries];

    if (inquiryFilter === "unread") {
      list = list.filter(i => i.isRead === 0);
    } else if (inquiryFilter === "last7") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(i => new Date(i.timestamp).getTime() >= sevenDaysAgo);
    } else if (inquiryFilter === "last30") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(i => new Date(i.timestamp).getTime() >= thirtyDaysAgo);
    }

    if (inquiryStatusFilter !== "all") {
      list = list.filter(i => (i.status || "pending") === inquiryStatusFilter);
    }

    if (inquirySort === "newest") {
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (inquirySort === "oldest") {
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else if (inquirySort === "pending_first") {
      list.sort((a, b) => (a.status === "pending" ? -1 : 1));
    } else if (inquirySort === "done_last") {
      list.sort((a, b) => (a.status === "done" ? 1 : -1));
    }

    return list;
  };

  const filteredInquiriesList = getFilteredInquiries();

  // ─── Permissions Config ──────────────────────────────────────────────────────
  const canWipeAll = adminRole === "Superadmin";
  const canDeleteInquiry = true;
  const canManageStatus = true;
  const canMarkRead = true;
  const canManageUsers = adminRole === "Superadmin";
  const canViewSettings = adminRole === "Superadmin";
  const canRevokeAuditLog = adminRole === "Superadmin";
  const canEditAuditLog = adminRole === "Superadmin";

  // ─── Sidebar Nav Config ───────────────────────────────────────────────────────
  const navItems = [
    { key: "inquiries", label: "Inquiries", icon: ClipboardList, badge: unreadCount > 0 ? unreadCount : null },
    { key: "audit_log", label: "Audit Log", icon: Activity, badge: null },
    ...(canManageUsers ? [{ key: "users", label: "Users", icon: Users, badge: null }] : []),
    ...(canViewSettings ? [{ key: "settings", label: "Settings", icon: Settings, badge: null }] : []),
    { key: "my_profile", label: "My Profile", icon: Key, badge: null },
  ];

  // Role selector options for professional login card selector
  const rolesList = [
    { key: "superadmin", label: "Superadmin", subtitle: "Full system access", icon: Crown },
    { key: "chairman", label: "Chairman", subtitle: "Board oversight", icon: Shield },
    { key: "administrator", label: "Administrator", subtitle: "Portal management", icon: Settings },
    { key: "principal", label: "Principal", subtitle: "Academic oversight", icon: User }
  ];

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto transition-colors duration-300 ${!isAdminAuthenticated ? "bg-[#EAE6DF]" : "bg-slate-950/70 backdrop-blur-md"
            }`}
        >
          {/* Toast Container */}
          <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold max-w-sm ${toast.type === "success" ? "bg-emerald-950 text-emerald-200 border-emerald-800" :
                    toast.type === "error" ? "bg-rose-950 text-rose-200 border-rose-800" :
                      "bg-amber-950 text-amber-200 border-amber-800"
                    }`}
                >
                  {toast.type === "success" && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                  {toast.type === "error" && <XCircle size={16} className="text-rose-400 shrink-0" />}
                  {toast.type === "warning" && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
                  <span className="flex-1">{toast.msg}</span>
                  <button onClick={() => dismissToast(toast.id)} className="opacity-60 hover:opacity-100 cursor-pointer">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              PROFESSIONAL NAVY LOGIN SCREEN (Unauthenticated State)
          ══════════════════════════════════════════════════════════════════════ */}
          {!isAdminAuthenticated ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 min-h-0"
            >
              {/* Left Navy Branding Panel with Gold Border */}
              <div className="md:col-span-5 bg-[#0F1E36] p-5 text-white flex flex-col justify-between items-center text-center relative overflow-hidden border-r-4 border-[#C9A227]">
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-[#C9A227]/10 rounded-full blur-3xl" />

                {/* Centered Main Brand Block */}
                <div className="relative z-10 w-full my-auto py-2">
                  <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-[#C9A227] shadow-xl mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    <img src="/assets/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-full" />
                  </div>

                  <h3 className="font-serif font-bold text-sm text-white leading-tight px-1">Ashish Memorial Public Sr. Sec. School</h3>
                  <p className="text-[9px] font-mono text-[#C9A227] uppercase tracking-widest mt-1 font-bold">ADMINISTRATION PORTAL</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">Hindaun City, Rajasthan · Est. 2005</p>

                  <div className="w-12 h-0.5 bg-[#C9A227]/50 mx-auto mt-3 mb-2" />
                </div>

                {/* Bottom Small Feature Lines */}
                <div className="relative z-10 w-full pt-2">
                  <div className="space-y-2 text-[10px] font-light text-slate-300 text-left max-w-[210px] mx-auto">
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-[#C9A227] shrink-0" />
                      <span>256-bit bcrypt encrypted sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell size={12} className="text-[#C9A227] shrink-0" />
                      <span>Real-time inquiry notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={12} className="text-[#C9A227] shrink-0" />
                      <span>Analytics and delivery tracking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Role Selector & Login Form */}
              <div className="md:col-span-7 p-5 flex flex-col justify-between bg-[#FDFBF7]">
                <div>
                  <div className="flex justify-between items-start mb-3.5">
                    <div>
                      <span className="text-[9px] font-bold font-mono text-[#C9A227] uppercase tracking-widest">SECURE SIGN IN</span>
                      <h3 className="text-base font-bold text-slate-800 font-serif mt-0.5">Select your role and enter credentials</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Role Cards Grid */}
                  <div className="mb-3.5">
                    <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">SELECT ROLE</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "superadmin", label: "Superadmin", subtitle: "Full system access", icon: Shield, defaultPw: "ampssuperadmin" },
                        { key: "chairman", label: "Chairman", subtitle: "Board oversight", icon: Crown, defaultPw: "ampschairman" },
                        { key: "administrator", label: "Administrator", subtitle: "Portal management", icon: Settings, defaultPw: "ampsadmin" },
                        { key: "principal", label: "Principal", subtitle: "Academic oversight", icon: User, defaultPw: "ampsprincipal" }
                      ].map(r => {
                        const Icon = r.icon;
                        const isSelected = adminUsernameInput.toLowerCase() === r.key.toLowerCase();
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => {
                              setAdminUsernameInput(r.key);
                              setAdminPasswordInput("");
                              setAdminErrorMsg("");
                            }}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${isSelected
                              ? "bg-[#FFFDF4] border-2 border-[#C9A227] shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                              }`}
                          >
                            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${isSelected ? "bg-[#C9A227]/10 text-[#C9A227]" : "bg-slate-100 text-slate-400"
                              }`}>
                              <Icon size={14} />
                            </div>
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-900 font-serif leading-tight">{r.label}</h4>
                              <p className="text-[9px] text-slate-400 font-sans leading-tight mt-0.5">{r.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {adminErrorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-2 rounded-lg mb-3 flex items-center gap-1.5 font-medium"
                    >
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{adminErrorMsg}</span>
                    </motion.div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">PASSWORD</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter password..."
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                          className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#C9A227] transition-all shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline text-[11px]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    onClick={handleAdminLogin}
                    disabled={isLoggingIn}
                    className="w-full bg-[#14213D] hover:bg-[#1e2f54] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoggingIn ? <Loader2 size={16} className="animate-spin text-[#C9A227]" /> : <Lock size={15} className="text-[#C9A227]" />}
                    <span>{isLoggingIn ? "AUTHENTICATING..." : "AUTHENTICATE CONSOLE"}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center font-mono mt-2">Authorized personnel only · Session expires after 20 min inactivity</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════════
                FULL-SCREEN NAVY-GOLD-MAROON DASHBOARD (Authenticated State)
            ══════════════════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex overflow-hidden bg-[#f8f5f0]"
            >
              {/* Mobile Backdrop Overlay */}
              {isMobileMenuOpen && (
                <div
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
                />
              )}

              {/* ─── LEFT SIDEBAR (Navy #14213D) ───────────────────────── */}
              <aside className={`fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-[#14213D] text-slate-300 flex flex-col justify-between border-r border-[#1a2b4c] shrink-0 h-full transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
              }`}>
                <div className="flex flex-col h-full justify-between p-5 overflow-y-auto">
                  <div className="space-y-5">
                    {/* Top School Crest & Title */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 p-1 backdrop-blur border border-white/10 flex items-center justify-center shrink-0">
                          <img src="/assets/logo.jpeg" alt="AMPS Logo" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div>
                          <h2 className="font-sans text-[13px] font-semibold tracking-tight text-white leading-tight">AMPS Portal</h2>
                          <p className="text-[9px] font-medium text-[#C9A227] tracking-[0.12em] uppercase">Admin Console</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Signed In User Card */}
                    <div className="bg-[#0b1326] p-3 rounded-lg border border-[#C9A227]/20 space-y-1.5">
                      <p className="text-[8px] font-medium text-slate-500 tracking-[0.14em] uppercase">SIGNED IN AS</p>
                      <p className="text-[13px] font-semibold text-white truncate font-sans">{adminUsername}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="bg-[#C9A227] text-[#14213D] text-[8.5px] font-semibold rounded px-2 py-0.5 uppercase">
                          {adminRole}
                        </span>
                        {impersonatedBy && (
                          <span className="text-[9px] font-sans text-amber-400 font-semibold">ACTING ROLE</span>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-[#C9A227]/20" />

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                      {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = adminActiveTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              setAdminActiveTab(item.key as any);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md font-sans text-[12px] font-medium transition-all cursor-pointer ${isActive
                              ? "bg-[#C9A227]/15 text-white font-semibold border-l-[3px] border-[#C9A227]"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={15} className={isActive ? "text-[#C9A227]" : "text-slate-400"} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== null && item.badge !== undefined && (
                              <span className="bg-[#C9A227] text-[#14213D] text-[9px] font-semibold font-sans px-2 py-0.5 rounded-full ml-auto">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Sidebar Bottom Action Buttons */}
                  <div className="pt-4 border-t border-white/10 space-y-1.5 mt-auto">
                    <button
                      onClick={() => handleLogout()}
                      className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-3 py-2 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <X size={15} />
                      <span>Close Panel</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* ─── MAIN CONTENT AREA (Ivory Paper #f8f5f0) ─────────────────── */}
              <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f5f0]">
                {/* Sticky Header Bar */}
                <header className="bg-white border-b border-[#e2d9cc] shadow-sm px-4 md:px-6 py-3.5 flex items-center justify-between shrink-0 z-10 gap-3">
                  <div className="flex items-center gap-3">
                    {/* Mobile Hamburger Toggle Button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(prev => !prev)}
                      className="md:hidden p-2 rounded-md bg-[#14213D] text-[#C9A227] hover:bg-[#1e2f54] cursor-pointer transition-colors shrink-0 shadow-sm"
                      title="Toggle menu"
                    >
                      <Menu size={18} />
                    </button>
                    <div>
                      <h1 className="font-sans font-semibold text-[15px] text-[#14213D] leading-snug tracking-tight">
                      {adminActiveTab === "inquiries" && "Admission & Counselling Leads"}
                      {adminActiveTab === "audit_log" && "Administrative Audit Trail"}
                      {adminActiveTab === "users" && "Admin User Accounts"}
                      {adminActiveTab === "settings" && "Portal Settings & Integration"}
                      {adminActiveTab === "my_profile" && "Account & Security Profile"}
                    </h1>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {adminActiveTab === "inquiries" && "Manage real-time student inquiries, export data, or trigger calls"}
                      {adminActiveTab === "audit_log" && "Track authentication, data mutations & system-wide actions"}
                      {adminActiveTab === "users" && "Manage portal roles, reset passwords, or trigger impersonation"}
                      {adminActiveTab === "settings" && "Configure email channels, Web3Forms/Brevo API keys & WhatsApp"}
                      {adminActiveTab === "my_profile" && "Update your account password and view security event logs"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Impersonation Banner in Header */}
                    {impersonatedBy && (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-sans font-bold">
                        <UserCheck size={14} className="text-amber-700" />
                        <span>Impersonating: <strong className="underline">{adminUsername}</strong></span>
                        <button
                          onClick={handleExitImpersonation}
                          className="bg-[#14213D] text-[#C9A227] px-2.5 py-1 rounded text-[11px] font-bold hover:bg-[#1e2f54] cursor-pointer transition-colors ml-1"
                        >
                          Exit
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => loadDashboardData()}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[#14213D] bg-white border border-[#e2d9cc] hover:bg-slate-50 px-3 py-1.5 rounded-md cursor-pointer shadow-sm transition-colors"
                      title="Reload dashboard data"
                    >
                      <RefreshCw size={13} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <div className="text-[11px] text-slate-400 font-sans hidden lg:block bg-[#f8f5f0] border border-[#e2d9cc] px-3 py-1.5 rounded-md">
                      {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </header>

                {/* Main Scrollable View Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    {/* ══ 1. INQUIRIES TAB ═════════════════════════════════════════════ */}
                    {adminActiveTab === "inquiries" && (
                      <motion.div key="inquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-6xl mx-auto">
                        {/* Filter Bar Card */}
                        <div className="bg-white border border-[#e2d9cc] rounded-lg p-3.5 shadow-sm space-y-3">
                          {/* Row 1: Time Filters */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-1 bg-[#f8f5f0] p-1 rounded-md border border-[#e2d9cc]">
                              {[
                                { id: "all", label: "ALL" },
                                { id: "unread", label: "UNREAD" },
                                { id: "last7", label: "LAST 7 DAYS" },
                                { id: "last30", label: "LAST 30 DAYS" }
                              ].map(f => (
                                <button
                                  key={f.id}
                                  onClick={() => setInquiryFilter(f.id as any)}
                                  className={`px-3 py-1 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${inquiryFilter === f.id
                                    ? "bg-[#14213D] text-white shadow-sm"
                                    : "bg-transparent text-slate-600 hover:text-[#14213D]"
                                    }`}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>

                            {/* Export & Wipe Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-1.5 bg-[#14213D] hover:bg-[#1e2f54] text-white border border-[#C9A227] font-mono text-[10px] uppercase font-bold px-3 py-1.5 rounded-sm transition-all cursor-pointer shadow-sm"
                              >
                                <Download size={13} /> Export CSV
                              </button>
                              {canWipeAll && (
                                <button
                                  onClick={handleClearAllInquiries}
                                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-mono text-[10px] font-bold px-3 py-1.5 rounded-sm transition-all cursor-pointer"
                                >
                                  <Trash2 size={13} /> Wipe All
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Status Filters & Sort dropdown */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#e2d9cc]/60">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 mr-1">STATUS:</span>
                              {[
                                { id: "all", label: "ALL" },
                                { id: "pending", label: "PENDING" },
                                { id: "contacted", label: "CONTACTED" },
                                { id: "done", label: "DONE" }
                              ].map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => setInquiryStatusFilter(s.id as any)}
                                  className={`px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${inquiryStatusFilter === s.id
                                    ? "bg-[#14213D] text-white"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400">SORT:</span>
                              <select
                                value={inquirySort}
                                onChange={(e) => setInquirySort(e.target.value as any)}
                                className="bg-white border border-[#d1c9bc] rounded-md px-2.5 py-1 text-[11px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                              >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="pending_first">Pending First</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Inquiry Cards List */}
                        {filteredInquiriesList.length === 0 ? (
                          <div className="bg-white border border-[#e2d9cc] rounded-lg p-12 text-center shadow-sm">
                            <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
                            <h3 className="text-[13px] font-semibold text-[#14213D] font-sans">No Inquiries Found</h3>
                            <p className="text-xs text-slate-400 font-sans mt-1">There are no student inquiries matching the active filters.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredInquiriesList.map(inq => {
                              const isExpanded = !!expandedInquiries[inq.id];
                              const status = inq.status || "pending";
                              const isUnread = inq.isRead === 0;

                              const borderLeftClass =
                                status === "done" ? "border-l-4 border-l-[#16a34a]" :
                                  status === "contacted" ? "border-l-4 border-l-[#1d4ed8]" :
                                    "border-l-4 border-l-[#C9A227]";

                              return (
                                <div
                                  key={inq.id}
                                  className={`bg-white border border-[#e2d9cc] ${borderLeftClass} rounded-lg p-4 shadow-sm transition-all ${status === "done" ? "opacity-75" : ""
                                    } ${isUnread ? "bg-[#fffdf7]" : ""}`}
                                >
                                  {/* Card Header Row */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-9 h-9 rounded-full bg-[#14213D] text-[#C9A227] flex items-center justify-center font-semibold font-sans text-[12px] shrink-0 border border-[#C9A227]/40 shadow-sm">
                                        {inq.name ? inq.name.charAt(0).toUpperCase() : "A"}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-sans font-semibold text-[13px] text-[#14213D]">{inq.name}</h4>

                                          {/* Type Badge */}
                                          <span className={`text-[8px] font-sans font-semibold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded text-white ${inq.formContext === "counselling" ? "bg-[#800020]" : "bg-[#14213D]"
                                            }`}>
                                            {inq.formContext === "counselling" ? "Counselling" : "Admission"}
                                          </span>

                                          {/* Status Badge */}
                                          <span className={`text-[8px] font-sans font-semibold uppercase px-2 py-0.5 rounded-full ${status === "done" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                                            status === "contacted" ? "bg-blue-100 text-blue-900 border border-blue-300" :
                                              "bg-amber-100 text-amber-900 border border-amber-300"
                                            }`}>
                                            {status}
                                          </span>

                                          {/* Unread Dot */}
                                          {isUnread && (
                                            <span className="w-2 h-2 rounded-full bg-[#C9A227] inline-block" title="Unread Inquiry" />
                                          )}
                                        </div>

                                        <p className="text-[11px] text-slate-400 font-sans mt-1 flex items-center gap-3 flex-wrap">
                                          <span className="flex items-center gap-1"><Phone size={11} className="shrink-0 text-slate-400" />{inq.phone}</span>
                                          {inq.email && <span className="flex items-center gap-1"><Mail size={11} className="shrink-0 text-slate-400" />{inq.email}</span>}
                                          <span className="flex items-center gap-1 text-slate-400">
                                            <Calendar size={11} className="shrink-0 text-slate-400" />{new Date(inq.timestamp).toLocaleString("en-IN")}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Quick Actions & Status Control */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <select
                                        value={status}
                                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                        className="bg-white border border-[#d1c9bc] rounded-md px-2.5 py-1 text-[11px] font-sans font-medium text-[#14213D] focus:outline-none cursor-pointer"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="done">Done</option>
                                      </select>

                                      <button
                                        onClick={() => toggleInquiryExpand(inq.id, inq.isRead)}
                                        className="p-1.5 rounded-md border border-[#e2d9cc] hover:bg-slate-100 text-slate-700 cursor-pointer"
                                        title={isExpanded ? "Collapse details" : "Expand details"}
                                      >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                      </button>

                                      {canDeleteInquiry && (
                                        <button
                                          onClick={() => handleDeleteInquiry(inq.id)}
                                          className="p-1.5 rounded-md border border-rose-300 hover:bg-rose-50 text-rose-700 cursor-pointer"
                                          title="Move to trash"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expanded Payload & Action Buttons */}
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-3 pt-3 border-t border-[#e2d9cc] text-xs space-y-3"
                                    >
                                      <div className="bg-[#f8f5f0] p-3.5 rounded-md border border-[#e2d9cc] text-slate-800">
                                        <strong className="font-sans text-[#14213D] text-xs">Student Message Payload:</strong>
                                        <p className="mt-1 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                                          {inq.message || "No additional message details provided."}
                                        </p>
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
                                        <div className="text-[11px] text-slate-500">
                                          Dispatch: <strong className="text-slate-800">{inq.dispatchStatus || "Pending"}</strong>
                                          {inq.dispatchedVia && <span className="ml-1">via {inq.dispatchedVia}</span>}
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {isUnread && canMarkRead && (
                                            <button
                                              onClick={() => handleMarkAsRead(inq.id)}
                                              className="border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer"
                                            >
                                              Mark Read
                                            </button>
                                          )}
                                          <a
                                            href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#16a34a] hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
                                          >
                                            <MessageSquare size={13} /> WhatsApp
                                          </a>
                                          <a
                                            href={`tel:${inq.phone}`}
                                            className="bg-[#14213D] hover:bg-[#1e2f54] text-white font-bold text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
                                          >
                                            <Phone size={13} /> Call
                                          </a>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ══ 2. AUDIT LOG TAB ════════════════════════════════════════════ */}
                    {adminActiveTab === "audit_log" && (() => {
                      const displayAuditLogList = adminRole === "Superadmin"
                        ? auditLogList
                        : auditLogList.filter((log: any) => ["inquiry_deleted", "wipe_all", "inquiry_restored"].includes(log.action));

                      return (
                        <motion.div key="audit_log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-6xl mx-auto">
                          <div className="bg-white border border-[#e2d9cc] rounded-lg p-4 shadow-sm flex items-center justify-between">
                            <div>
                              <h2 className="text-[13px] font-semibold text-[#14213D] font-sans flex items-center gap-2">
                                <Activity size={18} className="text-[#C9A227]" /> {adminRole === "Superadmin" ? "Administrative Audit Trail" : "Inquiry Deletion Audit Log"}
                              </h2>
                              <p className="text-xs text-slate-500 font-sans mt-0.5">
                                {adminRole === "Superadmin"
                                  ? `System-wide authentication, user actions & inquiry management log (${displayAuditLogList.length} entries)`
                                  : `Records of deleted student inquiries & deletion history (${displayAuditLogList.length} entries)`}
                              </p>
                            </div>
                            <button
                              onClick={() => loadAuditLogSilent()}
                              className="bg-white border border-[#e2d9cc] hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <RefreshCw size={13} /> Refresh Log
                            </button>
                          </div>

                          {displayAuditLogList.length === 0 ? (
                            <div className="bg-white border border-[#e2d9cc] rounded-lg p-12 text-center font-mono text-xs text-slate-400 shadow-sm">
                              {adminRole === "Superadmin" ? "No audit log entries recorded yet." : "No inquiry deletion log entries recorded yet."}
                            </div>
                          ) : (
                            <div className="bg-white border border-[#e2d9cc] rounded-lg overflow-hidden shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-mono">
                                  <thead className="bg-[#14213D] text-slate-200 text-[10px] uppercase tracking-wider">
                                    <tr>
                                      <th className="px-4 py-3">Timestamp</th>
                                      <th className="px-4 py-3">Event Action</th>
                                      <th className="px-4 py-3">Performed By</th>
                                      <th className="px-4 py-3">Target / Payload</th>
                                      <th className="px-4 py-3">Status</th>
                                      {canRevokeAuditLog && <th className="px-4 py-3 text-right">Admin Controls</th>}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#e2d9cc]/60">
                                    {displayAuditLogList.map((log: any) => {
                                      const action = log.action;
                                      const isRevoked = log.revoked === 1;

                                      return (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString("en-IN")}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase border ${action === "login_success" ? "bg-[#dcfce7] text-[#166534] border-emerald-300" :
                                              action === "login_failed" ? "bg-[#fee2e2] text-[#991b1b] border-rose-300" :
                                                action === "logout" ? "bg-[#f1f5f9] text-[#475569] border-slate-300" :
                                                  action === "inquiry_deleted" ? "bg-[#fef3c7] text-[#92400e] border-amber-300" :
                                                    action === "wipe_all" ? "bg-[#fee2e2] text-[#991b1b] font-bold border-rose-400" :
                                                      action === "inquiry_restored" ? "bg-[#dcfce7] text-[#166534] border-emerald-300" :
                                                        "bg-[#dbeafe] text-[#1e40af] border-blue-300"
                                              }`}>
                                              {action}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 font-bold text-[#14213D]">
                                            {log.performed_by} <span className="text-[10px] text-slate-400 font-normal">({log.performed_by_role})</span>
                                          </td>
                                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                                            {log.target_id && <strong className="text-slate-900 font-bold">[{log.target_id}] </strong>}
                                            <span className="text-slate-500">{log.target_data || "—"}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            {isRevoked ? (
                                              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-300 uppercase">
                                                Revoked / Restored
                                              </span>
                                            ) : (
                                              <span className="text-emerald-700 font-bold text-[10px]">Active Event</span>
                                            )}
                                          </td>
                                          {canRevokeAuditLog && (
                                            <td className="px-4 py-3 text-right space-x-2">
                                              {action === "inquiry_deleted" && !isRevoked && (
                                                <button
                                                  onClick={() => handleRevokeAuditLog(log.id)}
                                                  className="border border-[#C9A227] text-[#14213D] hover:bg-[#C9A227]/10 font-bold text-[10px] font-mono px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                                                >
                                                  <RotateCcw size={11} className="inline mr-1" />
                                                  Revoke
                                                </button>
                                              )}
                                              {canEditAuditLog && (
                                                <button
                                                  onClick={() => {
                                                    setEditingAuditLogId(log.id);
                                                    setEditingAuditLogData(log.target_data || "");
                                                  }}
                                                  className="border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] p-1 rounded-md cursor-pointer"
                                                  title="Edit payload string"
                                                >
                                                  <Edit3 size={13} />
                                                </button>
                                              )}
                                            </td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Edit Audit Payload Modal */}
                          {editingAuditLogId && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-[#e2d9cc] space-y-4">
                                <h3 className="text-[13px] font-semibold text-[#14213D] font-sans">Edit Audit Entry Payload #{editingAuditLogId}</h3>
                                <textarea
                                  value={editingAuditLogData}
                                  onChange={(e) => setEditingAuditLogData(e.target.value)}
                                  rows={4}
                                  className="w-full border border-[#d1c9bc] bg-white rounded-md p-3 text-xs font-mono focus:outline-none focus:border-[#14213D]"
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingAuditLogId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-md cursor-pointer">
                                    Cancel
                                  </button>
                                  <button onClick={handleSaveAuditEdit} disabled={isSavingAuditEdit} className="px-4 py-2 bg-[#14213D] text-white text-xs font-bold rounded-md cursor-pointer border border-[#C9A227]">
                                    {isSavingAuditEdit ? "Saving..." : "Save Payload"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}

                    {/* ══ 3. USERS TAB (Superadmin Only) ═════════════════════════════════ */}
                    {adminActiveTab === "users" && (
                      <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-6xl mx-auto">
                        <div className="bg-white border border-[#e2d9cc] rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h2 className="text-[13px] font-semibold text-[#14213D] font-sans flex items-center gap-2">
                              <Users size={18} className="text-[#C9A227]" /> Admin User Accounts
                            </h2>
                            <p className="text-xs text-slate-500 font-sans mt-0.5">Manage portal administrators, reset passwords, or trigger impersonation sessions</p>
                          </div>
                          <button
                            onClick={() => loadAdminUsersSilent(sessionToken)}
                            className="bg-white border border-[#e2d9cc] hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono px-3.5 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <RefreshCw size={13} />
                            <span>Refresh Users</span>
                          </button>
                        </div>

                        {/* Admin User Cards */}
                        <div className="space-y-3">
                          {adminUsersList.map(u => {
                            const isSelf = u.username.toLowerCase() === adminUsername.toLowerCase();
                            const isSuper = u.role === "Superadmin";
                            const isResetOpen = !!showResetRow[u.username];
                            const defaultPassMap: Record<string, string> = {
                              superadmin: "ampssuperadmin",
                              chairman: "ampschairman",
                              administrator: "ampsadmin",
                              principal: "ampsprincipal"
                            };
                            const activePassword = u.plain_password || defaultPassMap[u.username.toLowerCase()] || "ampsadmin";
                            const isPassVisible = !!showUserPassword[u.username];

                            return (
                              <div key={u.username} className="bg-white border border-[#e2d9cc] rounded-lg p-4 shadow-sm space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {/* Avatar 40px circle */}
                                    <div className="w-10 h-10 rounded-full bg-[#14213D] text-[#C9A227] font-sans font-semibold text-[13px] border border-[#C9A227] flex items-center justify-center shrink-0 shadow-sm">
                                      {isSuper ? <Crown size={18} /> : u.username.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans font-semibold text-[13px] text-[#14213D]">{u.username}</span>
                                        {isSelf && (
                                          <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded">YOU</span>
                                        )}
                                        <span className="bg-[#C9A227]/15 text-[#14213D] font-sans text-[8px] font-semibold tracking-[0.04em] uppercase px-2 py-0.5 rounded-sm border border-[#C9A227]/40">
                                          {u.role}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                                        Registered: {new Date(u.created_at || Date.now()).toLocaleDateString("en-IN")}
                                      </p>

                                      {/* Password Badge */}
                                      <div className="flex items-center gap-2 mt-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md w-fit">
                                        <Key size={11} className="text-slate-400" />
                                        <span className="text-[11px] font-bold font-mono text-slate-700">
                                          Password: {isPassVisible ? activePassword : "••••••••••••"}
                                        </span>
                                        <button
                                          onClick={() => setShowUserPassword(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                                          className="text-slate-400 hover:text-[#14213D] cursor-pointer transition-colors ml-1"
                                          title={isPassVisible ? "Hide password" : "Show active password"}
                                        >
                                          {isPassVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Side Row Action Buttons */}
                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button
                                      onClick={() => setShowResetRow(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                                      className="bg-white border border-[#14213D] text-[#14213D] hover:bg-slate-50 text-xs font-bold font-mono px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors"
                                    >
                                      <Key size={13} />
                                      <span>Reset Password</span>
                                    </button>

                                    {!isSelf && (
                                      <button
                                        onClick={() => handleImpersonate(u.username)}
                                        disabled={isImpersonating[u.username]}
                                        className="bg-[#C9A227] hover:bg-[#b59020] text-[#14213D] font-bold font-mono text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                      >
                                        {isImpersonating[u.username] ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}
                                        <span>Login As</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Inline Reset Password Form */}
                                {isResetOpen && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2 border-t border-[#e2d9cc] flex items-center gap-3">
                                    <input
                                      type="password"
                                      placeholder="Enter new password for user..."
                                      value={userResetPasswords[u.username] || ""}
                                      onChange={(e) => setUserResetPasswords({ ...userResetPasswords, [u.username]: e.target.value })}
                                      className="flex-1 border border-[#d1c9bc] bg-white rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#14213D]"
                                    />
                                    <button
                                      onClick={() => handleResetUserPassword(u.username)}
                                      disabled={isResettingPw[u.username]}
                                      className="bg-[#14213D] hover:bg-[#1e2f54] text-white font-bold font-mono text-xs px-4 py-2 rounded-md border border-[#C9A227] cursor-pointer shadow-sm"
                                    >
                                      {isResettingPw[u.username] ? "Saving..." : "Confirm Reset"}
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ══ 4. SETTINGS TAB (Superadmin Only) ═══════════════════════════════ */}
                    {adminActiveTab === "settings" && (
                      <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 max-w-6xl mx-auto">
                        <div className="bg-white border border-[#e2d9cc] rounded-lg p-4 shadow-sm">
                          <h2 className="text-[13px] font-semibold text-[#14213D] font-sans">Delivery Engines & Portal Settings</h2>
                          <p className="text-xs text-slate-500 font-sans mt-0.5">Control email routing, API keys & WhatsApp configuration</p>
                        </div>

                        <div className="bg-white border border-[#e2d9cc] rounded-lg p-5 shadow-sm space-y-6">
                          {/* Section 1: Email Provider */}
                          <div>
                            <h3 className="text-[10px] font-bold font-mono text-[#C9A227] uppercase tracking-widest border-b border-[#e2d9cc] pb-1 mb-3">
                              EMAIL PROVIDER CONFIGURATION
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Select Delivery Provider</label>
                                <select
                                  value={adminSettings.emailProvider}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, emailProvider: e.target.value })}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                >
                                  <option value="web3forms">Web3Forms API (Recommended)</option>
                                  <option value="brevo">Brevo Transactional API</option>
                                  <option value="formsubmit">FormSubmit Tunnel</option>
                                  <option value="smtp">Nodemailer SMTP Relay</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Notification Recipient Inbox</label>
                                <input
                                  type="email"
                                  value={adminSettings.inquiryRecipient || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, inquiryRecipient: e.target.value })}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Section 2: API Keys */}
                          <div>
                            <h3 className="text-[10px] font-bold font-mono text-[#C9A227] uppercase tracking-widest border-b border-[#e2d9cc] pb-1 mb-3">
                              PROVIDER CREDENTIALS & KEYS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {adminSettings.emailProvider === "web3forms" && (
                                <div>
                                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Web3Forms Access Key</label>
                                  <input
                                    type="text"
                                    placeholder="Paste Web3Forms Access Key..."
                                    value={adminSettings.web3formsKey || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, web3formsKey: e.target.value })}
                                    className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">School WhatsApp Phone</label>
                                <input
                                  type="text"
                                  placeholder="919999999999"
                                  value={adminSettings.whatsappPhone || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, whatsappPhone: e.target.value })}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSaveSettings}
                              className="bg-[#14213D] hover:bg-[#1e2f54] text-white font-bold font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-md border border-[#C9A227] shadow-sm cursor-pointer"
                            >
                              Save Settings
                            </button>
                            <button
                              onClick={handleTestEmail}
                              className="bg-white border border-[#14213D] text-[#14213D] hover:bg-slate-50 font-bold font-mono text-xs uppercase px-5 py-3 rounded-md cursor-pointer"
                            >
                              Test Email Dispatch
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ 5. MY PROFILE TAB (All Roles) ══════════════════════════════════ */}
                    {adminActiveTab === "my_profile" && (
                      <motion.div key="my_profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 max-w-4xl mx-auto">
                        {/* Top Profile Card */}
                        <div className="bg-white border border-[#e2d9cc] border-t-4 border-t-[#C9A227] rounded-lg p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#14213D] text-[#C9A227] flex items-center justify-center border-2 border-[#C9A227] shadow-sm font-sans font-semibold text-[18px]">
                              {adminUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-[15px] font-semibold text-[#14213D] font-sans">{adminUsername}</h3>
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm bg-[#C9A227]/15 text-[#14213D] border border-[#C9A227]/40 uppercase">
                                  {adminRole}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-sans mt-0.5">Active Admin Console Profile</p>
                            </div>
                          </div>
                        </div>

                        {/* Password Change Form */}
                        <div className="bg-white border border-[#e2d9cc] rounded-lg p-6 shadow-sm space-y-4">
                          <h3 className="text-[13px] font-semibold font-sans text-[#14213D]">Change Account Password</h3>

                          <div className="space-y-3 max-w-md">
                            <div>
                              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1">Current Password</label>
                              <div className="relative">
                                <input
                                  type={showCurrentPw ? "text" : "password"}
                                  placeholder="Enter current password..."
                                  value={changePwCurrent}
                                  onChange={(e) => setChangePwCurrent(e.target.value)}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 pr-10 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                />
                                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14213D]">
                                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                              <div className="relative">
                                <input
                                  type={showNewPw ? "text" : "password"}
                                  placeholder="Enter new password..."
                                  value={changePwNew}
                                  onChange={(e) => setChangePwNew(e.target.value)}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 pr-10 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                />
                                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14213D]">
                                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1">Confirm New Password</label>
                              <div className="relative">
                                <input
                                  type={showConfirmPw ? "text" : "password"}
                                  placeholder="Confirm new password..."
                                  value={changePwConfirm}
                                  onChange={(e) => setChangePwConfirm(e.target.value)}
                                  className="w-full bg-white border border-[#d1c9bc] rounded-md px-3 py-2.5 pr-10 text-[13px] font-mono text-[#14213D] focus:outline-none focus:border-[#14213D]"
                                />
                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14213D]">
                                  {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>

                            {passwordChangeMsg && (
                              <div className={`p-3 rounded-md text-xs font-sans font-medium flex items-center gap-2 border ${passwordChangeMsg.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                                }`}>
                                {passwordChangeMsg.type === "success" ? <CheckCircle size={15} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={15} className="shrink-0 text-rose-600" />}
                                <span>{passwordChangeMsg.text}</span>
                              </div>
                            )}

                            <button
                              onClick={handlePasswordChange}
                              disabled={isChangingPassword}
                              className="bg-[#14213D] hover:bg-[#1e2f54] text-white font-bold font-mono text-xs uppercase tracking-wider py-3 rounded-md border border-[#C9A227] shadow-sm flex items-center justify-center gap-2 w-full cursor-pointer transition-all"
                            >
                              {isChangingPassword ? <Loader2 size={15} className="animate-spin text-[#C9A227]" /> : <CheckCircle size={15} className="text-[#C9A227]" />}
                              <span>Update Password</span>
                            </button>
                          </div>
                        </div>

                        {/* Password Change History Table */}
                        <div className="bg-white border border-[#e2d9cc] rounded-lg overflow-hidden shadow-sm">
                          <div className="px-5 py-3.5 border-b border-[#e2d9cc] flex justify-between items-center bg-[#f8f5f0]">
                            <span className="text-xs font-bold font-mono text-[#14213D] uppercase tracking-widest flex items-center gap-2">
                              <History size={14} className="text-[#C9A227]" /> My Password Change History ({passwordHistory.length})
                            </span>
                            <button onClick={() => loadPasswordHistorySilent()} className="text-slate-500 hover:text-[#14213D] transition-colors">
                              <RefreshCw size={14} />
                            </button>
                          </div>

                          {passwordHistory.length === 0 ? (
                            <div className="p-8 text-center font-mono text-xs text-slate-400">
                              No password change entries recorded yet.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-[#14213D] text-slate-200 text-[10px] uppercase border-b border-[#e2d9cc]">
                                  <tr>
                                    <th className="px-5 py-3">Timestamp</th>
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Changed By</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2d9cc]">
                                  {passwordHistory.map((h: any, idx: number) => (
                                    <tr key={h.id || h.changed_at} className={idx % 2 === 0 ? "bg-white" : "bg-[#f8f5f0]/60"}>
                                      <td className="px-5 py-3 text-slate-600">
                                        {(() => {
                                          if (!h.changed_at) return "—";
                                          const str = String(h.changed_at).includes(" ") && !String(h.changed_at).includes("T") ? String(h.changed_at).replace(" ", "T") : String(h.changed_at);
                                          const d = new Date(str);
                                          return isNaN(d.getTime()) ? String(h.changed_at) : d.toLocaleString("en-IN");
                                        })()}
                                      </td>
                                      <td className="px-5 py-3 font-bold text-[#14213D]">{h.username}</td>
                                      <td className="px-5 py-3 text-[#14213D] font-bold">{h.changed_by}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </main>
            </motion.div>
          )}

          {/* Forgot Password Helper Modal */}
          {showForgotPasswordModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">Forgot Password</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Admin Account Password Recovery</p>
                  </div>
                  <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed font-mono">
                  💡 <strong>Password Recovery Instructions:</strong><br />
                  Please contact the Primary <strong>Superadmin</strong> to trigger an instant password reset for your role from the Users tab.
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full bg-[#14213D] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {/* Floating Toast Notifications Container */}
          <div className="fixed top-5 right-5 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className={`p-3.5 rounded-lg shadow-xl border flex items-center justify-between pointer-events-auto backdrop-blur-md ${t.type === "success"
                    ? "bg-emerald-900/95 border-emerald-500 text-emerald-100"
                    : t.type === "error"
                      ? "bg-rose-900/95 border-rose-500 text-rose-100"
                      : "bg-amber-900/95 border-amber-500 text-amber-100"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    {t.type === "success" && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                    {t.type === "error" && <XCircle size={16} className="text-rose-400 shrink-0" />}
                    {t.type === "warning" && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
                    <span className="text-xs font-sans font-medium leading-snug">{t.msg}</span>
                  </div>
                  <button
                    onClick={() => dismissToast(t.id)}
                    className="ml-3 text-slate-400 hover:text-white cursor-pointer p-0.5"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
