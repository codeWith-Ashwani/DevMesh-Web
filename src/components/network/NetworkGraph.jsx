import React, { useState, useEffect, useRef, useMemo } from "react";
import { initialLayout } from '../../utils/networkLayout';
import NetworkNode from "./NetworkNode";
import { IconZoomIn, IconZoomOut, IconRotateCcw } from "../ui/Icons";

export default function NetworkGraph({
  nodes = [],
  links = [],
  selectedNode,
  onSelectNode,
  activeFilter = "all",
  searchQuery = "",
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Measure container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const width = clientWidth || 900, height = clientHeight || 600;
        setDimensions(current => current.width === width && current.height === height ? current : { width, height });
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render immediately; the force simulation runs outside the UI thread.
  const [layout, setLayout] = useState(null);
  useEffect(() => {
    if (!nodes.length || typeof Worker === 'undefined') return;
    const worker = new Worker(new URL('../../utils/networkLayout.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data: positions }) => setLayout({ nodes, links, dimensions, positions });
    worker.postMessage({ nodes: nodes.map(({ id, type, isCurrentUser }) => ({ id, type, isCurrentUser })), links: links.map(({ source, target, type }) => ({ source, target, type })), dimensions });
    return () => worker.terminate();
  }, [nodes, links, dimensions]);
  const graphNodes = useMemo(() => {
    if (layout?.nodes === nodes && layout.links === links && layout.dimensions === dimensions) {
      const positions = new Map(layout.positions.map(position => [position.id, position]));
      return nodes.map(node => ({ ...node, ...positions.get(node.id) }));
    }
    return initialLayout(nodes, dimensions);
  }, [nodes, links, dimensions, layout]);

  // Neighbor connectivity lookup
  const { neighborSet, connectedLinkSet } = useMemo(() => {
    const activeNode = hoveredNode || selectedNode;
    const nSet = new Set();
    const lSet = new Set();

    if (!activeNode) return { neighborSet: nSet, connectedLinkSet: lSet };

    links.forEach((l) => {
      if (l.source === activeNode.id || l.target === activeNode.id) {
        nSet.add(l.source);
        nSet.add(l.target);
        lSet.add(`${l.source}->${l.target}`);
        lSet.add(`${l.target}->${l.source}`);
      }
    });

    return { neighborSet: nSet, connectedLinkSet: lSet };
  }, [hoveredNode, selectedNode, links]);

  // Position map for edges
  const positionMap = useMemo(() => {
    const map = new Map();
    graphNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [graphNodes]);

  // Hover handlers
  const handleMouseEnter = (node, e) => {
    setHoveredNode(node);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  // Zoom & Pan controls
  const handleZoomIn = () => {
    setTransform((prev) => ({ ...prev, k: Math.min(prev.k * 1.25, 3) }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({ ...prev, k: Math.max(prev.k / 1.25, 0.4) }));
  };

  const handleResetZoom = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => {
      const newK = Math.max(0.4, Math.min(3, prev.k * zoomFactor));
      return { ...prev, k: newK };
    });
  };

  // Canvas Drag / Pan
  const handleMouseDown = (e) => {
    if (e.target.tagName === "svg" || e.target.id === "canvas-bg") {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Search filter matching
  const isSearchMatch = (node) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (node.label?.toLowerCase().includes(q)) return true;
    if (node.data?.skills?.some((s) => s.toLowerCase().includes(q)))
      return true;
    if (node.data?.techStack?.some((s) => s.toLowerCase().includes(q)))
      return true;
    return false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] rounded-2xl border border-[#293B5B] bg-[#0B1020] overflow-hidden select-none shadow-2xl"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Matrix Pattern */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => onSelectNode(null)}
      >
        <defs>
          <pattern
            id="grid-dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#293B5B" opacity="0.6" />
          </pattern>
        </defs>

        <rect
          id="canvas-bg"
          width="100%"
          height="100%"
          fill="url(#grid-dots)"
        />

        {/* Scaled & Translated World */}
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
        >
          {/* Edges / Relationship Links */}
          <g className="links">
            {links.map((link) => {
              const sourceNode = positionMap.get(link.source);
              const targetNode = positionMap.get(link.target);
              if (!sourceNode || !targetNode) return null;

              const isLinkActive =
                connectedLinkSet.has(`${link.source}->${link.target}`) ||
                connectedLinkSet.has(`${link.target}->${link.source}`);

              const hasActiveSelection = Boolean(hoveredNode || selectedNode);
              const linkOpacity = hasActiveSelection
                ? isLinkActive
                  ? 0.95
                  : 0.08
                : 0.28;

              const strokeColor = isLinkActive
                ? "#82B4FF"
                : link.type === "dev-dev"
                  ? "#10B981"
                  : link.type === "proj-skill"
                    ? "#8B5CF6"
                    : "#293B5B";

              return (
                <line
                  key={`${link.source}-${link.target}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={isLinkActive ? 2.5 : 1.2}
                  strokeOpacity={linkOpacity}
                  strokeDasharray={isLinkActive ? "4 2" : undefined}
                  className="transition-all duration-150"
                />
              );
            })}
          </g>

          {/* Graph Nodes */}
          <g className="nodes">
            {graphNodes.map((node) => {
              // Filtering check
              const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "developer" && node.type === "developer") ||
                (activeFilter === "skill" && node.type === "skill") ||
                (activeFilter === "project" && node.type === "project") ||
                (activeFilter === "connection" && node.isConnection);

              const matchesSearch = isSearchMatch(node);
              const isVisible = matchesFilter && matchesSearch;

              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isNeighbor = neighborSet.has(node.id);

              const hasActiveFocus = Boolean(hoveredNode || selectedNode);
              const isDimmed =
                !isVisible ||
                (hasActiveFocus && !isSelected && !isHovered && !isNeighbor);

              return (
                <NetworkNode
                  key={node.id}
                  node={node}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isNeighbor={isNeighbor}
                  isDimmed={isDimmed}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={onSelectNode}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating HUD Tooltip */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-[#293B5B] bg-[#101A2E]/95 px-3.5 py-2.5 text-xs shadow-2xl backdrop-blur-md transition-all duration-75"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 12,
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="status-dot-blue" />
            <span className="font-bold text-[#EEF4FF]">
              {hoveredNode.label}
            </span>
          </div>
          <p className="text-[10px] text-[#A5B4CE] uppercase font-semibold tracking-wider">
            {hoveredNode.type}
            {hoveredNode.isConnection && " · Direct Peer"}
          </p>
          {hoveredNode.data?.skills?.length > 0 && (
            <p className="mt-1 text-[11px] text-[#A5B4CE]">
              Stack: {hoveredNode.data.skills.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Canvas Viewport Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-[#293B5B] bg-[#101A2E]/90 p-1.5 backdrop-blur-md shadow-lg">
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A5B4CE] hover:bg-[#16233D] hover:text-[#EEF4FF] transition-colors"
          title="Zoom In"
        >
          <IconZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A5B4CE] hover:bg-[#16233D] hover:text-[#EEF4FF] transition-colors"
          title="Zoom Out"
        >
          <IconZoomOut className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-[#293B5B]" />
        <button
          onClick={handleResetZoom}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A5B4CE] hover:bg-[#16233D] hover:text-[#EEF4FF] transition-colors"
          title="Reset Zoom & Center"
        >
          <IconRotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Real-Time Topology HUD indicator */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 rounded-xl border border-[#293B5B] bg-[#101A2E]/90 px-3 py-1.5 text-xs text-[#A5B4CE] backdrop-blur-md shadow-md">
        <span className="status-dot-active" />
        <span className="font-semibold text-[11px] text-[#EEF4FF]">
          Skills & connections
        </span>
      </div>
    </div>
  );
}
