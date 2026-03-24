import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Link2, ExternalLink, Video, CheckCircle, XCircle, Trash2, ChevronDown, Search, X, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getSubmittedVideos, removeSubmittedVideo, subscribeCreatorCampaigns, type SubmittedVideo } from '@/shared/lib/useCreatorCampaigns';
import GrapeLoader from '../components/GrapeLoader';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import { supabase } from '@/shared/infrastructure/supabase';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const platformLabel: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export default function MyVideosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [dbVideos, setDbVideos] = useState<SubmittedVideo[]>([]);

  const [, forceUpdate] = useState(0);
  const memoryVideos = getSubmittedVideos();

  const submittedVideos = useMemo(() => {
    return [...dbVideos.map((dbV) => {
      const mem = memoryVideos.find((m) => m.id === dbV.id);
      return mem ?? dbV;
    }), ...memoryVideos.filter((m) => !dbVideos.find((d) => d.id === m.id))];
  }, [dbVideos, memoryVideos]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function fetchDbVideos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }
      const { data } = await supabase
        .from('video_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
      if (cancelled) return;
      if (data) {
        setDbVideos(data.map((row) => ({
          id: row.id,
          campaignId: row.campaign_id,
          campaignName: row.campaign_name,
          brand: row.brand,
          campaignPhoto: row.campaign_photo,
          platform: row.platform,
          videoUrl: row.video_url,
          submittedAt: new Date(row.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: row.status as SubmittedVideo['status'],
        })));
      }
      setLoading(false);
    }

    fetchDbVideos();
    const unsub = subscribeCreatorCampaigns(() => forceUpdate((n) => n + 1));
    return () => { cancelled = true; unsub(); };
  }, []);

  const handleDelete = async (video: SubmittedVideo) => {
    const isDbVideo = dbVideos.some((v) => v.id === video.id);
    if (isDbVideo) {
      await supabase.from('video_submissions').delete().eq('id', video.id);
      setDbVideos((prev) => prev.filter((v) => v.id !== video.id));
    } else {
      removeSubmittedVideo(video.id);
      forceUpdate((n) => n + 1);
    }
  };

  const filteredVideos = submittedVideos.filter((v) => {
    const matchesPlatform =
      selectedPlatforms.size === 0 || selectedPlatforms.has(v.platform);
    const matchesSearch =
      !searchQuery.trim() ||
      v.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

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

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar activePage="home" onOpenSearch={() => {}} />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Videos en cours de verification</h1>
              <p className="text-sm text-white/40 mt-0.5">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} soumise{filteredVideos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-5 lg:pt-8">
          <VideosFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={(p) => {
              setSelectedPlatforms((prev) => {
                const next = new Set(prev);
                next.has(p) ? next.delete(p) : next.add(p);
                return next;
              });
            }}
            onResetAll={() => {
              setSearchQuery('');
              setSelectedPlatforms(new Set());
            }}
          />
        </div>

        <div className="px-4 sm:px-6 mt-6 pb-12">
          {filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Video className="w-6 h-6 text-white/25" />
              </div>
              <p className="text-white/40 text-sm font-medium">Aucune vidéo trouvée</p>
              <p className="text-white/20 text-xs mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onDelete={
                    video.status !== 'in_review'
                      ? () => handleDelete(video)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, onDelete }: { video: SubmittedVideo; onDelete?: () => void }) {
  const statusConfig = {
    in_review: {
      icon: <Clock className="w-3 h-3" style={{ color: '#fb923c' }} />,
      label: 'En attente',
    },
    approved: {
      icon: <CheckCircle className="w-3 h-3" style={{ color: '#4ade80' }} />,
      label: 'Approuvee',
    },
    rejected: {
      icon: <XCircle className="w-3 h-3" style={{ color: '#f87171' }} />,
      label: 'Refusee',
    },
  };

  const config = statusConfig[video.status];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${onDelete ? 'flex-1 min-w-0' : 'w-full'} rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.003]`}
        style={{
          background: 'rgba(10,10,15,1)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
          opacity: video.status === 'rejected' ? 0.6 : 1,
        }}
      >
        <div className="flex items-stretch h-[120px]">
          <div className="relative w-28 sm:w-36 shrink-0 h-full">
            <img
              src={video.campaignPhoto}
              alt={video.campaignName}
              className={`w-full h-full object-cover ${video.status === 'rejected' ? 'grayscale' : ''}`}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          </div>

          <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{video.brand}</p>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{video.campaignName}</h3>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                {config.icon}
                <span className="text-[10px] font-bold text-white">{config.label}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {platformIconMap[video.platform] && (
                  <img src={platformIconMap[video.platform]} alt={video.platform} className="w-3.5 h-3.5 brightness-0 invert opacity-50" />
                )}
                <span className="text-[10px] text-white/40">{platformLabel[video.platform] ?? video.platform}</span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[10px] text-white/30">Soumise le {video.submittedAt}</span>
              </div>

              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voir la video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            height: '80px',
            background: 'rgba(10,10,15,1)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(10,10,15,1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
          }}
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}

const statusOptions = ['Tous', 'En attente', 'Approuvee', 'Refusee'];
const categoryOptions = ['UGC', 'Clipping'];
const categoryColors: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};

interface VideosFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPlatforms: Set<string>;
  onTogglePlatform: (p: string) => void;
  onResetAll: () => void;
}

function VideosFilterBar({ searchQuery, onSearchChange, selectedPlatforms, onTogglePlatform, onResetAll }: VideosFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getFilterLabel = (filter: string) => {
    if (filter === 'Statut' && selectedStatus) return selectedStatus;
    if (filter === 'Categories' && selectedCategory) return selectedCategory;
    return filter;
  };

  const hasActiveValue = (filter: string) => {
    if (filter === 'Statut') return !!selectedStatus;
    if (filter === 'Categories') return !!selectedCategory;
    return false;
  };

  const hasAnyFilter = useMemo(
    () => !!selectedStatus || !!selectedCategory || selectedPlatforms.size > 0 || searchQuery.trim() !== '',
    [selectedStatus, selectedCategory, selectedPlatforms, searchQuery]
  );

  const resetAll = () => {
    setSelectedStatus(null);
    setSelectedCategory(null);
    setOpenDropdown(null);
    onResetAll();
  };

  const dropdownBg: React.CSSProperties = {
    background: 'rgba(30, 28, 28, 0.55)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
  };

  return (
    <div ref={dropdownRef}>
      <div className="hidden lg:flex flex-wrap items-center gap-3">
        {['Statut', 'Categories'].map((filter) => (
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

            {openDropdown === filter && filter === 'Statut' && (
              <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden" style={dropdownBg}>
                <div className="pt-1.5" />
                {statusOptions.map((option) => {
                  const isSelected = (selectedStatus || 'Tous') === option;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedStatus(option === 'Tous' ? null : option);
                        setOpenDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold transition-all duration-200"
                      style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: isSelected ? '#fff' : 'rgba(255,255,255,0.2)', boxShadow: isSelected ? '0 0 6px rgba(255,255,255,0.6)' : 'none' }}
                        />
                        {option}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-white" />}
                    </button>
                  );
                })}
                <div className="pb-1.5" />
              </div>
            )}

            {openDropdown === filter && filter === 'Categories' && (
              <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden" style={dropdownBg}>
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
          </div>
        ))}

        {hasAnyFilter && (
          <button
            onClick={resetAll}
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
              onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onTogglePlatform(key)}
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
      </div>

      <div className="lg:hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onTogglePlatform(key)}
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
      </div>
    </div>
  );
}
