import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '@/creator/components/Sidebar';

const CONTACT_EMAIL = 'support@graply.io';

function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 leading-relaxed mb-3 marker:text-white/40">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0">{children}</p>;
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section className="mb-0 pb-10 border-b border-white/[0.07] last:border-b-0 last:pb-0">{children}</section>
  );
}

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/app-entreprise');
  const settingsPath = isEnterprise ? '/app-entreprise/parametres' : '/parametres';

  const body = (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-4 lg:py-10">
      <div className="w-full max-w-2xl mx-auto pb-8">
        <div className="flex items-center gap-3 pb-4 lg:hidden w-full">
          <button
            type="button"
            onClick={() => navigate(settingsPath)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour aux paramètres</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          className="hidden lg:flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux paramètres
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Politique de Confidentialité</h1>
        <p className="text-sm text-white/45 mb-10">Dernière mise à jour : Mars 2026 — Version 1.0</p>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">1. Présentation</h2>
          <P>
            <Em>Graply</Em> est une plateforme numérique de mise en relation entre des marques souhaitant promouvoir
            leurs produits via du contenu vidéo court format, et des créateurs de contenu souhaitant monétiser leur
            audience. La plateforme est éditée par <Em>MBT COMPANY</Em>.
          </P>
          <P>
            La présente Politique de Confidentialité décrit comment Graply collecte, utilise et protège tes données
            personnelles lorsque tu utilises la plateforme, quelle que soit ta qualité (marque ou créateur).
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">2. Données collectées</h2>
          <P>Graply collecte les données suivantes selon les fonctionnalités utilisées :</P>
          <BulletList
            items={[
              <><Em>Données d'identité :</Em> nom d'utilisateur, adresse e-mail, rôle (marque / créateur)</>,
              <><Em>Données de profil :</Em> photo de profil, bannière, biographie, tags de contenu</>,
              <><Em>Données de connexion sociale :</Em> identifiants et tokens des comptes TikTok, Instagram, YouTube connectés</>,
              <><Em>Données financières :</Em> identifiant de compte Stripe Connect (jamais de données bancaires brutes)</>,
              <><Em>Données d'utilisation :</Em> campagnes créées ou auxquelles tu as participé, vidéos soumises, candidatures</>,
              <><Em>Données de session :</Em> token d'authentification Supabase pour maintenir ta session</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">3. Finalités du traitement</h2>
          <P>Les données collectées sont utilisées pour :</P>
          <BulletList
            items={[
              <>Gérer ton <Em>compte et ta session</Em> sur la plateforme</>,
              <>Afficher et personnaliser ton <Em>profil créateur ou marque</Em></>,
              <>Mettre en relation <Em>marques et créateurs</Em> dans le cadre de campagnes</>,
              <>Traiter les <Em>paiements via Stripe Connect</Em> (rémunération des créateurs)</>,
              <>Synchroniser les <Em>statistiques de contenu</Em> depuis TikTok, Instagram, YouTube</>,
              <>Assurer la <Em>sécurité et l'intégrité</Em> de la plateforme</>,
              <>Communiquer par e-mail dans le cadre du service (notifications, support)</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">4. Base légale</h2>
          <P>Le traitement de tes données repose sur :</P>
          <BulletList
            items={[
              <><Em>Ton consentement</Em> lors de l'inscription et de la connexion des réseaux sociaux</>,
              <>L'<Em>exécution du contrat</Em> de service (mise en relation, campagnes, paiements)</>,
              <>Nos <Em>intérêts légitimes</Em> (sécurité, amélioration du service, prévention de la fraude)</>,
              <>Le <Em>respect des obligations légales</Em> applicables</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">5. Partage des données</h2>
          <P>
            Graply <Em>ne vend ni ne loue</Em> tes données personnelles. Les données peuvent être partagées dans les cas suivants :
          </P>
          <BulletList
            items={[
              <><Em>Stripe</Em> : pour le traitement des paiements et la gestion des comptes Connect</>,
              <><Em>Supabase</Em> : hébergement de la base de données et de l'authentification</>,
              <><Em>Meta / Instagram</Em> : échange OAuth pour connecter ton compte Instagram</>,
              <><Em>TikTok</Em> : échange OAuth pour connecter ton compte TikTok</>,
              <><Em>Google / YouTube</Em> : échange OAuth pour connecter ta chaîne YouTube</>,
              <>Autorités compétentes si <Em>requis par la loi</Em></>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">6. Conservation des données</h2>
          <P>
            Tes données sont conservées <Em>tant que ton compte est actif</Em>. En cas de suppression de compte,
            toutes les données personnelles identifiables sont supprimées dans les délais prévus par la loi, sauf
            obligation légale de conservation.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">7. Sécurité</h2>
          <P>
            Graply met en œuvre des <Em>mesures techniques et organisationnelles</Em> appropriées pour protéger tes données :
            chiffrement des tokens en base via <Em>Supabase Vault</Em>, RLS (Row Level Security) sur toutes les tables,
            communications exclusivement en HTTPS.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">8. Tes droits (RGPD)</h2>
          <P>Conformément au RGPD, tu disposes des droits suivants :</P>
          <BulletList
            items={[
              <><Em>Droit d'accès</Em> à tes données personnelles</>,
              <><Em>Droit de rectification</Em> des données inexactes</>,
              <><Em>Droit à l'effacement</Em> (« droit à l'oubli »)</>,
              <><Em>Droit à la portabilité</Em> de tes données</>,
              <><Em>Droit d'opposition</Em> au traitement</>,
              <><Em>Droit de retrait du consentement</Em> à tout moment</>,
            ]}
          />
          <P>
            Pour exercer tes droits ou pour toute question, contacte-nous à :{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-white underline underline-offset-2 hover:text-white">
              {CONTACT_EMAIL}
            </a>
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">9. Cookies et traceurs</h2>
          <P>
            Graply est une application web sans cookie publicitaire ni traceur tiers de marketing. Seuls des cookies{' '}
            <Em>strictement nécessaires</Em> au fonctionnement de la session (authentification Supabase) sont utilisés.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">10. Modifications</h2>
          <P>
            Graply se réserve le droit de modifier la présente Politique à tout moment. Toute modification substantielle
            sera <Em>notifiée par e-mail</Em>. La poursuite de l'utilisation de la plateforme vaut acceptation des
            nouvelles conditions.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">11. Contact</h2>
          <P>
            Pour toute question relative à la protection de tes données personnelles :
          </P>
          <p className="text-sm text-white/65 leading-relaxed">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-white underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            {' '}— MBT COMPANY, éditeur de Graply
          </p>
        </Section>
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <main className="text-white flex-1 overflow-y-auto min-h-0" style={{ background: '#050404' }}>
        {body}
      </main>
    );
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ background: '#050404' }}>
      <Sidebar activePage="parametres" onOpenSearch={() => {}} />
      <main className="flex-1 overflow-y-auto min-h-0" style={{ background: '#050404' }}>
        {body}
      </main>
    </div>
  );
}
