import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconHome,
  IconExplore,
  IconNetwork,
  IconRequests,
  IconProjects,
  IconSettings,
  IconTerminal
} from "./Icons";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const navigationActions = [
    { id: "home", label: "Dashboard / Workspace", category: "Navigation", icon: IconHome, path: "/" },
    { id: "explore", label: "Explore Developers", category: "Navigation", icon: IconExplore, path: "/feed" },
    { id: "network", label: "Developer Network & Nodes", category: "Navigation", icon: IconNetwork, path: "/connections" },
    { id: "requests", label: "Connection Requests", category: "Navigation", icon: IconRequests, path: "/requests" },
    { id: "projects", label: "Collaboration Projects", category: "Navigation", icon: IconProjects, path: "/projects" },
    { id: "profile", label: "Developer Profile & Settings", category: "System", icon: IconSettings, path: "/profile" },
  ];

  const filtered = navigationActions.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const activeIndex = selectedIndex >= filtered.length ? 0 : selectedIndex;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          navigate(filtered[activeIndex].path);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex, navigate, onClose]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-xl rounded-xl border border-[#252A30] bg-[#111418] shadow-2xl shadow-black/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 border-b border-[#252A30] px-4 py-3 bg-[#161A1F]">
          <IconTerminal className="w-4 h-4 text-[#00E5FF]" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-xs font-mono text-[#F2F4F7] placeholder-[#57606A] outline-none"
            placeholder="Type a command or jump to workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-[#252A30] bg-[#111418] px-1.5 py-0.5 text-[9px] font-mono text-[#8B949E]">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#57606A]">
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    isSelected
                      ? "bg-[#1C2229] text-[#00E5FF] border border-[#252A30]"
                      : "text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#00E5FF]" : "text-[#8B949E]"}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-[#57606A] uppercase tracking-wider">{item.category}</span>
                </button>
              );
            })
          )}

        </div>

        <div className="flex items-center justify-between border-t border-[#252A30] bg-[#0B0D0F] px-4 py-2 text-[11px] font-mono text-[#57606A]">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded border border-[#252A30] bg-[#161A1F] px-1 text-[9px] text-[#8B949E]">↑</kbd>
            <kbd className="rounded border border-[#252A30] bg-[#161A1F] px-1 text-[9px] text-[#8B949E]">↓</kbd>
            <span>Select:</span>
            <kbd className="rounded border border-[#252A30] bg-[#161A1F] px-1 text-[9px] text-[#8B949E]">↵</kbd>
          </div>
          <span className="text-[#00E5FF]/70">DevMesh OS v1.0</span>
        </div>
      </div>
    </div>
  );
}
