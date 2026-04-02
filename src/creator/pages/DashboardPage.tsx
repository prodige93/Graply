import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Eye, TrendingUp, ArrowUpRight, Play, X, ArrowDownLeft, ExternalLink, Instagram, Loader2 } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import Sidebar from '../components/Sidebar';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import { useInstagramVideos } from '@/shared/lib/useInstagramVideos';

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

const rawChartData6m = [
  { views: 42000, earned: 8 },
  { views: 95000, earned: 17 },
  { views: 180000, earned: 32 },
  { views: 310000, earned: 56 },
  { views: 520000, earned: 94 },
  { views: 670000, earned: 121 },
];

function formatViews(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
}

const creatorStats = {
  totalEarned: 344.80,
  totalViews: 1817000,
  videosPosted: 9,
  activeCampaigns: 2,
};

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function buildChartPoints(period: string, seed: typeof rawChartData6m) {
  const now = new Date();

  function interp(count: number) {
    return Array.from({ length: count }, (_, i) => {
      const t = (i / (count - 1)) * (seed.length - 1);
      const lo = Math.floor(t);
      const hi = Math.min(lo + 1, seed.length - 1);
      const f = t - lo;
      return {
        views: Math.round(seed[lo].views + (seed[hi].views - seed[lo].views) * f),
        earned: Math.round(seed[lo].earned + (seed[hi].earned - seed[lo].earned) * f),
      };
    });
  }

  if (period === 'all') {
    const pts = interp(6);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      return { label: i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], ...p };
    });
  }
  if (period === '7j') {
    const pts = interp(7);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { label: i === 6 ? 'Auj.' : DAY_NAMES[d.getDay()] + ' ' + d.getDate(), ...p };
    });
  }
  if (period === '1m') {
    const pts = interp(4);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (3 - i) * 7);
      return { label: i === 3 ? 'Auj.' : d.getDate() + ' ' + MONTH_NAMES[d.getMonth()], ...p };
    });
  }
  if (period === '3m') {
    const pts = interp(3);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (2 - i));
      return { label: i === 2 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], ...p };
    });
  }
  const pts = interp(6);
  return pts.map((p, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return { label: i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], ...p };
  });
}

