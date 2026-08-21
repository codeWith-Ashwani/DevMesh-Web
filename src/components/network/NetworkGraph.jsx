import React, { useState, useEffect, useRef, useMemo } from "react";
import NetworkNode from "./NetworkNode";
import {
  IconZoomIn,
  IconZoomOut,
  IconRotateCcw
} from "../ui/Icons";

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
        setDimensions({
          width: clientWidth || 900,
          height: clientHeight || 600,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Compute Spring-Relaxation Physics Layout with useMemo
  const graphNodes = useMemo(() => {
    if (!nodes.length) return [];

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    // Initialize positions in concentric clusters based on type (deterministic offsets)
    const initial = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const pseudoOffset = Math.sin(i * 12.9898 + 78.233) * 25;
      let radius = 180;
      if (node.type === "developer") radius = node.isCurrentUser ? 30 : 220;
      else if (node.type === "skill") radius = 120;
      else if (node.type === "project") radius = 280;

      return {
        ...node,
        x: cx + Math.cos(angle) * (radius + pseudoOffset),
        y: cy + Math.sin(angle) * (radius + pseudoOffset),
        vx: 0,
        vy: 0,
      };
    });

    // Run force simulation iterations
    const nodeMap = new Map(initial.map((n) => [n.id, n]));
    const linkPairs = links
      .map((l) => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        type: l.type,
      }))
      .filter((l) => l.source && l.target);

    const iterations = 80;
    const kRepel = 2400;
    const kAttract = 0.04;
    const damping = 0.85;

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all node pairs
      for (let i = 0; i < initial.length; i++) {
        for (let j = i + 1; j < initial.length; j++) {
          const n1 = initial[i];
          const n2 = initial[j];
          const nudge = (i % 2 === 0 ? 1 : -1) * 0.01;
          const dx = (n2.x - n1.x) || nudge;
          const dy = (n2.y - n1.y) || nudge;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 320) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }


      // Attraction along links
      for (const link of linkPairs) {
        const { source, target } = link;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = link.type === "dev-skill" ? 110 : link.type === "proj-skill" ? 130 : 160;
        const displacement = dist - idealDist;
        const force = displacement * kAttract;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      // Centering force & update positions
      for (const node of initial) {
        node.vx += (cx - node.x) * 0.015;
        node.vy += (cy - node.y) * 0.015;

        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
    }

    return initial;
  }, [nodes, links, dimensions]);


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
    if (node.data?.skills?.some((s) => s.toLowerCase().includes(q))) return true;
    if (node.data?.techStack?.some((s) => s.toLowerCase().includes(q))) return true;
    return false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] rounded-2xl border border-[#1E2442] bg-[#080A14] overflow-hidden select-none shadow-2xl"
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
          <pattern id="grid-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1E2442" opacity="0.6" />
          </pattern>
        </defs>

        <rect id="canvas-bg" width="100%" height="100%" fill="url(#grid-dots)" />

        {/* Scaled & Translated World */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
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
                ? "#3B82F6"
                : link.type === "dev-dev"
                ? "#10B981"
                : link.type === "proj-skill"
                ? "#8B5CF6"
                : "#1E2442";

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
              const isDimmed = !isVisible || (hasActiveFocus && !isSelected && !isHovered && !isNeighbor);

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
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-[#1E2442] bg-[#0D1020]/95 px-3.5 py-2.5 text-xs shadow-2xl backdrop-blur-md transition-all duration-75"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 12,
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="status-dot-blue" />
            <span className="font-bold text-[#F5F7FF]">{hoveredNode.label}</span>
          </div>
          <p className="text-[10px] text-[#8B91A7] uppercase font-semibold tracking-wider">
            {hoveredNode.type}
            {hoveredNode.isConnection && " · Direct Peer"}
          </p>
          {hoveredNode.data?.skills?.length > 0 && (
            <p className="mt-1 text-[11px] text-[#8B91A7]">
              Stack: {hoveredNode.data.skills.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Canvas Viewport Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-[#1E2442] bg-[#0D1020]/90 p-1.5 backdrop-blur-md shadow-lg">
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
          title="Zoom In"
        >
          <IconZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
          title="Zoom Out"
        >
          <IconZoomOut className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-[#1E2442]" />
        <button
          onClick={handleResetZoom}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] transition-colors"
          title="Reset Zoom & Center"
        >
          <IconRotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Real-Time Topology HUD indicator */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 rounded-xl border border-[#1E2442] bg-[#0D1020]/90 px-3 py-1.5 text-xs text-[#8B91A7] backdrop-blur-md shadow-md">
        <span className="status-dot-active" />
        <span className="font-semibold text-[11px] text-[#F5F7FF]">Live Network Mesh</span>
      </div>
    </div>
  );
}

