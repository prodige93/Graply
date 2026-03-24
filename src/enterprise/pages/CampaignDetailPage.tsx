import { useState, useRef, useEffect, useMemo } from 'react';
import { renderAmount } from '@/shared/utils/chartUtils';
import { useParams, useLocation, useNavigate as useRawNavigate } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Users, Eye, DollarSign, Send, CheckCircle, ScrollText, FileDown, Download, MoreVertical, Flag, ShieldBan, X, Lock, Pencil, Pause, Play, Trash2, Share2, Bookmark } from 'lucide-react';
import { campaigns, sponsoredCampaigns, enterprises } from '@/shared/data/campaignsData';
import { supabase } from '@/shared/infrastructure/supabase';
import { useSavedCampaigns } from '@/enterprise/contexts/SavedCampaignsContext';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import checkIcon from '@/shared/assets/check.svg';
import rectangleBg from '@/shared/assets/campaign-message-bg.svg';
import sentBg from '@/shared/assets/campaign-sent-panel-bg.svg';
import StatsChart from '../components/StatsChart';
import { generateChartData } from '@/shared/utils/chartUtils';

const platformNames: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};

const socialIcons: Record<string, (size?: string) => JSX.Element> = {
  youtube: (size = 'w-5 h-5') => (
    <svg viewBox="0 0 24 24" className={`${size} fill-current`}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  tiktok: (size = 'w-5 h-5') => (
    <img src={tiktokIcon} alt="TikTok" className={`${size} social-icon`} />
  ),
  instagram: (size = 'w-5 h-5') => (
    <img src={instagramIcon} alt="Instagram" className={`${size} social-icon`} />
  ),
};

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface SupabaseCampaign {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  budget: string;
  content_type: string;
  categories: string[];
  platforms: string[];
  platform_budgets: Record<string, { amount: string; per1000: string; min: string; max: string }>;
  status: string;
  created_at: string;
  user_id?: string | null;
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useEnterpriseNavigate();
  const rawNavigate = useRawNavigate();
  const location = useLocation();
  const { isSaved, toggle } = useSavedCampaigns();

  const goCreatorMode = () => rawNavigate(`/campagne/${id}`);
  const allCampaigns = [...sponsoredCampaigns, ...campaigns];
  const staticCampaign = allCampaigns.find((c) => c.id === id);
  const [supabaseCampaign, setSupabaseCampaign] = useState<SupabaseCampaign | null>(null);
  const [loadingSupabase, setLoadingSupabase] = useState(!staticCampaign);
  const [dashMetric, setDashMetric] = useState<'views' | 'earned'>('views');
  const [chartPeriod, setChartPeriod] = useState<string>('6m');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showCampaignMenu, setShowCampaignMenu] = useState(false);
  const [campaignModal, setCampaignModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const [campaignToast, setCampaignToast] = useState<string | null>(null);
  const campaignMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (staticCampaign || !id) return;
    const load = async () => {
      setLoadingSupabase(true);
      const [{ data: campaignData }, { data: userData }] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id).maybeSingle(),
        supabase.auth.getUser(),
      ]);
      if (campaignData && userData.user && campaignData.user_id === userData.user.id) {
        navigate(`/ma-campagne/${id}`, { state: { from: '/campagnes' }, replace: true });
        return;
      }
      setSupabaseCampaign(campaignData ?? null);
      setLoadingSupabase(false);
    };
    load();
  }, [id, staticCampaign, navigate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (campaignMenuRef.current && !campaignMenuRef.current.contains(e.target as Node)) {
        setShowCampaignMenu(false);
      }
    };
    if (showCampaignMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCampaignMenu]);

  const handleCampaignAction = (type: 'report' | 'block') => {
    setCampaignModal(null);
    setCampaignToast(type === 'report' ? 'Campagne signalée' : 'Campagne bloquée');
    setTimeout(() => setCampaignToast(null), 3000);
  };

  if (loadingSupabase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
      </div>
    );
  }

  if (supabaseCampaign && !staticCampaign) {
    return (
      <SupabaseCampaignDetail
        campaign={supabaseCampaign}
        onBack={() => navigate('/campagnes')}
        onEdit={(id) => navigate(`/modifier-campagne/${id}`, { state: { from: `/campagne/${id}` } })}
        onNavigate={navigate}
      />
    );
  }

  const campaign = staticCampaign;

  const enterpriseId = campaign
    ? enterprises.find((e) => e.name.toLowerCase() === campaign.brand.toLowerCase())?.id
    : undefined;

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Campagne introuvable</p>
        <button
          onClick={() => navigate('/campagnes')}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour aux campagnes
        </button>
      </div>
    );
  }

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-72 lg:h-[480px] overflow-hidden">
        <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover object-center" style={{ imageRendering: 'auto' }} />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
          }}
        />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/campagnes')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute top-6 right-6 z-10" ref={campaignMenuRef}>
          <button
            onClick={() => setShowCampaignMenu((p) => !p)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showCampaignMenu && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl py-1.5 z-50 overflow-hidden"
              style={{
                background: 'rgba(18, 17, 17, 0.72)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              <button
                onClick={() => { setShowCampaignMenu(false); setCampaignModal({ type: 'report' }); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.07] transition-colors"
              >
                <Flag className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Signaler</span>
              </button>
              <button
                onClick={() => { setShowCampaignMenu(false); setCampaignModal({ type: 'block' }); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.07] transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Bloquer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-4 mb-8">
          <div className="flex items-center gap-3 lg:block">
            <img
              src={campaign.brandLogo}
              alt={campaign.brand}
              className={`w-14 h-14 rounded-2xl object-cover shrink-0 ${enterpriseId ? 'cursor-pointer hover:ring-2 hover:ring-white/20 transition-all' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
            />
            <div className="flex items-center gap-2 lg:hidden">
              <span
                className={`text-base font-semibold text-white ${enterpriseId ? 'cursor-pointer hover:text-white/80 transition-colors' : ''}`}
                onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
              >
                {campaign.brand}
              </span>
              {campaign.verified && <img src={jentrepriseIcon} alt="Verified" className="w-[23px] h-[23px]" />}
              <span className="text-xs text-white/30">{campaign.timeAgo}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center gap-2 mb-1">
              <span
                className={`text-base font-semibold text-white ${enterpriseId ? 'cursor-pointer hover:text-white/80 transition-colors' : ''}`}
                onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
              >
                {campaign.brand}
              </span>
              {campaign.verified && <img src={jentrepriseIcon} alt="Verified" className="w-[23px] h-[23px]" />}
              <span className="text-xs text-white/30">{campaign.timeAgo}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{campaign.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2 lg:mb-8">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <Users className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-bold text-white">{campaign.applicants.toLocaleString()}</span>
          </div>
          {campaign.tags.map((tag) => {
            const lower = tag.toLowerCase();
            let tagStyle: React.CSSProperties;
            if (lower === 'clipping') {
              tagStyle = { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' };
            } else if (lower === 'ugc') {
              tagStyle = { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' };
            } else {
              tagStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' };
            }
            return (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold" style={tagStyle}>
                {tag}
              </span>
            );
          })}
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,120,42,0.1)', border: '1px solid rgba(255,120,42,0.25)' }}
          >
            <span className="text-xs font-bold text-white">{campaign.ratePerView}</span>
            <span className="text-[10px] font-medium text-white/40">/K</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            {campaign.socials.map((s) => (
              <span key={s} className="text-white">{socialIcons[s]()}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 lg:hidden">
          {campaign.socials.map((s) => (
            <span key={s} className="text-white">{socialIcons[s]()}</span>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Description</h2>
          <p className="text-[13px] text-white leading-relaxed max-w-2xl">{campaign.description}</p>
        </div>

        {campaign.isPublic && campaign.rules && campaign.rules.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-4 h-4 text-white/50" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Règles</h2>
            </div>
            <div className="space-y-2.5">
              {campaign.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-white leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {campaign.isPublic && campaign.documents && campaign.documents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileDown className="w-4 h-4 text-white/50" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Documents</h2>
            </div>
            <div className="space-y-2">
              {campaign.documents.map((doc) => (
                <button
                  key={doc.name}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:brightness-125 group/doc"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-semibold text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-white/30">{doc.type} - {doc.size}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
                  >
                    {doc.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {campaign.isPublic ? (
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              Vous devez passer en mode créateur
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                disabled
                className="flex items-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-wide rounded-xl opacity-40 cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Lock className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                Vérifier ma vidéo
              </button>
              <button
                onClick={goCreatorMode}
                className="relative shrink-0 flex items-center justify-center px-5 py-3 overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ background: '#FFA672', minWidth: '140px', height: '46px', borderRadius: '10px' }}
              >
                <span className="text-base font-bold text-white relative z-10 whitespace-nowrap">Mode créateur</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: campaign.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => id && toggle(id)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: id && isSaved(id) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                  border: id && isSaved(id) ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <Bookmark className="w-4 h-4 transition-colors" style={{ color: id && isSaved(id) ? '#fff' : 'rgba(255,255,255,0.7)', fill: id && isSaved(id) ? 'rgba(255,255,255,0.9)' : 'none' }} />
              </button>
            </div>
          </div>
        ) : applied ? (
          <button
            className="relative flex items-center justify-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-wide mb-10 rounded-full text-black overflow-hidden"
            style={{
              background: `url(${sentBg}) center/cover no-repeat`,
              minHeight: '44px',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <img src={checkIcon} alt="" className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Envoyé</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              Vous devez passer en mode créateur
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                disabled
                className="flex items-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-wide rounded-xl opacity-40 cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Lock className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                Postuler
              </button>
              <button
                onClick={goCreatorMode}
                className="relative shrink-0 flex items-center justify-center px-5 py-3 overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ background: '#FFA672', minWidth: '140px', height: '46px', borderRadius: '10px' }}
              >
                <span className="text-base font-bold text-white relative z-10 whitespace-nowrap">Mode créateur</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: campaign.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => id && toggle(id)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: id && isSaved(id) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                  border: id && isSaved(id) ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <Bookmark className="w-4 h-4 transition-colors" style={{ color: id && isSaved(id) ? '#fff' : 'rgba(255,255,255,0.7)', fill: id && isSaved(id) ? 'rgba(255,255,255,0.9)' : 'none' }} />
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Récompenses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaign.ratesPerPlatform.map((r) => (
              <div
                key={r.platform}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="text-white">{socialIcons[r.platform]('w-5 h-5')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider leading-none mb-1.5">
                    {platformNames[r.platform]}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{r.rate}</span>
                    <span className="text-[10px] text-white/25 font-medium">/K vues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Top Créateurs</h2>
          <div className="space-y-3">
            {campaign.topCreators.map((creator, i) => (
              <div
                key={creator.name}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="relative shrink-0">
                  <span
                    className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10"
                    style={{ backgroundColor: medalColors[i], color: '#000' }}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: `2px solid ${medalColors[i]}30` }}
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{creator.name}</p>
                  <span className="text-white/40 shrink-0">{socialIcons[creator.platform]('w-3.5 h-3.5')}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Vues</p>
                    <p className="text-sm font-bold">{renderAmount(creator.views)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Gagné</p>
                    <p className="text-sm font-bold" style={{ color: '#22c55e' }}>{renderAmount(creator.earned, '', 'rgba(34,197,94,0.5)')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <PeriodSelector periods={['7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} accentColor="orange" />

              <div className="h-5 w-px mx-1 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <div className="flex items-center gap-1 shrink-0">
                {campaign.socials.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActivePlatform(activePlatform === s ? null : s)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      background: activePlatform === s ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                      border: activePlatform === s ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{ color: activePlatform === s ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                      {socialIcons[s]('w-3.5 h-3.5')}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setActivePlatform(null)}
                  className="h-8 px-3 rounded-lg flex items-center justify-center text-[11px] font-bold uppercase tracking-wide transition-all duration-200"
                  style={{
                    background: activePlatform === null ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: activePlatform === null ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: activePlatform === null ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  Tout
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
                <div className="h-5 w-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {dashMetric === 'views' ? 'Total vues' : 'Gagné'}
                    {activePlatform && ` · ${platformNames[activePlatform]}`}
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {(() => {
                      let val: string;
                      if (activePlatform) {
                        const ps = campaign.platformStats.find((s) => s.platform === activePlatform);
                        val = dashMetric === 'views' ? (ps?.views ?? '0') : (ps?.earned ?? '$0');
                      } else {
                        val = dashMetric === 'views' ? campaign.views : campaign.earned;
                      }
                      return renderAmount(val);
                    })()}
                  </p>
                </div>
                {dashMetric === 'earned' && !activePlatform && (
                  <span className="text-xs text-white/20 font-medium self-end mb-0.5">/ {campaign.budget}</span>
                )}
              </div>
            </div>

            <div className="flex sm:hidden items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 shrink-0">
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {dashMetric === 'views' ? 'Total vues' : 'Gagné'}
                    {activePlatform && ` · ${platformNames[activePlatform]}`}
                  </p>
                  <p className="text-base font-black leading-tight">
                    {(() => {
                      let val: string;
                      if (activePlatform) {
                        const ps = campaign.platformStats.find((s) => s.platform === activePlatform);
                        val = dashMetric === 'views' ? (ps?.views ?? '0') : (ps?.earned ?? '$0');
                      } else {
                        val = dashMetric === 'views' ? campaign.views : campaign.earned;
                      }
                      return renderAmount(val);
                    })()}
                  </p>
                </div>
                {dashMetric === 'earned' && !activePlatform && (
                  <span className="text-[11px] text-white/20 font-medium self-end mb-0.5">/ {campaign.budget}</span>
                )}
              </div>

              <div
                className="relative flex rounded-full p-[2px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  className="absolute top-[2px] bottom-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: 'calc(50% - 2px)',
                    left: dashMetric === 'views' ? '2px' : 'calc(50%)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  }}
                />
                <button
                  onClick={() => setDashMetric('views')}
                  className="relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all duration-300"
                  style={{ color: dashMetric === 'views' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <Eye className="w-3 h-3" />
                  Vues
                </button>
                <button
                  onClick={() => setDashMetric('earned')}
                  className="relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all duration-300"
                  style={{ color: dashMetric === 'earned' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <DollarSign className="w-3 h-3" />
                  Gains
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-end gap-3 mb-5">
              <div
                className="relative flex rounded-full p-[3px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: 'calc(50% - 3px)',
                    left: dashMetric === 'views' ? '3px' : 'calc(50%)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                />
                <button
                  onClick={() => setDashMetric('views')}
                  className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300"
                  style={{ color: dashMetric === 'views' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vues
                </button>
                <button
                  onClick={() => setDashMetric('earned')}
                  className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300"
                  style={{ color: dashMetric === 'earned' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Gains
                </button>
              </div>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="px-2 py-3">
                <StatsChart
                  data={generateChartData(campaign.chartData, chartPeriod)}
                  metric={dashMetric}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {campaignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: 'rgba(30, 28, 28, 0.75)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => setCampaignModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: campaignModal.type === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${campaignModal.type === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}
            >
              {campaignModal.type === 'block'
                ? <ShieldBan className="w-5 h-5 text-red-400" />
                : <Flag className="w-5 h-5 text-amber-400" />
              }
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {campaignModal.type === 'report' ? 'Signaler cette campagne' : 'Bloquer cette campagne'}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {campaignModal.type === 'report'
                ? `La campagne "${campaign.title}" sera signalée à notre équipe de modération pour examen.`
                : `La campagne "${campaign.title}" sera bloquée et ne sera plus visible dans vos recherches.`
              }
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCampaignModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleCampaignAction(campaignModal.type)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: campaignModal.type === 'block' ? '#dc2626' : '#d97706',
                }}
              >
                {campaignModal.type === 'report' ? 'Signaler' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-6 left-1/2 z-[110] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          background: 'rgba(30,30,30,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          opacity: campaignToast ? 1 : 0,
          transform: campaignToast ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
          pointerEvents: campaignToast ? 'auto' : 'none',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
        </div>
        <p className="text-sm font-semibold text-white">{campaignToast}</p>
      </div>
    </div>
  );
}

function SupabaseCampaignDetail({
  campaign: c,
  onBack,
  onEdit,
  onNavigate,
}: {
  campaign: SupabaseCampaign;
  onBack: () => void;
  onEdit: (id: string) => void;
  onNavigate: (path: string) => void;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(c.status === 'paused');
  const [pauseLoading, setPauseLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dashMetric, setDashMetric] = useState<'views' | 'earned'>('views');
  const [chartPeriod, setChartPeriod] = useState('6m');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const isOwner = currentUserId && c.user_id === currentUserId;

  const platformBudgets = c.platform_budgets ?? {};
  const ratesPerPlatform = c.platforms.map((p) => ({
    platform: p,
    rate: platformBudgets[p]?.per1000 ? `${platformBudgets[p].per1000}€` : '—',
    amount: platformBudgets[p]?.amount ?? '0',
  }));

  const totalBudget = parseFloat(c.budget?.replace(/[^0-9.]/g, '') ?? '0') || 0;

  const chartData = useMemo(() => {
    const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const generatePoints = (count: number) =>
      Array.from({ length: count }, (_, i) => {
        const progress = count > 1 ? i / (count - 1) : 0;
        const base = progress * 0.3;
        const noise = Math.sin(i * 2.1) * 0.05 + Math.cos(i * 1.3) * 0.03;
        return { views: Math.round(Math.max(0, base + noise) * totalBudget * 50), earned: Math.round(Math.max(0, base + noise) * totalBudget * 0.8) };
      });
    if (chartPeriod === '7j') {
      return generatePoints(7).map((p, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i));
        return { label: i === 6 ? 'Auj.' : DAY_NAMES[d.getDay()] + ' ' + d.getDate(), ...p };
      });
    }
    if (chartPeriod === '1m') {
      return generatePoints(4).map((p, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (3 - i) * 7);
        return { label: i === 3 ? 'Auj.' : d.getDate() + ' ' + MONTH_NAMES[d.getMonth()], ...p };
      });
    }
    if (chartPeriod === '3m') {
      return generatePoints(3).map((p, i) => {
        const d = new Date(now); d.setMonth(d.getMonth() - (2 - i));
        return { label: MONTH_NAMES[d.getMonth()], ...p };
      });
    }
    return generatePoints(6).map((p, i) => {
      const d = new Date(now); d.setMonth(d.getMonth() - (5 - i));
      return { label: MONTH_NAMES[d.getMonth()], ...p };
    });
  }, [totalBudget, chartPeriod]);

  const filteredData = activePlatform
    ? chartData.map((d) => ({ ...d, views: Math.round(d.views / (c.platforms.length || 1)), earned: Math.round(d.earned / (c.platforms.length || 1)) }))
    : chartData;

  const totalViews = filteredData.reduce((s, d) => s + d.views, 0);
  const totalEarned = filteredData.reduce((s, d) => s + d.earned, 0);

  const formatTotal = (val: number, metric: 'views' | 'earned') => {
    if (metric === 'earned') return val >= 1000 ? `${(val / 1000).toFixed(1)}K€` : `${val}€`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  const handleTogglePause = async () => {
    if (pauseLoading) return;
    setPauseLoading(true);
    const newStatus = isPaused ? 'published' : 'paused';
    const { error } = await supabase.from('campaigns').update({ status: newStatus }).eq('id', c.id);
    if (!error) setIsPaused(!isPaused);
    setPauseLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from('campaigns').delete().eq('id', c.id);
    if (!error) onNavigate('/mes-campagnes');
    setDeleting(false);
  };

  const statusColor = isPaused ? '#f59e0b' : c.status === 'draft' ? 'rgba(255,255,255,0.3)' : '#22c55e';
  const statusLabel = isPaused ? 'En pause' : c.status === 'draft' ? 'Brouillon' : 'Active';

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-64 lg:h-[380px] overflow-hidden">
        {c.photo_url ? (
          <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(255,120,42,0.08) 0%, rgba(255,255,255,0.02) 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(5,4,4,0.5) 68%, rgba(5,4,4,0.92) 85%, rgba(5,4,4,1) 100%)' }} />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        {isOwner && (
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={() => onEdit(c.id)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <Pencil className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10 -mt-10 relative z-10 pb-20">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}40`, color: statusColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
              {statusLabel}
            </span>
            {c.content_type && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={
                  c.content_type.toLowerCase() === 'ugc'
                    ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' }
                    : { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' }
                }
              >
                {c.content_type}
              </span>
            )}
            {(c.categories ?? []).map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{c.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold" style={{ color: '#FFA672' }}>Budget total : {c.budget}€</span>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              {c.platforms.map((p) => (
                <span key={p} className="text-white/60">{socialIcons[p]?.('w-4 h-4')}</span>
              ))}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <button
              onClick={() => onEdit(c.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </button>
            <button
              onClick={handleTogglePause}
              disabled={pauseLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
              style={{ background: isPaused ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isPaused ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}` }}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" style={{ color: '#22c55e' }} /> : <Pause className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />}
              <span style={{ color: isPaused ? '#22c55e' : '#f59e0b' }}>{isPaused ? 'Reprendre' : 'Mettre en pause'}</span>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Budget total', value: `${c.budget}€`, icon: <DollarSign className="w-4 h-4" />, color: '#FFA672' },
            { label: 'Plateformes', value: c.platforms.length.toString(), icon: <Users className="w-4 h-4" />, color: '#60a5fa' },
            { label: 'Vues estimées', value: formatTotal(totalViews, 'views'), icon: <Eye className="w-4 h-4" />, color: '#a78bfa' },
            { label: 'Gains estimés', value: formatTotal(totalEarned, 'earned'), icon: <DollarSign className="w-4 h-4" />, color: '#22c55e' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {c.description && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Description</h2>
            <p className="text-[13px] text-white/80 leading-relaxed max-w-2xl">{c.description}</p>
          </div>
        )}

        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Récompenses par plateforme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ratesPerPlatform.map((r) => (
              <div key={r.platform} className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-white">{socialIcons[r.platform]?.('w-5 h-5') ?? <span className="text-xs text-white/40">{r.platform}</span>}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider leading-none mb-1.5">{platformNames[r.platform] ?? r.platform}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{r.rate}</span>
                    <span className="text-[10px] text-white/25 font-medium">/K vues</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Budget</p>
                  <p className="text-sm font-bold text-white">{r.amount}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <PeriodSelector periods={['7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} accentColor="orange" />
              <div className="h-5 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex items-center gap-1 shrink-0">
                {c.platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(activePlatform === p ? null : p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      background: activePlatform === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                      border: activePlatform === p ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{ color: activePlatform === p ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                      {socialIcons[p]?.('w-3.5 h-3.5')}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setActivePlatform(null)}
                  className="h-8 px-3 rounded-lg flex items-center text-[11px] font-bold uppercase tracking-wide transition-all duration-200"
                  style={{
                    background: activePlatform === null ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: activePlatform === null ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: activePlatform === null ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  Tout
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-3 ml-auto">
                <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {dashMetric === 'views' ? 'Vues estimées' : 'Gains estimés'}
                    {activePlatform && ` · ${platformNames[activePlatform]}`}
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {formatTotal(dashMetric === 'views' ? totalViews : totalEarned, dashMetric)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end mb-4">
              <div
                className="relative flex rounded-full p-[3px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: 'calc(50% - 3px)',
                    left: dashMetric === 'views' ? '3px' : 'calc(50%)',
                    background: 'linear-gradient(135deg, rgba(255,120,42,0.7), rgba(255,154,92,0.5))',
                    border: '1px solid rgba(255,120,42,0.5)',
                    boxShadow: '0 2px 12px rgba(255,120,42,0.3)',
                  }}
                />
                <button
                  onClick={() => setDashMetric('views')}
                  className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-300"
                  style={{ color: dashMetric === 'views' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vues
                </button>
                <button
                  onClick={() => setDashMetric('earned')}
                  className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-300"
                  style={{ color: dashMetric === 'earned' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Gains
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="px-2 py-3">
                <StatsChart data={filteredData} metric={dashMetric} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: 'rgba(30, 28, 28, 0.85)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            <button
              onClick={() => setConfirmDelete(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Supprimer cette campagne</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">Cette action est irréversible. La campagne sera définitivement supprimée.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/[0.06] transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#dc2626' }}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodSelector({ periods, value, onChange, accentColor = 'violet' }: { periods: string[]; value: string; onChange: (p: string) => void; accentColor?: 'violet' | 'orange' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = periods.indexOf(value);
    const btn = btnRefs.current[idx];
    const container = containerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setSliderStyle({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [value, periods]);

  const isViolet = accentColor === 'violet';
  const sliderBg = isViolet
    ? 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(139,92,246,0.5))'
    : 'linear-gradient(135deg, rgba(255,120,42,0.7), rgba(255,154,92,0.5))';
  const sliderBorder = isViolet ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,120,42,0.5)';
  const sliderShadow = isViolet ? '0 2px 12px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' : '0 2px 12px rgba(255,120,42,0.3), inset 0 1px 0 rgba(255,255,255,0.15)';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center rounded-full p-[3px] shrink-0"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.15)',
      }}
    >
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        style={{ left: sliderStyle.left, width: sliderStyle.width, background: sliderBg, backdropFilter: 'blur(12px)', border: sliderBorder, boxShadow: sliderShadow }}
      />
      {periods.map((p, i) => (
        <button
          key={p}
          ref={(el) => { btnRefs.current[i] = el; }}
          onClick={() => onChange(p)}
          className="relative z-10 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors duration-300"
          style={{ color: value === p ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
