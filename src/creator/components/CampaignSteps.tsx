import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroCTAs from './HeroCTAs';

interface Testimonial {
  name: string;
  role?: string;
  image: string;
  quote: string;
  revenueLabel: string;
  revenue: string;
}

const creators: Testimonial[] = [
  {
    name: 'Tristan',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop',
    quote: '\u00AB A 18 ans, je suis passe de zero a presque 9 000\u20AC par mois en seulement deux mois \u2014 ca a change ma vie. \u00BB',
    revenueLabel: 'Revenus generes :',
    revenue: 'Zero \u2192 9 000\u20AC/mois en 2 mois',
  },
  {
    name: 'Lina',
    image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop',
    quote: '\u00AB L\u2019argent le plus facile que j\u2019ai gagne en cinq ans, juste en postant des courtes videos. \u00BB',
    revenueLabel: 'Revenus generes :',
    revenue: '19 000\u20AC le premier mois',
  },
  {
    name: 'Sofia',
    image: 'https://images.pexels.com/photos/1758845/pexels-photo-1758845.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop',
    quote: '\u00AB J\u2019ai commence fauchee avec zero en banque, et Graply m\u2019a donne la methode. \u00BB',
    revenueLabel: 'Revenus generes :',
    revenue: '15 000\u20AC gagnes en moins de 3 mois',
  },
  {
    name: 'Maya',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop',
    quote: '\u00AB Je n\u2019aurais jamais cru que poster des clips pouvait payer mon loyer. Maintenant ca paye bien plus. \u00BB',
    revenueLabel: 'Revenus generes :',
    revenue: '7 800\u20AC/mois de facon reguliere',
  },
  {
    name: 'Jordan',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop',
    quote: '\u00AB J\u2019ai quitte mon CDI apres le deuxieme mois. Cette plateforme a change ma vie. \u00BB',
    revenueLabel: 'Revenus generes :',
    revenue: '13 000\u20AC en 6 semaines',
  },
];

const enterpriseImages = [
  '/wedash.png',
  '/carte5.jpeg',
  '/wesecure.png',
];

interface MacFrameProps {
  children: React.ReactNode;
  isCenter: boolean;
  isEnterprise: boolean;
}

