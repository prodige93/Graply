import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Eye, TrendingUp, ArrowUpRight, ArrowLeft, Play, ChevronRight, Clock, Zap, X, ArrowUp, ArrowDown, ChevronsUpDown, ArrowDownLeft, BarChart2 } from 'lucide-react';
import StatsChart from '../components/StatsChart';
import Sidebar from '../components/Sidebar';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#00F2EA',
};

const platformNames: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

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

const platformBreakdown = [
  { platform: 'tiktok', views: 1102000, earned: 198.40, videos: 5 },
  { platform: 'youtube', views: 487000, earned: 87.60, videos: 2 },
  { platform: 'instagram', views: 228000, earned: 58.80, videos: 2 },
];

const topVideos = [
  {
    id: 'v1',
    title: 'Unboxing iPhone 17 Pro Max',
    platform: 'tiktok',
    campaign: 'Apple — iPhone 17 Pro Max',
    views: 312000,
    earned: 62.40,
    date: '10 mars',
    thumb: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'v2',
    title: 'Best clips Black Ops 7 #1',
    platform: 'youtube',
    campaign: 'Activision — Black Ops 7',
    views: 198000,
    earned: 35.60,
    date: '11 mars',
    thumb: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'v3',
    title: 'iPhone 17 — Caméra test',
    platform: 'instagram',
    campaign: 'Apple — iPhone 17 Pro Max',
    views: 170000,
    earned: 34.00,
    date: '12 mars',
    thumb: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'v4',
    title: 'BO7 — Montage highlights',
    platform: 'tiktok',
    campaign: 'Activision — Black Ops 7',
    views: 114000,
    earned: 20.52,
    date: '9 mars',
    thumb: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

const videoChartData: Record<string, typeof rawChartData6m> = {
  v1: [
    { views: 12000, earned: 2 },
    { views: 38000, earned: 7 },
    { views: 95000, earned: 19 },
    { views: 210000, earned: 42 },
    { views: 290000, earned: 58 },
    { views: 312000, earned: 62 },
  ],
  v2: [
    { views: 8000, earned: 1 },
    { views: 24000, earned: 4 },
    { views: 72000, earned: 13 },
    { views: 130000, earned: 23 },
    { views: 175000, earned: 31 },
    { views: 198000, earned: 36 },
  ],
  v3: [
    { views: 5000, earned: 1 },
    { views: 18000, earned: 3 },
    { views: 54000, earned: 11 },
    { views: 110000, earned: 22 },
    { views: 148000, earned: 30 },
    { views: 170000, earned: 34 },
  ],
  v4: [
    { views: 3000, earned: 0 },
    { views: 12000, earned: 2 },
    { views: 38000, earned: 7 },
    { views: 72000, earned: 13 },
    { views: 97000, earned: 17 },
    { views: 114000, earned: 20 },
  ],
};

const rawChartData6m = [
  { views: 42000, earned: 8 },
  { views: 95000, earned: 17 },
  { views: 180000, earned: 32 },
  { views: 310000, earned: 56 },
  { views: 520000, earned: 94 },
  { views: 670000, earned: 121 },
];

const platformChartData: Record<string, typeof rawChartData6m> = {
  tiktok: [
    { views: 28000, earned: 5 },
    { views: 58000, earned: 10 },
    { views: 112000, earned: 20 },
    { views: 198000, earned: 36 },
    { views: 320000, earned: 58 },
    { views: 420000, earned: 76 },
  ],
  youtube: [
    { views: 9000, earned: 2 },
    { views: 22000, earned: 4 },
    { views: 42000, earned: 7 },
    { views: 70000, earned: 12 },
    { views: 120000, earned: 21 },
    { views: 180000, earned: 32 },
  ],
  instagram: [
    { views: 5000, earned: 1 },
    { views: 15000, earned: 3 },
    { views: 26000, earned: 5 },
    { views: 42000, earned: 8 },
    { views: 80000, earned: 15 },
    { views: 70000, earned: 13 },
  ],
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('6m');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [chartMetric, setChartMetric] = useState<'views' | 'earned'>('views');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [videoPlatformFilter, setVideoPlatformFilter] = useState<string | null>(null);
  const [videoSort, setVideoSort] = useState<'performance' | 'date'>('performance');
  const [videoSortDir, setVideoSortDir] = useState<'desc' | 'asc'>('desc');
  const [metricsSort, setMetricsSort] = useState<'desc' | 'asc'>('desc');
  const [withdrawBalance, setWithdrawBalance] = useState(344.80);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [tablePlatform, setTablePlatform] = useState<string | null>(null);
  const [tableSort, setTableSort] = useState<{ key: 'performance' | 'date'; dir: 'desc' | 'asc' } | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const allPlatforms = platformBreakdown.map((pb) => pb.platform);

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

  const selectedVideo = selectedVideoId ? topVideos.find((v) => v.id === selectedVideoId) ?? null : null;

  const chartData = useMemo(() => {
    if (selectedVideoId && videoChartData[selectedVideoId]) {
      return buildChartPoints(chartPeriod, videoChartData[selectedVideoId]);
    }
    return buildChartPoints(chartPeriod, activePlatform ? platformChartData[activePlatform] : rawChartData6m);
  }, [chartPeriod, activePlatform, selectedVideoId]);

  const totalPeriodViews = chartData.reduce((s, d) => s + d.views, 0);
  const totalPeriodEarned = chartData.reduce((s, d) => s + d.earned, 0);

  const chartColor = selectedVideo
    ? platformColors[selectedVideo.platform] ?? '#FF782A'
    : activePlatform ? platformColors[activePlatform] : '#FF782A';

  function handleVideoSelect(videoId: string) {
    if (selectedVideoId === videoId) {
      setSelectedVideoId(null);
    } else {
      setSelectedVideoId(videoId);
      setActivePlatform(null);
      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  const activePb = activePlatform ? platformBreakdown.find((p) => p.platform === activePlatform) : null;

  const availablePlatforms = useMemo(() => [...new Set(topVideos.map((v) => v.platform))], []);

  const filteredVideos = useMemo(() => {
    let vids = tablePlatform ? topVideos.filter((v) => v.platform === tablePlatform) : topVideos;
    if (tableSort?.key === 'performance') {
      vids = [...vids].sort((a, b) => tableSort.dir === 'desc' ? b.views - a.views : a.views - b.views);
    } else if (tableSort?.key === 'date') {
      vids = [...vids].sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return tableSort.dir === 'desc' ? diff : -diff;
      });
    }
    return vids;
  }, [tablePlatform, tableSort]);

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
                    {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-5 h-5 social-icon" />}
                  </button>
                ))}
              </div>
              <PeriodSelector periods={['all', '7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} />
            </div>
          )}

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
              { key: 'videos', numericValue: creatorStats.videosPosted, icon: <Play className="w-5 h-5" />, label: 'Vidéos postées', value: String(creatorStats.videosPosted), change: '+3', positive: true },
              { key: 'campaigns', numericValue: creatorStats.activeCampaigns, icon: <TrendingUp className="w-5 h-5" />, label: 'Campagnes actives', value: String(creatorStats.activeCampaigns), change: 'ce mois', positive: true },
            ];
            const sorted = [...allMetrics].sort((a, b) =>
              metricsSort === 'desc' ? b.numericValue - a.numericValue : a.numericValue - b.numericValue
            );
            return (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {sorted.map((m) => (
                    <MetricCard key={m.key} icon={m.icon} label={m.label} value={m.value} change={m.change} positive={m.positive} />
                  ))}
                </div>
              </>
            );
          })()}

          <div ref={chartRef} className="rounded-2xl overflow-hidden" style={glassCard}>
            <div className="p-5 pb-4">

              {selectedVideo && (
                <div
                  className="flex items-center gap-2.5 mb-4 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <img
                    src={selectedVideo.thumb}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/35 font-semibold uppercase tracking-wider leading-none mb-0.5">Vidéo sélectionnée</p>
                    <p className="text-xs font-semibold text-white truncate">{selectedVideo.title}</p>
                  </div>
                  <button
                    onClick={() => setSelectedVideoId(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5 text-white/40" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-left">
                    <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                      {chartMetric === 'views' ? 'Vues' : 'Gagné'}
                    </p>
                    <p className="text-lg font-black leading-tight" style={{ color: '#fff' }}>
                      {selectedVideo
                        ? chartMetric === 'views'
                          ? formatViews(selectedVideo.views)
                          : `$${selectedVideo.earned.toFixed(2)}`
                        : activePb
                          ? chartMetric === 'views'
                            ? formatViews(activePb.views)
                            : `$${activePb.earned.toFixed(0)}`
                          : chartMetric === 'views'
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
                  <span className="text-[10px] font-semibold text-white/30">{filteredVideos.length} vidéo{filteredVideos.length !== 1 ? 's' : ''}</span>
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
                      {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-4 h-4 social-icon" />}
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

              <div className="hidden sm:flex items-center gap-2 flex-wrap px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {availablePlatforms.map((p) => (
                  <button key={p} onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                    style={{ background: tablePlatform === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: tablePlatform === p ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)', opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1 }}>
                    {platformIcons[p] && <img src={platformIcons[p]} alt={platformNames[p] || p} className="w-3.5 h-3.5 social-icon" />}
                    <span className="text-[11px] font-semibold" style={{ color: tablePlatform === p ? '#fff' : 'rgba(255,255,255,0.5)' }}>{platformNames[p] || p}</span>
                  </button>
                ))}
                {availablePlatforms.length > 0 && <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                {(['performance', 'date'] as const).map((key) => {
                  const isActive = tableSort?.key === key;
                  return (
                    <button key={key} onClick={() => !isActive ? setTableSort({ key, dir: 'desc' }) : setTableSort({ key, dir: tableSort!.dir === 'desc' ? 'asc' : 'desc' })}
                      className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                      style={{ background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-[11px] font-semibold capitalize" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{key === 'performance' ? 'Performance' : 'Date'}</span>
                      {isActive && tableSort?.dir === 'asc' ? (
                        <ArrowDownLeft className="w-2.5 h-2.5" style={{ color: '#fff' }} />
                      ) : (
                        <ArrowUpRight className="w-2.5 h-2.5" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                      )}
                    </button>
                  );
                })}
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

              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {filteredVideos.map((video, i) => {
                  const isSelected = selectedVideoId === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 text-left"
                      style={{
                        background: isSelected ? `rgba(${video.platform === 'tiktok' ? '0,242,234' : video.platform === 'youtube' ? '255,0,0' : '228,64,95'},0.06)` : 'transparent',
                        borderLeft: isSelected ? `2px solid ${platformColors[video.platform] ?? '#FF782A'}` : '2px solid transparent',
                      }}
                    >
                      <span className="text-[11px] font-black w-4 shrink-0 text-center" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.15)' }}>#{i + 1}</span>

                      <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={video.thumb} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          {isSelected
                            ? <BarChart2 className="w-3.5 h-3.5 text-white" />
                            : <Play className="w-3 h-3 text-white fill-white" />
                          }
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)' }}>{video.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {platformIcons[video.platform] && (
                            <img src={platformIcons[video.platform]} alt={video.platform} className="w-3 h-3 opacity-60" />
                          )}
                          <p className="text-[10px] text-white/30 truncate">{video.campaign}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-xs font-bold text-white">{formatViews(video.views)} vues</p>
                        <p className="text-xs font-bold" style={{ color: '#FF782A' }}>${video.earned.toFixed(2)}</p>
                      </div>

                      <div className="shrink-0">
                        {isSelected
                          ? <BarChart2 className="w-4 h-4" style={{ color: platformColors[video.platform] ?? '#FF782A' }} />
                          : <ChevronRight className="w-4 h-4 text-white/15" />
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
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
