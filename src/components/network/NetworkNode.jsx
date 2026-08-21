import React from "react";

export default function NetworkNode({
  node,
  isSelected,
  isHovered,
  isNeighbor,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const { x = 0, y = 0, type, label, data } = node;

  const opacity = isDimmed ? 0.2 : 1;
  const cursor = "pointer";

  // Developer Node (Circle + Avatar)
  if (type === "developer") {
    const isCurrentUser = data?._id === "current_user" || node.isCurrentUser;
    const isConnection = node.isConnection;
    const photoUrl = data?.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV";
    const patternId = `avatar_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        className="transition-opacity duration-150"
        style={{ opacity, cursor }}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="40" height="40" x="-20" y="-20">
            <image href={photoUrl} x="0" y="0" width="40" height="40" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>

        {/* Pulse / Selection Ring */}
        {(isSelected || isHovered) && (
          <circle
            r="26"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="animate-spin"
            style={{ transformOrigin: "0 0", animationDuration: "8s" }}
          />
        )}

        {/* Halo for direct peer connection */}
        {isConnection && (
          <circle r="23" fill="none" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.6" />
        )}

        {/* Base Circle with Avatar Pattern */}
        <circle
          r="20"
          fill={`url(#${patternId})`}
          stroke={isSelected ? "#00E5FF" : isNeighbor ? "#38BDF8" : isConnection ? "#10B981" : "#252A30"}
          strokeWidth={isSelected ? 3 : isNeighbor ? 2 : 1.5}
        />

        {/* Current user or status badge */}
        {isCurrentUser ? (
          <circle cx="14" cy="-14" r="5" fill="#00E5FF" stroke="#0B0D0F" strokeWidth="1.5" />
        ) : (
          <circle cx="14" cy="-14" r="4.5" fill={isConnection ? "#10B981" : "#57606A"} stroke="#0B0D0F" strokeWidth="1.5" />
        )}

        {/* Label */}
        <text
          y="32"
          textAnchor="middle"
          fill={isSelected ? "#00E5FF" : isNeighbor ? "#F2F4F7" : "#8B949E"}
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
          fontWeight={isSelected || isNeighbor ? "bold" : "normal"}
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      </g>
    );
  }

  // Skill Node (Diamond Shape)
  if (type === "skill") {
    return (
      <g
        transform={`translate(${x}, ${y})`}
        className="transition-opacity duration-150"
        style={{ opacity, cursor }}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        {/* Selection Ring */}
        {(isSelected || isHovered) && (
          <polygon
            points="0,-24 24,0 0,24 -24,0"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Main Diamond */}
        <polygon
          points="0,-17 17,0 0,17 -17,0"
          fill="#161A1F"
          stroke={isSelected ? "#00E5FF" : isNeighbor ? "#38BDF8" : "#252A30"}
          strokeWidth={isSelected ? 2.5 : isNeighbor ? 2 : 1.5}
        />

        {/* Center Tag Symbol */}
        <text
          y="3"
          textAnchor="middle"
          fill={isSelected ? "#00E5FF" : "#38BDF8"}
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          className="select-none pointer-events-none"
        >
          &lt;/&gt;
        </text>

        {/* Label below */}
        <text
          y="28"
          textAnchor="middle"
          fill={isSelected ? "#00E5FF" : isNeighbor ? "#F2F4F7" : "#8B949E"}
          fontSize="9.5"
          fontFamily="JetBrains Mono, monospace"
          fontWeight={isSelected || isNeighbor ? "bold" : "normal"}
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      </g>
    );
  }

  // Project Node (Hexagon / Technical Box)
  if (type === "project") {
    const stageColor =
      data?.stage === "Launched"
        ? "#10B981"
        : data?.stage === "Building"
        ? "#00E5FF"
        : "#38BDF8";

    return (
      <g
        transform={`translate(${x}, ${y})`}
        className="transition-opacity duration-150"
        style={{ opacity, cursor }}
        onMouseEnter={(e) => onMouseEnter(node, e)}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        {/* Selection Ring */}
        {(isSelected || isHovered) && (
          <rect
            x="-24"
            y="-24"
            width="48"
            height="48"
            rx="12"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Project Box */}
        <rect
          x="-18"
          y="-18"
          width="36"
          height="36"
          rx="8"
          fill="#161A1F"
          stroke={isSelected ? "#00E5FF" : isNeighbor ? stageColor : "#252A30"}
          strokeWidth={isSelected ? 2.5 : isNeighbor ? 2 : 1.5}
        />

        {/* Project Icon Symbol */}
        <polygon
          points="0,-8 8,-3 8,6 0,11 -8,6 -8,-3"
          fill={stageColor}
          opacity="0.8"
        />

        {/* Label */}
        <text
          y="30"
          textAnchor="middle"
          fill={isSelected ? "#00E5FF" : isNeighbor ? "#F2F4F7" : "#8B949E"}
          fontSize="9.5"
          fontFamily="JetBrains Mono, monospace"
          fontWeight={isSelected || isNeighbor ? "bold" : "normal"}
          className="select-none pointer-events-none"
        >
          {label.length > 18 ? label.slice(0, 16) + "…" : label}
        </text>
      </g>
    );
  }

  return null;
}
