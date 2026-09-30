import { useGetIdentity, useLogout } from "@refinedev/core";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { isTokenExpired, getTimeUntilExpiration, handleSessionExpired } from "../../lib/auth";
import { usePageSEO } from "../../hooks/usePageSEO";
import { ShieldCheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { UserAvatar } from "../common/UserAvatar";
import { ProfileModal } from "./ProfileModal";

export const AdminLayout = () => {
  usePageSEO({
    title: 'Admin Control Center',
    description: 'ENM Legal Advocates administrative management system.',
    noindex: true,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (identity) {
      setCurrentUser((prev: any) => ({ ...prev, ...identity }));
    }
  }, [identity]);

  useEffect(() => {
    const handleUserUpdated = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };
    window.addEventListener("auth:user-updated", handleUserUpdated as EventListener);
    return () => {
      window.removeEventListener("auth:user-updated", handleUserUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    // 1. Initial check: If token is missing or expired, redirect immediately
    if (!token || isTokenExpired(token)) {
      handleSessionExpired();
      navigate("/login?expired=1", { replace: true });
      return;
    }

    // 2. Set timer for remaining token lifetime
    const msRemaining = getTimeUntilExpiration(token);
    let timeoutId: NodeJS.Timeout | undefined;
    if (msRemaining !== null && msRemaining > 0) {
      timeoutId = setTimeout(() => {
        handleSessionExpired();
      }, msRemaining);
    } else if (msRemaining === 0) {
      handleSessionExpired();
      return;
    }

    // 3. Periodic check every 10 seconds (handles system sleep / background tab throttling)
    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || isTokenExpired(currentToken)) {
        handleSessionExpired();
      }
    }, 10000);

    // 4. Multi-tab synchronization / manual logout events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        handleSessionExpired();
      }
    };
    const handleAuthLogout = () => {
      navigate("/login?expired=1", { replace: true });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [token, navigate]);

  if (!token || isTokenExpired(token)) return null;

  const isBlogActive = location.pathname.startsWith("/admin/blog-posts");
  const isCategoryActive = location.pathname.startsWith("/admin/categories");
  const isSuperAdminActive = location.pathname.startsWith("/admin/super-admin");
  const isSuperAdmin = currentUser?.role === "SUPERADMIN" || identity?.role === "SUPERADMIN";
  const isAdmin = currentUser?.role === "ADMIN" || identity?.role === "ADMIN" || isSuperAdmin;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center space-x-2">
            <span className="bg-royal text-white px-2.5 py-1 rounded text-sm font-black">ENM</span>
            <span className="tracking-wide">Blog Admin</span>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <button
              onClick={() => navigate("/admin/blog-posts")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isBlogActive
                  ? "bg-royal text-white shadow-md shadow-royal/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Blog Posts
            </button>
            <button
              onClick={() => navigate("/admin/categories")}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isCategoryActive
                  ? "bg-royal text-white shadow-md shadow-royal/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Categories
            </button>

            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-800">
                <button
                  onClick={() => navigate("/admin/super-admin")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isSuperAdminActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-amber-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4 shrink-0" />
                  <span>{isSuperAdmin ? "Super Admin Suite" : "User Management"}</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Pill / Profile Update Trigger */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex-1 flex items-center space-x-3 overflow-hidden text-left p-1.5 rounded-xl hover:bg-slate-800/80 transition group cursor-pointer"
            title="Edit Profile Details"
          >
            <UserAvatar
              src={currentUser?.imageUrl}
              name={currentUser?.name || "Author"}
              size="md"
              className="ring-1 ring-slate-700 group-hover:ring-amber-500 transition shrink-0"
            />
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="text-sm font-semibold truncate text-slate-200 group-hover:text-amber-400 transition">
                  {currentUser?.name || "Author"}
                </div>
                <PencilSquareIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="text-xs text-slate-400 truncate">{currentUser?.email}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="text-xs text-red-400 hover:text-red-300 border border-slate-800 hover:border-red-900 bg-slate-900/60 hover:bg-red-950/40 p-2 rounded-lg transition-all cursor-pointer shrink-0"
            title="Log Out"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Self-Service Profile Update Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />
    </div>
  );
};

