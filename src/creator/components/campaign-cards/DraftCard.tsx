import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Trash2, File as FileEdit } from 'lucide-react';
import GrapeLoader from '../GrapeLoader';
interface Campaign {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  budget: string;
  content_type: string;
  categories: string[];
  platforms: string[];
  platform_budgets: Record<string, { amount: string; per1000: string; min: string; max: string }>;
  status: string;
  created_at: string;
  user_id?: string | null;
}
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const platformIcons: Record<string, string> = {
  instagram: instagramIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'A l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  const weeks = Math.floor(days / 7);
  return `il y a ${weeks} sem`;
}

export default function DraftCard({ draft, onDelete }: { draft: Campaign; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(draft.id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="sm:hidden flex items-center gap-2.5">
        <div
          onClick={() => navigate(`/modifier-campagne/${draft.id}`, { state: { from: '/mes-campagnes' } })}
          className="flex-1 min-w-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{
            background: 'rgba(10,10,15,1)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-stretch h-[150px]">
            <div className="relative w-28 shrink-0 h-full">
              {draft.photo_url ? (
                <img src={draft.photo_url} alt={draft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <Megaphone className="w-8 h-8 text-white/15" />
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(10,10,15,1) 100%)' }} />
              <div className="absolute top-2 left-2">
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', color: '#FBBF24' }}>
                  Brouillon
                </span>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1.5 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {draft.platforms.map((p: string) =>
                    platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-3.5 h-3.5 social-icon" /> : null
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{draft.name || 'Sans titre'}</h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {draft.content_type && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                    style={draft.content_type.toLowerCase() === 'ugc'
                      ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.3)', color: '#FF00D9' }
                      : { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.3)', color: '#a78bfa' }
                    }>{draft.content_type}</span>
                )}
                {draft.categories.slice(0, 2).map((cat: string) => (
                  <span key={cat} className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>{cat}</span>
                ))}
              </div>
              <span className="text-[10px] text-white/30">{timeAgo(draft.created_at)}</span>
              <div className="flex items-center gap-2">
                <div className="rounded-xl px-2.5 py-1.5 text-center" style={{ background: 'rgba(255,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p className="text-xs font-black text-white/60">Non publie</p>
                  <p className="text-[9px] text-white/20 mt-0.5">Statut</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/modifier-campagne/${draft.id}`, { state: { from: '/mes-campagnes' } }); }}
                  className="rounded-xl px-2.5 py-1.5 flex items-center gap-1 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <FileEdit className="w-3 h-3 text-white/50" />
                  <p className="text-[9px] text-white/50 font-semibold">Reprendre</p>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
          className="w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            height: '80px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
        >
          <Trash2 className="w-4 h-4 text-white/50" />
        </button>
      </div>

      <div
        className="hidden sm:flex rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 group h-full flex-col cursor-pointer relative"
        style={{ background: 'rgba(10,10,15,1)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)' }}
        onClick={() => navigate(`/modifier-campagne/${draft.id}`, { state: { from: '/mes-campagnes' } })}
      >
        <div className="relative h-36 overflow-hidden">
          {draft.photo_url ? (
            <img src={draft.photo_url} alt={draft.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <Megaphone className="w-10 h-10 text-white/15" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(10,10,15,0.6) 72%, rgba(10,10,15,0.92) 86%, rgba(10,10,15,1) 100%)' }} />
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', color: '#FBBF24' }}>Brouillon</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <Trash2 className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>
        <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[12px] font-semibold text-white truncate">{draft.name || 'Sans titre'}</span>
              <span className="text-[10px] text-white/30 shrink-0">. {timeAgo(draft.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto shrink-0">
              {draft.platforms.map((p: string) => platformIcons[p] ? <img key={p} src={platformIcons[p]} alt={p} className="w-4 h-4 social-icon" /> : null)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {draft.content_type && (
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide" style={draft.content_type.toLowerCase() === 'ugc' ? { background: 'rgba(255,0,217,0.15)', border: '1px solid rgba(255,0,217,0.35)', color: '#FF00D9' } : { background: 'rgba(57,31,154,0.15)', border: '1px solid rgba(57,31,154,0.35)', color: '#a78bfa' }}>{draft.content_type}</span>
            )}
            {draft.categories.map((cat: string) => (
              <span key={cat} className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>{cat}</span>
            ))}
          </div>
          <div className="flex-1" />
          <div className="w-full h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: '0%', background: 'rgba(255,255,255,0.9)' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-white/40">Brouillon</span>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/modifier-campagne/${draft.id}`, { state: { from: '/mes-campagnes' } }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <FileEdit className="w-3 h-3" />
              Reprendre
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setConfirmOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ background: '#141212', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white">Supprimer ce brouillon ?</h3>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Cette action est irréversible. Le brouillon <span className="font-semibold text-white/70">"{draft.name}"</span> sera définitivement supprimé.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.96] disabled:opacity-50" style={{ background: '#ef4444', color: '#fff' }}>
                {deleting ? <GrapeLoader size="sm" /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