function MacFrame({ children, isCenter, isEnterprise }: MacFrameProps) {
  const whiteGrad = isCenter
    ? 'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.25) 100%)'
    : 'linear-gradient(160deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.15) 100%)';

  const violetGrad = isCenter
    ? 'linear-gradient(160deg, rgba(139,92,246,0.6) 0%, rgba(139,92,246,0.2) 30%, rgba(139,92,246,0.1) 60%, rgba(139,92,246,0.35) 100%)'
    : 'linear-gradient(160deg, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.1) 30%, rgba(139,92,246,0.05) 60%, rgba(139,92,246,0.2) 100%)';

  const whiteShadow = isCenter
    ? '0 0 20px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.5)'
    : '0 0 12px rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.4)';

  const violetShadow = isCenter
    ? '0 0 20px rgba(139,92,246,0.15), 0 8px 40px rgba(0,0,0,0.5)'
    : '0 0 12px rgba(139,92,246,0.08), 0 4px 20px rgba(0,0,0,0.4)';

  return (
    <div className="flex flex-col">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-700"
        style={{
          padding: '1px',
          background: isEnterprise ? violetGrad : whiteGrad,
          boxShadow: isEnterprise ? violetShadow : whiteShadow,
        }}
      >
        <div className="rounded-2xl overflow-hidden bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

interface CampaignStepsProps {
  isMars: boolean;
}

export default function CampaignSteps({ isMars }: CampaignStepsProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [enterpriseIndex, setEnterpriseIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(1);
    setEnterpriseIndex(0);
  }, [isMars]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? creators.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === creators.length - 1 ? 0 : prev + 1));
  }, []);

  const handleEnterprisePrev = useCallback(() => {
    setEnterpriseIndex((prev) => (prev === 0 ? enterpriseImages.length - 1 : prev - 1));
  }, []);

  const handleEnterpriseNext = useCallback(() => {
    setEnterpriseIndex((prev) => (prev === enterpriseImages.length - 1 ? 0 : prev + 1));
  }, []);

  const getVisibleCards = () => {
    const prev = activeIndex === 0 ? creators.length - 1 : activeIndex - 1;
    const next = activeIndex === creators.length - 1 ? 0 : activeIndex + 1;
    return [prev, activeIndex, next];
  };

  const [prevIdx, centerIdx, nextIdx] = getVisibleCards();

  const badgeBg = isMars
    ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 30%, #FFFFFF 50%, #F5F5F5 70%, #FFFFFF 100%)'
    : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 30%, #f0f0f0 50%, #dcdcdc 70%, #f5f5f5 100%)';

  const badgeShadow = isMars
    ? '0 1px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(0,0,0,0.05)'
    : '0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';

  const badgeBorder = 'border-gray-200/60';

  const revenueBoxBg = 'rgba(255,255,255,0.06)';
  const revenueBoxBorder = '1px solid rgba(255,255,255,0.08)';

  return (
    <section className="relative bg-black">
      <div className="bg-black pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${badgeBorder} mb-6 transition-all duration-700`}
              style={{
                background: badgeBg,
                boxShadow: badgeShadow,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 transition-colors duration-700" />
              <span className="text-xs font-semibold text-gray-900 tracking-wide uppercase transition-colors duration-700">
                {isMars ? 'Entreprises' : 'Temoignages'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 transition-colors duration-700" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {isMars ? (
                <>
                  Elles font{' '}
                  <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-violet-300 bg-clip-text text-transparent">
                    confiance
                  </span>
                  {' '}a Graply
                </>
              ) : (
                'Ils ont commence comme toi'
              )}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
              {isMars
                ? 'Decouvrez comment les marques boostent leurs ventes avec nos createurs.'
                : 'Et maintenant ils encaissent chaque semaine.'}
            </p>
          </div>

          {isMars ? (
            <div className="mb-16 px-4">
              {/* Mobile: single card carousel */}
              <div className="flex flex-col items-center sm:hidden">
                <div className="relative flex items-center justify-center w-full max-w-sm">
                  <button
                    onClick={handleEnterprisePrev}
                    className="absolute -left-4 z-30 w-10 h-10 rounded-full transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur border border-white/10 shadow-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="overflow-hidden w-full">
                    <div
                      className="flex transition-all duration-500 ease-out"
                      style={{ transform: `translateX(-${enterpriseIndex * 100}%)` }}
                    >
                      {enterpriseImages.map((src, i) => (
                        <div key={i} className="w-full flex-shrink-0">
                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                              padding: '1px',
                              background: 'linear-gradient(160deg, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.15) 30%, rgba(139,92,246,0.08) 60%, rgba(139,92,246,0.3) 100%)',
                              boxShadow: '0 0 20px rgba(139,92,246,0.12), 0 8px 40px rgba(0,0,0,0.4)',
                            }}
                          >
                            <div className="rounded-2xl overflow-hidden bg-black">
                              <img src={src} alt="" className="w-full h-auto object-contain" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleEnterpriseNext}
                    className="absolute -right-4 z-30 w-10 h-10 rounded-full transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur border border-white/10 shadow-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-5">
                  {enterpriseImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEnterpriseIndex(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === enterpriseIndex
                          ? 'w-8 h-2.5 bg-white'
                          : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: all 3 cards side by side */}
              <div className="hidden sm:flex flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-10">
                {enterpriseImages.map((src, i) => (
                  <div
                    key={i}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03]"
                    style={{ width: '100%', maxWidth: 340 }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        padding: '1px',
                        background: 'linear-gradient(160deg, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.15) 30%, rgba(139,92,246,0.08) 60%, rgba(139,92,246,0.3) 100%)',
                        boxShadow: '0 0 20px rgba(139,92,246,0.12), 0 8px 40px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div className="rounded-2xl overflow-hidden bg-black">
                        <img src={src} alt="" className="w-full h-auto object-contain" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center mb-16">
                <button
                  onClick={handlePrev}
                  className="absolute left-0 sm:-left-2 lg:left-0 z-30 w-14 h-14 rounded-full transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur border border-white/10 shadow-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 hover:shadow-xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-center gap-8 sm:gap-10 lg:gap-14 w-full max-w-6xl overflow-hidden px-16 sm:px-20">
                  {[prevIdx, centerIdx, nextIdx].map((idx, position) => {
                    const item = creators[idx];
                    const isCenter = position === 1;

                    return (
                      <div
                        key={`c-${idx}-${position}`}
                        className={`relative flex-shrink-0 transition-all duration-500 ease-out cursor-pointer ${
                          isCenter
                            ? 'z-20'
                            : 'z-10 opacity-40 hidden md:block'
                        }`}
                        style={{
                          width: isCenter ? 380 : 300,
                          transform: isCenter ? 'scale(1)' : 'scale(0.88)',
                        }}
                        onClick={() => {
                          if (position === 0) handlePrev();
                          if (position === 2) handleNext();
                        }}
                      >
                        <MacFrame isCenter={isCenter} isEnterprise={false}>
                          <div
                            className="relative"
                            style={{
                              height: isCenter ? 520 : 440,
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />

                            <div
                              className="absolute inset-0 transition-all duration-700"
                              style={{
                                background: isCenter
                                  ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.1) 65%, transparent 100%)'
                                  : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
                              }}
                            />

                            {!isCenter && (
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                            )}

                            <div className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 transition-all duration-500 ${isCenter ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'}`}>
                              <h3 className={`font-bold text-white mb-1 ${isCenter ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                                {item.name}
                              </h3>

                              <div className="mb-2" />

                              <p className={`text-white/90 leading-relaxed mb-5 ${isCenter ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                                {item.quote}
                              </p>

                              <div
                                className="rounded-xl p-3 sm:p-4 transition-all duration-700"
                                style={{
                                  background: revenueBoxBg,
                                  border: revenueBoxBorder,
                                  backdropFilter: 'blur(8px)',
                                }}
                              >
                                <p className={`font-medium mb-1 transition-colors duration-700 ${isCenter ? 'text-xs sm:text-sm' : 'text-[11px]'} text-white/50`}>
                                  {item.revenueLabel}
                                </p>
                                <p className={`font-bold ${isCenter ? 'text-base sm:text-lg' : 'text-sm'} text-white`}>
                                  {item.revenue}
                                </p>
                              </div>
                            </div>
                          </div>
                        </MacFrame>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleNext}
                  className="absolute right-0 sm:-right-2 lg:right-0 z-30 w-14 h-14 rounded-full transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur border border-white/10 shadow-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 hover:shadow-xl"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mb-10">
                {creators.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? 'w-8 h-2.5 bg-white'
                        : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex justify-center">
            <HeroCTAs isMars={isMars} />
          </div>
        </div>
      </div>
    </section>
  );
}
