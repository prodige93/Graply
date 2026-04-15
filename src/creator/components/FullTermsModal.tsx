import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────────────────── */

function Em({ children }: { children: ReactNode }) {
  return <strong style={{ fontWeight: 600, color: '#fff' }}>{children}</strong>;
}

function P({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 10px 0' }}>
      {children}
    </p>
  );
}

function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ paddingLeft: 20, margin: '0 0 10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 10px 0', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChapterTitle({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#fff',
        margin: '32px 0 18px 0',
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </div>
  );
}

/* ─── inline content (self-contained, no route deps) ─────────────────────── */

function TermsContent() {
  return (
    <>
      {/* ── 1. Politique de confidentialité ───────────────────────────── */}
      <ChapterTitle>Politique de Confidentialité</ChapterTitle>
      <P>Dernière mise à jour : Mars 2026 — Version 1.0</P>

      <Block title="1. Présentation">
        <P>
          <Em>Graply</Em> est une plateforme numérique de mise en relation entre marques et créateurs de contenu. Elle
          est éditée par <Em>MBT COMPANY</Em>. La présente Politique décrit comment nous collectons, utilisons et
          protégeons tes données personnelles.
        </P>
      </Block>

      <Block title="2. Données collectées">
        <P>Selon les fonctionnalités utilisées :</P>
        <UL items={[
          <><Em>Identité :</Em> nom d'utilisateur, e-mail, rôle (marque / créateur)</>,
          <><Em>Profil :</Em> photo, bannière, biographie, tags de contenu</>,
          <><Em>Réseaux sociaux :</Em> identifiants et tokens TikTok, Instagram, YouTube connectés</>,
          <><Em>Financier :</Em> identifiant Stripe Connect (aucune donnée bancaire brute)</>,
          <><Em>Utilisation :</Em> campagnes, vidéos soumises, candidatures</>,
          <><Em>Session :</Em> token d'authentification Supabase</>,
        ]} />
      </Block>

      <Block title="3. Finalités & base légale">
        <UL items={[
          <>Gestion de ton <Em>compte et de ta session</Em></>,
          <>Mise en relation <Em>marques / créateurs</Em></>,
          <>Traitement des <Em>paiements via Stripe Connect</Em></>,
          <>Synchronisation des <Em>statistiques de contenu</Em> (TikTok, Instagram, YouTube)</>,
          <>Sécurité et intégrité de la plateforme</>,
        ]} />
        <P>Base légale : consentement, exécution du contrat, intérêts légitimes, obligations légales.</P>
      </Block>

      <Block title="4. Partage & sécurité">
        <P>
          Graply <Em>ne vend ni ne loue</Em> tes données. Elles peuvent être partagées avec Stripe, Supabase,
          Meta/Instagram, TikTok, Google/YouTube, et les autorités si requis par la loi.
        </P>
        <P>
          Sécurité : chiffrement via <Em>Supabase Vault</Em>, Row Level Security sur toutes les tables, HTTPS exclusif.
        </P>
      </Block>

      <Block title="5. Tes droits (RGPD)">
        <P>
          Accès, rectification, effacement, portabilité, opposition, retrait du consentement. Contact :{' '}
          <Em>support@graply.io</Em>
        </P>
      </Block>

      {/* ── 2. CGU ──────────────────────────────────────────────────────── */}
      <ChapterTitle>Conditions Générales d'Utilisation</ChapterTitle>
      <P>Dernière mise à jour : Mars 2026 — Version 1.0</P>

      <Block title="Article 1 — Présentation">
        <P>
          Graply est édité par <Em>MBT COMPANY</Em> et agit exclusivement comme <Em>intermédiaire technique</Em> entre
          marques et créateurs.
        </P>
      </Block>

      <Block title="Article 2 — Acceptation">
        <P>
          L'utilisation de la plateforme implique l'<Em>acceptation pleine et entière</Em> des présentes CGU pour tous
          les utilisateurs.
        </P>
      </Block>

      <Block title="Article 3 — Inscription">
        <UL items={[
          <>Avoir au moins <Em>18 ans</Em></>,
          <>Informations <Em>exactes et à jour</Em></>,
          <>Confidentialité de tes <Em>identifiants</Em></>,
          <>Un seul compte par utilisateur</>,
        ]} />
      </Block>

      <Block title="Article 4 — Règles marques">
        <UL items={[
          <>Dépôts de budget <Em>définitifs et non remboursables</Em></>,
          <><Em>Commission 8 %</Em> (5 % Premium) prélevée immédiatement</>,
          <>Budget minimum <Em>400 €</Em> par campagne</>,
          <><Em>72 h</Em> pour valider ou refuser une vidéo soumise</>,
        ]} />
      </Block>

      <Block title="Article 5 — Règles créateurs">
        <UL items={[
          <>Résider dans un <Em>pays éligible à Stripe Connect</Em></>,
          <>Vidéos <Em>conformes au brief</Em> et aux règles des plateformes</>,
          <>Zéro tolérance pour les <Em>vues artificielles</Em> (suspension définitive)</>,
          <>Rémunération versée <Em>chaque lundi</Em> dès 20 € de solde</>,
        ]} />
      </Block>

      <Block title="Articles 6–13 (résumé)">
        <P>
          Réseaux sociaux connectables/déconnectables à tout moment · Paiements exclusivement via{' '}
          <Em>Stripe</Em>, aucune donnée bancaire stockée ·
          Propriété intellectuelle MBT COMPANY · Graply agit comme intermédiaire technique, responsabilité limitée aux
          commissions des 3 derniers mois · Comportements interdits (piratage, fraude, contenus illicites) ·
          CGU modifiables avec notification e-mail · Droit français applicable.
        </P>
      </Block>

      {/* ── 3. Données & usage Stripe ───────────────────────────────────── */}
      <ChapterTitle>Données &amp; usage Stripe</ChapterTitle>

      <Block title="Rôle et données transmises">
        <P>
          Stripe est le prestataire de paiement exclusif. Graply <Em>ne stocke aucune donnée bancaire</Em>. Sont
          transmis : identifiant Stripe Connect, e-mail, montants de transactions.
        </P>
      </Block>

      <Block title="Créateurs">
        <UL items={[
          <><Em>Compte Stripe Connect</Em> obligatoire pour recevoir des paiements</>,
          <>Versements <Em>chaque lundi</Em> dès 20 € de solde</>,
          <>Commission Graply <Em>8 %</Em> (5 % Premium)</>,
        ]} />
      </Block>

      <Block title="Marques">
        <P>Dépôts <Em>définitifs et non remboursables</Em>. Budget restant non consommé remboursé sous 5–10 jours ouvrés en cas d'annulation de campagne active.</P>
      </Block>

      <Block title="Suppression">
        <P>
          Le bouton <Em>« Supprimer mon compte »</Em> efface l'identifiant Stripe Connect de ton profil Graply. Pour
          les données conservées par Stripe, contacte Stripe directement.
        </P>
      </Block>

      {/* ── 4. Données & usage TikTok ───────────────────────────────────── */}
      <ChapterTitle>Données &amp; usage TikTok</ChapterTitle>

      <Block title="Finalité & données collectées">
        <P>
          Connexion TikTok pour identifier ton compte, afficher ton profil, et (si le scope{' '}
          <Em>video.list</Em> est accordé) synchroniser les métadonnées de tes vidéos publiques.
        </P>
        <UL items={[
          <>Identifiant <Em>open_id</Em> et nom d'affichage</>,
          <>Tokens stockés de façon <Em>sécurisée côté serveur</Em></>,
          <>Aucune donnée privée (messages, brouillons) accessible</>,
        ]} />
      </Block>

      <Block title="Suppression TikTok">
        <P>
          Déconnecte TikTok depuis « Mon compte » pour révoquer l'accès. Le bouton{' '}
          <Em>« Supprimer mon compte »</Em> efface toutes les données TikTok liées à ton profil Graply.
        </P>
      </Block>

      {/* ── 5. Données & usage Instagram ────────────────────────────────── */}
      <ChapterTitle>Données &amp; usage Instagram</ChapterTitle>

      <Block title="Finalité & données collectées">
        <P>
          Connexion Instagram pour identifier ton compte et, si activé, synchroniser les métadonnées de tes médias
          publics pour les statistiques et le tableau de bord.
        </P>
        <UL items={[
          <>Identifiant de compte Instagram / nom d'utilisateur</>,
          <>Informations de <Em>profil public</Em></>,
          <>Tokens stockés de façon <Em>sécurisée côté serveur</Em></>,
        ]} />
      </Block>

      <Block title="Suppression Instagram">
        <P>
          Déconnecte Instagram depuis « Mon compte ». Le bouton <Em>« Supprimer mon compte »</Em> supprime toutes
          les données Instagram liées à ton profil Graply.
        </P>
      </Block>

      {/* ── 6. Données & usage YouTube ──────────────────────────────────── */}
      <ChapterTitle>Données &amp; usage YouTube</ChapterTitle>

      <Block title="Finalité & données collectées">
        <P>
          Connexion YouTube pour associer ta chaîne, afficher tes informations sur Graply, et synchroniser les
          métadonnées de vidéos publiques autorisées.
        </P>
        <UL items={[
          <>Identifiants de chaîne et métadonnées de profil public</>,
          <>Tokens d'accès / rafraîchissement <Em>sécurisés côté serveur</Em></>,
        ]} />
      </Block>

      <Block title="Suppression YouTube">
        <P>
          Déconnecte YouTube depuis « Mon compte » ou révoque l'accès depuis ton compte Google. Le bouton{' '}
          <Em>« Supprimer mon compte »</Em> efface toutes les données YouTube liées à ton profil Graply.
        </P>
      </Block>
    </>
  );
}

