import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Hourglass, Bookmark, ChevronDown, Search, X, Check, CheckCircle, Trash2, AlertTriangle, Megaphone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getPendingApplications, removeCreatorCampaign, type PendingApplication } from '@/shared/lib/useCreatorCampaigns';
import { openVerifyModal } from '@/shared/lib/verifyEvent';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import CampaignCard, { type CampaignData } from '../components/CampaignCard';
import SavedCampaignCard from '../components/campaign-cards/SavedCampaignCard';
import { useSavedCampaigns } from '@/creator/contexts/SavedCampaignsContext';
import { useCampaignTab, type CampaignTab } from '@/creator/contexts/CampaignTabContext';
import { useMyCampaigns } from '@/creator/contexts/MyCampaignsContext';
import { campaigns as staticCampaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';

const allCampaignsPool = [...staticCampaigns, ...sponsoredCampaigns];

const campaignTabs: { key: CampaignTab; label: string }[] = [
  { key: 'active', label: 'Campagne en cours' },
  { key: 'pending', label: 'En attente' },
  { key: 'completed', label: 'Terminé' },
  { key: 'saved', label: 'Enregistrées' },
];

function CampaignTabBar() {
  const { tab, setTab } = useCampaignTab();
  const displayTab = tab === 'stats' ? 'active' : tab;

  return (
    <div className="overflow-x-auto scrollbar-hide mb-6">
      <div className="flex items-center gap-0 min-w-max">
        {campaignTabs.map((t) => {
          const isActive = displayTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative px-4 lg:px-5 py-3.5 text-[13px] lg:text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}
            >
              {t.label}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                style={{
                  width: isActive ? '60%' : '0%',
                  background: isActive ? '#FFA672' : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const glassCard: React.CSSProperties = {
  background: 'rgba(10,10,15,1)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
};

export default function MyCampaignsPage() {
  const navigate = useNavigate();
  const pendingApplications = getPendingApplications();
  const { savedIds, toggle: toggleSaved } = useSavedCampaigns();
  const { tab: sharedTab } = useCampaignTab();
  const displayTab = sharedTab === 'stats' ? 'active' : sharedTab;
  const { activeCampaigns, pausedCampaigns, loading } = useMyCampaigns();
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const [dbSavedCampaigns, setDbSavedCampaigns] = useState<CampaignData[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (savedIds.length === 0) {
      setDbSavedCampaigns([]);
      return;
    }
    const fetchSaved = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*, profiles(username, display_name, avatar_url)')
        .in('id', savedIds);
      const dbMapped = (data ?? []).map(mapSupabaseCampaign);
      const staticMapped = allCampaignsPool.filter((c) => savedIds.includes(c.id));
      const allIds = new Set(dbMapped.map((c) => c.id));
      const combined = [...dbMapped, ...staticMapped.filter((c) => !allIds.has(c.id))];
      setDbSavedCampaigns(combined);
    };
    fetchSaved();
  }, [savedIds]);

  const displayedActive = [...activeCampaigns, ...pausedCampaigns];

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="mes-campagnes"
        onOpenSearch={() => {}}
      />

      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Mes campagnes</h1>
              <p className="text-sm text-white/40 mt-0.5">Le statut de toutes vos campagnes</p>
              <button
                onClick={() => openVerifyModal()}
                className="lg:hidden group relative flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden mt-5"
                style={{ background: '#FFA672' }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="font-bold text-sm relative z-10 text-white flex items-center gap-2"><img src={chCircleIcon} alt="" className="w-4 h-4" />Vérifier ma vidéo</span>
              </button>
            </div>
            <button
              onClick={() => openVerifyModal()}
              className="hidden lg:flex group relative items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden shrink-0"
              style={{ background: '#FFA672' }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-bold text-sm relative z-10 text-white flex items-center gap-2"><img src={chCircleIcon} alt="" className="w-4 h-4" />Vérifier ma vidéo</span>
            </button>
          </div>

        </div>

        <div className="px-4 sm:px-6 pt-5 lg:pt-8 space-y-0">

          <CampaignTabBar />

          <div className="pb-4 lg:hidden">
            <MobileSearchBar
              instagramIcon={instagramIcon}
              tiktokIcon={tiktokIcon}
              youtubeIcon={youtubeIcon}
            />
          </div>

          <FilterBar
            instagramIcon={instagramIcon}
            tiktokIcon={tiktokIcon}
            youtubeIcon={youtubeIcon}
          />

          <div className="space-y-10 pt-8">

          {confirmWithdrawId && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              onClick={() => setConfirmWithdrawId(null)}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
                style={{
                  background: 'rgba(14,13,13,0.98)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                  </div>
                  <h3 className="text-base font-bold text-white">Se desinscrire de cette campagne ?</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Tu ne seras plus inscrit pour cette campagne et ta candidature sera supprimee definitivement.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmWithdrawId(null)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Annuler
                  </button>
                  <button
                    disabled={withdrawing}
                    onClick={() => {
                      if (!confirmWithdrawId) return;
                      setWithdrawing(true);
                      removeCreatorCampaign(confirmWithdrawId);
                      setConfirmWithdrawId(null);
                      setWithdrawing(false);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                    style={{ background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(239,68,68,0.4)' }}
                  >
                    {withdrawing ? 'Suppression...' : 'Se desinscrire'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {displayTab === 'active' && (
          <section>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            ) : displayedActive.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Megaphone className="w-5 h-5 text-white/25" />
                </div>
                <p className="text-white/40 text-sm font-medium">Aucune campagne en cours</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayedActive.map((c) => (
                  <DbActiveCampaignCard
                    key={c.id}
                    campaign={c}
                    onNavigate={() => navigate(`/campagne/${c.id}`, { state: { from: '/mes-campagnes' } })}
                    onWithdraw={() => setConfirmWithdrawId(c.id)}
                  />
                ))}
              </div>
            )}
          </section>
          )}

          {displayTab === 'pending' && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pendingApplications.map((a) => (
                <PendingCard key={a.id} application={a} />
              ))}
            </div>
          </section>
          )}

          {displayTab === 'completed' && (
            <section>
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <CheckCircle className="w-5 h-5 text-white/25" />
                </div>
                <p className="text-white/40 text-sm font-medium">Aucune campagne terminée</p>
              </div>
            </section>
          )}

          {displayTab === 'saved' && (
          <section>
            {dbSavedCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Bookmark className="w-5 h-5 text-white/25" />
                </div>
                <p className="text-white/40 text-sm font-medium">Aucune campagne enregistrée</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {dbSavedCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} data={campaign} from="/enregistre" />
                  ))}
                </div>
                <div className="sm:hidden space-y-3">
                  {dbSavedCampaigns.map((campaign) => (
                    <SavedCampaignCard key={campaign.id} campaign={campaign} onRemove={() => toggleSaved(campaign.id)} />
                  ))}
                </div>
              </>
            )}
          </section>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}

function DbActiveCampaignCard({ campaign, onNavigate, onWithdraw }: { campaign: CampaignData; onNavigate: () => void; onWithdraw: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="w-full group rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] flex flex-col relative"
      style={glassCard}
    >
      <div className="flex lg:flex-col items-stretch">
        <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
            {campaign.socials.map((p) =>
              platformIcons[p] ? (
                <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <img src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-80" />
                </span>
              ) : null
            )}
          </div>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{campaign.brand}</p>
              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{campaign.title}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {campaign.socials.map((p) =>
              platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-50" /> : null
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                campaign.contentType === 'UGC'
                  ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' }
                  : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }
              }
            >
              {campaign.contentType}
            </span>
            <span className="text-[10px] text-white/30 ml-auto">{campaign.timeAgo}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                campaign.contentType === 'UGC'
                  ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' }
                  : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }
              }
            >
              {campaign.contentType}
            </span>
            <span className="text-[10px] text-white/30 ml-auto">{campaign.timeAgo}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.budget}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Budget</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.views}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Vues</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.ratePerView}</p>
              <p className="text-[9px] text-white/30 mt-0.5">/ 1K vues</p>
            </div>
          </div>

          <div className="mt-2 px-0.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-white">
                {campaign.earned} <span className="text-white/30 font-normal">/ {campaign.budget}</span>
              </span>
              <span className="text-[9px] font-bold text-white/50">{campaign.progress}%</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(campaign.progress, 100)}%`,
                  background: 'rgba(255,255,255,0.85)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onWithdraw(); }}
        className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer hover:scale-110"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-white/70" />
      </div>
    </button>
  );
}

function MobileSearchBar({ instagramIcon, tiktokIcon, youtubeIcon }: { instagramIcon: string; tiktokIcon: string; youtubeIcon: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  return (
    <div className="flex items-center gap-2">
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
  );
}

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
    if (filter === 'Categories' && selectedCategory) return selectedCategory;
    if (filter === 'Contenu' && selectedContent) return selectedContent;
    if (filter === 'Budget' && (budgetMin > BUDGET_MIN_FB || budgetMax < BUDGET_MAX_FB))
      return `${budgetMin}€ - ${budgetMax}€`;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Categories') return !!selectedCategory;
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
    <div ref={dropdownRef} className="hidden lg:block">
      <div className="flex flex-wrap items-center gap-3">
        {['Categories', 'Contenu', 'Budget'].map((filter) => (
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
  );
}

function PendingCard({ application }: { application: PendingApplication }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,180,50,0.22)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex lg:flex-col items-stretch">
        <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
          <img src={application.photo} alt={application.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
            {application.platforms.map((p) =>
              platformIcons[p] ? (
                <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <img src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-80" />
                </span>
              ) : null
            )}
          </div>
          <div
            className="hidden lg:flex absolute bottom-2.5 left-2.5 w-7 h-7 rounded-full items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,180,50,0.35)',
            }}
          >
            <Hourglass className="w-3.5 h-3.5" style={{ color: '#FFB432' }} />
          </div>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{application.brand}</p>
              <h3 className="text-sm font-bold text-white/80 leading-snug line-clamp-2">{application.name}</h3>
            </div>
            <div
              className="lg:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,180,50,0.25)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Hourglass className="w-4 h-4" style={{ color: '#FFB432' }} />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {application.platforms.map((p) =>
              platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-40" /> : null
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                application.category === 'UGC'
                  ? { background: 'rgba(255,0,217,0.08)', border: '1px solid rgba(255,0,217,0.15)', color: 'rgba(255,0,217,0.6)' }
                  : { background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.6)' }
              }
            >
              {application.category}
            </span>
            <span className="text-[10px] text-white/25 ml-auto">Postulé le {application.appliedAt}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                application.category === 'UGC'
                  ? { background: 'rgba(255,0,217,0.08)', border: '1px solid rgba(255,0,217,0.15)', color: 'rgba(255,0,217,0.6)' }
                  : { background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.6)' }
              }
            >
              {application.category}
            </span>
            <span className="text-[10px] text-white/25 ml-auto">Postulé le {application.appliedAt}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{application.ratePerK}</p>
              <p className="text-[9px] text-white/30 mt-0.5">par 1K vues</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{application.applicantsCount}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Candidats</p>
            </div>
          </div>

          <p className="text-[10px] font-bold" style={{ color: 'rgba(255,180,50,0.8)' }}>
            En cours d'examen par la marque
          </p>
        </div>
      </div>
    </div>
  );
}
