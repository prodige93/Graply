import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Upload, FileText, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/shared/infrastructure/supabase';
import { campaigns, sponsoredCampaigns } from '@/shared/data/campaignsData';
import type { CampaignData } from '@/creator/components/CampaignCard';
import {
  mapSupabaseCampaign,
  enrichCampaignsWithProfiles,
  type SupabaseCampaign,
} from '@/shared/lib/mapSupabaseCampaign';
import { useMyCampaigns } from '@/creator/contexts/MyCampaignsContext';

type CandidatureLocationState = { from?: string; campaignPreview?: CampaignData };

function readCampaignPreview(state: unknown, routeId: string | undefined): CampaignData | undefined {
  if (!routeId) return undefined;
  const preview = (state as CandidatureLocationState | null)?.campaignPreview;
  return preview?.id === routeId ? preview : undefined;
}

export default function CampaignApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as CandidatureLocationState | null)?.from ?? `/campagne/${id}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCampaigns = [...sponsoredCampaigns, ...campaigns];
  const staticCampaign = allCampaigns.find((c) => c.id === id);
  const previewFromNav = useMemo(
    () => readCampaignPreview(location.state, id),
    [location.state, id],
  );
  const [campaign, setCampaign] = useState<CampaignData | undefined>(
    () => staticCampaign ?? readCampaignPreview(location.state, id),
  );
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { refresh: refreshMyCampaigns } = useMyCampaigns();

  useEffect(() => {
    const next = staticCampaign ?? previewFromNav;
    if (next) {
      setCampaign(next);
      return;
    }
    setCampaign((prev) => (prev && prev.id === id ? prev : undefined));
  }, [id, staticCampaign, previewFromNav, location.key]);

  useEffect(() => {
    if (!id || staticCampaign) return;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return;
    supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return;
        try {
          const [enriched] = await enrichCampaignsWithProfiles([data]);
          setCampaign(mapSupabaseCampaign(enriched as SupabaseCampaign));
        } catch {
          /* ligne invalide côté DB */
        }
      });
  }, [id, staticCampaign]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (sending || !message.trim()) return;
    setSending(true);
    setSubmitError(null);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isRealCampaign = Boolean(id && uuidRegex.test(id));

    try {
      if (isRealCampaign) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSubmitError('Vous devez etre connecte pour envoyer une candidature.');
          return;
        }
        const motivation = message.trim();
        const { error } = await supabase.from('campaign_applications').upsert(
          {
            campaign_id: id,
            user_id: user.id,
            motivation,
            status: 'pending',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'campaign_id,user_id' },
        );
        if (error) {
          setSubmitError(error.message || 'Enregistrement impossible. Reessayez plus tard.');
          return;
        }
        void refreshMyCampaigns({ silent: true });
      }

      setSent(true);
      const prev = JSON.parse(localStorage.getItem('applied_campaigns') || '[]') as string[];
      if (id && !prev.includes(id)) localStorage.setItem('applied_campaigns', JSON.stringify([...prev, id]));
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar activePage="home" onOpenSearch={() => {}} />

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {campaign?.image && (
          <img
            src={campaign.image}
            alt=""
            aria-hidden
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-[1.05]"
            style={{ filter: 'blur(12px) brightness(0.45)' }}
          />
        )}

        <div className="absolute inset-0" style={{ background: 'rgba(5,4,4,0.5)' }} />

        <div
          className="relative z-10 w-full max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.055)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white">Candidature</h1>
              {campaign && <p className="text-xs text-white/35 mt-0.5 truncate">{campaign.title}</p>}
            </div>
          </div>

          {sent ? (
            <div className="flex flex-col items-center text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(169,255,158,0.1)', border: '1px solid rgba(169,255,158,0.3)' }}
              >
                <Send className="w-7 h-7 text-[#A9FF9E]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Candidature envoyee</h2>
              <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                Votre candidature a ete envoyee avec succes. L'entreprise reviendra vers vous prochainement.
              </p>
              <button
                onClick={() => navigate(backTo)}
                className="mt-8 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: '#FFA672', color: '#fff' }}
              >
                Retour a la campagne
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <label className="text-sm font-semibold text-white mb-2 block">Votre message</label>
                <p className="text-xs text-white/30 mb-3">Expliquez pourquoi vous souhaitez participer a cette campagne</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bonjour, je suis interesse par cette campagne car..."
                  rows={10}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                />
              </div>

              <div className="mb-6">
                <label className="text-xs font-semibold text-white/60 mb-2 block">Document (optionnel)</label>

                {file ? (
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <FileText className="w-4 h-4 text-white/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-white/30">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 hover:bg-white/10 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-white/15"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1.5px dashed rgba(255,255,255,0.08)',
                    }}
                  >
                    <Upload className="w-4 h-4 text-white/30 shrink-0" />
                    <p className="text-xs text-white/35">Glissez un fichier ou cliquez pour importer</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                    />
                  </div>
                )}
              </div>

              {submitError && (
                <p className="mb-4 text-sm text-red-400/90 leading-relaxed" role="alert">
                  {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={sending || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                style={{
                  background: '#FFFFFF',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
