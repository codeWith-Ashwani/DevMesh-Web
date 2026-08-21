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
    <div className="fintech-card flex flex-col gap-3.5 rounded-2xl border border-[#1E2442] p-4 shadow-xl">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-all ${
                  isActive
                    ? "bg-[#151A32] text-[#F5F7FF] border border-[#232B4E] font-semibold shadow-sm"
                    : "text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#3B82F6]" : "text-[#8B91A7]"}`} />
                <span>{opt.label}</span>
                <span className="rounded-full bg-[#11152A] px-2 py-0.5 text-[10px] font-bold font-mono text-[#8B91A7]">
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search and View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <input
              type="text"
              className="w-full rounded-xl border border-[#1E2442] bg-[#11152A] px-3.5 py-1.5 pl-9 text-xs text-[#F5F7FF] placeholder-[#515870] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors"
              placeholder="Search node or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-2 h-3.5 w-3.5 text-[#515870]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1.5 text-xs text-[#8B91A7] hover:text-[#F5F7FF]"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-[#1E2442] bg-[#11152A] p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
                viewMode === "graph"
                  ? "bg-[#0D1020] text-[#3B82F6] border border-[#1E2442] shadow-sm"
                  : "text-[#8B91A7] hover:text-[#F5F7FF]"
              }`}
            >
              <IconNetwork className="h-3.5 w-3.5" />
              <span>Graph</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
                viewMode === "grid"
                  ? "bg-[#0D1020] text-[#3B82F6] border border-[#1E2442] shadow-sm"
                  : "text-[#8B91A7] hover:text-[#F5F7FF]"
              }`}
            >
              <IconLayers className="h-3.5 w-3.5" />
              <span>Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Topology Legend Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#1E2442] pt-2.5 text-xs text-[#8B91A7]">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#3B82F6] bg-[#3B82F6]/30 shadow-sm" />
            <span className="text-[#F5F7FF] font-medium">Developer (Circle)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rotate-45 border border-[#60A5FA] bg-[#60A5FA]/30" />
            <span className="text-[#F5F7FF] font-medium">Skill (Diamond)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-[#10B981] bg-[#10B981]/30" />
            <span className="text-[#F5F7FF] font-medium">Project (Box)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#515870] font-medium">
          <span>{stats.totalLinks} relationships mapped</span>
          <span>·</span>
          <span>Click node to inspect</span>
        </div>
      </div>
    </div>
  );
}


