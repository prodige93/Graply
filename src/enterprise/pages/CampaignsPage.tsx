import { useState, useEffect, useRef, useMemo } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Search, ChevronDown, Check, X, ChevronRight } from 'lucide-react';
import iphone17Img from '@/shared/assets/hero-slide-iphone17.jpeg';
import bo7Img from '@/shared/assets/hero-slide-bo7.jpeg';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import CampaignCard from '../components/CampaignCard';
import type { CampaignData } from '../components/CampaignCard';
import { campaigns as staticCampaigns, sponsoredCampaigns, enterprises } from '@/shared/data/campaignsData';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';

const slides = [
  {
    id: 1,
    title: 'iPhone 17',
    image: iphone17Img,
    subtitle: 'Nouvelle collection',
  },
  {
    id: 2,
    title: 'Black Ops 7',
    image: bo7Img,
    subtitle: 'Campagne exclusive',
  },
];

const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};
const contentOptions = ['Gaming', 'Produit', 'Personal Brand', 'Technologie', 'Cosmétique', 'Beauté', 'Application', 'Autres'];
const BUDGET_MIN_FB = 0;
const BUDGET_MAX_FB = 10000;

function FilterBar({ instagramIcon, tiktokIcon, youtubeIcon }: { instagramIcon: string; tiktokIcon: string; youtubeIcon: string }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(BUDGET_MIN_FB);
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX_FB);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

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

  const hasAnyFilter = useMemo(
    () => !!selectedCategory || !!selectedContent || budgetMin > BUDGET_MIN_FB || budgetMax < BUDGET_MAX_FB || selectedPlatforms.size > 0 || searchQuery.trim() !== '',
    [selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms, searchQuery]
  );

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedContent(null);
    setBudgetMin(BUDGET_MIN_FB);
    setBudgetMax(BUDGET_MAX_FB);
    setSelectedPlatforms(new Set());
    setSearchQuery('');
    setOpenDropdown(null);
  };

  return (
    <div ref={dropdownRef}>
      {/* Mobile search bar */}
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

      {/* Desktop filter bar */}
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

export default function CampaignsPage() {
  const navigate = useEnterpriseNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbCampaigns, setDbCampaigns] = useState<CampaignData[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPublished = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (data) {
        setDbCampaigns(data.map(mapSupabaseCampaign));
      }
    };
    fetchPublished();
  }, []);

  const campaigns = useMemo(() => [...dbCampaigns, ...staticCampaigns], [dbCampaigns]);

  const matchingEnterprises = useMemo(() => enterprises.filter(() => false), []);

  const hasAnyFilter = false;

  const filteredCampaigns = useMemo(() => campaigns, [campaigns]);

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative w-full h-72 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-40"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, #050404 100%)'
              }}
            />
          </div>
        ))}

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-7 h-7 text-white" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 z-10">
          <h2 className="text-3xl font-bold">{slides[currentSlide].title}</h2>
          <p className="text-gray-300 mt-1">{slides[currentSlide].subtitle}</p>
          <button
            onClick={() => navigate(`/campagne/${slides[currentSlide].id}`)}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Voir la campagne
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-1 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="rounded-full transition-all duration-300"
              style={{
                width: index === currentSlide ? '14px' : '4px',
                height: '4px',
                background: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-3 py-5 sm:py-0">
        <FilterBar instagramIcon={instagramIcon} tiktokIcon={tiktokIcon} youtubeIcon={youtubeIcon} />
      </div>

      {!hasAnyFilter && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4 px-6">Campagnes Sponsorisées</h2>
          <div className="sm:hidden flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
            {sponsoredCampaigns.map((campaign) => (
              <div key={campaign.id} className="shrink-0 w-[72vw] max-w-xs">
                <CampaignCard data={campaign} />
              </div>
            ))}
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-6">
            {sponsoredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} data={campaign} />
            ))}
          </div>
        </div>
      )}

      {matchingEnterprises.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Entreprises</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingEnterprises.map((ent) => (
              <div
                key={ent.id}
                onClick={() => navigate(`/entreprise/${ent.id}`)}
                className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)' }}
              >
                <img
                  src={ent.logo}
                  alt={ent.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-white group-hover:text-white/90 truncate">{ent.name}</span>
                    {ent.verified && <img src={jentrepriseIcon} alt="Verified" className="w-[23px] h-[23px] shrink-0" />}
                  </div>
                  <p className="text-xs text-white/40 truncate">{ent.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-white/30 font-medium">{ent.stats.totalCampaigns} campagnes</span>
                    <span className="text-[10px] text-white/30 font-medium">{ent.stats.totalViews} vues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 mt-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-5">
          {hasAnyFilter ? 'Résultats' : 'Toutes les Campagnes'}
        </h2>

        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-white/40 text-sm font-medium">Aucune campagne trouvée</p>
            <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} data={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
