import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Eye, ExternalLink, Filter, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';

interface Creator {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio: string;
  platforms: {
    platform: 'instagram' | 'tiktok' | 'youtube';
    handle: string;
    views: string;
  }[];
  categories: string[];
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

const mockCreators: Creator[] = [
  {
    id: 'c1',
    username: 'maxcreates',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    bio: 'Content creator spécialisé en lifestyle & tech. Contenu authentique pour la Gen Z.',
    platforms: [
      { platform: 'instagram', handle: '@maxcreates', views: '2,356,093' },
      { platform: 'tiktok', handle: '@maxcreates.tk', views: '5,842,710' },
      { platform: 'youtube', handle: '@MaxCreatesYT', views: '1,203,487' },
    ],
    categories: ['Tech', 'Lifestyle'],
  },
  {
    id: 'c2',
    username: 'sarahvibes',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    bio: 'Passionnée de mode et beauté. 3 ans d\'expérience en UGC.',
    platforms: [
      { platform: 'tiktok', handle: '@sarahvibes', views: '8,120,340' },
      { platform: 'instagram', handle: '@sarah.vibes', views: '1,450,200' },
    ],
    categories: ['Mode', 'Beaute'],
  },
  {
    id: 'c3',
    username: 'techwithleo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    bio: 'Tech reviewer & unboxer. Tests honnêtes des derniers gadgets.',
    platforms: [
      { platform: 'youtube', handle: '@TechWithLeo', views: '12,450,000' },
      { platform: 'instagram', handle: '@techwithleo', views: '890,320' },
      { platform: 'tiktok', handle: '@techwithleo', views: '3,210,500' },
    ],
    categories: ['Tech', 'Gaming'],
  },
  {
    id: 'c4',
    username: 'clipmaster',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    bio: 'Clippeur professionnel. Gaming, sports et entertainment.',
    platforms: [
      { platform: 'tiktok', handle: '@clipmaster', views: '15,320,000' },
      { platform: 'youtube', handle: '@ClipMasterYT', views: '4,560,200' },
    ],
    categories: ['Gaming', 'Entertainment'],
  },
  {
    id: 'c5',
    username: 'fitnessanna',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    bio: 'Coach fitness certifiee. Contenu sante, nutrition et entrainement.',
    platforms: [
      { platform: 'instagram', handle: '@fitnessanna', views: '6,780,100' },
      { platform: 'tiktok', handle: '@fitnessanna', views: '9,210,500' },
      { platform: 'youtube', handle: '@FitnessAnna', views: '2,340,800' },
    ],
    categories: ['Fitness', 'Sante'],
  },
  {
    id: 'c6',
    username: 'cryptomax_fr',
    avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    bio: 'Analyste crypto et DeFi. Vulgarisation blockchain pour tous.',
    platforms: [
      { platform: 'youtube', handle: '@CryptoMaxFR', views: '3,890,000' },
      { platform: 'tiktok', handle: '@cryptomax_fr', views: '7,120,300' },
    ],
    categories: ['Crypto', 'Finance'],
  },
  {
    id: 'c7',
    username: 'foodie_jules',
    avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    bio: 'Critique culinaire et créateur food. Restaurants, recettes et street food.',
    platforms: [
      { platform: 'instagram', handle: '@foodie.jules', views: '4,560,700' },
      { platform: 'tiktok', handle: '@foodiejules', views: '11,230,000' },
    ],
    categories: ['Food', 'Lifestyle'],
  },
  {
    id: 'c8',
    username: 'gamerpro_fr',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    bio: 'Streamer et clipper gaming. FPS, battle royale et esport.',
    platforms: [
      { platform: 'tiktok', handle: '@gamerpro_fr', views: '18,900,000' },
      { platform: 'youtube', handle: '@GamerProFR', views: '6,780,500' },
      { platform: 'instagram', handle: '@gamerpro.fr', views: '1,230,400' },
    ],
    categories: ['Gaming', 'Entertainment'],
  },
];

function getTotalViews(platforms: Creator['platforms']): number {
  return platforms.reduce((sum, p) => {
    const num = parseFloat(p.views.replace(/,/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
}

function formatViews(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

const allCategories = Array.from(new Set(mockCreators.flatMap((c) => c.categories))).sort();
const allPlatforms = ['instagram', 'tiktok', 'youtube'] as const;

export default function CreatorSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedPlatforms(new Set());
    setSelectedCategories(new Set());
  };

  const hasFilters = selectedPlatforms.size > 0 || selectedCategories.size > 0;

  const results = useMemo(() => {
    return mockCreators.filter((c) => {
      const matchesQuery = !query.trim() ||
        c.username.toLowerCase().includes(query.toLowerCase()) ||
        c.bio.toLowerCase().includes(query.toLowerCase()) ||
        c.categories.some((cat) => cat.toLowerCase().includes(query.toLowerCase()));

      const matchesPlatform = selectedPlatforms.size === 0 ||
        c.platforms.some((p) => selectedPlatforms.has(p.platform));

      const matchesCategory = selectedCategories.size === 0 ||
        c.categories.some((cat) => selectedCategories.has(cat));

      return matchesQuery && matchesPlatform && matchesCategory;
    }).sort((a, b) => getTotalViews(b.platforms) - getTotalViews(a.platforms));
  }, [query, selectedPlatforms, selectedCategories]);

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rechercher des createurs</h1>
            <p className="text-sm text-white/35 mt-1">Trouvez les createurs parfaits pour vos campagnes</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 focus-within:ring-1 focus-within:ring-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Search className="w-5 h-5 text-white/30 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, categorie, plateforme..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="shrink-0">
                <X className="w-4 h-4 text-white/30 hover:text-white/60 transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: showFilters || hasFilters ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: showFilters || hasFilters ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
              color: showFilters || hasFilters ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasFilters && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
              >
                {selectedPlatforms.size + selectedCategories.size}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div
            className="rounded-xl p-5 mb-6 animate-fadeIn"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Filtres</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs font-semibold text-white/50 hover:text-white transition-colors">
                  Reinitialiser
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold mb-2.5">Plateformes</p>
              <div className="flex items-center gap-2">
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: selectedPlatforms.has(p) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: selectedPlatforms.has(p) ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      color: selectedPlatforms.has(p) ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <img src={platformIcons[p]} alt={p} className="w-4 h-4 " />
                    {platformLabels[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold mb-2.5">Categories</p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: selectedCategories.has(cat) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: selectedCategories.has(cat) ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                      color: selectedCategories.has(cat) ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-white/25 font-medium mb-4">
          {results.length} createur{results.length > 1 ? 's' : ''} trouve{results.length > 1 ? 's' : ''}
        </p>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-sm text-white/30 font-medium">Aucun createur trouve</p>
            <p className="text-xs text-white/15 mt-1">Essayez de modifier vos criteres de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((creator) => (
              <div
                key={creator.id}
                className="rounded-2xl p-5 transition-all duration-200 hover:bg-white/[0.03] group cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={() => navigate(`/createur/${creator.id}`, { state: { from: '/recherche-createurs' } })}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={creator.avatar}
                    alt={creator.username}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">@{creator.username}</p>
                      {creator.verified && <img src={verifiedIcon} alt="" className="w-[23px] h-[23px]" />}
                    </div>
                    <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">{creator.bio}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {creator.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatViews(getTotalViews(creator.platforms))}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">total vues</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {creator.platforms.map((p) => (
                    <div
                      key={p.platform}
                      className="flex items-center gap-2.5"
                    >
                      <img src={platformIcons[p.platform]} alt={p.platform} className="w-4 h-4 shrink-0 " />
                      <span className="text-xs text-white/50 font-medium flex-1 truncate">{p.handle}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-white/20" />
                        <span className="text-xs text-white/35 font-medium">{p.views}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/15 shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/messagerie'); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/[0.08]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    Envoyer un message
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    Inviter a une campagne
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
