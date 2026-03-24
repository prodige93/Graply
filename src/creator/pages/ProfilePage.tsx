import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Megaphone, Camera, Lock, Unlock, Pencil, Check, ChevronDown, ArrowLeft, MessageSquareOff, MessageSquare, Bookmark, Plus, X, Star, Eye, EyeOff, Video, CheckCircle, Clock, ChevronRight, Hourglass, Trash2, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GrapeLoader from '../components/GrapeLoader';
import { supabase } from '@/shared/infrastructure/supabase';
import { useProfile, PROFILE_ID } from '@/shared/lib/useProfile';
import { useSavedCampaigns } from '@/creator/contexts/SavedCampaignsContext';
import { useCampaignTab, type CampaignTab } from '@/creator/contexts/CampaignTabContext';
import { getPendingApplications, type CreatorCampaign, type PendingApplication } from '@/shared/lib/useCreatorCampaigns';
import { useMyCampaigns } from '@/creator/contexts/MyCampaignsContext';
import { campaigns as allCampaignsData, sponsoredCampaigns } from '@/shared/data/campaignsData';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';
import type { CampaignData } from '../components/CampaignCard';
import CampaignCard from '../components/CampaignCard';
import SavedCampaignCard from '../components/campaign-cards/SavedCampaignCard';
import bcreateurbadge from '@/shared/assets/badge-creator-verified.png';
import instagramIcon from '@/shared/assets/instagram-logo.svg';
import youtubeIcon from '@/shared/assets/youtube-color.svg';
import youtubeCardIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';
import instagramCardIcon from '@/shared/assets/instagram-card.svg';
import tiktokCardIcon from '@/shared/assets/tiktok.svg';

const DEFAULT_BANNER = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

const cardPlatformIcons: Record<string, string> = {
  instagram: instagramCardIcon,
  youtube: youtubeCardIcon,
  tiktok: tiktokCardIcon,
};

const brandSocials = ['instagram', 'tiktok', 'youtube'];

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

const platformHandleKeys: Record<string, 'instagram_handle' | 'tiktok_handle' | 'youtube_handle'> = {
  instagram: 'instagram_handle',
  tiktok: 'tiktok_handle',
  youtube: 'youtube_handle',
};


const CATEGORY_OPTIONS = ['UGC', 'Clipping'];
const CATEGORY_COLORS: Record<string, string> = {
  UGC: '#FA51E6',
  Clipping: '#391F9A',
};

