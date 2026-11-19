'use client';

import { useEffect, useRef, useState } from 'react';
import './ValueCard.css';

export default function ValueCard({ value, index }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 30px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className={`vv-value-card ${isVisible ? 'vv-value-card--visible' : ''}`}
      data-count={String(index + 1).padStart(2, '0')}
      style={{ '--vv-value-card-delay': `${index % 4 * 100}ms` }}
    >
      <div className="vv-value-card__icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: value.svg }} />
      <div className="vv-value-card__content">
        <div className="vv-value-card__cutout" aria-hidden="true" />
        <h3 className="vv-value-card__title">{value.title}</h3>
        <div className="vv-value-card__description"><p>{value.description}</p></div>
      </div>
    </article>
  );
}
