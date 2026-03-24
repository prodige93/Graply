import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Check, X, ExternalLink, Eye, Megaphone, CheckCircle2, UserCheck } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import bcreateur from '@/shared/assets/badge-creator-verified.png';

interface Campaign {
  id: string;
  name: string;
  photo_url: string | null;
  platforms: string[];
  content_type: string | null;
}

interface CreatorRequest {
  id: string;
  username: string;
  avatar: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  verified: boolean;
  bio: string;
  motivation: string;
  socials: {
    platform: 'instagram' | 'tiktok' | 'youtube';
    handle: string;
    views: string;
  }[];
  isFromDb?: boolean;
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

const mockRequests: CreatorRequest[] = [
  {
    id: 'r1',
    username: 'emma.lifestyle',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    platform: 'instagram',
    verified: true,
    bio: 'Lifestyle & wellness content creator. Passionnee par le bien-etre et la mode ethique.',
    motivation: 'Je souhaite acceder aux ressources de cette campagne pour creer du contenu authentique qui correspond a ma communaute.',
    socials: [
      { platform: 'instagram', handle: '@emma.lifestyle', views: '1,850,000' },
      { platform: 'tiktok', handle: '@emmalifestyle', views: '3,200,000' },
    ],
  },
  {
    id: 'r2',
    username: 'jordan_tech',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    platform: 'youtube',
    verified: false,
    bio: 'Tech reviewer & gadget enthusiast. Je teste et partage les dernieres innovations tech.',
    motivation: 'Cette campagne correspond parfaitement a mon audience tech. J\'aimerais avoir acces aux fichiers pour produire un contenu de qualite.',
    socials: [
      { platform: 'youtube', handle: '@JordanTech', views: '6,450,000' },
      { platform: 'instagram', handle: '@jordan_tech', views: '920,000' },
      { platform: 'tiktok', handle: '@jordantech', views: '2,100,000' },
    ],
  },
];

export default function CreatorAccessValidationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useEnterpriseNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState<CreatorRequest[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorRequest | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'rejected'>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const [campaignRes, appsRes] = await Promise.all([
        supabase.from('campaigns').select('id, name, photo_url, platforms, content_type').eq('id', id).maybeSingle(),
        supabase
          .from('campaign_applications')
          .select('id, user_id, motivation, status')
          .eq('campaign_id', id)
          .eq('status', 'pending'),
      ]);

      if (campaignRes.data) setCampaign(campaignRes.data);

      const dbRequests: CreatorRequest[] = [];
      if (appsRes.data && appsRes.data.length > 0) {
        const userIds = appsRes.data.map((a: { user_id: string }) => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: { id: string; username: string; display_name: string; avatar_url: string; bio: string }) => [p.id, p]));

