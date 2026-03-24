import { useEffect } from 'react';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const PLATFORM_META: Record<string, { label: string; icon: string; color: string }> = {
  instagram: { label: 'Instagram', icon: instagramIcon, color: '#E1306C' },
  youtube: { label: 'YouTube', icon: youtubeIcon, color: '#FF0000' },
  tiktok: { label: 'TikTok', icon: tiktokIcon, color: '#00F2EA' },
};

interface PlatformBudget {
  amount: string;
  per1000: string;
  min: string;
  max: string;
}

interface StepThreeProps {
  platforms: string[];
  budget: string;
  platformBudgets: Record<string, PlatformBudget>;
  setPlatformBudgets: (v: Record<string, PlatformBudget>) => void;
  isEditMode?: boolean;
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

export default function StepThree({ platforms, budget, platformBudgets, setPlatformBudgets, isEditMode }: StepThreeProps) {
  const totalBudget = parseNum(budget);
  const isSinglePlatform = platforms.length === 1;

  useEffect(() => {
    if (isSinglePlatform && totalBudget > 0) {
      const id = platforms[0];
      const current = platformBudgets[id] || { amount: '', per1000: '', min: '', max: '' };
      const budgetStr = totalBudget.toString();
      if (current.amount !== budgetStr) {
        setPlatformBudgets({ ...platformBudgets, [id]: { ...current, amount: budgetStr } });
      }
    }
  }, [isSinglePlatform, platforms, totalBudget]);

  const updateField = (id: string, field: keyof PlatformBudget, val: string) => {
    const clean = val.replace(/[^0-9.,]/g, '');
    const current = platformBudgets[id] || { amount: '', per1000: '', min: '', max: '' };
    setPlatformBudgets({ ...platformBudgets, [id]: { ...current, [field]: clean } });
  };

  const totalAllocated = platforms.reduce((sum, id) => sum + parseNum(platformBudgets[id]?.amount || ''), 0);
  const remaining = totalBudget - totalAllocated;
  const isOverBudget = remaining < 0;

  return (
    <div className={`space-y-6 animate-fadeIn ${isEditMode ? 'opacity-40 pointer-events-none' : ''}`}>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Récompense</h3>
        <p className="text-xs text-white/30 leading-relaxed mb-4">
          {isSinglePlatform
            ? 'Définissez les montants de récompense pour cette plateforme.'
            : 'Répartissez votre budget entre les différentes plateformes et définissez les montants de récompense.'}
        </p>

        {isSinglePlatform && totalBudget > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs font-semibold text-white">Budget de la campagne</span>
            <span className="text-sm font-bold text-white">
              {totalBudget.toLocaleString('fr-FR')} EUR
            </span>
          </div>
        )}

        {!isSinglePlatform && totalBudget > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs font-semibold text-white">Budget restant</span>
            <span className="text-sm font-bold" style={{ color: remaining > 0 ? '#42A5F5' : remaining === 0 ? '#4CAF50' : '#ef4444' }}>
              {remaining.toLocaleString('fr-FR')} EUR
            </span>
          </div>
        )}

        {!isSinglePlatform && isOverBudget && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 animate-fadeIn"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}>
              <span className="text-xs font-bold" style={{ color: '#ef4444' }}>!</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>
              Le montant total alloue depasse votre budget de <span className="font-bold text-white">{Math.abs(remaining).toLocaleString('fr-FR')} EUR</span>. Veuillez reduire les montants attribues ou deselectionnez une plateforme sur laquelle vous ne souhaitez pas que les createurs publient.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {platforms.map((id) => {
          const meta = PLATFORM_META[id];
          if (!meta) return null;
          const pb = platformBudgets[id] || { amount: '', per1000: '', min: '', max: '' };
          const allocated = parseNum(pb.amount);
          const pct = totalBudget > 0 ? Math.min(100, (allocated / totalBudget) * 100) : 0;

          return (
            <div
              key={id}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-5 pt-4 pb-3">
                {isSinglePlatform ? (
                  <div className="flex items-center gap-3 mb-4">
                    <img src={meta.icon} alt={meta.label} className="w-5 h-5 social-icon" />
                    <span className="text-sm font-semibold text-white">{meta.label}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src={meta.icon} alt={meta.label} className="w-5 h-5 social-icon" />
                        <span className="text-sm font-semibold text-white">{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/80">
                          {allocated > 0 ? allocated.toLocaleString('fr-FR') : '0'}
                        </span>
                        <span className="text-xs text-white/25">/ {totalBudget > 0 ? totalBudget.toLocaleString('fr-FR') : '---'}</span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.5), #ffffff)',
                          boxShadow: pct > 0 ? '0 0 12px rgba(255,255,255,0.15)' : 'none',
                        }}
                      />
                    </div>
                  </>
                )}

                <div className={`grid gap-3 ${isSinglePlatform ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {!isSinglePlatform && (
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1.5">Budget campagne</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={pb.amount}
                          onChange={(e) => updateField(id, 'amount', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/15"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/20">EUR</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">€ /1000 vues</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pb.per1000}
                        onChange={(e) => updateField(id, 'per1000', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/15"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/20">EUR</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Minimum paiement</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pb.min}
                        onChange={(e) => updateField(id, 'min', e.target.value)}
                        placeholder="5"
                        className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/15"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/20">EUR</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">Maximum paiement</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pb.max}
                        onChange={(e) => updateField(id, 'max', e.target.value)}
                        placeholder="500"
                        className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/15"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/20">EUR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-white/25">Selectionnez des plateformes a l'etape precedente</p>
        </div>
      )}
    </div>
  );
}
