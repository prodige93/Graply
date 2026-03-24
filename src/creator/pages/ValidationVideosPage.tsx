import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Megaphone, Video } from 'lucide-react';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';
import Sidebar from '../components/Sidebar';
import { openVerifyModal } from '@/shared/lib/verifyEvent';
import { getSubmittedVideos, getAllApplications } from '@/shared/lib/useCreatorCampaigns';

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06)',
};

export default function ValidationVideosPage() {
  const navigate = useNavigate();

  const submittedVideos = getSubmittedVideos();
  const allApplications = getAllApplications();
  const pendingCount = allApplications.filter(a => a.status === 'pending').length;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar activePage="home" onOpenSearch={() => {}} />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 sm:pt-8 sm:pb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Validation campagne & video</h1>
              <p className="text-xs sm:text-sm text-white/35 mt-0.5">
                Le statut de toutes vos validations
              </p>
            </div>
            <button
              onClick={() => openVerifyModal()}
              className="group relative flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden shrink-0 w-3/4 mx-auto sm:w-auto sm:mx-0"
              style={{
                background: '#FFA672',
              }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-bold text-sm relative z-10 text-white flex items-center gap-2">
                <img src={chCircleIcon} alt="" className="w-4 h-4" />
                Vérifier ma vidéo
              </span>
            </button>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-8">
            <div className="rounded-xl p-4 sm:p-7" style={glassCard}>
              <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
                </div>
                <p className="text-[10px] sm:text-xs text-white/60 font-semibold uppercase tracking-widest">Candidatures</p>
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">{pendingCount}</span>
                <span className="text-[10px] sm:text-xs text-white/35 font-medium leading-tight">en attente</span>
              </div>
            </div>

            <div className="rounded-xl p-4 sm:p-7" style={glassCard}>
              <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
                </div>
                <p className="text-[10px] sm:text-xs text-white/60 font-semibold uppercase tracking-widest">Videos</p>
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">{submittedVideos.length}</span>
                <span className="text-[10px] sm:text-xs text-white/35 font-medium leading-tight">en attente</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/mes-videos')}
              className="w-full rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.003] group"
              style={glassCard}
            >
              <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">Videos en cours de verification</p>
                  <p className="text-[10px] sm:text-xs text-white/30 mt-0.5 truncate">
                    {submittedVideos.length} video{submittedVideos.length !== 1 ? 's' : ''} soumise{submittedVideos.length !== 1 ? 's' : ''} en attente
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div
                    className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    {submittedVideos.length}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/mes-candidatures')}
              className="w-full rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.003] group"
              style={glassCard}
            >
              <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">Mes candidatures</p>
                  <p className="text-[10px] sm:text-xs text-white/30 mt-0.5 truncate">
                    Toutes les campagnes auxquelles tu as postule
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div
                    className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    {allApplications.length}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
