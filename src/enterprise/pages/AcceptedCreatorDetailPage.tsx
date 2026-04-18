import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import {
  ArrowLeft,
  Eye,
  DollarSign,
  Video,
  Megaphone,
  ExternalLink,
  UserCheck,
  Search,
  ChevronsUpDown,
  X,
  ArrowUpRight as SortIcon,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import { renderAmount } from '@/shared/utils/chartUtils';
import StatsChart from '@/enterprise/components/StatsChart';
import {
  fetchAcceptedCreatorsSummary,
  ENTERPRISE_DEMO_CREATOR_USER_ID,
  type VideoSubmissionRow,
  type ProfileRow,
  type PrivateApplicationAcceptedRow,
} from '@/enterprise/lib/fetchAcceptedCreatorsForOwner';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

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

const campaignRowStatGlass: CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
};

/** Bandeau gris sous le nom de campagne (statut visibilité). */
const campaignVisibilityBarGlass: CSSProperties = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
};

function CampaignStatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex h-9 min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-lg px-2 sm:h-10 sm:min-w-[3.75rem]"
      style={campaignRowStatGlass}
    >
      <span className="text-[7px] font-semibold uppercase tracking-wide text-white/38 sm:text-[8px]">{label}</span>
      <span className="text-[11px] font-bold tabular-nums leading-none text-white sm:text-xs">{value}</span>
    </div>
  );
}

function CampaignVisibilityMini({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className="mt-1 inline-flex max-w-full items-center rounded-md px-1.5 py-px text-[7.5px] font-semibold leading-none tracking-tight sm:mt-1.5 sm:rounded-lg sm:px-2 sm:py-[2px] sm:text-[8.5px]"
      style={{
        ...campaignVisibilityBarGlass,
        color: isPublic ? '#4ade80' : '#f87171',
      }}
    >
      {isPublic ? 'Publique' : 'Privée'}
    </span>
  );
}

/** Pastille ronde réseau (même esprit que `DashboardPage` / cartes campagnes). */
const videoRowPlatformOrbStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: 'rgba(20,20,28,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

/** Verre pour le switch Vues / Gains du graphe (piste + curseur). */
const chartMetricTrackGlass: CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.16)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.25)',
};

function platformDisplayName(platform: string): string {
  const p = platform.toLowerCase().trim();
  if (p === 'instagram') return 'Instagram';
  if (p === 'tiktok') return 'TikTok';
  if (p === 'youtube') return 'YouTube';
  return platform.trim() || 'Vidéo';
}

