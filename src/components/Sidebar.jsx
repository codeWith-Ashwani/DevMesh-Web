import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./ui/Avatar";
import { prefetchRoute } from "../utils/routeModules";
import {
  IconHome,
  IconExplore,
  IconNetwork,
  IconRequests,
  IconProjects,
  IconMessages,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "./ui/Icons";

const groups = [
  {
    name: "Workbench",
    items: [
      ["Overview", "/", IconHome],
      ["Projects", "/projects", IconProjects],
      ["Find your team", "/collaborate", IconExplore],
      ["Messages", "/messages", IconMessages],
    ],
  },
  {
    name: "Community",
    items: [
      ["Discover developers", "/feed", IconExplore],
      ["Connections", "/connections", IconNetwork],
      ["Requests", "/requests", IconRequests],
    ],
  },
];
export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const { pathname } = useLocation();
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const ref = useRef(null);
  const expanded = !isCollapsed || isMobileOpen;
  useEffect(() => {
    if (!isMobileOpen) return;
    const trigger = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("a")?.focus();
    const key = (event) => {
      if (event.key === "Escape") setIsMobileOpen(false);
      if (event.key === "Tab") {
        const elements = [...ref.current.querySelectorAll("a, button")].filter(
          (el) => el.getClientRects().length,
        );
        if (event.shiftKey && document.activeElement === elements[0]) {
          event.preventDefault();
          elements.at(-1).focus();
        }
        if (!event.shiftKey && document.activeElement === elements.at(-1)) {
          event.preventDefault();
          elements[0].focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = previous;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [isMobileOpen, setIsMobileOpen]);
  const active = (path) =>
    path === "/"
      ? pathname === "/"
      : pathname.startsWith(path) ||
        (path === "/messages" && pathname.startsWith("/chat"));
  return (
    <>
      {isMobileOpen && (
        <button
          aria-label="Close navigation backdrop"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        ref={ref}
        aria-label="Main navigation"
        role={isMobileOpen ? "dialog" : undefined}
        aria-modal={isMobileOpen || undefined}
        className={`workspace-sidebar ${isCollapsed ? "lg:w-[76px]" : "lg:w-[248px]"} ${isMobileOpen ? "mobile-open" : ""}`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between gap-2 border-b border-[#293B5B] px-4">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3"
            aria-label="DevMesh home"
          >
            <span className="brand-mark">{"<>"}</span>
            {expanded && (
              <span>
                <strong className="block text-lg tracking-tight">
                  DevMesh<span className="text-[#82B4FF]">.</span>
                </strong>
                <span className="eyebrow text-[9px]">
                  build better, together
                </span>
              </span>
            )}
          </Link>
          {expanded && (
            <button
              className="icon-button lg:hidden"
              aria-label="Close navigation"
              onClick={() => setIsMobileOpen(false)}
            >
              <IconX />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
          {groups.map((group) => (
            <div key={group.name}>
              {expanded && <p className="eyebrow px-3 mb-3">{group.name}</p>}
              <div className="space-y-1">
                {group.items.map(([label, path, icon]) => {
                  const Icon = icon;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onPointerEnter={() => prefetchRoute(path)}
                      onFocus={() => prefetchRoute(path)}
                      onTouchStart={() => prefetchRoute(path)}
                      aria-label={label}
                      aria-current={active(path) ? "page" : undefined}
                      title={!expanded ? label : undefined}
                      onClick={() => setIsMobileOpen(false)}
                      className={`nav-link ${active(path) ? "active" : ""} ${!expanded ? "justify-center" : ""}`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {expanded && <span>{label}</span>}
                      {path === "/requests" &&
                        requests?.length > 0 &&
                        expanded && (
                          <span className="ml-auto font-mono text-xs">
                            {requests.length}
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <Link
            to="/profile"
            aria-label="My profile"
            aria-current={active("/profile") ? "page" : undefined}
            onClick={() => setIsMobileOpen(false)}
            className={`nav-link ${active("/profile") ? "active" : ""} ${!expanded ? "justify-center" : ""}`}
          >
            <IconSettings className="h-[18px] w-[18px] shrink-0" />
            {expanded && "My profile"}
          </Link>
        </nav>
        <div className="border-t border-[#293B5B] p-3 flex items-center justify-between gap-2">
          <Link
            to="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 min-w-0"
            aria-label="Open my profile"
          >
            <Avatar user={user} className="h-9 w-9 shrink-0" />
            {expanded && (
              <span className="min-w-0">
                <strong className="block truncate text-xs">
                  {user?.firstName || "Developer"} {user?.lastName}
                </strong>
                <span className="text-[11px] text-[#A5B4CE]">
                  Personal workspace
                </span>
              </span>
            )}
          </Link>
          {expanded && (
            <button
              className="icon-button hidden lg:flex"
              aria-label="Collapse sidebar"
              onClick={() => setIsCollapsed(true)}
            >
              <IconChevronLeft />
            </button>
          )}
        </div>
        {!expanded && (
          <button
            className="icon-button mx-auto my-3"
            aria-label="Expand sidebar"
            onClick={() => setIsCollapsed(false)}
          >
            <IconChevronRight />
          </button>
        )}
      </aside>
    </>
  );
}
