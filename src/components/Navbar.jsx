import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import {
  IconSearch,
  IconPlus,
  IconBell,
  IconMenu,
  IconLogOut,
  IconSettings,
  IconNetwork,
  IconProjects,
  IconRequests
} from "./ui/Icons";

function Navbar({ onOpenCommandPalette, onToggleMobileMenu }) {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#1E2442] bg-[#080A14]/90 px-4 backdrop-blur-xl">
      {/* Left: Mobile trigger & Network Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1E2442] bg-[#0D1020] text-[#8B91A7] hover:border-[#2A335C] hover:text-[#F5F7FF] transition-all lg:hidden"
          aria-label="Open navigation menu"
        >
          <IconMenu className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-[#1E2442] bg-[#0D1020]/90 px-3 py-1 text-xs sm:flex">
          <span className="status-dot-active" />
          <span className="text-[#8B91A7] text-[11px] font-medium">Network</span>
          <span className="text-[#38BDF8] text-[11px] font-semibold">Active</span>
        </div>
      </div>

      {/* Middle: Global Search / Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex w-full max-w-xs sm:max-w-md items-center justify-between rounded-xl border border-[#1E2442] bg-[#0D1020]/90 px-3.5 py-1.5 text-xs text-[#8B91A7] transition-all hover:border-[#2A335C] hover:text-[#F5F7FF] shadow-inner"
      >
        <div className="flex items-center gap-2.5">
          <IconSearch className="h-3.5 w-3.5 text-[#515870]" />
          <span className="truncate">Search developers, skills, or projects...</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-[#1E2442] bg-[#11152A] px-1.5 py-0.5 text-[10px] text-[#8B91A7]">
            Ctrl K
          </kbd>
        </div>
      </button>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {user ? (
          <>
            <Link
              to="/projects"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#1E2442] bg-[#11152A] px-3 py-1.5 text-xs font-semibold text-[#F5F7FF] hover:border-[#3B82F6]/50 hover:text-[#60A5FA] transition-all shadow-sm"
            >
              <IconPlus className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span>New Project</span>
            </Link>

            <Link
              to="/requests"
              className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#1E2442] bg-[#0D1020] text-[#8B91A7] hover:border-[#2A335C] hover:text-[#F5F7FF] transition-all"
              title="Connection requests"
            >
              <IconBell className="h-4 w-4" />
              {requests?.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[9px] font-bold text-white shadow-sm">
                  {requests.length}
                </span>
              )}
            </Link>

            {/* Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="flex items-center gap-2 rounded-xl border border-[#1E2442] bg-[#0D1020] p-1 hover:border-[#2A335C] transition-all"
              >
                <img
                  className="h-6 w-6 rounded-lg object-cover bg-[#11152A]"
                  src={user.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                  alt={user.firstName}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#1E2442] bg-[#0D1020] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="border-b border-[#1E2442] px-3 py-2.5">
                    <p className="text-xs font-bold text-[#F5F7FF] truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-[#8B91A7] truncate">
                      {user.email || `@${user.firstName?.toLowerCase()}`}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
                    >
                      <IconSettings className="h-3.5 w-3.5 text-[#3B82F6]" />
                      <span>Profile &amp; Settings</span>
                    </Link>
                    <Link
                      to="/connections"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
                    >
                      <IconNetwork className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      <span>Network Graph</span>
                    </Link>
                    <Link
                      to="/projects"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
                    >
                      <IconProjects className="h-3.5 w-3.5 text-[#06B6D4]" />
                      <span>Projects</span>
                    </Link>
                    <Link
                      to="/requests"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
                    >
                      <IconRequests className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>Connection Requests</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#1E2442] pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors"
                    >
                      <IconLogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="btn-primary px-4 py-1.5 text-xs font-semibold"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;



