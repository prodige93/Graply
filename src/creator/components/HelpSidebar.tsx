import { MessageSquare } from 'lucide-react';

interface HelpSidebarProps {
  isMars: boolean;
}

const WHATSAPP_URL = 'https://wa.me/33767614097';

export default function HelpSidebar({ isMars }: HelpSidebarProps) {
  const accentRgb = isMars ? '139,92,246' : '255,165,0';
  const gradientFrom = isMars ? '#8B5CF6' : '#FFA500';
  const gradientTo = isMars ? '#6D28D9' : '#E08900';

  const buttonStyle = {
    background: `linear-gradient(180deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
    boxShadow: `0 4px 24px rgba(${accentRgb},0.3)`,
  };

  const fabStyle = {
    background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
    boxShadow: `0 4px 24px rgba(${accentRgb},0.3)`,
  };

  return (
    <>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 flex-col items-center rounded-l-xl transition-all duration-700 hover:brightness-110 cursor-pointer overflow-hidden"
        style={buttonStyle}
      >
        <span
          className="px-1 py-4 text-[13px] font-semibold tracking-wide text-white whitespace-nowrap"
          style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
        >
          Can we help you?
        </span>
        <span className="px-1 pt-0 pb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <MessageSquare className="w-3 h-3 text-white fill-white" />
          </span>
        </span>
      </a>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full transition-all duration-700 hover:brightness-110 cursor-pointer flex items-center justify-center"
        style={fabStyle}
      >
        <MessageSquare className="w-6 h-6 text-white fill-white" />
      </a>
    </>
  );
}
