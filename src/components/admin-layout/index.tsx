import { useGetIdentity, useLogout } from "@refinedev/core";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router";
import { isTokenExpired, getTimeUntilExpiration, handleSessionExpired } from "../../lib/auth";
import api from "../../lib/api";
import { usePageSEO } from "../../hooks/usePageSEO";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  ServerStackIcon,
  CommandLineIcon,
  UsersIcon,
  ClockIcon,
  DocumentTextIcon,
  KeyIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  ScaleIcon,
  BriefcaseIcon,
  NewspaperIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { UserAvatar } from "../common/UserAvatar";
import { ProfileModal } from "./ProfileModal";
import { SkipToContent } from "../common/SkipToContent";

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

    // 4. Session heartbeat to keep active status current on backend
    const heartbeatId = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && !isTokenExpired(currentToken)) {
        api.get("/auth/me").catch(() => {});
      }
    }, 30000);

    // 5. Multi-tab synchronization / manual logout events
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
      clearInterval(heartbeatId);
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

  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || (isSuperAdmin ? "health" : "users");
  const currentSection = searchParams.get("section") || "home";
  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(true);
  const [isContentStudioMenuOpen, setIsContentStudioMenuOpen] = useState(true);

  // Auto-expand Super Admin menu and Content Studio menu when on the corresponding route
  useEffect(() => {
    if (isSuperAdminActive) {
      setIsSuperAdminMenuOpen(true);
      if (currentTab === "content") {
        setIsContentStudioMenuOpen(true);
      }
    }
  }, [isSuperAdminActive, currentTab]);

  const contentStudioSections = [
    {
      name: "Home Hero",
      section: "home",
      icon: HomeIcon,
    },
    {
      name: "About Us",
      section: "about",
      icon: ScaleIcon,
    },
    {
      name: "Practice Areas",
      section: "services",
      icon: BriefcaseIcon,
    },
    {
      name: "Blog header",
      section: "blog",
      icon: NewspaperIcon,
    },
    {
      name: "Contact & Footer",
      section: "contact",
      icon: MapPinIcon,
    },
  ];

  const superAdminSubmenu = [
    {
      name: "Site Health & Vitals",
      tab: "health",
      icon: ServerStackIcon,
      superAdminOnly: true,
    },
    {
      name: "Process Logs",
      tab: "logs",
      icon: CommandLineIcon,
      superAdminOnly: true,
    },
    {
      name: "Logged-in Users",
      tab: "sessions",
      icon: UsersIcon,
      superAdminOnly: true,
    },
    {
      name: "User Activity Trail",
      tab: "activity",
      icon: ClockIcon,
      superAdminOnly: true,
    },
    {
      name: "Custom Studio (CMS)",
      tab: "content",
      icon: DocumentTextIcon,
      superAdminOnly: true,
      hasSubmenu: true,
    },
    {
      name: "User & Password Controls",
      tab: "users",
      icon: KeyIcon,
      superAdminOnly: false,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <SkipToContent contentId="admin-main-content" label="Skip to admin workspace" />
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-lg overflow-y-auto shrink-0">
        <div>
          <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center space-x-2">
            <span className="bg-royal text-white px-2.5 py-1 rounded text-sm font-black">ENM</span>
            <span className="tracking-wide">Blog Admin</span>
          </div>
          <nav aria-label="Admin Navigation" className="mt-6 px-4 space-y-2">
            <button
              onClick={() => navigate("/admin/blog-posts")}
              aria-current={isBlogActive ? "page" : undefined}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isBlogActive
                  ? "bg-royal text-white shadow-md shadow-royal/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Blog Posts
            </button>
            <button
              onClick={() => navigate("/admin/categories")}
              aria-current={isCategoryActive ? "page" : undefined}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isCategoryActive
                  ? "bg-royal text-white shadow-md shadow-royal/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Categories
            </button>

            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
                {/* Super Admin Menu Header */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isSuperAdminActive) {
                      navigate(`/admin/super-admin?tab=${currentTab}`);
                      setIsSuperAdminMenuOpen(true);
                    } else {
                      setIsSuperAdminMenuOpen((prev) => !prev);
                    }
                  }}
                  aria-expanded={isSuperAdminMenuOpen}
                  aria-controls="super-admin-submenu"
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSuperAdminActive
                      ? "bg-slate-800 text-amber-300 font-bold border border-amber-500/20 shadow-sm"
                      : "text-amber-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckIcon className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{isSuperAdmin ? "Super Admin Suite" : "User Management"}</span>
                  </div>
                  {isSuperAdmin && (
                    isSuperAdminMenuOpen ? (
                      <ChevronDownIcon className="w-3.5 h-3.5 text-amber-400/80 transition-transform" />
                    ) : (
                      <ChevronRightIcon className="w-3.5 h-3.5 text-amber-400/80 transition-transform" />
                    )
                  )}
                </button>

                {/* Submenu of Super Admin Suite */}
                {isSuperAdminMenuOpen && (
                  <div
                    id="super-admin-submenu"
                    role="menu"
                    aria-label="Super Admin Suite Submenu"
                    className="ml-3 pl-2.5 border-l-2 border-slate-800 space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {superAdminSubmenu
                      .filter((item) => isSuperAdmin || !item.superAdminOnly)
                      .map((item) => {
                        const isSelected = isSuperAdminActive && currentTab === item.tab;
                        const IconComp = item.icon;
                        const hasSubmenu = Boolean(item.hasSubmenu);

                        return (
                          <div key={item.tab} className="space-y-1">
                            <button
                              role="menuitem"
                              type="button"
                              onClick={() => {
                                if (hasSubmenu) {
                                  if (!isSuperAdminActive || currentTab !== item.tab) {
                                    navigate(`/admin/super-admin?tab=${item.tab}&section=${currentSection || "home"}`);
                                    setIsContentStudioMenuOpen(true);
                                  } else {
                                    setIsContentStudioMenuOpen((prev) => !prev);
                                  }
                                } else {
                                  navigate(`/admin/super-admin?tab=${item.tab}`);
                                }
                              }}
                              aria-current={isSelected ? "page" : undefined}
                              aria-expanded={hasSubmenu ? isContentStudioMenuOpen : undefined}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                                isSelected
                                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-500/20"
                                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <IconComp
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? "text-slate-950" : "text-slate-400"
                                  }`}
                                />
                                <span className="truncate">{item.name}</span>
                              </div>
                              {hasSubmenu && (
                                isContentStudioMenuOpen ? (
                                  <ChevronDownIcon
                                    className={`w-3 h-3 shrink-0 transition-transform ${
                                      isSelected ? "text-slate-950" : "text-slate-400"
                                    }`}
                                  />
                                ) : (
                                  <ChevronRightIcon
                                    className={`w-3 h-3 shrink-0 transition-transform ${
                                      isSelected ? "text-slate-950" : "text-slate-400"
                                    }`}
                                  />
                                )
                              )}
                            </button>

                            {/* Nested Submenu for Custom Studio (CMS) */}
                            {hasSubmenu && isContentStudioMenuOpen && (
                              <div
                                role="menu"
                                aria-label="Custom Studio CMS Sections"
                                className="ml-3 pl-2.5 border-l border-slate-700/60 space-y-1 pt-1 pb-1 animate-in fade-in duration-150"
                              >
                                {contentStudioSections.map((sec) => {
                                  const isSecActive =
                                    isSuperAdminActive &&
                                    currentTab === "content" &&
                                    currentSection === sec.section;
                                  const SecIcon = sec.icon;

                                  return (
                                    <button
                                      key={sec.section}
                                      role="menuitem"
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/super-admin?tab=content&section=${sec.section}`);
                                      }}
                                      aria-current={isSecActive ? "page" : undefined}
                                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                                        isSecActive
                                          ? "bg-amber-400/20 text-amber-300 font-bold border-l-2 border-amber-400"
                                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                      }`}
                                    >
                                      <SecIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isSecActive ? "text-amber-400" : "text-slate-500"
                                        }`}
                                      />
                                      <span className="truncate">{sec.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* User Pill / Profile Update Trigger */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex-1 flex items-center space-x-3 overflow-hidden text-left p-1.5 rounded-xl hover:bg-slate-800/80 transition group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Edit Profile Details"
            aria-label={`Profile settings for ${currentUser?.name || "Author"}`}
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
            className="text-xs text-red-400 hover:text-red-300 border border-slate-800 hover:border-red-900 bg-slate-900/60 hover:bg-red-950/40 p-2 rounded-lg transition-all cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            title="Log Out"
            aria-label="Log Out of Admin Portal"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="admin-main-content" tabIndex={-1} role="main" className="flex-1 overflow-y-auto bg-slate-50 focus:outline-none">
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

