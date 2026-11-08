// Server-rendered diagrams for notes and solutions. Pure SVG, coloured with theme tokens,
// so they work without JavaScript and follow light/dark mode.
import type { ReactNode } from "react";

export function Figure({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-8">
      <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto rounded-lg border bg-card p-4">
        {children}
      </div>
      <figcaption className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------- curves

type Fn = (x: number) => number;
const sigmoid: Fn = (x) => 1 / (1 + Math.exp(-x));

// Named curves an author can plot. Keep the formulas here so every page draws them identically.
const CURVES: Record<string, { label: string; fn: Fn }> = {
  sigmoid: { label: "sigmoid", fn: sigmoid },
  tanh: { label: "tanh", fn: Math.tanh },
  relu: { label: "ReLU", fn: (x) => Math.max(0, x) },
  "leaky-relu": {
    label: "leaky ReLU (α = 0.1)",
    fn: (x) => (x > 0 ? x : 0.1 * x),
  },
  softplus: { label: "softplus", fn: (x) => Math.log(1 + Math.exp(x)) },
  step: { label: "step", fn: (x) => (x >= 0 ? 1 : 0) },
  linear: { label: "linear", fn: (x) => x },
  "sigmoid-derivative": {
    label: "sigmoid′",
    fn: (x) => sigmoid(x) * (1 - sigmoid(x)),
  },
  "tanh-derivative": { label: "tanh′", fn: (x) => 1 - Math.tanh(x) ** 2 },
  // Illustrative learning curves: training error keeps falling, validation error is U-shaped.
  "train-error": {
    label: "training error",
    fn: (x) => 0.08 + 0.9 * Math.exp(-0.22 * x),
  },
  "val-error": {
    label: "validation error",
    fn: (x) => 0.3 + 0.9 * Math.exp(-0.45 * x) + 0.0015 * x * x,
  },
  // Loss for one example whose true label is 1, as a function of the predicted probability p.
  "mse-loss": { label: "MSE (1 − p)²", fn: (p) => (1 - p) ** 2 },
  "ce-loss": {
    label: "cross-entropy −ln p",
    fn: (p) => -Math.log(Math.max(p, 1e-6)),
  },
};

const SERIES = [
  { color: "var(--chart-1)", dash: "" },
  { color: "var(--chart-2)", dash: "6 4" },
  { color: "var(--chart-3)", dash: "2 3" },
  { color: "var(--chart-4)", dash: "10 3 2 3" },
];

function range(spec: string, fallback: [number, number]): [number, number] {
  const [a, b] = spec.split(",").map(Number);
  return a !== undefined &&
    b !== undefined &&
    Number.isFinite(a) &&
    Number.isFinite(b)
    ? [a, b]
    : fallback;
}

export function CurvePlot({
  curves,
  x = "-5,5",
  y = "-1.2,1.2",
  xLabel = "x",
  yLabel = "y",
  mark,
}: {
  curves: string;
  x?: string;
  y?: string;
  xLabel?: string;
  yLabel?: string;
  /** "min:<curve>" draws a vertical line at that curve's lowest point. */
  mark?: string;
}) {
  const names = curves.split(",").map((s) => s.trim());
  const [x0, x1] = range(x, [-5, 5]);
  const [y0, y1] = range(y, [-1.2, 1.2]);
  const W = 520;
  const H = 300;
  const pad = { l: 44, r: 16, t: 16, b: 40 };
  const sx = (v: number) =>
    pad.l + ((v - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const sy = (v: number) =>
    H - pad.b - ((v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
  const clampY = (v: number) => Math.min(y1, Math.max(y0, v));
  const steps = 240;

  const paths = names.map((name, i) => {
    const c = CURVES[name];
    if (!c) throw new Error(`Unknown curve "${name}"`);
    let d = "";
    for (let k = 0; k <= steps; k++) {
      const xv = x0 + ((x1 - x0) * k) / steps;
      const yv = clampY(c.fn(xv));
      d += `${k === 0 ? "M" : "L"}${sx(xv).toFixed(1)},${sy(yv).toFixed(1)}`;
    }
    const s = SERIES[i % SERIES.length] ?? {
      color: "var(--chart-1)",
      dash: "",
    };
    return { name, label: c.label, d, ...s };
  });

  let markX: number | null = null;
  if (mark?.startsWith("min:")) {
    const c = CURVES[mark.slice(4)];
    if (!c) throw new Error(`Unknown curve in mark "${mark}"`);
    let best = Number.POSITIVE_INFINITY;
    for (let k = 0; k <= steps; k++) {
      const xv = x0 + ((x1 - x0) * k) / steps;
      const yv = c.fn(xv);
      if (yv < best) {
        best = yv;
        markX = xv;
      }
    }
  }

  const xAxisY = y0 <= 0 && y1 >= 0 ? sy(0) : H - pad.b;
  const yAxisX = x0 <= 0 && x1 >= 0 ? sx(0) : pad.l;
  const ticks = (a: number, b: number) => {
    const span = b - a;
    const step = span <= 2.5 ? 0.5 : span <= 6 ? 1 : span <= 12 ? 2 : 5;
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step)
      out.push(Number(v.toFixed(2)));
    return out;
  };

  return (
    <div className="w-full max-w-[520px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Plot of ${paths.map((p) => p.label).join(", ")} against ${xLabel}`}
        className="h-auto w-full text-muted-foreground"
      >
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={xAxisY}
          y2={xAxisY}
          stroke="currentColor"
          strokeWidth="1"
        />
        <line
          x1={yAxisX}
          x2={yAxisX}
          y1={pad.t}
          y2={H - pad.b}
          stroke="currentColor"
          strokeWidth="1"
        />
        {ticks(x0, x1).map((t) => (
          <text
            key={`x${t}`}
            x={sx(t)}
            y={H - pad.b + 16}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
          >
            {t}
          </text>
        ))}
        {ticks(y0, y1).map((t) => (
          <text
            key={`y${t}`}
            x={pad.l - 6}
            y={sy(t) + 4}
            textAnchor="end"
            fontSize="11"
            fill="currentColor"
          >
            {t}
          </text>
        ))}
        <text
          x={(pad.l + W - pad.r) / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
        >
          {xLabel}
        </text>
        <text
          x={12}
          y={(pad.t + H - pad.b) / 2}
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          transform={`rotate(-90 12 ${(pad.t + H - pad.b) / 2})`}
        >
          {yLabel}
        </text>
        {markX !== null ? (
          <g>
            <line
              x1={sx(markX)}
              x2={sx(markX)}
              y1={pad.t}
              y2={H - pad.b}
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={sx(markX) + 6}
              y={pad.t + 12}
              fontSize="12"
              fill="var(--primary)"
            >
              lowest validation error
            </text>
          </g>
        ) : null}
        {paths.map((p) => (
          <path
            key={p.name}
            d={p.d}
            fill="none"
            style={{ stroke: p.color }}
            strokeWidth="2.5"
            strokeDasharray={p.dash}
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
        {paths.map((p) => (
          <li key={p.name} className="flex items-center gap-2">
            <svg width="28" height="8" aria-hidden="true">
              <line
                x1="0"
                x2="28"
                y1="4"
                y2="4"
                style={{ stroke: p.color }}
                strokeWidth="2.5"
                strokeDasharray={p.dash}
              />
            </svg>
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- networks

/** layers="3,4,4,2"; dropped="1:1,1:3" switches off neuron 1 and 3 of layer 1 (0-based). */
export function NetworkFigure({
  layers,
  dropped = "",
  title,
  labels,
}: {
  layers: string;
  dropped?: string;
  title?: string;
  labels?: string;
}) {
  const sizes = layers.split(",").map(Number);
  const off = new Set(
    dropped
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const names = labels
    ? labels.split(",").map((s) => s.trim())
    : sizes.map((_, i) =>
        i === 0 ? "Input" : i === sizes.length - 1 ? "Output" : `Hidden ${i}`,
      );
  const W = 300;
  const H = 230;
  const top = title ? 34 : 14;
  const bottom = 30;
  const colX = (i: number) =>
    30 + (i * (W - 60)) / Math.max(1, sizes.length - 1);
  const rowY = (n: number, j: number) => {
    const avail = H - top - bottom;
    return top + ((j + 0.5) * avail) / n;
  };
  const isOff = (i: number, j: number) => off.has(`${i}:${j}`);
  const r = 11;
  const edges: ReactNode[] = [];
  sizes.forEach((n, i) => {
    const next = sizes[i + 1];
    if (next === undefined) return;
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < next; b++) {
        if (isOff(i, a) || isOff(i + 1, b)) continue;
        edges.push(
          <line
            key={`e${i}-${a}-${b}`}
            x1={colX(i)}
            y1={rowY(n, a)}
            x2={colX(i + 1)}
            y2={rowY(next, b)}
            stroke="var(--border)"
            strokeWidth="1.2"
          />,
        );
      }
    }
  });
  const kept = sizes.reduce(
    (sum, n, i) =>
      sum +
      Array.from({ length: n }, (_, j) => j).filter((j) => !isOff(i, j)).length,
    0,
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${title ?? "Network"}: layers of ${sizes.join(", ")} neurons${off.size ? `, ${off.size} switched off, ${kept} active` : ""}`}
      className="h-auto w-full max-w-[300px]"
    >
      {title ? (
        <text
          x={W / 2}
          y={18}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--foreground)"
        >
          {title}
        </text>
      ) : null}
      {edges}
      {sizes.map((n, i) =>
        Array.from({ length: n }, (_, j) => {
          const cx = colX(i);
          const cy = rowY(n, j);
          const dead = isOff(i, j);
          return (
            <g key={`n${i}-${j}`}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={dead ? "var(--background)" : "var(--accent)"}
                stroke={dead ? "var(--muted-foreground)" : "var(--primary)"}
                strokeWidth="1.6"
                strokeDasharray={dead ? "3 3" : ""}
              />
              {dead ? (
                <path
                  d={`M${cx - 5},${cy - 5}L${cx + 5},${cy + 5}M${cx + 5},${cy - 5}L${cx - 5},${cy + 5}`}
                  stroke="var(--muted-foreground)"
                  strokeWidth="1.6"
                />
              ) : null}
            </g>
          );
        }),
      )}
      {names.map((name, i) => (
        <text
          key={`l${name}${colX(i)}`}
          x={colX(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted-foreground)"
        >
          {name}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------- L1 vs L2 geometry

// Loss contours (w − c)ᵀA(w − c) with c = (2.1, 1.1), axes 1.2 : 0.45 rotated −45°.
// Computed numerically: the lowest contour touching |w1| + |w2| = 1 meets it at the corner (1, 0);
// the lowest contour touching w1² + w2² = 1 meets the circle at about (0.755, 0.655).
const CENTER = { x: 2.1, y: 1.1 };
const LEVELS = {
  l1: { rx: 4.148, ry: 1.556, touch: { x: 1, y: 0 } },
  l2: { rx: 3.433, ry: 1.288, touch: { x: 0.755, y: 0.655 } },
};

function NormPanel({ kind }: { kind: "l1" | "l2" }) {
  const W = 270;
  const H = 250;
  const s = 62;
  const ox = 92;
  const oy = 160;
  const X = (x: number) => ox + x * s;
  const Y = (y: number) => oy - y * s;
  const lvl = LEVELS[kind];
  const clipId = `clip-${kind}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={
        kind === "l1"
          ? "L1: the loss contour first touches the diamond at a corner on the w1 axis, so w2 becomes exactly zero"
          : "L2: the loss contour first touches the circle at a point where both weights are non-zero"
      }
      className="h-auto w-full max-w-[270px]"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="22" width={W} height={H - 44} />
        </clipPath>
      </defs>
      <text
        x={W / 2}
        y={16}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="var(--foreground)"
      >
        {kind === "l1" ? "L1 penalty: diamond" : "L2 penalty: circle"}
      </text>
      <g clipPath={`url(#${clipId})`}>
        <line
          x1={X(-1.4)}
          x2={X(2.7)}
          y1={Y(0)}
          y2={Y(0)}
          stroke="var(--muted-foreground)"
          strokeWidth="1"
        />
        <line
          x1={X(0)}
          x2={X(0)}
          y1={Y(-1.3)}
          y2={Y(2)}
          stroke="var(--muted-foreground)"
          strokeWidth="1"
        />
        {kind === "l1" ? (
          <polygon
            points={`${X(1)},${Y(0)} ${X(0)},${Y(1)} ${X(-1)},${Y(0)} ${X(0)},${Y(-1)}`}
            fill="var(--accent)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ) : (
          <circle
            cx={X(0)}
            cy={Y(0)}
            r={s}
            fill="var(--accent)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        )}
        {[0.35, 0.65, 1].map((k) => (
          <ellipse
            key={k}
            cx={X(CENTER.x)}
            cy={Y(CENTER.y)}
            rx={lvl.rx * Math.sqrt(k) * s}
            ry={lvl.ry * Math.sqrt(k) * s}
            transform={`rotate(45 ${X(CENTER.x)} ${Y(CENTER.y)})`}
            fill="none"
            stroke="var(--chart-2)"
            strokeWidth={k === 1 ? 2 : 1.2}
            strokeDasharray={k === 1 ? "" : "4 3"}
          />
        ))}
        <circle
          cx={X(CENTER.x)}
          cy={Y(CENTER.y)}
          r="3.5"
          fill="var(--chart-2)"
        />
        <circle
          cx={X(lvl.touch.x)}
          cy={Y(lvl.touch.y)}
          r="5"
          fill="var(--primary)"
        />
      </g>
      <text
        x={X(CENTER.x) - 6}
        y={Y(CENTER.y) - 8}
        textAnchor="end"
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        best without penalty
      </text>
      <text
        x={X(lvl.touch.x) + 8}
        y={Y(lvl.touch.y) + (kind === "l1" ? 16 : -8)}
        fontSize="11"
        fontWeight="600"
        fill="var(--primary)"
      >
        {kind === "l1" ? "answer: w2 = 0" : "answer: both ≠ 0"}
      </text>
      <text
        x={X(2.55)}
        y={Y(0) - 6}
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        w1
      </text>
      <text
        x={X(0) + 6}
        y={Y(1.85)}
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        w2
      </text>
      <text
        x={W / 2}
        y={H - 6}
        textAnchor="middle"
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        dashed ovals: equal-loss lines
      </text>
    </svg>
  );
}

export function NormBalls() {
  return (
    <>
      <NormPanel kind="l1" />
      <NormPanel kind="l2" />
    </>
  );
}
