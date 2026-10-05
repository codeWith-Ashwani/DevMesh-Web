import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import Avatar from "./ui/Avatar";
import DeveloperGuide from "./DeveloperGuide";
import { IconCommand, IconBell, IconMenu, IconLogOut } from "./ui/Icons";
const names = {
  "/": "Overview",
  "/feed": "Discover",
  "/projects": "Projects",
  "/collaborate": "Find your team",
  "/messages": "Messages",
  "/connections": "Connections",
  "/requests": "Requests",
  "/profile": "My profile",
};
export default function Navbar({ onOpenCommandPalette, onToggleMobileMenu }) {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch {
      setError("Sign out failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <header className="workspace-header">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation menu"
          className="icon-button lg:hidden"
          onClick={onToggleMobileMenu}
        >
          <IconMenu />
        </button>
        <div className="text-sm truncate">
          <span className="hidden sm:inline text-[#7B91B5] font-mono">
            workspace /{" "}
          </span>
          <span className="text-[#EEF4FF]">
            {pathname.includes("/workspace")
              ? "Team workspace"
              : names["/" + pathname.split("/")[1]] || "Messages"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="command-trigger"
          aria-label="Jump to a page"
          onClick={onOpenCommandPalette}
        >
          <IconCommand />
          <span className="hidden md:inline">Jump to...</span>
          <kbd className="hidden sm:inline">⌘ / Ctrl K</kbd>
        </button>
        <Link
          className="icon-button relative"
          aria-label="Connection requests"
          to="/requests"
        >
          <IconBell />
          {requests?.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#82B4FF]" />
          )}
        </Link>
        <DeveloperGuide />
        <Link to="/profile" aria-label="My profile">
          <Avatar user={user} className="h-8 w-8" />
        </Link>
        <button
          className="icon-button"
          aria-label="Sign out"
          title="Sign out"
          disabled={busy}
          onClick={logout}
        >
          <IconLogOut />
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="absolute top-full right-4 border border-rose-400 rounded-lg p-3 bg-[#101A2E] text-sm"
        >
          {error}
        </div>
      )}
    </header>
  );
}