const AVAILABLE_TAGS = [
  'Technologie', 'Gaming', 'Lifestyle', 'Fitness', 'Mode', 'Beaute',
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
    return URL.createObjectURL(file);
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return data.publicUrl;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { savedIds, toggle } = useSavedCampaigns();
  const { activeCampaigns: dbActive, pausedCampaigns: dbPaused, loading: campaignsLoading } = useMyCampaigns();
  const pendingApplications = getPendingApplications();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { profile, updateProfile } = useProfile();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [togglingMessaging, setTogglingMessaging] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [dbSavedCampaigns, setDbSavedCampaigns] = useState<CampaignData[]>([]);

  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editContentType, setEditContentType] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { tab: profileTab, setTab: setProfileTab } = useCampaignTab();
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  function startEditing() {
    setEditBio(profile?.bio || '');
    setEditTags(profile?.content_tags || []);
    setEditContentType(profile?.content_type || []);
    setEditing(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    await supabase.from('profiles').update({
      bio: editBio,
      content_tags: editTags,
      content_type: editContentType,
      updated_at: new Date().toISOString(),
    }).eq('id', PROFILE_ID);
    updateProfile({ bio: editBio, content_tags: editTags, content_type: editContentType });
    setSavingProfile(false);
    setEditing(false);
  }

  function toggleContentType(type: string) {
    setEditContentType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function toggleTag(tag: string) {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  useEffect(() => {
    if (savedIds.length === 0) { setDbSavedCampaigns([]); return; }
    const allPool = [...allCampaignsData, ...sponsoredCampaigns];
    const fetchSaved = async () => {
      const { data } = await supabase.from('campaigns').select('*, profiles(username, display_name, avatar_url)').in('id', savedIds);
      const dbMapped = (data ?? []).map(mapSupabaseCampaign);
      const staticMapped = allPool.filter((c) => savedIds.includes(c.id));
      const allIds = new Set(dbMapped.map((c) => c.id));
      setDbSavedCampaigns([...dbMapped, ...staticMapped.filter((c) => !allIds.has(c.id))]);
    };
    fetchSaved();
  }, [savedIds]);

  const activeCampaigns = [...dbActive, ...dbPaused];
  const completedCampaigns: CampaignData[] = [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const savedCampaignsList = dbSavedCampaigns;

  const hiddenStats = profile?.hidden_stats || [];
  const hiddenCampaigns = profile?.hidden_campaigns || [];

  async function toggleHiddenStat(key: string) {
    if (!profile) return;
    const current = profile.hidden_stats || [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    updateProfile({ hidden_stats: next });
    await supabase.from('profiles').update({ hidden_stats: next, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
  }

  async function toggleHiddenCampaign(campaignId: string) {
    if (!profile) return;
    const current = profile.hidden_campaigns || [];
    const next = current.includes(campaignId) ? current.filter((k) => k !== campaignId) : [...current, campaignId];
    updateProfile({ hidden_campaigns: next });
    await supabase.from('profiles').update({ hidden_campaigns: next, updated_at: new Date().toISOString() }).eq('id', PROFILE_ID);
  }

  const displayBanner = profile?.banner_url || DEFAULT_BANNER;
  const displayUsername = profile?.username || 'username';
  const displayBio = profile?.bio || 'Marque officielle. Nous collaborons avec des créateurs pour inspirer et innover.';
  const displayContentType = profile?.content_type || [];
  const displayTags = profile?.content_tags?.length ? profile.content_tags : ['Technologie'];
  const isPublic = profile?.is_public ?? true;
  const messagingEnabled = profile?.messaging_enabled ?? true;

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ background: '#050404' }}>
      <Sidebar activePage="mon-compte" onOpenSearch={() => {}} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

      <main className="flex-1 overflow-y-auto text-white pb-24 lg:pb-10">
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
            onClick={(e) => { e.stopPropagation(); navigate('/home'); }}
            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}
            title="Retour a l'accueil"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: bannerHover && !uploadingBanner ? 1 : 0, background: 'rgba(0,0,0,0.4)' }}
          >
            <div className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Camera className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Changer la banniere</span>
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
              <img src={bcreateurbadge} alt="Certifié" className="w-[29px] h-[29px]" />
              {displayContentType.map((ct) => {
                const color = CATEGORY_COLORS[ct === 'ugc' ? 'UGC' : 'Clipping'];
                return (
                  <span
                    key={ct}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}4D`,
                      color,
                    }}
                  >
                    {ct === 'ugc' ? 'UGC' : 'Clipping'}
                  </span>
                );
              })}
              <button
                onClick={toggleVisibility}
                disabled={togglingVisibility}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {togglingVisibility ? (
                  <GrapeLoader size="sm" />
                ) : isPublic ? (
                  <Unlock className="w-3 h-3" style={{ color: '#22c55e' }} />
                ) : (
                  <Lock className="w-3 h-3" style={{ color: '#ef4444' }} />
                )}
                <span className="text-white">{isPublic ? 'Public' : 'Prive'}</span>
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
                    placeholder="Decrivez votre marque en quelques mots..."
                  />
                  <span className="text-[10px] text-white/25 mt-0.5 block text-right">{editBio.length}/200</span>
                </div>

                <div ref={categoryDropdownRef}>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Categories</label>
                  <div className="relative">
                    <button
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                      style={
                        categoryDropdownOpen || editContentType.length > 0
                          ? {
                              background: 'rgba(255,255,255,0.18)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255,255,255,0.35)',
                              color: '#fff',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: 'rgba(255,255,255,0.7)',
                              boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.15)',
                            }
                      }
                    >
                      {editContentType.length > 0
                        ? editContentType.map((t) => t === 'ugc' ? 'UGC' : 'Clipping').join(', ')
                        : 'Categories'}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {categoryDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden"
                        style={{
                          background: 'rgba(30, 28, 28, 0.55)',
                          backdropFilter: 'blur(28px)',
                          WebkitBackdropFilter: 'blur(28px)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="pt-1.5" />
                        {CATEGORY_OPTIONS.map((option) => {
                          const isSelected = editContentType.includes(option.toLowerCase());
                          const color = CATEGORY_COLORS[option];
                          return (
                            <button
                              key={option}
                              onClick={() => toggleContentType(option.toLowerCase())}
                              className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold transition-all duration-200 group"
                              style={{ color: isSelected ? color : 'rgba(255,255,255,0.85)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = color; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isSelected ? color : 'rgba(255,255,255,0.85)'; }}
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200" style={{ background: isSelected ? color : 'rgba(255,255,255,0.2)', boxShadow: isSelected ? `0 0 6px ${color}` : 'none' }} />
                                {option}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />}
                            </button>
                          );
                        })}
                        <div className="pb-1.5" />
                      </div>
                    )}
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
                          <p className="px-4 py-3 text-xs text-white/30">Tous les tags sont selectionnes</p>
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
                <span className="text-sm font-semibold text-white">{activeCampaigns.length}</span>
                <span className="text-sm text-white/40">campagnes</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">0</span>
                <span className="text-sm text-white/40">videos</span>
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
                title={messagingEnabled ? 'Messages actifs - cliquez pour desactiver' : 'Messages desactives - cliquez pour activer'}
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
                <img src={platformIcons[s]} alt={s} className="w-5 h-5" />
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

        </div>

        <div className="overflow-x-auto scrollbar-hide px-4" style={{ background: '#050404' }}>
          <div className="flex items-center gap-0 min-w-max">
            {([
              { key: 'active' as const, label: 'Campagne en cours' },
              { key: 'pending' as const, label: 'En attente' },
              { key: 'completed' as const, label: 'Termine' },
              { key: 'saved' as const, label: 'Enregistrées' },
              { key: 'stats' as const, label: 'Statistiques' },
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
                      background: isActive ? '#FFA672' : 'transparent',
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
                Votre profil est en mode <span className="font-semibold text-white/70">prive</span>. Les marques ne peuvent pas vous decouvrir ni voir vos contenus. Passez en public pour recevoir des propositions de collaboration.
              </p>
            </div>
          )}

          {confirmWithdrawId && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              onClick={() => setConfirmWithdrawId(null)}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
                style={{
                  background: 'rgba(14,13,13,0.98)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                  </div>
                  <h3 className="text-base font-bold text-white">Se desinscrire de cette campagne ?</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Tu ne seras plus inscrit pour cette campagne et ta candidature sera supprimee definitivement.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmWithdrawId(null)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Annuler
                  </button>
                  <button
                    disabled={withdrawing}
                    onClick={() => {
                      if (!confirmWithdrawId) return;
                      setWithdrawing(true);
                      setConfirmWithdrawId(null);
                      setWithdrawing(false);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                    style={{ background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(239,68,68,0.4)' }}
                  >
                    {withdrawing ? 'Suppression...' : 'Se desinscrire'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'active' && (
            <div className="pb-12">
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              ) : activeCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Megaphone className="w-5 h-5 text-white/25" />
                  </div>
                  <p className="text-sm text-white/30">Aucune campagne en cours</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {activeCampaigns.map((c) => (
                      <ProfileActiveCampaignCard key={c.id} campaign={c} onWithdraw={() => setConfirmWithdrawId(c.id)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profileTab === 'pending' && (
            <div className="pb-12">
              {pendingApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Clock className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">Aucune campagne en attente</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {pendingApplications.map((a) => (
                      <ProfilePendingCard key={a.id} application={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {profileTab === 'completed' && (
            <div className="pb-12">
              <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-sm text-white/30">Aucune campagne terminée</p>
              </div>
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

          {profileTab === 'stats' && (
            <div className="pb-12 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { key: 'views', icon: Eye, label: 'Vues totales', value: '0' },
                  { key: 'videos', icon: Video, label: 'Videos', value: '0' },
                  { key: 'campaigns', icon: Megaphone, label: 'Campagnes', value: String(activeCampaigns.length + completedCampaigns.length) },
                ].map((stat) => {
                  const isHidden = hiddenStats.includes(stat.key);
                  const Icon = stat.icon;
                  return (
                    <button
                      key={stat.key}
                      onClick={() => toggleHiddenStat(stat.key)}
                      className={`relative group rounded-2xl p-4 flex flex-col gap-1 transition-all duration-300 text-left cursor-pointer active:scale-95 ${isHidden ? 'opacity-35' : ''}`}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      title={isHidden ? 'Afficher' : 'Masquer'}
                    >
                      <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 z-10" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {isHidden ? <Eye className="w-3 h-3 text-white/50" /> : <EyeOff className="w-3 h-3 text-white/50" />}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-white/30" />
                        <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black text-white">{isHidden ? '--' : stat.value}</span>
                    </button>
                  );
                })}
                {(() => {
                  const isHidden = hiddenStats.includes('rating');
                  return (
                    <button
                      onClick={() => toggleHiddenStat('rating')}
                      className={`relative group rounded-xl px-3.5 py-3 overflow-hidden transition-all duration-300 text-left cursor-pointer active:scale-95 ${isHidden ? 'opacity-35' : ''}`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(180,180,195,0.1) 0%, rgba(220,220,230,0.05) 50%, rgba(180,180,195,0.1) 100%)',
                        border: '1px solid rgba(200,200,210,0.2)',
                        boxShadow: '0 0 16px rgba(200,200,210,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                      title={isHidden ? 'Afficher' : 'Masquer'}
                    >
                      <div
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 z-20"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {isHidden ? <Eye className="w-3 h-3 text-white/50" /> : <EyeOff className="w-3 h-3 text-white/50" />}
                      </div>
                      {!isHidden && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(220,220,230,0.08) 45%, rgba(255,255,255,0.1) 50%, rgba(220,220,230,0.08) 55%, transparent 60%)',
                            animation: 'ratingShimmer 4s ease-in-out infinite',
                          }}
                        />
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className="w-3 h-3"
                              style={{
                                color: 'rgba(255,255,255,0.12)',
                                fill: 'transparent',
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl font-bold text-white">--</p>
                          <p className="text-xs font-semibold" style={{ color: 'rgba(200,200,210,0.45)' }}>/5</p>
                        </div>
                      </div>
                    </button>
                  );
                })()}
              </div>

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Plateformes</h2>
                  <button
                    onClick={() => navigate('/mon-compte')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <Pencil className="w-3 h-3" />
                    Modifier
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {brandSocials.map((s) => {
                    const isHidden = hiddenStats.includes(`platform_${s}`);
                    const handle = profile?.[platformHandleKeys[s]] || '';
                    return (
                      <button
                        key={s}
                        onClick={() => toggleHiddenStat(`platform_${s}`)}
                        className={`relative group rounded-2xl flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-all duration-300 hover:brightness-125 active:scale-[0.98] ${isHidden ? 'opacity-30' : ''}`}
                        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${isHidden ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}` }}
                        title={isHidden ? 'Afficher' : 'Masquer'}
                      >
                        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <img src={platformIcons[s]} alt={s} className={`w-6 h-6 transition-all duration-300 ${isHidden ? 'grayscale' : ''}`} />
                          {isHidden && (
                            <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: 'rgba(5,4,4,0.5)' }}>
                              <EyeOff className="w-3.5 h-3.5 text-white/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-white">{platformLabels[s]}</p>
                          {handle ? (
                            <p className="text-xs text-white/40 mt-0.5 truncate">{handle}</p>
                          ) : (
                            <p className="text-xs text-white/20 mt-0.5 italic">Non connecté</p>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {isHidden ? <Eye className="w-3 h-3 text-white/50" /> : <EyeOff className="w-3 h-3 text-white/50" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Campagnes récentes</h2>
                {[...activeCampaigns, ...completedCampaigns].length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Eye className="w-8 h-8 text-white/10 mb-2" />
                    <p className="text-sm text-white/25">Aucune campagne récente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...activeCampaigns, ...completedCampaigns].map((c) => {
                      const isCampaignHidden = hiddenCampaigns.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          className={`relative group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 ${isCampaignHidden ? 'opacity-25' : ''}`}
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleHiddenCampaign(c.id); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-white/10 z-10"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                            title={isCampaignHidden ? 'Afficher' : 'Masquer'}
                          >
                            {isCampaignHidden ? <Eye className="w-3 h-3 text-white/50" /> : <EyeOff className="w-3 h-3 text-white/50" />}
                          </button>
                          <div
                            className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
                            onClick={() => navigate(`/campagne/${c.id}`, { state: { from: '/profil' } })}
                          >
                            <img
                              src={c.image}
                              alt={c.title}
                              className={`w-10 h-10 rounded-lg object-cover shrink-0 ${isCampaignHidden ? 'grayscale' : ''}`}
                              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-white/35">{c.brand}</span>
                                {c.socials.map((p) =>
                                  cardPlatformIcons[p] ? <img key={p} src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-50" /> : null
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Vues</p>
                                <p className="text-sm font-bold text-white">{c.views}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ color: '#22c55e' }}>
                                En cours
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes ratingShimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        `}</style>
      </main>
    </div>
  );
}

const glassCard: React.CSSProperties = {
  background: 'rgba(10,10,15,1)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
};

function formatViews(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
}

function ProfileActiveCampaignCard({ campaign, onWithdraw }: { campaign: CampaignData; onWithdraw: () => void }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/campagne/${campaign.id}`, { state: { from: '/profil' } })}
      className="w-full group rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.005] flex flex-col relative"
      style={glassCard}
    >
      <div className="flex lg:flex-col items-stretch">
        <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
            {campaign.socials.map((p) =>
              cardPlatformIcons[p] ? (
                <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <img src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-80" />
                </span>
              ) : null
            )}
          </div>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{campaign.brand}</p>
              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{campaign.title}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center gap-2">
            {campaign.socials.map((p) =>
              cardPlatformIcons[p] ? <img key={p} src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-50 lg:hidden" /> : null
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                campaign.contentType === 'UGC'
                  ? { background: 'rgba(255,0,217,0.1)', border: '1px solid rgba(255,0,217,0.25)', color: '#FF00D9' }
                  : { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }
              }
            >
              {campaign.contentType}
            </span>
            <span className="text-[10px] text-white/30 ml-auto">{campaign.timeAgo}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.earned}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Gains</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.views}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Vues</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{campaign.ratePerView}</p>
              <p className="text-[9px] text-white/30 mt-0.5">/ 1K vues</p>
            </div>
          </div>
          <div className="mt-2 px-0.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-white">
                {campaign.earned} <span className="text-white/30 font-normal">/ {campaign.budget}</span>
              </span>
              <span className="text-[9px] font-bold text-white/50">{campaign.progress}%</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(campaign.progress, 100)}%`, background: 'rgba(255,255,255,0.85)' }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onWithdraw(); }}
        className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer hover:scale-110"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-white/70" />
      </div>
    </button>
  );
}

function ProfilePendingCard({ application }: { application: PendingApplication }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(10,10,15,1)',
        border: '1px solid rgba(255,180,50,0.22)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex lg:flex-col items-stretch">
        <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
          <img src={application.photo} alt={application.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
            {application.platforms.map((p) =>
              cardPlatformIcons[p] ? (
                <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <img src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-80" />
                </span>
              ) : null
            )}
          </div>
          <div
            className="hidden lg:flex absolute bottom-2.5 left-2.5 w-7 h-7 rounded-full items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,180,50,0.35)' }}
          >
            <Hourglass className="w-3.5 h-3.5" style={{ color: '#FFB432' }} />
          </div>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{application.brand}</p>
              <h3 className="text-sm font-bold text-white/80 leading-snug line-clamp-2">{application.name}</h3>
            </div>
            <div
              className="lg:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,180,50,0.25)' }}
            >
              <Hourglass className="w-4 h-4" style={{ color: '#FFB432' }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {application.platforms.map((p) =>
              cardPlatformIcons[p] ? <img key={p} src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-40 lg:hidden" /> : null
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={
                application.category === 'UGC'
                  ? { background: 'rgba(255,0,217,0.08)', border: '1px solid rgba(255,0,217,0.15)', color: 'rgba(255,0,217,0.6)' }
                  : { background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.6)' }
              }
            >
              {application.category}
            </span>
            <span className="text-[10px] text-white/25 ml-auto">Postule le {application.appliedAt}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{application.ratePerK}</p>
              <p className="text-[9px] text-white/30 mt-0.5">par 1K vues</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black text-white">{application.applicantsCount}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Candidats</p>
            </div>
          </div>
          <p className="text-[10px] font-bold" style={{ color: 'rgba(255,180,50,0.8)' }}>
            En cours d'examen par la marque
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileCompletedCard({ campaign, onDelete }: { campaign: CreatorCampaign; onDelete: (id: string) => void }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col opacity-50 relative group"
      style={glassCard}
    >
      <div className="flex lg:flex-col items-stretch">
        <div className="relative w-28 sm:w-36 lg:w-full shrink-0 lg:h-36">
          <img src={campaign.photo} alt={campaign.name} className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
          <div className="hidden lg:flex absolute top-2.5 right-2.5 items-center gap-1.5">
            {campaign.platforms.map((p) =>
              cardPlatformIcons[p] ? (
                <span key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <img src={cardPlatformIcons[p]} alt={p} className="w-3.5 h-3.5 brightness-0 invert opacity-40" />
                </span>
              ) : null
            )}
          </div>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">{campaign.brand}</p>
            <h3 className="text-sm font-bold text-white/40 leading-snug line-clamp-2">{campaign.name}</h3>
          </div>
          <span className="text-[10px] text-white/20">Termine le {campaign.joinedAt}</span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-sm font-black text-white/30">${campaign.totalEarned.toFixed(0)}</p>
              <p className="text-[9px] text-white/15 mt-0.5">Gagne</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-sm font-black text-white/30">{formatViews(campaign.totalViews)}</p>
              <p className="text-[9px] text-white/15 mt-0.5">Vues</p>
            </div>
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-sm font-black text-white/30">{campaign.videosPosted}</p>
              <p className="text-[9px] text-white/15 mt-0.5">Videos</p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
        className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer group/trash"
        style={{
          background: 'rgba(10,10,12,0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.3)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,255,255,0.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,12,0.65)';
          (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.18)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
        }}
      >
        <Trash2 className="w-3.5 h-3.5 text-white/70 group-hover/trash:text-white transition-colors duration-200" />
      </button>
    </div>
  );
}
