import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

export default function LottiePlayer({ src, className = 'h-16 w-16', loop = true, autoplay = true }) {
  const hostRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldMountPlayer, setShouldMountPlayer] = useState(false);

  const fallbackClassName = useMemo(
    () => `${className} animate-pulse rounded-full bg-slate-100`,
    [className]
  );

  useEffect(() => {
    if (!src || !hostRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.1 }
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const schedule = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const id = schedule(() => setShouldMountPlayer(true));
    return () => cancel(id);
  }, [isVisible]);

  if (!src) return null;
  return (
    <div ref={hostRef} className={className}>
      {shouldMountPlayer ? (
        <Player autoplay={autoplay} loop={loop} src={src} className={className} />
      ) : (
        <div className={fallbackClassName} />
      )}
    </div>
  );
}
