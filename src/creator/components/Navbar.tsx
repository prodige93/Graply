import { Menu, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Pour les marques', href: '#marques' },
  { label: 'Comment ca marche', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

interface NavbarProps {
  isMars: boolean;
}

export default function Navbar({ isMars }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const accentColor = isMars ? '#8B5CF6' : '#FFA500';
  const accentDark = isMars ? '#6D28D9' : '#CC7A00';
  const accentRgb = isMars ? '139,92,246' : '255,165,0';

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setMobileOpen(false);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-8 sm:pt-5">
      <div className="relative flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0d0d0d]/80 backdrop-blur-2xl px-5 py-2.5 shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
        <a href="/" className="flex items-center mr-4 shrink-0">
          <svg
            width="28"
            height="28"
            viewBox="0 0 100 100"
            className="transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 10px rgba(${accentRgb},0.5))` }}
          >
            <defs>
              <radialGradient id="grapeGold" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor={isMars ? '#C4B5FD' : '#FFB347'}>
                  <animate attributeName="stopColor" values={isMars ? '#C4B5FD' : '#FFB347'} dur="0.7s" fill="freeze" />
                </stop>
                <stop offset="40%" stopColor={accentColor}>
                  <animate attributeName="stopColor" values={accentColor} dur="0.7s" fill="freeze" />
                </stop>
                <stop offset="100%" stopColor={accentDark}>
                  <animate attributeName="stopColor" values={accentDark} dur="0.7s" fill="freeze" />
                </stop>
              </radialGradient>
              <radialGradient id="grapeShine" cx="30%" cy="25%" r="50%">
                <stop offset="0%" stopColor={isMars ? '#EDE9FE' : '#FFDEAD'} stopOpacity="0.9" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B7355" />
                <stop offset="100%" stopColor="#5D4E37" />
              </linearGradient>
              <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7CB342" />
                <stop offset="100%" stopColor="#558B2F" />
              </linearGradient>
            </defs>
            <circle cx="35" cy="45" r="14" fill="url(#grapeGold)" />
            <circle cx="32" cy="40" r="6" fill="url(#grapeShine)" />
            <circle cx="58" cy="42" r="13" fill="url(#grapeGold)" />
            <circle cx="55" cy="37" r="5" fill="url(#grapeShine)" />
            <circle cx="46" cy="55" r="15" fill="url(#grapeGold)" />
            <circle cx="42" cy="49" r="6" fill="url(#grapeShine)" />
            <circle cx="30" cy="65" r="12" fill="url(#grapeGold)" />
            <circle cx="27" cy="60" r="5" fill="url(#grapeShine)" />
            <circle cx="55" cy="68" r="13" fill="url(#grapeGold)" />
            <circle cx="51" cy="63" r="5" fill="url(#grapeShine)" />
            <circle cx="42" cy="78" r="11" fill="url(#grapeGold)" />
            <circle cx="39" cy="74" r="4" fill="url(#grapeShine)" />
            <circle cx="68" cy="55" r="11" fill="url(#grapeGold)" />
            <circle cx="65" cy="51" r="4" fill="url(#grapeShine)" />
            <path
              d="M46 32 Q44 18 48 8"
              stroke="#6B4E2A"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M48 10 Q60 0 76 10 Q68 20 60 17 Q54 14 48 10"
              fill="url(#leafGradient)"
              stroke="#4A7A25"
              strokeWidth="2"
            />
            <path
              d="M48 10 Q36 2 22 12 Q30 20 38 17 Q44 14 48 10"
              fill="url(#leafGradient)"
              stroke="#4A7A25"
              strokeWidth="2"
            />
            <path
              d="M56 6 Q60 3 66 6"
              stroke="#5D8A3E"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </a>

        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="relative px-3.5 py-1.5 text-[14px] font-medium text-white/60 transition-colors duration-200 hover:text-white whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block w-px h-5 bg-white/[0.1] mx-2" />

        <button
          onClick={() => navigate('/connexion')}
          className="hidden md:block px-3.5 py-1.5 text-[14px] font-medium text-white/70 hover:text-white transition-colors duration-200 whitespace-nowrap bg-transparent border-none cursor-pointer"
        >
          Connexion
        </button>

        <button
          onClick={() => navigate('/connexion', { state: isMars ? { openSignup: 'enterprise' } : { openSignup: 'creator' } })}
          className="hidden md:block ml-1 px-5 py-2 text-[13px] font-semibold whitespace-nowrap rounded-full transition-all duration-700 border-none cursor-pointer"
          style={{
            color: accentColor,
            textShadow: `0 0 8px rgba(${accentRgb},0.5), 0 0 20px rgba(${accentRgb},0.25)`,
            border: `1px solid ${accentDark}4d`,
            background: `rgba(${accentRgb}, 0.06)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `rgba(${accentRgb}, 0.12)`;
            e.currentTarget.style.borderColor = `rgba(${accentRgb}, 0.4)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `rgba(${accentRgb}, 0.06)`;
            e.currentTarget.style.borderColor = `${accentDark}4d`;
          }}
        >
          {isMars ? 'Poste ton annonce' : 'Devenez createur'}
        </button>

        <button
          type="button"
          className="md:hidden text-white/70 hover:text-white transition-colors ml-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full mt-2 left-4 right-4 md:hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2.5 text-[14px] font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 mt-2 border-t border-white/[0.06] flex flex-col gap-1">
              <button
                className="px-3 py-2.5 text-[14px] font-medium text-white/60 hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer"
                onClick={() => { setMobileOpen(false); navigate('/connexion'); }}
              >
                Connexion
              </button>
              <button
                className="mx-3 mb-1 py-2.5 text-center text-[13px] font-semibold rounded-full transition-all duration-700 border-none cursor-pointer"
                style={{
                  color: accentColor,
                  textShadow: `0 0 8px rgba(${accentRgb},0.5), 0 0 20px rgba(${accentRgb},0.25)`,
                  border: `1px solid ${accentDark}4d`,
                  background: `rgba(${accentRgb}, 0.06)`,
                }}
                onClick={() => { setMobileOpen(false); navigate('/connexion', { state: isMars ? { openSignup: 'enterprise' } : { openSignup: 'creator' } }); }}
              >
                {isMars ? 'Poste ton annonce' : 'Devenez createur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
