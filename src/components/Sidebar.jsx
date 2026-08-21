import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import {
  IconHome,
  IconExplore,
  IconNetwork,
  IconRequests,
  IconProjects,
  IconSettings,
  IconLogOut,
  IconChevronLeft,
  IconChevronRight,
  IconTerminal
} from "./ui/Icons";

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { label: "Dashboard", icon: IconHome, path: "/" },
    { label: "Explore", icon: IconExplore, path: "/feed" },
    { label: "Network", icon: IconNetwork, path: "/connections" },
    { 
      label: "Requests", 
      icon: IconRequests, 
      path: "/requests", 
      badge: requests?.length > 0 ? requests.length : null 
    },
    { label: "Projects", icon: IconProjects, path: "/projects" },
    { label: "Profile", icon: IconSettings, path: "/profile" },
  ];

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/" && (currentPath === "/" || currentPath === "/feed")) return true;
    if (path === "/feed" && currentPath === "/feed") return true;
    return currentPath === path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[#252A30] bg-[#111418] transition-all duration-150 ease-in-out lg:static ${
          isCollapsed ? "lg:w-16" : "lg:w-56"
        } ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#252A30] px-4">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              <IconTerminal className="h-4 w-4" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col leading-none">
                <span className="font-bold text-xs tracking-wide text-[#F2F4F7]">
                  Dev<span className="text-[#00E5FF]">Mesh</span>
                </span>
                <span className="font-mono text-[9px] text-[#57606A] mt-0.5">
                  developer network
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded border border-[#252A30] bg-[#161A1F] text-[#8B949E] hover:border-[#363E48] hover:text-[#F2F4F7] transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <IconChevronRight className="h-3.5 w-3.5" />
            ) : (
              <IconChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                  active
                    ? "bg-[#161A1F] text-[#00E5FF] font-medium border border-[#252A30]"
                    : "text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                } ${isCollapsed && !isMobileOpen ? "justify-center px-2" : ""}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#00E5FF]" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-[#00E5FF]" : "text-[#8B949E] group-hover:text-[#F2F4F7]"
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
                {item.badge && (!isCollapsed || isMobileOpen) && (
                  <span className="ml-auto rounded-full bg-[#00E5FF]/10 px-1.5 py-0.2 text-[10px] font-bold font-mono text-[#00E5FF] border border-[#00E5FF]/30">
                    {item.badge}
                  </span>
                )}
                {item.badge && isCollapsed && !isMobileOpen && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#00E5FF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Session Bar */}
        {user ? (
          <div className="border-t border-[#252A30] p-2 bg-[#0B0D0F]">
            <div
              className={`flex items-center gap-2.5 rounded-lg p-2 ${
                isCollapsed && !isMobileOpen ? "justify-center" : ""
              }`}
            >
              <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="relative shrink-0">
                <img
                  className="h-8 w-8 rounded-lg border border-[#252A30] object-cover bg-[#161A1F]"
                  src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                  alt={user.firstName}
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981] border border-[#0B0D0F]" />
              </Link>

              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="block truncate text-xs font-semibold text-[#F2F4F7] hover:text-[#00E5FF] transition-colors"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                  <p className="truncate font-mono text-[10px] text-[#57606A]">
                    @{user.firstName?.toLowerCase() || "dev"}
                  </p>
                </div>
              )}

              {(!isCollapsed || isMobileOpen) && (
                <button
                  onClick={handleLogout}
                  className="h-7 w-7 rounded border border-transparent text-[#8B949E] hover:border-[#252A30] hover:bg-[#161A1F] hover:text-[#F43F5E] flex items-center justify-center transition-colors"
                  title="Sign out"
                >
                  <IconLogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-[#252A30] p-3 bg-[#0B0D0F]">
            <Link
              to="/login"
              onClick={() => setIsMobileOpen(false)}
              className="btn-cyan flex w-full items-center justify-center px-3 py-2 text-xs font-semibold"
            >
              {isCollapsed && !isMobileOpen ? "→" : "Sign In"}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

