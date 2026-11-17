'use client';

import { useEffect } from 'react';

/**
 * Independent home section reveal and counter enhancement.
 * Content remains visible before JavaScript; no legacy page runtime is required.
 */
export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector('.vv-home-page');
    if (!root) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observers = [];
    const frames = new Set();

    const reveal = root.querySelectorAll('.vv-reveal');
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const entryObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-vv-visible', 'true');
          observer.unobserve(entry.target);
        }
      }, { rootMargin: '0px 0px -7% 0px', threshold: 0.01 });
      reveal.forEach((element) => entryObserver.observe(element));
      observers.push(entryObserver);
    }

    const counters = [...root.querySelectorAll('.vv-counter-number')];
    if (!reducedMotion && counters.length && 'IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target;
          observer.unobserve(element);
          const original = (element.textContent || '').trim();
          const target = Number(original.replaceAll(',', ''));
          if (!Number.isFinite(target) || target < 1) continue;
          const duration = 1500;
          const started = performance.now();
          const format = (value) => Math.round(value).toLocaleString('en-IN');
          const tick = (now) => {
            const fraction = Math.min(1, (now - started) / duration);
            const eased = 1 - (1 - fraction) ** 3;
            element.textContent = fraction >= 1 ? original : format(target * eased);
            if (fraction < 1) frames.add(requestAnimationFrame(tick));
          };
          frames.add(requestAnimationFrame(tick));
        }
      }, { threshold: 0.25 });
      counters.forEach((element) => counterObserver.observe(element));
      observers.push(counterObserver);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
      frames.forEach((frame) => cancelAnimationFrame(frame));
    };
  }, []);
  return null;
}
