import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Eye, DollarSign, Send, CheckCircle, ScrollText, FileDown, Download, MoreVertical, Flag, ShieldBan, X, Share2, BookmarkX } from 'lucide-react';
import bookmarkIcon from '@/shared/assets/bookmark-filled.svg';
import { useSavedCampaigns } from '@/creator/contexts/SavedCampaignsContext';
import { campaigns, sponsoredCampaigns, enterprises } from '@/shared/data/campaignsData';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';
import verifiedIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import checkIcon from '@/shared/assets/check.svg';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';
import rectangleBg from '@/shared/assets/campaign-message-bg.svg';
import sentBg from '@/shared/assets/campaign-sent-panel-bg.svg';
import StatsChart from '../components/StatsChart';
import { generateChartData } from '@/shared/utils/chartUtils';
import Sidebar from '../components/Sidebar';

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

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo: string = (location.state as { from?: string })?.from ?? '/campagnes';
  const allCampaigns = [...sponsoredCampaigns, ...campaigns];
  const staticCampaign = allCampaigns.find((c) => c.id === id);
  const [campaign, setCampaign] = useState(staticCampaign ?? null);
  const [loading, setLoading] = useState(!staticCampaign);
  const [dashMetric, setDashMetric] = useState<'views' | 'earned'>('views');
  const [chartPeriod, setChartPeriod] = useState<string>('6m');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const { isSaved, toggle } = useSavedCampaigns();
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('campaign_applications')
        .select('id')
        .eq('campaign_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setApplied(true); });
    });
  }, [id]);

  useEffect(() => {
    if (staticCampaign || !id) return;
    setLoading(true);
    supabase
      .from('campaigns')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCampaign(mapSupabaseCampaign(data));
        }
        setLoading(false);
      });
  }, [id, staticCampaign]);

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

  const enterpriseId = campaign
    ? enterprises.find((e) => e.name.toLowerCase() === campaign.brand.toLowerCase())?.id
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050404' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Campagne introuvable</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour aux campagnes
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="relative h-72 lg:h-[480px] overflow-hidden">
        <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)' }} />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
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
                background: 'rgba(30, 28, 28, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <button
                onClick={() => { setShowCampaignMenu(false); setCampaignModal({ type: 'report' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
              >
                <Flag className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Signaler</span>
              </button>
              <button
                onClick={() => { setShowCampaignMenu(false); setCampaignModal({ type: 'block' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400/70" />
                <span className="text-sm text-red-400/80">Bloquer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10 pb-16">
        <div className="mb-8">
          <div className="flex lg:items-start lg:gap-4">
            <img
              src={campaign.brandLogo}
              alt={campaign.brand}
              className={`hidden lg:block w-14 h-14 rounded-2xl object-cover shrink-0 ${enterpriseId ? 'cursor-pointer hover:ring-2 hover:ring-white/20 transition-all' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
            />
            <div className="flex-1 min-w-0">
              <div className="hidden lg:flex items-center gap-2 mb-1">
                <span
                  className={`text-base font-semibold text-white ${enterpriseId ? 'cursor-pointer hover:text-white/80 transition-colors' : ''}`}
                  onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
                >
                  {campaign.brand}
                </span>
                {campaign.verified && <img src={verifiedIcon} alt="Verified" className="w-[23px] h-[23px]" />}
                <span className="text-xs text-white/30">{campaign.timeAgo}</span>
              </div>
              <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold text-white leading-tight">{campaign.title}</h1>
            </div>
          </div>

          <div className="lg:hidden mt-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={campaign.brandLogo}
                alt={campaign.brand}
                className={`w-14 h-14 rounded-2xl object-cover shrink-0 ${enterpriseId ? 'cursor-pointer hover:ring-2 hover:ring-white/20 transition-all' : ''}`}
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
              />
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-semibold text-white ${enterpriseId ? 'cursor-pointer hover:text-white/80 transition-colors' : ''}`}
                  onClick={() => enterpriseId && navigate(`/entreprise/${enterpriseId}`)}
                >
                  {campaign.brand}
                </span>
                {campaign.verified && <img src={verifiedIcon} alt="Verified" className="w-[23px] h-[23px]" />}
                <span className="text-xs text-white/30">{campaign.timeAgo}</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight mb-6">{campaign.title}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <div className="flex flex-wrap items-center gap-2">
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
              style={{ background: 'rgba(251,146,60,0.18)', border: '1px solid rgba(251,146,60,0.35)' }}
            >
              <span className="text-xs font-bold text-white">{campaign.ratePerView}</span>
              <span className="text-[10px] font-medium text-white/50">/1K</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              {campaign.socials.map((s) => (
                <span key={s} className="text-white">{socialIcons[s]()}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex sm:hidden items-center gap-2 mb-3">
            {campaign.socials.map((s) => (
              <span key={s} className="text-white">{socialIcons[s]()}</span>
            ))}
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Description</h2>
          <p className="text-[13px] text-white leading-relaxed max-w-2xl">{campaign.description}</p>
        </div>

        {campaign.isPublic && campaign.rules && campaign.rules.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-4 h-4 text-white/50" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Regles</h2>
            </div>
            <div className="space-y-2.5">
              {campaign.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #fff', color: '#fff' }}
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
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
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

        <div className="flex items-center gap-3 mb-10">
          {campaign.isPublic ? (
            <button
              onClick={() => navigate(`/campagne/${campaign.id}/verification`, { state: { from: location.pathname } })}
              className="group relative flex items-center justify-center py-2.5 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={{
                background: '#FFA672',
              }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-bold text-base relative z-10 text-white flex items-center gap-2"><img src={chCircleIcon} alt="" className="w-4 h-4" />Vérifier ma vidéo</span>
            </button>
          ) : applied ? (
            <button
              className="flex items-center justify-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-wide rounded-xl transition-all duration-500 active:scale-[0.97]"
              style={{
                background: '#A9FF9E',
                color: '#000',
                boxShadow: '0 4px 20px rgba(169,255,158,0.25)',
                border: '1px solid rgba(169,255,158,0.4)',
              }}
            >
              <img src={checkIcon} alt="" className="w-4 h-4" />
              <span>Envoye</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                if (applying) return;
                setApplying(true);
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const isRealCampaign = id && uuidRegex.test(id);
                if (isRealCampaign) {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from('campaign_applications').upsert({
                      campaign_id: id,
                      user_id: user.id,
                      status: 'pending',
                    }, { onConflict: 'campaign_id,user_id' });
                  }
                }
                setApplied(true);
                setApplying(false);
              }}
              disabled={applying}
              className="flex items-center gap-2 px-8 py-3 font-bold text-sm uppercase tracking-wide rounded-xl transition-all duration-300 hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
              style={{
                background: '#FFFFFF',
                color: '#000',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.12)',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              {applying ? 'Envoi...' : 'Postuler'}
            </button>
          )}

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

          {id && backTo === '/enregistre' ? (
            <button
              onClick={() => { toggle(id); navigate('/enregistre'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
              }}
            >
              <BookmarkX className="w-4 h-4" />
              Retirer
            </button>
          ) : (
            <button
              onClick={() => id && toggle(id)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: id && isSaved(id) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                border: id && isSaved(id) ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <img src={bookmarkIcon} alt="Enregistrer" className={`w-4 h-4 transition-opacity ${id && isSaved(id) ? 'opacity-100' : 'opacity-70'}`} />
            </button>
          )}
        </div>

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Recompenses</h2>
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
                    <span className="text-[10px] text-white/40 font-medium">/1K vues</span>
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
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Top Createurs</h2>
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
                    <p className="text-sm font-bold text-white">{creator.views}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Gagne</p>
                    <p className="text-sm font-bold" style={{ color: '#22c55e' }}>{creator.earned}</p>
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
            <div className="flex flex-wrap items-center gap-3 mb-5">
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

              <div className="h-5 w-px mx-1 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <div className="flex items-center gap-2 shrink-0">
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {dashMetric === 'views' ? 'Total vues' : 'Gagne'}
                    {activePlatform && ` · ${platformNames[activePlatform]}`}
                  </p>
                  <p className="text-lg font-black text-white leading-tight">
                    {(() => {
                      if (activePlatform) {
                        const ps = campaign.platformStats.find((s) => s.platform === activePlatform);
                        return dashMetric === 'views' ? (ps?.views ?? '0') : (ps?.earned ?? '$0');
                      }
                      return dashMetric === 'views' ? campaign.views : campaign.earned;
                    })()}
                  </p>
                </div>
                {dashMetric === 'earned' && !activePlatform && (
                  <span className="text-xs text-white/20 font-medium self-end mb-0.5">/ {campaign.budget}</span>
                )}
              </div>

              <div className="ml-auto shrink-0">
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
