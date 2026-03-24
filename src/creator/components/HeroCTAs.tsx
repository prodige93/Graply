import { useNavigate } from 'react-router-dom';

interface HeroCTAsProps {
  isMars: boolean;
}

export default function HeroCTAs({ isMars }: HeroCTAsProps) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={() => navigate('/connexion', { state: isMars ? { openSignup: 'enterprise' } : { openSignup: 'creator' } })}
          className="relative group cursor-pointer select-none bg-transparent border-none p-0"
          style={{
            animation: 'ctaFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
          }}
        >
          <div
            className="absolute -inset-[6px] rounded-full pointer-events-none transition-all duration-700"
            style={{
              border: isMars
                ? '1.5px solid rgba(139,92,246,0.3)'
                : '1.5px solid rgba(255,165,0,0.3)',
            }}
          />
          <div
            className="absolute -inset-[1.5px] rounded-full pointer-events-none transition-all duration-700"
            style={{
              border: isMars
                ? '1.5px solid rgba(139,92,246,0.5)'
                : '1.5px solid rgba(255,165,0,0.5)',
            }}
          />
          <div
            className="relative rounded-full px-5 sm:px-7 py-1.5 sm:py-[7px] transition-all duration-700 group-hover:scale-[1.02]"
            style={{
              background: isMars
                ? 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #7C3AED 100%)'
                : 'linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FF8C00 100%)',
              boxShadow: isMars
                ? '0 0 20px rgba(139,92,246,0.25)'
                : '0 0 20px rgba(255,165,0,0.25)',
            }}
          >
            <span className="relative z-10 text-white font-semibold text-base sm:text-lg tracking-wide inline-flex items-center gap-1.5">
              {isMars ? 'Lancer une campagne' : 'Devenir Cr\u00e9ateur'}
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" className="relative -top-px"><path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </button>

      </div>
    </>
  );
}
