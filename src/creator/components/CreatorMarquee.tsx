import { useEffect, useRef } from 'react';

const brands = [
  { thumb: '/betclic.png', title: 'Betclic', color: '220, 38, 38' },
  { thumb: '/pumpfun.png', title: 'Pump Fun', color: '52, 211, 153' },
  { thumb: '/phantom.png', title: 'Phantom', color: '171, 154, 255' },
  { thumb: '/stakee.png', title: 'Stake', color: '180, 180, 190' },
  { thumb: '/polymarket.png', title: 'Polymarket', color: '59, 130, 246' },
  { thumb: '/fanta.png', title: 'Fanta', color: '249, 115, 22' },
  { thumb: '/cod.png', title: 'Call of Duty', color: '40, 40, 40', dark: true },
  { thumb: '/whoop.png', title: 'Whoop', color: '180, 180, 190' },
  { thumb: '/bose.png', title: 'Bose', color: '180, 180, 190' },
];

interface BrandCardProps {
  thumb: string;
  title: string;
  color: string;
  dark?: boolean;
}

function BrandCard({ thumb, title, color, dark }: BrandCardProps) {
  const baseShadow = dark
    ? `0 0 20px 6px rgba(${color}, 0.8), 0 0 50px 12px rgba(${color}, 0.4), inset 0 0 0 1.5px rgba(80, 80, 80, 0.6)`
    : `0 0 18px 4px rgba(${color}, 0.35), 0 0 40px 8px rgba(${color}, 0.15), inset 0 0 0 1px rgba(${color}, 0.3)`;
  const hoverShadow = dark
    ? `0 0 30px 10px rgba(${color}, 1), 0 0 70px 20px rgba(${color}, 0.5), inset 0 0 0 1.5px rgba(100, 100, 100, 0.8)`
    : `0 0 28px 8px rgba(${color}, 0.5), 0 0 60px 16px rgba(${color}, 0.25), inset 0 0 0 1px rgba(${color}, 0.5)`;

  return (
    <div className="flex-shrink-0 w-[80px] sm:w-[180px] md:w-[200px] group cursor-pointer p-1.5 sm:p-3">
      <div
        className="relative aspect-square rounded-xl sm:rounded-2xl transition-all duration-500"
        style={{ boxShadow: baseShadow }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = baseShadow;
        }}
      >
        <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
          <img
            src={thumb}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function CreatorMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const doubled = [...brands, ...brands, ...brands];
  const maxDip = 60;

  useEffect(() => {
    const updateOffsets = () => {
      if (!containerRef.current || !trackRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenter = containerRect.width / 2;
      const cards = trackRef.current.children;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left - containerRect.left + cardRect.width / 2;
        const normalizedPos = (cardCenter - containerCenter) / containerCenter;
        const clampedPos = Math.max(-1, Math.min(1, normalizedPos));
        const offset = maxDip * (1 - clampedPos * clampedPos);
        card.style.transform = `translateY(${offset}px)`;
      }

      animationRef.current = requestAnimationFrame(updateOffsets);
    };

    animationRef.current = requestAnimationFrame(updateOffsets);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-clip pb-20">
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <div ref={trackRef} className="marquee-track flex gap-2 sm:gap-5 md:gap-6 items-start">
        {doubled.map((brand, i) => (
          <BrandCard key={i} {...brand} />
        ))}
      </div>

    </div>
  );
}
