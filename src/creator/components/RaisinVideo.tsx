import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

interface RaisinVideoProps {
  isMars: boolean;
}

export default function RaisinVideo({ isMars }: RaisinVideoProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [videoKey, setVideoKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = isMars ? '/videovio.mov' : '/Videoraisin.mp4';

  useEffect(() => {
    setRetryCount(0);
    setVideoKey((prev) => prev + 1);
  }, [isMars]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoKey]);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setVideoKey((prev) => prev + 1);
      }, RETRY_DELAY);
    }
  }, [retryCount]);

  const cacheBuster = retryCount > 0 ? `?v=${retryCount}` : '';

  return (
    <section id="contact" className="bg-black w-full flex justify-center pt-0 pb-8 px-0 md:pt-4 md:px-4">
      <video
        key={videoKey}
        ref={videoRef}
        className={`w-full rounded-none md:rounded-2xl ${isMars ? 'max-w-[200px] md:max-w-sm' : 'max-w-[92%] md:max-w-2xl'}`}
        src={`${videoSrc}${cacheBuster}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={handleError}
      />
    </section>
  );
}
