import { useState, type ReactNode } from 'react';

interface GlassButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassButton({ href, children, className = '', style }: GlassButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <a
      href={href}
      className={`relative overflow-hidden select-none ${className}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...style,
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          opacity: pressed ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.12) 100%)',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 60%)',
          }}
        />

        <div
          className="absolute left-[10%] right-[10%] top-[8%] h-[35%] rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
            filter: 'blur(1px)',
          }}
        />

        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.08)',
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[15] rounded-[inherit]"
        style={{
          boxShadow: pressed
            ? 'inset 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.1)'
            : 'inset 0 0 0 rgba(0,0,0,0)',
          transition: 'box-shadow 0.15s ease',
        }}
      />
    </a>
  );
}
