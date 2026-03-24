import { Globe, Rocket } from 'lucide-react';

interface PlanetSwitchProps {
  isMars: boolean;
  onToggle: () => void;
}

export default function PlanetSwitch({ isMars, onToggle }: PlanetSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onToggle}
        className="group relative flex items-center w-[260px] h-[52px] rounded-full cursor-pointer transition-all duration-500"
        style={{
          background: '#0d0d0d',
          border: isMars
            ? '1px solid rgba(139,92,246,0.2)'
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isMars
            ? '0 2px 16px rgba(139,92,246,0.15), 0 1px 3px rgba(0,0,0,0.2)'
            : '0 2px 16px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="absolute top-[4px] h-[42px] w-[126px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: isMars ? 'calc(100% - 130px)' : '4px',
            background: isMars
              ? 'rgba(139,92,246,0.15)'
              : 'rgba(255,255,255,0.1)',
            border: isMars
              ? '1px solid rgba(139,92,246,0.25)'
              : '1px solid rgba(255,255,255,0.12)',
            boxShadow: isMars
              ? '0 2px 12px rgba(139,92,246,0.15), inset 0 1px 0 rgba(139,92,246,0.1)'
              : '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(8px)',
          }}
        />

        <div className="relative z-10 flex items-center justify-center w-[130px] h-full">
          <div className="flex items-center gap-2">
            <Rocket className={`h-4 w-4 transition-all duration-500 ${
              !isMars ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]' : 'text-white/30'
            }`} />
            <span className={`text-[11px] font-semibold tracking-wide uppercase transition-all duration-500 ${
              !isMars ? 'text-white' : 'text-white/30'
            }`}>
              Cr&eacute;ateurs
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center w-[130px] h-full">
          <div className="flex items-center gap-2">
            <Globe className={`h-4 w-4 transition-all duration-500 ${
              isMars ? 'text-violet-300 drop-shadow-[0_0_4px_rgba(139,92,246,0.4)]' : 'text-white/30'
            }`} />
            <span className={`text-[11px] font-semibold tracking-wide uppercase transition-all duration-500 ${
              isMars ? 'text-violet-300' : 'text-white/30'
            }`}>
              Entreprises
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: isMars
              ? 'radial-gradient(ellipse at center, rgba(139,92,246,0.05) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
          }}
        />
      </button>
    </div>
  );
}
