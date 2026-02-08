export interface LineChartPoint {
  time: string;
  value: number;
}

export interface LineChartProps {
  title: string;
  dataKey?: string;
  data?: LineChartPoint[];
}

function buildPolyline(points: LineChartPoint[], w: number, h: number) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  return points
    .map((p, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * w;
      const y = h - ((p.value - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LineChart({ title, data }: LineChartProps) {
  const w = 560;
  const h = 160;
  const points = Array.isArray(data)
    ? data.filter(
        (p): p is LineChartPoint =>
          !!p && typeof p.time === "string" && typeof p.value === "number",
      )
    : [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>

      {points.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No data.</p>
      ) : (
        <div className="mt-4">
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-40 w-full"
            role="img"
            aria-label={title}
          >
            <polyline
              fill="none"
              stroke="rgb(56 189 248)"
              strokeWidth="3"
              points={buildPolyline(points, w, h)}
            />
          </svg>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{points[0]?.time}</span>
            <span>{points[points.length - 1]?.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
