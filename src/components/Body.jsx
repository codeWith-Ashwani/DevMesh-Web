import React, { Suspense, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CommandPalette from "./ui/CommandPalette";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { addRequests } from "../utils/requestsSlice";
import ChatConnectionProvider from "./ChatConnectionProvider";
import { cachedGet } from "../utils/resourceCache";
import PageSkeleton from "./ui/PageSkeleton";
import PageErrorBoundary from './ui/PageErrorBoundary';

function Body() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const authRequest = useRef(null);

  const isAuthPage = location.pathname === "/login";

  const fetchUser = React.useCallback(async () => {
    if (userData || isAuthPage) return;
    authRequest.current?.abort();
    const controller = new AbortController();
    authRequest.current = controller;
    try {
      const user = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      dispatch(addUser(user.data));
      setAuthError("");
    } catch (err) {
      if (controller.signal.aborted || axios.isCancel(err)) return;
      if (err.response?.status === 401) {
        navigate("/login");
      } else
        setAuthError(
          "Your workspace could not load. Check your connection and try again.",
        );
    }
  }, [userData, isAuthPage, dispatch, navigate]);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => {
      if (alive) fetchUser();
    });
    return () => {
      alive = false;
      authRequest.current?.abort();
    };
  }, [fetchUser]);

  useEffect(() => {
    if (!userData?._id) return;
    let alive = true;
    cachedGet("/user/requests/received")
      .then((response) => {
        if (alive) dispatch(addRequests(response.data.data));
      })
      .catch(() => {
        if (alive) dispatch(addRequests([]));
      });
    return () => {
      alive = false;
    };
  }, [userData?._id, dispatch]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const dialog = document.querySelector('[aria-modal="true"]');
        if (dialog && dialog.getAttribute("aria-label") !== "Jump to a page")
          return;
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0B1020] ambient-glow-bg text-[#EEF4FF]">
        <div className="flex-1 flex items-center justify-center">
          <Suspense fallback={<p role="status">Loading page…</p>}>
            <Outlet />
          </Suspense>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userData)
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <span className="brand-mark mb-5">{"<>"}</span>
          <p
            role={authError ? "alert" : "status"}
            className="text-sm text-[#A5B4CE]"
          >
            {authError || "Opening your workspace…"}
          </p>
          {authError && (
            <button
              className="btn-secondary px-4 py-2 mt-4"
              onClick={fetchUser}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );

  return (
    <ChatConnectionProvider key={userData._id}>
    <div className="flex min-h-screen bg-[#0B1020] ambient-glow-bg text-[#EEF4FF]">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 overflow-x-hidden fintech-grid-bg pb-24"
        >
          <Suspense
            fallback={
              <PageSkeleton />
            }
          >
            <PageErrorBoundary key={location.pathname}><Outlet /></PageErrorBoundary>
          </Suspense>
        </main>

        <Footer />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
    </ChatConnectionProvider>
  );
}

export default Body;
