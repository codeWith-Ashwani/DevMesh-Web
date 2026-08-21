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
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-[#1E2442] bg-[#0D1020] shadow-2xl shadow-black/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 border-b border-[#1E2442] px-4 py-3.5 bg-[#11152A]">
          <IconTerminal className="w-4 h-4 text-[#3B82F6]" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-xs text-[#F5F7FF] placeholder-[#515870] outline-none font-medium"
            placeholder="Type a command or jump to workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-[#1E2442] bg-[#0D1020] px-2 py-0.5 text-[9px] font-mono text-[#8B91A7]">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#515870]">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? "bg-[#151A32] text-[#F5F7FF] border border-[#232B4E] shadow-sm font-semibold"
                      : "text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#3B82F6]" : "text-[#8B91A7]"}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-[#515870] uppercase font-bold tracking-wider">{item.category}</span>
                </button>
              );
            })
          )}

        </div>

        <div className="flex items-center justify-between border-t border-[#1E2442] bg-[#080A14] px-4 py-2.5 text-xs text-[#515870]">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="rounded border border-[#1E2442] bg-[#11152A] px-1 text-[9px] text-[#8B91A7]">↑</kbd>
            <kbd className="rounded border border-[#1E2442] bg-[#11152A] px-1 text-[9px] text-[#8B91A7]">↓</kbd>
            <span>Select:</span>
            <kbd className="rounded border border-[#1E2442] bg-[#11152A] px-1 text-[9px] text-[#8B91A7]">↵</kbd>
          </div>
          <span className="text-[#3B82F6] font-semibold text-[11px]">DevMesh Studio</span>
        </div>
      </div>
    </div>
  );
}