        for (const app of appsRes.data) {
          const profile = profileMap.get(app.user_id);
          dbRequests.push({
            id: app.id,
            username: profile?.username || profile?.display_name || 'Utilisateur',
            avatar: profile?.avatar_url || 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200',
            platform: 'instagram',
            verified: false,
            bio: profile?.bio || '',
            motivation: app.motivation || 'Souhaite acceder aux ressources de cette campagne.',
            socials: [],
            isFromDb: true,
          });
        }
      }

      const combined = [...dbRequests, ...mockRequests];
      setAllRequests(combined);
      if (combined.length > 0) setSelectedCreator(combined[0]);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const markDecision = async (creatorId: string, decision: 'accepted' | 'rejected') => {
    const request = allRequests.find((r) => r.id === creatorId);
    if (request?.isFromDb) {
      await supabase
        .from('campaign_applications')
        .update({
          status: decision,
          reject_reason: decision === 'rejected' ? rejectReason : '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', creatorId);
    }

    const newDecisions = { ...decisions, [creatorId]: decision };
    setDecisions(newDecisions);
    setRejecting(null);
    setRejectReason('');

    const remaining = allRequests.filter((c) => !newDecisions[c.id]);
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

  const pendingRequests = allRequests.filter((c) => !decisions[c.id]);
  const allDecided = pendingRequests.length === 0 && allRequests.length > 0;

  if (loading) {
    return (
      <div className="text-white min-h-screen" style={{ backgroundColor: '#050404' }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-4">
          <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="flex gap-4 pt-4">
            <div className="flex-1 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.055)' }} />
              ))}
            </div>
            <div className="hidden lg:block w-72 h-80 rounded-2xl animate-pulse shrink-0" style={{ background: 'rgba(255,255,255,0.055)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Campagne introuvable</p>
        <button
          onClick={() => navigate('/validation-videos')}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-56 lg:h-64 overflow-hidden">
        {campaign.photo_url ? (
          <img src={campaign.photo_url} alt={campaign.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <Megaphone className="w-16 h-16 text-white/10" />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
          }}
        />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/validation-videos')}
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
            <UserCheck className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white/40 font-medium">Créateurs en attente d'accès aux ressources</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 340px)' }}>
          <div className="flex-1 min-w-0 lg:pr-6">
            {allDecided ? (
              <div className="flex flex-col items-center justify-center py-20">
                <CheckCircle2 className="w-10 h-10 mb-5 animate-bounce text-white" style={{ animationDuration: '2s' }} />
                <p className="text-base font-semibold text-white/50 mb-2">Toutes les demandes ont ete traitees</p>
                <p className="text-sm text-white/25 text-center max-w-sm">
                  Les createurs acceptes auront desormais acces aux ressources de cette campagne.
                </p>
                <button
                  onClick={() => navigate('/validation-videos')}
                  className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Retour
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((creator) => (
                  <RequestCard
                    key={creator.id}
                    creator={creator}
                    isSelected={selectedCreator?.id === creator.id}
                    isRejecting={rejecting === creator.id}
                    rejectReason={rejectReason}
                    onSelect={(c) => {
                      setSelectedCreator(c);
                      if (rejecting !== c.id) setRejecting(null);
                    }}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onRejectReasonChange={setRejectReason}
                    onCancelReject={() => {
                      setRejecting(null);
                      setRejectReason('');
                    }}
                  />
                ))}

                {allRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-base font-semibold text-white/30 mb-2">Aucune demande d'acces</p>
                    <p className="text-sm text-white/15 text-center max-w-sm">
                      Les createurs qui demandent acces apparaitront ici.
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
                  <CreatorPreview creator={selectedCreator} />
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
                      Aucun apercu pour le moment
                    </p>
                    <p className="text-xs text-white/10 text-center mt-1.5">
                      {allDecided
                        ? 'Toutes les demandes ont ete traitees'
                        : 'Selectionnez un createur pour voir son profil'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RequestCardProps {
  creator: CreatorRequest;
  isSelected: boolean;
  isRejecting: boolean;
  rejectReason: string;
  onSelect: (c: CreatorRequest) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRejectReasonChange: (val: string) => void;
  onCancelReject: () => void;
}

function RequestCard({
  creator,
  isSelected,
  isRejecting,
  rejectReason,
  onSelect,
  onAccept,
  onReject,
  onRejectReasonChange,
  onCancelReject,
}: RequestCardProps) {
  return (
    <div>
      <button
        onClick={() => onSelect(creator)}
        className={`w-full rounded-2xl p-5 transition-all duration-200 text-left ${
          isSelected ? 'ring-1 ring-white/20' : 'hover:bg-white/[0.03]'
        }`}
        style={{
          backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <div className="flex items-center gap-4">
          <img
            src={creator.avatar}
            alt={creator.username}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">@{creator.username}</p>
              {creator.verified && (
                <img src={bcreateur} alt="Verified" className="w-[23px] h-[23px]" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {platformIcons[creator.platform] && (
                <img src={platformIcons[creator.platform]} alt={creator.platform} className="w-3.5 h-3.5 social-icon" />
              )}
              <span className="text-xs text-white/40">{platformLabels[creator.platform] || creator.platform}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onReject(creator.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <X className="w-4 h-4" style={{ color: '#FF4B4B' }} />
            </button>
            <button
              onClick={() => onAccept(creator.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Check className="w-4 h-4" style={{ color: '#64FA51' }} />
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <UserCheck className="w-3 h-3 text-white/25" />
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">
              Motivation
            </span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
            {creator.motivation}
          </p>
        </div>
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
            placeholder="Expliquez pourquoi vous refusez ce createur..."
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

function CreatorPreview({ creator }: { creator: CreatorRequest }) {
  return (
    <div className="rounded-xl overflow-hidden sticky top-24">
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
            <img src={bcreateur} alt="Verified" className="w-[29px] h-[29px]" />
          )}
        </div>

        <p className="text-xs text-white/35 mt-2 leading-relaxed">{creator.bio}</p>

        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,180,50,0.04)', border: '1px solid rgba(255,180,50,0.1)' }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: '#FFB432' }}>Motivation</p>
          <p className="text-xs text-white/50 leading-relaxed">{creator.motivation}</p>
        </div>

        {creator.socials.length > 0 && (
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
        )}

        {creator.socials.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Total vues</span>
              <span className="text-sm font-bold text-white">
                {formatTotalViews(creator.socials)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTotalViews(socials: CreatorRequest['socials']): string {
  const total = socials.reduce((sum, s) => {
    const num = parseFloat(s.views.replace(/,/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `${(total / 1_000).toFixed(0)}K`;
  return total.toString();
}
