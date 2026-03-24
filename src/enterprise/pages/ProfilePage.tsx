import { useState, useEffect, useRef } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { MessageCircle, Users, Megaphone, Globe, Camera, Lock, Unlock, Pencil, Check, ChevronDown, ArrowLeft, MessageSquareOff, MessageSquare, Bookmark, Plus, X } from 'lucide-react';
import GrapeLoader from '../components/GrapeLoader';
import { supabase } from '@/shared/infrastructure/supabase';
import { useProfile, PROFILE_ID } from '@/shared/lib/useProfile';
import { useSavedCampaigns } from '@/enterprise/contexts/SavedCampaignsContext';
import { useMyCampaigns } from '@/enterprise/contexts/MyCampaignsContext';
import { useCampaignTab } from '@/enterprise/contexts/CampaignTabContext';
import { campaigns as allCampaignsData, sponsoredCampaigns } from '@/shared/data/campaignsData';
import CampaignCard from '../components/CampaignCard';
import ActiveCampaignCard from '../components/campaign-cards/ActiveCampaignCard';
import DraftCard from '../components/campaign-cards/DraftCard';
import SavedCampaignCard from '../components/campaign-cards/SavedCampaignCard';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-symbol.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const DEFAULT_BANNER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const brandSocials = ['instagram', 'tiktok', 'youtube'];

const allCampaignsList = [...allCampaignsData, ...sponsoredCampaigns];

const AVAILABLE_TAGS = [
  'Technologie', 'Gaming', 'Lifestyle', 'Fitness', 'Mode', 'Beauté',
  'Cuisine', 'Voyage', 'Musique', 'Sport', 'Entertainment', 'Crypto',
  'Business', 'Education', 'Art', 'Photographie', 'Automobile', 'Sante',
];

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${PROFILE_ID}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(fileName, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    console.error('Upload error:', error);
    return URL.createObjectURL(file);
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return data.publicUrl;
}

