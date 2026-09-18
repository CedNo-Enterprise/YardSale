/**
 * The hero image: a morning's route drawn over a few streets. It is the one
 * decorative element on the site, and it is the product — six stops, in order,
 * with the one you are standing at picked out.
 */
export function RouteSketch({ className }: { className?: string }) {
  const stops = [
    { x: 46, y: 196 },
    { x: 104, y: 118 },
    { x: 178, y: 148 },
    { x: 236, y: 66 },
    { x: 318, y: 96 },
    { x: 366, y: 186 },
  ];

  const routeLine = stops
    .map((stop, index) => (index === 0 ? `M ${stop.x} ${stop.y}` : `L ${stop.x} ${stop.y}`))
    .join(" ");

  return (
    <svg
      viewBox="0 0 412 252"
      className={className}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="var(--haze)" strokeWidth="10" strokeLinecap="round">
        <path d="M18 168 L 394 128" />
        <path d="M22 76 L 390 44" />
        <path d="M78 18 L 108 238" />
        <path d="M262 14 L 286 238" />
      </g>

      <path
        d={routeLine}
        fill="none"
        stroke="var(--route)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 7"
      />

      {stops.map((stop, index) => {
        const last = index === stops.length - 1;
        return (
          <g key={index}>
            <circle
              cx={stop.x}
              cy={stop.y}
              r={last ? 15 : 13}
              fill={last ? "var(--flag)" : "var(--card)"}
              stroke={last ? "var(--flag)" : "var(--route)"}
              strokeWidth="2.5"
            />
            <text
              x={stop.x}
              y={stop.y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={last ? "#ffffff" : "var(--ink)"}
              fontFamily="var(--font-display)"
            >
              {index + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
