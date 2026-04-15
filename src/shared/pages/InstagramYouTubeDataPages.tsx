import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '@/creator/components/Sidebar';

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

type ShellProps = {
  title: string;
  intro: ReactNode;
  children: ReactNode;
};

function DataInfoShell({ title, intro, children }: ShellProps) {
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

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-left leading-tight">{title}</h1>
        <div className="text-sm text-white/45 mb-10 leading-relaxed">{intro}</div>

        {children}
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

export function StripeDataInfoPage() {
  return (
    <DataInfoShell
      title="Données & usage Stripe sur Graply"
      intro={
        <p>
          Cette page décrit comment Graply utilise <strong className="font-semibold text-white/70">Stripe</strong> pour
          les paiements, quelles données sont transmises, et tes droits.
        </p>
      }
    >
      <Section>
        <h2 className="text-lg font-bold text-white mb-3">1. Rôle de Stripe</h2>
        <P>
          Graply utilise <Em>Stripe</Em> comme prestataire de paiement exclusif pour traiter les dépôts de budget des
          marques et rémunérer les créateurs via <Em>Stripe Connect</Em>. Stripe est un prestataire de services de
          paiement indépendant, réglementé dans l'UE et aux États-Unis.
        </P>
        <P>
          Graply <Em>ne stocke aucune donnée bancaire</Em> ou de carte sur ses serveurs. Toutes les transactions
          passent directement par l'infrastructure sécurisée de Stripe.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">2. Données transmises à Stripe</h2>
        <P>Lors de la connexion ou de l'utilisation des fonctionnalités de paiement, peuvent être transmis :</P>
        <BulletList
          items={[
            <><Em>Identifiant de compte Stripe Connect</Em> — stocké dans ton profil Graply pour associer les versements</>,
            <>Adresse e-mail et informations d'identité <Em>fournies à Stripe</Em> lors de la création de ton compte Connect</>,
            <>Montants et références des <Em>transactions</Em> liées aux campagnes</>,
          ]}
        />
        <P>
          Ces données sont traitées par Stripe conformément à sa propre{' '}
          <a
            href="https://stripe.com/fr/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-2 hover:text-white"
          >
            Politique de Confidentialité
          </a>
          .
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">3. Pour les créateurs (Stripe Connect)</h2>
        <P>
          Les créateurs doivent connecter un <Em>compte Stripe Connect</Em> pour recevoir leurs paiements. Sans ce
          compte, toute candidature à une campagne est bloquée.
        </P>
        <BulletList
          items={[
            <>Les paiements sont versés <Em>chaque lundi</Em>, dès que le solde atteint 20 €</>,
            <>Les soldes inférieurs à 20 € sont <Em>reportés à la semaine suivante</Em></>,
            <>Graply prélève une commission de <Em>8 %</Em> (5 % en Premium) sur les dépôts de budget des marques</>,
          ]}
        />
        <P>
          Tu peux <Em>déconnecter ton compte Stripe</Em> depuis les paramètres. Les paiements en cours ou à venir
          seraient alors suspendus.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">4. Pour les marques</h2>
        <P>
          Les dépôts de budget sont <Em>définitifs et non remboursables</Em> une fois confirmés par Stripe. La
          commission Graply est prélevée immédiatement et ne fait l'objet d'aucun remboursement.
        </P>
        <P>
          En cas d'annulation d'une campagne active, le <Em>budget restant non consommé</Em> est remboursé sur le
          moyen de paiement initial sous 5 à 10 jours ouvrés.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">5. Suppression des données Stripe</h2>
        <P>
          La déconnexion de ton compte Stripe depuis Graply supprime uniquement l'<Em>identifiant de compte</Em>{' '}
          stocké dans ton profil Graply. Les données conservées par Stripe relèvent de sa propre politique de
          conservation — pour les supprimer, adresse-toi directement à Stripe.
        </P>
        <P>
          Le bouton <Em>« Supprimer mon compte »</Em> dans les paramètres efface définitivement l'identifiant Stripe
          Connect associé à ton profil Graply, ainsi que l'ensemble de tes données sur la plateforme.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">6. Responsabilité</h2>
        <P>
          Graply <Em>n'est pas responsable</Em> des incidents, erreurs, fraudes ou défaillances liés au traitement
          des paiements par Stripe. MBT COMPANY ne stocke aucune donnée bancaire sur ses serveurs.
        </P>
      </Section>
    </DataInfoShell>
  );
}

export function TikTokDataInfoPage() {
  return (
    <DataInfoShell
      title="Données & usage TikTok sur Graply"
      intro={
        <p>
          Cette page décrit comment Graply utilise ta connexion TikTok (API TikTok Login Kit), quelles données sont
          traitées, et comment retirer ton consentement ou supprimer tes données.
        </p>
      }
    >
      <Section>
        <h2 className="text-lg font-bold text-white mb-3">1. Finalité de la connexion</h2>
        <P>
          La connexion TikTok permet à Graply d'<Em>identifier ton compte créateur</Em>, d'afficher ton nom
          d'affichage sur ton profil Graply, et, lorsque le scope <Em>video.list</Em> est accordé, de{' '}
          <Em>synchroniser les métadonnées de tes vidéos publiques</Em> (titre, vignette, lien) pour alimenter ton
          tableau de bord et le suivi de performance.
        </P>
        <P>
          Graply n'utilise TikTok que dans les périmètres (scopes) que tu as <Em>explicitement autorisés</Em> lors de
          la connexion OAuth, conformément aux règles du <Em>TikTok Developer Platform</Em>.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">2. Données concernées</h2>
        <P>Selon les autorisations accordées, peuvent être traitées notamment :</P>
        <BulletList
          items={[
            <>Identifiant open_id TikTok et nom d'affichage (<Em>display_name</Em>)</>,
            <>Informations de <Em>profil public</Em> nécessaires à l'affichage sur Graply</>,
            <>
              Jetons d'accès et de rafraîchissement stockés de façon <Em>sécurisée côté serveur</Em> (Supabase Vault)
            </>,
            <>
              Métadonnées de vidéos (titres, vignettes, URL de partage) si le scope <Em>video.list</Em> est activé
            </>,
          ]}
        />
        <P>
          Graply limite la collecte au <Em>strict nécessaire</Em> au fonctionnement des fonctionnalités que tu utilises.
          Aucune donnée privée (messages, brouillons, informations non publiques) n'est accessible.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">3. Base légale & durée</h2>
        <P>
          Le traitement repose sur <Em>ton consentement</Em> (écran TikTok OAuth) et sur l'exécution du service Graply
          (mise en relation marques / créateurs, suivi de campagnes).
        </P>
        <P>
          Les données sont conservées <Em>tant que ton compte Graply est actif</Em> et que la connexion TikTok reste
          établie, sauf obligation légale de conservation plus longue.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">4. Suppression des données utilisateur (TikTok)</h2>
        <P>
          Tu peux <Em>déconnecter TikTok</Em> depuis Graply (bouton « Déconnecter » dans Mon compte) : les jetons
          sont supprimés côté application et toutes les synchronisations liées à TikTok (vidéos, token) cessent
          immédiatement.
        </P>
        <P>
          Tu peux également révoquer l'accès à Graply depuis les <Em>paramètres TikTok</Em> (Confidentialité →
          Applications et sites web autorisés) — Graply ne recevra plus aucune donnée après révocation.
        </P>
        <P>
          Pour effacer l'<Em>ensemble des données</Em> de ton compte Graply (TikTok inclus), utilise{' '}
          <Em>« Supprimer mon compte »</Em> — voir ci-dessous.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">5. Le bouton « Supprimer mon compte »</h2>
        <P>
          Le bouton <Em>« Supprimer mon compte »</Em> (à côté de « Se déconnecter » dans les paramètres) déclenche
          une <Em>suppression définitive</Em> de ton compte utilisateur Graply : profil, connexions sociales (dont
          TikTok), vidéos synchronisées, candidatures et notifications associées, puis{' '}
          <Em>clôture de ta session d'authentification</Em>.
        </P>
        <P>
          Cette action est <Em>irréversible</Em>. Après suppression, tu ne pourras plus récupérer ces données via
          Graply.
        </P>
      </Section>
    </DataInfoShell>
  );
}

