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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[#1E2442] bg-[#0D1020] transition-all duration-200 ease-in-out lg:static ${
          isCollapsed ? "lg:w-16" : "lg:w-60"
        } ${
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#1E2442] px-4">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <span className="font-bold text-xs">DM</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-tight text-[#F5F7FF]">
                  Dev<span className="text-[#3B82F6]">Mesh</span>
                </span>
                <span className="text-[10px] text-[#8B91A7] mt-0.5 font-medium">
                  Developer Platform
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-lg border border-[#1E2442] bg-[#11152A] text-[#8B91A7] hover:border-[#2A335C] hover:text-[#F5F7FF] transition-colors"
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
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-all ${
                  active
                    ? "bg-[#151A32] text-[#F5F7FF] font-semibold border border-[#232B4E] shadow-sm"
                    : "text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF]"
                } ${isCollapsed && !isMobileOpen ? "justify-center px-2" : ""}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-[#3B82F6]" : "text-[#8B91A7] group-hover:text-[#F5F7FF]"
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
                {item.badge && (!isCollapsed || isMobileOpen) && (
                  <span className="ml-auto rounded-full bg-[#2563EB]/20 px-2 py-0.5 text-[10px] font-bold text-[#60A5FA] border border-[#3B82F6]/30">
                    {item.badge}
                  </span>
                )}
                {item.badge && isCollapsed && !isMobileOpen && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#3B82F6]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Session Bar */}
        {user ? (
          <div className="border-t border-[#1E2442] p-3 bg-[#080A14]/70">
            <div
              className={`flex items-center gap-3 rounded-xl p-1.5 ${
                isCollapsed && !isMobileOpen ? "justify-center" : ""
              }`}
            >
              <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="relative shrink-0">
                <img
                  className="h-8 w-8 rounded-xl border border-[#1E2442] object-cover bg-[#11152A]"
                  src={user.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                  alt={user.firstName}
                />
                <span className="absolute -bottom-0.5 -right-0.5 status-dot-active border border-[#080A14]" />
              </Link>

              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="block truncate text-xs font-semibold text-[#F5F7FF] hover:text-[#3B82F6] transition-colors"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                  <p className="truncate text-[11px] text-[#8B91A7]">
                    @{user.firstName?.toLowerCase() || "dev"}
                  </p>
                </div>
              )}

              {(!isCollapsed || isMobileOpen) && (
                <button
                  onClick={handleLogout}
                  className="h-7 w-7 rounded-lg text-[#8B91A7] hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] flex items-center justify-center transition-colors"
                  title="Sign out"
                >
                  <IconLogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-[#1E2442] p-3 bg-[#080A14]/70">
            <Link
              to="/login"
              onClick={() => setIsMobileOpen(false)}
              className="btn-primary flex w-full items-center justify-center px-3 py-2 text-xs font-semibold"
            >
              {isCollapsed && !isMobileOpen ? "→" : "Sign In"}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}


