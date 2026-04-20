import { useState, useEffect, useRef, useMemo } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { Bookmark, Trash2, Search, ChevronDown, Check, X } from 'lucide-react';
import CampaignCard, { type CampaignData } from '../components/CampaignCard';
import GrapeLoader from '../components/GrapeLoader';
import { useSavedCampaigns } from '@/enterprise/contexts/SavedCampaignsContext';
import { resolveSavedCampaignsList, mergeSavedCampaignsInOrder } from '@/shared/lib/resolveSavedCampaignsList';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
};

const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};
const contentOptions = ['Gaming', 'Produit', 'Personal Brand', 'Technologie', 'Cosmétique', 'Beauté', 'Application', 'Autres'];
const BUDGET_MIN = 0;
const BUDGET_MAX = 10000;

type FilterState = {
  searchQuery: string;
  selectedCategory: string | null;
  selectedContent: string | null;
  budgetMin: number;
  budgetMax: number;
  selectedPlatforms: Set<string>;
};

function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
}) {
  const { searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms } = filters;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePlatform = (p: string) => {
    const next = new Set(selectedPlatforms);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange({ selectedPlatforms: next });
  };

  const getFilterLabel = (filter: string) => {
    if (filter === 'Categories' && selectedCategory) return selectedCategory;
    if (filter === 'Contenu' && selectedContent) return selectedContent;
    if (filter === 'Budget' && (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX))
      return `${budgetMin}€ - ${budgetMax}€`;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Categories') return !!selectedCategory;
    if (filter === 'Contenu') return !!selectedContent;
    if (filter === 'Budget') return budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX;
    return false;
  };

  const hasAnyFilter = useMemo(
    () => !!selectedCategory || !!selectedContent || budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX || selectedPlatforms.size > 0 || searchQuery.trim() !== '',
    [selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms, searchQuery]
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
    <div ref={dropdownRef} className="hidden lg:flex flex-wrap items-center gap-3">
      {['Categories', 'Contenu', 'Budget'].map((filter) => (
        <div key={filter} className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === filter ? null : filter)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap"
            style={
              openDropdown === filter || hasActiveValue(filter)
                ? {
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.7)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.15)',
                  }
            }
          >
            {getFilterLabel(filter)}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === filter ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === filter && filter === 'Categories' && (
            <div
              className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden"
              style={{
                background: 'rgba(30, 28, 28, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div className="pt-1.5" />
              {categoryOptions.map((option) => {
                const isSelected = selectedCategory === option;
                const color = categoryColors[option];
                return (
                  <button
                    key={option}
                    onClick={() => { onChange({ selectedCategory: isSelected ? null : option }); setOpenDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold transition-all duration-200"
                    style={{ color: isSelected ? color : 'rgba(255,255,255,0.85)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isSelected ? color : 'rgba(255,255,255,0.85)'; }}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200" style={{ background: isSelected ? color : 'rgba(255,255,255,0.2)', boxShadow: isSelected ? `0 0 6px ${color}` : 'none' }} />
                      {option}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />}
                  </button>
                );
              })}
              <div className="pb-1.5" />
            </div>
          )}

          {openDropdown === filter && filter === 'Contenu' && (
            <div
              className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden"
              style={{
                background: 'rgba(30, 28, 28, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div className="pt-1.5" />
              {contentOptions.map((option) => {
                const isSelected = selectedContent === option;
                return (
                  <button
                    key={option}
                    onClick={() => { onChange({ selectedContent: isSelected ? null : option }); setOpenDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold transition-all duration-200"
                    style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isSelected ? '#fff' : 'rgba(255,255,255,0.2)', boxShadow: isSelected ? '0 0 6px rgba(255,255,255,0.6)' : 'none' }} />
                      {option}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-white" />}
                  </button>
                );
              })}
              <div className="pb-1.5" />
            </div>
          )}

          {openDropdown === filter && filter === 'Budget' && (
            <div
              className="absolute top-full left-0 mt-2 w-72 rounded-2xl z-50 p-5"
              style={{
                background: 'rgba(30, 28, 28, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-4">Fourchette de budget</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Min</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetMin === 0 ? '' : String(budgetMin)}
                      placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        onChange({ budgetMin: val === '' ? 0 : Math.min(Number(val), budgetMax) });
                      }}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white border border-white/20 focus:border-white/50 focus:outline-none"
                      style={{ backgroundColor: '#050404' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">EUR</span>
                  </div>
                </div>
                <span className="text-white/30 mt-5">-</span>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Max</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetMax === BUDGET_MAX ? '' : String(budgetMax)}
                      placeholder="10000"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        onChange({ budgetMax: val === '' ? BUDGET_MAX : Math.max(Number(val), budgetMin) });
                      }}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white border border-white/20 focus:border-white/50 focus:outline-none"
                      style={{ backgroundColor: '#050404' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">EUR</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpenDropdown(null)}
                className="w-full mt-2 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>
      ))}

      {hasAnyFilter && (
        <button
          onClick={resetAllFilters}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white transition-colors whitespace-nowrap"
        >
          <X className="w-3.5 h-3.5" />
          Effacer
        </button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm text-white placeholder-white/40 border border-white/30 focus:border-white/60 focus:outline-none transition-colors"
            style={{ backgroundColor: '#050404' }}
          />
        </div>
        {[
          { key: 'instagram', icon: instagramIcon, label: 'Instagram' },
          { key: 'tiktok', icon: tiktokIcon, label: 'TikTok' },
          { key: 'youtube', icon: youtubeIcon, label: 'YouTube' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => togglePlatform(key)}
            className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200 ${
              selectedPlatforms.has(key)
                ? 'border-white bg-white/15 ring-1 ring-white/30'
                : 'border-white/30 hover:border-white/60 hover:bg-white/5'
            }`}
          >
            <img src={icon} alt={label} className="w-5 h-5 social-icon" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SavedCardMobile({ data, onRemove }: { data: CampaignData; onRemove: () => void }) {
  const navigate = useEnterpriseNavigate();

  return (
    <div
      onClick={() => navigate(`/campagne/${data.id}`, { state: { from: '/enregistre' } })}
      className="rounded-2xl overflow-hidden cursor-pointer relative"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-stretch h-[150px]">
        <div className="relative w-28 shrink-0 h-full">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 left-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-10"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1.5 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{data.brand}</p>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{data.title}</h3>
          </div>

          <div className="flex items-center" style={{ gap: 0 }}>
            {data.socials.filter((p) => platformIconMap[p]).map((p, i, arr) => (
              <div key={p} style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(20,20,28,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                marginLeft: i === 0 ? 0 : -7, zIndex: arr.length - i, position: 'relative' as const,
              }}>
                <img src={platformIconMap[p]} alt={p} style={{ width: 10, height: 10, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              </div>
            ))}
          </div>

          <div className="flex items-center" style={{ gap: 0 }}>
            {data.tags.filter((t) => ['ugc', 'clipping', 'contenu'].includes(t.toLowerCase())).map((tag, i, arr) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                style={{
                  ...(tag.toLowerCase() === 'ugc'
                    ? { background: 'linear-gradient(135deg, rgba(255,100,200,0.35) 0%, rgba(255,0,180,0.18) 50%, rgba(200,0,150,0.28) 100%)', border: '1px solid rgba(255,130,210,0.55)', color: '#ffffff', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,200,240,0.3), 0 0 10px rgba(255,0,180,0.2)', textShadow: '0 0 8px rgba(255,150,220,0.6)', outline: '2px solid rgba(10,10,15,1)' }
                    : { background: 'rgba(57,31,154,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(57,31,154,0.5)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.2)', outline: '2px solid rgba(10,10,15,1)' }),
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: arr.length + 1 - i,
                  position: 'relative' as const,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(145deg, rgba(177,188,255,0.22) 0%, rgba(177,188,255,0.08) 50%, rgba(120,133,255,0.18) 100%)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(177,188,255,0.45)', boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(120,133,255,0.2) inset, 0 2px 8px rgba(177,188,255,0.15)' }}>
              <span className="text-[11px] font-bold text-white">{data.ratePerView}</span>
              <span className="text-[9px] font-medium text-white/50">/1K</span>
            </div>
            <span className="text-white/20 text-[9px]">·</span>
            <span className="text-[11px] font-bold text-white/70">{data.budget}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavedCampaignsPage() {
  const navigate = useEnterpriseNavigate();
  const { savedIds, previewById, toggle } = useSavedCampaigns();
  const [savedCampaigns, setSavedCampaigns] = useState<CampaignData[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: null,
    selectedContent: null,
    budgetMin: BUDGET_MIN,
    budgetMax: BUDGET_MAX,
    selectedPlatforms: new Set(),
  });

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (savedIds.length === 0) {
      setSavedCampaigns([]);
      setListLoading(false);
      return () => { cancelled = true; };
    }
    setListLoading(true);
    (async () => {
      const resolved = await resolveSavedCampaignsList(savedIds);
      if (!cancelled) {
        setSavedCampaigns(
          mergeSavedCampaignsInOrder<CampaignData>(
            savedIds,
            resolved as CampaignData[],
            previewById as Record<string, CampaignData | undefined>,
          ),
        );
        setListLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [savedIds, previewById]);

  const { searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms } = filters;

  const filteredCampaigns = useMemo(() => {
    return savedCampaigns.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory) {
        if (!c.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase())) return false;
      }
      if (selectedContent) {
        if (!c.tags.some((t) => t.toLowerCase() === selectedContent.toLowerCase())) return false;
      }
      if (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX) {
        const budgetNum = parseFloat(c.budget.replace(/[$,]/g, ''));
        if (budgetNum < budgetMin || budgetNum > budgetMax) return false;
      }
      if (selectedPlatforms.size > 0) {
        if (!c.socials.some((s) => selectedPlatforms.has(s))) return false;
      }
      return true;
    });
  }, [savedCampaigns, searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms]);

  return (
    <div className="min-h-full text-white">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="text-xl lg:text-2xl font-bold text-white">Enregistre</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {savedIds.length} campagne{savedIds.length !== 1 ? 's' : ''} sauvegardee{savedIds.length !== 1 ? 's' : ''}
          {listLoading && savedIds.length > 0 ? ' · chargement…' : ''}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <FilterBar filters={filters} onChange={updateFilters} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        {listLoading && savedIds.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <GrapeLoader size="md" />
            <p className="text-sm text-white/35">Chargement des campagnes…</p>
          </div>
        ) : savedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Bookmark className="w-7 h-7 text-white/25" />
            </div>
            <div className="text-center max-w-sm">
              {savedIds.length > 0 ? (
                <>
                  <p className="text-white/50 font-semibold">Enregistrement detecte mais campagnes introuvables</p>
                  <p className="text-white/25 text-sm mt-1">
                    Les IDs sont sur ton profil entreprise ; recharge ou verifie que les campagnes existent encore.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white/50 font-semibold">Aucune campagne enregistree</p>
                  <p className="text-white/25 text-sm mt-1">Les campagnes sauvegardees dans l&apos;app entreprise apparaissent ici</p>
                </>
              )}
            </div>
            <button
              onClick={() => navigate('/campagnes')}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors"
            >
              Explorer les campagnes
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-white/40 text-sm font-medium">Aucune campagne trouvee</p>
            <p className="text-white/20 text-xs">Modifiez les filtres</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} data={campaign} from="/enregistre" />
              ))}
            </div>
            <div className="sm:hidden space-y-3 pb-10">
              {filteredCampaigns.map((campaign) => (
                <SavedCardMobile
                  key={campaign.id}
                  data={campaign}
                  onRemove={() => toggle(campaign.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