/* ─── modal ───────────────────────────────────────────────────────────────── */

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  accentColor?: string;
};

export default function FullTermsModal({ open, onClose, onAccept, accentColor = '#F97316' }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  /* reset scroll state when modal opens */
  useEffect(() => {
    if (open) {
      setHasReachedBottom(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  /* lock body scroll */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* esc key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      setHasReachedBottom(true);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-terms-title"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'ftFadeIn 0.22s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          background: 'rgba(16,16,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'ftSlideUp 0.28s ease',
          overflow: 'hidden',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 id="full-terms-title" style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Règlement de la plateforme
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
              Lis l'intégralité du document pour pouvoir confirmer ton inscription.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 34, height: 34, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}
        >
          <TermsContent />

          {/* bottom sentinel */}
          <div style={{ height: 1 }} />
        </div>

        {/* scroll hint */}
        {!hasReachedBottom && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 24px 6px',
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              flexShrink: 0,
              background: 'rgba(16,16,20,0.9)',
            }}
          >
            <ChevronDown size={13} style={{ animation: 'ftBounce 1.4s ease-in-out infinite' }} />
            Fais défiler jusqu'en bas pour confirmer
          </div>
        )}

        {/* footer */}
        <div
          style={{
            padding: '14px 24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {hasReachedBottom && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>
              Tu as lu l'intégralité du règlement.
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!hasReachedBottom}
              onClick={() => { onAccept(); onClose(); }}
              style={{
                flex: 2, padding: '12px 16px', borderRadius: 12,
                fontSize: 14, fontWeight: 700,
                color: hasReachedBottom ? '#fff' : 'rgba(255,255,255,0.35)',
                background: hasReachedBottom ? accentColor : 'rgba(255,255,255,0.06)',
                border: 'none', cursor: hasReachedBottom ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              {hasReachedBottom && <Check size={15} />}
              J'ai lu et j'accepte le règlement
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ftFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ftSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes ftBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
