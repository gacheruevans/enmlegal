import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import api from "../../../lib/api";
import {
  ShieldCheckIcon,
  ServerStackIcon,
  CommandLineIcon,
  UsersIcon,
  ClockIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  CircleStackIcon,
  CpuChipIcon,
  SignalIcon,
  LockClosedIcon,
  UserPlusIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ContentManagement } from "./ContentManagement";
import { UserAvatar } from "../../../components/common/UserAvatar";
import { NotificationBar, NotificationState } from "../../../components/common/NotificationBar";
import { StatusConfirmModal, StatusModalUser } from "./StatusConfirmModal";

type TabType = "health" | "logs" | "sessions" | "activity" | "users" | "content";

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  database: {
    status: "connected" | "disconnected";
    provider: string;
    latencyMs: number;
    tables: {
      users: number;
      posts: number;
      categories: number;
      consultations: number;
      activityLogs: number;
    };
  };
  system: {
    uptimeSeconds: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
    environment: string;
    pid: number;
    activeSessionsCount: number;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
      externalMb: number;
    };
  };
}

interface ProcessLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  context: string;
  message: string;
  meta?: any;
}

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl?: string | null;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  isOnline: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface ActivityLogItem {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  imageUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
  createdAt: string;
  _count?: {
    posts: number;
    activityLogs: number;
  };
}

