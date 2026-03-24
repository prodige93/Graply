const data = [
  { month: 'Jan', value: 42000 },
  { month: 'Fev', value: 68000 },
  { month: 'Mar', value: 55000 },
  { month: 'Avr', value: 91000 },
  { month: 'Mai', value: 120000 },
  { month: 'Jun', value: 108000 },
  { month: 'Jul', value: 155000 },
  { month: 'Aou', value: 178000 },
  { month: 'Sep', value: 162000 },
  { month: 'Oct', value: 210000 },
  { month: 'Nov', value: 248000 },
  { month: 'Dec', value: 310000 },
];

export default function PayoutsChart() {
  const W = 340;
  const H = 180;
  const padL = 10;
  const padR = 10;
  const padT = 12;
  const padB = 24;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 330000;

  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const smoothLine = (() => {
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = prev.x + (curr.x - prev.x) * 0.5;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  })();

  const smoothArea = (() => {
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = prev.x + (curr.x - prev.x) * 0.5;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    path += ` L ${pts[pts.length - 1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`;
    return path;
  })();

  const lastPt = { x: toX(data.length - 1), y: toY(data[data.length - 1].value) };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '20px 20px 16px',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)',
      }} />
      <div style={{
        position: 'absolute', top: -40, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
          Verses aux createurs
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>310k€</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 8px', borderRadius: 6,
            background: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.25)',
          }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M2 7L5 3L8 7" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa' }}>+25%</span>
          </span>
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: 'block', flex: 1, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="payArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="payLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="1" />
          </linearGradient>
          <filter id="payGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={smoothArea} fill="url(#payArea)" />
        <path d={smoothLine} fill="none" stroke="url(#payLine)" strokeWidth="2" strokeLinecap="round" filter="url(#payGlow)" />

        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(d.value)}
            r={i === data.length - 1 ? 4 : 2}
            fill={i === data.length - 1 ? '#a78bfa' : 'rgba(167,139,250,0.45)'}
            stroke={i === data.length - 1 ? 'rgba(255,255,255,0.25)' : 'none'}
            strokeWidth="1.5"
          />
        ))}

        <rect
          x={lastPt.x - 24} y={lastPt.y - 26}
          width={48} height={18}
          rx={6}
          fill="rgba(167,139,250,0.15)"
          stroke="rgba(167,139,250,0.35)"
          strokeWidth="1"
        />
        <text
          x={lastPt.x} y={lastPt.y - 13}
          textAnchor="middle"
          fill="#a78bfa"
          fontSize="10"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >
          310k€
        </text>

        {[0, 3, 6, 9, 11].map(i => (
          <text
            key={i}
            x={toX(i)} y={H - 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize="9"
            fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          >
            {data[i].month}
          </text>
        ))}
      </svg>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
        padding: '6px 10px', borderRadius: 8,
        background: 'rgba(167,139,250,0.06)',
        border: '1px solid rgba(167,139,250,0.12)',
        width: 'fit-content',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#a78bfa" strokeWidth="2"/>
          <path d="M12 8v4l3 3" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Argent verse aux createurs
        </span>
      </div>
    </div>
  );
}
