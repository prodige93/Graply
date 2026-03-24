import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil, Check, Shield, ChevronLeft, ChevronRight, Unlink } from 'lucide-react';
import GrapeLoader from '../components/GrapeLoader';
import rectangleGradient from '@/shared/assets/account-banner-gradient.svg';
import { supabase } from '@/shared/infrastructure/supabase';
import { useProfile, PROFILE_ID } from '@/shared/lib/useProfile';
import verifiedIcon from '@/shared/assets/badge-creator-verified.png';
import certBtnBg from '@/shared/assets/certification-button-bg.svg';
import iphone17Img from '@/shared/assets/hero-slide-iphone17.jpeg';
import bo7Img from '@/shared/assets/hero-slide-bo7.jpeg';
import Sidebar from '../components/Sidebar';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: instagramIcon, placeholder: '@tonpseudo' },
  { key: 'tiktok', label: 'TikTok', icon: tiktokIcon, placeholder: '@tonpseudo' },
  { key: 'youtube', label: 'YouTube', icon: youtubeIcon, placeholder: '@tachaîne' },
] as const;

type SocialKey = typeof SOCIAL_PLATFORMS[number]['key'];

const DEFAULT_BANNER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${PROFILE_ID}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true, contentType: file.type });
  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return data.publicUrl;
}

const slides = [
  { id: 1, title: 'iPhone 17', image: iphone17Img, subtitle: 'Nouvelle collection' },
  { id: 2, title: 'Black Ops 7', image: bo7Img, subtitle: 'Campagne exclusive' },
];

