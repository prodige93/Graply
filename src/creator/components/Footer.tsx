import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  isMars: boolean;
}

const creatorLinks = [
  { label: 'Devenir createur', href: '#pricing' },
  { label: 'Comment ca marche', href: '#how-it-works' },
  { label: 'Campagnes populaires', href: '#marques' },
  { label: 'FAQ', href: '#faq' },
];

const brandLinks = [
  { label: 'Poster une annonce', href: '#pricing' },
  { label: 'Comment ca marche', href: '#how-it-works' },
  { label: 'Nos createurs', href: '#marques' },
  { label: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { label: 'Mentions legales', href: '#' },
  { label: 'Politique de confidentialite', href: '#' },
  { label: 'CGU', href: '#' },
];

export default function Footer({ isMars }: FooterProps) {
  const accentColor = isMars ? '#8B5CF6' : '#FFA500';
  const accentDark = isMars ? '#6D28D9' : '#CC7A00';
  const accentRgb = isMars ? '139,92,246' : '255,165,0';
  const links = isMars ? brandLinks : creatorLinks;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#') return;
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black w-full border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8 md:items-start md:justify-between">

          <div className="shrink-0 flex flex-col items-start gap-5">
            <svg
              width="40"
              height="40"
              viewBox="0 0 100 100"
              className="transition-all duration-700"
              style={{ filter: `drop-shadow(0 0 12px rgba(${accentRgb},0.4))` }}
            >
              <defs>
                <radialGradient id="footerGrapeGold" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor={isMars ? '#C4B5FD' : '#FFB347'} />
                  <stop offset="40%" stopColor={accentColor} />
                  <stop offset="100%" stopColor={accentDark} />
                </radialGradient>
                <radialGradient id="footerGrapeShine" cx="30%" cy="25%" r="50%">
                  <stop offset="0%" stopColor={isMars ? '#EDE9FE' : '#FFDEAD'} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="footerLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7CB342" />
                  <stop offset="100%" stopColor="#558B2F" />
                </linearGradient>
              </defs>
              <circle cx="35" cy="45" r="14" fill="url(#footerGrapeGold)" />
              <circle cx="32" cy="40" r="6" fill="url(#footerGrapeShine)" />
              <circle cx="58" cy="42" r="13" fill="url(#footerGrapeGold)" />
              <circle cx="55" cy="37" r="5" fill="url(#footerGrapeShine)" />
              <circle cx="46" cy="55" r="15" fill="url(#footerGrapeGold)" />
              <circle cx="42" cy="49" r="6" fill="url(#footerGrapeShine)" />
              <circle cx="30" cy="65" r="12" fill="url(#footerGrapeGold)" />
              <circle cx="27" cy="60" r="5" fill="url(#footerGrapeShine)" />
              <circle cx="55" cy="68" r="13" fill="url(#footerGrapeGold)" />
              <circle cx="51" cy="63" r="5" fill="url(#footerGrapeShine)" />
              <circle cx="42" cy="78" r="11" fill="url(#footerGrapeGold)" />
              <circle cx="39" cy="74" r="4" fill="url(#footerGrapeShine)" />
              <circle cx="68" cy="55" r="11" fill="url(#footerGrapeGold)" />
              <circle cx="65" cy="51" r="4" fill="url(#footerGrapeShine)" />
              <path d="M46 32 Q44 18 48 8" stroke="#6B4E2A" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M48 10 Q60 0 76 10 Q68 20 60 17 Q54 14 48 10" fill="url(#footerLeafGradient)" stroke="#4A7A25" strokeWidth="2" />
              <path d="M48 10 Q36 2 22 12 Q30 20 38 17 Q44 14 48 10" fill="url(#footerLeafGradient)" stroke="#4A7A25" strokeWidth="2" />
              <path d="M56 6 Q60 3 66 6" stroke="#5D8A3E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
            </svg>

            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors duration-200"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors duration-200"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors duration-200"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            <p className="hidden md:block text-white/40 text-sm leading-relaxed max-w-[220px]">
              {isMars
                ? 'La plateforme qui connecte les marques aux meilleurs createurs pour des campagnes d\'influence performantes.'
                : 'Rejoignez la communaute de createurs et monetisez votre audience avec les meilleures marques.'}
            </p>
          </div>

          <div className="flex flex-col gap-6 md:hidden">
            <p className="text-white/40 text-sm leading-relaxed">
              {isMars
                ? 'La plateforme qui connecte les marques aux meilleurs createurs pour des campagnes d\'influence performantes.'
                : 'Rejoignez la communaute de createurs et monetisez votre audience avec les meilleures marques.'}
            </p>
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-700"
                style={{ color: accentColor }}
              >
                Contact
              </h4>
              <div className="flex flex-col gap-2.5">
                <a
                  href="mailto:contact@raisin.app"
                  className="flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors duration-200"
                >
                  <Mail className="w-3.5 h-3.5" />
                  contact@raisin.app
                </a>
                <a
                  href="tel:+33123456789"
                  className="flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors duration-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  +33 1 23 45 67 89
                </a>
                <div className="flex items-center gap-2 text-white/35 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  Paris, France
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-5 transition-colors duration-700"
              style={{ color: accentColor }}
            >
              Navigation
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="group flex items-center gap-1.5 text-white/45 hover:text-white/80 text-sm transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0">
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-5 transition-colors duration-700"
              style={{ color: accentColor }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/45 hover:text-white/80 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 hidden md:block">
            <h4
              className="text-xs font-semibold uppercase tracking-widest mb-5 transition-colors duration-700"
              style={{ color: accentColor }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contact@raisin.app"
                className="flex items-center gap-2 text-white/45 hover:text-white/80 text-sm transition-colors duration-200"
              >
                <Mail className="w-3.5 h-3.5" />
                contact@raisin.app
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-white/45 hover:text-white/80 text-sm transition-colors duration-200"
              >
                <Phone className="w-3.5 h-3.5" />
                +33 7 67 61 40 97 
              </a>
              <div className="flex items-center gap-2 text-white/45 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                Paris, France
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <p className="text-white/25 text-xs">
            {new Date().getFullYear()} Raisin. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
