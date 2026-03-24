import { useRef, useEffect, useState } from 'react';
import { Search, X, Building2, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { useProfileSearch, type ProfileResult } from '@/shared/lib/useSearch';
import GrapeLoader from './GrapeLoader';
import bcreateur from '@/shared/assets/badge-creator-verified.png';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import { getRecentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches, type RecentSearchItem } from '@/shared/lib/recentSearches';
import { enterprises } from '@/shared/data/campaignsData';

const staticCreators = [
  { id: 'c1', username: 'maxcreates', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Content creator lifestyle & tech' },
  { id: 'c2', username: 'sarahvibes', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', verified: false, bio: 'Mode et beauté, 3 ans UGC' },
  { id: 'c3', username: 'techwithleo', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Tech reviewer & unboxer' },
  { id: 'c4', username: 'clipmaster', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Clipping pro, gaming & esports' },
  { id: 'c5', username: 'fitnessanna', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', verified: false, bio: 'Fitness & nutrition UGC creator' },
  { id: 'c6', username: 'cryptomax_fr', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Crypto & DeFi content creator' },
  { id: 'c7', username: 'foodie_jules', avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=200', verified: false, bio: 'Food & lifestyle creator' },
  { id: 'c8', username: 'gamerpro_fr', avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Gaming & esports clips' },
];

interface SearchOverlayProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onClose: () => void;
  onSelectCreator?: (id: string) => void;
  onSelectProfile?: (profile: ProfileResult) => void;
}

export default function SearchOverlay({ searchQuery, setSearchQuery, onClose, onSelectCreator, onSelectProfile }: SearchOverlayProps) {
  const navigate = useEnterpriseNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { results: dbProfiles, loading: searchLoading } = useProfileSearch(searchQuery);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => getRecentSearches());

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const dbCreators = dbProfiles.filter((p) => !p.role || p.role === 'creator');
  const dbEnterprises = dbProfiles.filter((p) => p.role === 'enterprise');

  const q = searchQuery.toLowerCase().trim();
  const filteredStaticCreators = q
    ? staticCreators.filter((c) => c.username.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q))
    : [];
  const filteredStaticEnterprises = q
    ? enterprises.filter((e) => e.name.toLowerCase().includes(q) || e.categories.some((cat) => cat.toLowerCase().includes(q)))
    : [];

  const creatorResults = dbCreators;
  const enterpriseResults = dbEnterprises;
  const hasResults = dbProfiles.length > 0 || filteredStaticCreators.length > 0 || filteredStaticEnterprises.length > 0;

  const handleSelectProfile = (p: typeof dbProfiles[0]) => {
    saveRecentSearch({
      id: p.id,
      type: 'profile',
      username: p.username,
      avatar: p.avatar_url ?? undefined,
      bio: p.bio || p.display_name,
      role: p.role,
    });
    setRecentSearches(getRecentSearches());
    if (onSelectProfile) {
      onSelectProfile(p);
    } else {
      navigate(`/u/${p.username}`, { state: { from: location.pathname, backState: { searchOpen: true, searchQuery } } });
    }
    onClose();
  };

  return (
    <>
      <style>{`@keyframes fadeInSearch { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div
        className="fixed inset-0 z-[200] flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          background: 'rgba(5,4,4,0.65)',
          backdropFilter: 'blur(60px) saturate(180%)',
          WebkitBackdropFilter: 'blur(60px) saturate(180%)',
          animation: 'fadeInSearch 0.25s ease-out',
        }}
      >
        <div className="flex items-center justify-center gap-2.5 px-4 py-3">
          <div className="flex items-center gap-2.5" style={{ width: '100%', maxWidth: '780px' }}>
            <div
              className="flex-1 flex items-center gap-2.5 rounded-2xl px-5 py-3.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un créateur, une entreprise..."
                className="flex-1 bg-transparent text-base text-white placeholder-white/30 outline-none"
              />
              {searchQuery.length > 0 && (
                <button onClick={() => setSearchQuery('')} className="shrink-0">
                  <X className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3 pb-8 flex flex-col items-center">
        <div className="w-full" style={{ maxWidth: '780px', paddingLeft: '1rem', paddingRight: '1rem' }}>

          {!searchQuery.trim() && recentSearches.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">Recent</span>
              <button
                onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                Tout effacer
              </button>
            </div>
          )}

          {!searchQuery.trim() && recentSearches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Search className="w-8 h-8 text-white/10 mb-3" />
              <p className="text-sm text-white/25">Aucune recherche recente</p>
            </div>

          ) : !searchQuery.trim() && recentSearches.length > 0 ? (
            <div className="space-y-0.5">
              {recentSearches.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => {
                    if (item.type === 'profile') navigate(`/u/${item.username}`);
                    else if (item.type === 'creator') navigate(`/createur/${item.id}`);
                    else if (item.type === 'enterprise') navigate(`/entreprise/${item.id}`);
                    onClose();
                  }}
                >
                  <div
                    className="w-11 h-11 overflow-hidden shrink-0 flex items-center justify-center"
                    style={{
                      borderRadius: (item.role === 'enterprise' || item.type === 'enterprise') ? '10px' : '50%',
                      ...(!item.avatar ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : {}),
                    }}
                  >
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.username || item.name}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: (item.role === 'enterprise' || item.type === 'enterprise') ? '10px' : '50%' }}
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">
                        {item.type === 'profile' ? `@${item.username}` : (item.name || item.username)}
                      </span>
                      {(item.role === 'enterprise' || item.type === 'enterprise') && (
                        <img src={jentrepriseIcon} alt="" className="w-5 h-5 shrink-0" />
                      )}
                      {item.verified && item.role !== 'enterprise' && item.type !== 'enterprise' && (
                        <img src={bcreateur} alt="" className="w-5 h-5 shrink-0" />
                      )}
                    </div>
                    {item.bio && <p className="text-xs text-white/40 truncate">{item.bio}</p>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(item.id);
                      setRecentSearches(getRecentSearches());
                    }}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors active:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              ))}
            </div>

          ) : searchQuery.trim() && searchLoading ? (
            <div className="flex items-center justify-center py-16">
              <GrapeLoader size="md" />
            </div>

          ) : !hasResults && searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-8 h-8 text-white/10 mb-3" />
              <p className="text-sm text-white/25">Aucun resultat</p>
            </div>

          ) : (
            <div className="space-y-0.5">

              {(enterpriseResults.length > 0 || filteredStaticEnterprises.length > 0) && (
                <>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-1 pb-2">Entreprises</p>
                  {filteredStaticEnterprises.map((ent) => (
                    <div
                      key={ent.id}
                      onClick={() => {
                        saveRecentSearch({ id: ent.id, type: 'enterprise', name: ent.name, avatar: ent.logo, verified: ent.verified, bio: ent.description });
                        setRecentSearches(getRecentSearches());
                        navigate(`/entreprise/${ent.id}`);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <img src={ent.logo} alt={ent.name} className="w-11 h-11 rounded-xl object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white truncate">{ent.name}</span>
                          {ent.verified && <img src={jentrepriseIcon} alt="" className="w-5 h-5 shrink-0" />}
                        </div>
                        <p className="text-xs text-white/40 truncate">{ent.description}</p>
                      </div>
                      <Building2 className="w-4 h-4 text-white/20 shrink-0" />
                    </div>
                  ))}
                  {enterpriseResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div
                        className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                        style={!p.avatar_url ? { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: '1px solid rgba(255,255,255,0.08)' } : { border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white truncate">{p.display_name || p.username}</span>
                          <img src={jentrepriseIcon} alt="" className="w-5 h-5 shrink-0" />
                        </div>
                        <p className="text-xs text-white/40 truncate">{p.bio || `@${p.username}`}</p>
                      </div>
                      <Building2 className="w-4 h-4 text-white/20 shrink-0" />
                    </div>
                  ))}
                </>
              )}

              {(creatorResults.length > 0 || filteredStaticCreators.length > 0) && (
                <>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-3 pb-2">Créateurs</p>
                  {filteredStaticCreators.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        saveRecentSearch({ id: c.id, type: 'creator', username: c.username, avatar: c.avatar, verified: c.verified, bio: c.bio });
                        setRecentSearches(getRecentSearches());
                        navigate(`/createur/${c.id}`);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <img src={c.avatar} alt={c.username} className="w-11 h-11 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white truncate">@{c.username}</span>
                          {c.verified && <img src={bcreateur} alt="" className="w-5 h-5 shrink-0" />}
                        </div>
                        <p className="text-xs text-white/40 truncate">{c.bio}</p>
                      </div>
                    </div>
                  ))}
                  {creatorResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div
                        className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                        style={!p.avatar_url ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : undefined}
                      >
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">@{p.username}</span>
                        <p className="text-xs text-white/40 truncate">{p.bio || p.display_name}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