export default function MyAccountPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSocial, setEditingSocial] = useState<SocialKey | null>(null);
  const [tempHandle, setTempHandle] = useState('');
  const [savingSocial, setSavingSocial] = useState(false);

  const socialHandles: Record<SocialKey, string> = {
    instagram: profile?.instagram_handle || '',
    tiktok: profile?.tiktok_handle || '',
    youtube: profile?.youtube_handle || '',
  };
  const connectedSocials: Record<SocialKey, boolean> = {
    instagram: !!socialHandles.instagram,
    tiktok: !!socialHandles.tiktok,
    youtube: !!socialHandles.youtube,
  };

  function startConnectSocial(key: SocialKey) {
    setTempHandle(socialHandles[key]);
    setEditingSocial(key);
  }

  async function saveSocialHandle(key: SocialKey) {
    setSavingSocial(true);
    const col = `${key}_handle` as const;
    const value = tempHandle.trim();
    await supabase.from('profiles').update({ [col]: value, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ [col]: value } as Partial<import('@/shared/lib/useProfile').Profile>);
    setSavingSocial(false);
    setEditingSocial(null);
  }

  async function disconnectSocial(key: SocialKey) {
    const col = `${key}_handle` as const;
    await supabase.from('profiles').update({ [col]: '', updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ [col]: '' } as Partial<import('@/shared/lib/useProfile').Profile>);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const displayBanner = profile?.banner_url || DEFAULT_BANNER;
  const displayUsername = profile?.username || 'username';

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    updateProfile({ avatar_url: localPreview });
    setUploadingAvatar(true);
    const url = await uploadFile(file, 'profile-pics');
    if (url) {
      await supabase.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
      updateProfile({ avatar_url: url });
    }
    setUploadingAvatar(false);
    e.target.value = '';
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    updateProfile({ banner_url: localPreview });
    setUploadingBanner(true);
    const url = await uploadFile(file, 'banners');
    if (url) {
      await supabase.from('profiles').update({ banner_url: url, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
      updateProfile({ banner_url: url });
    }
    setUploadingBanner(false);
    e.target.value = '';
  }

  function startEditUsername() {
    setNewUsername(displayUsername);
    setEditingUsername(true);
  }

  function startEditBio() {
    setNewBio(profile?.bio || '');
    setEditingBio(true);
  }

  async function saveBio() {
    setSavingBio(true);
    await supabase.from('profiles').update({ bio: newBio.trim(), updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ bio: newBio.trim() });
    setSavingBio(false);
    setEditingBio(false);
  }

  async function saveUsername() {
    if (!newUsername.trim() || newUsername === displayUsername) {
      setEditingUsername(false);
      return;
    }
    setSavingUsername(true);
    await supabase.from('profiles').update({ username: newUsername.trim(), updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ username: newUsername.trim() });
    setSavingUsername(false);
    setEditingUsername(false);
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ background: '#050404' }}>
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

      <Sidebar
        activePage="mon-compte"
        onOpenSearch={() => {}}
      />

      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0" style={{ background: '#050404' }}>

        <div className="flex items-center gap-3 px-4 pt-4 pb-2 lg:hidden">
          <button
            onClick={() => navigate('/profil')}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>
        </div>

        <div className="p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8">

        <div className="flex-1 min-w-0">

          {/* Banniere */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-white uppercase tracking-widest">Banniere</p>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <Camera className="w-3 h-3" />
              Changer la banniere
            </button>
          </div>
          <div
            className="relative rounded-xl overflow-hidden mb-6"
            style={{ height: '140px', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {uploadingBanner ? (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <GrapeLoader size="sm" />
              </div>
            ) : (
              <img src={displayBanner} alt="Banner" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Logo */}
          <div className="mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white uppercase tracking-widest">Logo</p>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <Camera className="w-3 h-3" />
                Changer le logo
              </button>
            </div>
            <div
              className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group"
              style={{ border: '3px solid #050404', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploadingAvatar ? (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <GrapeLoader size="sm" />
                </div>
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{displayUsername[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity duration-300" style={{ opacity: avatarHover && !uploadingAvatar ? 1 : 0, background: 'rgba(0,0,0,0.5)' }}>
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div className="flex items-start justify-between mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Nom d'utilisateur</p>
              {editingUsername ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl font-bold text-white/30">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="text-xl font-bold text-white bg-transparent outline-none border-b-2 border-white/20 focus:border-white/50 transition-colors pb-0.5"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') setEditingUsername(false); }}
                  />
                  <button
                    onClick={saveUsername}
                    disabled={savingUsername}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                    style={{ background: '#fff' }}
                  >
                    {savingUsername ? <GrapeLoader size="sm" /> : <Check className="w-4 h-4 text-black" />}
                  </button>
                  <button onClick={() => setEditingUsername(false)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    Annuler
                  </button>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white mt-1">@{displayUsername}</h2>
              )}
              <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Modifiable tous les 2 semaines
              </p>
            </div>
            {!editingUsername && (
              <button
                onClick={startEditUsername}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95 mt-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <Pencil className="w-3 h-3" />
                Modifier
              </button>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start justify-between mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Description</p>
              {editingBio ? (
                <div className="mt-2">
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows={3}
                    placeholder="Decrivez votre entreprise..."
                    className="w-full text-sm text-white bg-transparent outline-none border-b-2 border-white/20 focus:border-white/50 transition-colors resize-none pb-1"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Escape') setEditingBio(false); }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={saveBio}
                      disabled={savingBio}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                      style={{ background: '#fff' }}
                    >
                      {savingBio ? <GrapeLoader size="sm" /> : <Check className="w-4 h-4 text-black" />}
                    </button>
                    <button onClick={() => setEditingBio(false)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/70 mt-1 leading-relaxed">
                  {profile?.bio || <span className="text-white/25 italic">Aucune description</span>}
                </p>
              )}
            </div>
            {!editingBio && (
              <button
                onClick={startEditBio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95 mt-1 shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <Pencil className="w-3 h-3" />
                Modifier
              </button>
            )}
          </div>

          {/* Réseaux sociaux */}
          <div className="mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="text-base font-bold text-white">Réseaux sociaux</h3>
            </div>
            <p className="text-sm text-white/40 mb-5">Connecte tes comptes pour suivre tes performances</p>

            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map((platform) => {
                const key = platform.key;
                const isConnected = connectedSocials[key];
                const isEditing = editingSocial === key;
                const handle = socialHandles[key];

                return (
                  <div
                    key={key}
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{
                      background: isConnected ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
                      border: isConnected ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <img src={platform.icon} alt={platform.label} className="w-9 h-9 shrink-0" />

                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <input
                          type="text"
                          value={tempHandle}
                          onChange={(e) => setTempHandle(e.target.value)}
                          placeholder={platform.placeholder}
                          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none border-b border-white/20 focus:border-white/50 transition-colors pb-0.5"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveSocialHandle(key);
                            if (e.key === 'Escape') setEditingSocial(null);
                          }}
                        />
                        <button
                          onClick={() => saveSocialHandle(key)}
                          disabled={savingSocial}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95"
                          style={{ background: '#fff', color: '#000' }}
                        >
                          {savingSocial ? <GrapeLoader size="sm" /> : <Check className="w-3 h-3" />}
                          OK
                        </button>
                        <button
                          onClick={() => setEditingSocial(null)}
                          className="text-xs text-white/40 hover:text-white/70 transition-colors shrink-0"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{platform.label}</p>
                          {isConnected && handle ? (
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(16,185,129,0.8)' }}>{handle}</p>
                          ) : (
                            <p className="text-xs text-white/30 mt-0.5">Non connecté</p>
                          )}
                        </div>

                        {isConnected ? (
                          <button
                            onClick={() => disconnectSocial(key)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 hover:bg-red-500/10 active:scale-95"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                          >
                            <Unlink className="w-3 h-3" />
                            Déconnecter
                          </button>
                        ) : (
                          <button
                            onClick={() => startConnectSocial(key)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 hover:bg-white/10 active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                          >
                            Connecter
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge certifie */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <img src={verifiedIcon} alt="Certifié" className="w-[34px] h-[34px]" />
              <h3 className="text-base font-bold text-white">Vérifiez votre profil de créateur</h3>
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-6">
              Vérifiez votre profil de créateur pour collaborer en toute confiance avec les marques sur la plateforme.
            </p>

            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Pourquoi se certifier ?</p>
              <p className="text-sm text-white/60 leading-relaxed mb-5">
                Obtenez un badge officiel qui confirme que votre profil de créateur est authentique, professionnel et fiable.
              </p>

              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Avantages</p>
              <ul className="space-y-2.5">
                {[
                  'Gagnez la confiance des marques',
                  'Accedez a plus d\'opportunites de collaboration',
                  'Renforcez votre credibilite sur la plateforme',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <Check className="w-2.5 h-2.5" style={{ color: '#4ade80' }} />
                    </div>
                    <span className="text-sm text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-start pt-2">
              <button
                className="relative flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] overflow-hidden cursor-default opacity-50"
                style={{ borderRadius: '12px', padding: 0, background: 'none', border: 'none' }}
                disabled
              >
                <img src={certBtnBg} alt="Obtenir la certification" style={{ height: '42px', width: '200px', borderRadius: '12px', display: 'block' }} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold" style={{ color: '#FFFFFF' }}>
                  Bientot disponible
                </span>
              </button>
            </div>
          </div>

        </div>

        <div className="hidden lg:flex w-[340px] shrink-0 sticky top-8 self-start flex-col items-center gap-4 ml-auto">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest text-center w-full">Top campagne</h3>
          <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: '240px' }}>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-all duration-500"
                style={{ transform: `translateX(${(index - currentSlide) * 100}%)`, opacity: index === currentSlide ? 1 : 0 }}
              >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{slide.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{slide.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                        className="rounded-full transition-all duration-300"
                        style={{ width: i === currentSlide ? '14px' : '4px', height: '4px', background: i === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            onClick={() => navigate('/campagnes')}
            className="px-5 py-2 rounded-full text-xs font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#ffffff' }}
          >
            Voir la campagne
          </button>
          <p className="text-xs text-white/30 text-center leading-relaxed max-w-[280px]">
            Les tops campagnes sont les campagnes qui mettent le plus de budget
          </p>
        </div>

        </div>
      </main>
    </div>
  );
}

