import { useState, useRef, ReactNode } from 'react'
import { User, Bell, Search, X, Building2, Menu, ChevronRight, Settings, Megaphone, CheckCircle, MessageCircle, Star, AlertCircle } from 'lucide-react'
import GrapeLoader from './GrapeLoader'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '@/shared/lib/useProfile'
import { useProfileSearch } from '@/shared/lib/useSearch'
import { enterprises } from '@/shared/data/campaignsData'
import globeIcon from '@/shared/assets/globe.svg'
import hourglassIcon from '@/shared/assets/hourglass-filled.svg'
import barChartIcon from '@/shared/assets/bar-chart.svg'
import bcreateur from '@/shared/assets/badge-creator-verified.png'
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png'
import grapeImage from '@/shared/assets/loader-grape-violet.png'
import orangeGrape from '@/shared/assets/loader-grape-orange.png'
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  RecentSearchItem,
} from '@/shared/lib/recentSearches'

type NotifType = 'campaign' | 'validation' | 'message' | 'review' | 'alert'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
}

const notifTypeConfig: Record<NotifType, ReactNode> = {
  campaign: <Megaphone className="w-4 h-4 text-white" />,
  validation: <CheckCircle className="w-4 h-4 text-white" />,
  message: <MessageCircle className="w-4 h-4 text-white" />,
  review: <Star className="w-4 h-4 text-white" />,
  alert: <AlertCircle className="w-4 h-4 text-white" />,
}

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'campaign', title: 'Nouvelle campagne', message: 'Nike lance une campagne running — 500€', time: 'il y a 2 min', read: false },
  { id: 'n2', type: 'validation', title: 'Vidéo validée', message: 'Votre contenu pour Adidas a été approuvé', time: 'il y a 1h', read: false },
  { id: 'n3', type: 'message', title: 'Nouveau message', message: 'L\'équipe Decathlon vous a envoyé un message', time: 'il y a 3h', read: true },
  { id: 'n4', type: 'review', title: 'Avis reçu', message: 'Nike vous a attribué 5 étoiles', time: 'hier', read: true },
  { id: 'n5', type: 'alert', title: 'Délai approchant', message: 'Soumettez votre vidéo Puma avant 18h', time: 'hier', read: true },
]

