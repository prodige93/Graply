import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Comment fonctionne Graply ?',
    answer:
      'Graply met en relation des marques avec des createurs de contenu. Tu choisis une campagne, tu crees du contenu video court, et tu es paye en fonction de tes performances. Pas besoin d\'audience massive — juste de la creativite et de la regularite.',
  },
  {
    question: 'Combien puis-je gagner ?',
    answer:
      'Les gains varient selon les campagnes et tes performances. Certains createurs gagnent entre 500 et 2 000 EUR par mois en debutant, et les meilleurs depassent les 10 000 EUR mensuels. Plus tu publies de contenu de qualite, plus tu gagnes.',
  },
  {
    question: 'Faut-il une audience ou des abonnes pour commencer ?',
    answer:
      'Non. Tu peux demarrer avec zero abonne. Ce qui compte, c\'est la qualite du contenu et l\'engagement qu\'il genere. Beaucoup de nos meilleurs createurs ont commence sans communaute existante.',
  },
  {
    question: 'Comment sont effectues les paiements ?',
    answer:
      'Les paiements sont effectues automatiquement chaque mois par virement bancaire ou PayPal. Tu suis tes gains en temps reel depuis ton tableau de bord, et tu es paye des que tu atteins le seuil minimum.',
  },
  {
    question: 'Sur quelles plateformes puis-je publier ?',
    answer:
      'Tu peux publier sur TikTok, Instagram Reels, YouTube Shorts et d\'autres plateformes de video courte. Chaque campagne precise les plateformes acceptees et les formats requis.',
  },
  {
    question: 'Combien de temps faut-il pour commencer a gagner ?',
    answer:
      'La plupart des createurs voient leurs premiers revenus dans les 7 a 14 jours apres avoir publie leur premier contenu. L\'inscription et la selection de campagne prennent moins de 10 minutes.',
  },
];

interface FAQProps {
  isMars: boolean;
}

export default function FAQ({ isMars }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="relative bg-black pt-2 pb-2 md:pb-8 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="px-6 sm:px-10 md:px-14 py-14 sm:py-16">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200/60 mb-6"
              style={{
                background: 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 30%, #f0f0f0 50%, #dcdcdc 70%, #f5f5f5 100%)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
              <span className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                Questions Frequentes
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              FAQ
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
              Tout ce que tu dois savoir avant de te lancer.
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-all duration-700"
              style={{
                borderTop: isMars ? '2px solid rgba(139, 92, 246, 0.85)' : '2px solid rgba(255, 165, 0, 0.85)',
                borderRight: isMars ? '2px solid rgba(139, 92, 246, 0.85)' : '2px solid rgba(255, 165, 0, 0.85)',
                borderTopRightRadius: '18px',
                borderBottom: 'none',
                borderLeft: 'none',
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, black 50%, black 100%), linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.3) 80%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, black 50%, black 100%), linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.3) 80%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                boxShadow: isMars
                  ? '0 0 8px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.25)'
                  : '0 0 8px rgba(255, 160, 20, 0.6), 0 0 20px rgba(255, 150, 0, 0.25)',
              }}
            />

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;

                return (
                  <div
                    key={i}
                    className={`rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? isMars
                          ? 'border-violet-500/30 bg-violet-500/10 shadow-sm'
                          : 'border-white/10 bg-white/5 shadow-sm'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                    style={
                      isOpen && !isMars
                        ? {
                            borderColor: 'rgba(255, 165, 0, 0.3)',
                            backgroundColor: 'rgba(255, 165, 0, 0.1)',
                          }
                        : undefined
                    }
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span
                        className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
                          isOpen ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? isMars
                              ? 'bg-violet-500 text-white rotate-180'
                              : 'text-white rotate-180'
                            : 'bg-white/10 text-white/50'
                        }`}
                        style={
                          isOpen && !isMars
                            ? { backgroundColor: '#FFA500' }
                            : undefined
                        }
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-300 ease-out"
                      style={{
                        maxHeight: isOpen ? '300px' : '0px',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="px-6 pb-5 text-sm sm:text-base text-white/50 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