export function InstagramDataInfoPage() {
  return (
    <DataInfoShell
      title="Données & usage Instagram sur Graply"
      intro={
        <p>
          Cette page décrit comment Graply utilise ta connexion Instagram (API Meta / Instagram), quelles données sont
          traitées, et comment tu peux retirer ton consentement ou supprimer tes données.
        </p>
      }
    >
      <Section>
        <h2 className="text-lg font-bold text-white mb-3">1. Finalité de la connexion</h2>
        <P>
          La connexion Instagram permet à Graply d’<Em>identifier ton compte créateur</Em>, d’afficher ton pseudo /
          handle sur ton profil, et, lorsque c’est activé dans l’app, de <Em>synchroniser des métadonnées de contenus</Em>{' '}
          (ex. aperçus de médias publics) pour les statistiques et le tableau de bord.
        </P>
        <P>
          Graply n’utilise Instagram que pour des fonctionnalités liées au service (profil, campagnes, performance) et
          conformément aux <Em>règles de Meta / Instagram</Em> applicables aux développeurs.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">2. Données concernées</h2>
        <P>Selon les autorisations accordées lors de la connexion OAuth, peuvent être traitées notamment :</P>
        <BulletList
          items={[
            <>Identifiant de compte Instagram / nom d’utilisateur</>,
            <>Informations de <Em>profil public</Em> nécessaires à l’affichage sur Graply</>,
            <>Jetons d’accès techniques (stockés de façon sécurisée côté serveur) pour appeler les API autorisées</>,
            <>Données de contenus / statistiques lorsque la synchro de médias ou d’insights est activée</>,
          ]}
        />
        <P>
          Graply limite la collecte au <Em>strict nécessaire</Em> au fonctionnement des fonctionnalités que tu utilises.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">3. Base légale & durée</h2>
        <P>
          Le traitement repose sur <Em>ton consentement</Em> lors de la connexion du compte et/ou sur l’exécution du
          service Graply (mise en relation marques / créateurs, suivi de campagnes).
        </P>
        <P>
          Les données sont conservées <Em>tant que ton compte Graply est actif</Em> et que la connexion Instagram reste
          établie, sauf obligation légale de conservation plus longue.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">4. Suppression des données utilisateur (Instagram)</h2>
        <P>
          Tu peux <Em>retirer l’accès Instagram</Em> depuis Graply (déconnexion du réseau social dans ton compte) : les
          jetons associés sont alors supprimés côté application et les synchronisations liées à Instagram sont
          interrompues.
        </P>
        <P>
          Pour une suppression complète incluant ton profil Graply, les candidatures, l’historique et les données
          synchronisées (Instagram, TikTok, YouTube, etc.), utilise le bouton{' '}
          <Em>« Supprimer mon compte »</Em> dans les paramètres — voir section dédiée ci-dessous.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">5. Le bouton « Supprimer mon compte »</h2>
        <P>
          Le bouton <Em>« Supprimer mon compte »</Em> (à côté de « Se déconnecter » dans les paramètres) déclenche une{' '}
          <Em>suppression définitive</Em> de ton compte utilisateur Graply en base de données : profil, connexions
          sociales (dont Instagram), contenus synchronisés liés à ton compte, candidatures et notifications associées,
          puis <Em>fermeture de ta session d’authentification</Em>.
        </P>
        <P>
          Cette action est <Em>irréversible</Em>. Après suppression, tu ne pourras plus récupérer ces données via Graply.
        </P>
      </Section>
    </DataInfoShell>
  );
}

