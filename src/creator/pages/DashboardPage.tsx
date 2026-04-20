import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DollarSign, TrendingUp, ArrowUpRight, Play, X, ArrowDownLeft, ExternalLink, Loader2, CalendarDays } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import Sidebar from '../components/Sidebar';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok-color.svg';

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

const allPlatforms = ['instagram', 'tiktok', 'youtube'];

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function inDateRange(t: number, start: Date, end: Date): boolean {
  return t >= start.getTime() && t <= end.getTime();
}

/** Graphique : nombre de vidéos synchronisées par période (Instagram + TikTok + YouTube) */
function buildActivityChartPoints(
  period: string,
  videos: { publishedAt: string }[],
): { label: string; views: number; earned: number }[] {
  const now = new Date();
  const countIn = (start: Date, end: Date) =>
    videos.filter((v) => inDateRange(new Date(v.publishedAt).getTime(), start, end)).length;

  if (period === 'all' || period === '6m') {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()];
      return { label, views: countIn(start, end), earned: 0 };
    });
  }

  if (period === '7j') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      const label = i === 6 ? 'Auj.' : DAY_NAMES[d.getDay()] + ' ' + d.getDate();
      return { label, views: countIn(start, end), earned: 0 };
    });
  }

  if (period === '1m') {
    return Array.from({ length: 4 }, (_, i) => {
      const end = new Date(now);
      end.setDate(end.getDate() - (3 - i) * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const label = i === 3 ? 'Auj.' : `${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
      return { label, views: countIn(start, end), earned: 0 };
    });
  }

  if (period === '3m') {
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = i === 2 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()];
      return { label, views: countIn(start, end), earned: 0 };
    });
  }

  return [];
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

interface DashboardVideo {
  id: string;
  title: string;
  platform: string;
  date: string;
  thumb: string;
  permalink: string;
  publishedAt: string;
  viewCount?: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chartPeriod, setChartPeriod] = useState('6m');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);

  const loadDashboardProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ count }, profileRes] = await Promise.all([
      supabase
        .from('campaign_applications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'accepted'),
      supabase
        .from('profiles')
        .select('creator_wallet_balance, clip_views_total, last_creator_withdrawal_at, updated_at')
        .eq('id', user.id)
        .maybeSingle(),
    ]);
    setActiveCampaignsCount(count ?? 0);
    const p = profileRes.data;
    if (p) {
      const bal = Number(p.creator_wallet_balance);
      setWithdrawBalance(Number.isFinite(bal) ? bal : 0);
      setClipViewsTotal(Number(p.clip_views_total) || 0);
      setLastWithdrawalAt(p.last_creator_withdrawal_at ?? null);
      setProfileUpdatedAt(p.updated_at ?? new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadDashboardProfile();
    })();
    return () => { cancelled = true; };
  }, [loadDashboardProfile]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const channel = supabase
        .channel(`profiles-dashboard-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          () => {
            void loadDashboardProfile();
          },
        )
        .subscribe();
      unsub = () => {
        void supabase.removeChannel(channel);
      };
      poll = setInterval(() => {
        void loadDashboardProfile();
      }, 45_000);
    })();
    return () => {
      unsub?.();
      if (poll) clearInterval(poll);
    };
  }, [loadDashboardProfile]);

  const {
    videos: linkedVideos,
    loading: linkedLoading,
    error: linkedError,
    instagramNotConnected: igNotConnected,
    countsByPlatform,
    refetch: refetchLinkedVideos,
  } = useLinkedPlatformVideos();
  const { loading: socialLoading, refetch: refetchSocialConnections, isConnected: isSocialConnected, displayUsername } = useSocialConnections();

  useEffect(() => {
    if (!location.state?.fromSocialOAuth) return;
    void Promise.all([
      refetchSocialConnections(),
      refetchLinkedVideos(),
      loadDashboardProfile(),
    ]);
    navigate(location.pathname, { replace: true, state: {} });
  }, [
    location.pathname,
    location.state?.fromSocialOAuth,
    navigate,
    refetchSocialConnections,
    refetchLinkedVideos,
    loadDashboardProfile,
  ]);

  const [disconnectingSocial, setDisconnectingSocial] = useState<SocialPlatform | null>(null);
  const [chartMetric, setChartMetric] = useState<'views' | 'earned'>('views');
  const [metricsSort, setMetricsSort] = useState<'desc' | 'asc'>('desc');
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);
  const [withdrawBalance, setWithdrawBalance] = useState(0);
  const [clipViewsTotal, setClipViewsTotal] = useState(0);
  const [lastWithdrawalAt, setLastWithdrawalAt] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [tablePlatform, setTablePlatform] = useState<string | null>(null);
  const [tableSort, setTableSort] = useState<{ key: 'date'; dir: 'desc' | 'asc' } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  async function handleWithdraw() {
    if (withdrawBalance <= 0 || withdrawLoading) return;
    if (clipViewsTotal < MIN_CLIP_VIEWS_FOR_PAYOUT) {
      alert(
        `Les versements ne sont possibles qu’à partir de ${MIN_CLIP_VIEWS_FOR_PAYOUT.toLocaleString('fr-FR')} vues cumulées sur les vidéos Graply (vues suivies : ${clipViewsTotal.toLocaleString('fr-FR')}).`,
      );
      return;
    }
    if (!canWithdrawThisWeek(lastWithdrawalAt)) {
      const next = nextWithdrawalAvailableAt(lastWithdrawalAt);
      const label = next
        ? next.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
        : '';
      alert(`Un seul retrait par semaine. Prochaine fenêtre : ${label || 'bientôt'}.`);
      return;
    }
    setWithdrawLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWithdrawLoading(false);
      return;
    }
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('profiles')
      .update({
        creator_wallet_balance: 0,
        last_creator_withdrawal_at: now,
        updated_at: now,
      })
      .eq('id', user.id);
    setWithdrawLoading(false);
    if (error) {
      alert(`Retrait impossible : ${error.message}`);
      return;
    }
    setWithdrawBalance(0);
    setLastWithdrawalAt(now);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
  }

  const payoutEligible = clipViewsTotal >= MIN_CLIP_VIEWS_FOR_PAYOUT;
  const weeklyOk = canWithdrawThisWeek(lastWithdrawalAt);
  const withdrawDisabled =
    withdrawBalance <= 0 || withdrawLoading || !payoutEligible || !weeklyOk;

  function handleConnectSocial(platform: SocialPlatform) {
    try {
      window.location.href = getSocialOAuthUrl(platform);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connexion impossible';
      alert(`${msg}\nTu peux aussi vérifier les paramètres de l’application.`);
    }
  }

  async function handleDisconnectSocial(platform: SocialPlatform) {
    setDisconnectingSocial(platform);
    const { error } = await supabase.rpc('disconnect_social', { p_platform: platform });
    setDisconnectingSocial(null);
    if (error) {
      alert(error.message);
      return;
    }
    await refetchSocialConnections();
    await refetchLinkedVideos();
    await loadDashboardProfile();
  }

  const connectedSocialCount = allPlatforms.filter((p) => isSocialConnected(p as DashboardSocialPlatform)).length;

  const dashboardVideos: DashboardVideo[] = useMemo(() => {
    return linkedVideos.map((v) => ({
      id: `${v.platform}-${v.id}`,
      title: v.title,
      platform: v.platform,
      date: v.date,
      thumb: v.thumb,
      permalink: v.permalink,
      publishedAt: v.publishedAt,
      viewCount: v.viewCount,
    }));
  }, [linkedVideos]);

  const chartData = useMemo(() => {
    return buildActivityChartPoints(chartPeriod, linkedVideos);
  }, [chartPeriod, linkedVideos]);

  const totalPeriodVideoCount = chartData.reduce((s, d) => s + d.views, 0);
  const totalPeriodEarned = chartData.reduce((s, d) => s + d.earned, 0);
  const totalSyncedVideos = linkedVideos.length;

  const filteredVideos = useMemo(() => {
    let vids = tablePlatform ? dashboardVideos.filter((v) => v.platform === tablePlatform) : dashboardVideos;
    if (tableSort?.key === 'date') {
      vids = [...vids].sort((a, b) => {
        const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        return tableSort.dir === 'desc' ? diff : -diff;
      });
    }
    return vids;
  }, [tablePlatform, tableSort, dashboardVideos]);

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="dashboard"
        onOpenSearch={() => {}}
      />

      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
              <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Mon dashboard</h1>
              <p className="text-sm text-white/40 mt-0.5">Vos performances en tant que créateur</p>
              <p className="text-[11px] text-white/28 mt-1 max-w-xl">
                Quasi temps réel : le solde et les vues se mettent à jour quand ton profil change (écoute en direct + rafraîchissement toutes les 45&nbsp;s).
                {profileUpdatedAt && (
                  <span className="text-white/35">
                    {' '}
                    Dernière synchro affichée :{' '}
                    {new Date(profileUpdatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {allPlatforms.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setFilterPlatform(null)}
                  className="h-10 px-5 rounded-full flex items-center gap-2 transition-all duration-200 text-sm font-semibold shrink-0"
                  style={{
                    background: !filterPlatform ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: !filterPlatform ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.15)',
                    color: !filterPlatform ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Global
                </button>
                <div className="h-6 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{
                      background: filterPlatform === p
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(255,255,255,0.04)',
                      border: filterPlatform === p
                        ? '1px solid rgba(255,255,255,0.35)'
                        : '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      opacity: filterPlatform && filterPlatform !== p ? 0.4 : 1,
                      boxShadow: filterPlatform === p
                        ? '0 0 18px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-5 h-5" />}
                  </button>
                ))}
              </div>
              <PeriodSelector periods={['all', '7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} />
            </div>
          )}

          <div className="flex items-center justify-end">
            <PeriodSelector periods={['all', '7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} />
          </div>

          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-5 text-center"
            style={glassCard}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Solde disponible
              </p>
              <p className="text-5xl font-black tracking-tight" style={{ color: withdrawBalance > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                ${withdrawBalance.toFixed(2)}
              </p>
              <p className="text-[11px] mt-2 max-w-md mx-auto space-y-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                <span className="block">
                  Vues Graply suivies :{' '}
                  <strong className="text-white/70">{clipViewsTotal.toLocaleString('fr-FR')}</strong>
                  {' '}/ seuil {MIN_CLIP_VIEWS_FOR_PAYOUT.toLocaleString('fr-FR')} pour être payé
                </span>
                {!weeklyOk && lastWithdrawalAt && (
                  <span className="block text-amber-200/80">
                    Retrait suivant après le{' '}
                    {nextWithdrawalAvailableAt(lastWithdrawalAt)?.toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                )}
              </p>
            </div>

            {withdrawSuccess ? (
              <div
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Retrait envoyé avec succès
              </div>
            ) : (
              <button
                onClick={() => void handleWithdraw()}
                disabled={withdrawDisabled}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{
                  background: !withdrawDisabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: !withdrawDisabled ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  color: !withdrawDisabled ? '#fff' : 'rgba(255,255,255,0.2)',
                  boxShadow: !withdrawDisabled ? '0 2px 24px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
                  transform: withdrawLoading ? 'scale(0.97)' : 'scale(1)',
                  cursor: withdrawDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <DollarSign className="w-4 h-4" />
                {withdrawLoading
                  ? 'Traitement...'
                  : withdrawBalance <= 0
                    ? 'Aucun solde à retirer'
                    : !payoutEligible
                      ? `Seuil de vues requis (${MIN_CLIP_VIEWS_FOR_PAYOUT.toLocaleString('fr-FR')})`
                      : !weeklyOk
                        ? 'Retrait disponible la semaine prochaine'
                        : 'Retirer mes gains'}
              </button>
            )}
          </div>

          {(() => {
            const allMetrics = [
              { key: 'earned', numericValue: withdrawBalance, icon: <DollarSign className="w-5 h-5" />, label: 'Solde disponible', value: `$${withdrawBalance.toFixed(2)}`, change: '', positive: withdrawBalance > 0 },
              { key: 'period', numericValue: totalPeriodVideoCount, icon: <CalendarDays className="w-5 h-5" />, label: 'Vidéos (période)', value: String(totalPeriodVideoCount), change: '', positive: totalPeriodVideoCount > 0 },
              { key: 'videos', numericValue: totalSyncedVideos, icon: <Play className="w-5 h-5" />, label: 'Vidéos synchronisées', value: String(totalSyncedVideos), change: `${countsByPlatform.instagram} IG · ${countsByPlatform.tiktok} TT · ${countsByPlatform.youtube} YT`, positive: totalSyncedVideos > 0 },
              { key: 'campaigns', numericValue: activeCampaignsCount, icon: <TrendingUp className="w-5 h-5" />, label: 'Campagnes actives', value: String(activeCampaignsCount), change: 'acceptées', positive: activeCampaignsCount > 0 },
            ];
            const sorted = [...allMetrics].sort((a, b) =>
              metricsSort === 'desc' ? b.numericValue - a.numericValue : a.numericValue - b.numericValue
            );
            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {sorted.map((m) => (
                  <MetricCard key={m.key} icon={m.icon} label={m.label} value={m.value} change={m.change} positive={m.positive} />
                ))}
              </div>
            );
          })()}

          <div ref={chartRef} className="rounded-2xl overflow-hidden" style={glassCard}>
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-left">
                    <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                      {chartMetric === 'views' ? 'Vidéos (période)' : 'Gains'}
                    </p>
                    <p className="text-lg font-black leading-tight" style={{ color: '#fff' }}>
                      {chartMetric === 'views'
                        ? String(totalPeriodVideoCount)
                        : `$${totalPeriodEarned}`
                      }
                    </p>
                  </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="relative flex rounded-full p-[3px] shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <div
                      className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{
                        width: 'calc(50% - 3px)',
                        left: chartMetric === 'views' ? '3px' : 'calc(50%)',
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 2px 12px rgba(255,255,255,0.1)',
                      }}
                    />
                    <button
                      onClick={() => setChartMetric('views')}
                      className="relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-300"
                      style={{ color: chartMetric === 'views' ? '#fff' : 'rgba(255,255,255,0.3)' }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Vidéos
                    </button>
                    <button
                      onClick={() => setChartMetric('earned')}
                      className="relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-300"
                      style={{ color: chartMetric === 'earned' ? '#fff' : 'rgba(255,255,255,0.3)' }}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Gains
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="px-4 py-6">
                  <StatsChart data={chartData} metric={chartMetric} height={220} color="#FF782A" desktopHeight={300} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl overflow-hidden" style={glassCard}>
              <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mes vidéos</h2>
                  <span className="text-[10px] font-semibold text-white/30">{dashboardVideos.length} vidéo{dashboardVideos.length !== 1 ? 's' : ''}</span>
                </div>
                <button onClick={() => navigate('/my-videos')} className="text-xs font-bold transition-opacity hover:opacity-70" style={{ color: '#FF782A' }}>Voir tout</button>
              </div>
              <div className="flex sm:hidden items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  {availablePlatforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: tablePlatform === p ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        border: tablePlatform === p ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1,
                      }}
                    >
                      {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const isActive = tableSort?.key === 'date';
                    if (!isActive) {
                      setTableSort({ key: 'date', dir: 'desc' });
                    } else {
                      setTableSort({ key: 'date', dir: tableSort!.dir === 'desc' ? 'asc' : 'desc' });
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    background: tableSort?.key === 'date' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: tableSort?.key === 'date' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {tableSort?.key === 'date' && tableSort.dir === 'asc' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5 transition-all duration-300" style={{ color: '#fff' }} />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 transition-all duration-300" style={{ color: tableSort?.key === 'date' ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                    style={{ background: tablePlatform === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: tablePlatform === p ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)', opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1 }}>
                    {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-semibold" style={{ color: tablePlatform === p ? '#fff' : 'rgba(255,255,255,0.5)' }}>{platformNames[p] || p}</span>
                  </button>
                ))}
                <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button
                  onClick={() => {
                    if (!tableSort) {
                      setTableSort({ key: 'date', dir: 'desc' });
                    } else {
                      setTableSort({ key: 'date', dir: tableSort.dir === 'desc' ? 'asc' : 'desc' });
                    }
                  }}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                  style={{
                    background: tableSort ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: tableSort ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: tableSort ? '#fff' : 'rgba(255,255,255,0.5)' }}>Date</span>
                  {tableSort?.dir === 'asc' ? (
                    <ArrowDownLeft className="w-2.5 h-2.5" style={{ color: '#fff' }} />
                  ) : (
                    <ArrowUpRight className="w-2.5 h-2.5" style={{ color: tableSort ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                  )}
                </button>
                {(tablePlatform || tableSort) && (
                  <>
                    <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <button onClick={() => { setTablePlatform(null); setTableSort(null); }}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                      <X className="w-3 h-3" /> Reset
                    </button>
                  </>
                )}
              </div>

              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Comptes liés</p>
                  <p className="text-[11px] text-white/25 mt-0.5">Synchronise tes vidéos en connectant chaque réseau</p>
                </div>
                {allPlatforms.map((p) => {
                  const key = p as DashboardSocialPlatform & SocialPlatform;
                  const connected = !socialLoading && isSocialConnected(key);
                  const handle = displayUsername(key);
                  const busy = disconnectingSocial === key;
                  return (
                    <div
                      key={p}
                      className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                      style={{ background: 'rgba(0,0,0,0.12)' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {platformIcons[p] && (
                          <img src={platformIcons[p]} alt="" className="w-8 h-8 shrink-0 rounded-lg" style={{ opacity: 0.95 }} />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white/90">{platformNames[p]}</span>
                            {socialLoading ? (
                              <Loader2 className="w-3.5 h-3.5 text-white/25 animate-spin" />
                            ) : (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                style={
                                  connected
                                    ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }
                                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }
                                }
                              >
                                {connected ? 'Connecté' : 'Non connecté'}
                              </span>
                            )}
                          </div>
                          {connected && handle && (
                            <p className="text-xs text-white/40 mt-1 truncate">
                              Compte lié sur {platformNames[p]} : <span className="text-white/55 font-medium">{handle}</span>
                            </p>
                          )}
                          {connected && !handle && (
                            <p className="text-xs text-white/35 mt-1">Compte connecté sur {platformNames[p]}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                        {connected ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDisconnectSocial(key)}
                            className="h-9 px-4 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50"
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.35)',
                              color: '#f87171',
                            }}
                          >
                            {busy ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Déconnexion…
                              </span>
                            ) : (
                              'Déconnecter'
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnectSocial(key)}
                            className="h-9 px-4 rounded-full text-xs font-bold transition-all duration-200 hover:opacity-90"
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#fff',
                            }}
                          >
                            Connecter
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {linkedLoading && (
                <div className="flex items-center justify-center gap-2 px-5 py-10">
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                  <p className="text-sm text-white/30">Synchronisation Instagram, TikTok et YouTube…</p>
                </div>
              )}

              {!linkedLoading && connectedSocialCount === 0 && dashboardVideos.length === 0 && (
                <div className="px-5 py-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-xs text-white/35">
                    Connecte au moins un compte (Instagram, TikTok ou YouTube) ci-dessus pour synchroniser tes vidéos ici.
                  </p>
                </div>
              )}

              {!linkedLoading && connectedSocialCount > 0 && dashboardVideos.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Play className="w-7 h-7 text-white/20" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/70">Aucune vidéo synchronisée</p>
                    <p className="text-xs text-white/30 mt-1 max-w-xs">
                      {igNotConnected
                        ? 'Instagram n’est pas connecté ou la synchro a échoué. Vérifie aussi TikTok (scope video.list) et YouTube (youtube.readonly).'
                        : 'Publie des vidéos sur tes comptes liés : elles apparaîtront ici après la prochaine synchro.'}
                    </p>
                  </div>
                </div>
              )}

              {!linkedLoading && dashboardVideos.length > 0 && (
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {filteredVideos.map((video, i) => (
                    <a
                      key={video.id}
                      href={video.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 text-left hover:bg-white/[0.03]"
                      style={{ background: 'transparent', borderLeft: '2px solid transparent' }}
                    >
                      <span className="text-[11px] font-black w-4 shrink-0 text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>#{i + 1}</span>

                      <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={video.thumb} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{video.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {platformIcons[video.platform] && (
                            <img src={platformIcons[video.platform]} alt={platformNames[video.platform] || video.platform} className="w-3 h-3 opacity-60" />
                          )}
                          {video.viewCount != null && (
                            <span className="text-[10px] text-white/45 tabular-nums">
                              {video.viewCount.toLocaleString('fr-FR')} vues ·{' '}
                            </span>
                          )}
                          <span className="text-[10px] text-white/30">{video.date}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ExternalLink className="w-4 h-4 text-white/20" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PeriodSelector({ periods, value, onChange, color = '#FF782A' }: { periods: string[]; value: string; onChange: (p: string) => void; color?: string }) {
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

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-full p-[3px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
          background: 'rgba(255,120,42,0.75)',
          border: '2px solid rgba(255,120,42,0.9)',
          boxShadow: '0 2px 16px rgba(255,120,42,0.5)',
        }}
      />
      {periods.map((p, i) => (
        <button
          key={p}
          ref={(el) => { btnRefs.current[i] = el; }}
          onClick={() => onChange(p)}
          className="relative z-10 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors duration-300"
          style={{ color: value === p ? '#ffffff' : 'rgba(255,255,255,0.3)' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  icon, label, value, change, positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]"
      style={glassCard}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ color: '#fff' }}>{icon}</span>
        </div>
        {change ? (
          <div className="flex items-center gap-0.5 min-w-0 max-w-[55%] justify-end">
            <ArrowUpRight className="w-3 h-3 shrink-0" style={{ color: positive ? '#22c55e' : '#ef4444' }} />
            <span className="text-[10px] font-bold text-right leading-tight break-words" style={{ color: positive ? '#22c55e' : '#ef4444' }}>{change}</span>
          </div>
        ) : null}
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-[11px] text-white/40 font-medium">{label}</p>
    </div>
  );
}
