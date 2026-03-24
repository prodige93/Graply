import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

function CtaButton({ hovered, setHovered }: { hovered: boolean; setHovered: (v: boolean) => void }) {
  return (
    <a
      href="#how-it-works"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="relative inline-block cursor-pointer select-none group touch-manipulation"
    >
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: hovered
            ? 'radial-gradient(ellipse at center, rgba(56,140,220,0.35) 0%, rgba(40,120,200,0.12) 50%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(56,140,220,0.18) 0%, rgba(40,120,200,0.05) 50%, transparent 70%)',
          filter: 'blur(25px)',
          transform: 'scale(1.8)',
          transition: 'all 0.5s ease',
        }}
      />

      <div
        className="relative rounded-full overflow-hidden"
        style={{
          padding: '2px',
          background: hovered
            ? 'linear-gradient(135deg, #ffffff 0%, #d0e8ff 15%, #388cdc 35%, #1a5fa0 50%, #388cdc 65%, #d0e8ff 85%, #ffffff 100%)'
            : 'linear-gradient(135deg, #e0e8f0 0%, #b0c8e0 15%, #1a5fa0 35%, #0d3b6e 50%, #1a5fa0 65%, #b0c8e0 85%, #e0e8f0 100%)',
          transition: 'all 0.5s ease',
        }}
      >
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            padding: '8px 20px',
            background: hovered
              ? 'linear-gradient(180deg, #388cdc 0%, #2a74c0 25%, #1a5fa0 50%, #155090 75%, #1a5fa0 100%)'
              : 'linear-gradient(180deg, #2a74c0 0%, #1a5fa0 25%, #155090 50%, #0d3b6e 75%, #155090 100%)',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 25%, transparent 50%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(200,225,255,0.25) 45%, rgba(220,240,255,0.35) 50%, rgba(200,225,255,0.25) 55%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: hovered ? 'earthCtaShimmer 2s ease-in-out infinite' : 'none',
            }}
          />

          <span
            className="relative z-10 flex items-center gap-3 text-center font-bold tracking-wide whitespace-nowrap"
            style={{
              fontSize: 16,
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            D&eacute;marre Maintenant
            <ArrowUpRight
              size={20}
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 0 3px rgba(200,225,255,0.5))',
                transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                transform: hovered ? 'translate(2px, -2px) scale(1.1)' : 'translate(0, 0) scale(1)',
              }}
            />
          </span>
        </div>
      </div>
    </a>
  );
}

interface EarthShowcaseProps {
  isMars: boolean;
}

export default function EarthShowcase({ isMars }: EarthShowcaseProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative overflow-hidden bg-black">
      <style>{`
        @keyframes earthCtaShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <div className="px-6 py-24 md:py-32">
        <div className="relative z-10 text-center mb-10 md:hidden">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-[0.95]">
            {isMars ? (
              <>Votre marque, visible<br />partout dans le monde</>
            ) : (
              <>Lancez-vous, la Terre<br />continuera de tourner</>
            )}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl mx-auto leading-relaxed font-light">
            {isMars ? (
              <>Des créateurs de +30 pays prêts<br />à promouvoir votre marque dès aujourd'hui.</>
            ) : (
              'Le regard des gens ne devrait pas être un frein pour créer du contenu.'
            )}
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="relative z-10 text-left max-w-2xl hidden md:flex md:flex-col md:items-center">
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] text-center">
              {isMars ? (
                <>Votre marque, visible<br /><span className="text-white/90">partout dans le monde</span></>
              ) : (
                <>Lancez-vous, la Terre<br /><span className="text-white/90">continuera de tourner</span></>
              )}
            </h1>
            <p className="mt-6 text-xl text-white/80 max-w-xl leading-relaxed font-light text-center">
              {isMars ? (
                <>Des créateurs de +30 pays prêts<br />à promouvoir votre marque dès aujourd'hui.</>
              ) : (
                <>Le regard des gens ne devrait pas<br />être un frein pour créer du contenu.</>
              )}
            </p>

            <div className="mt-10">
              <CtaButton hovered={hovered} setHovered={setHovered} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center flex-shrink-0">
            <div className="w-72 sm:w-80 md:w-[24rem] lg:w-[28rem]">
              <div className="spinning-planet">
                <img
                  src="/Terre1.jpeg"
                  alt="Earth"
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-8 md:hidden flex justify-center">
              <CtaButton hovered={hovered} setHovered={setHovered} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
