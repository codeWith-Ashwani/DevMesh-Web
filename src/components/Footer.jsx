import React from "react";

function Footer() {
  return (
    <footer className="mt-auto border-t border-[#1E2442] bg-[#080A14] px-4 py-3.5 text-xs text-[#8B91A7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[#F5F7FF] font-semibold">
            <span className="status-dot-blue" />
            <span>DevMesh</span>
          </span>
          <span className="text-[#515870]">·</span>
          <span>Developer Ecosystem</span>
          <span className="text-[#515870]">·</span>
          <span className="text-[#10B981] font-semibold">Mesh Online</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden sm:inline">Press <kbd className="rounded-md border border-[#1E2442] bg-[#11152A] px-1.5 py-0.5 text-[10px] font-mono text-[#8B91A7]">Ctrl+K</kbd> for command palette</span>
          <span>&copy; {new Date().getFullYear()} DevMesh</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;



