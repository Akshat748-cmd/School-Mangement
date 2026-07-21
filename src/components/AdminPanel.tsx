import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Lock, Eye, EyeOff, LogOut, Users, Key,
  History, Settings, ClipboardList, RefreshCw, Download,
  Trash2, ChevronDown, ChevronUp, Phone, Mail, MessageSquare,
  Loader2, CheckCircle, XCircle, AlertTriangle, Bell,
  BarChart3, UserPlus, RotateCcw, X, ShieldAlert, TestTube,
  HelpCircle, Crown, User
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => !!sessionStorage.getItem("admin_token"));
  const [mustChangePassword, setMustChangePassword] = useState(false);
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
  const [adminActiveTab, setAdminActiveTab] = useState<"inquiries" | "settings" | "changepassword" | "passwordhistory" | "accounts">("inquiries");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");

  // ─── Password History & Account Management ──────────────────────────────────
  const [passwordHistory, setPasswordHistory] = useState<any[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number | string, boolean>>({});
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountRole, setNewAccountRole] = useState("Chairman");
  const [returnedTempPassword, setReturnedTempPassword] = useState("");
  const [returnedTempUsername, setReturnedTempUsername] = useState("");
  const [accountsError, setAccountsError] = useState("");
  const [accountsSuccess, setAccountsSuccess] = useState("");

  // ─── Analytics ──────────────────────────────────────────────────────────────
  const [isClosing, setIsClosing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedInquiries, setExpandedInquiries] = useState<Record<string, boolean>>({});
  const [inquiryFilter, setInquiryFilter] = useState<"all" | "unread" | "last7" | "last30">("all");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<"all" | "pending" | "contacted" | "done">("all");
  const [inquirySort, setInquirySort] = useState<"newest" | "oldest" | "pending_first" | "done_last">("newest");

  // ─── Password Change ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  // ─── UI-Only States ───────────────────────────────────────────────────────────
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [isAdminAuthenticated, sessionToken]);

  // ─── Notification Permission ──────────────────────────────────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ─── Analytics Polling ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdminAuthenticated || !sessionToken || mustChangePassword) return;
    let prevUnread = unreadCount;
    const poll = async () => {
      try {
        const response = await adminFetch("/api/admin/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          const newUnread = data.unreadCount;
          setAnalyticsData(data);
          setUnreadCount(newUnread);
          if (newUnread > prevUnread) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("New Inquiry Received", {
                body: `You have ${newUnread - prevUnread} new unread inquiries.`,
                icon: "/assets/logo.jpeg"
              });
            }
            refreshInquiriesSilent();
          }
          prevUnread = newUnread;
        }
      } catch (err) {
        console.error("Polling analytics error:", err);
      }
    };
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, sessionToken, mustChangePassword, unreadCount]);

  // ─── Fetch Wrapper ────────────────────────────────────────────────────────────
  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const headers = { ...options.headers, "Authorization": `Bearer ${sessionToken}` };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout("Logged out due to inactivity — please log in again.");
      throw new Error("Session expired.");
    }
    return res;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = async (message = "") => {
    if (sessionToken) {
      fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      }).catch(() => { });
    }
    setSessionToken("");
    setAdminRole("");
    setAdminUsername("");
    setAdminActiveTab("inquiries");
    setIsAdminAuthenticated(false);
    setMustChangePassword(false);
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_role");
    sessionStorage.removeItem("admin_username");
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
    if (message) {
      showToast(message, "warning");
    } else {
      showToast("Logged out successfully.", "success");
    }
  };

  const refreshInquiriesSilent = async () => {
    try {
      const response = await adminFetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (response.ok && data.success) setAdminInquiries(data.inquiries);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminLogin = async () => {
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
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
        setSessionToken(data.token);
        setAdminRole(data.role);
        setAdminUsername(data.username);
        setMustChangePassword(data.mustChangePassword);
        setIsAdminAuthenticated(true);
        setAdminPasswordInput("");
        if (!data.mustChangePassword) {
          loadDashboardData(data.token);
        }
      } else {
        setAdminErrorMsg(data.message || "Invalid username or password.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Connection failed: " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchPasswordHistory = async (token = sessionToken) => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/password-history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setPasswordHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch password history:", err);
    }
  };

  const fetchAdminAccounts = async (token = sessionToken) => {
    if (!token) return;
    const userRole = sessionStorage.getItem("admin_role") || adminRole;
    if (userRole !== "Superadmin") return;
    try {
      const res = await fetch("/api/admin/accounts", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setAdminAccounts(data.accounts || []);
    } catch (err) {
      console.error("Failed to fetch admin accounts:", err);
    }
  };

  const loadDashboardData = async (token: string) => {
    try {
      const inquiriesRes = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const inquiriesData = await inquiriesRes.json();
      if (inquiriesRes.ok && inquiriesData.success) setAdminInquiries(inquiriesData.inquiries);

      const userRole = sessionStorage.getItem("admin_role") || adminRole;
      if (userRole === "Superadmin") {
        const settingsRes = await fetch("/api/admin/settings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const settingsData = await settingsRes.json();
        if (settingsRes.ok && settingsData.success) setAdminSettings(settingsData.settings);
        fetchAdminAccounts(token);
      }

      fetchPasswordHistory(token);

      const analyticsRes = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const aData = await analyticsRes.json();
      if (analyticsRes.ok && aData.success) {
        setAnalyticsData(aData);
        setUnreadCount(aData.unreadCount);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    if (sessionToken && !mustChangePassword) loadDashboardData(sessionToken);
  }, [sessionToken, mustChangePassword]);

  const handleSaveSettings = async () => {
    try {
      const response = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: adminSettings })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Settings saved successfully! Server-side dispatch updated.", "success");
        setAdminSettings(data.settings);
      } else {
        showToast(data.message || "Failed to save settings.", "error");
      }
    } catch (err: any) {
      showToast("Error saving settings: " + err.message, "error");
    }
  };

  const handleTestEmail = async () => {
    showToast("Testing email delivery...", "warning");
    try {
      const response = await adminFetch("/api/admin/test-email");
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`✅ Test email sent via ${data.provider}! To: ${data.recipient || adminSettings.inquiryRecipient}`, "success");
      } else {
        const errorDetail = data.rawError || data.error || data.message || JSON.stringify(data);
        showToast(`❌ Failed (${data.provider || "Provider"} ${data.statusCode || response.status}): ${errorDetail}`, "error");
      }
    } catch (err: any) {
      showToast("Error invoking test email endpoint: " + err.message, "error");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const response = await adminFetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
        showToast("Inquiry deleted from database logs.", "success");
      }
    } catch (err: any) {
      showToast("Error deleting inquiry: " + err.message, "error");
    }
  };

  const handleClearAllInquiries = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to permanently delete ALL inquiry logs? This cannot be undone!")) return;
    try {
      const response = await adminFetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries([]);
        showToast("All inquiry logs have been cleared.", "success");
      }
    } catch (err: any) {
      showToast("Error wiping database logs: " + err.message, "error");
    }
  };

  const refreshInquiries = async () => {
    try {
      const response = await adminFetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
        showToast("Data reloaded from database.", "success");
      }
      const analyticsRes = await adminFetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const aData = await analyticsRes.json();
      if (aData.success) {
        setAnalyticsData(aData);
        setUnreadCount(aData.unreadCount);
      }
      fetchPasswordHistory();
      fetchAdminAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setAdminInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: 1 } : inq));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setAnalyticsData((prev: any) => {
      if (!prev) return prev;
      return { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) };
    });
    try {
      await adminFetch("/api/admin/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error("Failed to mark inquiry as read on server:", err);
    }
  };

  const handleUpdateStatus = async (inquiryId: string, status: "pending" | "contacted" | "done") => {
    // Optimistic local state update
    setAdminInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status } : inq));
    
    // Also show a temporary success toast
    showToast(`Status marked as ${status}`, "success");

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

  const toggleInquiryExpand = (id: string, isRead: number) => {
    setExpandedInquiries(prev => ({ ...prev, [id]: !prev[id] }));
    if (isRead === 0) handleMarkAsRead(id);
  };

  const handleExportCSV = () => {
    if (!adminInquiries || adminInquiries.length === 0) {
      showToast("No inquiries available to export.", "warning");
      return;
    }
    const headers = ["Name", "Phone", "Email", "Message", "Context", "Timestamp", "Dispatch Status"];
    const escapeCsvValue = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) return `"${str}"`;
      return str;
    };
    const csvRows = [
      headers.join(","),
      ...adminInquiries.map(inq => [
        escapeCsvValue(inq.name), escapeCsvValue(inq.phone), escapeCsvValue(inq.email),
        escapeCsvValue(inq.message), escapeCsvValue(inq.context),
        escapeCsvValue(inq.timestamp), escapeCsvValue(inq.dispatchStatus)
      ].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `amps-inquiries-${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`CSV exported: amps-inquiries-${dateStr}.csv`, "success");
  };

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); setIsAdminAuthenticated(false); setAdminPasswordInput(""); setIsClosing(false); }, 250);
  };

  const getFilteredInquiries = () => {
    // 1. Time / Read Filtering
    let list = adminInquiries.filter((inq: any) => {
      if (inquiryFilter === "unread") return inq.isRead === 0;
      if (inquiryFilter === "last7") return new Date(inq.timestamp).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (inquiryFilter === "last30") return new Date(inq.timestamp).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000;
      return true;
    });

    // 2. Status Filtering
    if (inquiryStatusFilter !== "all") {
      list = list.filter((inq: any) => {
        const inqStatus = inq.status || "pending";
        return inqStatus === inquiryStatusFilter;
      });
    }

    // 3. Sorting
    list = [...list].sort((a: any, b: any) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      if (inquirySort === "newest") {
        return timeB - timeA;
      }
      if (inquirySort === "oldest") {
        return timeA - timeB;
      }
      if (inquirySort === "pending_first") {
        const getOrder = (status: string) => {
          const s = status || "pending";
          if (s === "pending") return 1;
          if (s === "contacted") return 2;
          return 3;
        };
        const orderA = getOrder(a.status);
        const orderB = getOrder(b.status);
        if (orderA !== orderB) return orderA - orderB;
        return timeB - timeA; // tie-breaker: newest first
      }
      if (inquirySort === "done_last") {
        const getOrder = (status: string) => {
          const s = status || "pending";
          if (s === "done") return 2;
          return 1;
        };
        const orderA = getOrder(a.status);
        const orderB = getOrder(b.status);
        if (orderA !== orderB) return orderA - orderB;
        return timeB - timeA; // tie-breaker: newest first
      }
      return 0;
    });

    return list;
  };
  const filteredInquiries = getFilteredInquiries();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");
    if (newPassword.length < 8) { setChangePasswordError("New password must be at least 8 characters long."); return; }
    if (newPassword !== confirmNewPassword) { setChangePasswordError("New passwords do not match."); return; }
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePasswordSuccess("Password changed successfully.");
        setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
        fetchPasswordHistory();
        if (mustChangePassword) { setMustChangePassword(false); loadDashboardData(sessionToken); }
        showToast("Password updated successfully!", "success");
      } else {
        setChangePasswordError(data.message || "Failed to change password.");
      }
    } catch (err: any) {
      setChangePasswordError(err.message || "An error occurred.");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountsError(""); setAccountsSuccess(""); setReturnedTempPassword(""); setReturnedTempUsername("");
    if (!newAccountUsername.trim()) { setAccountsError("Username is required."); return; }
    try {
      const res = await adminFetch("/api/admin/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newAccountUsername, role: newAccountRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountsSuccess(`Account created for ${data.username}!`);
        setReturnedTempPassword(data.tempPassword);
        setReturnedTempUsername(data.username);
        setNewAccountUsername("");
        fetchAdminAccounts(); fetchPasswordHistory();
        showToast(`Account created for ${data.username}!`, "success");
      } else {
        setAccountsError(data.message || "Failed to create account.");
      }
    } catch (err: any) {
      setAccountsError(err.message || "An error occurred.");
    }
  };

  const handleResetPassword = async (username: string) => {
    if (!window.confirm(`Are you sure you want to reset the password for: ${username}?`)) return;
    setAccountsError(""); setAccountsSuccess(""); setReturnedTempPassword(""); setReturnedTempUsername("");
    try {
      const res = await adminFetch("/api/admin/accounts/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountsSuccess(`Password reset for ${data.username}!`);
        setReturnedTempPassword(data.tempPassword);
        setReturnedTempUsername(data.username);
        fetchAdminAccounts(); fetchPasswordHistory();
        showToast(`Password reset for ${data.username}!`, "success");
      } else {
        setAccountsError(data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setAccountsError(err.message || "An error occurred.");
    }
  };

  const handleDeleteAccount = async (username: string) => {
    if (username === adminUsername) { alert("You cannot delete your own logged-in account!"); return; }
    if (!window.confirm(`CRITICAL: Permanently delete account: ${username}? This also deletes their active sessions.`)) return;
    setAccountsError(""); setAccountsSuccess(""); setReturnedTempPassword(""); setReturnedTempUsername("");
    try {
      const res = await adminFetch("/api/admin/accounts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountsSuccess(`Account ${username} deleted.`);
        fetchAdminAccounts();
        showToast(`Account ${username} deleted.`, "success");
      } else {
        setAccountsError(data.message || "Failed to delete account.");
      }
    } catch (err: any) {
      setAccountsError(err.message || "An error occurred.");
    }
  };

  const togglePasswordReveal = (id: number | string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Role Card Config ─────────────────────────────────────────────────────────
  const roleCards = [
    { value: "superadmin", label: "Superadmin", icon: ShieldAlert, desc: "Full system access" },
    { value: "chairman", label: "Chairman", icon: Crown, desc: "Board oversight" },
    { value: "administrator", label: "Administrator", icon: Settings, desc: "Portal management" },
    { value: "principal", label: "Principal", icon: User, desc: "Academic oversight" },
  ];

  // ─── Sidebar Nav Config ───────────────────────────────────────────────────────
  const navItems = [
    { key: "inquiries", label: "Inquiries", icon: ClipboardList, badge: unreadCount > 0 ? unreadCount : null },
    { key: "settings", label: "Delivery Engines", icon: Settings, superadminOnly: true },
    { key: "changepassword", label: "Change Password", icon: Key },
    { key: "passwordhistory", label: "Password History", icon: History },
    ...(adminRole === "Superadmin" ? [{ key: "accounts", label: "Manage Accounts", icon: Users }] : []),
  ];

  // ─── Password Field Helper ────────────────────────────────────────────────────
  const PwField = ({
    label, value, onChange, show, onToggle, required = true, placeholder = ""
  }: {
    label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggle: () => void; required?: boolean; placeholder?: string;
  }) => (
    <div>
      <label className="block text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 pr-11 text-sm font-mono text-slate-800 focus:outline-none focus:border-brass-gold focus:bg-white focus:ring-1 focus:ring-brass-gold/30 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[250] flex flex-col w-screen h-screen overflow-hidden"
          style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
        >

          {/* ── Toast Notifications ───────────────────────────────────────────── */}
          <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-sm border backdrop-blur-sm ${toast.type === "success" ? "bg-emerald-900/95 border-emerald-700/50 text-emerald-100" :
                    toast.type === "error" ? "bg-rose-900/95 border-rose-700/50 text-rose-100" :
                      "bg-amber-900/95 border-amber-700/50 text-amber-100"
                    }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {toast.type === "success" ? <CheckCircle size={16} /> :
                      toast.type === "error" ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <p className="text-xs font-medium leading-relaxed flex-1">{toast.msg}</p>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="shrink-0 text-white/50 hover:text-white transition-colors cursor-pointer mt-0.5"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* LOGIN SCREEN */}
          {!isAdminAuthenticated ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0ece4" }} className="p-3 md:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col md:flex-row w-full max-w-[820px] overflow-hidden border border-[#e2d9cc] rounded-lg md:rounded-xl shadow-none md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-[#faf8f4]"
              >
                {/* LEFT PANEL */}
                <div 
                  className="w-full md:w-[40%] shrink-0 flex flex-col items-center justify-center text-center p-5 md:p-[40px_28px] border-b-4 md:border-b-0 md:border-r-4 border-[#C9A227]"
                  style={{ background: "#14213D" }}
                >
                  {/* Crest */}
                  <div className="w-[64px] h-[64px] md:w-[84px] md:h-[84px] rounded-full border-2 border-[#C9A227] overflow-hidden mb-3 md:mb-5 shrink-0">
                    <img src="/assets/crest.png" alt="AMPS Crest" onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo.jpeg"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  {/* School name */}
                  <p style={{ fontFamily: "Georgia, serif", color: "#ffffff", lineHeight: 1.4 }} className="text-xs md:text-sm mb-1 md:mb-1.5">Ashish Memorial Public Sr. Sec. School</p>
                  <p style={{ fontFamily: "monospace", color: "#C9A227", fontSize: 9, textTransform: "uppercase", letterSpacing: 2 }} className="mb-2 md:mb-5">Administration Portal</p>

                  {/* Gold divider - Hidden on mobile */}
                  <div className="hidden md:block" style={{ width: "80%", height: 1, background: "rgba(201,162,39,0.25)", marginBottom: 20 }} />

                  {/* Feature bullets - Hidden on mobile */}
                  <div className="hidden md:flex flex-col gap-2.5 w-full text-left">
                    {[
                      { icon: Lock, text: "256-bit bcrypt encrypted sessions" },
                      { icon: Bell, text: "Real-time inquiry notifications" },
                      { icon: BarChart3, text: "Analytics and delivery tracking" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={13} style={{ color: "#C9A227", flexShrink: 0 }} />
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <p style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.2)", fontSize: 9 }} className="mt-2 md:mt-8">Hindaun City, Rajasthan · Est. 2005</p>
                </div>

                {/* RIGHT PANEL */}
                <div 
                  className="flex-1 border-t-4 md:border-t-0 border-[#C9A227] p-5 md:p-[2rem_1.5rem] flex flex-col justify-center relative bg-[#faf8f4]"
                >
                  {/* Close button */}
                  <button
                    onClick={handleModalClose}
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6, lineHeight: 1 }}
                  >
                    <X size={16} />
                  </button>

                  {/* Heading */}
                  <p style={{ fontFamily: "monospace", color: "#C9A227", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Secure Sign In</p>
                  <h2 style={{ fontFamily: "Georgia, serif", color: "#14213D", fontWeight: 500, wordBreak: "break-word", overflowWrap: "break-word" }} className="text-base md:text-lg mb-4 md:mb-5 leading-tight">
                    Select your role and enter credentials
                  </h2>

                  {/* Role Cards */}
                  <p style={{ fontFamily: "monospace", color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Select Role</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                    {roleCards.map(card => {
                      const Icon = card.icon;
                      const isSelected = adminUsernameInput === card.value;
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => setAdminUsernameInput(card.value)}
                          className="flex items-center gap-1.5 md:gap-2.5 rounded-lg cursor-pointer text-left transition-all p-2 md:p-[10px_12px]"
                          style={{
                            background: isSelected ? "#fdf8ec" : "#ffffff",
                            border: isSelected ? "2px solid #C9A227" : "1px solid #e2d9cc",
                            borderLeft: isSelected ? "4px solid #C9A227" : "1px solid #e2d9cc",
                            minWidth: 0
                          }}
                        >
                          <Icon size={14} style={{ color: isSelected ? "#C9A227" : "#64748b", flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: "#14213D", fontWeight: 500, margin: 0 }} className="text-[11px] md:text-xs leading-snug truncate">{card.label}</p>
                            <p style={{ color: "#94a3b8", margin: 0 }} className="text-[9px] md:text-[10px] leading-snug truncate">{card.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Password Field */}
                  <p style={{ fontFamily: "monospace", color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Password</p>
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <input
                      id="admin-login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      placeholder="Enter password..."
                      style={{ width: "100%", background: "#ffffff", border: "1px solid #d1c9bc", borderRadius: 8, padding: "10px 40px 10px 12px", fontSize: 13, color: "#14213D", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(v => !v)}
                      tabIndex={-1}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, lineHeight: 1 }}
                    >
                      {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Forgot Password */}
                  <div style={{ marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#8B1E3F", fontSize: 11, fontFamily: "monospace", padding: 0 }}
                    >
                      <HelpCircle size={11} />
                      Forgot password?
                    </button>
                    <AnimatePresence>
                      {showForgotPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ marginTop: 8, background: "#fff8f0", border: "1px solid #e2d9cc", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
                            <p style={{ margin: "0 0 4px", color: "#14213D", fontWeight: 600 }}>Password Recovery</p>
                            <p style={{ margin: 0 }}>To reset your password, please contact the Superadmin. The Superadmin can reset any account password from the <strong>Accounts Management</strong> section.</p>
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(false)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#8B1E3F", fontSize: 10, fontFamily: "monospace", padding: 0, marginTop: 6, textDecoration: "underline" }}
                            >
                              ← Back to login
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error / Success */}
                  <AnimatePresence>
                    {adminErrorMsg && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 11, color: "#dc2626", marginBottom: 10, margin: "0 0 10px" }}>
                        {adminErrorMsg}
                      </motion.p>
                    )}
                    {adminSuccessMsg && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 11, color: "#16a34a", marginBottom: 10, margin: "0 0 10px" }}>
                        {adminSuccessMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Authenticate Button */}
                  <button
                    id="admin-login-btn"
                    onClick={handleAdminLogin}
                    disabled={isLoggingIn}
                    style={{
                      width: "100%", background: "#14213D", color: "#ffffff",
                      border: "1px solid #C9A227", borderRadius: 8, padding: 12,
                      fontFamily: "monospace", fontSize: 11, textTransform: "uppercase",
                      letterSpacing: 1.5, cursor: isLoggingIn ? "not-allowed" : "pointer",
                      opacity: isLoggingIn ? 0.7 : 1, display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8, transition: "opacity 0.2s"
                    }}
                  >
                    {isLoggingIn ? (
                      <div className="animate-spin" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #ffffff" }} />
                    ) : (
                      <Lock size={13} />
                    )}
                    {isLoggingIn ? "Authenticating..." : "Authenticate Console"}
                  </button>

                  {/* Footer note */}
                  <p style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 10, textAlign: "center", marginTop: 14 }}>
                    Authorized personnel only · Session expires after 20 min inactivity
                  </p>
                </div>
              </motion.div>
            </div>

            /* ════════════════════════════════════════════════════════════════════ */
            /* FORCE PASSWORD CHANGE SCREEN                                        */
            /* ════════════════════════════════════════════════════════════════════ */
          ) : mustChangePassword ? (
            <div
              className="flex-1 flex items-center justify-center p-4 overflow-y-auto"
              style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #111827 100%)" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-white/10"
                style={{ background: "#111827" }}
              >
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c)" }} />
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: "linear-gradient(135deg, #c9a84c20, #c9a84c40)", border: "1px solid #c9a84c40" }}
                    >
                      <Key size={26} style={{ color: "#c9a84c" }} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Password Change Required</h2>
                    <p className="text-sm text-white/40">
                      Set a permanent password to access your portal.
                    </p>
                  </div>

                  <AnimatePresence>
                    {changePasswordError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 flex items-start gap-2 bg-rose-900/40 border border-rose-700/40 text-rose-300 px-3 py-2.5 rounded-lg text-xs font-medium"
                      >
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        {changePasswordError}
                      </motion.div>
                    )}
                    {changePasswordSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 flex items-start gap-2 bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 px-3 py-2.5 rounded-lg text-xs font-medium"
                      >
                        <CheckCircle size={14} className="shrink-0 mt-0.5" />
                        {changePasswordSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold font-mono text-white/40 uppercase tracking-widest mb-1.5">Current / Temporary Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-mono text-white placeholder-white/20 focus:outline-none transition-all"
                          style={{ background: "#1a2540", border: "1px solid rgba(255,255,255,0.12)" }}
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer" tabIndex={-1}>
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold font-mono text-white/40 uppercase tracking-widest mb-1.5">New Password (Min 8 chars)</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-mono text-white placeholder-white/20 focus:outline-none transition-all"
                          style={{ background: "#1a2540", border: "1px solid rgba(255,255,255,0.12)" }}
                        />
                        <button type="button" onClick={() => setShowNewPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer" tabIndex={-1}>
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold font-mono text-white/40 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                          className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-mono text-white placeholder-white/20 focus:outline-none transition-all"
                          style={{ background: "#1a2540", border: "1px solid rgba(255,255,255,0.12)" }}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer" tabIndex={-1}>
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider mt-2 cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0a0f1e", boxShadow: "0 4px 20px rgba(201,168,76,0.25)" }}
                    >
                      <Key size={16} /> Update Password &amp; Enter
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>

            /* ════════════════════════════════════════════════════════════════════ */
            /* MAIN DASHBOARD                                                      */
            /* ════════════════════════════════════════════════════════════════════ */
          ) : (
            <div className="flex-1 overflow-hidden flex bg-slate-100">

              {/* ── Sidebar ──────────────────────────────────────────────────── */}
              <div className="hidden md:flex md:w-64 md:flex-col bg-[#0d1b3e] shrink-0 border-r border-white/10">
                {/* Sidebar Header */}
                <div className="px-5 py-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border-2 shrink-0" style={{ borderColor: "#c9a84c" }}>
                      <img src="/assets/logo.jpeg" alt="AMPS" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm leading-tight truncate">AMPS Portal</p>
                      <p className="text-[10px] font-mono truncate" style={{ color: "#c9a84c" }}>Admin Console</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/10 border border-white/15 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-white/60 font-mono uppercase tracking-widest mb-0.5">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{adminUsername}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 font-mono uppercase tracking-wider"
                      style={{ background: "#c9a84c30", color: "#f0d080", border: "1px solid #c9a84c60" }}>
                      {adminRole}
                    </span>
                  </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = adminActiveTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setAdminActiveTab(item.key as any);
                          setAdminErrorMsg(""); setAdminSuccessMsg("");
                          if (item.key === "inquiries") refreshInquiries();
                          else if (item.key === "passwordhistory") fetchPasswordHistory();
                          else if (item.key === "accounts") fetchAdminAccounts();
                          else if (item.key === "changepassword") { setChangePasswordError(""); setChangePasswordSuccess(""); }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer relative ${isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                          }`}
                        style={isActive ? {
                          background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                          border: "1px solid rgba(201,168,76,0.25)",
                          boxShadow: "inset 3px 0 0 #c9a84c"
                        } : {}}
                      >
                        <Icon size={16} style={{ color: isActive ? "#c9a84c" : "rgba(255,255,255,0.75)" }} />
                        <span className="flex-1 text-left text-xs font-semibold truncate">{item.label}</span>
                        {item.badge && (
                          <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Sidebar Footer: Logout + Close */}
                <div className="px-3 py-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => handleLogout()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                  <button
                    onClick={handleModalClose}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <X size={15} />
                    Close Panel
                  </button>
                </div>
              </div>

              {/* ── Mobile Top Bar ────────────────────────────────────────────── */}
              <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d1b3e] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border-2" style={{ borderColor: "#c9a84c" }}>
                    <img src="/assets/logo.jpeg" alt="AMPS" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs leading-tight">AMPS Portal</p>
                    <p className="text-[9px] font-mono" style={{ color: "#c9a84c" }}>{adminRole} · {adminUsername}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleLogout()}
                    className="text-rose-400 p-1.5 rounded-lg hover:bg-rose-900/30 cursor-pointer transition-colors">
                    <LogOut size={16} />
                  </button>
                  <button onClick={handleModalClose}
                    className="text-white/40 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1b3e] border-t border-white/10 flex">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = adminActiveTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setAdminActiveTab(item.key as any);
                        setAdminErrorMsg(""); setAdminSuccessMsg("");
                        if (item.key === "inquiries") refreshInquiries();
                        else if (item.key === "passwordhistory") fetchPasswordHistory();
                        else if (item.key === "accounts") fetchAdminAccounts();
                      }}
                      className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors cursor-pointer ${isActive ? "text-[#f0d080]" : "text-white/40"
                        }`}
                    >
                      <Icon size={15} />
                      <span className="text-[9px] font-bold uppercase tracking-wider truncate px-1">{item.label.split(" ")[0]}</span>
                      {item.badge && (
                        <span className="absolute top-1 right-1/4 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Main Content Area ─────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-16 md:pb-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={adminActiveTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 md:p-8 min-h-full"
                  >

                    {/* ══ INQUIRIES TAB ══════════════════════════════════════════ */}
                    {adminActiveTab === "inquiries" && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">Prospective Leads</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time database of all inquiry submissions</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={handleExportCSV}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                              <Download size={13} /> Export CSV
                            </button>
                            <button onClick={refreshInquiries}
                              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border border-slate-200 cursor-pointer transition-colors shadow-sm">
                              <RefreshCw size={13} /> Refresh
                            </button>
                            {adminRole === "Superadmin" ? (
                              <button onClick={handleClearAllInquiries}
                                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                                <Trash2 size={13} /> Wipe Logs
                              </button>
                            ) : (
                              <button disabled title="Superadmin only"
                                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-300 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-not-allowed">
                                <Trash2 size={13} /> Wipe Logs
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Analytics Cards */}
                        {analyticsData && (
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {[
                                { label: "Total Inquiries", value: analyticsData.totalInquiries, color: "text-indigo-600", filter: "all", accent: "border-indigo-200 bg-indigo-50/50" },
                                { label: "Unread", value: analyticsData.unreadCount, color: "text-rose-600", filter: "unread", accent: "border-rose-200 bg-rose-50/50" },
                                { label: "Last 7 Days", value: analyticsData.last7Days, color: "text-violet-600", filter: "last7", accent: "border-violet-200 bg-violet-50/50" },
                                { label: "Last 30 Days", value: analyticsData.last30Days, color: "text-emerald-600", filter: "last30", accent: "border-emerald-200 bg-emerald-50/50" },
                              ].map(stat => (
                                <motion.button
                                  key={stat.filter}
                                  whileHover={{ y: -2, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setInquiryFilter(stat.filter as any)}
                                  className={`text-left p-4 bg-white rounded-xl border shadow-sm transition-all cursor-pointer ${inquiryFilter === stat.filter ? stat.accent + " ring-1 ring-inset ring-current" : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                  {stat.filter === "unread" && analyticsData.unreadCount > 0 && (
                                    <span className="relative flex h-2 w-2 mt-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                                    </span>
                                  )}
                                </motion.button>
                              ))}
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <p className="text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-4">Daily Submission Trend (30 Days)</p>
                                <div className="h-48 flex items-end gap-[2px] border-b border-slate-100 pb-1 pt-4 relative">
                                  {analyticsData.dailyCounts.map((day: any) => {
                                    const maxVal = Math.max(...analyticsData.dailyCounts.map((d: any) => d.count), 1);
                                    const heightPct = (day.count / maxVal) * 100;
                                    return (
                                      <div key={day.date} className="flex-1 h-full flex items-end justify-center group relative">
                                        <motion.div
                                          initial={{ height: 0 }}
                                          animate={{ height: `${Math.max(heightPct, 3)}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut" }}
                                          className="w-full rounded-t transition-colors"
                                          style={{ background: "linear-gradient(180deg, #6366f1, #4f46e5)" }}
                                        />
                                        <div className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] font-mono px-2 py-1 rounded absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all z-10 shadow-md">
                                          {day.date}: {day.count}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-2">
                                  <span>{analyticsData.dailyCounts[0]?.date}</span>
                                  <span>{analyticsData.dailyCounts[14]?.date}</span>
                                  <span>{analyticsData.dailyCounts[29]?.date}</span>
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <p className="text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-5">Context Breakdown</p>
                                <div className="space-y-5">
                                  {[
                                    { key: "admission", label: "Admission", color: "#6366f1" },
                                    { key: "counselling", label: "Counselling", color: "#10b981" },
                                  ].map(ctx => {
                                    const val = analyticsData.byContext[ctx.key] || 0;
                                    const pct = analyticsData.totalInquiries > 0 ? Math.round((val / analyticsData.totalInquiries) * 100) : 0;
                                    return (
                                      <div key={ctx.key}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                          <span className="font-semibold text-slate-700">{ctx.label}</span>
                                          <span className="font-mono text-slate-400">{val} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: ctx.color }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-[9px] font-mono text-slate-400 text-center mt-5 pt-3 border-t border-slate-100 font-bold uppercase">
                                  Real-time interest tracking
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Filters and Sorts Panel */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
                          {/* Row 1: Time Filters & Sort Dropdown */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mr-1">Timeframe:</span>
                              {[
                                { key: "all", label: "All time" },
                                { key: "unread", label: "Unread" },
                                { key: "last7", label: "Last 7 days" },
                                { key: "last30", label: "Last 30 days" }
                              ].map(tf => {
                                const isActive = inquiryFilter === tf.key;
                                return (
                                  <button
                                    key={tf.key}
                                    onClick={() => setInquiryFilter(tf.key as any)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isActive 
                                        ? "bg-[#14213D] border-[#14213D] text-white" 
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                    }`}
                                  >
                                    {tf.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Sort:</span>
                              <select
                                value={inquirySort}
                                onChange={(e) => setInquirySort(e.target.value as any)}
                                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                              >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="pending_first">Pending first</option>
                                <option value="done_last">Done last</option>
                              </select>
                            </div>
                          </div>

                          {/* Row 2: Status Filters */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mr-1">Status:</span>
                            {[
                              { key: "all", label: "All" },
                              { key: "pending", label: "Pending" },
                              { key: "contacted", label: "Contacted" },
                              { key: "done", label: "Done" }
                            ].map(st => {
                              const isActive = inquiryStatusFilter === st.key;
                              return (
                                <button
                                  key={st.key}
                                  onClick={() => setInquiryStatusFilter(st.key as any)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isActive 
                                      ? "bg-[#14213D] border-[#14213D] text-white" 
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Active Filter Indicators Helper Banner */}
                        {(inquiryFilter !== "all" || inquiryStatusFilter !== "all") && (
                          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl text-xs flex justify-between items-center animate-fadeIn">
                            <span className="font-medium">
                              Active Filter: {inquiryFilter !== "all" ? `Timeframe (${inquiryFilter})` : ""} {inquiryFilter !== "all" && inquiryStatusFilter !== "all" ? " + " : ""} {inquiryStatusFilter !== "all" ? `Status (${inquiryStatusFilter})` : ""} ({filteredInquiries.length} results)
                            </span>
                            <button 
                              onClick={() => { setInquiryFilter("all"); setInquiryStatusFilter("all"); }}
                              className="font-bold underline hover:text-indigo-600 cursor-pointer"
                            >
                              Reset Filters
                            </button>
                          </div>
                        )}

                        {/* Inquiry Cards */}
                        {filteredInquiries.length === 0 ? (
                          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                            <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-bold text-slate-400">No inquiries found</p>
                            <p className="text-xs text-slate-300 mt-1">Try a different filter or submit a test inquiry.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredInquiries.map((inq: any) => {
                              const isExpanded = !!expandedInquiries[inq.id];
                              const isUnread = inq.isRead === 0;
                              const inqStatus = inq.status || "pending";
                              const opacityClass = inqStatus === "done" ? "opacity-60" : "opacity-100";
                              
                              let borderLeftStyle = "3px solid #C9A227"; // Default pending
                              if (inqStatus === "contacted") {
                                borderLeftStyle = "3px solid #1d4ed8";
                              } else if (inqStatus === "done") {
                                borderLeftStyle = "3px solid #16a34a";
                              }

                              return (
                                <motion.div
                                  key={inq.id}
                                  layout
                                  onClick={() => toggleInquiryExpand(inq.id, inq.isRead || 0)}
                                  className={`bg-white border rounded-xl shadow-sm flex flex-col p-4 gap-3 cursor-pointer transition-all hover:shadow-md border-slate-200 ${opacityClass}`}
                                  style={{ borderLeft: borderLeftStyle }}
                                >
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm">{inq.name}</span>
                                      {isUnread && (
                                        <motion.span
                                          animate={{ scale: [1, 1.07, 1] }}
                                          transition={{ repeat: Infinity, duration: 1.5 }}
                                          className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 border border-amber-200 rounded-md font-bold uppercase"
                                        >NEW</motion.span>
                                      )}
                                      
                                      {/* Status Badges */}
                                      {inqStatus === "pending" && (
                                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-[#fef3c7] text-[#92400e]">
                                          Pending
                                        </span>
                                      )}
                                      {inqStatus === "contacted" && (
                                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-[#dbeafe] text-[#1e40af]">
                                          Contacted
                                        </span>
                                      )}
                                      {inqStatus === "done" && (
                                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-[#dcfce7] text-[#166534]">
                                          Done
                                        </span>
                                      )}

                                      <span className={`text-[9px] px-2 py-0.5 border rounded-md font-bold uppercase ${inq.context === "counselling"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                        }`}>{inq.context}</span>
                                      <a href={`tel:${inq.phone}`} onClick={e => e.stopPropagation()}
                                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                        <Phone size={10} /> {inq.phone}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono shrink-0">
                                      <span>{new Date(inq.timestamp).toLocaleString("en-IN")}</span>
                                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </div>
                                  </div>

                                  <div onClick={(e) => isExpanded && e.stopPropagation()}>
                                    {!isExpanded ? (
                                      <p className="text-xs text-slate-500 truncate max-w-2xl">{inq.message}</p>
                                    ) : (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-3 pt-3 border-t border-slate-100"
                                      >
                                        <div className="flex flex-wrap gap-2">
                                          {inq.email && (
                                            <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200 rounded-md font-bold">
                                              <Mail size={10} /> {inq.email}
                                            </span>
                                          )}
                                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${inq.dispatchStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            inq.dispatchStatus === "Failed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                              "bg-amber-50 text-amber-700 border-amber-200"
                                            }`}>
                                            Dispatch: {inq.dispatchStatus}
                                          </span>
                                          {inq.dispatchedVia && (
                                            <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 border border-slate-200 rounded-md font-bold">
                                              via {inq.dispatchedVia}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-700 bg-slate-50 p-3 border-l-2 border-slate-300 rounded-lg font-sans leading-relaxed whitespace-pre-wrap">
                                          {inq.message}
                                        </p>
                                        {inq.dispatchError && (
                                          <div className="text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-[10px] font-mono break-all">
                                            <strong>Dispatch Error:</strong> {inq.dispatchError}
                                          </div>
                                        )}
                                        
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
                                          {/* Status Update Buttons */}
                                          <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mr-1">Status:</span>
                                            
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, "pending"); }}
                                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                                inqStatus === "pending"
                                                  ? "bg-[#d97706] text-white border border-[#d97706]"
                                                  : "bg-white text-[#d97706] border border-[#f59e0b]/40 hover:bg-amber-50"
                                              }`}
                                            >
                                              Mark Pending
                                            </button>
                                            
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, "contacted"); }}
                                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                                inqStatus === "contacted"
                                                  ? "bg-[#2563eb] text-white border border-[#2563eb]"
                                                  : "bg-white text-[#2563eb] border border-[#3b82f6]/40 hover:bg-blue-50"
                                              }`}
                                            >
                                              Mark Contacted
                                            </button>
                                            
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq.id, "done"); }}
                                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                                inqStatus === "done"
                                                  ? "bg-[#16a34a] text-white border border-[#16a34a]"
                                                  : "bg-white text-[#16a34a] border border-[#22c55e]/40 hover:bg-green-50"
                                              }`}
                                            >
                                              Mark Done
                                            </button>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex flex-wrap gap-2 sm:justify-end">
                                            <a href={`tel:${inq.phone}`} onClick={e => e.stopPropagation()}
                                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                                              <Phone size={11} /> Call
                                            </a>
                                            {inq.email && (
                                              <a href={`mailto:${inq.email}`} onClick={e => e.stopPropagation()}
                                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                                                <Mail size={11} /> Mail
                                              </a>
                                            )}
                                            <a href={`https://api.whatsapp.com/send?phone=91${inq.phone.replace(/[^0-9]/g, "")}&text=` + encodeURIComponent(`Hello ${inq.name}, we received your inquiry for Ashish Memorial Public School...`)}
                                              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                                              <MessageSquare size={11} /> WhatsApp
                                            </a>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteInquiry(inq.id); }}
                                              className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                                              <Trash2 size={11} /> Delete
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══ SETTINGS TAB ══════════════════════════════════════════ */}
                    {adminActiveTab === "settings" && (
                      adminRole !== "Superadmin" ? (
                        <div className="flex items-start gap-4 bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl max-w-lg">
                          <ShieldAlert size={20} className="shrink-0 mt-0.5 text-rose-500" />
                          <div>
                            <h4 className="font-bold text-base mb-1">Access Denied</h4>
                            <p className="text-sm text-rose-700">Superadmin access is required to configure delivery engines and portal settings.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">Delivery Engines</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Control email routing and bypass blocked SMTP network environments.</p>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Col 1 */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Email Delivery Channel</label>
                                <select value={adminSettings.emailProvider}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, emailProvider: e.target.value })}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all">
                                  <option value="web3forms">Web3Forms Secure API (Recommended)</option>
                                  <option value="brevo">Brevo Transactional API</option>
                                  <option value="formsubmit">FormSubmit Tunnel</option>
                                  <option value="smtp">Nodemailer SMTP Relay</option>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1.5">Web3Forms & Brevo bypass GCP Cloud Run port restrictions via HTTPS API.</p>
                              </div>

                              {adminSettings.emailProvider === "web3forms" && (
                                <div>
                                  <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Web3Forms Access Key</label>
                                  <input type="text" placeholder="Paste Web3Forms Key here..."
                                    value={adminSettings.web3formsKey || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, web3formsKey: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all" />
                                  <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                                    💡 <strong>Free key in 5 secs:</strong> Go to <a href="https://web3forms.com/#start" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">web3forms.com</a>, enter your email <strong>{adminSettings.inquiryRecipient || "admin@example.com"}</strong>, and paste the key above.
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Recipient Notification Inbox</label>
                                <input type="email" value={adminSettings.inquiryRecipient || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, inquiryRecipient: e.target.value })}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all" />
                              </div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">School WhatsApp Phone</label>
                                <input type="text" placeholder="919999999999"
                                  value={adminSettings.whatsappPhone || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, whatsappPhone: e.target.value })}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all" />
                                <p className="text-[10px] text-slate-400 mt-1.5">Country code + number, no "+" or spaces.</p>
                              </div>

                              <div>
                                <label className="block text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-1.5">Change Admin Security Key</label>
                                <input type="text" value={adminSettings.adminPassword || ""}
                                  onChange={(e) => setAdminSettings({ ...adminSettings, adminPassword: e.target.value })}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all" />
                              </div>

                              {adminSettings.emailProvider === "brevo" && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                  <p className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Brevo API Configuration</p>
                                  <input type="password" placeholder="xkeysib-..." value={adminSettings.brevoApiKey || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, brevoApiKey: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                  <input type="email" placeholder="sender@domain.com" value={adminSettings.brevoSenderEmail || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, brevoSenderEmail: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                  <input type="text" placeholder="AMPS Portal" value={adminSettings.brevoSenderName || "AMPS Portal"}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, brevoSenderName: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                </div>
                              )}

                              {adminSettings.emailProvider === "smtp" && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                                  <p className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">SMTP Relay Configuration</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                      <input type="text" placeholder="smtp.gmail.com" value={adminSettings.smtpHost || ""}
                                        onChange={(e) => setAdminSettings({ ...adminSettings, smtpHost: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                    </div>
                                    <input type="text" placeholder="465" value={adminSettings.smtpPort || "465"}
                                      onChange={(e) => setAdminSettings({ ...adminSettings, smtpPort: e.target.value })}
                                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                  </div>
                                  <input type="text" placeholder="email@domain.com" value={adminSettings.smtpUser || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, smtpUser: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                  <input type="password" placeholder="Gmail App Password" value={adminSettings.smtpPass || ""}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, smtpPass: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-5 flex flex-wrap gap-3">
                            <button onClick={handleTestEmail}
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors shadow-sm">
                              <TestTube size={14} /> Test Email Delivery
                            </button>
                            <button onClick={handleSaveSettings}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer transition-colors shadow-sm">
                              <CheckCircle size={14} /> Save Settings
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {/* ══ CHANGE PASSWORD TAB ═══════════════════════════════════ */}
                    {adminActiveTab === "changepassword" && (
                      <div className="space-y-6 max-w-md">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Change Security Key</h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Updating credentials for: <strong className="text-indigo-600 uppercase">{adminRole}</strong> ({adminUsername})
                          </p>
                        </div>

                        <AnimatePresence>
                          {changePasswordError && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium">
                              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {changePasswordError}
                            </motion.div>
                          )}
                          {changePasswordSuccess && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium">
                              <CheckCircle size={14} className="shrink-0 mt-0.5" /> {changePasswordSuccess}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form onSubmit={handleChangePassword} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                          <PwField label="Current Password" value={currentPassword} onChange={setCurrentPassword}
                            show={showCurrentPassword} onToggle={() => setShowCurrentPassword(v => !v)} />
                          <PwField label="New Password (min 8 chars)" value={newPassword} onChange={setNewPassword}
                            show={showNewPassword} onToggle={() => setShowNewPassword(v => !v)} />
                          <PwField label="Confirm New Password" value={confirmNewPassword} onChange={setConfirmNewPassword}
                            show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button type="submit"
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer transition-colors shadow-sm">
                              <Key size={14} /> Update Password
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ══ PASSWORD HISTORY TAB ══════════════════════════════════ */}
                    {adminActiveTab === "passwordhistory" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">Credentials Activity Log</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {adminRole === "Superadmin" ? "All accounts — full audit trail" : "Your account — personal audit trail only"}
                            </p>
                          </div>
                          <button onClick={() => fetchPasswordHistory()}
                            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                            <RefreshCw size={12} /> Refresh
                          </button>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                          {adminRole === "Superadmin" ? (
                            <div>
                              <p className="text-xs font-bold font-mono text-slate-600 uppercase tracking-widest mb-3">
                                Total Changes: {passwordHistory.length}
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {["Chairman", "Administrator", "Principal", "Superadmin"].map(role => (
                                  <div key={role} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{role}</p>
                                    <p className="text-lg font-black text-slate-800">
                                      {passwordHistory.filter(h => h.role === role).length}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-bold font-mono text-slate-600 uppercase tracking-widest">
                              Your password has been changed <span className="text-indigo-600 text-xl font-black">{passwordHistory.length}</span> time{passwordHistory.length !== 1 && "s"}
                            </p>
                          )}
                        </div>

                        {passwordHistory.length === 0 ? (
                          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                            <History size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-bold text-slate-400">No password history found</p>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest bg-slate-50">
                                    <th className="px-5 py-3">Date / Time</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Username</th>
                                    <th className="px-5 py-3">Password Record</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {passwordHistory.map((item: any) => {
                                    const isRevealed = !!revealedPasswords[item.id];
                                    return (
                                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70 text-xs transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                          {new Date(item.changedAt).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-5 py-3.5">
                                          <span className="font-bold text-slate-700">{item.role}</span>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-slate-600">{item.username}</td>
                                        <td className="px-5 py-3.5 font-mono">
                                          <div className="flex items-center gap-2">
                                            <span className={isRevealed ? "text-slate-800" : "text-slate-400 tracking-widest"}>
                                              {isRevealed ? item.newPassword : "••••••••"}
                                            </span>
                                            <button type="button" onClick={() => togglePasswordReveal(item.id)}
                                              className="text-slate-300 hover:text-slate-600 transition-colors cursor-pointer p-0.5 rounded"
                                              title={isRevealed ? "Hide" : "Reveal"}>
                                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══ MANAGE ACCOUNTS TAB ═══════════════════════════════════ */}
                    {adminActiveTab === "accounts" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Manage Accounts</h2>
                          <p className="text-xs text-slate-500 mt-0.5">Create, reset passwords, or delete console access accounts.</p>
                        </div>

                        <AnimatePresence>
                          {accountsSuccess && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium">
                              <CheckCircle size={14} className="shrink-0 mt-0.5" /> {accountsSuccess}
                            </motion.div>
                          )}
                          {accountsError && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium">
                              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {accountsError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {returnedTempPassword && (
                          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-2">
                            <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
                              <AlertTriangle size={15} /> Copy this temporary password now!
                            </p>
                            <p className="text-xs text-amber-700">
                              Temp password for <strong className="font-mono text-indigo-700">{returnedTempUsername}</strong>:
                            </p>
                            <div className="bg-white border border-amber-200 rounded-xl p-3 flex justify-between items-center max-w-sm">
                              <span className="font-mono text-sm font-bold text-slate-800">{returnedTempPassword}</span>
                              <button onClick={() => { navigator.clipboard.writeText(returnedTempPassword); showToast("Copied to clipboard!", "success"); }}
                                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors">
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-amber-600 font-medium">It will NOT be shown again. User must change it on next login.</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Create Account Form */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm h-fit">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                              <UserPlus size={15} className="text-indigo-500" /> Create New Account
                            </h3>
                            <form onSubmit={handleCreateAccount} className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                                <input type="text" placeholder="e.g. principal_new" value={newAccountUsername}
                                  onChange={(e) => setNewAccountUsername(e.target.value)}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-400 transition-all" required />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Role Privilege</label>
                                <select value={newAccountRole} onChange={(e) => setNewAccountRole(e.target.value)}
                                  className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-400 transition-all">
                                  <option value="Chairman">Chairman</option>
                                  <option value="Administrator">Administrator</option>
                                  <option value="Principal">Principal</option>
                                  <option value="Superadmin">Superadmin</option>
                                </select>
                              </div>
                              <button type="submit"
                                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                                <UserPlus size={12} /> Create Account
                              </button>
                            </form>
                          </div>

                          {/* Accounts Table */}
                          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest bg-slate-50">
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Password</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Created</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {adminAccounts.map((account: any) => {
                                    const isRevealed = !!revealedPasswords["acc_" + account.username];
                                    return (
                                      <tr key={account.username} className="border-b border-slate-100 hover:bg-slate-50/70 text-xs transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{account.username}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-600">{account.role}</td>
                                        <td className="px-4 py-3 font-mono">
                                          <div className="flex items-center gap-1.5">
                                            <span className={isRevealed ? "text-slate-800" : "text-slate-400 tracking-widest"}>
                                              {isRevealed ? account.password : "••••••••"}
                                            </span>
                                            <button type="button"
                                              onClick={() => setRevealedPasswords(prev => ({ ...prev, ["acc_" + account.username]: !prev["acc_" + account.username] }))}
                                              className="text-slate-300 hover:text-slate-600 transition-colors cursor-pointer p-0.5 rounded"
                                              title={isRevealed ? "Hide" : "Reveal"}>
                                              {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${account.mustChangePassword === 1 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                                            }`}>
                                            {account.mustChangePassword === 1 ? "Temp Key" : "Configured"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                                          {account.createdAt ? new Date(account.createdAt).toLocaleDateString("en-IN") : "Legacy"}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                          <button onClick={() => handleResetPassword(account.username)}
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-mono text-[10px] font-bold cursor-pointer mr-3 transition-colors">
                                            <RotateCcw size={10} /> Reset
                                          </button>
                                          <button onClick={() => handleDeleteAccount(account.username)}
                                            disabled={account.username === adminUsername}
                                            className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold cursor-pointer transition-colors ${account.username === adminUsername ? "text-slate-300 cursor-not-allowed" : "text-rose-600 hover:text-rose-800"
                                              }`}>
                                            <Trash2 size={10} /> Delete
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
