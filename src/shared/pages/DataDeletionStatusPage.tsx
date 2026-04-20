import { useSearchParams } from 'react-router-dom';

/**
 * Page publique de statut pour les demandes de suppression de données Meta
 * (Facebook / Instagram). Meta exige une URL de confirmation avec un code
 * de suivi généré par le backend.
 *
 * @see https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export default function DataDeletionStatusPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || '';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#050404', color: 'white' }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <h1 className="text-2xl font-bold mb-3">Demande de suppression de données</h1>
        <p className="text-sm text-white/70 leading-relaxed mb-6">
          Votre demande a bien été prise en compte. Les données associées à votre
          compte Instagram sur Graply (connexion, vidéos synchronisées, handles)
          ont été supprimées.
        </p>

        {code ? (
          <div
            className="rounded-xl px-4 py-3 mb-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
              Code de confirmation
            </p>
            <p className="text-sm font-mono text-white break-all">{code}</p>
          </div>
        ) : null}

        <p className="text-xs text-white/50 leading-relaxed">
          Pour toute question, contactez-nous à{' '}
          <a
            href="mailto:support@graply.io"
            className="text-white underline hover:text-white/80"
          >
            support@graply.io
          </a>
          .
        </p>
      </div>
    </div>
  );
}
