import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Search, Send, Image, Paperclip, MoreVertical, Check, CheckCheck, Trash2, ShieldBan, X, AlertTriangle, Flag } from 'lucide-react';
import { enterprises } from '@/shared/data/campaignsData';
import { mockCreatorsDetail } from './CreatorDetailPage';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import bcreateur from '@/shared/assets/badge-creator-verified.png';

interface Conversation {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  platform: string;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  read: boolean;
}

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    username: 'maxcreates',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    lastMessage: 'Super, je commence le tournage demain !',
    time: '14:32',
    unread: 2,
    online: true,
    platform: 'instagram',
  },
  {
    id: 'conv2',
    username: 'sarahvibes',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    lastMessage: 'J\'ai une question sur les règles de la campagne',
    time: '12:15',
    unread: 1,
    online: true,
    platform: 'tiktok',
  },
  {
    id: 'conv3',
    username: 'techwithleo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    lastMessage: 'Merci pour le retour, je corrige ca',
    time: 'Hier',
    unread: 0,
    online: false,
    platform: 'youtube',
  },
  {
    id: 'conv4',
    username: 'clipmaster',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: false,
    lastMessage: 'La video est prete, je l\'envoie ce soir',
    time: 'Hier',
    unread: 0,
    online: false,
    platform: 'tiktok',
  },
  {
    id: 'conv5',
    username: 'fitnessanna',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    verified: true,
    lastMessage: 'OK parfait, je valide le brief',
    time: 'Lun',
    unread: 0,
    online: false,
    platform: 'instagram',
  },
];

const mockMessages: Record<string, Message[]> = {
  conv1: [
    { id: 'm1', sender: 'them', text: 'Salut ! J\'ai bien reçu le brief pour la campagne Nike Run Club', time: '14:20', read: true },
    { id: 'm2', sender: 'me', text: 'Parfait ! N\'hésite pas si tu as des questions sur les règles', time: '14:25', read: true },
    { id: 'm3', sender: 'them', text: 'Pour le format, c\'est bien du 9:16 uniquement ?', time: '14:28', read: true },
    { id: 'm4', sender: 'me', text: 'Oui exactement, format vertical pour TikTok et Reels', time: '14:30', read: true },
    { id: 'm5', sender: 'them', text: 'Super, je commence le tournage demain !', time: '14:32', read: false },
  ],
  conv2: [
    { id: 'm1', sender: 'them', text: 'Bonjour, je suis intéressée par votre campagne Samsung', time: '11:45', read: true },
    { id: 'm2', sender: 'me', text: 'Bienvenue ! Vous pouvez postuler directement sur la page de la campagne', time: '11:50', read: true },
    { id: 'm3', sender: 'them', text: 'J\'ai une question sur les règles de la campagne', time: '12:15', read: false },
  ],
  conv3: [
    { id: 'm1', sender: 'me', text: 'Salut Leo, ta dernière vidéo avait un petit souci de watermark', time: '09:00', read: true },
    { id: 'm2', sender: 'them', text: 'Ah mince, c\'était lequel exactement ?', time: '09:15', read: true },
    { id: 'm3', sender: 'me', text: 'Le logo doit être visible dans les 5 premières secondes', time: '09:20', read: true },
    { id: 'm4', sender: 'them', text: 'Merci pour le retour, je corrige ça', time: '09:25', read: true },
  ],
};

