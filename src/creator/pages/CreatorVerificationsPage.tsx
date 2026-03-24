import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ExternalLink, Eye, Link2, Play, Megaphone, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import GrapeLoader from '../components/GrapeLoader';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';
import Sidebar from '../components/Sidebar';

interface Campaign {
  id: string;
  name: string;
  photo_url: string | null;
  platforms: string[];
  content_type: string | null;
}

interface CreatorApplication {
  id: string;
  username: string;
  avatar: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  verified: boolean;
  bio: string;
  videoUrls: { url: string; label: string }[];
  socials: {
    platform: 'instagram' | 'tiktok' | 'youtube';
    handle: string;
    views: string;
  }[];
}

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

const mockCreators: CreatorApplication[] = [
  {
    id: 'c1',
    username: 'maxcreates',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    platform: 'instagram',
    verified: true,
    bio: 'Content creator spécialisé en lifestyle & tech. Je crée du contenu authentique pour les marques qui veulent toucher la Gen Z.',
    videoUrls: [
      { url: 'https://www.instagram.com/reel/ABC123', label: 'Reel - Unboxing iPhone 17' },
      { url: 'https://www.instagram.com/reel/DEF456', label: 'Reel - Review produit' },
    ],
    socials: [
      { platform: 'instagram', handle: '@maxcreates', views: '2,356,093' },
      { platform: 'tiktok', handle: '@maxcreates.tk', views: '5,842,710' },
      { platform: 'youtube', handle: '@MaxCreatesYT', views: '1,203,487' },
    ],
  },
  {
    id: 'c2',
    username: 'sarahvibes',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    platform: 'tiktok',
    verified: false,
    bio: 'Passionnée de mode et beauté. 3 ans d\'expérience en UGC avec des marques comme Sephora et Zara.',
    videoUrls: [
      { url: 'https://www.tiktok.com/@sarahvibes/video/789', label: 'TikTok - GRWM Sephora haul' },
    ],
    socials: [
      { platform: 'tiktok', handle: '@sarahvibes', views: '8,120,340' },
      { platform: 'instagram', handle: '@sarah.vibes', views: '1,450,200' },
    ],
  },
  {
    id: 'c3',
    username: 'techwithleo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    platform: 'youtube',
    verified: true,
    bio: 'Tech reviewer & unboxer. Je teste les derniers gadgets et je partage mon avis honnête avec ma communauté.',
    videoUrls: [
      { url: 'https://www.youtube.com/watch?v=xyz123', label: 'YouTube - Top 10 gadgets 2025' },
      { url: 'https://www.youtube.com/watch?v=abc456', label: 'YouTube - Unboxing PS6' },
      { url: 'https://www.youtube.com/shorts/short1', label: 'Short - Quick review AirPods' },
    ],
    socials: [
      { platform: 'youtube', handle: '@TechWithLeo', views: '12,450,000' },
      { platform: 'instagram', handle: '@techwithleo', views: '890,320' },
      { platform: 'tiktok', handle: '@techwithleo', views: '3,210,500' },
    ],
  },
];

