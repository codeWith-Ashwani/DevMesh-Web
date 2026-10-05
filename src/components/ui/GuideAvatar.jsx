export default function GuideAvatar({
  variant = "patch",
  className = "h-16 w-16",
}) {
  const color = variant === "pixel" ? "#C4B5FD" : "#82B4FF";
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="48" cy="87" rx="26" ry="5" fill={color} opacity=".12" />
      <path d="M48 13v10" stroke={color} strokeWidth="3" />
      <circle cx="48" cy="10" r="4" fill={color} />
      <rect
        x="20"
        y="23"
        width="56"
        height="46"
        rx={variant === "pixel" ? "18" : "12"}
        fill="#1D3050"
        stroke={color}
        strokeWidth="2.5"
      />
      <rect x="27" y="32" width="42" height="26" rx="7" fill="#0B1020" />
      {variant === "pixel" ? (
        <path
          d="m34 42 4-3 4 3m12 0 4-3 4 3"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <rect x="34" y="39" width="6" height="9" rx="2" fill={color} />
          <rect x="56" y="39" width="6" height="9" rx="2" fill={color} />
        </>
      )}
      <path d="M44 51h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M15 38v15m66-15v15"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M34 70v7m28-7v7"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 81h12m16 0h12"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m40 63-3 2 3 2m16-4 3 2-3 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
