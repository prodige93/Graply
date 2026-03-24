import { useCallback } from 'react';
import Planet from './Planet';
import MarsPlanet from './MarsPlanet';
import PlanetSwitch from './PlanetSwitch';
import HeroCTAs from './HeroCTAs';
import CreatorMarquee from './CreatorMarquee';
import stripeBadgeWhite from '@/shared/assets/stripe-badge-white.svg';

interface HeroProps {
  isMars: boolean;
  onToggle: () => void;
}

const scrollToElement = (targetId: string) => {
  const element = document.getElementById(targetId);
  if (element) {
    const offset = 100;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

export default function Hero({ isMars, onToggle }: HeroProps) {
  const handleCountryClick = useCallback(() => {
    scrollToElement('how-it-works');
  }, []);

  return (
    <section className="relative bg-black overflow-hidden px-6 pt-24 md:pt-28 pb-0">
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isMars
            ? 'radial-gradient(ellipse at center, rgba(139,92,246,0.03) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at center, rgba(255,165,0,0.015) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="text-center max-w-2xl">
          <div className="flex justify-center mb-5 mt-2 sm:mt-0">
            <img src={stripeBadgeWhite} alt="Powered by Stripe" className="h-6 sm:h-8 md:h-9 opacity-90" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08]">
            {isMars ? (
              <>
                Lancez des{' '}
                <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-violet-300 bg-clip-text text-transparent">
                  campagnes
                </span>
                <br />
                pour votre marque
              </>
            ) : (
              <>
                Votre{' '}
                <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300 bg-clip-text text-transparent">
                  contenu
                </span>
                <br />
                vaut de l'or
              </>
            )}
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed font-light whitespace-pre-line">
            {isMars
              ? <>Des milliers de cr&eacute;ateurs postent pour vous{'\n'}sur <span className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' }}>TikTok</span>, <span className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' }}>Instagram</span> et <span className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' }}>YouTube</span>.</>
              : <>Postez des vid&eacute;os pour les plus grandes{'\n'}marque et soyez <span className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' }}>pay&eacute;</span> &agrave; chaque <span className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' }}>vue</span>.</>}
          </p>

          <div className="mt-8 flex justify-center">
            <PlanetSwitch isMars={isMars} onToggle={onToggle} />
          </div>
        </div>

        <div className="relative mt-10 md:mt-14 w-full flex flex-col items-center justify-center">
          <div className="relative w-[min(85vw,360px)] sm:w-[480px] md:w-[600px] lg:w-[700px] xl:w-[760px] aspect-square">
            <div
              className="absolute inset-[-60%] rounded-full transition-all duration-1000 pointer-events-none"
              style={{
                background: isMars
                  ? 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.08) 18%, rgba(139,92,246,0.04) 32%, rgba(139,92,246,0.015) 48%, rgba(139,92,246,0.005) 62%, transparent 78%)'
                  : 'radial-gradient(circle, rgba(255,165,0,0.12) 0%, rgba(255,165,0,0.065) 18%, rgba(255,165,0,0.03) 32%, rgba(255,165,0,0.012) 48%, rgba(255,165,0,0.004) 62%, transparent 78%)',
              }}
            />
            <div
              className="absolute inset-0 transition-all duration-[800ms] ease-out"
              style={{
                opacity: isMars ? 0 : 1,
                transform: isMars ? 'scale(0.85)' : 'scale(1)',
                pointerEvents: isMars ? 'none' : 'auto',
              }}
            >
              <Planet onCountryClick={handleCountryClick} isMars={isMars} />
            </div>

            <div
              className="absolute inset-0 transition-all duration-[800ms] ease-out"
              style={{
                opacity: isMars ? 1 : 0,
                transform: isMars ? 'scale(1)' : 'scale(0.85)',
                pointerEvents: isMars ? 'auto' : 'none',
              }}
            >
              <MarsPlanet visible={isMars} onCountryClick={handleCountryClick} />
            </div>
          </div>

          <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute text-right"
              style={{
                right: 'calc(50% - 480px)',
                top: '8%',
              }}
            >
              <p
                className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-none"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)' }}
              >
                1000<sup className={`text-xl xl:text-2xl font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
              </p>
              <p className="mt-2 text-sm text-white/80 font-light italic tracking-wide">
                Campagnes
              </p>
            </div>

            <div
              className="absolute text-right"
              style={{
                right: 'calc(50% - 520px)',
                top: '28%',
              }}
            >
              <p
                className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-none"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)' }}
              >
                {isMars ? '500M' : '2M'}<sup className={`text-xl xl:text-2xl font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
              </p>
              <p className="mt-2 text-sm text-white/80 font-light italic tracking-wide">
                {isMars ? 'Vues g\u00e9n\u00e9r\u00e9es' : 'Euros vers\u00e9s'}
              </p>
            </div>

            <div
              className="absolute text-right"
              style={{
                right: 'calc(50% - 530px)',
                top: '50%',
              }}
            >
              <p
                className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-none"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)' }}
              >
                13K<sup className={`text-xl xl:text-2xl font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
              </p>
              <p className="mt-2 text-sm text-white/80 font-light italic tracking-wide leading-tight">
                Cr&eacute;ateurs<br />disponibles
              </p>
            </div>

            <div
              className="absolute text-right"
              style={{
                right: 'calc(50% - 450px)',
                top: '72%',
              }}
            >
              <p
                className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-none"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.15)' }}
              >
                30<sup className={`text-xl xl:text-2xl font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
              </p>
              <p className="mt-2 text-sm text-white/80 font-light italic tracking-wide">
                Pays
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 z-20">
            <HeroCTAs isMars={isMars} />
          </div>
        </div>

        <div className="lg:hidden relative mt-14 w-full max-w-[320px] sm:max-w-[360px] mx-auto h-24 sm:h-28">
          <div className="absolute left-[5%] top-0 text-center">
            <p
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none"
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.25)' }}
            >
              1000<sup className={`text-[10px] sm:text-xs font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] text-white/70 font-light italic tracking-wide">
              Campagnes
            </p>
          </div>

          <div className="absolute left-[28%] bottom-0 text-center">
            <p
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none"
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.25)' }}
            >
              13K<sup className={`text-[10px] sm:text-xs font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] text-white/70 font-light italic tracking-wide leading-tight">
              Cr&eacute;ateurs<br />disponibles
            </p>
          </div>

          <div className="absolute right-[28%] bottom-0 text-center">
            <p
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none"
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.25)' }}
            >
              30<sup className={`text-[10px] sm:text-xs font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] text-white/70 font-light italic tracking-wide">
              Pays
            </p>
          </div>

          <div className="absolute right-[5%] top-0 text-center">
            <p
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none"
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.25)' }}
            >
              {isMars ? '500M' : '2M'}<sup className={`text-[10px] sm:text-xs font-bold transition-colors duration-700 ${isMars ? 'text-violet-500' : 'text-orange-500'}`}>+</sup>
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] text-white/70 font-light italic tracking-wide">
              {isMars ? 'Vues g\u00e9n\u00e9r\u00e9es' : 'Euros vers\u00e9s'}
            </p>
          </div>
        </div>

      </div>

      <div className="relative mt-16 md:mt-20 lg:mt-24">
        <div
          className="relative z-10 rounded-t-[40px] sm:rounded-t-[60px] md:rounded-t-[80px] overflow-hidden"
          style={{ background: '#000' }}
        >
          <div className="pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10">
            <CreatorMarquee />
            <div className="flex flex-col items-center mt-14">
              <a
                href="#marques"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToElement('marques');
                }}
                className="relative group cursor-pointer select-none"
              >
                <div
                  className="absolute -inset-[7px] rounded-full pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(255,255,255,0.2)',
                  }}
                />
                <div
                  className="absolute -inset-[1.5px] rounded-full pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(255,255,255,0.4)',
                  }}
                />
                <div
                  className="relative rounded-full px-6 sm:px-8 py-2 sm:py-2.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(35,35,35,0.95) 0%, rgba(15,15,15,0.98) 50%, rgba(8,8,8,1) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)',
                  }}
                >
                  <span
                    className="relative z-10 text-white font-semibold text-base sm:text-lg tracking-wide inline-flex items-center gap-1.5"
                  >
                    Explorez les marques
                    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" className="relative -top-px shrink-0"><path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </a>
              <p className="mt-4 text-sm sm:text-base text-white/60 font-light tracking-wide">
                <span
                  className="font-bold text-white"
                  style={{ textShadow: '0 0 8px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)' }}
                >
                  +200
                </span>{' '}
                marques utilisent Graply
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
