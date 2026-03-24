import { useState, useEffect, useRef } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ChevronRight, ChevronDown, Megaphone, Video, Search, UserCheck, Check, X } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import usersIcon from '@/shared/assets/users-outline.svg';
import campaignIcon from '@/shared/assets/campaign.svg';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';

interface Campaign {
  id: string;
  name: string;
  photo_url: string | null;
  status: string;
  platforms: string[] | null;
  budget: string | null;
  content_type: string | null;
  platform_budgets: Record<string, { amount: string; per1000: string; min: string; max: string }> | null;
  require_review: boolean;
}

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};
const contentOptions = ['Gaming', 'Produit', 'Personal Brand', 'Technologie', 'Cosmétique', 'Beauté', 'Application', 'Autres'];
const BUDGET_MIN_FB = 0;
const BUDGET_MAX_FB = 10000;

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  selectedContent: string | null;
  setSelectedContent: (c: string | null) => void;
  budgetMin: number;
  setBudgetMin: (n: number) => void;
  budgetMax: number;
  setBudgetMax: (n: number) => void;
  selectedPlatforms: Set<string>;
  togglePlatform: (p: string) => void;
  resetAllFilters: () => void;
}

function FilterBar({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  selectedContent, setSelectedContent,
  budgetMin, setBudgetMin, budgetMax, setBudgetMax,
  selectedPlatforms, togglePlatform,
  resetAllFilters,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getFilterLabel = (filter: string) => {
    if (filter === 'Catégories' && selectedCategory) return selectedCategory;
    if (filter === 'Contenu' && selectedContent) return selectedContent;
    if (filter === 'Budget' && (budgetMin > BUDGET_MIN_FB || budgetMax < BUDGET_MAX_FB))
      return `${budgetMin}€ - ${budgetMax}€`;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Catégories') return !!selectedCategory;
    if (filter === 'Contenu') return !!selectedContent;
    if (filter === 'Budget') return budgetMin > BUDGET_MIN_FB || budgetMax < BUDGET_MAX_FB;
    return false;
  };

  const hasAnyFilter = !!selectedCategory || !!selectedContent || budgetMin > BUDGET_MIN_FB || budgetMax < BUDGET_MAX_FB || selectedPlatforms.size > 0 || searchQuery.trim() !== '';

  return (
    <div ref={dropdownRef}>
      <div className="sm:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="hidden sm:flex items-center gap-3 overflow-x-auto no-scrollbar">
        {['Catégories', 'Contenu', 'Budget'].map((filter) => (
          <div key={filter} className="relative">
            <div className="flex items-center">
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
            </div>

            {openDropdown === filter && filter === 'Catégories' && (
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
                      onClick={() => { setSelectedCategory(isSelected ? null : option); setOpenDropdown(null); }}
                      className="w-full flex items-center justify-between px-3 py-3 mx-0 text-sm font-semibold transition-all duration-200 group"
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
                      onClick={() => { setSelectedContent(isSelected ? null : option); setOpenDropdown(null); }}
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
                          setBudgetMin(val === '' ? 0 : Math.min(Number(val), budgetMax));
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
                        value={budgetMax === BUDGET_MAX_FB ? '' : String(budgetMax)}
                        placeholder="10000"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setBudgetMax(val === '' ? BUDGET_MAX_FB : Math.max(Number(val), budgetMin));
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
          <div className="relative w-44 sm:w-44 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm text-white placeholder-white/40 border border-white/30 focus:border-white/60 focus:outline-none transition-colors"
              style={{ backgroundColor: '#050404' }}
            />
          </div>
          <button
            onClick={() => togglePlatform('instagram')}
            className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200 ${
              selectedPlatforms.has('instagram')
                ? 'border-white bg-white/15 ring-1 ring-white/30'
                : 'border-white/30 hover:border-white/60 hover:bg-white/5'
            }`}
          >
            <img src={instagramIcon} alt="Instagram" className="w-5 h-5 social-icon" />
          </button>
          <button
            onClick={() => togglePlatform('tiktok')}
            className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200 ${
              selectedPlatforms.has('tiktok')
                ? 'border-white bg-white/15 ring-1 ring-white/30'
                : 'border-white/30 hover:border-white/60 hover:bg-white/5'
            }`}
          >
            <img src={tiktokIcon} alt="TikTok" className="w-5 h-5 social-icon" />
          </button>
          <button
            onClick={() => togglePlatform('youtube')}
            className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200 ${
              selectedPlatforms.has('youtube')
                ? 'border-white bg-white/15 ring-1 ring-white/30'
                : 'border-white/30 hover:border-white/60 hover:bg-white/5'
            }`}
          >
            <img src={youtubeIcon} alt="YouTube" className="w-5 h-5 social-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentTypeTag({ type }: { type: string | null }) {
  if (!type) return null;
  const lower = type.toLowerCase();
  const isUgc = lower === 'ugc';
  const isClipping = lower === 'clipping';
  if (!isUgc && !isClipping) return null;

  const style: React.CSSProperties = isUgc
    ? { background: 'rgba(255,0,217,0.12)', border: '1px solid rgba(255,0,217,0.3)', color: '#FF00D9' }
    : { background: 'rgba(57,31,154,0.12)', border: '1px solid rgba(57,31,154,0.3)', color: '#a78bfa' };

  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0" style={style}>
      {type}
    </span>
  );
}

export default function ValidationVideosPage() {
  const navigate = useEnterpriseNavigate();
  const [videoCampaigns, setVideoCampaigns] = useState<Campaign[]>([]);
  const [creatorCampaigns, setCreatorCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(BUDGET_MIN_FB);
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX_FB);
  const [videosExpanded, setVideosExpanded] = useState(false);
  const [creatorsExpanded, setCreatorsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [videoRes, creatorRes] = await Promise.all([
        supabase
          .from('campaigns')
          .select('id, name, photo_url, status, platforms, budget, content_type, platform_budgets, require_review')
          .in('status', ['published', 'paused'])
          .order('created_at', { ascending: false }),
        supabase
          .from('campaigns')
          .select('id, name, photo_url, status, platforms, budget, content_type, platform_budgets, require_review')
          .in('status', ['published', 'paused'])
          .eq('require_review', true)
          .order('created_at', { ascending: false }),
      ]);

      setVideoCampaigns(videoRes.data || []);
      setCreatorCampaigns(creatorRes.data || []);
    };
    fetchData();
  }, []);

  const pendingVerifications = 2;

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedContent(null);
    setBudgetMin(BUDGET_MIN_FB);
    setBudgetMax(BUDGET_MAX_FB);
    setSelectedPlatforms(new Set());
    setSearchQuery('');
  };

  const filterCampaigns = (list: Campaign[]) =>
    list.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatforms.size === 0 || (c.platforms && c.platforms.some((p) => selectedPlatforms.has(p)));
      return matchesSearch && matchesPlatform;
    });

  const filteredVideoCampaigns = filterCampaigns(videoCampaigns);
  const filteredCreatorCampaigns = filterCampaigns(creatorCampaigns);

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="max-w-5xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Validation videos &amp; createurs</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Ici vous pourrez valider les videos et les demandes des createurs
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div
            className="rounded-xl p-3 sm:p-4 lg:p-7 flex flex-col items-center sm:items-start"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div className="hidden sm:flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <img src={usersIcon} alt="Verification" className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </div>
              <p className="text-[9px] lg:text-xs text-white/60 font-semibold uppercase tracking-widest leading-tight">Validation createur</p>
            </div>
            <div
              className="sm:hidden w-6 h-6 rounded-lg flex items-center justify-center mb-1.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <img src={usersIcon} alt="Verification" className="w-3 h-3" />
            </div>
            <p className="sm:hidden text-[8px] text-white/60 font-semibold uppercase tracking-widest leading-tight mb-1.5 text-center">Validation<br />createur</p>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white">{pendingVerifications}</span>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/35 font-medium mt-0.5 sm:mt-1">en attente</p>
          </div>

          <div
            className="rounded-xl p-3 sm:p-4 lg:p-7 flex flex-col items-center sm:items-start"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div className="hidden sm:flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <img src={campaignIcon} alt="Campagne" className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </div>
              <p className="text-[9px] lg:text-xs text-white/60 font-semibold uppercase tracking-widest">Campagne</p>
            </div>
            <div
              className="sm:hidden w-6 h-6 rounded-lg flex items-center justify-center mb-1.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <img src={campaignIcon} alt="Campagne" className="w-3 h-3" />
            </div>
            <p className="sm:hidden text-[8px] text-white/60 font-semibold uppercase tracking-widest mb-1.5 text-center">Campagne</p>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white">{videoCampaigns.length}</span>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/35 font-medium mt-0.5 sm:mt-1">avec videos</p>
          </div>

          <div
            className="rounded-xl p-3 sm:p-4 lg:p-7 flex flex-col items-center sm:items-start"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div className="hidden sm:flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <Video className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white/80" />
              </div>
              <p className="text-[9px] lg:text-xs text-white/60 font-semibold uppercase tracking-widest">Videos</p>
            </div>
            <div
              className="sm:hidden w-6 h-6 rounded-lg flex items-center justify-center mb-1.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <Video className="w-3 h-3 text-white/80" />
            </div>
            <p className="sm:hidden text-[8px] text-white/60 font-semibold uppercase tracking-widest mb-1.5 text-center">Videos</p>
            <span className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white">{pendingVerifications}</span>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/35 font-medium mt-0.5 sm:mt-1">a verifier</p>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mt-2 py-3">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedContent={selectedContent}
            setSelectedContent={setSelectedContent}
            budgetMin={budgetMin}
            setBudgetMin={setBudgetMin}
            budgetMax={budgetMax}
            setBudgetMax={setBudgetMax}
            selectedPlatforms={selectedPlatforms}
            togglePlatform={togglePlatform}
            resetAllFilters={resetAllFilters}
          />
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <button
            onClick={() => setVideosExpanded(!videosExpanded)}
            className="w-full rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-white/[0.07] mb-3"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13)',
              }}
            >
              <Video className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white">
                Validation videos
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {filteredVideoCampaigns.length} campagne{filteredVideoCampaigns.length !== 1 ? 's' : ''} &mdash; {filteredVideoCampaigns.length * pendingVerifications} vidéo{filteredVideoCampaigns.length * pendingVerifications !== 1 ? 's' : ''} à vérifier
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13)',
                }}
              >
                {filteredVideoCampaigns.length * pendingVerifications}
              </div>
              <ChevronDown
                className="w-4 h-4 text-white/30 transition-transform duration-300"
                style={{ transform: videosExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </div>
          </button>

          <div
            className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              maxHeight: videosExpanded ? `${Math.max(filteredVideoCampaigns.length, 1) * 120}px` : '0px',
              opacity: videosExpanded ? 1 : 0,
            }}
          >
            <div className="space-y-3">
              {filteredVideoCampaigns.length > 0 ? (
                filteredVideoCampaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    badgeCount={pendingVerifications}
                    badgeStyle={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'none' }}
                    subLabel={`${pendingVerifications} vidéo${pendingVerifications > 1 ? 's' : ''} à vérifier`}
                    onClick={() => navigate(`/ma-campagne/${campaign.id}/verifications`, { state: { from: '/validation-videos' } })}
                  />
                ))
              ) : (
                <EmptyRow label="Aucune campagne avec des vidéos à vérifier" />
              )}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <button
            onClick={() => setCreatorsExpanded(!creatorsExpanded)}
            className="w-full rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-white/[0.07] mb-3"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13)',
              }}
            >
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white">Validation de createur</p>
              <p className="text-xs text-white/30 mt-0.5">
                {filteredCreatorCampaigns.length} campagne{filteredCreatorCampaigns.length !== 1 ? 's' : ''} priv&eacute;e{filteredCreatorCampaigns.length !== 1 ? 's' : ''} &mdash; demandes en attente
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13)',
                }}
              >
                {filteredCreatorCampaigns.length}
              </div>
              <ChevronDown
                className="w-4 h-4 text-white/30 transition-transform duration-300"
                style={{ transform: creatorsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </div>
          </button>

          <div
            className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              maxHeight: creatorsExpanded ? `${Math.max(filteredCreatorCampaigns.length, 1) * 120}px` : '0px',
              opacity: creatorsExpanded ? 1 : 0,
            }}
          >
            <div className="space-y-3">
              {filteredCreatorCampaigns.length > 0 ? (
                filteredCreatorCampaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    badgeCount={pendingVerifications}
                    badgeStyle={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'none' }}
                    subLabel={`${pendingVerifications} créateur${pendingVerifications > 1 ? 's' : ''} en attente`}
                    onClick={() => navigate(`/ma-campagne/${campaign.id}/validation-createurs`, { state: { from: '/validation-videos' } })}
                  />
                ))
              ) : (
                <EmptyRow label="Aucune campagne privee avec des demandes en attente" />
              )}
            </div>
          </div>
        </div>
        <div className="pb-10" />
      </div>
    </div>
  );
}

interface CampaignRowProps {
  campaign: Campaign;
  badgeCount: number;
  badgeStyle: React.CSSProperties;
  subLabel: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

function CampaignRow({ campaign, badgeCount, badgeStyle, subLabel, icon, onClick }: CampaignRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full group rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:bg-white/[0.07]"
      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      {campaign.photo_url ? (
        <img
          src={campaign.photo_url}
          alt={campaign.name}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
      ) : (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Megaphone className="w-5 h-5 text-white/20" />
        </div>
      )}

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-sm font-semibold text-white truncate">{campaign.name}</p>
          {campaign.platforms && campaign.platforms.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              {campaign.platforms.map((p) =>
                platformIconMap[p] ? (
                  <div
                    key={p}
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <img src={platformIconMap[p]} alt={p} className="w-3.5 h-3.5 social-icon" />
                  </div>
                ) : null
              )}
            </div>
          )}
          <ContentTypeTag type={campaign.content_type} />
        </div>
        <p className="text-xs text-white/30 mt-0.5">{subLabel}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {campaign.budget && (
          <div className="hidden sm:flex items-baseline gap-1">
            <span className="text-sm font-bold text-white">$0</span>
            <span className="text-xs text-white/30 font-medium">/ {campaign.budget}</span>
          </div>
        )}
        {icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,180,50,0.1)' }}
          >
            {icon}
          </div>
        )}
        <div className="px-3 py-1 rounded-full text-xs font-bold" style={badgeStyle}>
          {badgeCount}
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
      </div>
    </button>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl p-6 flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <p className="text-sm text-white/30">{label}</p>
    </div>
  );
}