export default function CreatorVerificationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<CreatorApplication | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'rejected'>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, photo_url, platforms, content_type')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) setCampaign(data);
      setLoading(false);
    };
    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (mockCreators.length > 0 && !selectedCreator) {
      setSelectedCreator(mockCreators[0]);
    }
  }, []);

  const markDecision = (creatorId: string, decision: 'accepted' | 'rejected') => {
    const newDecisions = { ...decisions, [creatorId]: decision };
    setDecisions(newDecisions);
    setRejecting(null);
    setRejectReason('');

    const remaining = mockCreators.filter((c) => !newDecisions[c.id]);
    if (remaining.length > 0) {
      const nextPending = remaining.find((c) => c.id !== creatorId) || remaining[0];
      setSelectedCreator(nextPending);
    } else {
      setSelectedCreator(null);
    }
  };

  const handleAccept = (creatorId: string) => {
    markDecision(creatorId, 'accepted');
  };

  const handleReject = (creatorId: string) => {
    if (rejecting === creatorId && rejectReason.trim()) {
      markDecision(creatorId, 'rejected');
    } else {
      setRejecting(creatorId);
    }
  };

  const pendingCreators = mockCreators.filter((c) => !decisions[c.id]);
  const allDecided = pendingCreators.length === 0 && mockCreators.length > 0;

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

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="relative h-56 lg:h-64 overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 pb-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{campaign.name}</h1>
            {campaign.platforms && campaign.platforms.length > 0 && (
              <div className="flex items-center gap-1.5">
                {campaign.platforms.map((p) =>
                  platformIcons[p] ? (
                    <div
                      key={p}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <img src={platformIcons[p]} alt={platformLabels[p] || p} className="w-4 h-4 social-icon" />
                    </div>
                  ) : null
                )}
              </div>
            )}
            {campaign.content_type && (() => {
              const lower = campaign.content_type!.toLowerCase();
              const isUgc = lower === 'ugc';
              const isClipping = lower === 'clipping';
              if (!isUgc && !isClipping) return null;
              const tagStyle: React.CSSProperties = isUgc
                ? { background: 'rgba(255,0,217,0.12)', border: '1px solid rgba(255,0,217,0.3)', color: '#FF00D9' }
                : { background: 'rgba(57,31,154,0.12)', border: '1px solid rgba(57,31,154,0.3)', color: '#a78bfa' };
              return (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={tagStyle}>
                  {campaign.content_type}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white/40 font-medium">Video createur a verifier</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 340px)' }}>
          <div className="flex-1 min-w-0 lg:pr-6">
            {allDecided ? (
              <div className="flex flex-col items-center justify-center py-20">
                <CheckCircle2 className="w-10 h-10 mb-5 animate-bounce text-white" style={{ animationDuration: '2s' }} />
                <p className="text-base font-semibold text-white/50 mb-2">Aucune video a verifier</p>
                <p className="text-sm text-white/25 text-center max-w-sm">
                  Toutes les candidatures ont ete traitees.
                </p>
                <button
                  onClick={() => navigate('/validation-videos')}
                  className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Retour aux campagnes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    isSelected={selectedCreator?.id === creator.id}
                    isRejecting={rejecting === creator.id}
                    rejectReason={rejectReason}
                    onSelect={(c) => {
                      setSelectedCreator(c);
                      if (rejecting !== c.id) setRejecting(null);
                    }}
                    onViewProfile={(c) => navigate(`/createur/${c.id}`, { state: { from: location.pathname } })}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onRejectReasonChange={setRejectReason}
                    onCancelReject={() => {
                      setRejecting(null);
                      setRejectReason('');
                    }}
                  />
                ))}

                {mockCreators.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-base font-semibold text-white/30 mb-2">Aucun createur a verifier</p>
                    <p className="text-sm text-white/15 text-center max-w-sm">
                      Les createurs qui postulent apparaitront ici.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block w-[380px] shrink-0 ml-8">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.055)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-center gap-2.5 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Eye className="w-4 h-4 text-white/70" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Apercu</h2>
              </div>
              <div className="p-4">
                {selectedCreator ? (
                  <CreatorProfilePreview creator={selectedCreator} />
                ) : (
                  <div
                    className="rounded-xl p-8 flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      minHeight: '300px',
                    }}
                  >
                    <Eye className="w-8 h-8 text-white/10 mb-3" />
                    <p className="text-sm text-white/20 text-center font-medium">
                      Aucun aperçu pour le moment
                    </p>
                    <p className="text-xs text-white/10 text-center mt-1.5">
                      {allDecided
                        ? 'Toutes les candidatures ont été traitées'
                        : 'Sélectionnez un créateur pour voir son profil'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

interface CreatorCardProps {
  creator: CreatorApplication;
  isSelected: boolean;
  isRejecting: boolean;
  rejectReason: string;
  onSelect: (c: CreatorApplication) => void;
  onViewProfile: (c: CreatorApplication) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRejectReasonChange: (val: string) => void;
  onCancelReject: () => void;
}

function CreatorCard({
  creator,
  isSelected,
  isRejecting,
  rejectReason,
  onSelect,
  onViewProfile,
  onAccept,
  onReject,
  onRejectReasonChange,
  onCancelReject,
}: CreatorCardProps) {
  return (
    <div>
      <button
        onClick={() => onSelect(creator)}
        className={`w-full rounded-2xl p-5 transition-all duration-200 text-left ${
          isSelected ? 'ring-1 ring-white/20' : 'hover:bg-white/[0.03]'
        }`}
        style={{
          backgroundColor: isSelected ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.055)',
          border: `1px solid ${isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            onClick={(e) => { e.stopPropagation(); onViewProfile(creator); }}
            className="shrink-0 cursor-pointer"
          >
            <img
              src={creator.avatar}
              alt={creator.username}
              className="w-14 h-14 rounded-xl object-cover hover:opacity-80 transition-opacity"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">@{creator.username}</p>
              {creator.verified && (
                <img src={verifiedIcon} alt="Verified" className="w-[23px] h-[23px]" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <img src={platformIcons[creator.platform]} alt={creator.platform} className="w-3.5 h-3.5 social-icon" />
              <span className="text-xs text-white/40">{platformLabels[creator.platform]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onReject(creator.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,75,75,0.08)',
                border: '1px solid rgba(255,75,75,0.2)',
              }}
            >
              <X className="w-4 h-4" style={{ color: '#FF4B4B' }} />
            </button>
            <button
              onClick={() => onAccept(creator.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(100,250,81,0.08)',
                border: '1px solid rgba(100,250,81,0.2)',
              }}
            >
              <Check className="w-4 h-4" style={{ color: '#64FA51' }} />
            </button>
          </div>
        </div>

        {creator.videoUrls.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="w-3 h-3 text-white/25" />
              <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">
                Videos soumises
              </span>
            </div>
            <div className="space-y-1.5">
              {creator.videoUrls.map((video, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 group/link"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(video.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <Play className="w-3 h-3 text-white/30" />
                  </div>
                  <span className="text-xs text-white/40 truncate group-hover/link:text-white/70 transition-colors">
                    {video.label}
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/15 shrink-0 group-hover/link:text-white/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </button>

      {isRejecting && (
        <div
          className="mt-2 rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255,75,75,0.04)',
            border: '1px solid rgba(255,75,75,0.12)',
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#FF4B4B' }}>
            Raison du refus
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="Expliquez pourquoi vous refusez ce créateur..."
            rows={3}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/30"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onCancelReject}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white/70 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onReject(creator.id)}
              disabled={!rejectReason.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: rejectReason.trim() ? 'rgba(255,75,75,0.15)' : 'rgba(255,75,75,0.05)',
                color: '#FF4B4B',
                border: '1px solid rgba(255,75,75,0.2)',
              }}
            >
              Confirmer le refus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatorProfilePreview({ creator }: { creator: CreatorApplication }) {
  return (
    <div
      className="rounded-xl overflow-hidden sticky top-24"
    >
      <div
        className="h-20 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      />

      <div className="px-5 -mt-10">
        <img
          src={creator.avatar}
          alt={creator.username}
          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#1D1C1C]"
          style={{ border: '2px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      <div className="px-5 pt-3 pb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">@{creator.username}</h3>
          {creator.verified && (
            <img src={verifiedIcon} alt="Verified" className="w-[29px] h-[29px]" />
          )}
        </div>

        <p className="text-xs text-white/35 mt-2 leading-relaxed">{creator.bio}</p>

        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-3">Reseaux sociaux</p>
          <div className="space-y-2.5">
            {creator.socials.map((social) => (
              <div
                key={social.platform}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <img
                  src={platformIcons[social.platform]}
                  alt={social.platform}
                  className="w-5 h-5 shrink-0 social-icon"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{social.handle}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Eye className="w-3 h-3 text-white/25" />
                    <span className="text-[11px] text-white/35 font-medium">{social.views} vues</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/15 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Total vues</span>
            <span className="text-sm font-bold text-white">
              {formatTotalViews(creator.socials)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTotalViews(socials: CreatorApplication['socials']): string {
  const total = socials.reduce((sum, s) => {
    const num = parseFloat(s.views.replace(/,/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `${(total / 1_000).toFixed(0)}K`;
  return total.toString();
}
