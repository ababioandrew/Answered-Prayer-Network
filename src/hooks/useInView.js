import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, isVisible] — isVisible becomes true once the element
 * enters the viewport (and stays true by default).
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, no need to keep observing
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Returns the current display value as a string.
 */
export function useCountUp(target, duration = 1800, isActive = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Parse the numeric part (e.g. "500+" → 500, "98%" → 98)
    const numeric = parseInt(target.replace(/\D/g, ''), 10);
    const suffix = target.replace(/[0-9]/g, ''); // "+", "%", etc.

    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numeric) + suffix);
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target); // ensure we land exactly on target
    };

    requestAnimationFrame(step);
  }, [isActive, target, duration]);

  return isActive ? count : '0';
}
