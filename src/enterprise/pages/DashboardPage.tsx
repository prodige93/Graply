import { useState, useEffect, useMemo, useRef } from 'react';
import { renderAmount } from '@/shared/utils/chartUtils';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, DollarSign, Eye, Users, TrendingUp, Megaphone, ArrowUpRight, ArrowDownRight, Calendar, X, ChevronsUpDown, ArrowUpRight as SortIcon } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import StatsChart from '../components/StatsChart';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

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

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#00F2EA',
};

function parseBudget(budget: string): number {
  return parseFloat(budget.replace(/[^0-9.]/g, '')) || 0;
}

function formatNumber(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
}

function formatCurrency(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export default function DashboardPage() {
  const navigate = useEnterpriseNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chartPeriod, setChartPeriod] = useState<string>('6m');
  const [chartMetric, setChartMetric] = useState<'views' | 'earned'>('views');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [tablePlatform, setTablePlatform] = useState<string | null>(null);
  const [tableContentType, setTableContentType] = useState<string | null>(null);
  const [tableSort, setTableSort] = useState<{ key: 'performance' | 'date'; dir: 'asc' | 'desc' } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (!error && data) setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((s, c) => s + parseBudget(c.budget), 0);
    const activeCampaigns = campaigns.length;
    const allPlatforms = new Set<string>();
    campaigns.forEach((c) => c.platforms.forEach((p) => allPlatforms.add(p)));

    const platformBudgets: Record<string, number> = {};
    campaigns.forEach((c) => {
      if (c.platform_budgets) {
        Object.entries(c.platform_budgets).forEach(([p, data]) => {
          platformBudgets[p] = (platformBudgets[p] || 0) + (parseFloat(data.amount) || 0);
        });
      }
    });

    const categoryBreakdown: Record<string, number> = {};
    campaigns.forEach((c) => {
      c.categories.forEach((cat) => {
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      });
    });

    const contentTypeBreakdown: Record<string, number> = {};
    campaigns.forEach((c) => {
      if (c.content_type) {
        contentTypeBreakdown[c.content_type] = (contentTypeBreakdown[c.content_type] || 0) + 1;
      }
    });

    return { totalBudget, activeCampaigns, allPlatforms: Array.from(allPlatforms), platformBudgets, categoryBreakdown, contentTypeBreakdown };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (!filterPlatform) return campaigns;
    return campaigns.filter((c) => c.platforms.includes(filterPlatform));
  }, [campaigns, filterPlatform]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => c.platforms.forEach((p) => set.add(p)));
    return Array.from(set);
  }, [campaigns]);

  const availableContentTypes = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => { if (c.content_type) set.add(c.content_type); });
    return Array.from(set);
  }, [campaigns]);

  const tableFilteredCampaigns = useMemo(() => {
    const filtered = filteredCampaigns.filter((c) => {
      if (tablePlatform && !c.platforms.includes(tablePlatform)) return false;
      if (tableContentType && c.content_type !== tableContentType) return false;
      return true;
    });
    if (!tableSort) return [...filtered].sort((a, b) => parseBudget(b.budget) - parseBudget(a.budget));
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (tableSort.key === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        cmp = parseBudget(a.budget) - parseBudget(b.budget);
      }
      return tableSort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredCampaigns, tablePlatform, tableContentType, tableSort]);

  const filteredStats = useMemo(() => {
    const src = filteredCampaigns;
    const totalBudget = src.reduce((s, c) => s + parseBudget(c.budget), 0);
    const activeCampaigns = src.length;
    const platformBudgets: Record<string, number> = {};
    src.forEach((c) => {
      if (c.platform_budgets) {
        Object.entries(c.platform_budgets).forEach(([p, data]) => {
          if (!filterPlatform || p === filterPlatform) {
            platformBudgets[p] = (platformBudgets[p] || 0) + (parseFloat(data.amount) || 0);
          }
        });
      }
    });
    return { totalBudget, activeCampaigns, platformBudgets };
  }, [filteredCampaigns, filterPlatform]);

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) return null;
    return campaigns.find((c) => c.id === selectedCampaignId) || null;
  }, [selectedCampaignId, campaigns]);

  const chartData = useMemo(() => {
    const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const platformSpecificBudget = filterPlatform && !selectedCampaign
      ? Object.values(filteredStats.platformBudgets).reduce((s, v) => s + v, 0) || filteredStats.totalBudget
      : null;
    const totalBudget = selectedCampaign
      ? (filterPlatform && selectedCampaign.platform_budgets?.[filterPlatform]
          ? parseFloat(selectedCampaign.platform_budgets[filterPlatform].amount) || parseBudget(selectedCampaign.budget)
          : parseBudget(selectedCampaign.budget)) || 1000
      : (platformSpecificBudget ?? filteredStats.totalBudget) || 1000;

    const generatePoints = (count: number) =>
      Array.from({ length: count }, (_, i) => {
        const progress = count > 1 ? i / (count - 1) : 0;
        const base = progress * 0.35;
        const noise = Math.sin(i * 2.7) * 0.06 + Math.cos(i * 1.5) * 0.04;
        const factor = Math.max(0.01, base + noise);
        return {
          views: Math.round(factor * totalBudget * 65),
          earned: Math.round(factor * totalBudget * 0.9),
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
    if (chartPeriod === 'all') {
      const pts = generatePoints(12);
      return pts.map((p, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        return { label: i === 11 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], views: p.views, earned: p.earned };
      });
    }
    const pts = generatePoints(6);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      return { label: i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()], views: p.views, earned: p.earned };
    });
  }, [filteredStats.totalBudget, chartPeriod, selectedCampaign, filterPlatform]);

  const totalViews = chartData.reduce((s, d) => s + d.views, 0);
  const totalSpent = chartData.reduce((s, d) => s + d.earned, 0);

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white">Mon dashboard</h1>
            <p className="text-sm text-white/40 mt-0.5">Vue d'ensemble de toutes vos campagnes</p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 space-y-6">
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
            {stats.allPlatforms.length > 0 && (
              <>
                <div className="h-6 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
                {stats.allPlatforms.map((p) => (
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
              </>
            )}
          </div>
          <PeriodSelector periods={['all', '7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Budget total"
            value={formatCurrency(filteredStats.totalBudget)}
            change="+12.5%"
            positive
          />
          <MetricCard
            icon={<Eye className="w-5 h-5" />}
            label="Vues totales"
            value={formatNumber(totalViews)}
            change="+23.1%"
            positive
          />
          <MetricCard
            icon={<Megaphone className="w-5 h-5" />}
            label="Campagnes actives"
            value={String(filteredStats.activeCampaigns)}
            change={filteredStats.activeCampaigns > 0 ? '+' + filteredStats.activeCampaigns : '0'}
            positive
          />
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Créateurs"
            value="0"
            change="--"
            positive={false}
          />
        </div>

        {selectedCampaign && (
          <div ref={chartRef} className="relative rounded-2xl overflow-hidden h-44 lg:h-52">
            {selectedCampaign.photo_url ? (
              <img src={selectedCampaign.photo_url} alt={selectedCampaign.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' }} />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(29,28,28,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)' }} />
            <button
              onClick={() => setSelectedCampaignId(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedCampaign.platforms.map((p) =>
                      platformIcons[p] ? (
                        <div key={p} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
                          <img src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 social-icon" />
                        </div>
                      ) : null
                    )}
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white truncate">{selectedCampaign.name}</h2>
                  <p className="text-xs text-white/50 mt-1">Statistiques de la campagne</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold">{renderAmount(formatCurrency(parseBudget(selectedCampaign.budget)))}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Budget</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          {...(!selectedCampaign ? { ref: chartRef } : {})}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)' }}
        >
          <div className="p-6 pb-4">
            <div className="flex flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium leading-none mb-0.5">
                    {chartMetric === 'views' ? 'Total vues' : 'Total dépensé'}
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {renderAmount(chartMetric === 'views' ? formatNumber(totalViews) : formatCurrency(totalSpent))}
                  </p>
                </div>
                {selectedCampaign && (
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedCampaign.name}
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
                      left: chartMetric === 'views' ? '3px' : 'calc(50%)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  />
                  <button
                    onClick={() => setChartMetric('views')}
                    className="relative z-10 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide transition-all duration-300"
                    style={{
                      color: chartMetric === 'views' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="hidden xs:inline sm:inline">Vues</span>
                    <span className="xs:hidden sm:hidden">Vues</span>
                  </button>
                  <button
                    onClick={() => setChartMetric('earned')}
                    className="relative z-10 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide transition-all duration-300"
                    style={{
                      color: chartMetric === 'earned' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Coût</span>
                  </button>
                </div>
              </div>
            </div>


            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="px-4 py-6">
                <StatsChart data={chartData} metric={chartMetric} height={220} color="#8B5CF6" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)' }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mes campagnes</h2>
              <button
                onClick={() => navigate('/mes-campagnes')}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#a855f7' }}
              >
                Voir tout
              </button>
            </div>

            {/* Mobile filter bar */}
            <div className="flex sm:hidden items-center justify-between mb-4">
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
                <SortIcon
                  className="w-4 h-4 transition-transform duration-300"
                  style={{
                    color: tableSort?.key === 'date' ? '#fff' : 'rgba(255,255,255,0.4)',
                    transform: tableSort?.key === 'date' && tableSort.dir === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            </div>

            {/* Desktop filter bar */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap mb-4">
              {availablePlatforms.map((p) => (
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
                  <span className="text-[11px] font-semibold" style={{ color: tablePlatform === p ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                    {platformNames[p] || p}
                  </span>
                </button>
              ))}
              {availablePlatforms.length > 0 && (
                <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              )}
              {(['performance', 'date'] as const).map((key) => {
                const isActive = tableSort?.key === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (!isActive) {
                        setTableSort({ key, dir: 'desc' });
                      } else {
                        setTableSort({ key, dir: tableSort!.dir === 'desc' ? 'asc' : 'desc' });
                      }
                    }}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-[11px] font-semibold capitalize" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                      {key === 'performance' ? 'Performance' : 'Date'}
                    </span>
                    <ChevronsUpDown
                      className="w-3 h-3 transition-colors"
                      style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}
                    />
                  </button>
                );
              })}
              {(tablePlatform || tableSort) && (
                <>
                  <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <button
                    onClick={() => { setTablePlatform(null); setTableSort(null); }}
                    className="flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <X className="w-3 h-3" />
                    Reset
                  </button>
                </>
              )}
            </div>

            {tableFilteredCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-sm text-white/30">Aucune campagne</p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="flex sm:hidden flex-col gap-2">
                  {(() => {
                    const maxBudget = Math.max(...tableFilteredCampaigns.map((c) => parseBudget(c.budget)), 1);
                    return tableFilteredCampaigns.map((c) => {
                      const budget = parseBudget(c.budget);
                      const progressPct = maxBudget > 0 ? Math.round((budget / maxBudget) * 100) : 0;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            const newId = selectedCampaignId === c.id ? null : c.id;
                            setSelectedCampaignId(newId);
                            if (newId && chartRef.current) {
                              chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="cursor-pointer rounded-xl p-3 transition-all duration-200"
                          style={{
                            background: selectedCampaignId === c.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                            border: selectedCampaignId === c.id ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              {c.photo_url ? (
                                <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Megaphone className="w-4 h-4 text-white/15" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {c.platforms.slice(0, 3).map((p) =>
                                  platformIcons[p] ? (
                                    <div key={p} className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                      <img src={platformIcons[p]} alt={p} className="w-3 h-3 social-icon" />
                                    </div>
                                  ) : null
                                )}
                                {c.content_type && (
                                  <span
                                    className="px-1.5 py-px rounded-full text-[9px] font-bold tracking-wide shrink-0"
                                    style={
                                      c.content_type.toLowerCase() === 'ugc'
                                        ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.3)', color: '#FF00D9' }
                                        : { background: 'rgba(100,80,200,0.15)', border: '1px solid rgba(100,80,200,0.3)', color: '#a78bfa' }
                                    }
                                  >
                                    {c.content_type}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-white truncate leading-tight">{c.name}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-white">$0</p>
                              <p className="text-[10px] text-white/35 mt-0.5">{renderAmount(budget > 0 ? formatCurrency(budget) : c.budget, '', 'rgba(255,255,255,0.2)')}</p>
                            </div>
                          </div>
                          <div className="mt-2.5">
                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'rgba(255,255,255,0.9)' : progressPct >= 60 ? 'rgba(34,197,94,0.9)' : progressPct >= 30 ? 'rgba(234,179,8,0.9)' : 'rgba(255,255,255,0.4)' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th className="text-left text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Campagne</th>
                        <th className="text-left text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Plateformes</th>
                        <th className="text-left text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Type</th>
                        <th className="text-right text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Budget</th>
                        <th className="text-right text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Dépensé</th>
                        <th className="text-left text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3 pr-4">Progression</th>
                        <th className="text-right text-[10px] text-white/30 uppercase tracking-wider font-semibold pb-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const maxBudget = Math.max(...tableFilteredCampaigns.map((c) => parseBudget(c.budget)), 1);
                        return tableFilteredCampaigns.map((c) => {
                          const budget = parseBudget(c.budget);
                          const progressPct = maxBudget > 0 ? Math.round((budget / maxBudget) * 100) : 0;
                          const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(c.created_at).getTime()) / 86400000));
                          return (
                            <tr
                              key={c.id}
                              onClick={() => {
                                const newId = selectedCampaignId === c.id ? null : c.id;
                                setSelectedCampaignId(newId);
                                if (newId && chartRef.current) {
                                  chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              className="group cursor-pointer transition-all duration-200"
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                background: selectedCampaignId === c.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                              }}
                            >
                              <td className="py-3.5 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {c.photo_url ? (
                                      <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Megaphone className="w-4 h-4 text-white/15" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate max-w-[200px] group-hover:text-white/90">{c.name}</p>
                                    <p className="text-[10px] text-white/30 mt-0.5">
                                      <Calendar className="w-3 h-3 inline mr-1" />
                                      {daysActive}j actifs
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 pr-4">
                                <div className="flex items-center gap-2">
                                  {c.platforms.map((p) =>
                                    platformIcons[p] ? (
                                      <div key={p} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <img src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 social-icon" />
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 pr-4">
                                {c.content_type && (
                                  <span
                                    className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
                                    style={
                                      c.content_type.toLowerCase() === 'ugc'
                                        ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' }
                                        : { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' }
                                    }
                                  >
                                    {c.content_type}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 pr-4 text-right">
                                <span className="text-sm font-bold">{renderAmount(budget > 0 ? formatCurrency(budget) : c.budget)}</span>
                              </td>
                              <td className="py-3.5 pr-4 text-right">
                                <span className="text-sm font-semibold text-white">$0</span>
                              </td>
                              <td className="py-3.5 pr-4">
                                <div className="w-24">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-semibold text-white">{progressPct}%</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'rgba(255,255,255,0.9)' : progressPct >= 60 ? 'rgba(34,197,94,0.9)' : progressPct >= 30 ? 'rgba(234,179,8,0.9)' : 'rgba(255,255,255,0.5)' }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 text-right">
                                <span
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                                >
                                  Active
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function PeriodSelector({ periods, value, onChange }: { periods: string[]; value: string; onChange: (p: string) => void }) {
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
      setSliderStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [value, periods]);

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
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(139,92,246,0.5))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(124,58,237,0.5)',
          boxShadow: '0 2px 12px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
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

function MetricCard({
  icon,
  label,
  value,
  change,
  positive,
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
      style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className="text-white">{icon}</span>
        </div>
        {change !== '--' && (
          <div className="flex items-center gap-0.5">
            {positive ? (
              <ArrowUpRight className="w-3 h-3" style={{ color: '#22c55e' }} />
            ) : (
              <ArrowDownRight className="w-3 h-3" style={{ color: '#ef4444' }} />
            )}
            <span className="text-[10px] font-bold" style={{ color: positive ? '#22c55e' : '#ef4444' }}>
              {change}
            </span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{renderAmount(value)}</p>
      <p className="text-[11px] text-white/40 font-medium">{label}</p>
    </div>
  );
}
