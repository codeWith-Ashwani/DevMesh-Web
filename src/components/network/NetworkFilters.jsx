import React from "react";
import {
  IconSearch,
  IconLayers,
  IconCode,
  IconProjects,
  IconNetwork
} from "../ui/Icons";

export default function NetworkFilters({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  stats,
}) {
  const filterOptions = [
    { id: "all", label: "All Nodes", icon: IconLayers, count: stats.totalNodes },
    { id: "developer", label: "Developers", icon: IconNetwork, count: stats.devNodes },
    { id: "skill", label: "Skills", icon: IconCode, count: stats.skillNodes },
    { id: "project", label: "Projects", icon: IconProjects, count: stats.projectNodes },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#252A30] bg-[#111418] p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "bg-[#161A1F] text-[#00E5FF] border border-[#252A30] font-medium"
                    : "text-[#8B949E] hover:bg-[#161A1F] hover:text-[#F2F4F7] border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#00E5FF]" : "text-[#8B949E]"}`} />
                <span>{opt.label}</span>
                <span className="rounded-full bg-[#1C2229] px-1.5 py-0.2 text-[10px] font-mono text-[#57606A]">
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search and View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <input
              type="text"
              className="w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-1.5 pl-8 text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors"
              placeholder="Search node or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IconSearch className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#57606A]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 text-xs text-[#8B949E] hover:text-[#F2F4F7]"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-[#252A30] bg-[#161A1F] p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewMode === "graph"
                  ? "bg-[#111418] text-[#00E5FF] border border-[#252A30]"
                  : "text-[#8B949E] hover:text-[#F2F4F7]"
              }`}
            >
              <IconNetwork className="h-3 w-3" />
              <span>Graph</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#111418] text-[#00E5FF] border border-[#252A30]"
                  : "text-[#8B949E] hover:text-[#F2F4F7]"
              }`}
            >
              <IconLayers className="h-3 w-3" />
              <span>Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Topology Legend Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#252A30] pt-2 text-xs text-[#8B949E]">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#00E5FF] bg-[#00E5FF]/20" />
            <span className="text-[#F2F4F7]">Developer (Circle)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rotate-45 border border-[#38BDF8] bg-[#38BDF8]/20" />
            <span className="text-[#F2F4F7]">Skill (Diamond)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-[#10B981] bg-[#10B981]/20" />
            <span className="text-[#F2F4F7]">Project (Hex/Box)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#57606A] font-mono">
          <span>{stats.totalLinks} links</span>
          <span>·</span>
          <span>Click node to inspect</span>
        </div>
      </div>
    </div>
  );
}

