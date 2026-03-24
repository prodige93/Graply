import { useState, useRef, useEffect } from 'react'
import { User, Bell, MessageCircle, Search, X, Building2, Home, Menu, ChevronRight, Settings, CheckCircle } from 'lucide-react'
import GrapeLoader from './GrapeLoader'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '@/shared/lib/useProfile'
import { useProfileSearch } from '@/shared/lib/useSearch'
import { enterprises } from '@/shared/data/campaignsData'
import globeIcon from '@/shared/assets/globe.svg'
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg'
import barChartIcon from '@/shared/assets/bar-chart.svg'
import verifiedCreatorIcon from '@/shared/assets/badge-creator-verified.png'
import verifiedEnterpriseIcon from '@/shared/assets/badge-enterprise-verified.png'
import grapeImage from '@/shared/assets/loader-grape-orange.png'
import grapeViolet from '@/shared/assets/loader-grape-violet.png'
import { initialNotifications, notifTypeConfig, type Notification } from './notificationConstants'

const RECENT_SEARCHES_KEY = 'mobile_recent_searches'
const MAX_RECENT = 8

interface RecentSearchItem {
  id: string
  type: 'profile' | 'creator' | 'enterprise'
  username?: string
  name?: string
  avatar?: string
  bio?: string
  verified?: boolean
}

function getRecentSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentSearch(item: RecentSearchItem) {
  const existing = getRecentSearches().filter((r) => r.id !== item.id)
  const updated = [item, ...existing].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

function removeRecentSearch(id: string) {
  const updated = getRecentSearches().filter((r) => r.id !== id)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

const sidebarCreators = [
  { id: 'c1', username: 'maxcreates', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Content creator lifestyle & tech', categories: ['Tech', 'Lifestyle'] },
  { id: 'c2', username: 'sarahvibes', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', verified: false, bio: 'Mode et beauté, 3 ans UGC', categories: ['Mode', 'Beauté'] },
  { id: 'c3', username: 'techwithleo', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Tech reviewer & unboxer', categories: ['Tech', 'Gaming'] },
]

interface MobileNavProps {
  onVerifyClick?: () => void
}

export default function MobileNav({ onVerifyClick }: MobileNavProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [enterpriseMode, setEnterpriseMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))

  useEffect(() => {
    const state = location.state as { searchOpen?: boolean; searchQuery?: string } | null
    if (state?.searchOpen) {
      setSearchQuery(state.searchQuery || '')
      setSearchOpen(true)
      setTimeout(() => searchInputRef.current?.focus(), 80)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state])

  useEffect(() => {
    if (searchOpen) {
      setRecentSearches(getRecentSearches())
    }
  }, [searchOpen])

  const { results: dbProfiles, loading: searchLoading } = useProfileSearch(searchQuery)

  const isActive = (path: string) => location.pathname === path
  const isHome = location.pathname === '/home'

  const filteredCreators = sidebarCreators.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.username.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q) || c.categories.some((cat) => cat.toLowerCase().includes(q))
  })

  const filteredEnterprises = searchQuery.trim()
    ? enterprises.filter((e) => {
        const q = searchQuery.toLowerCase()
        return e.name.toLowerCase().includes(q) || e.categories.some((c) => c.toLowerCase().includes(q))
      })
    : []

  const handleOpenSearch = () => {
    setSearchOpen(true)
    setSearchQuery('')
    setTimeout(() => searchInputRef.current?.focus(), 80)
  }

  const handleCloseSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      {isHome && <header
        className="fixed top-0 left-0 right-0 z-50 lg:hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleOpenSearch}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Search className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => setNotifOpen(true)}
            className="relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: 'rgba(0,0,0,0.3)' }} />
            )}
          </button>
        </div>
      </header>}

      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            background: 'rgba(5,4,4,0.65)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            animation: 'fadeInSearch 0.25s ease-out',
          }}
        >
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div
              className="flex-1 flex items-center gap-2.5 rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
              {searchQuery.length > 0 && (
                <button onClick={() => setSearchQuery('')} className="shrink-0">
                  <X className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
                </button>
              )}
            </div>
            <button
              onClick={handleCloseSearch}
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

          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8">
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">Recent</span>
                <button
                  onClick={() => { clearRecentSearches(); setRecentSearches([]) }}
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
                      if (item.type === 'profile') navigate(`/u/${item.username}`)
                      else if (item.type === 'creator') navigate(`/createur/${item.id}`)
                      else if (item.type === 'enterprise') navigate(`/entreprise/${item.id}`)
                      handleCloseSearch()
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                      style={!item.avatar ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : undefined}
                    >
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.username || item.name} className="w-full h-full object-cover" style={{ borderRadius: item.type === 'enterprise' ? '10px' : '50%' }} />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white truncate">
                          {item.type === 'profile' ? `@${item.username}` : (item.name || item.username)}
                        </span>
                        {item.verified && <img src={item.type === 'enterprise' ? verifiedEnterpriseIcon : verifiedCreatorIcon} alt="" className="w-5 h-5 shrink-0" />}
                      </div>
                      {item.bio && <p className="text-xs text-white/40 truncate">{item.bio}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(item.id)
                        setRecentSearches(getRecentSearches())
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
            ) : filteredCreators.length === 0 && filteredEnterprises.length === 0 && dbProfiles.length === 0 && searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-sm text-white/25">Aucun resultat</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredEnterprises.length > 0 && (
                  <>
                    {searchQuery.trim() && (
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-1 pb-2">Entreprises</p>
                    )}
                    {filteredEnterprises.map((ent) => (
                      <div
                        key={ent.id}
                        onClick={() => {
                          saveRecentSearch({ id: ent.id, type: 'enterprise', name: ent.name, avatar: ent.logo, verified: ent.verified, bio: ent.description })
                          navigate(`/entreprise/${ent.id}`, { state: { from: location.pathname, backState: { searchOpen: true, searchQuery } } })
                          handleCloseSearch()
                        }}
                        className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                        style={{ border: '1px solid transparent' }}
                      >
                        <img src={ent.logo} alt={ent.name} className="w-11 h-11 rounded-xl object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white truncate">{ent.name}</span>
                            {ent.verified && <img src={verifiedEnterpriseIcon} alt="" className="w-5 h-5 shrink-0" />}
                          </div>
                          <p className="text-xs text-white/40 truncate">{ent.description}</p>
                        </div>
                        <Building2 className="w-4 h-4 text-white/20 shrink-0" />
                      </div>
                    ))}
                  </>
                )}

                {dbProfiles.length > 0 && searchQuery.trim() && (
                  <>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-3 pb-2">Membres</p>
                    {dbProfiles.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          saveRecentSearch({ id: p.id, type: 'profile', username: p.username, avatar: p.avatar_url ?? undefined, bio: p.bio || p.display_name })
                          navigate(`/u/${p.username}`, { state: { from: location.pathname, backState: { searchOpen: true, searchQuery } } })
                          handleCloseSearch()
                        }}
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

                {filteredCreators.length > 0 && searchQuery.trim() && (
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-3 pb-2">Createurs</p>
                )}
                {searchQuery.trim() && filteredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => {
                      saveRecentSearch({ id: creator.id, type: 'creator', username: creator.username, avatar: creator.avatar, bio: creator.bio, verified: creator.verified })
                      navigate(`/createur/${creator.id}`, { state: { from: location.pathname, backState: { searchOpen: true, searchQuery } } })
                      handleCloseSearch()
                    }}
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <img src={creator.avatar} alt={creator.username} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white truncate">{creator.username}</span>
                        {creator.verified && <img src={verifiedCreatorIcon} alt="" className="w-5 h-5 shrink-0" />}
                      </div>
                      <p className="text-xs text-white/40 truncate">{creator.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {notifOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            background: 'rgba(5,4,4,0.65)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            animation: 'fadeInSearch 0.25s ease-out',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white/35 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm font-bold text-white/50 hover:text-white/80 transition-colors px-2 py-1"
              >
                Tout lire
              </button>
            )}
            <button
              onClick={() => setNotifOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-90"
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

          <div className="flex-1 overflow-y-auto px-2 pb-8 pt-1 space-y-0.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Bell className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-sm text-white/25">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => markRead(notif.id)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    {notifTypeConfig[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold truncate ${notif.read ? 'text-white/60' : 'text-white'}`}>{notif.title}</p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-white/35 truncate mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-white/20 font-medium">{notif.time}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNotifications((prev) => prev.filter((n) => n.id !== notif.id)); }}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors active:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[99] lg:hidden"
            onClick={() => setMenuOpen(false)}
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background: 'rgba(0,0,0,0.5)',
            }}
          />

          <div
            className="fixed inset-y-0 left-0 z-[100] lg:hidden flex flex-col"
            style={{
              width: '280px',
              paddingTop: 'env(safe-area-inset-top)',
              background: 'rgba(14,14,14,0.85)',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '4px 0 40px rgba(0,0,0,0.6)',
              animation: 'slideInSearch 0.3s ease-out',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <img src={grapeImage} alt="" className="w-14 h-14 object-contain" />
                <span className="text-lg font-bold text-white tracking-wide">Createurs</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <div className="px-4 pt-5 space-y-2">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profil') }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                  style={{
                    ...(profile?.avatar_url
                      ? { border: '1px solid rgba(255,255,255,0.12)' }
                      : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }),
                  }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">Mon profil</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{profile?.username ? `@${profile.username}` : 'Voir mon compte'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
              </button>
            </div>

            <div className="mx-5 mt-5">
              <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex items-center gap-2.5 px-1 mb-3">
                <img src={grapeViolet} alt="" className="w-14 h-14 object-contain" />
                <span className="text-lg font-bold text-white tracking-wide">Entreprise</span>
              </div>
              <div className="flex items-center justify-between px-1 py-3.5">
                <span className="text-sm font-semibold text-white">Lancer une campagne</span>
                <button
                  onClick={() => {
                    setEnterpriseMode(!enterpriseMode)
                    if (!enterpriseMode) {
                      setMenuOpen(false)
                      navigate('/app-entreprise')
                    }
                  }}
                  className="relative shrink-0 transition-all duration-300 active:scale-95"
                  style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      width: '22px',
                      height: '22px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: enterpriseMode ? '#A15EFF' : 'rgba(255,255,255,0.4)',
                      left: enterpriseMode ? '27px' : '3px',
                      boxShadow: enterpriseMode ? '0 2px 8px rgba(161,94,255,0.5)' : '0 1px 4px rgba(0,0,0,0.4)',
                      transition: 'left 0.3s ease, background 0.3s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="mx-5 mt-auto pb-6">
              <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-2 pb-3">Gestion du compte</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/mon-compte') }}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">Mon compte</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Gerer mon compte</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/parametres') }}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">Parametres</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Reglages et preferences</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: '#050404',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/home') ? 'bg-white/10' : ''
            }`}
          >
            <Home className="w-6 h-6 text-white" strokeWidth={2} />
            <span className="text-[10px] text-white">Accueil</span>
          </button>

          <button
            onClick={() => navigate('/mes-campagnes')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/mes-campagnes') ? 'bg-white/10' : ''
            }`}
          >
            <img src={globeIcon} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-[10px] text-white">Campagnes</span>
          </button>

          <button
            onClick={() => onVerifyClick?.()}
            className="flex flex-col items-center justify-center -mt-3"
          >
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95"
              style={{
                background: '#FFA672',
                boxShadow: '0 4px 20px rgba(255,166,114,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <img src={chCircleIcon} alt="" className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/dashboard') ? 'bg-white/10' : ''
            }`}
          >
            <img src={barChartIcon} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-[10px] text-white">Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/messagerie')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/messagerie') ? 'bg-white/10' : ''
            }`}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-[10px] text-white">Messages</span>
          </button>
        </div>
      </nav>
    </>
  )
}