interface DashboardVideo {
  id: string;
  title: string;
  platform: string;
  date: string;
  thumb: string;
  permalink: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('6m');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { videos: igVideos, loading: igLoading, notConnected: igNotConnected } = useInstagramVideos();
  const [chartMetric, setChartMetric] = useState<'views' | 'earned'>('views');
  const [metricsSort, setMetricsSort] = useState<'desc' | 'asc'>('desc');
  const [withdrawBalance, setWithdrawBalance] = useState(344.80);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [tablePlatform, setTablePlatform] = useState<string | null>(null);
  const [tableSort, setTableSort] = useState<{ key: 'date'; dir: 'desc' | 'asc' } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  function handleWithdraw() {
    if (withdrawBalance <= 0 || withdrawLoading) return;
    setWithdrawLoading(true);
    setTimeout(() => {
      setWithdrawBalance(0);
      setWithdrawLoading(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }, 1200);
  }

  const dashboardVideos: DashboardVideo[] = useMemo(() => {
    return igVideos.map((v) => ({
      id: v.id,
      title: v.title,
      platform: 'instagram',
      date: v.date,
      thumb: v.thumbnail,
      permalink: v.permalink,
    }));
  }, [igVideos]);

  const chartData = useMemo(() => {
    return buildChartPoints(chartPeriod, rawChartData6m);
  }, [chartPeriod]);

  const totalPeriodViews = chartData.reduce((s, d) => s + d.views, 0);
  const totalPeriodEarned = chartData.reduce((s, d) => s + d.earned, 0);

  const filteredVideos = useMemo(() => {
    let vids = tablePlatform ? dashboardVideos.filter((v) => v.platform === tablePlatform) : dashboardVideos;
    if (tableSort?.key === 'date') {
      vids = [...vids].sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
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
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">

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
              {withdrawBalance > 0 && (
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Gains accumulés depuis la dernière demande
                </p>
              )}
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
                onClick={handleWithdraw}
                disabled={withdrawBalance <= 0 || withdrawLoading}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{
                  background: withdrawBalance > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: withdrawBalance > 0 ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  color: withdrawBalance > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                  boxShadow: withdrawBalance > 0 ? '0 2px 24px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
                  transform: withdrawLoading ? 'scale(0.97)' : 'scale(1)',
                  cursor: withdrawBalance <= 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <DollarSign className="w-4 h-4" />
                {withdrawLoading ? 'Traitement...' : withdrawBalance <= 0 ? 'Aucun solde à retirer' : 'Retirer mes gains'}
              </button>
            )}
          </div>

          {(() => {
            const allMetrics = [
              { key: 'earned', numericValue: creatorStats.totalEarned, icon: <DollarSign className="w-5 h-5" />, label: 'Total gagné', value: `$${creatorStats.totalEarned.toFixed(0)}`, change: '+18.4%', positive: true },
              { key: 'views', numericValue: creatorStats.totalViews, icon: <Eye className="w-5 h-5" />, label: 'Vues générées', value: formatViews(creatorStats.totalViews), change: '+31.2%', positive: true },
              { key: 'videos', numericValue: igVideos.length, icon: <Play className="w-5 h-5" />, label: 'Vidéos postées', value: String(igVideos.length), change: igVideos.length > 0 ? `${igVideos.length}` : '0', positive: igVideos.length > 0 },
              { key: 'campaigns', numericValue: creatorStats.activeCampaigns, icon: <TrendingUp className="w-5 h-5" />, label: 'Campagnes actives', value: String(creatorStats.activeCampaigns), change: 'ce mois', positive: true },
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
                      {chartMetric === 'views' ? 'Vues' : 'Gagné'}
                    </p>
                    <p className="text-lg font-black leading-tight" style={{ color: '#fff' }}>
                      {chartMetric === 'views'
                        ? formatViews(totalPeriodViews)
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
                      <Eye className="w-3.5 h-3.5" />
                      Vues
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

              <div className="flex items-center gap-2 flex-wrap px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                    style={{
                      background: tablePlatform === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: tablePlatform === p ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1,
                    }}
                  >
                    {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-3.5 h-3.5 social-icon" />}
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

              {igLoading && (
                <div className="flex items-center justify-center gap-2 px-5 py-10">
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                  <p className="text-sm text-white/30">Synchronisation avec Instagram…</p>
                </div>
              )}

              {!igLoading && igNotConnected && (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(228,64,95,0.1)', border: '1px solid rgba(228,64,95,0.2)' }}
                  >
                    <Instagram className="w-7 h-7" style={{ color: '#E4405F' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/70">Aucun compte Instagram connecté</p>
                    <p className="text-xs text-white/30 mt-1 max-w-xs">
                      Connectez votre compte Instagram dans les paramètres pour synchroniser automatiquement vos vidéos.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(228,64,95,0.15)',
                      border: '1px solid rgba(228,64,95,0.3)',
                      color: '#E4405F',
                    }}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Connecter Instagram
                  </button>
                </div>
              )}

              {!igLoading && !igNotConnected && dashboardVideos.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Play className="w-7 h-7 text-white/20" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/70">Aucune vidéo trouvée</p>
                    <p className="text-xs text-white/30 mt-1 max-w-xs">
                      Publiez des vidéos sur votre compte Instagram et elles apparaîtront automatiquement ici.
                    </p>
                  </div>
                </div>
              )}

              {!igLoading && dashboardVideos.length > 0 && (
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
                        <div className="flex items-center gap-2 mt-0.5">
                          {platformIcons[video.platform] && (
                            <img src={platformIcons[video.platform]} alt={platformNames[video.platform] || video.platform} className="w-3 h-3 opacity-60" />
                          )}
                          <p className="text-[10px] text-white/30">{video.date}</p>
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
        <div className="flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" style={{ color: positive ? '#22c55e' : '#ef4444' }} />
          <span className="text-[10px] font-bold" style={{ color: positive ? '#22c55e' : '#ef4444' }}>{change}</span>
        </div>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-[11px] text-white/40 font-medium">{label}</p>
    </div>
  );
}
