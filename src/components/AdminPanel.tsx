import React, { useState } from "react";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  // Admin Dashboard Management States
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
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
  const [adminActiveTab, setAdminActiveTab] = useState<"inquiries" | "settings">("inquiries");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");

  const handleAdminLogin = async () => {
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminInquiries(data.inquiries);
        
        // Fetch current settings as well
        const settingsRes = await fetch("/api/admin/settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setAdminSettings(settingsData.settings);
        }
      } else {
        setAdminErrorMsg(data.message || "Incorrect admin password.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Connection failed: " + err.message);
    }
  };

  const handleSaveSettings = async () => {
    setAdminErrorMsg("");
    setAdminSuccessMsg("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPasswordInput,
          settings: adminSettings
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminSuccessMsg("Settings saved successfully! Server-side dispatch has been updated.");
        setAdminSettings(data.settings);
      } else {
        setAdminErrorMsg(data.message || "Failed to save settings.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error saving settings: " + err.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const response = await fetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput, id })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
        setAdminSuccessMsg("Inquiry deleted from database logs.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error deleting inquiry: " + err.message);
    }
  };

  const handleClearAllInquiries = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to permanently delete ALL inquiry logs? This cannot be undone!")) return;
    try {
      const response = await fetch("/api/admin/clear-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries([]);
        setAdminSuccessMsg("Inquiry log database has been cleared.");
      }
    } catch (err: any) {
      setAdminErrorMsg("Error wiping database logs: " + err.message);
    }
  };

  const refreshInquiries = async () => {
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminInquiries(data.inquiries);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => {
    onClose();
    setIsAdminAuthenticated(false);
    setAdminPasswordInput("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-slate-800 font-sans">
        
        {/* Header */}
        <div className="bg-ink-navy text-white px-6 py-4 flex justify-between items-center border-b border-brass-gold/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <div>
              <h3 className="font-serif text-base font-bold tracking-tight text-white">AMPS Administration Portal</h3>
              <p className="font-mono text-[9px] text-brass-gold uppercase tracking-wider">Inquiry Database & Delivery Management</p>
            </div>
          </div>
          <button 
            onClick={handleModalClose}
            className="text-white/60 hover:text-white font-mono text-lg font-bold p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Section */}
        {!isAdminAuthenticated ? (
          // Login Screen
          <div className="p-8 max-w-md mx-auto my-12 text-center space-y-4">
            <span className="text-4xl block">🛡️</span>
            <h4 className="font-serif text-lg font-bold text-slate-900">Protected Administrator Area</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Please enter the system administrator security key to access the prospective admission inquiry database and configure delivery engines.
            </p>
            
            <div className="space-y-2">
              <input 
                type="password"
                placeholder="Enter Security Password (default: ampsadmin)"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                className="w-full border border-slate-300 p-2.5 rounded text-center text-sm focus:outline-none focus:border-brass-gold font-mono"
              />
              {adminErrorMsg && (
                <p className="text-xs text-rose-600 font-semibold">{adminErrorMsg}</p>
              )}
              <button 
                onClick={handleAdminLogin}
                className="w-full bg-ink-navy hover:bg-navy-light text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded transition-colors cursor-pointer"
              >
                Authenticate Console
              </button>
            </div>
          </div>
        ) : (
          // Main Dashboard
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-4 space-y-2 flex flex-row md:flex-col shrink-0 gap-2 md:gap-0">
              <button 
                onClick={() => { setAdminActiveTab("inquiries"); setAdminErrorMsg(""); setAdminSuccessMsg(""); refreshInquiries(); }}
                className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${adminActiveTab === "inquiries" ? "bg-ink-navy text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                📋 Inquiries Log ({adminInquiries.length})
              </button>
              <button 
                onClick={() => { setAdminActiveTab("settings"); setAdminErrorMsg(""); setAdminSuccessMsg(""); }}
                className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${adminActiveTab === "settings" ? "bg-ink-navy text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                ⚙️ Delivery Engines
              </button>
            </div>

            {/* Tab Workspace */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] text-slate-700">
              {adminSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs font-semibold mb-4">
                  ✓ {adminSuccessMsg}
                </div>
              )}
              {adminErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs font-semibold mb-4">
                  ⚠️ {adminErrorMsg}
                </div>
              )}

              {adminActiveTab === "inquiries" ? (
                // INQUIRIES TAB
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-base">Prospective Leads Database</h4>
                      <p className="text-[11px] text-slate-500">Real-time backup of all inquiries submitted through school forms.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/admin/inquiries", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ password: adminPasswordInput })
                            });
                            const data = await response.json();
                            if (response.ok && data.success) {
                              setAdminInquiries(data.inquiries);
                              setAdminSuccessMsg("Data reloaded from cloud filesystem.");
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded cursor-pointer"
                      >
                        🔄 Refresh
                      </button>
                      <button 
                        onClick={handleClearAllInquiries}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded cursor-pointer"
                      >
                        🗑️ Wipe Logs
                      </button>
                    </div>
                  </div>

                  {adminInquiries.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded">
                      <span className="text-3xl block mb-2">📋</span>
                      <p className="text-xs text-slate-500 font-mono uppercase">No Inquiries Found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Submitted leads will appear here instantly even if Gmail blocks SMTP.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminInquiries.map((inq: any) => (
                        <div key={inq.id} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors">
                          <div className="space-y-1 max-w-xl text-left">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-serif font-bold text-slate-900">{inq.name}</span>
                              <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-100 rounded font-bold">
                                📞 {inq.phone}
                              </span>
                              {inq.email && (
                                <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-100 rounded font-bold font-sans">
                                  ✉️ {inq.email}
                                </span>
                              )}
                              <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${inq.dispatchStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                                📧 {inq.dispatchStatus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50/50 p-2 border-l-2 border-slate-300 rounded font-sans leading-relaxed">
                              {inq.message}
                            </p>
                            <div className="flex flex-wrap gap-4 font-mono text-[9px] text-slate-400 mt-1.5">
                              <span>📅 Submitted: {new Date(inq.timestamp).toLocaleString("en-IN")}</span>
                              <span>📡 Channel: {inq.dispatchedVia}</span>
                              {inq.dispatchError && <span className="text-rose-500">❌ Error: {inq.dispatchError}</span>}
                            </div>
                          </div>
                          <div className="shrink-0 flex gap-2 w-full md:w-auto justify-end">
                            <a 
                              href={`tel:${inq.phone}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm cursor-pointer"
                            >
                              Call
                            </a>
                            {inq.email && (
                              <a 
                                href={`mailto:${inq.email}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm cursor-pointer"
                              >
                                Mail
                              </a>
                            )}
                            <a 
                              href={`https://api.whatsapp.com/send?phone=91${inq.phone.replace(/[^0-9]/g, "")}&text=` + encodeURIComponent(`Hello ${inq.name}, we received your admission inquiry for Ashish Memorial Public School...`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm cursor-pointer"
                            >
                              WhatsApp
                            </a>
                            <button 
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-2 rounded-sm cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // SETTINGS TAB
                <div className="space-y-6 text-left">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">Configure Delivery Engines</h4>
                    <p className="text-[11px] text-slate-500">Control how inquiry emails are routed and bypass blocked SMTP network environments.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Column 1: Core Parameters */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                          Email Delivery Channel
                        </label>
                        <select 
                          value={adminSettings.emailProvider}
                          onChange={(e) => setAdminSettings({ ...adminSettings, emailProvider: e.target.value })}
                          className="w-full border border-slate-300 p-2 rounded text-sm bg-white"
                        >
                          <option value="web3forms">Web3Forms Secure API (Recommended - 100% Inbox Delivery)</option>
                          <option value="brevo">Brevo Transactional API (High Reliability)</option>
                          <option value="formsubmit">FormSubmit Tunnel</option>
                          <option value="smtp">Nodemailer SMTP Relay (Ports might be blocked)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Web3Forms & Brevo route messages over HTTPS Web APIs, fully bypassing GCP Cloud Run port restrictions!
                        </p>
                      </div>

                      {adminSettings.emailProvider === "web3forms" && (
                        <div>
                          <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                            Web3Forms Access Key (Get Free Key)
                          </label>
                          <input 
                            type="text" 
                            placeholder="Paste Web3Forms Key here..."
                            value={adminSettings.web3formsKey || ""}
                            onChange={(e) => setAdminSettings({ ...adminSettings, web3formsKey: e.target.value })}
                            className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal bg-amber-50 p-2 border border-amber-100 rounded font-sans">
                            💡 <strong>How to get free key in 5 seconds:</strong> Visit <a href="https://web3forms.com/#start" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">web3forms.com</a>, enter your email <strong>{adminSettings.inquiryRecipient || "admin@example.com"}</strong>, and they will email you an Access Key instantly. Paste that key above for 100% reliable inbox delivery!
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                          Recipient Notification Inbox
                        </label>
                        <input 
                          type="email" 
                          value={adminSettings.inquiryRecipient || ""}
                          onChange={(e) => setAdminSettings({ ...adminSettings, inquiryRecipient: e.target.value })}
                          className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                        />
                      </div>
                    </div>

                    {/* Column 2: Advanced Parameters */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                          School WhatsApp Phone (For Mobile Redirection)
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 919999999999"
                          value={adminSettings.whatsappPhone || ""}
                          onChange={(e) => setAdminSettings({ ...adminSettings, whatsappPhone: e.target.value })}
                          className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          The WhatsApp phone number (with country code, no "+" or spaces) where prospective parent leads are directed on mobile submission.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider mb-1">
                          Change Admin Security Key (Password)
                        </label>
                        <input 
                          type="text" 
                          value={adminSettings.adminPassword || ""}
                          onChange={(e) => setAdminSettings({ ...adminSettings, adminPassword: e.target.value })}
                          className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                        />
                      </div>

                      {adminSettings.emailProvider === "brevo" && (
                        <div className="bg-slate-50 p-3 border border-slate-200 rounded-sm space-y-3">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">Brevo API Configuration</p>
                          <div>
                            <label className="block text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Brevo API Key (v3)
                            </label>
                            <input 
                              type="password" 
                              placeholder="xkeysib-..." 
                              value={adminSettings.brevoApiKey || ""} 
                              onChange={(e) => setAdminSettings({ ...adminSettings, brevoApiKey: e.target.value })} 
                              className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Verified Sender Email
                            </label>
                            <input 
                              type="email" 
                              placeholder="sender@domain.com" 
                              value={adminSettings.brevoSenderEmail || ""} 
                              onChange={(e) => setAdminSettings({ ...adminSettings, brevoSenderEmail: e.target.value })} 
                              className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">
                              Sender Name
                            </label>
                            <input 
                              type="text" 
                              placeholder="AMPS Portal" 
                              value={adminSettings.brevoSenderName || "AMPS Portal"} 
                              onChange={(e) => setAdminSettings({ ...adminSettings, brevoSenderName: e.target.value })} 
                              className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" 
                            />
                          </div>
                        </div>
                      )}

                      {adminSettings.emailProvider === "smtp" && (
                        <div className="bg-slate-50 p-3 border border-slate-200 rounded-sm space-y-2">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">SMTP Relay Configuration</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <input type="text" placeholder="Host (smtp.gmail.com)" value={adminSettings.smtpHost || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpHost: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                            </div>
                            <div>
                              <input type="text" placeholder="Port (465)" value={adminSettings.smtpPort || "465"} onChange={(e) => setAdminSettings({ ...adminSettings, smtpPort: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                            </div>
                          </div>
                          <input type="text" placeholder="User (email@domain.com)" value={adminSettings.smtpUser || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpUser: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                          <input type="password" placeholder="Pass (Gmail App Password)" value={adminSettings.smtpPass || ""} onChange={(e) => setAdminSettings({ ...adminSettings, smtpPass: e.target.value })} className="w-full border border-slate-300 p-1.5 rounded text-xs font-mono" />
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                    <button 
                      onClick={handleSaveSettings}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-200 shrink-0">
          <span>Database Version: SQLite Store v3.0</span>
          <span>Logged In: {isAdminAuthenticated ? "TRUE" : "FALSE"}</span>
        </div>

      </div>
    </div>
  );
}