const sidebarCreators = [
  { id: 'c1', username: 'maxcreates', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Content creator lifestyle & tech', categories: ['Tech', 'Lifestyle'] },
  { id: 'c2', username: 'sarahvibes', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', verified: false, bio: 'Mode et beauté, 3 ans UGC', categories: ['Mode', 'Beauté'] },
  { id: 'c3', username: 'techwithleo', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', verified: true, bio: 'Tech reviewer & unboxer', categories: ['Tech', 'Gaming'] },
]

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const go = (path: string) => navigate(`/app-entreprise${path}`)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)

  const closeMenu = (relativePath?: string) => {
    if (relativePath) go(relativePath)
    setMenuClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setMenuClosing(false)
    }, 260)
  }
  const [enterpriseMode, setEnterpriseMode] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { results: dbProfiles, loading: searchLoading } = useProfileSearch(searchQuery)

  const isActive = (path: string) => location.pathname === `/app-entreprise${path}`
  const isHome = location.pathname === '/app-entreprise' || location.pathname === '/app-entreprise/'

  const filteredCreators = sidebarCreators.filter((c) => {
    if (!searchQuery.trim()) return false
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
    setRecentSearches(getRecentSearches())
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
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
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
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2"
                style={{ borderColor: 'rgba(0,0,0,0.3)' }}
              />
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
                <p className="text-sm text-white/25">Aucune recherche récente</p>
              </div>

            ) : !searchQuery.trim() && recentSearches.length > 0 ? (
              <div className="space-y-0.5">
                {recentSearches.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    onClick={() => {
                      if (item.type === 'profile') go(`/u/${item.username}`)
                      else if (item.type === 'creator') go(`/createur/${item.id}`)
                      else if (item.type === 'enterprise') go(`/entreprise/${item.id}`)
                      handleCloseSearch()
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                      style={!item.avatar ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : undefined}
                    >
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.username || item.name}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: item.type === 'enterprise' ? '10px' : '50%' }}
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
                        {item.verified && <img src={item.type === 'enterprise' ? jentrepriseIcon : bcreateur} alt="" className="w-5 h-5 shrink-0" />}
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
                <p className="text-sm text-white/25">Aucun résultat</p>
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
                          go(`/entreprise/${ent.id}`)
                          handleCloseSearch()
                        }}
                        className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                        style={{ border: '1px solid transparent' }}
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
                          go(`/u/${p.username}`)
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
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-3 pb-2">Créateurs</p>
                )}
                {searchQuery.trim() && filteredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => {
                      saveRecentSearch({ id: creator.id, type: 'creator', username: creator.username, avatar: creator.avatar, bio: creator.bio, verified: creator.verified })
                      go(`/createur/${creator.id}`)
                      handleCloseSearch()
                    }}
                    className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <img src={creator.avatar} alt={creator.username} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white truncate">{creator.username}</span>
                        {creator.verified && <img src={bcreateur} alt="" className="w-5 h-5 shrink-0" />}
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
                <p className="text-xs text-white/35 mt-0.5">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </p>
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
                      <p className={`text-sm font-semibold truncate ${notif.read ? 'text-white/60' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-white/35 truncate mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-white/20 font-medium">{notif.time}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
                    }}
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

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: '#050404',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => navigate('/app-entreprise')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              location.pathname === '/app-entreprise' || location.pathname === '/app-entreprise/' ? 'bg-white/10' : ''
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] text-white">Accueil</span>
          </button>

          <button
            onClick={() => go('/mes-campagnes')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/mes-campagnes') ? 'bg-white/10' : ''
            }`}
          >
            <img src={globeIcon} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-[10px] text-white">Campagnes</span>
          </button>

          <button
            onClick={() => go('/creer-campagne')}
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: '#A15EFF',
                boxShadow: '0 4px 20px rgba(161,94,255,0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M14 5V23M5 14H23" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => go('/dashboard')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/dashboard') ? 'bg-white/10' : ''
            }`}
          >
            <img src={barChartIcon} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-[10px] text-white">Dashboard</span>
          </button>

          <button
            onClick={() => go('/validation-videos')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/validation-videos') ? 'bg-white/10' : ''
            }`}
          >
            <img src={hourglassIcon} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-[10px] text-white">Validation</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[99] lg:hidden"
            onClick={() => closeMenu()}
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background: 'rgba(0,0,0,0.5)',
              animation: menuClosing ? 'fadeOutOverlay 0.26s ease-in forwards' : 'fadeInOverlay 0.26s ease-out forwards',
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
              animation: menuClosing ? 'slideOutToLeft 0.26s cubic-bezier(0.4,0,1,1) forwards' : 'slideInFromLeft 0.28s cubic-bezier(0,0,0.2,1) forwards',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <img src={grapeImage} alt="" className="w-14 h-14 object-contain" />
                <span className="text-lg font-bold text-white tracking-wide">Entreprise</span>
              </div>
              <button
                onClick={() => closeMenu()}
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
                onClick={() => closeMenu('/profil')}
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

              <button
                onClick={() => closeMenu('/messagerie')}
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
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">Mes messages</p>
                  <p className="text-[10px] text-white/35 mt-0.5">Conversations & échanges</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
              </button>

            </div>

            <div className="mx-5 mt-5">
              <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex items-center gap-2.5 px-1 mb-3">
                <img src={orangeGrape} alt="" className="w-14 h-14 object-contain" />
                <span className="text-lg font-bold text-white tracking-wide">Créateurs</span>
              </div>
              <div className="flex items-center justify-between px-1 py-3.5">
                <span className="text-sm font-semibold text-white">Postuler à une campagne</span>
                <button
                  onClick={() => {
                    setEnterpriseMode(!enterpriseMode)
                    if (!enterpriseMode) {
                      setMenuOpen(false)
                      const match = location.pathname.match(/^\/app-entreprise\/campagne\/(.+)$/)
                      if (match) {
                        navigate(`/campagne/${match[1]}`)
                      } else {
                        navigate('/home')
                      }
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
                      background: enterpriseMode ? '#FFA672' : 'rgba(255,255,255,0.4)',
                      left: enterpriseMode ? '27px' : '3px',
                      boxShadow: enterpriseMode ? '0 2px 8px rgba(255,166,114,0.5)' : '0 1px 4px rgba(0,0,0,0.4)',
                      transition: 'left 0.3s ease, background 0.3s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="px-4 pt-4 pb-5 space-y-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 pb-1">Gestion du compte</p>
                <button
                  onClick={() => closeMenu('/mon-compte')}
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
                    <p className="text-[10px] text-white/35 mt-0.5">Gérer mon compte</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </button>

                <button
                  onClick={() => closeMenu('/parametres')}
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
                    <p className="text-sm font-semibold text-white">Paramètres</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Réglages et préférences</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
