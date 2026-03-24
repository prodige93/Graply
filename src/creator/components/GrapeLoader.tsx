import loadingImage from '@/shared/assets/loader-grape-orange.png';

interface GrapeLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-28 h-28',
  xl: 'w-44 h-44',
};

export default function GrapeLoader({ size = 'lg', fullScreen = false }: GrapeLoaderProps) {
  const img = (
    <img
      src={loadingImage}
      alt="Chargement"
      className={`${sizeMap[size]} animate-wobble object-contain`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: '50vh' }}>
        {img}
      </div>
    );
  }

  return img;
}
