type SparklineProps = {
  values: number[];
  positive?: boolean;
};

/** Tiny trend sparkline for leaderboard rows. */
export function Sparkline({ values, positive = true }: SparklineProps) {
  if (values.length < 2) return null;

  const width = 72;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke = positive ? "#2563eb" : "#dc2626";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/** Deterministic demo series from a seed string (no prior-period store yet). */
export function sparklineFromSeed(seed: string, points = 8): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = 40 + (h % 30);
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const delta = ((h % 17) - 8) * 1.4;
    v = Math.max(8, Math.min(100, v + delta));
    out.push(v);
  }
  return out;
}
