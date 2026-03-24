import { useState, useEffect } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import iphone17Img from '@/shared/assets/hero-slide-iphone17.jpeg';
import bo7Img from '@/shared/assets/hero-slide-bo7.jpeg';

export default function EnterpriseHomePage() {
  const navigate = useEnterpriseNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'iPhone 17',
      image: iphone17Img,
      description: 'Nouvelle collection',
    },
    {
      id: 2,
      title: 'Black Ops 7',
      image: bo7Img,
      description: 'Campagne exclusive',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative overflow-hidden" style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={() => navigate('/campagnes')}
          className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
            index === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 lg:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 lg:p-12 pb-32 lg:pb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-2 lg:mb-3">{slide.title}</h2>
            <p className="text-lg lg:text-xl text-gray-300">{slide.description}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-24 lg:bottom-6 left-6 lg:left-12 z-[60]">
        <div className="flex gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: index === currentSlide ? '14px' : '4px',
                height: '4px',
                background: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-[60] lg:hidden">
        <button
          type="button"
          onClick={() => navigate('/campagnes')}
          className="cursor-pointer select-none rounded-2xl px-6 py-3.5 flex items-center justify-center gap-2.5 active:scale-95 transition-transform duration-200"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap">Voir les campagnes</span>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M4 10L10 4M10 4H5M10 4V9"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-32 lg:bottom-16 left-1/2 -translate-x-1/2 z-[60]">
        <button
          type="button"
          onClick={() => navigate('/campagnes')}
          className="hidden lg:flex cursor-pointer select-none rounded-2xl px-6 py-3.5 items-center justify-center gap-2.5 active:scale-95 transition-transform duration-200"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap">Voir les campagnes</span>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M4 10L10 4M10 4H5M10 4V9"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </main>
  );
}
