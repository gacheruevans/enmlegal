import { useGetIdentity, useLogout } from "@refinedev/core";
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { isTokenExpired, getTimeUntilExpiration, handleSessionExpired } from "../../lib/auth";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { data: identity } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();

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
          </nav>
        </div>
        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {identity?.imageUrl ? (
              <img src={identity.imageUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                {identity?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-slate-200">
                {identity?.name || "Author"}
              </div>
              <div className="text-xs text-slate-400 truncate">{identity?.email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-xs text-red-400 hover:text-red-300 border border-slate-800 hover:border-red-900 bg-slate-900/50 hover:bg-slate-900 p-2 rounded transition-all cursor-pointer flex-shrink-0"
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
    </div>
  );
};
