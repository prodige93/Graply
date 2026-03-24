import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User, MoreVertical, Flag, ShieldBan, X, Video } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/shared/infrastructure/supabase';
import GrapeLoader from '../components/GrapeLoader';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';

const DEFAULT_BANNER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  content_tags: string[];
  website: string;
  created_at: string;
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; backState?: Record<string, unknown> } | null;
  const from = locationState?.from;
  const backState = locationState?.backState;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, banner_url, content_tags, website, created_at')
      .eq('username', username)
      .eq('is_public', true)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [username]);

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

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Utilisateur introuvable</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={profile.banner_url || DEFAULT_BANNER}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1C1C] via-black/40 to-black/10" />
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => from ? navigate(from, { state: backState ?? null }) : navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              boxShadow: '0 2px 14px rgba(0,0,0,0.55)',
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="flex items-end gap-5 mb-5">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
            style={{
              border: '3px solid #1D1C1C',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              background: profile.avatar_url ? undefined : 'linear-gradient(135deg, #f97316, #ec4899)',
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">@{profile.username}</h1>
                <img src={verifiedIcon} alt="Verified" className="w-[29px] h-[29px]" />
              </div>
              {profile.display_name && (
                <p className="text-sm text-white/50 mb-0.5">{profile.display_name}</p>
              )}
              <p className="text-xs text-white/30 mb-2">Membre depuis {joinedDate}</p>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => navigate(`/messagerie?dm=${profile.username}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                  style={{ background: '#fff', color: '#000' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <button
                onClick={() => navigate(`/messagerie?dm=${profile.username}`)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                style={{ background: '#fff', color: '#000' }}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <div className="relative" ref={menuRef}>
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
                    style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                  >
                    <button
                      onClick={() => { setShowMenu(false); setModal({ type: 'report' }); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <Flag className="w-4 h-4 text-amber-400/70" />
                      <span className="text-sm text-white">Signaler</span>
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setModal({ type: 'block' }); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <ShieldBan className="w-4 h-4 text-red-400/70" />
                      <span className="text-sm text-red-400/80">Bloquer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-white leading-relaxed max-w-2xl mb-6">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {(profile.content_tags || []).map((tag) => (
            <span
              key={tag}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Video className="w-4 h-4 text-white/40" />
            <span className="text-sm font-bold text-white">0</span>
            <span className="text-sm text-white/40">videos</span>
          </div>
        </div>

        {profile.website && (
          <a
            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {profile.website}
          </a>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
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
                : <Flag className="w-5 h-5 text-amber-400" />}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {modal.type === 'block' ? `Bloquer @${profile.username}` : `Signaler @${profile.username}`}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {modal.type === 'block'
                ? 'Vous ne verrez plus le profil de cet utilisateur. Cette action peut être annulée.'
                : 'Nous examinerons votre signalement dans les plus brefs délais.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: modal.type === 'block' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  border: `1px solid ${modal.type === 'block' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  color: modal.type === 'block' ? '#ef4444' : '#f59e0b',
                }}
              >
                {modal.type === 'block' ? 'Bloquer' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
