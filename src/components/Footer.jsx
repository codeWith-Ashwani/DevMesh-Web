import React from "react";

function Footer() {
  return (
    <footer className="mt-auto border-t border-[#252A30] bg-[#0B0D0F] px-4 py-3 text-xs text-[#57606A]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#8B949E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>DevMesh</span>
          </span>
          <span>·</span>
          <span>Developer Network</span>
          <span>·</span>
          <span className="text-[#38BDF8]">Online</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden sm:inline">Press <kbd className="rounded border border-[#252A30] bg-[#161A1F] px-1 py-0.5 text-[10px] font-mono text-[#8B949E]">Ctrl+K</kbd> for quick actions</span>
          <span>&copy; {new Date().getFullYear()} DevMesh</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


