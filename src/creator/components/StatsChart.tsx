import { useMemo } from 'react';

interface ChartPoint {
  label: string;
  views: number;
  earned: number;
}

interface StatsChartProps {
  data: ChartPoint[];
  metric: 'views' | 'earned';
  height?: number;
  desktopHeight?: number;
  color?: string;
}

function formatValue(val: number, metric: 'views' | 'earned'): string {
  if (metric === 'earned') {
    return val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val}`;
  }
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toString();
}

function buildPoints(
  data: ChartPoint[],
  metric: 'views' | 'earned',
  padLeft: number,
  padRight: number,
  padTop: number,
  innerW: number,
  innerH: number,
  chartWidth: number,
) {
  const values = data.map((d) => (metric === 'views' ? d.views : d.earned));
  const rawMax = Math.max(...values);
  const max = rawMax > 0 ? rawMax : 1;
  const step = max / 4;
  const yTicks = [0, step, step * 2, step * 3, max];
  const divisor = data.length > 1 ? data.length - 1 : 1;

  const pts = data.map((d, i) => {
    const val = metric === 'views' ? d.views : d.earned;
    const x = padLeft + (i / divisor) * innerW;
    const y = padTop + innerH - (val / max) * innerH;
    return { x, y, val, label: d.label };
  });

  return { points: pts, yTicks, maxVal: max };
}

function buildSmoothLine(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

interface ChartSVGProps {
  data: ChartPoint[];
  metric: 'views' | 'earned';
  color: string;
  chartWidth: number;
  chartHeight: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
  fontSize: number;
  xIndices: 'all' | number[];
  className?: string;
}

function ChartSVG({
  data, metric, color,
  chartWidth, chartHeight,
  padLeft, padRight, padTop, padBottom,
  fontSize, xIndices, className,
}: ChartSVGProps) {
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const { points, yTicks, maxVal } = useMemo(
    () => buildPoints(data, metric, padLeft, padRight, padTop, innerW, innerH, chartWidth),
    [data, metric, padLeft, padRight, padTop, innerW, innerH, chartWidth],
  );

  const smoothLine = useMemo(() => buildSmoothLine(points), [points]);

  const smoothArea = useMemo(() => {
    if (!smoothLine) return '';
    return `${smoothLine} L${points[points.length - 1].x},${padTop + innerH} L${points[0].x},${padTop + innerH} Z`;
  }, [smoothLine, points, padTop, innerH]);

  const shownIndices = useMemo(() => {
    if (xIndices === 'all') return points.map((_, i) => i);
    return xIndices;
  }, [xIndices, points]);

  const gradId = `areaGrad-${metric}-${color.replace('#', '')}`;
  const glowId = `glow-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className={`w-full h-auto ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {yTicks.map((tick, i) => {
        const y = padTop + innerH - (tick / maxVal) * innerH;
        return (
          <g key={i}>
            <line
              x1={padLeft}
              y1={y}
              x2={chartWidth - padRight}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray={i === 0 ? 'none' : '4 4'}
            />
            <text
              x={padLeft - 10}
              y={y + fontSize * 0.35}
              textAnchor="end"
              fill="rgba(255,255,255,0.2)"
              fontSize={fontSize}
              fontFamily="system-ui"
              fontWeight="500"
            >
              {formatValue(tick, metric)}
            </text>
          </g>
        );
      })}

      {shownIndices.map((idx) => {
        const p = points[idx];
        return (
          <text
            key={idx}
            x={p.x}
            y={padTop + innerH + padBottom * 0.65}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize={fontSize}
            fontFamily="system-ui"
            fontWeight="500"
          >
            {p.label}
          </text>
        );
      })}

      <path d={smoothArea} fill={`url(#${gradId})`} />

      <path
        d={smoothLine}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill={color} fillOpacity="0.15" />
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          <circle cx={p.x} cy={p.y} r="1.5" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

export default function StatsChart({ data, metric, height = 200, desktopHeight, color = '#FF782A' }: StatsChartProps) {
  const mobileXIndices = useMemo(() => {
    const n = data.length;
    if (n <= 4) return data.map((_, i) => i);
    const indices = new Set<number>();
    indices.add(0);
    indices.add(n - 1);
    indices.add(Math.floor((n - 1) / 2));
    return Array.from(indices).sort((a, b) => a - b);
  }, [data]);

  return (
    <div className="w-full overflow-hidden">
      <ChartSVG
        data={data}
        metric={metric}
        color={color}
        chartWidth={560}
        chartHeight={desktopHeight ?? height}
        padLeft={48}
        padRight={16}
        padTop={20}
        padBottom={36}
        fontSize={7}
        xIndices="all"
        className="hidden sm:block"
      />
      <ChartSVG
        data={data}
        metric={metric}
        color={color}
        chartWidth={560}
        chartHeight={height}
        padLeft={64}
        padRight={16}
        padTop={20}
        padBottom={44}
        fontSize={11}
        xIndices={mobileXIndices}
        className="block sm:hidden"
      />
    </div>
  );
}
