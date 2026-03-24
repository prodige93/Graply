import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, CheckCircle, XCircle, ChevronRight, Megaphone, Users } from 'lucide-react';
import { openVerifyModal } from '@/shared/lib/verifyEvent';
import Sidebar from '../components/Sidebar';
import GrapeLoader from '../components/GrapeLoader';
import FilterBar, { defaultFilterState, type FilterState } from '../components/FilterBar';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';
import { supabase } from '@/shared/infrastructure/supabase';

const platformIconMap: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

type VideoStatus = 'in_review' | 'approved' | 'rejected';

interface SubmittedVideo {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignPhoto: string;
  brand: string;
  platform: string;
  videoUrl: string;
  submittedAt: string;
  status: VideoStatus;
  ratePerK: string;
}

interface ApplicationRow {
  id: string;
  name: string;
  brand: string;
  photo: string;
  platforms: string[];
  ratePerK: string;
  applicantsCount: number;
  appliedAt: string;
  appStatus: 'pending' | 'accepted' | 'rejected';
}

const mockVideos: SubmittedVideo[] = [
  {
    id: 'v1',
    campaignId: 'pumpfun-launch',
    campaignName: 'Pump.fun Launch Campaign',
    campaignPhoto: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Pump.fun',
    platform: 'tiktok',
    videoUrl: 'https://www.tiktok.com/@user/video/7123456789',
    submittedAt: '13 mars 2026',
    status: 'in_review',
    ratePerK: '$1.25',
  },
  {
    id: 'v2',
    campaignId: 'apple-iphone17-ugc',
    campaignName: 'Apple — iPhone 17 Pro Max UGC',
    campaignPhoto: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Apple',
    platform: 'instagram',
    videoUrl: 'https://www.instagram.com/reel/abc123',
    submittedAt: '11 mars 2026',
    status: 'approved',
    ratePerK: '$0.20',
  },
  {
    id: 'v3',
    campaignId: 'cod-bo7-clipping',
    campaignName: 'Call of Duty BO7 Official Clipping',
    campaignPhoto: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Activision',
    platform: 'tiktok',
    videoUrl: 'https://www.tiktok.com/@user/video/9876543210',
    submittedAt: '9 mars 2026',
    status: 'rejected',
    ratePerK: '$0.18',
  },
];

function StatusBadge({ status }: { status: VideoStatus }) {
  if (status === 'in_review') {
    return (
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ background: 'rgba(251,191,36,0.12)', color: '#FBbf24', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <Clock className="w-3 h-3" />
        En cours
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ background: 'rgba(100,250,81,0.1)', color: '#64FA51', border: '1px solid rgba(100,250,81,0.2)' }}
      >
        <CheckCircle className="w-3 h-3" />
        Approuvee
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      <XCircle className="w-3 h-3" />
      Refusee
    </span>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
      >
        {count}
      </span>
    </div>
  );
}

