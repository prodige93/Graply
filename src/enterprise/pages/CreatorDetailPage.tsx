import { useState, useRef, useEffect } from 'react';
import { renderAmount } from '@/shared/utils/chartUtils';
import { useParams, useLocation } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Eye, MessageCircle, Star, Check, MoreVertical, Flag, ShieldBan, X } from 'lucide-react';
import bcreateur from '@/shared/assets/badge-creator-verified.png';
import symbolSvg from '@/shared/assets/youtube-symbol.svg';
import tiktokSvg from '@/shared/assets/tiktok.svg';
import instalogoSvg from '@/shared/assets/instagram-logo.svg';
function PlatformIcon({ platform, size = 'sm' }: { platform: string; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  if (platform === 'youtube') return (
    <svg viewBox="0 0 27 27" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25.3572 7.2225C25.2235 6.68859 24.9514 6.19939 24.5682 5.80433C24.1849 5.40927 23.7043 5.12233 23.1747 4.9725C21.2397 4.5 13.4997 4.5 13.4997 4.5C13.4997 4.5 5.75967 4.5 3.82467 5.0175C3.29507 5.16733 2.81439 5.45427 2.43118 5.84933C2.04797 6.24439 1.7758 6.73359 1.64217 7.2675C1.28803 9.23125 1.11481 11.2233 1.12467 13.2187C1.11204 15.2292 1.28528 17.2365 1.64217 19.215C1.7895 19.7323 2.06776 20.2029 2.45008 20.5813C2.8324 20.9597 3.30584 21.233 3.82467 21.375C5.75967 21.8925 13.4997 21.8925 13.4997 21.8925C13.4997 21.8925 21.2397 21.8925 23.1747 21.375C23.7043 21.2252 24.1849 20.9382 24.5682 20.5432C24.9514 20.1481 25.2235 19.6589 25.3572 19.125C25.7086 17.176 25.8818 15.1991 25.8747 13.2187C25.8873 11.2083 25.7141 9.20104 25.3572 7.2225Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.9688 16.8975L17.4375 13.2187L10.9688 9.53999V16.8975Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (platform === 'tiktok') return (
    <svg viewBox="0 0 24 24" className={cls} fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3 6.4a4.8 4.8 0 0 1-2.9-1.5A4.8 4.8 0 0 1 15.3 2h-3.4v13.5a2.9 2.9 0 0 1-2.9 2.7 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .6 0 .9.1V9a6.4 6.4 0 0 0-.9-.1 6.3 6.3 0 0 0-6.3 6.5 6.3 6.3 0 0 0 6.3 6.1 6.3 6.3 0 0 0 6.3-6.3V9.3a8.2 8.2 0 0 0 4.8 1.5V7.4a4.8 4.8 0 0 1-1.8-1z"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 27 27" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.125 2.25H7.875C4.7684 2.25 2.25 4.7684 2.25 7.875V19.125C2.25 22.2316 4.7684 24.75 7.875 24.75H19.125C22.2316 24.75 24.75 22.2316 24.75 19.125V7.875C24.75 4.7684 22.2316 2.25 19.125 2.25Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.0002 12.7913C18.139 13.7275 17.9791 14.6837 17.5431 15.5239C17.1072 16.364 16.4174 17.0453 15.572 17.4709C14.7265 17.8964 13.7684 18.0446 12.8339 17.8942C11.8994 17.7438 11.0361 17.3026 10.3669 16.6333C9.69757 15.964 9.25636 15.1007 9.10598 14.1662C8.95561 13.2317 9.10373 12.2736 9.52928 11.4282C9.95482 10.5827 10.6361 9.89296 11.4763 9.45703C12.3164 9.02109 13.2726 8.86117 14.2089 9C15.1639 9.14162 16.0481 9.58665 16.7308 10.2693C17.4135 10.952 17.8585 11.8362 18.0002 12.7913Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.6875 7.3125H19.6988" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ColorPlatformIcon({ platform }: { platform: string }) {
  if (platform === 'instagram') return <img src={instalogoSvg} alt="Instagram" className="w-5 h-5" />;
  if (platform === 'tiktok') return <img src={tiktokSvg} alt="TikTok" className="w-5 h-5" />;
  return <img src={symbolSvg} alt="YouTube" className="w-5 h-5" />;
}

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
    bio: 'Content creator specialise en lifestyle & tech. Contenu authentique pour la Gen Z. 4 ans d\'experience en creation de contenu UGC et clipping professionnel.',
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
    bio: 'Passionnee de mode et beaute. 3 ans d\'experience en UGC. Je cree du contenu authentique qui connecte les marques a leur audience.',
    joinedDate: 'Juin 2024',
    platforms: [
      { platform: 'tiktok', handle: '@sarahvibes', views: '8.1M', followers: '210K' },
      { platform: 'instagram', handle: '@sarah.vibes', views: '1.4M', followers: '36.8K' },
    ],
    categories: ['Mode', 'Beauté', 'UGC'],
    stats: {
      totalViews: '9.5M',
      totalCampaigns: 8,
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
    bio: 'Tech reviewer & unboxer. Tests honnetes des derniers gadgets. Je transforme la technologie complexe en contenu accessible et engageant.',
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
    bio: 'Coach fitness certifiée. Contenu santé, nutrition et entraînement. J\'aide les marques sport et santé à atteindre leur audience cible.',
    joinedDate: 'Février 2024',
    platforms: [
      { platform: 'instagram', handle: '@fitnessanna', views: '6.7M', followers: '178K' },
      { platform: 'tiktok', handle: '@fitnessanna', views: '9.2M', followers: '245K' },
      { platform: 'youtube', handle: '@FitnessAnna', views: '2.3M', followers: '52K' },
    ],
    categories: ['Fitness', 'Sante', 'Lifestyle'],
    stats: {
      totalViews: '18.2M',
      totalCampaigns: 14,
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
  const navigate = useEnterpriseNavigate();
  const location = useLocation();
  const locationState = (location.state as { from?: string; backState?: Record<string, unknown> } | null);
  const from = locationState?.from;
  const backState = locationState?.backState;
  const creator = mockCreatorsDetail.find((c) => c.id === id);

  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuRefDesktop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMobile = menuRef.current && menuRef.current.contains(target);
      const inDesktop = menuRefDesktop.current && menuRefDesktop.current.contains(target);
      if (!inMobile && !inDesktop) {
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
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={creator.banner} alt={creator.username} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
          }}
        />
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
                background: 'rgba(18, 17, 17, 0.72)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.07] transition-colors"
              >
                <Flag className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Signaler</span>
              </button>
              <button
                onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.07] transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Bloquer</span>
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
              {creator.verified && <img src={bcreateur} alt="Verified" className="w-[29px] h-[29px]" />}
            </div>
            <p className="text-xs text-white/30">Membre depuis {creator.joinedDate}</p>
            <button
              onClick={() => navigate(`/messagerie?dm=${creator.username}`)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 mt-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96] w-fit"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
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
              onClick={() => navigate(`/messagerie?dm=${creator.username}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <div className="relative" ref={menuRefDesktop}>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total vues', value: creator.stats.totalViews },
            { label: 'Campagnes', value: creator.stats.totalCampaigns.toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">{stat.label}</p>
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
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3 h-3" style={{ color: 'rgba(200,200,210,0.6)', fill: 'rgba(200,200,210,0.6)' }} />
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(200,200,210,0.6)' }}>Note</p>
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
                  <ColorPlatformIcon platform={p.platform} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{platformLabels[p.platform]}</p>
                  <p className="text-xs text-white/35">{p.handle}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                    <p className="text-sm font-bold">{renderAmount(p.views)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Abonnes</p>
                    <p className="text-sm font-bold">{renderAmount(p.followers)}</p>
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
                      <PlatformIcon platform={camp.platform} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                      <p className="text-sm font-bold">{renderAmount(camp.views)}</p>
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
              {modal.type === 'report' ? 'Signaler ce createur' : 'Bloquer ce createur'}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {modal.type === 'report'
                ? `@${creator.username} sera signale a notre equipe de moderation pour examen.`
                : `@${creator.username} sera bloque et ne sera plus visible dans vos recherches.`
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
  );
}
