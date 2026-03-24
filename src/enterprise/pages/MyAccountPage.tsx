import { useState, useEffect, useRef } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { Camera, Pencil, Check, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import ttIcon from '@/shared/assets/tiktok.svg';
import instaIcon from '@/shared/assets/instagram-logo.svg';
import symbolIcon from '@/shared/assets/youtube-symbol.svg';
import GrapeLoader from '../components/GrapeLoader';
import rectangleGradient from '@/shared/assets/account-banner-gradient.svg';
import certificationBtn from '@/shared/assets/certification-button-bg.svg';
import { supabase } from '@/shared/infrastructure/supabase';
import { useProfile, PROFILE_ID } from '@/shared/lib/useProfile';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import iphone17Img from '@/shared/assets/hero-slide-iphone17.jpeg';
import bo7Img from '@/shared/assets/hero-slide-bo7.jpeg';

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
  const navigate = useEnterpriseNavigate();
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
    <main className="text-white" style={{ background: '#050404' }}>
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

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

        <div className="flex-1 min-w-0 max-w-2xl">

          {/* Banniere */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-white uppercase tracking-widest">Bannière</p>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <Camera className="w-3 h-3" />
              Changer la bannière
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
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
              }}
            />
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
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
                    placeholder="Décrivez votre entreprise..."
                    className="w-full text-sm text-white bg-transparent outline-none border-b-2 border-white/20 focus:border-white/50 transition-colors resize-none pb-1"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Escape') setEditingBio(false); }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={saveBio}
                      disabled={savingBio}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
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

          {/* Reseaux sociaux */}
          <div className="mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px' }}>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Réseaux sociaux</p>
            <p className="text-sm text-white/40 mb-4">Connecte tes comptes pour suivre tes performances</p>
            <div className="space-y-3">
              {[
                { name: 'Instagram', icon: instaIcon },
                { name: 'TikTok', icon: ttIcon },
                { name: 'YouTube', icon: symbolIcon },
              ].map((network) => (
                <div
                  key={network.name}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img src={network.icon} alt={network.name} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{network.name}</p>
                      <p className="text-xs text-white/30">Non connecté</p>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                  >
                    Connecter
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Badge certifie */}
          <div
            className="rounded-2xl p-5"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <img src={jentrepriseIcon} alt="Certifie" className="w-[34px] h-[34px]" />
              <h3 className="text-base font-bold text-white">Badge certifié</h3>
            </div>
            <p className="text-sm text-white/40 mb-6">La vérification permet de bénéficier de nombreux avantages</p>
            <div className="flex justify-start">
              <button
                onClick={() => navigate('/certification')}
                className="relative flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] overflow-hidden"
                style={{ borderRadius: '12px', padding: 0, background: 'none', border: 'none' }}
              >
                <img src={certificationBtn} alt="Obtenir la certification" className="rounded-xl" style={{ height: '42px', width: '200px', display: 'block' }} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold" style={{ color: '#ffffff' }}>Obtenir la certification</span>
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
                        style={{ width: i === currentSlide ? '18px' : '6px', height: '6px', background: i === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
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
  );
}

