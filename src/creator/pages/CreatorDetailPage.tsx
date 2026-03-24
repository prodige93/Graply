import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, MessageCircle, Star, Check, MoreVertical, Flag, ShieldBan, X, Video } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import instagramCardIcon from '@/shared/assets/instagram-card.svg';
import youtubeCardIcon from '@/shared/assets/youtube.svg';
import tiktokCardIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const cardPlatformIcons: Record<string, string> = {
  instagram: instagramCardIcon,
  youtube: youtubeCardIcon,
  tiktok: tiktokCardIcon,
};

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

interface CreatorData {
  id: string;
  username: string;
  avatar: string;
  banner: string;
  verified: boolean;
  bio: string;
  joinedDate: string;
  platforms: {
    platform: string;
    handle: string;
    views: string;
    followers: string;
  }[];
  categories: string[];
  stats: {
    totalViews: string;
    totalCampaigns: number;
    totalVideos: number;
    completionRate: string;
    avgRating: string;
  };
  recentCampaigns: {
    id: string;
    title: string;
    brand: string;
    brandLogo: string;
    views: string;
    earned: string;
    platform: string;
    status: 'active' | 'completed';
  }[];
}

const mockCreatorsDetail: CreatorData[] = [
  {
    id: 'c1',
    username: 'maxcreates',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: true,
    bio: 'Content creator spécialisé en lifestyle & tech. Contenu authentique pour la Gen Z. 4 ans d\'expérience en création de contenu UGC et clipping professionnel.',
    joinedDate: 'Mars 2024',
    platforms: [
      { platform: 'instagram', handle: '@maxcreates', views: '2.3M', followers: '48.2K' },
      { platform: 'tiktok', handle: '@maxcreates.tk', views: '5.8M', followers: '122K' },
      { platform: 'youtube', handle: '@MaxCreatesYT', views: '1.2M', followers: '15.4K' },
    ],
    categories: ['Tech', 'Lifestyle', 'UGC'],
    stats: {
      totalViews: '9.3M',
      totalCampaigns: 12,
      totalVideos: 34,
      completionRate: '96%',
      avgRating: '4.8',
    },
    recentCampaigns: [
      { id: 'nike-run-club', title: 'Nike Run Club', brand: 'Nike', brandLogo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100', views: '845K', earned: '$2,112', platform: 'instagram', status: 'active' },
      { id: 'samsung-galaxy-s25', title: 'Samsung Galaxy S25', brand: 'Samsung', brandLogo: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100', views: '1.2M', earned: '$3,600', platform: 'youtube', status: 'completed' },
      { id: 'phantom-wallet-ugc', title: 'Phantom Wallet', brand: 'Phantom', brandLogo: 'https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg?auto=compress&cs=tinysrgb&w=100', views: '320K', earned: '$320', platform: 'tiktok', status: 'completed' },
    ],
  },
  {
    id: 'c2',
    username: 'sarahvibes',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: false,
    bio: 'Passionnée de mode et beauté. 3 ans d\'expérience en UGC. Je crée du contenu authentique qui connecte les marques à leur audience.',
    joinedDate: 'Juin 2024',
    platforms: [
      { platform: 'tiktok', handle: '@sarahvibes', views: '8.1M', followers: '210K' },
      { platform: 'instagram', handle: '@sarah.vibes', views: '1.4M', followers: '36.8K' },
    ],
    categories: ['Mode', 'Beauté', 'UGC'],
    stats: {
      totalViews: '9.5M',
      totalCampaigns: 8,
      totalVideos: 22,
      completionRate: '100%',
      avgRating: '4.9',
    },
    recentCampaigns: [
      { id: 'fanta-summer-ugc', title: 'Fanta Summer', brand: 'Fanta', brandLogo: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=100', views: '430K', earned: '$860', platform: 'tiktok', status: 'active' },
    ],
  },
  {
    id: 'c3',
    username: 'techwithleo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: true,
    bio: 'Tech reviewer & unboxer. Tests honnêtes des derniers gadgets. Je transforme la technologie complexe en contenu accessible et engageant.',
    joinedDate: 'Janvier 2024',
    platforms: [
      { platform: 'youtube', handle: '@TechWithLeo', views: '12.4M', followers: '340K' },
      { platform: 'tiktok', handle: '@techwithleo', views: '3.2M', followers: '89K' },
      { platform: 'instagram', handle: '@techwithleo', views: '890K', followers: '22.5K' },
    ],
    categories: ['Tech', 'Gaming', 'Unboxing'],
    stats: {
      totalViews: '16.5M',
      totalCampaigns: 18,
      totalVideos: 47,
      completionRate: '94%',
      avgRating: '4.7',
    },
    recentCampaigns: [
      { id: 'samsung-galaxy-s25', title: 'Samsung Galaxy S25', brand: 'Samsung', brandLogo: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100', views: '1.8M', earned: '$6,300', platform: 'youtube', status: 'active' },
      { id: 'bose-quietcomfort-ugc', title: 'Bose QuietComfort', brand: 'Bose', brandLogo: 'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=100', views: '890K', earned: '$1,557', platform: 'instagram', status: 'completed' },
    ],
  },
  {
    id: 'c4',
    username: 'clipmaster',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: false,
    bio: 'Clippeur professionnel. Gaming, sports et entertainment. Montage rapide et dynamique pour maximiser l\'engagement.',
    joinedDate: 'Avril 2024',
    platforms: [
      { platform: 'tiktok', handle: '@clipmaster', views: '15.3M', followers: '380K' },
      { platform: 'youtube', handle: '@ClipMasterYT', views: '4.5M', followers: '95K' },
    ],
    categories: ['Gaming', 'Entertainment', 'Clipping'],
    stats: {
      totalViews: '19.8M',
      totalCampaigns: 15,
      totalVideos: 58,
      completionRate: '93%',
      avgRating: '4.6',
    },
    recentCampaigns: [
      { id: 'cod-bo7-clipping', title: 'Call of Duty BO7', brand: 'Activision', brandLogo: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=100', views: '2.1M', earned: '$2,100', platform: 'tiktok', status: 'active' },
      { id: 'redbull-energy-clips', title: 'Red Bull Extreme', brand: 'Red Bull', brandLogo: 'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?auto=compress&cs=tinysrgb&w=100', views: '3.2M', earned: '$5,760', platform: 'tiktok', status: 'completed' },
    ],
  },
  {
    id: 'c5',
    username: 'fitnessanna',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/4753987/pexels-photo-4753987.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: true,
    bio: 'Coach fitness certifiee. Contenu sante, nutrition et entrainement. J\'aide les marques sport et sante a atteindre leur audience cible.',
    joinedDate: 'Fevrier 2024',
    platforms: [
      { platform: 'instagram', handle: '@fitnessanna', views: '6.7M', followers: '178K' },
      { platform: 'tiktok', handle: '@fitnessanna', views: '9.2M', followers: '245K' },
      { platform: 'youtube', handle: '@FitnessAnna', views: '2.3M', followers: '52K' },
    ],
    categories: ['Fitness', 'Sante', 'Lifestyle'],
    stats: {
      totalViews: '18.2M',
      totalCampaigns: 14,
      totalVideos: 41,
      completionRate: '100%',
      avgRating: '5.0',
    },
    recentCampaigns: [
      { id: 'nike-run-club', title: 'Nike Run Club', brand: 'Nike', brandLogo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100', views: '1.5M', earned: '$3,750', platform: 'instagram', status: 'active' },
      { id: 'whoop-athlete-clipping', title: 'WHOOP Athlete', brand: 'WHOOP', brandLogo: 'https://images.pexels.com/photos/4753987/pexels-photo-4753987.jpeg?auto=compress&cs=tinysrgb&w=100', views: '980K', earned: '$1,470', platform: 'instagram', status: 'completed' },
    ],
  },
  {
    id: 'c6',
    username: 'cryptomax_fr',
    avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400',
    banner: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1200',
    verified: false,
    bio: 'Analyste crypto et DeFi. Vulgarisation blockchain pour tous. Contenu educatif sur les cryptomonnaies et les technologies decentralisees.',
    joinedDate: 'Mai 2024',
    platforms: [
      { platform: 'youtube', handle: '@CryptoMaxFR', views: '3.8M', followers: '72K' },
      { platform: 'tiktok', handle: '@cryptomax_fr', views: '7.1M', followers: '165K' },
    ],
    categories: ['Crypto', 'Finance', 'Tech'],
    stats: {
      totalViews: '10.9M',
      totalCampaigns: 6,
      totalVideos: 15,
      completionRate: '83%',
      avgRating: '4.4',
    },
    recentCampaigns: [
      { id: 'polymarket-clipping', title: 'Polymarket', brand: 'Polymarket', brandLogo: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=100', views: '845K', earned: '$634', platform: 'youtube', status: 'active' },
      { id: 'phantom-wallet-ugc', title: 'Phantom Wallet', brand: 'Phantom', brandLogo: 'https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg?auto=compress&cs=tinysrgb&w=100', views: '102K', earned: '$102', platform: 'tiktok', status: 'completed' },
    ],
  },
];

export { mockCreatorsDetail };

export default function CreatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as { from?: string; backState?: Record<string, unknown> } | null);
  const from = locationState?.from;
  const backState = locationState?.backState;
  const creator = mockCreatorsDetail.find((c) => c.id === id);

  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  function handleAction(type: 'report' | 'block') {
    setModal(null);
    setActionToast(type === 'report' ? 'Créateur signalé' : 'Créateur bloqué');
    setTimeout(() => setActionToast(null), 3000);
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Créateur introuvable</p>
        <button
          onClick={() => navigate('/recherche-createurs')}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour a la recherche
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
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={creator.banner} alt={creator.username} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1C1C] via-black/40 to-black/10" />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => from ? navigate(from, { state: backState ?? null }) : navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute top-6 right-6 z-10 lg:hidden" ref={menuRef}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-12 w-52 rounded-xl py-1.5 z-50 overflow-hidden"
              style={{
                background: 'rgba(30,30,32,0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <Flag className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Signaler</span>
              </button>
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Bloquer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="flex items-end gap-5 mb-8">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
            style={{ border: '3px solid #1D1C1C', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            <img src={creator.avatar} alt={creator.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">@{creator.username}</h1>
              {creator.verified && <img src={verifiedIcon} alt="Verified" className="w-[29px] h-[29px]" />}
            </div>
            <p className="text-xs text-white/30 mb-2">Membre depuis {creator.joinedDate}</p>
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => navigate(`/messagerie?dm=${creator.username}${from === 'search' ? '&from=search' : ''}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                style={{ background: '#fff', color: '#000' }}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-white leading-relaxed max-w-2xl mb-6">{creator.bio}</p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {creator.categories.map((cat) => {
              const lower = cat.toLowerCase();
              let tagStyle: React.CSSProperties;
              if (lower === 'clipping') {
                tagStyle = {
                  background: 'rgba(57,31,154,0.15)',
                  border: '1px solid rgba(57,31,154,0.35)',
                  color: '#a78bfa',
                };
              } else if (lower === 'ugc') {
                tagStyle = {
                  background: 'rgba(255,0,217,0.15)',
                  border: '1px solid rgba(255,0,217,0.35)',
                  color: '#FF00D9',
                };
              } else {
                tagStyle = {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                };
              }
              return (
                <span
                  key={cat}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                  style={tagStyle}
                >
                  {cat}
                </span>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => navigate(`/messagerie?dm=${creator.username}${from === 'search' ? '&from=search' : ''}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu((p) => !p)}
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-12 w-52 rounded-xl py-1.5 z-50 overflow-hidden"
                  style={{
                    background: 'rgba(30,30,32,0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <button
                    onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                  >
                    <Flag className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Signaler</span>
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                  >
                    <ShieldBan className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Bloquer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total vues', value: creator.stats.totalViews, icon: Eye },
            { label: 'Videos', value: creator.stats.totalVideos.toString(), icon: Video },
            { label: 'Campagnes', value: creator.stats.totalCampaigns.toString(), icon: null },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                {stat.icon && <stat.icon className="w-3.5 h-3.5 text-white/25" />}
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}

          <div
            className="relative rounded-xl px-3.5 py-3 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(180,180,195,0.1) 0%, rgba(220,220,230,0.05) 50%, rgba(180,180,195,0.1) 100%)',
              border: '1px solid rgba(200,200,210,0.2)',
              boxShadow: '0 0 16px rgba(200,200,210,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(220,220,230,0.08) 45%, rgba(255,255,255,0.1) 50%, rgba(220,220,230,0.08) 55%, transparent 60%)',
                animation: 'ratingShimmer 4s ease-in-out infinite',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3 h-3"
                    style={{
                      color: i <= Math.floor(parseFloat(creator.stats.avgRating)) ? '#a8a8a8' : 'rgba(255,255,255,0.12)',
                      fill: i <= Math.floor(parseFloat(creator.stats.avgRating)) ? '#b8b8b8' : 'transparent',
                      filter: i <= Math.floor(parseFloat(creator.stats.avgRating)) ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.7)) brightness(1.15) contrast(1.1)' : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-white">{creator.stats.avgRating}</p>
                <p className="text-xs font-semibold" style={{ color: 'rgba(200,200,210,0.45)' }}>/5</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Plateformes</h2>
          <div className="space-y-3">
            {creator.platforms.map((p) => (
              <div
                key={p.platform}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <img src={platformIcons[p.platform]} alt={p.platform} className="w-5 h-5 " />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{platformLabels[p.platform]}</p>
                  <p className="text-xs text-white/35">{p.handle}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                    <p className="text-sm font-bold text-white">{p.views}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Abonnes</p>
                    <p className="text-sm font-bold text-white">{p.followers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Campagnes récentes</h2>
          {creator.recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Eye className="w-8 h-8 text-white/10 mb-2" />
              <p className="text-sm text-white/25">Aucune campagne</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creator.recentCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => navigate(`/campagne/${camp.id}`)}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <img
                    src={camp.brandLogo}
                    alt={camp.brand}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{camp.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/35">{camp.brand}</span>
                      <img src={cardPlatformIcons[camp.platform]} alt="" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                      <p className="text-sm font-bold text-white">{camp.views}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: camp.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${camp.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: camp.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {camp.status === 'active' ? 'Actif' : 'Termine'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: 'rgba(30,30,32,0.65)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: modal.type === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${modal.type === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}
            >
              {modal.type === 'block'
                ? <ShieldBan className="w-5 h-5 text-red-400" />
                : <Flag className="w-5 h-5 text-amber-400" />
              }
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {modal.type === 'report' ? 'Signaler ce créateur' : 'Bloquer ce créateur'}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {modal.type === 'report'
                ? `@${creator.username} sera signalé à notre équipe de modération pour examen.`
                : `@${creator.username} sera bloqué et ne sera plus visible dans vos recherches.`
              }
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleAction(modal.type)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ background: modal.type === 'block' ? '#dc2626' : '#d97706' }}
              >
                {modal.type === 'report' ? 'Signaler' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          background: 'rgba(30,30,30,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          opacity: actionToast ? 1 : 0,
          transform: actionToast ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: actionToast ? 'auto' : 'none',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
        </div>
        <p className="text-sm font-semibold text-white">{actionToast}</p>
      </div>

      <style>{`
        @keyframes ratingShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
      </div>
    </div>
  );
}
