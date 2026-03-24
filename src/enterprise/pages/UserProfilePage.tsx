import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, MessageCircle, User, MoreVertical, Flag, ShieldBan, X } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const DEFAULT_BANNER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

const socialPlatformKeys = ['instagram', 'tiktok', 'youtube'];

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

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
  const navigate = useEnterpriseNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [modal, setModal] = useState<{ type: 'report' | 'block' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuRefDesktop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inMobile = menuRef.current && menuRef.current.contains(target);
      const inDesktop = menuRefDesktop.current && menuRefDesktop.current.contains(target);
      if (!inMobile && !inDesktop) {
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
      <div className="text-white min-h-screen" style={{ backgroundColor: '#050404' }}>
        <div className="h-44 lg:h-56 w-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="max-w-3xl mx-auto px-4 lg:px-8 -mt-12 pb-12">
          <div className="flex items-end justify-between mb-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.08)', border: '3px solid #050404' }} />
          </div>
          <div className="h-6 w-40 rounded-lg animate-pulse mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-4 w-24 rounded-lg animate-pulse mb-6" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-4 w-full rounded-lg animate-pulse mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
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
    <div className="text-white" style={{ backgroundColor: '#050404' }}>
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={profile.banner_url || DEFAULT_BANNER}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
          }}
        />
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
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

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-16">
        <div className="flex items-end gap-5 mb-8">
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
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">@{profile.username}</h1>
              <img src={jentrepriseIcon} alt="Verified" className="w-[29px] h-[29px]" />
            </div>
            {profile.display_name && (
              <p className="text-sm text-white/50 mb-0.5">{profile.display_name}</p>
            )}
            <p className="text-xs text-white/30">Membre depuis {joinedDate}</p>
            <button
              onClick={() => navigate(`/messagerie?dm=${profile.username}`)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 mt-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96] w-fit"
              style={{ background: '#fff', color: '#000' }}
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-white leading-relaxed max-w-2xl mb-6">{profile.bio}</p>
        )}

        <div className="flex items-center gap-2.5 mb-5">
          {socialPlatformKeys.map((key) => (
            <div
              key={key}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img src={platformIcons[key]} alt={key} className="w-8 h-8 object-contain" />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
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

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => navigate(`/messagerie?dm=${profile.username}`)}
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
                ? 'Vous ne verrez plus le profil de cet utilisateur. Cette action peut etre annulee.'
                : 'Nous examinerons votre signalement dans les plus brefs delais.'}
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
  );
}
