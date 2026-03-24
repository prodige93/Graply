import { useMemo, useRef, useState, useEffect } from 'react';

interface ChartPoint {
  label: string;
  views: number;
  earned: number;
}

interface StatsChartProps {
  data: ChartPoint[];
  metric: 'views' | 'earned';
  height?: number;
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

export default function StatsChart({ data, metric, height = 200, color = '#FF782A' }: StatsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(560);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth || 560);
    return () => ro.disconnect();
  }, []);

  const isMobile = containerWidth < 480;

  const chartWidth = 560;
  const chartHeight = height;
  const padLeft = isMobile ? 72 : 56;
  const padRight = 16;
  const padTop = 20;
  const padBottom = isMobile ? 44 : 36;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const fontSize = isMobile ? 11 : 7;
  const yTickCount = isMobile ? 3 : 5;

  const { points, yTicks, maxVal } = useMemo(() => {
    const values = data.map((d) => (metric === 'views' ? d.views : d.earned));
    const rawMax = Math.max(...values);
    const max = rawMax > 0 ? rawMax : 1;
    const tickStep = max / (yTickCount - 1);
    const ticks = Array.from({ length: yTickCount }, (_, i) => i * tickStep);
    const divisor = data.length > 1 ? data.length - 1 : 1;

    const pts = data.map((d, i) => {
      const val = metric === 'views' ? d.views : d.earned;
      const x = padLeft + (i / divisor) * innerW;
      const y = padTop + innerH - (val / max) * innerH;
      return { x, y, val, label: d.label };
    });

    return { points: pts, yTicks: ticks, maxVal: max };
  }, [data, metric, innerW, innerH, yTickCount, padLeft]);

  const visibleXPoints = useMemo(() => {
    if (!isMobile) return points;
    if (points.length <= 3) return points;
    const step = Math.ceil(points.length / 3);
    return points.filter((_, i) => i === 0 || i === points.length - 1 || i % step === 0).slice(0, 3);
  }, [points, isMobile]);

  const smoothLine = useMemo(() => {
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
  }, [points]);

  const smoothArea = useMemo(() => {
    if (!smoothLine) return '';
    return `${smoothLine} L${points[points.length - 1].x},${padTop + innerH} L${points[0].x},${padTop + innerH} Z`;
  }, [smoothLine, points, innerH]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`areaGrad-${metric}-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
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
                y={y + fontSize * 0.45}
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

        {visibleXPoints.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={padTop + innerH + (isMobile ? 28 : 22)}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize={fontSize}
            fontFamily="system-ui"
            fontWeight="500"
          >
            {p.label}
          </text>
        ))}

        <path d={smoothArea} fill={`url(#areaGrad-${metric}-${color.replace('#', '')})`} />

        <path
          d={smoothLine}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill={color} fillOpacity="0.15" />
            <circle cx={p.x} cy={p.y} r="3" fill={color} />
            <circle cx={p.x} cy={p.y} r="1.5" fill="#fff" />
          </g>
        ))}
      </svg>
    </div>
  );
}
