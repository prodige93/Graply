import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';

const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#7C6FCD',
};
const contentOptions = [
  'Gaming', 'Produit', 'Personal Brand', 'Technologie',
  'Cosmétique', 'Beauté', 'Application', 'Autres',
];
const BUDGET_MIN = 0;
const BUDGET_MAX = 10000;

export type FilterState = {
  searchQuery: string;
  selectedCategory: string | null;
  selectedContent: string | null;
  budgetMin: number;
  budgetMax: number;
  selectedPlatforms: Set<string>;
};

export const defaultFilterState: FilterState = {
  searchQuery: '',
  selectedCategory: null,
  selectedContent: null,
  budgetMin: BUDGET_MIN,
  budgetMax: BUDGET_MAX,
  selectedPlatforms: new Set(),
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
}

const platformButtons = [
  { key: 'instagram', src: instagramIcon, alt: 'Instagram' },
  { key: 'tiktok', src: tiktokIcon, alt: 'TikTok' },
  { key: 'youtube', src: youtubeIcon, alt: 'YouTube' },
];

const glassBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.75)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
};

const glassBtnActive: React.CSSProperties = {
  background: 'rgba(255,255,255,0.18)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.32)',
  color: '#fff',
  boxShadow: '0 2px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
};

const dropdownStyle: React.CSSProperties = {
  background: 'rgba(30,28,28,0.92)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.11)',
  boxShadow: '0 12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const { selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms } = filters;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePlatform = (p: string) => {
    const next = new Set(selectedPlatforms);
    next.has(p) ? next.delete(p) : next.add(p);
    onChange({ selectedPlatforms: next });
  };

  const getFilterLabel = (filter: string) => {
    if (filter === 'Categories' && selectedCategory) return selectedCategory;
    if (filter === 'Contenu' && selectedContent) return selectedContent;
    if (filter === 'Budget' && (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX))
      return `${budgetMin}€ – ${budgetMax}€`;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Categories') return !!selectedCategory;
    if (filter === 'Contenu') return !!selectedContent;
    if (filter === 'Budget') return budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX;
    return false;
  };

  const hasAnyFilter = useMemo(
    () =>
      !!selectedCategory ||
      !!selectedContent ||
      budgetMin > BUDGET_MIN ||
      budgetMax < BUDGET_MAX ||
      selectedPlatforms.size > 0 ||
      filters.searchQuery.trim() !== '',
    [selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms, filters.searchQuery]
  );

  const resetAllFilters = () => {
    onChange({
      selectedCategory: null,
      selectedContent: null,
      budgetMin: BUDGET_MIN,
      budgetMax: BUDGET_MAX,
      selectedPlatforms: new Set(),
      searchQuery: '',
    });
    setOpenDropdown(null);
  };

  return (
    <div ref={dropdownRef} className="hidden lg:flex items-center gap-2">

      {/* ── Left group: filter dropdowns + clear ── */}
      <div className="flex items-center gap-2">
        {['Categories', 'Contenu', 'Budget'].map((filter) => {
          const isOpen = openDropdown === filter;
          const active = hasActiveValue(filter);
          return (
            <div key={filter} className="relative">
              <button
                onClick={() => setOpenDropdown(isOpen ? null : filter)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                style={isOpen || active ? glassBtnActive : glassBtn}
              >
                {active && filter === 'Categories' && selectedCategory && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: categoryColors[selectedCategory] ?? '#fff' }}
                  />
                )}
                <span>{getFilterLabel(filter)}</span>
                <ChevronDown
                  className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && filter === 'Categories' && (
                <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl z-50 overflow-hidden" style={dropdownStyle}>
                  <div className="py-1.5">
                    {categoryOptions.map((opt) => {
                      const sel = selectedCategory === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { onChange({ selectedCategory: sel ? null : opt }); setOpenDropdown(null); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-all duration-150"
                          style={{ color: sel ? '#fff' : 'rgba(255,255,255,0.8)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: categoryColors[opt] }} />
                            {opt}
                          </span>
                          {sel && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isOpen && filter === 'Contenu' && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden" style={dropdownStyle}>
                  <div className="py-1.5">
                    {contentOptions.map((opt) => {
                      const sel = selectedContent === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { onChange({ selectedContent: sel ? null : opt }); setOpenDropdown(null); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-all duration-150"
                          style={{ color: sel ? '#fff' : 'rgba(255,255,255,0.8)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: sel ? '#fff' : 'rgba(255,255,255,0.2)', boxShadow: sel ? '0 0 6px rgba(255,255,255,0.5)' : 'none' }}
                            />
                            {opt}
                          </span>
                          {sel && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isOpen && filter === 'Budget' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl z-50 p-4" style={dropdownStyle}>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Budget (€)</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-white/30 mb-1">Min</p>
                      <input
                        type="number"
                        min={BUDGET_MIN}
                        max={budgetMax}
                        value={budgetMin}
                        onChange={(e) => onChange({ budgetMin: Math.min(Number(e.target.value), budgetMax) })}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-white/30 mb-1">Max</p>
                      <input
                        type="number"
                        min={budgetMin}
                        max={BUDGET_MAX}
                        value={budgetMax}
                        onChange={(e) => onChange({ budgetMax: Math.max(Number(e.target.value), budgetMin) })}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => { onChange({ budgetMin: BUDGET_MIN, budgetMax: BUDGET_MAX }); setOpenDropdown(null); }}
                    className="w-full py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {hasAnyFilter && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <X className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1 mx-2" style={{ minWidth: 32 }} />

      {/* ── Right group: search + platform logos ── */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Rechercher..."
            className="pl-9 pr-8 py-2.5 rounded-xl text-xs text-white placeholder-white/35 focus:outline-none transition-all duration-200 w-44"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3 text-white/40 hover:text-white/70 transition-colors" />
            </button>
          )}
        </div>

        {platformButtons.map(({ key, src, alt }) => {
          const active = selectedPlatforms.has(key);
          return (
            <button
              key={key}
              onClick={() => togglePlatform(key)}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200"
              style={
                active
                  ? {
                      background: 'rgba(255,255,255,0.15)',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 0 0 3px rgba(255,255,255,0.08)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1.5px solid rgba(255,255,255,0.14)',
                    }
              }
            >
              <img src={src} alt={alt} className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
