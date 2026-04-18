import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import VerifyVideoCampaignPicker from './VerifyVideoCampaignPicker';

interface Props {
  onClose: () => void;
  hidePendingBadges?: boolean;
}

export default function VerifyVideoModal({ onClose, hidePendingBadges = false }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-base font-bold text-white">Vérifier ma vidéo</h2>
            <p className="text-xs text-white/40 mt-0.5">Sélectionne la campagne concernée</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
          <VerifyVideoCampaignPicker
            hidePendingBadges={hidePendingBadges}
            showSectionTitles={false}
            onPickCampaign={(id) => {
              onClose();
              navigate(`/campagne/${id}/verification`);
            }}
          />
        </div>

        <div className="hidden sm:block h-5" />
        <div className="block sm:hidden" style={{ height: 'calc(5rem + env(safe-area-inset-bottom))' }} />
      </div>
    </div>
  );
}
