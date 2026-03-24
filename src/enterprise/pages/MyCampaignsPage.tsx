import { useState, useEffect, useRef, useMemo } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { Plus, Megaphone, Search, ChevronDown, Check, X, Bookmark } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import { useSavedCampaigns } from '@/enterprise/contexts/SavedCampaignsContext';
import { useMyCampaigns } from '@/enterprise/contexts/MyCampaignsContext';
import { useCampaignTab } from '@/enterprise/contexts/CampaignTabContext';
import { campaigns as allCampaignsData, sponsoredCampaigns } from '@/shared/data/campaignsData';
import CampaignCard from '../components/CampaignCard';
import ActiveCampaignCard from '../components/campaign-cards/ActiveCampaignCard';
import DraftCard from '../components/campaign-cards/DraftCard';
import SavedCampaignCard from '../components/campaign-cards/SavedCampaignCard';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};
const contentOptions = ['Gaming', 'Produit', 'Personal Brand', 'Technologie', 'Cosmétique', 'Beauté', 'Application', 'Autres'];
const BUDGET_MIN = 0;
const BUDGET_MAX = 10000;

const allCampaignsList = [...allCampaignsData, ...sponsoredCampaigns];

export default function MyCampaignsPage() {
  const navigate = useEnterpriseNavigate();
  const { savedIds, toggle } = useSavedCampaigns();
  const { campaigns, pausedCampaigns, drafts, loading, deleteDraft, deleteActiveCampaign } = useMyCampaigns();
  const { tab: activeTab, setTab: setActiveTab } = useCampaignTab();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [budgetMin, setBudgetMin] = useState(BUDGET_MIN);
  const [budgetMax, setBudgetMax] = useState(BUDGET_MAX);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilterLabel = (filter: string) => {
    if (filter === 'Catégories' && selectedCategory) return selectedCategory;
    if (filter === 'Contenu' && selectedContent) return selectedContent;
    if (filter === 'Budget' && (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX))
      return `${budgetMin}€ - ${budgetMax}€`;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Catégories') return !!selectedCategory;
    if (filter === 'Contenu') return !!selectedContent;
    if (filter === 'Budget') return budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX;
    return false;
  };

  const hasAnyFilter = hasActiveValue('Catégories') || hasActiveValue('Contenu') || hasActiveValue('Budget') || selectedPlatforms.size > 0 || searchQuery.trim() !== '';

  const filterCampaign = (c: { name: string; content_type?: string; categories?: string[] | null; budget: string; platforms?: string[] | null }) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q)) return false;
    }
    if (selectedCategory) {
      if (c.content_type?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }
    if (selectedContent) {
      if (!(c.categories ?? []).some((cat) => cat.toLowerCase() === selectedContent.toLowerCase())) return false;
    }
    if (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX) {
      const budgetNum = parseFloat(c.budget.replace(/[^0-9.]/g, ''));
      if (budgetNum < budgetMin || budgetNum > budgetMax) return false;
    }
    if (selectedPlatforms.size > 0) {
      const hasPlatform = (c.platforms ?? []).some((p) => selectedPlatforms.has(p));
      if (!hasPlatform) return false;
    }
    return true;
  };

  const filteredCampaigns = useMemo(() => campaigns.filter(filterCampaign), [campaigns, searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms]);

  const filteredPaused = useMemo(() => pausedCampaigns.filter(filterCampaign), [pausedCampaigns, searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms]);

  const filteredDrafts = useMemo(() => drafts.filter(filterCampaign), [drafts, searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms]);

  const savedCampaignsList = allCampaignsList.filter((c) => savedIds.includes(c.id));

  const filteredSaved = useMemo(() => {
    return savedCampaignsList.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.title.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory) {
        if (c.contentType?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
      if (selectedContent) {
        if (c.category?.toLowerCase() !== selectedContent.toLowerCase()) return false;
      }
      if (budgetMin > BUDGET_MIN || budgetMax < BUDGET_MAX) {
        const budgetNum = parseFloat(c.budget.replace(/[^0-9.]/g, ''));
        if (budgetNum < budgetMin || budgetNum > budgetMax) return false;
      }
      if (selectedPlatforms.size > 0) {
        const hasPlatform = c.socials.some((p) => selectedPlatforms.has(p));
        if (!hasPlatform) return false;
      }
      return true;
    });
  }, [savedCampaignsList, searchQuery, selectedCategory, selectedContent, budgetMin, budgetMax, selectedPlatforms]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedContent(null);
    setBudgetMin(BUDGET_MIN);
    setBudgetMax(BUDGET_MAX);
    setSelectedPlatforms(new Set());
    setOpenDropdown(null);
  };

  const hasCampaigns = campaigns.length > 0 || pausedCampaigns.length > 0 || drafts.length > 0;

  const handleDeleteDraft = async (draftId: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', draftId).eq('status', 'draft');
    if (!error) {
      deleteDraft(draftId);
    }
  };

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white">Mes campagnes</h1>
            <p className="text-sm text-white/40 mt-0.5">Ici vous allez retrouver toutes vos campagnes</p>
          </div>
          <button
            onClick={() => navigate('/creer-campagne', { state: { from: '/mes-campagnes' } })}
            className="hidden lg:flex group relative items-center justify-center py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden shrink-0"
            style={{ background: '#A15EFF' }}
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="flex items-center gap-2 font-bold text-base relative z-10 text-white">
              <Plus className="w-4 h-4" />
              Creer ma campagne
            </span>
          </button>
        </div>
        <button
          onClick={() => navigate('/creer-campagne', { state: { from: '/mes-campagnes' } })}
          className="lg:hidden group relative inline-flex items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] overflow-hidden mt-4"
          style={{ background: '#A15EFF' }}
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="flex items-center gap-2 font-bold text-sm relative z-10 text-white">
            <Plus className="w-4 h-4" />
            Creer ma campagne
          </span>
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-hide px-4 mt-6" style={{ background: '#050404' }}>
        <div className="flex items-center gap-0 min-w-max">
          {([
            { key: 'active' as const, label: 'Campagne en cours' },
            { key: 'paused' as const, label: 'En pause' },
            { key: 'saved' as const, label: 'Enregistrees' },
            { key: 'drafts' as const, label: 'Brouillons' },
          ]).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative px-4 lg:px-5 py-3.5 text-[13px] lg:text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}
              >
                {tab.label}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? '60%' : '0%',
                    background: isActive ? '#A15EFF' : 'transparent',
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {!loading && (
        <>
          <div className="sm:hidden flex items-center gap-2 px-4 pt-5">
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

          <div className="hidden sm:block px-6 mt-4" ref={dropdownRef}>
            <div className="flex flex-wrap items-center gap-3">
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
                              value={budgetMax === BUDGET_MAX ? '' : String(budgetMax)}
                              placeholder="10000"
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setBudgetMax(val === '' ? BUDGET_MAX : Math.max(Number(val), budgetMin));
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
        </>
      )}

      {!loading && !hasCampaigns ? (
        <div className="flex flex-col items-center justify-center py-32 px-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Megaphone className="w-9 h-9 text-white/20" />
          </div>
          <p className="text-white/50 text-base font-medium mb-1">Aucune campagne pour le moment</p>
          <p className="text-white/25 text-sm mb-8 text-center max-w-sm">
            Vos campagnes creees apparaitront ici. Lancez votre premiere campagne des maintenant.
          </p>
          <button
            onClick={() => navigate('/creer-campagne', { state: { from: '/mes-campagnes' } })}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Creer une campagne
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'active' && (
            <div className="px-4 sm:px-6 mt-4 sm:mt-10 pb-12">
              {filteredCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-white/40 text-sm font-medium">Aucune campagne en cours</p>
                  {hasAnyFilter && (
                    <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {filteredCampaigns.map((c) => (
                    <ActiveCampaignCard key={c.id} campaign={c} onDelete={deleteActiveCampaign} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'paused' && (
            <div className="px-4 sm:px-6 mt-4 sm:mt-10 pb-12">
              {filteredPaused.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-white/40 text-sm font-medium">Aucune campagne en pause</p>
                  {hasAnyFilter && (
                    <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {filteredPaused.map((c) => (
                    <ActiveCampaignCard key={c.id} campaign={c} onDelete={deleteActiveCampaign} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="px-4 sm:px-6 mt-4 sm:mt-10 pb-12">
              {filteredSaved.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Bookmark className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-white/40 text-sm font-medium">Aucune campagne enregistree</p>
                  {hasAnyFilter && (
                    <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredSaved.map((campaign) => (
                      <CampaignCard key={campaign.id} data={campaign} from="/enregistre" />
                    ))}
                  </div>
                  <div className="lg:hidden space-y-3">
                    {filteredSaved.map((campaign) => (
                      <SavedCampaignCard key={campaign.id} campaign={campaign} onRemove={() => toggle(campaign.id)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="px-4 sm:px-6 mt-4 sm:mt-10 pb-12">
              {filteredDrafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-white/40 text-sm font-medium">Aucun brouillon</p>
                  {hasAnyFilter && (
                    <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {filteredDrafts.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} onDelete={handleDeleteDraft} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
  );
}
