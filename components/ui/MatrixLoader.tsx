import React from 'react';

// Transitions.dev — Matrix dot loader (React, self-contained)
// Drop into any React project — no extra CSS file needed.

// ── Styles ──────────────────────────────────────────────
// Auto-injected on first import. Idempotent (guarded by
// the element id) and SSR-safe (no-ops without document).
const __TRANSITION_STYLES = `
:root {
  --matrix-cycle: 1200ms;
  --matrix-base: #3a3a3e;
  --matrix-active: #b8b8c2;
  --matrix-ease: ease-in-out;
}

.t-matrix {
  display: inline-grid;
  grid-template-columns: repeat(4, var(--matrix-dot, 2.5px));
  grid-auto-rows: var(--matrix-dot, 2.5px);
  gap: var(--matrix-gap, 2px);
  line-height: 0;
  vertical-align: middle;
}
.t-matrix i {
  display: block;
  background: var(--matrix-base, #3a3a3e);
  border-radius: var(--matrix-dot-radius, 0.5px);
  animation: t-matrix-pulse var(--matrix-cycle, 1200ms) var(--matrix-ease, ease-in-out) infinite;
  animation-delay: calc(var(--d, 0) * 1ms);
}
/* Hole positions (rounded variants) render nothing. */
.t-matrix i.is-gap { visibility: hidden; animation: none; }
@keyframes t-matrix-pulse {
  0%, 45%, 100% { background-color: var(--matrix-base, #3a3a3e); }
  15%           { background-color: var(--matrix-active, #b8b8c2); }
}

@media (prefers-reduced-motion: reduce) {
  .t-matrix i { animation: none !important; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("transitions-p33")) {
  const __style = document.createElement("style");
  __style.id = "transitions-p33";
  __style.textContent = __TRANSITION_STYLES;
  document.head.appendChild(__style);
}

// Pair with the CSS from the CSS tab. Sixteen 2px dots share one
// colour-pulse keyframe; the variant is just a per-dot delay table into
// that cycle. `cycle` must match --matrix-cycle (1200ms by default).
const CORNERS = [0, 3, 12, 15];
// Clockwise perimeter (corner-less ring), then centre cells.
const RING = [1, 2, 7, 11, 14, 13, 8, 4];
const INNER = [5, 6, 9, 10];
const TWINKLE = [7, 2, 11, 5, 14, 9, 0, 12, 3, 15, 6, 10, 13, 1, 8, 4];

function delayFor(variant: "scan" | "twinkle" | "orbit" | "pulse", idx: number, cycle: number) {
  const col = idx % 4;
  if (variant === "scan") return Math.round(col * (cycle / 10));
  if (variant === "twinkle") return Math.round(TWINKLE[idx] * (cycle / 16));
  if (variant === "orbit") {
    const k = RING.indexOf(idx);
    return k === -1 ? null : Math.round(k * (cycle / 8)); // null: centre holds steady
  }
  if (variant === "pulse") return Math.round((INNER.includes(idx) ? 0 : 1) * (cycle * 0.16));
  return 0;
}

export interface MatrixLoaderProps {
  variant?: "scan" | "twinkle" | "orbit" | "pulse";
  rounded?: boolean;
  cycle?: number;
  size?: "sm" | "md" | "lg" | number;
  baseColor?: string;
  activeColor?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SIZES = {
  sm: { dot: 2, gap: 2 },
  md: { dot: 3.5, gap: 2.5 },
  lg: { dot: 5, gap: 3.5 },
};

export function MatrixLoader({
  variant = "orbit",
  rounded = true,
  cycle = 1200,
  size = "md",
  baseColor,
  activeColor,
  label = "Loading",
  className = "",
  style,
}: MatrixLoaderProps) {
  const sizeConfig = typeof size === "number"
    ? { dot: size, gap: Math.max(1.5, Math.round(size * 0.7)) }
    : (SIZES[size] || SIZES.md);

  const customStyle: React.CSSProperties & Record<string, any> = {
    "--matrix-dot": `${sizeConfig.dot}px`,
    "--matrix-gap": `${sizeConfig.gap}px`,
    "--matrix-cycle": `${cycle}ms`,
    ...(baseColor ? { "--matrix-base": baseColor } : {}),
    ...(activeColor ? { "--matrix-active": activeColor } : {}),
    ...style,
  };

  return (
    <div
      className={`t-matrix ${className}`}
      data-variant={variant}
      role="status"
      aria-label={label}
      style={customStyle}
    >
      {Array.from({ length: 16 }, (_, idx) => {
        if (rounded && CORNERS.includes(idx)) return <i key={idx} className="is-gap" />;
        const d = delayFor(variant, idx, cycle);
        return (
          <i
            key={idx}
            style={
              d === null
                ? { animation: "none" }
                : ({ "--d": d } as React.CSSProperties & Record<string, any>)
            }
          />
        );
      })}
    </div>
  );
}

export default MatrixLoader;