export default function MessagingPage() {
  const navigate = useEnterpriseNavigate();
  const [searchParams] = useSearchParams();
  const dmParam = searchParams.get('dm');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const dmConversation = useMemo<Conversation | null>(() => {
    if (!dmParam) return null;
    const ent = enterprises.find((e) => e.id === dmParam);
    if (!ent) return null;
    const existing = mockConversations.find(
      (c) => c.username.toLowerCase() === ent.name.toLowerCase()
    );
    if (existing) return null;
    return {
      id: `dm-${ent.id}`,
      username: ent.name,
      avatar: ent.logo,
      verified: ent.verified,
      lastMessage: '',
      time: 'Maintenant',
      unread: 0,
      online: true,
      platform: Object.keys(ent.socials)[0] || 'instagram',
    };
  }, [dmParam]);

  const allConversations = useMemo(() => {
    if (dmConversation) return [dmConversation, ...mockConversations];
    return mockConversations;
  }, [dmConversation]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const defaultActive = dmConversation ? dmConversation.id
    : dmParam ? (mockConversations.find((c) => c.username.toLowerCase() === dmParam.toLowerCase())?.id ?? (isMobile ? null : 'conv1'))
    : (isMobile ? null : 'conv1');

  const [activeConversation, setActiveConversation] = useState<string | null>(defaultActive);

  const filteredConversations = allConversations.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeConversation ? messages[activeConversation] || [] : [];
  const currentConversation = allConversations.find((c) => c.id === activeConversation);

  const [deletedConvIds, setDeletedConvIds] = useState<Set<string>>(new Set());
  const [blockedConvIds, setBlockedConvIds] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'block' | 'report'; convId: string; username: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const visibleConversations = useMemo(() => {
    return filteredConversations.filter((c) => !deletedConvIds.has(c.id) && !blockedConvIds.has(c.id));
  }, [filteredConversations, deletedConvIds, blockedConvIds]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), msg],
    }));
    setNewMessage('');
  };

  const handleDeleteConversation = (convId: string) => {
    setDeletedConvIds((prev) => new Set(prev).add(convId));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    if (activeConversation === convId) {
      const remaining = allConversations.filter((c) => c.id !== convId && !deletedConvIds.has(c.id) && !blockedConvIds.has(c.id));
      setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
    }
    setConfirmModal(null);
    setShowMenu(false);
  };

  const handleBlockUser = (convId: string) => {
    setBlockedConvIds((prev) => new Set(prev).add(convId));
    if (activeConversation === convId) {
      const remaining = allConversations.filter((c) => c.id !== convId && !deletedConvIds.has(c.id) && !blockedConvIds.has(c.id));
      setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
    }
    setConfirmModal(null);
    setShowMenu(false);
  };

  function handleNavigateToProfile() {
    if (!currentConversation) return;
    if (currentConversation.id.startsWith('dm-')) {
      const enterpriseId = currentConversation.id.replace('dm-', '');
      navigate(`/entreprise/${enterpriseId}`);
      return;
    }
    const creator = mockCreatorsDetail.find(
      (c) => c.username.toLowerCase() === currentConversation.username.toLowerCase()
    );
    if (creator) {
      navigate(`/createur/${creator.id}`);
    }
  }

  const [reportedToast, setReportedToast] = useState(false);
  const handleReportUser = () => {
    setConfirmModal(null);
    setShowMenu(false);
    setReportedToast(true);
    setTimeout(() => setReportedToast(false), 3000);
  };

  return (
    <div className="text-white flex flex-col" style={{ backgroundColor: '#050404', overscrollBehavior: 'none', touchAction: 'pan-x pan-y', height: '100dvh', marginBottom: 'calc(-1 * (env(safe-area-inset-bottom) + 4rem))' }}>
      <div className="hidden lg:flex px-4 sm:px-6 lg:px-8 pt-8 pb-6 items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="text-xl lg:text-2xl font-bold">Messagerie</h1>
      </div>

      <div
        className={`lg:hidden px-4 py-3 flex items-center gap-3 ${activeConversation ? 'hidden' : 'flex'}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-lg font-bold">Messagerie</h1>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0" style={{ height: 0 }}>
        <div
          className={`w-full lg:w-80 shrink-0 flex flex-col overflow-hidden min-h-0 ${activeConversation ? 'hidden lg:flex' : 'flex'}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="p-4">
            <div
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className="w-full px-4 py-3.5 flex items-center gap-3 transition-all duration-150 hover:bg-white/[0.03]"
                style={{
                  backgroundColor: activeConversation === conv.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: activeConversation === conv.id ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                }}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.username}
                    draggable={false}
                    className="w-11 h-11 rounded-full object-cover select-none"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }}
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2" style={{ borderColor: '#1D1C1C' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-semibold text-white truncate">@{conv.username}</span>
                      {conv.verified && <img src={bcreateur} alt="" className="w-5 h-5 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-white/25 font-medium shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-white/35 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ml-2"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
          {currentConversation ? (
            <>
              <div
                className="px-4 lg:px-6 py-4 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                <button
                  onClick={handleNavigateToProfile}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={currentConversation.avatar}
                      alt={currentConversation.username}
                      draggable={false}
                      className="w-10 h-10 rounded-full object-cover select-none"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }}
                    />
                    {currentConversation.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2" style={{ borderColor: '#1D1C1C' }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">@{currentConversation.username}</span>
                      {currentConversation.verified && <img src={bcreateur} alt="" className="w-[23px] h-[23px]" />}
                      {platformIcons[currentConversation.platform] && (
                        <img src={platformIcons[currentConversation.platform]} alt="" className="w-4 h-4 ml-1 social-icon" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: currentConversation.online ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                      />
                      <p className="text-[11px] text-white/30">
                        {currentConversation.online ? 'En ligne' : 'Hors ligne'}
                      </p>
                    </div>
                  </div>
                </button>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((p) => !p)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {showMenu && (
                    <div
                      className="absolute right-0 top-11 w-52 rounded-xl py-1.5 z-50 overflow-hidden"
                      style={{
                        background: 'rgba(30,30,32,0.65)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <button
                        onClick={() => {
                          if (!currentConversation) return;
                          setShowMenu(false);
                          setConfirmModal({ type: 'delete', convId: currentConversation.id, username: currentConversation.username });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Supprimer la conversation</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!currentConversation) return;
                          setShowMenu(false);
                          setConfirmModal({ type: 'report', convId: currentConversation.id, username: currentConversation.username });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <Flag className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Signaler</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!currentConversation) return;
                          setShowMenu(false);
                          setConfirmModal({ type: 'block', convId: currentConversation.id, username: currentConversation.username });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <ShieldBan className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Bloquer cet utilisateur</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 px-4 lg:px-6 py-6 space-y-4">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3"
                      style={{
                        backgroundColor: msg.sender === 'me' ? 'rgb(55,55,55)' : 'rgba(255,255,255,0.06)',
                        border: msg.sender === 'me' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.08)',
                        borderBottomRightRadius: msg.sender === 'me' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.sender === 'me' ? '16px' : '4px',
                      }}
                    >
                      <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1.5 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/40">{msg.time}</span>
                        {msg.sender === 'me' && (
                          msg.read
                            ? <CheckCheck className="w-3 h-3 text-white/60" />
                            : <Check className="w-3 h-3 text-white/40" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 lg:px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-4 shrink-0">
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <button className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Image className="w-4 h-4 text-white" />
                  </button>
                  <button className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Paperclip className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ecrire un message..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                    style={{ backgroundColor: newMessage.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', border: newMessage.trim() ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent' }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                >
                  <Send className="w-7 h-7 text-white/15" />
                </div>
                <p className="text-sm text-white/30 font-medium">Selectionnez une conversation</p>
                <p className="text-xs text-white/15 mt-1">Choisissez un createur pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmModal && (
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
              onClick={() => setConfirmModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: confirmModal.type === 'block' ? 'rgba(239,68,68,0.1)' : confirmModal.type === 'report' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${confirmModal.type === 'block' ? 'rgba(239,68,68,0.2)' : confirmModal.type === 'report' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {confirmModal.type === 'block'
                ? <ShieldBan className="w-5 h-5 text-red-400" />
                : confirmModal.type === 'report'
                  ? <Flag className="w-5 h-5 text-amber-400" />
                  : <AlertTriangle className="w-5 h-5 text-amber-400" />
              }
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {confirmModal.type === 'delete' ? 'Supprimer la conversation' : confirmModal.type === 'report' ? 'Signaler cet utilisateur' : 'Bloquer cet utilisateur'}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {confirmModal.type === 'delete'
                ? `La conversation avec @${confirmModal.username} sera définitivement supprimée. Cette action est irréversible.`
                : confirmModal.type === 'report'
                  ? `@${confirmModal.username} sera signalé à notre équipe de modération pour examen. Nous traiterons votre signalement dans les plus brefs délais.`
                  : `@${confirmModal.username} ne pourra plus vous envoyer de messages et sera retiré de vos conversations.`
              }
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'delete') handleDeleteConversation(confirmModal.convId);
                  else if (confirmModal.type === 'report') handleReportUser();
                  else handleBlockUser(confirmModal.convId);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: confirmModal.type === 'block' ? '#dc2626' : confirmModal.type === 'report' ? '#d97706' : '#fff',
                  color: '#fff',
                  ...(confirmModal.type === 'delete' ? { background: '#fff', color: '#000' } : {}),
                }}
              >
                {confirmModal.type === 'delete' ? 'Supprimer' : confirmModal.type === 'report' ? 'Signaler' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-6 left-1/2 z-[110] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          background: 'rgba(30,30,30,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          opacity: reportedToast ? 1 : 0,
          transform: reportedToast ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
          pointerEvents: reportedToast ? 'auto' : 'none',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <Flag className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Signalement envoyé</p>
          <p className="text-[11px] text-white/40">Notre équipe examinera ce profil</p>
        </div>
      </div>
    </div>
  );
}