export default function CreatorValidationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [dbApplications, setDbApplications] = useState<ApplicationRow[]>([]);
  const updateFilters = (partial: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('campaign_applications')
        .select(`
          id,
          status,
          created_at,
          campaigns (
            id,
            name,
            photo_url,
            platforms,
            rate_per_view
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const rows: ApplicationRow[] = ((data ?? []) as unknown as Array<{
        id: string;
        status: string;
        created_at: string;
        campaigns: {
          id: string;
          name: string;
          photo_url: string;
          platforms: string[];
          rate_per_view: string;
        } | null;
      }>)
        .filter((row) => row.campaigns)
        .map((row) => {
          const c = row.campaigns!;
          const date = new Date(row.created_at);
          const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          return {
            id: c.id,
            name: c.name,
            brand: '',
            photo: c.photo_url ?? '',
            platforms: c.platforms ?? [],
            ratePerK: c.rate_per_view ?? '',
            applicantsCount: 0,
            appliedAt: formatted,
            appStatus: (row.status as 'pending' | 'accepted' | 'rejected') ?? 'pending',
          };
        });

      setDbApplications(rows);
      setLoading(false);
    })();
  }, []);

  const { searchQuery, selectedPlatforms } = filters;

  const videos = useMemo(() => {
    return mockVideos.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!v.campaignName.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q)) return false;
      }
      if (selectedPlatforms.size > 0 && !selectedPlatforms.has(v.platform)) return false;
      return true;
    });
  }, [searchQuery, selectedPlatforms]);

  const filteredApplications = useMemo(() => {
    return dbApplications.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.brand.toLowerCase().includes(q)) return false;
      }
      if (selectedPlatforms.size > 0 && !a.platforms.some((p) => selectedPlatforms.has(p))) return false;
      return true;
    });
  }, [dbApplications, searchQuery, selectedPlatforms]);

  if (loading) {
    return (
      <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
        <Sidebar activePage="validation-videos" onOpenSearch={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <GrapeLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar activePage="validation-videos" onOpenSearch={() => {}} />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Mes validations</h1>
              <p className="text-sm text-white/40 mt-0.5">Videos soumises et candidatures en cours</p>
              <button
                onClick={() => openVerifyModal()}
                className="lg:hidden group relative flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden mt-5"
                style={{ background: '#FFA672' }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="font-bold text-sm relative z-10 text-white flex items-center gap-2"><img src={chCircleIcon} alt="" className="w-4 h-4" />Verifier ma video</span>
              </button>
            </div>
            <button
              onClick={() => openVerifyModal()}
              className="hidden lg:flex group relative items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden shrink-0"
              style={{ background: '#FFA672' }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-bold text-sm relative z-10 text-white flex items-center gap-2"><img src={chCircleIcon} alt="" className="w-4 h-4" />Verifier ma video</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

          <div className="mb-6">
            <FilterBar filters={filters} onChange={updateFilters} />
          </div>

          <div className="mb-10">
            <SectionHeader
              icon={<Video className="w-4 h-4 text-white/70" />}
              title="Videos en cours de validation"
              count={videos.length}
            />
            {videos.length === 0 ? (
              <div
                className="rounded-xl p-8 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Video className="w-8 h-8 text-white/15" />
                <p className="text-sm text-white/30">Aucune video soumise pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                    style={{
                      background: 'rgba(255,255,255,0.055)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    <img
                      src={video.campaignPhoto}
                      alt={video.campaignName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] sm:text-sm font-semibold text-white truncate">{video.campaignName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {platformIconMap[video.platform] && (
                          <img src={platformIconMap[video.platform]} alt={video.platform} className="w-3.5 h-3.5 social-icon opacity-60 shrink-0" />
                        )}
                        <p className="text-xs text-white/35 truncate hidden sm:block">{video.videoUrl}</p>
                        <p className="text-[11px] text-white/25 sm:hidden">{video.submittedAt}</p>
                      </div>
                      <p className="text-[11px] text-white/25 mt-0.5 hidden sm:block">{video.submittedAt} · {video.ratePerK}/1K vues</p>
                    </div>
                    <StatusBadge status={video.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader
              icon={<Megaphone className="w-4 h-4 text-white/70" />}
              title="Campagnes ou j'ai postule"
              count={filteredApplications.length}
            />
            {filteredApplications.length === 0 ? (
              <div
                className="rounded-xl p-8 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Megaphone className="w-8 h-8 text-white/15" />
                <p className="text-sm text-white/30">Aucune candidature pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => navigate(`/campagne/${app.id}`)}
                    className="w-full group rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all duration-200 text-left"
                    style={{
                      background: 'rgba(255,255,255,0.055)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                  >
                    <img
                      src={app.photo}
                      alt={app.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] sm:text-sm font-semibold text-white truncate">{app.name}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {app.platforms.map((p) =>
                            platformIconMap[p] ? (
                              <div
                                key={p}
                                className="w-5 h-5 rounded-md flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                              >
                                <img src={platformIconMap[p]} alt={p} className="w-3 h-3 social-icon" />
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 mt-1">
                        {app.ratePerK && <p className="text-xs text-white/35">{app.ratePerK}/1K</p>}
                        <span className="text-white/15 hidden sm:inline">·</span>
                        <p className="text-xs text-white/25 hidden sm:block">{app.appliedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {app.appStatus === 'pending' ? (
                        <span
                          className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap"
                          style={{ background: 'rgba(251,191,36,0.12)', color: '#FBbf24', border: '1px solid rgba(251,191,36,0.2)' }}
                        >
                          En attente
                        </span>
                      ) : app.appStatus === 'accepted' ? (
                        <span
                          className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap"
                          style={{ background: 'rgba(100,250,81,0.1)', color: '#64FA51', border: '1px solid rgba(100,250,81,0.2)' }}
                        >
                          Accepte
                        </span>
                      ) : (
                        <span
                          className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          Refuse
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors hidden sm:block" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
