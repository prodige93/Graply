import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Users, Eye, DollarSign, Calendar, Pause, Play, Trash2, CreditCard as Edit3, TrendingUp } from 'lucide-react';
import GrapeLoader from '../components/GrapeLoader';
import { supabase } from '@/shared/infrastructure/supabase';
import StatsChart from '../components/StatsChart';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import usersIcon from '@/shared/assets/users.svg';
import Sidebar from '../components/Sidebar';
import VerifyVideoModal from '../components/VerifyVideoModal';

interface Campaign {
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
}

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const platformNames: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

export default function MyCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashMetric, setDashMetric] = useState<'views' | 'earned'>('views');
  const [chartPeriod, setChartPeriod] = useState<string>('6m');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const handleDeleteCampaign = async () => {
    if (!id) return;
    setDeleting(true);
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) {
      navigate('/mes-campagnes');
    }
    setDeleting(false);
  };

  const handleTogglePause = async () => {
    if (!id || pauseLoading) return;
    setPauseLoading(true);
    const newStatus = isPaused ? 'published' : 'paused';
    const { error } = await supabase.from('campaigns').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setIsPaused(!isPaused);
      if (campaign) setCampaign({ ...campaign, status: newStatus });
    }
    setPauseLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        setCampaign(data);
        setIsPaused(data.status === 'paused');
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [id]);

  const totalBudget = campaign ? (parseFloat(campaign.budget.replace(/[^0-9.]/g, '')) || 0) : 0;

  const chartData = useMemo(() => {
    if (!campaign) return [];
    const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const generatePoints = (count: number) =>
      Array.from({ length: count }, (_, i) => {
        const progress = count > 1 ? i / (count - 1) : 0;
        const base = progress * 0.3;
        const noise = Math.sin(i * 2.1) * 0.05 + Math.cos(i * 1.3) * 0.03;
        const factor = Math.max(0, base + noise);
        return {
          views: Math.round(factor * totalBudget * 50),
          earned: Math.round(factor * totalBudget * 0.8),
        };
      });

    if (chartPeriod === '7j') {
      const pts = generatePoints(7);
      return pts.map((p, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return { label: i === 6 ? 'Auj.' : DAY_NAMES[d.getDay()] + ' ' + d.getDate(), views: p.views, earned: p.earned };
      });
    }
    if (chartPeriod === '1m') {
      const pts = generatePoints(4);
      return pts.map((p, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (3 - i) * 7);
        return { label: i === 3 ? 'Auj.' : d.getDate() + ' ' + MONTH_NAMES[d.getMonth()], views: p.views, earned: p.earned };
      });
    }
    if (chartPeriod === '3m') {
      const pts = generatePoints(3);
      return pts.map((p, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (2 - i));
        return { label: i === 2 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], views: p.views, earned: p.earned };
      });
    }
    const pts = generatePoints(6);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      return { label: i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], views: p.views, earned: p.earned };
    });
  }, [campaign, totalBudget, chartPeriod]);

  const totalViews = chartData.reduce((s, d) => s + d.views, 0);
  const totalEarned = chartData.reduce((s, d) => s + d.earned, 0);
  const formatTotal = (val: number, metric: 'views' | 'earned') => {
    if (metric === 'earned') return val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val}`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  if (loading) {
    return (
      <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
        <Sidebar activePage="home" onOpenSearch={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <GrapeLoader />
        </div>
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
          Retour
        </button>
      </div>
    );
  }

  const platformEntries = campaign.platform_budgets
    ? Object.entries(campaign.platform_budgets)
    : [];

  return (
    <>
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      {isPaused && (
        <div
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Pause className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-semibold text-white">
              Campagne en pause — les createurs ne peuvent plus postuler
            </p>
          </div>
          <button
            onClick={handleTogglePause}
            disabled={pauseLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:brightness-110 shrink-0 disabled:opacity-60"
            style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}
          >
            <Play className="w-3 h-3" />
            Reprendre
          </button>
        </div>
      )}
      <div className="relative h-72 lg:h-80 overflow-hidden">
        {campaign.photo_url ? (
          <img src={campaign.photo_url} alt={campaign.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <Megaphone className="w-16 h-16 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1C1C] via-black/50 to-black/20" />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                style={isPaused
                  ? { backgroundColor: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }
                  : { backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }
                }
              >
                {isPaused ? 'En pause' : 'Active'}
              </span>
              <span className="text-xs text-white/30">
                {new Date(campaign.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight mt-2">{campaign.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 sm:mt-2">
            <button
              onClick={() => navigate(`/modifier-campagne/${campaign.id}`, { state: { from: `/ma-campagne/${campaign.id}` } })}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,1)', color: 'rgba(255,255,255,1)' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier
            </button>
            {!isPaused ? (
              <button
                onClick={handleTogglePause}
                disabled={pauseLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 disabled:opacity-60"
                style={{ border: '1px solid rgba(255,255,255,1)', color: 'rgba(255,255,255,1)' }}
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleTogglePause}
                disabled={pauseLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 disabled:opacity-60"
                style={{ border: '1px solid rgba(34,197,94,0.6)', color: 'rgba(34,197,94,1)', background: 'rgba(34,197,94,0.08)' }}
              >
                <Play className="w-3.5 h-3.5" />
                Reprendre
              </button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-red-500/10"
              style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {campaign.content_type && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={
                campaign.content_type.toLowerCase() === 'ugc'
                  ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' }
                  : { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' }
              }
            >
              {campaign.content_type}
            </span>
          )}
          {campaign.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
            >
              {cat}
            </span>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            {campaign.platforms.map((p) =>
              platformIcons[p] ? (
                <img key={p} src={platformIcons[p]} alt={p} className="w-5 h-5 social-icon" />
              ) : null
            )}
          </div>
        </div>

        {campaign.description && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Description</h2>
            <p className="text-[13px] text-white leading-relaxed max-w-2xl">{campaign.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="Budget total" value={totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : campaign.budget} />
          <StatCard icon={<Eye className="w-5 h-5" />} label="Vues totales" value="0" />
          <StatCard icon={<Users className="w-5 h-5" />} label="Créateurs" value="0" />
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Jours actifs" value={String(Math.max(1, Math.ceil((Date.now() - new Date(campaign.created_at).getTime()) / 86400000)))} />
        </div>

        <div
          className="flex items-center justify-between rounded-2xl px-6 py-5 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            >
              <img src={usersIcon} alt="Verification" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Verification video createur</p>
              <p className="text-xs text-white/35 mt-0.5">Videos en attente de verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-lg font-bold text-white">0</span>
            </div>
            <button
              onClick={() => setVerifyOpen(true)}
              className="h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
            >
              Verifier
            </button>
          </div>
        </div>

        {platformEntries.length > 0 && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Recompenses par plateforme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {platformEntries.map(([platform, data]) => (
                <div
                  key={platform}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {platformIcons[platform] ? (
                      <img src={platformIcons[platform]} alt={platform} className="w-5 h-5 social-icon" />
                    ) : (
                      <span className="text-white/40 text-xs font-bold">{platform[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider leading-none mb-1.5">
                      {platformNames[platform] || platform}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-white">
                        ${data.per1000}
                      </span>
                      <span className="text-[10px] text-white/40 font-medium">/1K vues</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Budget</p>
                    <p className="text-sm font-bold text-white">${data.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Progression</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">$0.00 depense</span>
            <span className="text-sm font-semibold text-white/40">
              {totalBudget > 0 ? `$${totalBudget.toLocaleString()} budget` : campaign.budget}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: '0%', background: 'linear-gradient(90deg, #FF782A, #FF9A5C)' }} />
          </div>
          <p className="text-xs text-white/25 mt-2">0% du budget utilise</p>
        </div>

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Createurs</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-sm text-white/30 font-medium">Aucun createur pour le moment</p>
            <p className="text-xs text-white/15 mt-1">Les createurs qui postulent apparaitront ici</p>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="p-5 pb-2">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Performance</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <PeriodSelector periods={['7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} accentColor="violet" />

              {campaign.platforms.length > 1 && (
                <>
                  <div className="h-5 w-px mx-1 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />

                  <div className="flex items-center gap-1 shrink-0">
                    {campaign.platforms.map((s) =>
                      platformIcons[s] ? (
                        <button
                          key={s}
                          onClick={() => setActivePlatform(activePlatform === s ? null : s)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{
                            background: activePlatform === s ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                            border: activePlatform === s ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <img
                            src={platformIcons[s]}
                            alt={s}
                            className="w-3.5 h-3.5 social-icon"
                            style={{ opacity: activePlatform === s ? 1 : 0.35 }}
                          />
                        </button>
                      ) : null
                    )}
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
                </>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {dashMetric === 'views' ? 'Total vues' : 'Total depense'}
                    {activePlatform && ` \u00B7 ${platformNames[activePlatform]}`}
                  </p>
                  <p className="text-lg font-black text-white leading-tight">
                    {formatTotal(dashMetric === 'views' ? totalViews : totalEarned, dashMetric)}
                  </p>
                </div>
                {dashMetric === 'earned' && !activePlatform && (
                  <span className="text-xs text-white/20 font-medium self-end mb-0.5">/ {totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : campaign.budget}</span>
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
                    Depenses
                  </button>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="px-2 py-3">
                <StatsChart data={chartData} metric={dashMetric} color="#7C3AED" />
              </div>
            </div>

            {campaign.platforms.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-2">
                {campaign.platforms.map((p) => {
                  const budget = campaign.platform_budgets?.[p];
                  return (
                    <div
                      key={p}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {platformIcons[p] && <img src={platformIcons[p]} alt={p} className="w-4 h-4 shrink-0 social-icon" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium leading-none mb-0.5">{platformNames[p]}</p>
                        <p className="text-sm font-bold text-white">0 vues</p>
                      </div>
                      {budget && (
                        <span className="text-[10px] text-white/20 font-medium shrink-0">${budget.amount}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: '#141212',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white">Supprimer cette campagne ?</h3>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Cette action est irréversible. La campagne <span className="font-semibold text-white/70">"{campaign?.name}"</span> sera définitivement supprimée.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96] disabled:opacity-50"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {deleting ? <GrapeLoader size="sm" /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>

    {verifyOpen && <VerifyVideoModal onClose={() => setVerifyOpen(false)} />}
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <span className="text-white">{icon}</span>
        </div>
        <span className="text-[11px] text-white font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function PeriodSelector({ periods, value, onChange, accentColor = 'orange' }: { periods: string[]; value: string; onChange: (p: string) => void; accentColor?: 'violet' | 'orange' }) {
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