function fallbackSubmissionVideoTitle(row: VideoSubmissionRow): string {
  const label = platformDisplayName(row.platform);
  const d = new Date(row.submitted_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Vidéo ${label} · ${d}`;
}

function resolvedVideoTitle(row: VideoSubmissionRow): string {
  const t = (row.video_title ?? '').trim();
  if (t) return t;
  return fallbackSubmissionVideoTitle(row);
}

/** Affichage date d’acceptation (proxy : `submitted_at` — pas de `approved_at` en base). */
function formatVideoAcceptedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatNumber(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString('fr-FR');
}

function formatMoney(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M $`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K $`;
  return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`;
}

function atHandle(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.startsWith('@') ? t : `@${t}`;
}

/** Même format chiffres que le dashboard entreprise (libellés du graphe). */
function formatNumberChart(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

/** Courbe identique au dashboard (points synthétiques, échelle liée aux totaux du créateur). */
function buildCreatorChartData(
  chartPeriod: string,
  anchor: number,
): { label: string; views: number; earned: number }[] {
  const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const totalBudget = Math.max(1000, anchor);

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
      return { label: i === 6 ? 'Auj.' : `${DAY_NAMES[d.getDay()]} ${d.getDate()}`, views: p.views, earned: p.earned };
    });
  }
  if (chartPeriod === '1m') {
    const pts = generatePoints(4);
    return pts.map((p, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (3 - i) * 7);
      return { label: i === 3 ? 'Auj.' : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`, views: p.views, earned: p.earned };
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
}

function CreatorDetailPeriodSelector({
  periods,
  value,
  onChange,
}: {
  periods: string[];
  value: string;
  onChange: (p: string) => void;
}) {
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
      className="relative flex shrink-0 items-center rounded-full p-[3px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.15)',
      }}
    >
      <div
        className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          onClick={() => onChange(p)}
          className="relative z-10 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors duration-300"
          style={{ color: value === p ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

type DetailSortKey = 'performance' | 'date';

function CreatorDetailFilterBar({
  platforms,
  tablePlatform,
  setTablePlatform,
  tableSort,
  setTableSort,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
}: {
  platforms: string[];
  tablePlatform: string | null;
  setTablePlatform: (p: string | null) => void;
  tableSort: { key: DetailSortKey; dir: 'asc' | 'desc' } | null;
  setTableSort: (s: { key: DetailSortKey; dir: 'asc' | 'desc' } | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchPlaceholder: string;
}) {
  const hasFilters = Boolean(tablePlatform || tableSort || searchQuery.trim());
  const reset = () => {
    setTablePlatform(null);
    setTableSort(null);
    setSearchQuery('');
  };

  return (
    <>
      <div className="mb-4 flex min-w-0 items-center gap-2 sm:hidden">
        <div className="flex shrink-0 items-center gap-2">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{
                background: tablePlatform === p ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: tablePlatform === p ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1,
              }}
            >
              {platformIcons[p] ? (
                <img src={platformIcons[p]} alt={platformNames[p] || p} className="social-icon h-4 w-4" />
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="@…"
            autoComplete="off"
            className="h-8 w-full min-w-0 rounded-full border border-white/[0.1] bg-white/[0.04] py-0 pl-7 pr-2.5 text-[11px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06]"
            aria-label="Recherche"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const isActive = tableSort?.key === 'date';
            if (!isActive) {
              setTableSort({ key: 'date', dir: 'desc' });
            } else {
              setTableSort({ key: 'date', dir: tableSort!.dir === 'desc' ? 'asc' : 'desc' });
            }
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: tableSort?.key === 'date' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: tableSort?.key === 'date' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <SortIcon
            className="h-4 w-4 transition-transform duration-300"
            style={{
              color: tableSort?.key === 'date' ? '#fff' : 'rgba(255,255,255,0.4)',
              transform: tableSort?.key === 'date' && tableSort.dir === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      <div className="mb-0 hidden min-w-0 items-center gap-3 sm:flex">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTablePlatform(tablePlatform === p ? null : p)}
              className="flex h-7 items-center gap-1.5 rounded-full px-3 transition-all duration-200"
              style={{
                background: tablePlatform === p ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: tablePlatform === p ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                opacity: tablePlatform && tablePlatform !== p ? 0.4 : 1,
              }}
            >
              {platformIcons[p] ? (
                <img src={platformIcons[p]} alt={platformNames[p] || p} className="social-icon h-3.5 w-3.5" />
              ) : null}
              <span className="text-[11px] font-semibold" style={{ color: tablePlatform === p ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                {platformNames[p] || p}
              </span>
            </button>
          ))}
          {platforms.length > 0 ? <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} /> : null}
          {(['performance', 'date'] as const).map((key) => {
            const isActive = tableSort?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!isActive) {
                    setTableSort({ key, dir: 'desc' });
                  } else {
                    setTableSort({ key, dir: tableSort!.dir === 'desc' ? 'asc' : 'desc' });
                  }
                }}
                className="flex h-7 items-center gap-1.5 rounded-full px-3 transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-[11px] font-semibold capitalize" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                  {key === 'performance' ? 'Performance' : 'Date'}
                </span>
                <ChevronsUpDown className="h-3 w-3 transition-colors" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }} />
              </button>
            );
          })}
          {hasFilters ? (
            <>
              <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <button
                type="button"
                onClick={reset}
                className="flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            </>
          ) : null}
        </div>
        <div className="relative w-52 shrink-0 sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className="h-7 w-full rounded-full border border-white/[0.1] bg-white/[0.04] py-0 pl-8 pr-3 text-[11px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06]"
            aria-label="Recherche"
          />
        </div>
      </div>
    </>
  );
}

/** Données d’aperçu pour la ligne démo du dashboard (même id que `ENTERPRISE_DEMO_CREATOR_USER_ID`). */
function getDemoCreatorPayload(): {
  profile: ProfileRow;
  submissions: VideoSubmissionRow[];
  privateApps: PrivateApplicationAcceptedRow[];
  campaignNames: Map<string, string>;
  campaignIsPublicById: Map<string, boolean>;
} {
  const uid = ENTERPRISE_DEMO_CREATOR_USER_ID;
  const campPublic = 'demo-campagne-publique';
  const campPrivate = 'demo-campagne-privee';
  const submitted = '2025-02-15T14:30:00.000Z';
  const names = new Map<string, string>([
    [campPublic, 'Lancement printemps'],
    [campPrivate, 'Collaboration boutique'],
  ]);
  const campaignIsPublicById = new Map<string, boolean>([
    [campPublic, true],
    [campPrivate, false],
  ]);
  return {
    profile: {
      id: uid,
      username: 'lena.ugc',
      display_name: 'Léa Martin',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      instagram_handle: '@lena.ugc',
      tiktok_handle: '@lenamartin',
      youtube_handle: null,
    },
    submissions: [
      {
        id: 'demo-sub-1',
        user_id: uid,
        campaign_id: campPublic,
        campaign_name: names.get(campPublic)!,
        platform: 'instagram',
        video_url: 'https://www.instagram.com',
        submitted_at: submitted,
        status: 'approved',
        view_count: 22_000,
        payout_amount: 64,
        video_title: 'Routine skincare — unboxing printemps (version longue pour vérifier le texte tronqué)',
      },
      {
        id: 'demo-sub-2',
        user_id: uid,
        campaign_id: campPublic,
        campaign_name: names.get(campPublic)!,
        platform: 'tiktok',
        video_url: 'https://www.tiktok.com',
        submitted_at: submitted,
        status: 'approved',
        view_count: 23_800,
        payout_amount: 64,
        video_title: 'POV : 3 produits indispensables',
      },
    ],
    privateApps: [
      {
        user_id: uid,
        campaign_id: campPrivate,
        created_at: '2025-01-10T09:00:00.000Z',
      },
    ],
    campaignNames: names,
    campaignIsPublicById,
  };
}

export default function AcceptedCreatorDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useEnterpriseNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [submissions, setSubmissions] = useState<VideoSubmissionRow[]>([]);
  const [privateApps, setPrivateApps] = useState<PrivateApplicationAcceptedRow[]>([]);
  const [campaignNames, setCampaignNames] = useState<Map<string, string>>(new Map());
  const [campaignIsPublicById, setCampaignIsPublicById] = useState<Map<string, boolean>>(new Map());
  const [chartPeriod, setChartPeriod] = useState<string>('6m');
  const [chartMetric, setChartMetric] = useState<'views' | 'earned'>('views');
  const [selectedCampaignForVideos, setSelectedCampaignForVideos] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  /** Même logique que `filterPlatform` en haut du `DashboardPage` (stats + graphe + données de base). */
  const [overviewPlatformFilter, setOverviewPlatformFilter] = useState<string | null>(null);
  const [campaignFilterPlatform, setCampaignFilterPlatform] = useState<string | null>(null);
  const [campaignFilterSort, setCampaignFilterSort] = useState<{ key: DetailSortKey; dir: 'asc' | 'desc' } | null>(null);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [videoFilterPlatform, setVideoFilterPlatform] = useState<string | null>(null);
  const [videoFilterSort, setVideoFilterSort] = useState<{ key: DetailSortKey; dir: 'asc' | 'desc' } | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      if (userId === ENTERPRISE_DEMO_CREATOR_USER_ID) {
        const demo = getDemoCreatorPayload();
        if (!cancelled) {
          setProfile(demo.profile);
          setSubmissions(demo.submissions);
          setPrivateApps(demo.privateApps);
          setCampaignNames(demo.campaignNames);
          setCampaignIsPublicById(demo.campaignIsPublicById);
          setLoading(false);
        }
        return;
      }

      const {
        submissions: allSubs,
        privateApplications: allPrivate,
        campaignNames: names,
        campaignIsPublicById: pubByCamp,
      } = await fetchAcceptedCreatorsSummary();
      if (cancelled) return;
      const mineSubs = allSubs.filter((s) => s.user_id === userId);
      const minePrivate = allPrivate.filter((a) => a.user_id === userId);
      if (mineSubs.length === 0 && minePrivate.length === 0) {
        setSubmissions([]);
        setPrivateApps([]);
        setProfile(null);
        setCampaignNames(names);
        setCampaignIsPublicById(pubByCamp);
        setLoading(false);
        return;
      }
      setSubmissions(mineSubs);
      setPrivateApps(minePrivate);
      setCampaignNames(names);
      setCampaignIsPublicById(pubByCamp);
      const { data: p } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, instagram_handle, tiktok_handle, youtube_handle')
        .eq('id', userId)
        .maybeSingle();
      if (!cancelled) setProfile((p as ProfileRow) ?? null);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const submissionsScoped = useMemo(() => {
    if (!overviewPlatformFilter) return submissions;
    const p = overviewPlatformFilter.toLowerCase();
    return submissions.filter((s) => s.platform.toLowerCase().trim() === p);
  }, [submissions, overviewPlatformFilter]);

  const byCampaign = useMemo(() => {
    const m = new Map<string, VideoSubmissionRow[]>();
    for (const s of submissionsScoped) {
      const k = s.campaign_id;
      const list = m.get(k) ?? [];
      list.push(s);
      m.set(k, list);
    }
    return m;
  }, [submissionsScoped]);

  const videoCampaignsSorted = useMemo(
    () =>
      [...byCampaign.entries()]
        .map(([id, vids]) => ({
          id,
          name: campaignNames.get(id) ?? vids[0]?.campaign_name ?? 'Campagne',
          vids,
          views: vids.reduce((s, x) => s + (Number(x.view_count) || 0), 0),
          payout: vids.reduce((s, x) => s + (Number(x.payout_amount) || 0), 0),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [byCampaign, campaignNames],
  );

  const videosForSelectedCampaign = useMemo(() => {
    if (!selectedCampaignForVideos) return [];
    return submissionsScoped.filter((s) => s.campaign_id === selectedCampaignForVideos);
  }, [submissionsScoped, selectedCampaignForVideos]);

  const selectedVideo = useMemo(
    () => (selectedVideoId ? submissionsScoped.find((s) => s.id === selectedVideoId) ?? null : null),
    [submissionsScoped, selectedVideoId],
  );

  const detailPlatforms = useMemo(() => {
    const s = new Set<string>();
    for (const v of submissions) {
      const p = v.platform.toLowerCase().trim();
      if (platformIcons[p]) s.add(p);
    }
    return (['instagram', 'tiktok', 'youtube'] as const).filter((p) => s.has(p)) as string[];
  }, [submissions]);

  const videoCampaignsFiltered = useMemo(() => {
    let rows = [...videoCampaignsSorted];
    if (campaignFilterPlatform) {
      rows = rows.filter((r) =>
        r.vids.some((v) => v.platform.toLowerCase().trim() === campaignFilterPlatform),
      );
    }
    const q = campaignSearchQuery.trim().toLowerCase();
    if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    if (campaignFilterSort?.key === 'performance') {
      const mul = campaignFilterSort.dir === 'desc' ? -1 : 1;
      rows.sort((a, b) => mul * (b.views - a.views));
    } else if (campaignFilterSort?.key === 'date') {
      const last = (vids: VideoSubmissionRow[]) =>
        vids.reduce((m, v) => Math.max(m, new Date(v.submitted_at).getTime()), 0);
      const mul = campaignFilterSort.dir === 'desc' ? -1 : 1;
      rows.sort((a, b) => mul * (last(b.vids) - last(a.vids)));
    }
    return rows;
  }, [videoCampaignsSorted, campaignFilterPlatform, campaignSearchQuery, campaignFilterSort]);

  const videosDisplayed = useMemo(() => {
    if (!selectedCampaignForVideos) return [];
    let list = [...videosForSelectedCampaign];
    if (videoFilterPlatform) {
      list = list.filter((v) => v.platform.toLowerCase().trim() === videoFilterPlatform);
    }
    const q = videoSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => {
        const title = resolvedVideoTitle(v).toLowerCase();
        return title.includes(q) || v.platform.toLowerCase().includes(q);
      });
    }
    if (videoFilterSort?.key === 'performance') {
      const mul = videoFilterSort.dir === 'desc' ? -1 : 1;
      list.sort((a, b) => mul * ((Number(b.view_count) || 0) - (Number(a.view_count) || 0)));
    } else if (videoFilterSort?.key === 'date') {
      const mul = videoFilterSort.dir === 'desc' ? -1 : 1;
      list.sort((a, b) => mul * (new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
    }
    return list;
  }, [videosForSelectedCampaign, selectedCampaignForVideos, videoFilterPlatform, videoSearchQuery, videoFilterSort]);

  useEffect(() => {
    if (selectedCampaignForVideos && !videoCampaignsFiltered.some((c) => c.id === selectedCampaignForVideos)) {
      setSelectedCampaignForVideos(null);
    }
  }, [selectedCampaignForVideos, videoCampaignsFiltered]);

  useEffect(() => {
    if (!selectedVideoId) return;
    if (!videosDisplayed.some((v) => v.id === selectedVideoId)) {
      setSelectedVideoId(null);
    }
  }, [selectedVideoId, videosDisplayed]);

  useEffect(() => {
    setSelectedVideoId(null);
  }, [selectedCampaignForVideos]);

  const totals = useMemo(() => {
    const totalViews = submissionsScoped.reduce((s, v) => s + (Number(v.view_count) || 0), 0);
    const totalPayout = submissionsScoped.reduce((s, v) => s + (Number(v.payout_amount) || 0), 0);
    return { totalViews, totalPayout, count: submissionsScoped.length, privateCount: privateApps.length };
  }, [submissionsScoped, privateApps]);

  const chartAnchor = useMemo(() => {
    if (selectedVideo) {
      const v = Number(selectedVideo.view_count) || 0;
      const p = Number(selectedVideo.payout_amount) || 0;
      return Math.max(1000, Math.round(v * 1.15 + p * 120));
    }
    return Math.max(1000, Math.round(totals.totalViews * 1.15 + totals.totalPayout * 120));
  }, [selectedVideo, totals.totalViews, totals.totalPayout]);

  const chartData = useMemo(() => buildCreatorChartData(chartPeriod, chartAnchor), [chartPeriod, chartAnchor]);

  const chartHeaderViews = useMemo(() => {
    if (selectedVideo) return Number(selectedVideo.view_count) || 0;
    return chartData.reduce((s, d) => s + d.views, 0);
  }, [selectedVideo, chartData]);

  const chartHeaderEarned = useMemo(() => {
    if (selectedVideo) return Number(selectedVideo.payout_amount) || 0;
    return chartData.reduce((s, d) => s + d.earned, 0);
  }, [selectedVideo, chartData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      </div>
    );
  }

  if (!userId || (submissions.length === 0 && privateApps.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-white" style={{ backgroundColor: '#050404' }}>
        <p className="mb-2 text-lg font-semibold">Créateur introuvable</p>
        <p className="mb-6 max-w-md text-center text-sm text-white/40">
          Aucune candidature acceptée sur vos campagnes privées ni vidéo approuvée sur vos campagnes publiques pour ce profil.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Retour au dashboard
        </button>
      </div>
    );
  }

  const profileUsername = (profile?.username ?? '').replace(/^@+/, '').trim();
  const profileHandleLabel = profileUsername ? atHandle(profileUsername) : '@—';

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="flex items-center border-b border-white/[0.06] px-4 pb-4 pt-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
          aria-label="Retour au dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {profile ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              disabled={!profileUsername}
              onClick={() => {
                if (profileUsername) navigate(`/u/${profileUsername}`);
              }}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:pointer-events-none disabled:opacity-40 sm:h-16 sm:w-16"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label={profileUsername ? `Voir le profil ${profileHandleLabel}` : 'Profil indisponible'}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-base font-bold text-white/40 sm:text-lg"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  {(profileUsername || '?').slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>
            <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-white sm:text-lg">
              {profileHandleLabel}
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOverviewPlatformFilter(null)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200"
              style={{
                background: !overviewPlatformFilter ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: !overviewPlatformFilter ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.15)',
                color: !overviewPlatformFilter ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <TrendingUp className="h-4 w-4" />
              Global
            </button>
            {detailPlatforms.length > 0 ? (
              <>
                <div className="h-6 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
                {detailPlatforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setOverviewPlatformFilter(overviewPlatformFilter === p ? null : p)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background:
                        overviewPlatformFilter === p ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                      border:
                        overviewPlatformFilter === p
                          ? '1px solid rgba(255,255,255,0.35)'
                          : '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      opacity: overviewPlatformFilter && overviewPlatformFilter !== p ? 0.4 : 1,
                      boxShadow:
                        overviewPlatformFilter === p
                          ? '0 0 18px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                    aria-label={platformNames[p] || p}
                  >
                    {platformIcons[p] ? (
                      <img src={platformIcons[p]} alt="" className="social-icon h-5 w-5" />
                    ) : null}
                  </button>
                ))}
              </>
            ) : null}
          </div>
          <CreatorDetailPeriodSelector periods={['all', '7j', '1m', '3m', '6m']} value={chartPeriod} onChange={setChartPeriod} />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: <Video className="h-4 w-4" />, label: 'Vidéos (publique)', value: String(totals.count) },
            { icon: <Eye className="h-4 w-4" />, label: 'Vues (suivi)', value: formatNumber(totals.totalViews) },
            { icon: <DollarSign className="h-4 w-4" />, label: 'Versé (suivi)', value: formatMoney(totals.totalPayout) },
            { icon: <UserCheck className="h-4 w-4" />, label: 'Privé — accepté', value: String(totals.privateCount) },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.055)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
              }}
            >
              <div className="mb-1 flex items-center gap-2 text-white/50">
                {card.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="text-2xl font-black text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {selectedVideo ? (
          <p
            className="truncate text-sm font-semibold tracking-tight text-white/80 sm:text-base"
            title={resolvedVideoTitle(selectedVideo)}
          >
            {resolvedVideoTitle(selectedVideo)}
          </p>
        ) : null}

        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.055)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
          }}
        >
          <div className="p-6 pb-4">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="mb-0.5 text-[9px] font-medium uppercase leading-none tracking-wider text-white/25">
                    {chartMetric === 'views' ? 'Total vues' : 'Total gains'}
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {renderAmount(
                      chartMetric === 'views' ? formatNumberChart(chartHeaderViews) : formatCurrency(chartHeaderEarned),
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <div className="relative flex rounded-full p-[3px]" style={chartMetricTrackGlass}>
                  <div
                    className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      width: 'calc(50% - 3px)',
                      left: chartMetric === 'views' ? '3px' : 'calc(50%)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setChartMetric('views')}
                    className="relative z-10 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 sm:gap-1.5 sm:px-5 sm:py-2.5 sm:text-[11px]"
                    style={{ color: chartMetric === 'views' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                  >
                    <Eye className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                    Vues
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('earned')}
                    className="relative z-10 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 sm:gap-1.5 sm:px-5 sm:py-2.5 sm:text-[11px]"
                    style={{ color: chartMetric === 'earned' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
                  >
                    <DollarSign className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                    Gains
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="px-4 py-6">
                <StatsChart data={chartData} metric={chartMetric} height={220} color="#8B5CF6" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.055)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85)',
          }}
        >
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Campagnes</h2>
            <CreatorDetailFilterBar
              platforms={detailPlatforms}
              tablePlatform={campaignFilterPlatform}
              setTablePlatform={setCampaignFilterPlatform}
              tableSort={campaignFilterSort}
              setTableSort={setCampaignFilterSort}
              searchQuery={campaignSearchQuery}
              setSearchQuery={setCampaignSearchQuery}
              searchPlaceholder="Rechercher une campagne…"
            />
          </div>
          {videoCampaignsSorted.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-white/30">Aucune vidéo validée sur une campagne publique.</p>
          ) : videoCampaignsFiltered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-white/30">Aucune campagne ne correspond à ces filtres.</p>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {videoCampaignsFiltered.map((row) => {
                const selected = selectedCampaignForVideos === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() =>
                      setSelectedCampaignForVideos((cur) => (cur === row.id ? null : row.id))
                    }
                    className="w-full rounded-xl p-3 text-left transition-all duration-200"
                    style={{
                      background: selected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                      border: selected ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <Megaphone className="h-4 w-4 text-white/20" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                          <CampaignVisibilityMini isPublic={campaignIsPublicById.get(row.id) !== false} />
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                        <CampaignStatPill label="Vidéos" value={String(row.vids.length)} />
                        <CampaignStatPill label="Vues" value={formatNumber(row.views)} />
                        <CampaignStatPill label="Gains" value={formatMoney(row.payout)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.055)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85)',
          }}
        >
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Vidéos</h2>
            <CreatorDetailFilterBar
              platforms={detailPlatforms}
              tablePlatform={videoFilterPlatform}
              setTablePlatform={setVideoFilterPlatform}
              tableSort={videoFilterSort}
              setTableSort={setVideoFilterSort}
              searchQuery={videoSearchQuery}
              setSearchQuery={setVideoSearchQuery}
              searchPlaceholder="Rechercher une vidéo…"
            />
          </div>
          {!selectedCampaignForVideos ? (
            <p className="px-5 py-10 text-center text-sm text-white/30">Aucune campagne sélectionnée.</p>
          ) : videosForSelectedCampaign.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-white/30">Aucune vidéo pour cette campagne.</p>
          ) : videosDisplayed.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-white/30">Aucune vidéo ne correspond à ces filtres.</p>
          ) : (
            <ul className="w-full divide-y divide-white/[0.06]">
              {videosDisplayed.map((vrow) => {
                const pKey = vrow.platform.toLowerCase().trim();
                const iconSrc = platformIcons[pKey];
                const displayTitle = resolvedVideoTitle(vrow);
                const views = Number(vrow.view_count) || 0;
                const payout = Number(vrow.payout_amount) || 0;
                const rowSelected = selectedVideoId === vrow.id;
                return (
                  <li
                    key={vrow.id}
                    className="w-full transition-colors duration-200"
                    style={
                      rowSelected
                        ? {
                            background: 'rgba(124,58,237,0.14)',
                            boxShadow: 'inset 0 0 0 1px rgba(167,139,250,0.45)',
                          }
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedVideoId((cur) => (cur === vrow.id ? null : vrow.id))}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-200 sm:gap-3.5 sm:py-4"
                    >
                    <div style={videoRowPlatformOrbStyle} title={platformDisplayName(vrow.platform)}>
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt=""
                          className="object-contain"
                          style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)', opacity: 0.88 }}
                        />
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-white/45">
                          {(pKey || '?').slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold tracking-tight text-white/92"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </p>
                      <p className="mt-1 text-left text-[11px] leading-snug text-white/38">
                        Acceptée le {formatVideoAcceptedDate(vrow.submitted_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-2">
                      <div
                        className="flex min-w-[3.25rem] flex-col rounded-xl px-2.5 py-2 sm:min-w-[3.5rem] sm:px-3"
                        style={campaignRowStatGlass}
                      >
                        <span className="text-[7px] font-semibold uppercase tracking-wide text-white/38">Vues</span>
                        <span className="text-[11px] font-bold tabular-nums leading-tight text-white sm:text-xs">
                          {formatNumber(views)}
                        </span>
                      </div>
                      <div
                        className="flex min-w-[3.5rem] flex-col rounded-xl px-2.5 py-2 sm:min-w-[3.75rem] sm:px-3"
                        style={campaignRowStatGlass}
                      >
                        <span className="text-[7px] font-semibold uppercase tracking-wide text-white/38">Gains</span>
                        <span className="text-[11px] font-bold tabular-nums leading-tight text-emerald-400/95 sm:text-xs">
                          {formatMoney(payout)}
                        </span>
                      </div>
                      {vrow.video_url ? (
                        <a
                          href={vrow.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Ouvrir la vidéo"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-violet-400 transition-colors hover:bg-white/[0.06] hover:text-violet-300"
                          style={campaignRowStatGlass}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
