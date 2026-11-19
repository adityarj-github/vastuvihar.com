'use client';

import { useEffect, useRef, useState } from 'react';
import './StatCounter.css';

/**
 * Self-contained animated counter for Next.js (no Elementor JavaScript).
 * Counts up once when the widget enters the viewport. It stays static for
 * visitors who prefer reduced motion or have JavaScript disabled.
 *
 * @param {Object} props
 * @param {string} props.title - Label shown above the number
 * @param {string | number} props.value - Target value, e.g. "20,000" or 20000
 * @param {string} [props.prefix] - Prefix such as "₹"
 * @param {string} [props.suffix] - Suffix such as "+" or "%"
 * @param {number} [props.duration] - Count-up duration in milliseconds
 * @param {string} [props.widgetId] - Optional identifier, retained for compatibility
 * @param {string} [props.className] - Extra classes for section-level styling
 */
export default function StatCounter({
  title,
  value,
  prefix = '',
  suffix = '+',
  duration = 2000,
  widgetId = 'counter',
  className = '',
}) {
  const containerRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(String(value));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    // Accept comma-separated integers and decimal values without altering
    // how the original `value` is rendered when animation is unavailable.
    const numericText = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const target = Number(numericText);
    const decimalPlaces = Math.min((numericText.split('.')[1] || '').length, 6);
    const animationDuration = Number(duration);

    if (!numericText || !Number.isFinite(target)) {
      setDisplayValue(String(value));
      return undefined;
    }

    const format = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (
      reducedMotion ||
      !Number.isFinite(animationDuration) ||
      animationDuration <= 0 ||
      !('IntersectionObserver' in window) ||
      !('requestAnimationFrame' in window)
    ) {
      setDisplayValue(format.format(target));
      return undefined;
    }

    let frameId;
    let startTime;
    let hasStarted = false;

    const animate = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / animationDuration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const scale = 10 ** decimalPlaces;
      const current = Math.round(target * easedProgress * scale) / scale;

      setDisplayValue(format.format(progress === 1 ? target : current));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    // Only show zero after hydration. The initial HTML contains the complete
    // value for SEO, accessibility and no-JavaScript fallbacks.
    setDisplayValue(format.format(0));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true;
          observer.disconnect();
          frameId = window.requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
    };
  }, [value, duration]);

  // Keep Elementor-style data attributes for compatibility with existing
  // pages, but the animation above no longer depends on those attributes.
  const numericValue = String(value).replace(/[^0-9]/g, '');

  return (
    <div
      ref={containerRef}
      className={['stat-counter', className].filter(Boolean).join(' ')}
      data-id={widgetId}
      data-widget-id={widgetId}
    >
      <div className="stat-counter__title">{title}</div>
      <div className="stat-counter__number-wrapper">
        {prefix && <span className="stat-counter__prefix">{prefix}</span>}
        <span
          className="stat-counter__number"
          data-duration={duration}
          data-to-value={numericValue}
          data-from-value="0"
          data-delimiter=","
          aria-live="off"
        >
          {displayValue}
        </span>
        {suffix && (
          <span className="stat-counter__suffix">
            <sup>{suffix}</sup>
          </span>
        )}
      </div>
    </div>
  );
}
