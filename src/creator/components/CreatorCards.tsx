const CARD_COUNT = 12;

const PATH_POINTS = [
  { x: -4, y: 8 },
  { x: 2, y: 18 },
  { x: 8, y: 28 },
  { x: 15, y: 37 },
  { x: 22, y: 45 },
  { x: 29, y: 52 },
  { x: 35, y: 59 },
  { x: 40, y: 66 },
  { x: 44, y: 73 },
  { x: 47, y: 80 },
  { x: 49, y: 87 },
  { x: 50, y: 94 },
];

const ROTATIONS = [-6, -4, -2, 0, 2, 3, 4, 5, 6, 8, 10, 12];

const PLANET_CENTER = { x: 50, y: 65 };
const FADE_START = 38;
const FADE_END = 12;

function distanceToPlanet(x: number, y: number) {
  const dx = x - PLANET_CENTER.x;
  const dy = y - PLANET_CENTER.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getOpacity(x: number, y: number) {
  const dist = distanceToPlanet(x, y);
  if (dist >= FADE_START) return 1;
  if (dist <= FADE_END) return 0;
  return (dist - FADE_END) / (FADE_START - FADE_END);
}

export default function CreatorCards() {
  return (
    <>
      <style>{`
        @keyframes carouselFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50% { transform: translateY(-8px) rotate(var(--rot)); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {Array.from({ length: CARD_COUNT }).map((_, i) => {
          const point = PATH_POINTS[i];
          const rot = ROTATIONS[i];
          const delay = i * 0.3;
          const scale = 0.9 + (i / CARD_COUNT) * 0.25;
          const opacity = getOpacity(point.x, point.y);

          if (opacity <= 0) return null;

          return (
            <div
              key={i}
              className="absolute pointer-events-auto"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: 160 * scale,
                height: 210 * scale,
                opacity,
                ['--rot' as string]: `${rot}deg`,
                transform: `rotate(${rot}deg)`,
                animation: `carouselFloat ${3 + (i % 3) * 0.8}s ease-in-out ${delay}s infinite`,
                zIndex: i + 1,
              }}
            >
              <div
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid rgba(255,255,255,${0.07 * opacity})`,
                  boxShadow: `0 8px 32px rgba(0,0,0,${0.4 * opacity}), inset 0 1px 0 rgba(255,255,255,${0.05 * opacity})`,
                  background: `rgba(255,255,255,${0.03 * opacity})`,
                  backdropFilter: opacity > 0.3 ? 'blur(4px)' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
