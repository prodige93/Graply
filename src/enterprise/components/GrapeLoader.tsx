import loadingGrape from '@/shared/assets/loader-grape-violet.png';

interface GrapeLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-28 h-28',
};

export default function GrapeLoader({ size = 'lg', fullScreen = false }: GrapeLoaderProps) {
  const img = (
    <img
      src={loadingGrape}
      alt="Chargement"
      className={`${sizeMap[size]} animate-wobble object-contain`}
    />
  );

  if (fullScreen) {
    return (
      <div
        className="absolute inset-0 min-h-screen flex items-center justify-center z-40"
        style={{ backgroundColor: '#050404' }}
      >
        {img}
      </div>
    );
  }

  return img;
}
