import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import {
  IconSearch,
  IconCommand,
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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#252A30] bg-[#0B0D0F]/90 px-4 backdrop-blur-md">
      {/* Left: Mobile trigger & System status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252A30] bg-[#111418] text-[#8B949E] hover:border-[#363E48] hover:text-[#F2F4F7] lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-2 rounded-full border border-[#252A30] bg-[#111418] px-2.5 py-1 text-[10px] font-mono sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#8B949E]">DEV_OS</span>
          <span className="text-[#57606A]">::</span>
          <span className="text-[#00E5FF]">ONLINE</span>
        </div>
      </div>

      {/* Middle: Global Search / Command Palette Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="flex w-full max-w-xs sm:max-w-md items-center justify-between rounded-lg border border-[#252A30] bg-[#111418] px-3 py-1.5 text-xs font-mono text-[#8B949E] transition-all hover:border-[#363E48] hover:text-[#F2F4F7] hover:shadow-[0_0_12px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2">
          <IconSearch className="h-3.5 w-3.5 text-[#57606A]" />
          <span className="truncate">Search devs, stacks, or commands...</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="hidden sm:inline-flex items-center rounded border border-[#252A30] bg-[#161A1F] px-1.5 py-0.5 text-[9px] font-mono text-[#8B949E]">
            Ctrl
          </kbd>
          <kbd className="hidden sm:inline-flex items-center rounded border border-[#252A30] bg-[#161A1F] px-1.5 py-0.5 text-[9px] font-mono text-[#8B949E]">
            K
          </kbd>
        </div>
      </button>

      {/* Right: Quick actions & User menu */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              to="/projects"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#252A30] bg-[#161A1F] px-2.5 py-1.5 text-xs font-mono font-medium text-[#F2F4F7] hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors"
            >
              <IconPlus className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span>Project</span>
            </Link>

            <Link
              to="/requests"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#252A30] bg-[#111418] text-[#8B949E] hover:border-[#363E48] hover:text-[#F2F4F7] transition-colors"
              title="Connection requests"
            >
              <IconBell className="h-4 w-4" />
              {requests?.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00E5FF] px-1 text-[9px] font-bold font-mono text-[#0B0D0F]">
                  {requests.length}
                </span>
              )}
            </Link>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="flex items-center gap-2 rounded-lg border border-[#252A30] bg-[#111418] p-1 hover:border-[#363E48] transition-colors"
              >
                <img
                  className="h-6 w-6 rounded-md object-cover"
                  src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                  alt={user.firstName}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#252A30] bg-[#111418] p-1.5 shadow-2xl shadow-black/90 z-50 animate-in fade-in zoom-in-95">
                  <div className="border-b border-[#252A30] px-3 py-2">
                    <p className="text-xs font-semibold text-[#F2F4F7] truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="font-mono text-[10px] text-[#57606A] truncate">
                      {user.email || `@${user.firstName?.toLowerCase()}`}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-mono text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                    >
                      <IconSettings className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      to="/connections"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-mono text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                    >
                      <IconNetwork className="h-3.5 w-3.5" />
                      <span>My Network</span>
                    </Link>
                    <Link
                      to="/projects"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-mono text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                    >
                      <IconProjects className="h-3.5 w-3.5" />
                      <span>Projects</span>
                    </Link>
                    <Link
                      to="/requests"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-mono text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                    >
                      <IconRequests className="h-3.5 w-3.5" />
                      <span>Requests</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#252A30] pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-mono text-[#F43F5E] hover:bg-[#F43F5E]/10"
                    >
                      <IconLogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-1.5 text-xs font-mono font-bold text-[#0B0D0F] hover:bg-[#33EBFF] transition-colors"
          >
            <span>INITIALIZE</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;