export default function ProfilePage() {
  const navigate = useEnterpriseNavigate();
  const { savedIds, toggle } = useSavedCampaigns();
  const { campaigns, pausedCampaigns, drafts, loading, deleteDraft, deleteActiveCampaign } = useMyCampaigns();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { profile, updateProfile } = useProfile();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [togglingMessaging, setTogglingMessaging] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { tab: profileTab, setTab: setProfileTab } = useCampaignTab();
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  function startEditing() {
    setEditBio(profile?.bio || '');
    setEditWebsite(profile?.website || '');
    setEditTags(profile?.content_tags || []);
    setEditing(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    await supabase.from('profiles').update({
      bio: editBio,
      website: editWebsite,
      content_tags: editTags,
      updated_at: new Date().toISOString(),
    }).eq('id', PROFILE_ID);
    updateProfile({ bio: editBio, website: editWebsite, content_tags: editTags });
    setSavingProfile(false);
    setEditing(false);
  }

  function toggleTag(tag: string) {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteDraft = async (draftId: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', draftId).eq('status', 'draft');
    if (!error) {
      deleteDraft(draftId);
    }
  };

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

  async function toggleVisibility() {
    if (!profile) return;
    setTogglingVisibility(true);
    const newValue = !profile.is_public;
    await supabase.from('profiles').update({ is_public: newValue, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ is_public: newValue });
    setTogglingVisibility(false);
  }

  async function toggleMessaging() {
    if (!profile) return;
    setTogglingMessaging(true);
    const newValue = !profile.messaging_enabled;
    await supabase.from('profiles').update({ messaging_enabled: newValue, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
    updateProfile({ messaging_enabled: newValue });
    setTogglingMessaging(false);
  }

  const savedCampaignsList = allCampaignsList.filter((c) => savedIds.includes(c.id));

  const displayBanner = profile?.banner_url || DEFAULT_BANNER;
  const displayUsername = profile?.username || 'username';
  const displayWebsite = profile?.website || 'www.username.com';
  const displayBio = profile?.bio || 'Marque officielle. Nous collaborons avec des créateurs pour inspirer et innover.';
  const displayTags = profile?.content_tags?.length ? profile.content_tags : ['Technologie'];
  const isPublic = profile?.is_public ?? true;
  const messagingEnabled = profile?.messaging_enabled ?? true;

  return (
    <>
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

      <main className="text-white" style={{ background: '#050404' }}>
        <div
          className="relative h-56 overflow-hidden cursor-pointer group"
          onMouseEnter={() => setBannerHover(true)}
          onMouseLeave={() => setBannerHover(false)}
          onClick={() => bannerInputRef.current?.click()}
        >
          {uploadingBanner ? (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <GrapeLoader size="md" />
            </div>
          ) : (
            <img src={displayBanner} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(5,4,4,0.5) 75%, rgba(5,4,4,0.88) 88%, rgba(5,4,4,1) 100%)'
            }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}
            title="Retour a l'accueil"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: bannerHover && !uploadingBanner ? 1 : 0, background: 'rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Camera className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Changer la bannière</span>
            </div>
          </div>
        </div>

        <div className="relative px-4 lg:px-10 -mt-16">
          <div className="relative z-10 mb-5">
            <div
              className="relative w-28 h-28 rounded-2xl overflow-hidden cursor-pointer group"
              style={{ border: '4px solid #050404' }}
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
                  <span className="text-4xl font-black text-white">{displayUsername[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
              <div
                className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: avatarHover && !uploadingAvatar ? 1 : 0, background: 'rgba(0,0,0,0.5)' }}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl lg:text-2xl font-bold text-white">@{displayUsername}</h1>
              <img src={jentrepriseIcon} alt="Verified" className="w-[29px] h-[29px]" />
              <button
                onClick={toggleVisibility}
                disabled={togglingVisibility}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#ffffff',
                }}
              >
                {togglingVisibility ? (
                  <GrapeLoader size="sm" />
                ) : isPublic ? (
                  <Unlock className="w-3 h-3" style={{ color: '#22c55e' }} />
                ) : (
                  <Lock className="w-3 h-3" style={{ color: '#ef4444' }} />
                )}
                <span style={{ color: '#ffffff' }}>{isPublic ? 'Public' : 'Privé'}</span>
              </button>
              {!editing && (
                <button
                  onClick={startEditing}
                  className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <Pencil className="w-3 h-3" />
                  Modifier
                </button>
              )}
            </div>

            {editing ? (
              <div className="mt-4 max-w-xl space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Décrivez votre marque en quelques mots..."
                  />
                  <span className="text-[10px] text-white/25 mt-0.5 block text-right">{editBio.length}/200</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Site web</label>
                  <div
                    className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all duration-200 focus-within:ring-1 focus-within:ring-white/20"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Globe className="w-4 h-4 text-white/30 shrink-0" />
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                      placeholder="www.votre-site.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Contenu</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:brightness-125 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 text-white/50" />
                      </span>
                    ))}
                  </div>
                  <div ref={tagDropdownRef} className="relative">
                    <button
                      onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/[0.08]"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un contenu
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {tagDropdownOpen && (
                      <div
                        className="absolute z-50 mt-2 w-64 max-h-56 overflow-y-auto rounded-xl py-2 shadow-2xl"
                        style={{
                          background: 'rgba(30, 28, 28, 0.55)',
                          backdropFilter: 'blur(28px)',
                          WebkitBackdropFilter: 'blur(28px)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                        }}
                      >
                        {AVAILABLE_TAGS.filter((t) => !editTags.includes(t)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { toggleTag(tag); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                        {AVAILABLE_TAGS.filter((t) => !editTags.includes(t)).length === 0 && (
                          <p className="px-4 py-3 text-xs text-white/30">Tous les tags sont sélectionnés</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                    style={{ background: '#fff', color: '#000' }}
                  >
                    {savingProfile ? <GrapeLoader size="sm" /> : <Check className="w-4 h-4" />}
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setEditing(false); setTagDropdownOpen(false); }}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-white leading-relaxed mt-2 max-w-xl">{displayBio}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {displayTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{campaigns.length}</span>
                <span className="text-sm text-white/40">campagnes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">4.8<span className="text-white">K</span></span>
                <span className="text-sm text-white/40">créateurs</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/messagerie')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96]"
                style={{ background: '#fff', color: '#000' }}
              >
                <MessageCircle className="w-4 h-4" />
                Mes messages
              </button>

              <div className="h-5 w-px mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <button
                onClick={toggleMessaging}
                disabled={togglingMessaging}
                className="relative flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95 group"
                style={{
                  background: messagingEnabled ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: messagingEnabled ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                }}
                title={messagingEnabled ? 'Messages actifs - cliquez pour désactiver' : 'Messages désactivés - cliquez pour activer'}
              >
                {togglingMessaging ? (
                  <GrapeLoader size="sm" />
                ) : messagingEnabled ? (
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                ) : (
                  <MessageSquareOff className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                )}
                <div
                  className="w-7 h-4 rounded-full relative transition-all duration-300"
                  style={{
                    background: messagingEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      left: messagingEnabled ? '14px' : '2px',
                      background: messagingEnabled ? '#22c55e' : 'rgba(255,255,255,0.35)',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            {brandSocials.map((s) => (
              <button
                key={s}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:brightness-125"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img src={platformIcons[s]} alt={s} className="w-5 h-5 object-contain" />
              </button>
            ))}
            <button
              onClick={() => navigate('/mon-compte')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <Pencil className="w-3 h-3" />
              Modifier
            </button>
          </div>

          <a
            href={`https://${displayWebsite}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
          >
            <Globe className="w-3.5 h-3.5" />
            {displayWebsite}
          </a>
        </div>

        <div className="overflow-x-auto scrollbar-hide px-4" style={{ background: '#050404' }}>
          <div className="flex items-center gap-0 min-w-max">
            {([
              { key: 'active' as const, label: 'Campagne en cours' },
              { key: 'paused' as const, label: 'En pause' },
              { key: 'saved' as const, label: 'Enregistrées' },
              { key: 'drafts' as const, label: 'Brouillons' },
            ]).map((tab) => {
              const isActive = profileTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setProfileTab(tab.key)}
                  className="relative px-4 lg:px-5 py-3.5 text-[13px] lg:text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}
                >
                  {tab.label}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '60%' : '0%',
                      background: isActive ? '#A15EFF' : 'transparent',
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="px-4 lg:px-10">
          {!isPublic && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mt-6 mb-6"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <Lock className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-xs text-white/50 leading-relaxed">
                Votre profil est en mode <span className="font-semibold text-white/70">privé</span>. Les visiteurs ne verront que vos informations de marque. Vos campagnes restent masquées.
              </p>
            </div>
          )}

          {profileTab === 'active' && (
            <div className="pb-12">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <GrapeLoader size="md" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/30 mb-4">Aucune campagne en cours</p>
                  <button
                    onClick={() => navigate('/creer-campagne')}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une campagne
                  </button>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {campaigns.map((c) => (
                      <ActiveCampaignCard key={c.id} campaign={c} onDelete={deleteActiveCampaign} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profileTab === 'paused' && (
            <div className="pb-12">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <GrapeLoader size="md" />
                </div>
              ) : pausedCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">Aucune campagne en pause</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {pausedCampaigns.map((c) => (
                      <ActiveCampaignCard key={c.id} campaign={c} onDelete={deleteActiveCampaign} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profileTab === 'saved' && (
            <div className="pb-12">
              {savedCampaignsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Bookmark className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">Aucune campagne enregistrée</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {savedCampaignsList.map((campaign) => (
                      <CampaignCard key={campaign.id} data={campaign} from="/enregistre" />
                    ))}
                  </div>
                  <div className="lg:hidden space-y-3">
                    {savedCampaignsList.map((campaign) => (
                      <SavedCampaignCard key={campaign.id} campaign={campaign} onRemove={() => toggle(campaign.id)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profileTab === 'drafts' && (
            <div className="pb-12">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <GrapeLoader size="md" />
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Megaphone className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">Aucun brouillon</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {drafts.map((draft) => (
                      <DraftCard key={draft.id} draft={draft} onDelete={handleDeleteDraft} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
