import React from "react";

function Footer() {
  return (
    <footer className="mt-auto border-t border-[#252A30] bg-[#0B0D0F] px-4 py-3 text-xs font-mono text-[#57606A]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#8B949E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>DevMesh OS</span>
          </span>
          <span>·</span>
          <span>Encrypted Node Network</span>
          <span>·</span>
          <span className="text-[#00E5FF]/70">v1.0.4-prod</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline">Press <kbd className="rounded border border-[#252A30] bg-[#161A1F] px-1 text-[9px] text-[#8B949E]">Ctrl+K</kbd> to execute commands</span>
          <span>© {new Date().getFullYear()} DEVMESH SYSTEM</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

