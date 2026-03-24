import HeroCTAs from './HeroCTAs';

interface HowItWorksProps {
  isMars: boolean;
}

export default function HowItWorks({ isMars }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="relative">
      <div className="absolute top-0 left-0 right-0 h-32 bg-black">
        <svg
          viewBox="0 0 1440 128"
          className="absolute bottom-0 w-full h-32"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L0,64 Q360,128 720,128 Q1080,128 1440,64 L1440,0 Z"
            fill="black"
          />
          <path
            d="M0,64 Q360,128 720,128 Q1080,128 1440,64 L1440,128 L0,128 Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="bg-white pt-48 pb-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                Comment ça marche
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {isMars ? (
                <>
                  En 3 étapes,
                  <br />
                  votre marque décolle
                </>
              ) : (
                <>
                  Lancez-vous en
                  <br />
                  3 étapes simples
                </>
              )}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              {isMars ? 'Créez, validez, payez uniquement aux résultats.' : 'Crée, publie et gagne de l\'argent.'}
            </p>
          </div>

          {isMars ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 w-full px-4">
              {[
                { step: 1, src: '/violet1-opt.webp' },
                { step: 2, src: '/violet2-opt.webp' },
                { step: 3, src: '/violet3-opt.webp' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-full overflow-hidden rounded-2xl">
                    <img
                      src={item.src}
                      alt={`Step ${item.step}`}
                      loading="lazy"
                      className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 -mt-4">
                    <div className="w-10 h-px bg-purple-500/30" />
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold tracking-wide">
                      Step {item.step}
                    </span>
                    <div className="w-10 h-px bg-purple-500/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 w-full px-4">
              {[
                { step: 1, src: '/9.png' },
                { step: 2, src: '/10.png' },
                { step: 3, src: '/11.png' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-full overflow-hidden rounded-2xl">
                    <img
                      src={item.src}
                      alt={`Step ${item.step}`}
                      loading="lazy"
                      className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 -mt-4">
                    <div className="w-10 h-px bg-orange-500/30" />
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold tracking-wide">
                      Step {item.step}
                    </span>
                    <div className="w-10 h-px bg-orange-500/30" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            <HeroCTAs isMars={isMars} />

            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
                  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
                  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
                  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                {isMars
                  ? <>La confiance de <span className="font-semibold text-gray-600">+200</span> marques dans le monde</>
                  : <>La confiance de <span className="font-semibold text-gray-600">12 000+</span> membres dans le monde</>
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-20 bg-white">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gray-50 rounded-t-[48px] sm:rounded-t-[72px]" />
      </div>
    </section>
  );
}
