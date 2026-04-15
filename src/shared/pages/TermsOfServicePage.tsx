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

export default function TermsOfServicePage() {
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

        <h1 className="text-3xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-white/45 mb-10">Dernière mise à jour : Mars 2026 — Version 1.0</p>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 1 — Présentation de la plateforme</h2>
          <P>
            <Em>Graply</Em> est une plateforme numérique de mise en relation entre des marques souhaitant promouvoir
            leurs produits ou services via du contenu vidéo court format, et des créateurs de contenu souhaitant
            monétiser leur audience sur les réseaux sociaux.
          </P>
          <P>
            Graply est édité par <Em>MBT COMPANY</Em>. Graply agit exclusivement en tant qu'
            <Em>intermédiaire technique</Em> et ne saurait être considéré comme partie prenante des relations
            contractuelles entre marques et créateurs.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 2 — Acceptation des conditions</h2>
          <P>
            L'accès et l'utilisation de la plateforme Graply impliquent l'<Em>acceptation pleine et entière</Em> des
            présentes CGU. Toute personne refusant d'en accepter les termes doit cesser d'utiliser la plateforme.
          </P>
          <P>
            Ces CGU s'appliquent à <Em>tous les utilisateurs</Em>, marques ou créateurs, résidant en France ou à
            l'étranger.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 3 — Inscription et compte</h2>
          <P>Pour utiliser Graply, tu dois :</P>
          <BulletList
            items={[
              <>Avoir au moins <Em>18 ans</Em> (ou l'âge légal dans ton pays)</>,
              <>Fournir des informations <Em>exactes et à jour</Em> lors de l'inscription</>,
              <>Maintenir la <Em>confidentialité de tes identifiants</Em></>,
              <>Ne créer qu'<Em>un seul compte</Em> par utilisateur</>,
            ]}
          />
          <P>
            Graply se réserve le droit de <Em>suspendre ou supprimer</Em> tout compte ne respectant pas ces
            conditions, sans préavis ni indemnité.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 4 — Règles spécifiques aux marques</h2>
          <BulletList
            items={[
              <>La marque est <Em>seule responsable</Em> du contenu et de la légalité de ses campagnes</>,
              <>Tout dépôt de budget est <Em>définitif et non remboursable</Em> (sauf annulation de campagne active — budget restant remboursé sous 5 à 10 jours ouvrés, hors commission)</>,
              <>Graply prélève une <Em>commission de 8 %</Em> sur chaque dépôt (5 % en formule Premium)</>,
              <>Le <Em>budget minimum</Em> par campagne est de 400 €</>,
              <>La marque dispose de <Em>72 heures</Em> pour valider ou refuser une vidéo soumise (passé ce délai, validation automatique)</>,
              <>Les campagnes faisant la promotion de produits illicites ou contraires aux lois seront <Em>supprimées sans remboursement</Em></>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 5 — Règles spécifiques aux créateurs</h2>
          <BulletList
            items={[
              <>Le créateur doit être majeur et résider dans un <Em>pays éligible à Stripe Connect</Em></>,
              <>Les vidéos soumises doivent être <Em>conformes au brief</Em> de la marque et aux règles des plateformes</>,
              <>Tout recours à des <Em>vues artificielles</Em> (bots, achat de vues) entraîne la suspension immédiate et définitive du compte</>,
              <>La <Em>rémunération est versée chaque lundi</Em> via Stripe Connect, dès 20 € de solde disponible</>,
              <>Le créateur est seul responsable de la <Em>déclaration fiscale</Em> de ses revenus</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 6 — Réseaux sociaux connectés</h2>
          <P>
            Graply permet de connecter tes comptes <Em>TikTok, Instagram et YouTube</Em> via OAuth. En autorisant
            la connexion, tu acceptes que les données correspondantes soient traitées conformément à notre
            Politique de Confidentialité.
          </P>
          <P>
            Tu peux <Em>déconnecter</Em> ces comptes à tout moment depuis la section « Mon compte ». Graply n'est
            pas responsable des interruptions de service ou modifications des API tierces.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 7 — Paiements & Stripe</h2>
          <P>
            Tous les paiements sont traités par <Em>Stripe</Em>. Graply ne stocke aucune donnée bancaire. En utilisant
            les fonctionnalités de paiement, tu acceptes également les conditions générales de Stripe.
          </P>
          <P>
            Les créateurs doivent connecter un <Em>compte Stripe Connect</Em> pour recevoir des paiements.
            L'absence de compte Stripe actif empêche toute candidature à une campagne.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 8 — Propriété intellectuelle</h2>
          <P>
            Tous les éléments de la plateforme (logo, code, design, textes) sont la propriété exclusive de{' '}
            <Em>MBT COMPANY</Em>. Toute reproduction non autorisée est <Em>strictement interdite</Em>.
          </P>
          <P>
            Les créateurs conservent la propriété de leurs vidéos. La marque bénéficie d'une licence d'utilisation
            limitée aux usages définis dans le brief de campagne.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 9 — Responsabilité</h2>
          <P>
            Graply agit uniquement comme <Em>intermédiaire technique</Em>. MBT COMPANY ne peut être tenu
            responsable des dommages indirects, pertes de données, interruptions de service, ou litiges entre
            marques et créateurs.
          </P>
          <P>
            En tout état de cause, la responsabilité de Graply ne saurait excéder les <Em>commissions effectivement
            perçues</Em> au cours des trois mois précédant le dommage.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 10 — Comportements interdits</h2>
          <P>Sont strictement interdits :</P>
          <BulletList
            items={[
              <>Toute tentative de <Em>piratage ou contournement</Em> de la sécurité de la plateforme</>,
              <><Em>Usurpation d'identité</Em> d'un autre utilisateur</>,
              <>Collecte de données d'autres utilisateurs <Em>sans consentement</Em></>,
              <>Diffusion de contenus <Em>illicites, haineux ou trompeurs</Em></>,
              <>Toute pratique visant à <Em>gonfler artificiellement les statistiques</Em></>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 11 — Modification des CGU</h2>
          <P>
            Graply se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront
            informés de toute modification substantielle <Em>par e-mail</Em>. La poursuite de l'utilisation de
            la plateforme vaut acceptation des nouvelles conditions.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 12 — Droit applicable</h2>
          <P>
            Les présentes CGU sont soumises au <Em>droit français</Em>. En cas de litige, les parties
            s'efforceront de trouver une solution amiable dans un délai de 30 jours. À défaut, les{' '}
            <Em>tribunaux français</Em> seront seuls compétents.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">Article 13 — Contact</h2>
          <P>Pour toute question relative aux présentes CGU :</P>
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
