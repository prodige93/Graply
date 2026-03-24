interface StepFiveProps {
  requireFollowers: boolean;
  setRequireFollowers: (v: boolean) => void;
  minFollowers: string;
  setMinFollowers: (v: string) => void;
  requireApplication: boolean;
  setRequireApplication: (v: boolean) => void;
  requireReview: boolean;
  setRequireReview: (v: boolean) => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-12 h-7 rounded-full transition-all duration-300 shrink-0"
      style={{
        backgroundColor: enabled ? '#42A5F5' : 'rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
        style={{ left: enabled ? '26px' : '4px' }}
      />
    </button>
  );
}

export default function StepFive({
  requireFollowers,
  setRequireFollowers,
  minFollowers,
  setMinFollowers,
  requireApplication,
  setRequireApplication,
  requireReview,
  setRequireReview,
}: StepFiveProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Nombre d'abonnés requis
            </h3>
            <p className="text-xs text-white/35 mt-1 leading-relaxed">
              Voulez-vous un nombre d'abonnés requis par les créateurs
            </p>
          </div>
          <Toggle enabled={requireFollowers} onToggle={() => setRequireFollowers(!requireFollowers)} />
        </div>
        {requireFollowers && (
          <div className="mt-3 animate-fadeIn">
            <input
              type="text"
              value={minFollowers}
              onChange={(e) => setMinFollowers(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Ex: 10000"
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        )}
      </div>

      <div
        className="w-full h-px"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      />

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Candidature
            </h3>
            <p className="text-xs text-white/35 mt-1 leading-relaxed">
              Exiger que les créateurs envoient une candidature
            </p>
          </div>
          <Toggle enabled={requireApplication} onToggle={() => setRequireApplication(!requireApplication)} />
        </div>
      </div>

      <div
        className="w-full h-px"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      />

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Confidentialite
            </h3>
            <p className="text-xs text-white/35 mt-1 leading-relaxed">
              Souhaitez-vous vérifier les créateurs avant qu'ils postent pour vous.
            </p>
          </div>
          <Toggle enabled={requireReview} onToggle={() => setRequireReview(!requireReview)} />
        </div>
      </div>
    </div>
  );
}
