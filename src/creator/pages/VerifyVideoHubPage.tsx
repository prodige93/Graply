import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VerifyVideoCampaignPicker from '../components/VerifyVideoCampaignPicker';
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg';

export default function VerifyVideoHubPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ backgroundColor: '#050404' }}>
      <Sidebar activePage="mes-campagnes" onOpenSearch={() => {}} />
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <img src={chCircleIcon} alt="" className="w-9 h-9" />
            <div>
              <h1 className="text-xl font-bold text-white">Vérifier ma vidéo</h1>
              <p className="text-xs text-white/40 mt-0.5">
                Choisis une campagne : enregistrées, déjà une vidéo envoyée, ou candidature acceptée (PDF Graply).
              </p>
            </div>
          </div>
          <div
            className="mt-6 rounded-2xl p-4 sm:p-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <VerifyVideoCampaignPicker
              showSectionTitles
              hidePendingBadges={false}
              onPickCampaign={(id) => navigate(`/campagne/${id}/verification`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