export function YouTubeDataInfoPage() {
  return (
    <DataInfoShell
      title="Données & usage YouTube sur Graply"
      intro={
        <p>
          Cette page décrit comment Graply utilise ta connexion YouTube (API Google / OAuth), quelles données sont
          traitées, et comment supprimer ou retirer l’accès.
        </p>
      }
    >
      <Section>
        <h2 className="text-lg font-bold text-white mb-3">1. Finalité de la connexion</h2>
        <P>
          La connexion YouTube permet d’<Em>associer ta chaîne</Em> à ton profil créateur, d’afficher ton identifiant /
          nom de chaîne sur Graply et, lorsque c’est activé, de <Em>synchroniser des informations de vidéos publiques</Em>{' '}
          (titres, vignettes, métadonnées utiles au tableau de bord et aux statistiques).
        </P>
        <P>
          Graply utilise les API Google / YouTube uniquement dans les <Em>scopes</Em> que tu as acceptés lors de la
          connexion (ex. lecture des informations de chaîne / contenus autorisés).
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">2. Données concernées</h2>
        <P>Peuvent être traitées notamment :</P>
        <BulletList
          items={[
            <>Identifiants de chaîne YouTube et métadonnées de profil public</>,
            <>Informations sur les vidéos <Em>autorisées</Em> par les périmètres OAuth</>,
            <>Jetons d’accès / rafraîchissement stockés de façon sécurisée côté serveur</>,
            <>Données agrégées pour l’affichage dans ton dashboard Graply</>,
          ]}
        />
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">3. Base légale & durée</h2>
        <P>
          Le traitement repose sur <Em>ton consentement</Em> (écran Google OAuth) et sur l’exécution du service Graply.
        </P>
        <P>
          Conservation <Em>tant que le compte Graply est actif</Em> et que la connexion YouTube est maintenue, sauf
          obligation légale contraire.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">4. Suppression des données utilisateur (YouTube)</h2>
        <P>
          Tu peux <Em>déconnecter YouTube</Em> depuis Graply : les jetons sont révoqués côté app et les synchros liées à
          YouTube cessent.
        </P>
        <P>
          Tu peux aussi révoquer l’accès à l’application depuis ton <Em>compte Google</Em> (sécurité des applications
          tierces) — Graply ne recevra plus de nouvelles données après révocation.
        </P>
        <P>
          Pour effacer <Em>l’ensemble des données</Em> de ton compte Graply (YouTube inclus), utilise{' '}
          <Em>« Supprimer mon compte »</Em> — voir ci-dessous.
        </P>
      </Section>

      <Section>
        <h2 className="text-lg font-bold text-white mb-3">5. Le bouton « Supprimer mon compte »</h2>
        <P>
          Le bouton <Em>« Supprimer mon compte »</Em> supprime de façon <Em>définitive</Em> ton compte et les données
          associées : profil, connexions sociales (dont YouTube), vidéos synchronisées, candidatures, éléments de
          notification liés à ton identifiant, puis <Em>clôture la session</Em>.
        </P>
        <P>
          Action <Em>irréversible</Em> — pense à exporter ce dont tu as besoin avant de confirmer.
        </P>
      </Section>
    </DataInfoShell>
  );
}
