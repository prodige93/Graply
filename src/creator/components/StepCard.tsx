import type { ReactNode } from 'react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  isMars?: boolean;
  fullBleed?: boolean;
  height?: string;
}

export default function StepCard({ step, title, description, children, isMars, fullBleed, height }: StepCardProps) {
  const shouldUsePurpleStep = isMars && fullBleed;
  const cardHeight = height || (fullBleed ? 'h-[550px]' : '');

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-full max-w-[480px] ${cardHeight} rounded-3xl bg-white overflow-hidden group transition-shadow duration-500`}>
        <div className={`relative ${fullBleed ? 'h-full' : 'h-[260px]'} overflow-hidden`}>
          {!fullBleed && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-gold-400/20 via-gold-500/30 to-white transition-all duration-500 group-hover:from-gold-400/30 group-hover:via-gold-400/20" />
              <div
                className="absolute inset-0 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.12]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #FFA500 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
            </>
          )}
          <div className={`relative z-10 flex items-center justify-center h-full ${fullBleed ? 'p-0' : 'p-6'} transition-transform duration-500 group-hover:scale-[1.02]`}>
            {children}
          </div>
        </div>
        {!fullBleed && (
          <div className="px-6 py-5 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className={`w-10 h-px ${shouldUsePurpleStep ? 'bg-purple-500/30' : 'bg-gray-200'}`} />
        <span className={`inline-flex items-center px-3 py-1 rounded-full ${shouldUsePurpleStep ? 'bg-purple-600' : 'bg-gold-500'} text-white text-xs font-bold tracking-wide`}>
          Step {step}
        </span>
        <div className={`w-10 h-px ${shouldUsePurpleStep ? 'bg-purple-500/30' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
}
