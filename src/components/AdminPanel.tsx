import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Lock, Eye, EyeOff, LogOut, Users, Key,
  History, Settings, ClipboardList, RefreshCw, Download,
  Trash2, ChevronDown, ChevronUp, Phone, Mail, MessageSquare,
  Loader2, CheckCircle, XCircle, AlertTriangle, Bell,
  UserPlus, RotateCcw, X, ShieldAlert, TestTube,
  HelpCircle, Crown, User, Activity, UserCheck, CornerUpLeft, Edit3, FileText, BarChart3
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

  // Superadmin Reset & Impersonate States
  const [userResetPasswords, setUserResetPasswords] = useState<Record<string, string>>({});
  const [showResetRow, setShowResetRow] = useState<Record<string, boolean>>({});
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
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setAdminUsersList(data.users || []);
    } catch (err) {
      console.error("Error fetching admin users:", err);
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
    if (!changePwCurrent) {
      showToast("Please enter your current password.", "warning");
      return;
    }
    if (!changePwNew || changePwNew.length < 4) {
      showToast("New password must be at least 4 characters long.", "warning");
      return;
    }
    if (changePwNew !== changePwConfirm) {
      showToast("New password and confirm password do not match.", "error");
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
        showToast("Password updated successfully!", "success");
        setChangePwCurrent("");
        setChangePwNew("");
        setChangePwConfirm("");
        loadPasswordHistorySilent();
        loadAuditLogSilent();
      } else {
        showToast(data.message || "Failed to update password.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error updating password.", "error");
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
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto transition-colors duration-300 ${
            !isAdminAuthenticated ? "bg-[#EAE6DF]" : "bg-slate-950/70 backdrop-blur-md"
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
                  className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold max-w-sm ${
                    toast.type === "success" ? "bg-emerald-950 text-emerald-200 border-emerald-800" :
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
                              setAdminPasswordInput(r.defaultPw);
                              setAdminErrorMsg("");
                            }}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-[#FFFDF4] border-2 border-[#C9A227] shadow-sm"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-[#C9A227]/10 text-[#C9A227]" : "bg-slate-100 text-slate-400"
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
                NAVY DASHBOARD CONTAINER (Authenticated State)
            ══════════════════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-slate-50 rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              {/* Impersonation Banner */}
              {impersonatedBy && (
                <div className="bg-amber-500 text-slate-950 font-mono text-xs px-6 py-2.5 flex items-center justify-between font-bold border-b border-amber-600 shadow-inner">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} />
                    <span>Impersonating user '{adminUsername}' ({adminRole}) — Session initiated by Superadmin ({impersonatedBy})</span>
                  </div>
                  <button
                    onClick={handleExitImpersonation}
                    className="bg-slate-950 hover:bg-slate-900 text-amber-400 px-3 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <CornerUpLeft size={13} /> Exit Impersonation
                  </button>
                </div>
              )}

              {/* Sidebar + Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Navy Left Sidebar Panel */}
                <div className="w-64 bg-[#14213D] text-slate-300 p-5 flex flex-col justify-between border-r border-slate-800 shrink-0">
                  <div className="space-y-6">
                    {/* Sidebar Brand */}
                    <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-white/10 p-1 backdrop-blur border border-white/10 flex items-center justify-center">
                        <img src="/assets/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-sm text-white leading-tight">AMPS Portal</h2>
                        <p className="text-[10px] font-mono text-[#C9A227]">Admin Console</p>
                      </div>
                    </div>

                    {/* Signed In User Card */}
                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 font-mono">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">SIGNED IN AS</p>
                      <p className="text-sm font-bold text-white truncate">{adminUsername}</p>
                      <span className="inline-block bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {adminRole}
                      </span>
                    </div>

                    {/* Sidebar Nav Items */}
                    <div className="space-y-1.5">
                      {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = adminActiveTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setAdminActiveTab(item.key as any)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                              isActive ? "bg-white/15 text-white font-bold border border-white/20 shadow-md" : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} className={isActive ? "text-[#C9A227]" : "text-slate-400"} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== null && item.badge !== undefined && (
                              <span className="bg-rose-500 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Footer Buttons */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => handleLogout()}
                      className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                    >
                      <X size={15} /> Close Panel
                    </button>
                  </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <AnimatePresence mode="wait">
                    {/* ══ 1. INQUIRIES TAB ═════════════════════════════════════════════ */}
                    {adminActiveTab === "inquiries" && (
                      <motion.div key="inquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h2 className="text-lg font-bold text-slate-900 font-serif">Admission & Counselling Leads</h2>
                              <p className="text-xs text-slate-500 font-mono">Real-time student submissions ({filteredInquiriesList.length} shown)</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-1.5 bg-[#14213D] hover:bg-[#1e2f54] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                              >
                                <Download size={13} /> Export CSV
                              </button>
                              {canWipeAll && (
                                <button
                                  onClick={handleClearAllInquiries}
                                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                                >
                                  <Trash2 size={13} /> Wipe All
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Time & Status Filter Pills */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              {[
                                { id: "all", label: "All Inquiries" },
                                { id: "unread", label: "Unread" },
                                { id: "last7", label: "Last 7 Days" },
                                { id: "last30", label: "Last 30 Days" }
                              ].map(f => (
                                <button
                                  key={f.id}
                                  onClick={() => setInquiryFilter(f.id as any)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    inquiryFilter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={inquiryStatusFilter}
                                onChange={(e) => setInquiryStatusFilter(e.target.value as any)}
                                className="border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                              >
                                <option value="all">Status: All</option>
                                <option value="pending">Status: Pending</option>
                                <option value="contacted">Status: Contacted</option>
                                <option value="done">Status: Done</option>
                              </select>

                              <select
                                value={inquirySort}
                                onChange={(e) => setInquirySort(e.target.value as any)}
                                className="border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                              >
                                <option value="newest">Sort: Newest First</option>
                                <option value="oldest">Sort: Oldest First</option>
                                <option value="pending_first">Sort: Pending First</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Inquiries Cards */}
                        {filteredInquiriesList.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                            <ClipboardList size={36} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-700 font-serif">No Inquiries Found</h3>
                            <p className="text-xs text-slate-400 mt-1">There are no inquiries matching the selected filters.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredInquiriesList.map(inq => {
                              const isExpanded = !!expandedInquiries[inq.id];
                              const status = inq.status || "pending";
                              const isUnread = inq.isRead === 0;

                              return (
                                <div
                                  key={inq.id}
                                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                                    isUnread ? "border-indigo-300 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-[#14213D] text-[#C9A227] flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                                        {inq.name ? inq.name.charAt(0).toUpperCase() : "A"}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-bold text-sm text-slate-900 font-serif">{inq.name}</h4>
                                          {isUnread && (
                                            <span className="bg-rose-100 text-rose-700 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">NEW</span>
                                          )}
                                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                            inq.formContext === "counselling" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                          }`}>
                                            {inq.formContext === "counselling" ? "Counselling" : "Admission"}
                                          </span>
                                        </div>
                                        <p className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                                          <span>📞 {inq.phone}</span>
                                          {inq.email && <span>✉️ {inq.email}</span>}
                                          <span>📅 {new Date(inq.timestamp).toLocaleString("en-IN")}</span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action Buttons & Status */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <select
                                        value={status}
                                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                        className={`text-xs font-bold font-mono rounded-xl px-2.5 py-1.5 border cursor-pointer focus:outline-none ${
                                          status === "done" ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                                          status === "contacted" ? "bg-blue-50 text-blue-800 border-blue-300" :
                                          "bg-amber-50 text-amber-800 border-amber-300"
                                        }`}
                                      >
                                        <option value="pending">🟡 Pending</option>
                                        <option value="contacted">🔵 Contacted</option>
                                        <option value="done">🟢 Done</option>
                                      </select>

                                      <button
                                        onClick={() => toggleInquiryExpand(inq.id, inq.isRead)}
                                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                                      >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                      </button>

                                      <button
                                        onClick={() => handleDeleteInquiry(inq.id)}
                                        className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                        title="Move to trash"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded Inquiry Details */}
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-3"
                                    >
                                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-light">
                                        <strong>Student Message:</strong>
                                        <p className="mt-1 font-mono text-slate-800 whitespace-pre-wrap">{inq.message || "No message payload provided."}</p>
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                                        <div className="flex items-center gap-2">
                                          <span>Dispatch: <strong className="text-slate-800">{inq.dispatchStatus || "Pending"}</strong></span>
                                          {inq.dispatchedVia && <span>via {inq.dispatchedVia}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <a
                                            href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-700"
                                          >
                                            <MessageSquare size={12} /> WhatsApp
                                          </a>
                                          <a
                                            href={`tel:${inq.phone}`}
                                            className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-700"
                                          >
                                            <Phone size={12} /> Call
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
                    {adminActiveTab === "audit_log" && (
                      <motion.div key="audit_log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                              <Activity size={20} className="text-indigo-600" /> Administrative Audit Trail
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">System-wide authentication, user actions & inquiry management log ({auditLogList.length} entries)</p>
                          </div>
                          <button onClick={() => loadAuditLogSilent()} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer">
                            <RefreshCw size={13} /> Refresh Log
                          </button>
                        </div>

                        {auditLogList.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center font-mono text-xs text-slate-400 shadow-sm">
                            No audit log entries recorded yet.
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                                <tbody className="divide-y divide-slate-100">
                                  {auditLogList.map((log: any) => {
                                    const action = log.action;
                                    const isRevoked = log.revoked === 1;

                                    return (
                                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                          {new Date(log.timestamp).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                                            action === "login_success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            action === "login_failed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                            action === "logout" ? "bg-slate-100 text-slate-700 border-slate-200" :
                                            action === "inquiry_deleted" ? "bg-amber-50 text-amber-800 border-amber-200" :
                                            action === "wipe_all" ? "bg-rose-100 text-rose-900 border-rose-300" :
                                            action === "inquiry_restored" ? "bg-emerald-100 text-emerald-900 border-emerald-300" :
                                            "bg-indigo-50 text-indigo-700 border-indigo-200"
                                          }`}>
                                            {action}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-slate-900">
                                          {log.performed_by} <span className="text-[10px] text-slate-400 font-normal">({log.performed_by_role})</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                                          {log.target_id && <strong className="text-slate-900 font-bold">[{log.target_id}] </strong>}
                                          <span className="text-slate-500">{log.target_data || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                          {isRevoked ? (
                                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-200 uppercase">
                                              Revoked / Restored
                                            </span>
                                          ) : (
                                            <span className="text-emerald-600 font-bold text-[10px]">Active Event</span>
                                          )}
                                        </td>
                                        {canRevokeAuditLog && (
                                          <td className="px-4 py-3 text-right space-x-2">
                                            {action === "inquiry_deleted" && !isRevoked && (
                                              <button
                                                onClick={() => handleRevokeAuditLog(log.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-sm"
                                              >
                                                Revoke & Restore
                                              </button>
                                            )}
                                            {canEditAuditLog && (
                                              <button
                                                onClick={() => {
                                                  setEditingAuditLogId(log.id);
                                                  setEditingAuditLogData(log.target_data || "");
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 cursor-pointer"
                                                title="Edit payload string"
                                              >
                                                <Edit3 size={14} />
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
                          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                              <h3 className="text-sm font-bold text-slate-900 font-serif">Edit Audit Entry Payload #{editingAuditLogId}</h3>
                              <textarea
                                value={editingAuditLogData}
                                onChange={(e) => setEditingAuditLogData(e.target.value)}
                                rows={4}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingAuditLogId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                                  Cancel
                                </button>
                                <button onClick={handleSaveAuditEdit} disabled={isSavingAuditEdit} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                                  {isSavingAuditEdit ? "Saving..." : "Save Payload"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ══ 3. USERS TAB (Superadmin Only) ═════════════════════════════════ */}
                    {adminActiveTab === "users" && (
                      <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                          <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                            <Users size={20} className="text-indigo-600" /> Admin User Accounts
                          </h2>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">Manage portal administrators, reset passwords, or trigger impersonation sessions</p>
                        </div>

                        {/* Admin Users List Table */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="divide-y divide-slate-100 font-mono text-xs">
                            {adminUsersList.map(u => {
                              const isSelf = u.username.toLowerCase() === adminUsername.toLowerCase();
                              const isSuper = u.role === "Superadmin";
                              const isResetOpen = !!showResetRow[u.username];

                              return (
                                <div key={u.username} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-[#14213D] text-[#C9A227] flex items-center justify-center font-bold border border-slate-700 shadow-sm shrink-0">
                                        {isSuper ? <Crown size={18} /> : <User size={18} />}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-slate-900">{u.username}</span>
                                          {isSelf && <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold px-1.5 py-0.5 rounded">YOU</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Role: <strong className="text-slate-700">{u.role}</strong> · Registered: {new Date(u.created_at || Date.now()).toLocaleDateString("en-IN")}</p>
                                      </div>
                                    </div>

                                    {/* Row Buttons */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <button
                                        onClick={() => setShowResetRow(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                                      >
                                        Reset Password
                                      </button>
                                      {!isSelf && (
                                        <button
                                          onClick={() => handleImpersonate(u.username)}
                                          disabled={isImpersonating[u.username]}
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                                        >
                                          {isImpersonating[u.username] ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                                          <span>Login As</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inline Reset Password Form */}
                                  {isResetOpen && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2 border-t border-slate-100 flex items-center gap-3">
                                      <input
                                        type="password"
                                        placeholder="Enter new password for user..."
                                        value={userResetPasswords[u.username] || ""}
                                        onChange={(e) => setUserResetPasswords({ ...userResetPasswords, [u.username]: e.target.value })}
                                        className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                      />
                                      <button
                                        onClick={() => handleResetUserPassword(u.username)}
                                        disabled={isResettingPw[u.username]}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-sm"
                                      >
                                        {isResettingPw[u.username] ? "Saving..." : "Confirm Reset"}
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ 4. SETTINGS TAB (Superadmin Only) ═══════════════════════════════ */}
                    {adminActiveTab === "settings" && (
                      <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                          <h2 className="text-lg font-bold text-slate-900 font-serif">Delivery Engines & Settings</h2>
                          <p className="text-xs text-slate-500 font-mono">Control email routing, API keys & WhatsApp configuration</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <div>
                              <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Email Delivery Channel</label>
                              <select
                                value={adminSettings.emailProvider}
                                onChange={(e) => setAdminSettings({ ...adminSettings, emailProvider: e.target.value })}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-mono focus:outline-none"
                              >
                                <option value="web3forms">Web3Forms Secure API (Recommended)</option>
                                <option value="brevo">Brevo Transactional API</option>
                                <option value="formsubmit">FormSubmit Tunnel</option>
                                <option value="smtp">Nodemailer SMTP Relay</option>
                              </select>
                            </div>

                            {adminSettings.emailProvider === "web3forms" && (
                              <div>
                                <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Web3Forms Access Key</label>
                                <input
                                  type="text"
                                  placeholder="Paste Web3Forms Key here..."
                                  value={adminSettings.web3formsKey || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, web3formsKey: e.target.value })}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Recipient Notification Inbox</label>
                              <input
                                type="email"
                                value={adminSettings.inquiryRecipient || ""}
                                onChange={(e) => setAdminSettings({ ...adminSettings, inquiryRecipient: e.target.value })}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <div>
                              <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">School WhatsApp Phone</label>
                              <input
                                type="text"
                                placeholder="919999999999"
                                value={adminSettings.whatsappPhone || ""}
                                onChange={(e) => setAdminSettings({ ...adminSettings, whatsappPhone: e.target.value })}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button onClick={handleTestEmail} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer">
                            Test Email
                          </button>
                          <button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl cursor-pointer">
                            Save Settings
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ══ 5. MY PROFILE TAB (All Roles) ══════════════════════════════════ */}
                    {adminActiveTab === "my_profile" && (
                      <motion.div key="my_profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Profile Info Header Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#14213D] text-[#C9A227] flex items-center justify-center border-2 border-[#C9A227] shadow-inner font-bold text-lg">
                              {adminUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 font-serif">{adminUsername}</h3>
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                                  {adminRole}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">Active Admin Console Profile</p>
                            </div>
                          </div>
                        </div>

                        {/* Password Change Form Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-lg space-y-4">
                          <h3 className="text-sm font-bold font-serif text-slate-900">Change Account Password</h3>
                          
                          <div>
                            <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Current Password</label>
                            <div className="relative">
                              <input
                                type={showCurrentPw ? "text" : "password"}
                                placeholder="Enter current password..."
                                value={changePwCurrent}
                                onChange={(e) => setChangePwCurrent(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 pr-10 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                            <div className="relative">
                              <input
                                type={showNewPw ? "text" : "password"}
                                placeholder="Enter new password..."
                                value={changePwNew}
                                onChange={(e) => setChangePwNew(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 pr-10 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                            <div className="relative">
                              <input
                                type={showConfirmPw ? "text" : "password"}
                                placeholder="Confirm new password..."
                                value={changePwConfirm}
                                onChange={(e) => setChangePwConfirm(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 pr-10 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2 w-full"
                          >
                            {isChangingPassword ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                            <span>Update Password</span>
                          </button>
                        </div>

                        {/* Password History Table (Self) */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <History size={14} className="text-indigo-600" /> My Password Change History ({passwordHistory.length})
                            </span>
                            <button onClick={() => loadPasswordHistorySilent()} className="text-slate-400 hover:text-slate-600 transition-colors">
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
                                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                                  <tr>
                                    <th className="px-5 py-3">Timestamp</th>
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Changed By</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {passwordHistory.map((h: any) => (
                                    <tr key={h.id || h.changed_at} className="hover:bg-slate-50/60">
                                      <td className="px-5 py-3 text-slate-600">
                                        {new Date(h.changed_at).toLocaleString("en-IN")}
                                      </td>
                                      <td className="px-5 py-3 font-bold text-slate-900">{h.username}</td>
                                      <td className="px-5 py-3 text-indigo-600 font-bold">{h.changed_by}</td>
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
              </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
