import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: 'Article 1 — Présentation de la plateforme',
    content:
      "Graply est une plateforme numérique de mise en relation entre des marques souhaitant promouvoir leurs produits ou services via du contenu vidéo court format et des créateurs de contenu souhaitant monétiser leur audience sur les réseaux sociaux. Graply est édité par MBT COMPANY, société régulièrement constituée selon les lois françaises. Graply agit exclusivement en tant qu'intermédiaire technique et ne saurait en aucun cas être considéré comme partie prenante des relations contractuelles établies entre les marques et les créateurs. Graply ne produit aucun contenu, ne lance aucune campagne en son nom propre, et n'intervient à aucun moment dans la relation directe entre une marque et un créateur.",
  },
  {
    title: 'Article 2 — Acceptation des conditions',
    content:
      "L'accès et l'utilisation de la plateforme Graply impliquent l'acceptation pleine, entière et sans réserve des présentes Conditions Générales d'Utilisation. Toute personne refusant d'en accepter l'intégralité des termes doit immédiatement cesser d'utiliser la plateforme. Ces CGU s'appliquent à tous les utilisateurs sans exception, qu'ils soient marques ou créateurs, résidant en France ou à l'étranger. L'utilisation de la plateforme vaut acceptation des présentes CGU dans leur version en vigueur au moment de la connexion.",
  },
  {
    title: 'Article 3 — Définitions',
    content: [
      "Plateforme : le site web, les interfaces et l'ensemble des services accessibles via graply.io.",
      'MBT COMPANY : la société éditrice de la plateforme Graply.',
      'Marque : toute personne physique ou morale utilisant la plateforme dans le but de lancer des campagnes de contenu vidéo.',
      "Créateur : toute personne physique utilisant la plateforme dans le but de produire, publier et monétiser du contenu vidéo en échange d'une rémunération basée sur les vues.",
      "Campagne : une offre publiée par une marque sur la plateforme, définissant les conditions de création de contenu, les plateformes cibles, le budget alloué et la rémunération par millier de vues.",
      "Contenu : toute vidéo produite et publiée par un créateur dans le cadre d'une campagne active sur la plateforme.",
      "Commission : la part prélevée par Graply sur chaque dépôt de budget effectué par une marque, correspondant à 8% du montant déposé en formule standard et 5% en formule Premium.",
      "Vues : le nombre de visualisations d'une vidéo tel que comptabilisé par les APIs officielles des plateformes TikTok, Instagram et YouTube.",
    ],
  },
  {
    title: "Article 4 — Inscription et accès à la plateforme",
    content: [
      "4.1 Conditions d'accès — Pour s'inscrire sur Graply, l'utilisateur doit être une personne physique majeure âgée d'au moins 18 ans, ou une personne morale régulièrement constituée. Toute inscription au nom d'une entreprise implique que la personne procédant à l'inscription dispose des droits, mandats et autorisations nécessaires pour engager juridiquement ladite entreprise. MBT COMPANY se réserve le droit de demander à tout moment une preuve de cette capacité.",
      "4.2 Exactitude des informations — L'utilisateur s'engage à fournir des informations exactes, sincères, complètes et à jour lors de son inscription et tout au long de l'utilisation de la plateforme. Toute information fausse, trompeuse ou incomplète entraînera la suspension immédiate du compte sans préavis, sans indemnité et sans remboursement d'aucun solde disponible.",
      "4.3 Confidentialité du compte — L'utilisateur est seul et entièrement responsable de la confidentialité de ses identifiants de connexion. Tout accès à la plateforme réalisé via les identifiants d'un utilisateur est présumé être effectué par cet utilisateur. Graply ne pourra être tenu responsable de tout accès non autorisé, vol de compte ou utilisation frauduleuse résultant d'une négligence de l'utilisateur dans la conservation de ses identifiants.",
      "4.4 Suspension et résiliation — Graply se réserve le droit de suspendre, restreindre ou supprimer tout compte à tout moment et sans préavis en cas de violation des présentes CGU, de comportement frauduleux avéré ou suspecté, d'atteinte aux droits de tiers, de nuisance à l'image de la plateforme, ou pour toute autre raison jugée légitime par MBT COMPANY. La suppression d'un compte n'ouvre droit à aucun remboursement ni indemnité.",
      "4.5 Unicité du compte — Chaque utilisateur ne peut détenir qu'un seul compte sur la plateforme. La création de comptes multiples dans le but de contourner une suspension ou d'abuser des conditions de la plateforme est strictement interdite et pourra entraîner des poursuites judiciaires.",
    ],
  },
  {
    title: 'Article 5 — Conditions spécifiques aux marques',
    content: [
      "5.1 Création de campagne — La marque est seule et entièrement responsable du contenu de ses campagnes, de la légalité de ses produits ou services, de la conformité de ses briefs avec les législations en vigueur, et de l'exactitude des informations communiquées aux créateurs. Graply ne procède à aucune vérification préalable systématique du contenu des campagnes et ne saurait être tenu responsable des campagnes publiées, de leur contenu, ni de leurs conséquences.",
      "5.2 Dépôt de budget — Tout dépôt de budget est définitif, irrévocable et non remboursable. Aucun remboursement ne sera accordé une fois le paiement effectué et confirmé par Stripe, quelle que soit la raison invoquée — annulation volontaire de campagne, insatisfaction des résultats, litige avec un ou plusieurs créateurs, erreur de saisie, changement de stratégie, ou toute autre circonstance. En cas d'annulation d'une campagne active par la marque, le budget restant non consommé sera remboursé sur le moyen de paiement initial dans un délai de 5 à 10 jours ouvrés. La commission prélevée lors du dépôt reste définitivement acquise à Graply et ne sera en aucun cas remboursée.",
      "5.3 Commission — Graply prélève une commission de 8% sur chaque dépôt de budget effectué par une marque en formule standard. Cette commission est prélevée automatiquement et immédiatement au moment de la confirmation du paiement par Stripe et n'est en aucun cas remboursable, y compris en cas de résiliation du compte, d'annulation de campagne ou de litige. Les marques souscrivant à l'abonnement Premium bénéficient d'une commission réduite à 5% sur leurs dépôts de budget.",
      "5.4 Budget minimum — Le budget minimum pour créer une campagne sur Graply est fixé à 400\u20ac. Graply se réserve le droit de modifier ce seuil minimum à tout moment, avec notification préalable aux utilisateurs.",
      "5.5 Validation des contenus — La marque dispose d'un délai maximum de 72 heures pour valider ou refuser chaque vidéo soumise par un créateur dans le cadre de sa campagne. Passé ce délai sans action de la part de la marque, la vidéo sera automatiquement considérée comme validée et la rémunération correspondante sera déclenchée. La marque est seule responsable de ses décisions de validation ou de refus. Graply ne pourra être tenu responsable des conséquences d'une validation automatique résultant de l'inaction de la marque dans le délai imparti.",
      "5.6 Licéité des campagnes — La marque s'engage fermement à ne publier aucune campagne faisant la promotion de produits ou services illicites, contrefaits, trompeurs, dangereux pour la santé ou la sécurité des personnes, contraires aux bonnes m\u0153urs, ou en violation des lois et réglementations en vigueur dans son pays ou dans le pays des créateurs ciblés. Graply se réserve le droit de supprimer sans préavis toute campagne jugée non conforme, sans remboursement du budget déposé et sans indemnité d'aucune sorte.",
      "5.7 Responsabilité exclusive de la marque — La marque est seule et entièrement responsable des campagnes qu'elle publie, des briefs qu'elle rédige, des instructions qu'elle communique aux créateurs, des produits ou services qu'elle fait promouvoir, et de l'ensemble des conséquences pouvant résulter de l'utilisation du contenu produit dans le cadre de ses campagnes. Graply ne saurait en aucun cas être tenu responsable des litiges, plaintes, réclamations, mises en demeure ou procédures judiciaires — civiles, pénales ou administratives — résultant directement ou indirectement des campagnes publiées par les marques sur la plateforme.",
      "5.8 Droits sur le contenu produit — En lançant une campagne sur Graply, la marque reconnaît que les droits sur les vidéos produites par les créateurs restent la propriété des créateurs, sauf accord explicite contraire stipulé dans le brief de campagne. La marque s'engage à ne pas utiliser les vidéos produites à des fins non prévues dans le brief sans l'accord préalable du créateur concerné.",
    ],
  },
  {
    title: 'Article 6 — Conditions spécifiques aux créateurs',
    content: [
      "6.1 Éligibilité et prérequis — Pour accéder aux campagnes et recevoir des paiements via la plateforme, le créateur doit être une personne physique majeure âgée d'au moins 18 ans, résider dans un pays éligible aux services de Stripe Connect, et disposer d'un compte Stripe valide et actif connecté à son profil Graply. L'absence de compte Stripe connecté empêche toute candidature à une campagne. Graply ne saurait être tenu responsable de tout refus, suspension ou résiliation de compte Stripe par Stripe à l'encontre d'un créateur.",
      "6.2 Conformité du contenu — Le créateur s'engage à produire du contenu strictement conforme au brief fourni par la marque, aux conditions générales et règles communautaires des plateformes sur lesquelles il publie (TikTok, Instagram, YouTube), et aux lois et réglementations en vigueur. Toute vidéo contenant des propos haineux, discriminatoires, violents, sexuellement explicites, portant atteinte aux droits de tiers, faisant la promotion de substances illicites, ou susceptible d'engager la responsabilité civile ou pénale de son auteur sera refusée sans rémunération et pourra entraîner la suspension immédiate du compte.",
      "6.3 Authenticité des vues — Le créateur s'interdit formellement et sans exception de recourir à tout moyen artificiel, automatisé ou frauduleux pour gonfler le nombre de vues de ses vidéos — incluant sans limitation l'achat de vues, l'utilisation de bots ou de scripts automatisés, les échanges de vues, les réseaux de visionnage artificiel, ou toute autre pratique visant à fausser les statistiques de visualisation. Toute fraude détectée ou suspectée entraînera la suspension immédiate et définitive du compte, l'annulation de l'ensemble des paiements en cours ou à venir, le remboursement des sommes indûment perçues, et pourra donner lieu à des poursuites judiciaires civiles et pénales.",
      "6.4 Rémunération — Le créateur sera rémunéré selon le tarif par millier de vues défini par la marque dans sa campagne, sur la base des vues comptabilisées par les APIs officielles des plateformes concernées. Graply ne garantit aucun niveau de revenus minimum, aucune fréquence minimale de campagnes disponibles, ni aucune acceptation de candidature. Les paiements sont effectués chaque semaine le lundi via Stripe Connect, sous réserve que le solde disponible du créateur atteigne le seuil minimum de 20\u20ac. Les soldes inférieurs à ce seuil sont reportés à la semaine suivante.",
      "6.5 Obligations fiscales et sociales — Le créateur est seul et entièrement responsable de la déclaration de ses revenus perçus via la plateforme auprès des autorités fiscales et sociales compétentes de son pays de résidence. Graply ne fournit aucun conseil fiscal, juridique ou social, et ne saurait être tenu responsable des obligations déclaratives, des redressements fiscaux, des cotisations sociales, ou de toute autre conséquence fiscale ou sociale résultant des revenus perçus par le créateur via la plateforme.",
      "6.6 Responsabilité exclusive du créateur — Le créateur est seul et entièrement responsable du contenu qu'il produit et publie, de sa conformité avec les règles des plateformes de diffusion, des droits de propriété intellectuelle relatifs aux éléments utilisés dans ses vidéos, et de l'ensemble des conséquences juridiques pouvant résulter de la publication de ses contenus. Graply ne saurait en aucun cas être tenu responsable des litiges, plaintes, réclamations ou procédures résultant des contenus publiés par les créateurs.",
    ],
  },
  {
    title: 'Article 7 — Rôle et responsabilité de Graply',
    content: [
      "7.1 Intermédiaire technique exclusif — Graply agit exclusivement en tant qu'intermédiaire technique facilitant la mise en relation entre marques et créateurs. Graply n'est partie à aucun contrat conclu entre une marque et un créateur, n'intervient pas dans la définition des campagnes, ne contrôle pas le contenu publié par les créateurs, et n'assume aucune responsabilité quant aux relations commerciales, financières ou juridiques établies entre les marques et les créateurs via la plateforme.",
      "7.2 Exclusion de garantie — Graply ne garantit pas la disponibilité continue, ininterrompue et sans erreur de la plateforme, l'exactitude et l'exhaustivité des données de vues fournies par les APIs tierces, les résultats commerciaux obtenus par les marques via leurs campagnes, les revenus perçus par les créateurs, ni la compatibilité de la plateforme avec tous les équipements et systèmes d'exploitation.",
      "7.3 Limitation de responsabilité — Dans toute la mesure permise par la loi applicable, MBT COMPANY et Graply ne sauraient être tenus responsables de tout dommage direct, indirect, accessoire, spécial, punitif ou consécutif résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme, d'une interruption ou d'une défaillance du service, d'une perte de données ou de revenus, d'un litige entre une marque et un créateur, d'une modification unilatérale des APIs tierces affectant le comptage des vues, ou de tout acte frauduleux commis par un utilisateur tiers. En tout état de cause, la responsabilité de Graply ne saurait excéder le montant des commissions effectivement perçues par Graply au cours des trois mois précédant la survenance du dommage.",
      "7.4 Force majeure — Graply ne saurait être tenu responsable de tout manquement à ses obligations résultant d'un événement de force majeure, incluant sans limitation les pannes de serveurs ou d'infrastructures techniques, les cyberattaques ou tentatives d'intrusion, les modifications ou interruptions des APIs de TikTok, Instagram ou YouTube, les défaillances du prestataire de paiement Stripe, les grèves, catastrophes naturelles, pandémies, décisions gouvernementales, ou tout autre événement imprévisible et irrésistible échappant au contrôle raisonnable de MBT COMPANY.",
      "7.5 Modération — Graply se réserve le droit, sans y être obligé, de modérer les campagnes et les contenus publiés sur la plateforme. L'absence de modération d'un contenu ne saurait engager la responsabilité de Graply et ne vaut pas approbation dudit contenu.",
    ],
  },
  {
    title: 'Article 8 — Paiements et facturation',
    content: [
      "8.1 Prestataire de paiement — L'ensemble des paiements effectués sur la plateforme sont traités exclusivement par Stripe, prestataire de services de paiement indépendant. En utilisant les services de paiement intégrés à Graply, l'utilisateur accepte également les conditions générales d'utilisation de Stripe, disponibles sur stripe.com. MBT COMPANY ne stocke aucune donnée bancaire ou de carte de paiement sur ses serveurs et ne saurait être tenu responsable des incidents, erreurs, fraudes ou défaillances liés au traitement des paiements par Stripe.",
      "8.2 Politique de remboursement — La commission prélevée par Graply lors de chaque dépôt de budget est définitive et non remboursable en toute circonstance. Le budget non consommé d'une campagne annulée par la marque sera remboursé sur le moyen de paiement initial sous 5 à 10 jours ouvrés. Aucun remboursement ne sera accordé sur l'abonnement Premium, les frais de sponsoring, ou tout autre service activé sur la plateforme.",
      "8.3 Abonnement Premium — L'abonnement Premium est proposé aux marques au tarif de 50\u20ac par mois. Cet abonnement est sans engagement et peut être résilié à tout moment. La résiliation prend effet à la fin de la période mensuelle en cours. Aucun remboursement partiel ou prorata temporis ne sera accordé en cas de résiliation en cours de mois.",
      "8.4 Facturation — Une facture sera automatiquement générée et transmise par email à chaque dépôt de budget et à chaque paiement d'abonnement effectué par une marque. Il appartient à l'utilisateur de conserver ces factures à des fins comptables et fiscales.",
      "8.5 Fraude au paiement — Tout paiement effectué avec une carte bancaire volée, frauduleuse ou contestée entraînera la suspension immédiate du compte concerné, l'annulation des campagnes actives, et sera signalé aux autorités compétentes. MBT COMPANY se réserve le droit d'engager toutes procédures judiciaires nécessaires au recouvrement des sommes indûment obtenues.",
    ],
  },
  {
    title: 'Article 9 — Propriété intellectuelle',
    content: [
      "9.1 Contenu des marques — Les marques conservent l'intégralité des droits de propriété intellectuelle sur leurs briefs, visuels, logos, éléments de marque et toute autre ressource transmise aux créateurs dans le cadre des campagnes. Les créateurs s'engagent à utiliser ces éléments exclusivement dans le cadre de la campagne concernée et à ne pas les reproduire, diffuser ou utiliser à d'autres fins sans autorisation expresse de la marque.",
      "9.2 Contenu des créateurs — Les créateurs conservent la propriété de leurs vidéos. En soumettant une vidéo dans le cadre d'une campagne, le créateur accorde à la marque concernée une licence non exclusive d'utilisation du contenu produit, pour les usages et la durée définis dans le brief de campagne. Graply ne revendique aucun droit de propriété sur les contenus produits par les créateurs.",
      "9.3 Plateforme Graply — Tous les éléments constituant la plateforme Graply — logo, charte graphique, design, code source, textes, fonctionnalités, algorithmes, bases de données, et tout autre élément — sont la propriété exclusive de MBT COMPANY et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, copie, extraction, modification, distribution ou utilisation non expressément autorisée par MBT COMPANY est strictement interdite et pourra donner lieu à des poursuites judiciaires.",
    ],
  },
  {
    title: 'Article 10 — Données personnelles et RGPD',
    content:
      "Graply collecte et traite les données personnelles de ses utilisateurs dans le strict respect du Règlement Général sur la Protection des Données (RGPD) et de la loi Informatique et Libertés. Les données collectées sont utilisées exclusivement aux fins de fonctionnement de la plateforme, de traitement des paiements, et de communication avec les utilisateurs. Elles ne sont jamais vendues à des tiers. Conformément au RGPD, tout utilisateur dispose d'un droit d'accès, de rectification, de suppression, de limitation, d'opposition et de portabilité de ses données personnelles, qu'il peut exercer à tout moment en adressant une demande écrite à support@graply.io. Pour plus d'informations sur le traitement des données personnelles, l'utilisateur est invité à consulter la Politique de Confidentialité disponible sur graply.io.",
  },
  {
    title: 'Article 11 — Comportements interdits',
    content:
      "Il est strictement interdit à tout utilisateur de la plateforme de tenter de pirater, contourner ou compromettre les systèmes de sécurité de la plateforme, d'usurper l'identité d'un autre utilisateur, de collecter les données personnelles d'autres utilisateurs sans leur consentement, de publier des contenus portant atteinte aux droits de tiers, de diffuser des virus ou tout autre code malveillant, d'utiliser la plateforme à des fins de blanchiment d'argent ou de financement d'activités illicites, ou de nuire de quelque manière que ce soit au bon fonctionnement de la plateforme ou à la réputation de MBT COMPANY. Tout comportement interdit entraînera la suspension immédiate et définitive du compte, sans préavis ni indemnité, et pourra donner lieu à des poursuites judiciaires civiles et pénales.",
  },
  {
    title: 'Article 12 — Modification des CGU',
    content:
      "MBT COMPANY se réserve le droit de modifier les présentes CGU à tout moment et sans préavis. Les utilisateurs seront informés de toute modification substantielle par email à l'adresse renseignée lors de leur inscription. La poursuite de l'utilisation de la plateforme après notification des nouvelles conditions vaut acceptation pleine et entière desdites conditions. Il appartient à chaque utilisateur de consulter régulièrement les CGU en vigueur disponibles sur graply.io.",
  },
  {
    title: 'Article 13 — Droit applicable et juridiction compétente',
    content:
      "Les présentes CGU sont soumises au droit français. En cas de litige relatif à l'interprétation, à la validité ou à l'exécution des présentes CGU, les parties s'efforceront en premier lieu de trouver une solution amiable dans un délai de 30 jours à compter de la notification du litige par la partie la plus diligente. À défaut de résolution amiable dans ce délai, les tribunaux français seront seuls compétents pour connaître du litige.",
  },
  {
    title: 'Article 14 — Divisibilité',
    content:
      "Si l'une quelconque des dispositions des présentes CGU était déclarée nulle, invalide ou inapplicable par une juridiction compétente, les autres dispositions demeureront pleinement en vigueur et de plein effet. La disposition nulle ou inapplicable sera remplacée par une disposition valide qui se rapprochera le plus possible de l'intention initiale des parties.",
  },
  {
    title: 'Article 15 — Contact',
    content: "Pour toute question, réclamation ou demande relative aux présentes CGU, l'utilisateur peut contacter MBT COMPANY à l'adresse suivante : support@graply.io",
  },
];

export default function CguModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'cguFadeIn 0.25s ease',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 640,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          background: 'rgba(18,18,22,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: 'cguSlideUp 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Conditions Générales d'Utilisation
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                margin: '4px 0 0',
              }}
            >
              Version 1.0 — Mars 2026
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px 32px',
          }}
        >
          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: i < sections.length - 1 ? 28 : 0 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  margin: '0 0 10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {section.title}
              </h3>
              {Array.isArray(section.content) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.content.map((item, j) => (
                    <p
                      key={j}
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {section.content}
                </p>
              )}
            </div>
          ))}

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
                margin: 0,
              }}
            >
              Graply — graply.io — MBT COMPANY &copy; 2026 — Tous droits réservés
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cguFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cguSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