export const SuperAdminDashboard: React.FC = () => {
  const userStorage = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = userStorage ? JSON.parse(userStorage) : null;
  const isSuperAdmin = currentUser?.role === "SUPERADMIN";

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") as TabType | null;
  const validTabs: TabType[] = ["health", "logs", "sessions", "activity", "content", "users"];
  const activeTab: TabType = rawTab && validTabs.includes(rawTab)
    ? isSuperAdmin || rawTab === "users"
      ? rawTab
      : "users"
    : isSuperAdmin
    ? "health"
    : "users";

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!rawTab || !validTabs.includes(rawTab)) {
      setSearchParams({ tab: isSuperAdmin ? "health" : "users" }, { replace: true });
    }
  }, [rawTab, isSuperAdmin, setSearchParams]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [health, setHealth] = useState<HealthData | null>(null);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityAction, setActivityAction] = useState("ALL");
  const [users, setUsers] = useState<AdminUserItem[]>([]);

  // Tailwind CSS notification bar state
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // User status confirm modal state
  const [statusModalUser, setStatusModalUser] = useState<StatusModalUser | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  // Password reset modal state
  const [resetModalUser, setResetModalUser] = useState<AdminUserItem | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccessData, setResetSuccessData] = useState<{
    temporaryPassword: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Create user modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("ADMIN");
  const [createPhone, setCreatePhone] = useState("");
  const [createIsActive, setCreateIsActive] = useState(true);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdUserData, setCreatedUserData] = useState<{
    name: string;
    email: string;
    role: string;
    password: string;
  } | null>(null);
  const [createdCopied, setCreatedCopied] = useState(false);

  // Fetch health data
  const fetchHealth = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/health");
      setHealth(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  // Fetch process logs
  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/logs", {
        params: {
          level: logLevel !== "all" ? logLevel : undefined,
          search: logSearch || undefined,
          limit: 150,
        },
      });
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
    }
  }, [logLevel, logSearch]);

  // Fetch logged in users
  const fetchActiveSessions = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/active-sessions");
      setActiveUsers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch active sessions:", err);
    }
  }, []);

  // Fetch all user activity
  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/activities", {
        params: {
          action: activityAction !== "ALL" ? activityAction : undefined,
          search: activitySearch || undefined,
          limit: 50,
        },
      });
      setActivities(data.activities || []);
    } catch (err: any) {
      console.error("Failed to fetch activities:", err);
    }
  }, [activityAction, activitySearch]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  // Combined refresh
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      if (activeTab === "health" && isSuperAdmin) await fetchHealth();
      else if (activeTab === "logs" && isSuperAdmin) await fetchLogs();
      else if (activeTab === "sessions" && isSuperAdmin) await fetchActiveSessions();
      else if (activeTab === "activity" && isSuperAdmin) await fetchActivities();
      else if (activeTab === "users") await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, isSuperAdmin, fetchHealth, fetchLogs, fetchActiveSessions, fetchActivities, fetchUsers]);

  // Initial load and tab change
  useEffect(() => {
    refreshAll();
  }, [activeTab, refreshAll]);

  // Periodic polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshAll();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  // Clear process logs
  const handleClearLogs = async () => {
    try {
      await api.post("/admin/logs/clear");
      await fetchLogs();
      setNotification({
        type: "success",
        title: "Logs Cleared",
        message: "Process logs buffer has been cleared successfully.",
        duration: 4000,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Log Clearance Failed",
        message: err.response?.data?.message || err.message || "Failed to clear logs.",
        duration: 5000,
      });
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetting(true);
    try {
      const { data } = await api.post(`/admin/users/${resetModalUser.id}/reset-password`, {
        newPassword: customPassword.trim() || undefined,
      });
      setResetSuccessData({
        temporaryPassword: data.temporaryPassword,
        message: data.message,
      });
      setCustomPassword("");
      fetchUsers();
      setNotification({
        type: "success",
        title: "Password Reset Generated",
        message: `Temporary password created for ${resetModalUser.email}.`,
        duration: 5000,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Password Reset Failed",
        message: err.response?.data?.message || err.message || "Failed to reset password.",
        duration: 5000,
      });
    } finally {
      setResetting(false);
    }
  };

  // Trigger user account active status confirmation or policy check
  const handleToggleStatus = (user: AdminUserItem) => {
    if (user.role === "SUPERADMIN" && user.isActive) {
      setNotification({
        type: "warning",
        title: "Security Policy Restriction",
        message: "Super Administrator accounts are permanently protected and cannot be deactivated.",
        duration: 6000,
      });
      return;
    }
    setStatusModalUser(user);
  };

  // Execute user account status activation/deactivation
  const executeToggleStatus = async () => {
    if (!statusModalUser) return;
    setStatusUpdating(true);
    const nextStatus = !statusModalUser.isActive;
    const targetEmail = statusModalUser.email;

    try {
      await api.patch(`/admin/users/${statusModalUser.id}/status`, { isActive: nextStatus });
      setStatusModalUser(null);
      await fetchUsers();
      setNotification({
        type: "success",
        title: nextStatus ? "User Account Reactivated" : "User Account Deactivated",
        message: nextStatus
          ? `User account for ${targetEmail} has been reactivated. Portal access has been restored.`
          : `User account for ${targetEmail} has been deactivated. Login sessions have been terminated.`,
        duration: 6000,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Status Update Failed",
        message: err.response?.data?.message || err.message || "Failed to update user account status.",
        duration: 6000,
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!resetSuccessData?.temporaryPassword) return;
    navigator.clipboard.writeText(resetSuccessData.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate strong random password for new user
  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "ENM#";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePassword(pwd);
    setShowCreatePassword(true);
  };

  // Create user account submit handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createName.trim()) {
      setCreateError("Full name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail.trim())) {
      setCreateError("Please enter a valid email address.");
      return;
    }

    if (createPassword.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    setCreatingUser(true);
    try {
      await api.post("/admin/users", {
        name: createName.trim(),
        email: createEmail.trim().toLowerCase(),
        password: createPassword,
        role: createRole,
        phone: createPhone.trim() || undefined,
        isActive: createIsActive,
      });

      setCreatedUserData({
        name: createName.trim(),
        email: createEmail.trim().toLowerCase(),
        role: createRole,
        password: createPassword,
      });

      // Clear input fields
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreatePhone("");
      setCreateRole("ADMIN");
      setCreateIsActive(true);

      // Refresh user list
      fetchUsers();
    } catch (err: any) {
      setCreateError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create user account. Please check the inputs.",
      );
    } finally {
      setCreatingUser(false);
    }
  };

  // Copy newly created user credentials
  const handleCopyCreatedCredentials = () => {
    if (!createdUserData) return;
    const text = `ENM Legal Portal Credentials:\nEmail: ${createdUserData.email}\nPassword: ${createdUserData.password}\nRole: ${createdUserData.role}`;
    navigator.clipboard.writeText(text);
    setCreatedCopied(true);
    setTimeout(() => setCreatedCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Tailwind CSS Notification Bar */}
      {notification && (
        <NotificationBar
          notification={notification}
          onClose={() => setNotification(null)}
          className="sticky top-2 z-40"
        />
      )}

      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-royal p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>{isSuperAdmin ? "Super Administrator Suite" : "Administrator Suite"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isSuperAdmin ? "Site Health & Telemetry Center" : "User Management & Account Controls"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {isSuperAdmin
                ? "Real-time system diagnostics, process logs, active user sessions, full audit trail, and security credentials control."
                : "Manage advocate and staff accounts, activate or deactivate portal access, and oversee account statuses."}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Auto refresh toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                autoRefresh
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? "bg-emerald-400 animate-ping" : "bg-slate-500"
                }`}
              />
              <span>{autoRefresh ? "Live Telemetry" : "Paused"}</span>
            </button>

            {/* Manual refresh button */}
            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs border border-white/10 transition cursor-pointer disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick status bar (Super Admin Only) */}
        {health && isSuperAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Engine Status</span>
              <span className="font-bold text-emerald-400 inline-flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {health.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">DB Latency</span>
              <span className="font-bold text-white mt-0.5 block">
                {health.database.latencyMs >= 0 ? `${health.database.latencyMs} ms` : "Offline"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Active Sessions</span>
              <span className="font-bold text-amber-300 mt-0.5 block">
                {health.system.activeSessionsCount} Online
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">System Uptime</span>
              <span className="font-bold text-white mt-0.5 block">
                {health.system.uptimeFormatted}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold text-rose-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Active Section Module Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
            {activeTab === "health" && <ServerStackIcon className="w-5 h-5" />}
            {activeTab === "logs" && <CommandLineIcon className="w-5 h-5" />}
            {activeTab === "sessions" && <UsersIcon className="w-5 h-5" />}
            {activeTab === "activity" && <ClockIcon className="w-5 h-5" />}
            {activeTab === "content" && <DocumentTextIcon className="w-5 h-5" />}
            {activeTab === "users" && <KeyIcon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {activeTab === "health" && "Site Health & Vitals"}
                {activeTab === "logs" && "Process Logs"}
                {activeTab === "sessions" && "Logged-in Users"}
                {activeTab === "activity" && "User Activity Trail"}
                {activeTab === "content" && "Content Studio (CMS)"}
                {activeTab === "users" && (isSuperAdmin ? "User & Password Controls" : "User Management & Status")}
              </h2>
              {activeTab === "sessions" && activeUsers.filter((u) => u.isOnline).length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  {activeUsers.filter((u) => u.isOnline).length} Active Online
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Module active • Navigated via Super Admin main menu on the left sidebar
            </p>
          </div>
        </div>

        {/* Section Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "users" && isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
            >
              <UserPlusIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Account</span>
            </button>
          )}
          {activeTab === "logs" && isSuperAdmin && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SITE HEALTH & VITALS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {health ? (
            <>
              {/* Primary Vitals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Database Connectivity */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      PostgreSQL Database
                    </span>
                    <CircleStackIcon className="w-6 h-6 text-royal" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {health.database.latencyMs >= 0 ? `${health.database.latencyMs} ms` : "N/A"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {health.database.status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate" title={health.database.provider}>
                    {health.database.provider}
                  </p>
                </div>

                {/* Memory Footprint */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      RAM & Heap Usage
                    </span>
                    <CpuChipIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {health.system.memory.heapUsedMb} MB
                    </span>
                    <span className="text-xs text-slate-400">
                      / {health.system.memory.heapTotalMb} MB Heap
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (health.system.memory.heapUsedMb / health.system.memory.heapTotalMb) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    RSS: {health.system.memory.rssMb} MB • External: {health.system.memory.externalMb} MB
                  </p>
                </div>

                {/* Engine Runtime */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Process Runtime
                    </span>
                    <SignalIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mb-1">
                    Node {health.system.nodeVersion}
                  </div>
                  <p className="text-xs text-slate-600">
                    Platform: <span className="font-semibold">{health.system.platform}</span> (PID {health.system.pid})
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Environment: <span className="font-semibold uppercase text-royal">{health.system.environment}</span>
                  </p>
                </div>
              </div>

              {/* Database Table Records */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Database Table Catalog & Record Counts
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="block text-2xl font-extrabold text-slate-900">
                      {health.database.tables.users}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Users
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="block text-2xl font-extrabold text-slate-900">
                      {health.database.tables.posts}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Articles
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="block text-2xl font-extrabold text-slate-900">
                      {health.database.tables.categories}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Categories
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="block text-2xl font-extrabold text-slate-900">
                      {health.database.tables.consultations}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Bookings
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="block text-2xl font-extrabold text-slate-900">
                      {health.database.tables.activityLogs}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Audit Logs
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">Loading system vitals...</div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: PROCESS & SYSTEM LOGS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword or context..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-royal/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="info">INFO only</option>
                <option value="warn">WARN only</option>
                <option value="error">ERROR only</option>
              </select>

              <button
                type="button"
                onClick={handleClearLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition cursor-pointer"
                title="Clear buffer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Clear Buffer</span>
              </button>
            </div>
          </div>

          {/* Log Stream Terminal */}
          <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 font-mono text-xs text-slate-300 shadow-2xl max-h-[600px] overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 py-10 text-center font-sans">
                No process logs match the selected filter.
              </div>
            ) : (
              logs.map((log) => {
                const isError = log.level === "error";
                const isWarn = log.level === "warn";
                return (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1 border-b border-slate-900/60 leading-relaxed hover:bg-slate-900/50 px-2 rounded"
                  >
                    <span className="text-slate-500 shrink-0 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>

                    <span
                      className={`uppercase text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 self-start ${
                        isError
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : isWarn
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {log.level}
                    </span>

                    <span className="text-slate-400 font-bold shrink-0">
                      [{log.context}]
                    </span>

                    <span className={`flex-1 break-all ${isError ? "text-rose-300" : isWarn ? "text-amber-200" : "text-slate-200"}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: LOGGED-IN USERS & ACTIVE SESSIONS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active User Sessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of authenticated administrators and authors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {activeUsers.filter((u) => u.isOnline).length} Active Online
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Session Status</th>
                  <th className="px-6 py-3.5">Last Seen Active</th>
                  <th className="px-6 py-3.5">Last Authenticated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      No active sessions found.
                    </td>
                  </tr>
                ) : (
                  activeUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <UserAvatar
                          src={u.imageUrl}
                          name={u.name}
                          size="md"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === "SUPERADMIN"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : u.role === "ADMIN"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {u.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Offline
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : "Recently"}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: USER ACTIVITY TRAIL (AUDIT LOGS)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          {/* Activity Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search audit trail by user, action, or details..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-royal/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activityAction}
                onChange={(e) => setActivityAction(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="LOGIN_FAILED">Failed Logins</option>
                <option value="PASSWORD_RESET">Password Resets</option>
                <option value="USER_STATUS_CHANGE">Status Changes</option>
                <option value="USER_ROLE_CHANGE">Role Changes</option>
                <option value="CLEAR_PROCESS_LOGS">Log Clears</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">Actor / User</th>
                    <th className="px-6 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                        No activity records found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    activities.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              item.action === "LOGIN_FAILED"
                                ? "bg-rose-100 text-rose-800"
                                : item.action === "PASSWORD_RESET"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : item.action === "USER_LOGIN" || item.action === "GOOGLE_LOGIN"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {item.action}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {item.userEmail || item.user?.email || "System"}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 max-w-md truncate">
                          {item.details || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: USER DIRECTORY & PASSWORD RESETS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Administration & Accounts</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuperAdmin
                  ? "Manage counsel and staff accounts, create users, reset credentials, and toggle access permissions."
                  : "Manage advocate accounts, create new users, and toggle access permissions."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateUserModal(true);
                setCreateError(null);
                setCreatedUserData(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-royal hover:bg-royal/90 active:scale-95 text-white font-bold text-xs shadow-md shadow-royal/20 transition cursor-pointer self-start sm:self-auto"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Posts</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <UserAvatar
                        src={u.imageUrl}
                        name={u.name}
                        size="md"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === "SUPERADMIN"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.role === "SUPERADMIN"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        } ${u.role === "SUPERADMIN" ? "opacity-80" : ""}`}
                        title={
                          u.role === "SUPERADMIN"
                            ? "Super Administrator accounts cannot be deactivated"
                            : u.isActive
                            ? "Click to deactivate account"
                            : "Click to reactivate account"
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                        {u.isActive ? "Active" : "Deactivated"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {u._count?.posts || 0} Articles
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => {
                            setResetModalUser(u);
                            setResetSuccessData(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                        >
                          <KeyIcon className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {u.isActive ? "Authorized" : "Deactivated"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PASSWORD RESET MODAL
          ───────────────────────────────────────────────────────────── */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setResetModalUser(null);
                setResetSuccessData(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {resetSuccessData ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Password Reset Complete</h3>
                <p className="text-xs text-slate-600 mb-6">
                  A new secure password has been generated for <strong>{resetModalUser.email}</strong>.
                </p>

                {/* Password display card */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl font-mono text-base font-bold flex items-center justify-between mb-6 shadow-inner">
                  <span className="tracking-wider select-all text-amber-300">
                    {resetSuccessData.temporaryPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-xs flex items-center gap-1.5"
                    title="Copy password"
                  >
                    {copied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4 text-slate-300" />
                        <span className="font-sans">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetModalUser(null);
                    setResetSuccessData(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                    <KeyIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Reset User Password</h3>
                    <p className="text-xs text-slate-500">Super Admin Security Action</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-xs text-slate-700 space-y-1">
                  <div>
                    <span className="text-slate-400">Target User:</span>{" "}
                    <strong>{resetModalUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{" "}
                    <strong>{resetModalUser.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Role:</span>{" "}
                    <span className="font-bold text-royal">{resetModalUser.role}</span>
                  </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Custom Password <span className="text-slate-400 lowercase font-normal">(optional — leave blank to auto-generate)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave blank for auto-generated secure password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setResetModalUser(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetting}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {resetting ? "Resetting..." : "Confirm & Reset"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          CREATE NEW USER MODAL
          ───────────────────────────────────────────────────────────── */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateUserModal(false);
                setCreatedUserData(null);
                setCreateError(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {createdUserData ? (
              /* Success Screen */
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">User Account Created!</h3>
                <p className="text-xs text-slate-600 mb-5">
                  Account has been registered successfully for <strong>{createdUserData.name}</strong>.
                </p>

                {/* Credentials Card */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl text-left text-xs space-y-2 mb-6 shadow-inner font-mono">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-bold text-amber-300">{createdUserData.role}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 font-semibold">{createdUserData.email}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Initial Password:</span>
                    <span className="text-amber-400 font-bold tracking-wider select-all">
                      {createdUserData.password}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCreatedCredentials}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    {createdCopied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Credentials Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4 text-slate-600" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUserModal(false);
                      setCreatedUserData(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-royal hover:bg-royal/90 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Create User Form */
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-royal/10 text-royal flex items-center justify-center border border-royal/20 shrink-0">
                    <UserPlusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create New User Account</h3>
                    <p className="text-xs text-slate-500">
                      Authorized by {isSuperAdmin ? "Super Administrator" : "Administrator"}
                    </p>
                  </div>
                </div>

                {createError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <XCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{createError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adv. Jane Mwangi"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <EnvelopeIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="counsel@enmlegal.com"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                      />
                    </div>
                  </div>

                  {/* Role Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      System Role *
                    </label>
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 bg-white"
                    >
                      <option value="ADMIN">Administrator (ADMIN)</option>
                      <option value="AUTHOR">Author / Counsel (AUTHOR)</option>
                      <option value="ASSISTANT">Legal Assistant (ASSISTANT)</option>
                      {isSuperAdmin && (
                        <option value="SUPERADMIN">Super Administrator (SUPERADMIN)</option>
                      )}
                    </select>
                    {!isSuperAdmin && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        * Super Administrator accounts can only be created by an existing Super Admin.
                      </p>
                    )}
                  </div>

                  {/* Password & Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Initial Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-royal hover:underline cursor-pointer"
                      >
                        ⚡ Generate Strong Password
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockClosedIcon className="w-4 h-4" />
                      </div>
                      <input
                        type={showCreatePassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-royal/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCreatePassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+254 701 857 030"
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20"
                    />
                  </div>

                  {/* Active Status Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={createIsActive}
                        onChange={(e) => setCreateIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-royal focus:ring-royal/30 cursor-pointer"
                      />
                      <span>Activate account immediately upon creation</span>
                    </label>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-royal hover:bg-royal/90 active:scale-95 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {creatingUser ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Creating User...</span>
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-4 h-4" />
                          <span>Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: CONTENT STUDIO (CMS)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "content" && isSuperAdmin && (
        <ContentManagement isSuperAdmin={isSuperAdmin} />
      )}

      {/* Tailwind CSS User Status Confirmation Modal */}
      <StatusConfirmModal
        isOpen={Boolean(statusModalUser)}
        onClose={() => setStatusModalUser(null)}
        user={statusModalUser}
        onConfirm={executeToggleStatus}
        loading={statusUpdating}
      />
    </div>
  );
};
