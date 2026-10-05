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
    const photoUrl =
      data?.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV";
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
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="44"
            height="44"
            x="-22"
            y="-22"
          >
            <image
              href={photoUrl}
              x="0"
              y="0"
              width="44"
              height="44"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>

        {/* Pulse / Selection Ring */}
        {(isSelected || isHovered) && (
          <circle
            r="28"
            fill="none"
            stroke="#B7ED82"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="animate-spin"
            style={{ transformOrigin: "0 0", animationDuration: "10s" }}
          />
        )}

        {/* Halo for direct peer connection */}
        {isConnection && (
          <circle
            r="25"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        )}

        {/* Base Circle with Avatar Pattern */}
        <circle
          r="22"
          fill={`url(#${patternId})`}
          stroke={
            isSelected
              ? "#B7ED82"
              : isNeighbor
                ? "#B7ED82"
                : isConnection
                  ? "#10B981"
                  : "#26383D"
          }
          strokeWidth={isSelected ? 3 : isNeighbor ? 2 : 1.5}
        />

        {/* Current user or status badge */}
        {isCurrentUser ? (
          <circle
            cx="15"
            cy="-15"
            r="5"
            fill="#B7ED82"
            stroke="#0A1012"
            strokeWidth="1.5"
          />
        ) : (
          <circle
            cx="15"
            cy="-15"
            r="4.5"
            fill={isConnection ? "#10B981" : "#718986"}
            stroke="#0A1012"
            strokeWidth="1.5"
          />
        )}

        {/* Label */}
        <text
          y="34"
          textAnchor="middle"
          fill={isSelected ? "#B7ED82" : isNeighbor ? "#EDF4F2" : "#9AADAA"}
          fontSize="10"
          fontFamily="Inter, sans-serif"
          fontWeight={isSelected || isNeighbor ? "600" : "500"}
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
            points="0,-26 26,0 0,26 -26,0"
            fill="none"
            stroke="#B7ED82"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Main Diamond */}
        <polygon
          points="0,-18 18,0 0,18 -18,0"
          fill="#142024"
          stroke={isSelected ? "#B7ED82" : isNeighbor ? "#B7ED82" : "#26383D"}
          strokeWidth={isSelected ? 2.5 : isNeighbor ? 2 : 1.5}
        />

        {/* Center Tag Symbol */}
        <text
          y="3.5"
          textAnchor="middle"
          fill={isSelected ? "#B7ED82" : "#B7ED82"}
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          className="select-none pointer-events-none"
        >
          &lt;/&gt;
        </text>

        {/* Label below */}
        <text
          y="30"
          textAnchor="middle"
          fill={isSelected ? "#B7ED82" : isNeighbor ? "#EDF4F2" : "#9AADAA"}
          fontSize="9.5"
          fontFamily="JetBrains Mono, monospace"
          fontWeight={isSelected || isNeighbor ? "600" : "400"}
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
          ? "#B7ED82"
          : "#06B6D4";

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
            x="-26"
            y="-26"
            width="52"
            height="52"
            rx="14"
            fill="none"
            stroke="#B7ED82"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Project Box */}
        <rect
          x="-19"
          y="-19"
          width="38"
          height="38"
          rx="10"
          fill="#142024"
          stroke={isSelected ? "#B7ED82" : isNeighbor ? stageColor : "#26383D"}
          strokeWidth={isSelected ? 2.5 : isNeighbor ? 2 : 1.5}
        />

        {/* Project Icon Symbol */}
        <polygon
          points="0,-9 9,-4 9,6 0,11 -9,6 -9,-4"
          fill={stageColor}
          opacity="0.9"
        />

        {/* Label */}
        <text
          y="32"
          textAnchor="middle"
          fill={isSelected ? "#B7ED82" : isNeighbor ? "#EDF4F2" : "#9AADAA"}
          fontSize="9.5"
          fontFamily="Inter, sans-serif"
          fontWeight={isSelected || isNeighbor ? "600" : "500"}
          className="select-none pointer-events-none"
        >
          {label.length > 18 ? label.slice(0, 16) + "…" : label}
        </text>
      </g>
    );
  }

  return null;
}
