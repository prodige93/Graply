import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import GrapeLoader from '../components/GrapeLoader';
import Sidebar from '../components/Sidebar';
import { campaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import { supabase } from '@/shared/infrastructure/supabase';
import { mapSupabaseCampaign } from '@/shared/lib/mapSupabaseCampaign';
import { addSubmittedVideo } from '@/shared/lib/useCreatorCampaigns';
import verifiedIcon from '@/shared/assets/badge-enterprise-verified.png';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';


type Step = 'submit' | 'verifying' | 'success' | 'error';

export default function VideoVerificationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const allStaticCampaigns = [...sponsoredCampaigns, ...campaigns];
  const staticCampaign = allStaticCampaigns.find((c) => c.id === id);
  const [campaign, setCampaign] = useState(staticCampaign ?? null);
  const [loading, setLoading] = useState(!staticCampaign);
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<Step>('submit');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (staticCampaign || !id) return;
    setLoading(true);
    supabase
      .from('campaigns')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCampaign(mapSupabaseCampaign(data));
        }
        setLoading(false);
      });
  }, [id, staticCampaign]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050404' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#050404' }}>
        <p className="text-xl font-semibold mb-4">Campagne introuvable</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Retour aux campagnes
        </button>
      </div>
    );
  }

  const canSubmit = videoUrl.trim() && platform && agreed;

  const handleVerify = async () => {
    if (!canSubmit || !campaign) return;
    setStep('verifying');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('video_submissions').insert({
          user_id: user.id,
          campaign_id: campaign.id,
          campaign_name: campaign.title,
          brand: campaign.brand,
          campaign_photo: campaign.image,
          platform,
          video_url: videoUrl,
          status: 'in_review',
        });
      } else {
        const now = new Date();
        const day = now.getDate();
        const monthNames = ['jan', 'fev', 'mars', 'avr', 'mai', 'juin', 'juil', 'aout', 'sep', 'oct', 'nov', 'dec'];
        const dateStr = `${day} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        addSubmittedVideo({
          id: `vid-${Date.now()}`,
          campaignId: campaign.id,
          campaignName: campaign.title,
          brand: campaign.brand,
          campaignPhoto: campaign.image,
          platform,
          videoUrl,
          submittedAt: dateStr,
          status: 'in_review',
        });
      }
      setTimeout(() => setStep('success'), 1500);
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar
        activePage="home"
        onOpenSearch={() => {}}
      />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
      <div className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: 'rgba(5,4,4,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={campaign.brandLogo}
              alt={campaign.brand}
              className="w-9 h-9 rounded-xl object-cover shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate">{campaign.brand}</span>
                {campaign.verified && <img src={verifiedIcon} alt="Verified" className="w-5 h-5 shrink-0" />}
              </div>
              <p className="text-xs text-white/30 truncate">Verification de video</p>
            </div>
          </div>
        </div>
      </div>

      {step === 'submit' && (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

            <div className="lg:w-[380px] shrink-0">
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-white text-left mb-3">Checklist de soumission</h1>
                <p className="text-sm text-white/40 text-left leading-relaxed">
                  Veuillez vous assurer de respecter toutes les regles et exigences avant de soumettre votre contenu afin de maximiser vos chances d'approbation.
                </p>
              </div>

              {campaign.rules && campaign.rules.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-white text-left mb-4">Regles</h2>
                  <ul className="space-y-3">
                    {campaign.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid #fff' }}
                        >
                          <span className="text-[10px] font-bold" style={{ color: '#fff' }}>{i + 1}</span>
                        </div>
                        <span className="text-sm text-white leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-lg font-bold text-white text-left mb-2">Information</h2>
                <p className="text-sm text-white/40 text-left leading-relaxed">
                  Veuillez consulter le document pour bien suivre les regles.
                </p>
              </div>

              {campaign.documents && campaign.documents.length > 0 && (
                <div className="space-y-3">
                  {campaign.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 hover:brightness-125 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                          <p className="text-xs text-white/30">{doc.size} - {doc.type}</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-white shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Verifier ma video</h2>

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Campagne</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{campaign.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">{campaign.ratePerView}/1K vues</p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Plateforme</h3>
                <div className="flex gap-2">
                  {campaign.socials.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlatform(s)}
                      className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200"
                      style={{
                        background: platform === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                        border: platform === s ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        color: platform === s ? '#f97316' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {s === 'youtube' ? 'YouTube' : s === 'tiktok' ? 'TikTok' : 'Instagram'}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Lien de la video</h3>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: videoUrl ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Link2 className="w-4 h-4 shrink-0" style={{ color: videoUrl ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@user/video/..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                  />
                </div>
              </div>

              <div
                className="rounded-2xl p-5 mb-8 cursor-pointer transition-all duration-200"
                style={{
                  background: agreed ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.055)',
                  border: agreed ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={() => setAgreed(!agreed)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
                    style={{
                      background: agreed ? '#f97316' : 'transparent',
                      border: agreed ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {agreed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed select-none">
                    J'ai lu les exigences de soumission et je comprends que ma soumission pourra être automatiquement refusée si elles ne sont pas respectées.
                  </p>
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={!canSubmit}
                className="group relative w-auto px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-2 mx-auto"
                style={{
                  background: canSubmit ? '#FFA672' : 'rgba(255,255,255,0.06)',
                  color: canSubmit ? '#fff' : 'rgba(255,255,255,0.2)',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="relative z-10 flex items-center gap-2">
                  <img src={chCircleIcon} alt="" className="w-4 h-4" />
                  Verifier ma video
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6">
        {step === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
            <div className="mb-6">
              <GrapeLoader size="xl" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification en cours...</h2>
            <p className="text-sm text-white/40 text-center max-w-sm">
              Nous verifions que votre video respecte les regles de la campagne. Cela ne prendra que quelques instants.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-2">Vidéo envoyée avec succès</h2>
            <p className="text-sm text-white/40 text-center max-w-sm mb-10">
              Votre vidéo a été soumise pour vérification. Vous recevrez une notification une fois qu'elle sera approuvée.
            </p>
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => navigate(`/campagne/${id}`)}
                className="w-full px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{ background: '#ffffff', color: '#000000' }}
              >
                Retour a la campagne
              </button>
              <button
                onClick={() => {
                  setVideoUrl('');
                  setPlatform('');
                  setAgreed(false);
                  setStep('submit');
                }}
                className="w-full px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-125 active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Soumettre une autre video
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
              style={{ background: 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)', boxShadow: '0 4px 30px rgba(198,40,40,0.4)' }}
            >
              <AlertCircle className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Erreur de verification</h2>
            <p className="text-sm text-white/40 text-center max-w-sm mb-10">
              Nous n'avons pas pu verifier votre video. Verifiez le lien et reessayez.
            </p>
            <button
              onClick={() => setStep('submit')}
              className="px-8 py-3 rounded-full text-sm font-bold text-black transition-all duration-200 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #BBDEFB 0%, #42A5F5 100%)' }}
            >
              Reessayer
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
