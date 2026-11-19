'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './AboutTestimonials.css';
import StaticPill from '../common/StaticPill';

const testimonials = [
  {
    id: '8c5d7ed',
    text: '\u201cDiscover homes designed to bring together comfort, modern living and affordability across our growing communities.\u201d',
    job: 'Our commitment',
  },
  {
    id: '7232e71',
    text: '"Explore thoughtfully planned bungalows and flats supported by community amenities and convenient locations."',
    job: 'Our communities',
  },
  {
    id: 'f3f5cd8',
    text: '"From your first enquiry to your site visit, our team can help you compare home options that suit your requirements."',
    job: 'Our approach',
  },
  {
    id: '2d49c77',
    text: '\u201cAt Vastu Vihar, we focus on quality homes, lasting relationships and more accessible homeownership.\u201d',
    job: 'Our approach',
  },
];

// Preserve the original order (and repetitions) of all five logo groups.
const partnerGroups = [
  [
    ['union-bank-of-india.svg', 'Union Bank of India'],
    ['state-bank-of-india.svg', 'State Bank of India'],
    ['punjab-national-bank.svg', 'Punjab National Bank'],
    ['lic-housing-finance.svg', 'LIC Housing Finance'],
    ['jharkhand-gramin-bank.svg', 'Jharkhand Gramin Bank'],
    ['indian-bank.svg', 'Indian Bank'],
  ],
  [
    ['idbi-bank.svg', 'IDBI Bank'],
    ['hdfc-bank.svg', 'HDFC Bank'],
    ['central-bank-of-india.svg', 'Central Bank of India'],
    ['canara-bank.svg', 'Canara Bank'],
    ['bank-of-maharashtra.svg', 'Bank of Maharashtra'],
    ['bank-of-india.svg', 'Bank of India'],
  ],
  [
    ['bank-of-baroda.svg', 'Bank of Baroda'],
    ['axis-bank.svg', 'Axis Bank'],
    ['union-bank-of-india.svg', 'Union Bank of India'],
    ['state-bank-of-india.svg', 'State Bank of India'],
    ['punjab-national-bank.svg', 'Punjab National Bank'],
    ['lic-housing-finance.svg', 'LIC Housing Finance'],
  ],
  [
    ['jharkhand-gramin-bank.svg', 'Jharkhand Gramin Bank'],
    ['indian-bank.svg', 'Indian Bank'],
    ['idbi-bank.svg', 'IDBI Bank'],
    ['hdfc-bank.svg', 'HDFC Bank'],
    ['central-bank-of-india.svg', 'Central Bank of India'],
    ['canara-bank.svg', 'Canara Bank'],
  ],
  [
    ['bank-of-maharashtra.svg', 'Bank of Maharashtra'],
    ['bank-of-india.svg', 'Bank of India'],
    ['bank-of-baroda.svg', 'Bank of Baroda'],
    ['axis-bank.svg', 'Axis Bank'],
    ['union-bank-of-india.svg', 'Union Bank of India'],
  ],
];

const partners = partnerGroups.flat();
const slideCount = testimonials.length;
const loopedTestimonials = [
  testimonials[slideCount - 1],
  ...testimonials,
  testimonials[0],
];

const AUTOPLAY_MS = 5000;

function Chevron({ direction }) {
  // Keep the original Spaciaz icon font instead of replacing it with an SVG.
  return (
    <i
      className={`spaciaz-icon-chevron-${direction}`}
      aria-hidden="true"
    />
  );
}

function PartnerLogoSequence({ duplicate = false }) {
  return (
    <div
      className="about-testimonials__logo-sequence"
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {partners.map(([file, name], index) => (
        <div className="about-testimonials__logo-item" key={`${file}-${index}`}>
          <div className="about-testimonials__logo-tile">
            <img
              src={`/bank-svg/${file}`}
              width="111"
              height="87"
              alt={duplicate ? '' : name}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutTestimonials() {
  // The extra slides make the last-to-first and first-to-last transitions seamless.
  const [slideIndex, setSlideIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const carouselRef = useRef(null);
  const movingRef = useRef(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    onChange();

    if (media.addEventListener) {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !carouselRef.current) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const move = useCallback(
    (direction) => {
      if (reducedMotion) {
        // Instant changes honor the visitor's reduced-motion preference.
        setSlideIndex((current) => {
          const currentReal = (current - 1 + slideCount) % slideCount;
          const nextReal =
            (currentReal + direction + slideCount) % slideCount;
          return nextReal + 1;
        });
        return;
      }

      if (movingRef.current) return;
      movingRef.current = true;
      setSlideIndex((current) => current + direction);
    },
    [reducedMotion]
  );

  // Stop autoplay following deliberate navigation, as configured in the original widget.
  const navigate = useCallback(
    (direction) => {
      setInteracted(true);
      move(direction);
    },
    [move]
  );

  useEffect(() => {
    if (
      hovered ||
      focusWithin ||
      interacted ||
      manuallyPaused ||
      !inViewport ||
      !pageVisible ||
      reducedMotion
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => move(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [hovered, focusWithin, interacted, manuallyPaused, inViewport, pageVisible, reducedMotion, move]);

  const toggleAutoplay = () => {
    setManuallyPaused((previous) => !previous);
    // Explicitly pressing Play also allows autoplay after manual slide navigation.
    setInteracted(false);
  };

  const onTrackTransitionEnd = (event) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    ) return;

    if (slideIndex === 0 || slideIndex === slideCount + 1) {
      setAnimate(false);
      setSlideIndex(slideIndex === 0 ? slideCount : 1);
    } else {
      movingRef.current = false;
    }
  };

  useEffect(() => {
    if (animate) return undefined;

    // Paint the new position without a transition, then enable transitions again.
    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setAnimate(true);
        movingRef.current = false;
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [animate]);

  const onTouchStart = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (startX == null || endX == null) return;

    const distance = startX - endX;
    if (Math.abs(distance) > 45) navigate(distance > 0 ? 1 : -1);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  };

  const activeSlide = (slideIndex - 1 + slideCount) % slideCount;

  return (
    <section className="about-testimonials" aria-label="Our commitment and financing partners">
      <div className="about-testimonials__inner">
        <div className="about-testimonials__pill-row">
          <StaticPill text="Our Commitment" />
        </div>

        <div
          className="about-testimonials__carousel"
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Vastu Vihar commitments"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocusWithin(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setFocusWithin(false);
            }
          }}
          onKeyDown={onKeyDown}
        >
          <button
            type="button"
            className="about-testimonials__arrow about-testimonials__arrow--prev"
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
          >
            <Chevron direction="left" />
          </button>

          <div
            className="about-testimonials__viewport"
            tabIndex={0}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => { touchStartXRef.current = null; }}
          >
            <div
              className={`about-testimonials__track${animate && !reducedMotion ? '' : ' about-testimonials__track--no-transition'}`}
              style={{ transform: `translate3d(-${slideIndex * 100}%, 0, 0)` }}
              onTransitionEnd={onTrackTransitionEnd}
            >
              {loopedTestimonials.map(({ id, text, job }, index) => {
                const realIndex = (index - 1 + slideCount) % slideCount;
                const cloned = index === 0 || index === slideCount + 1;
                return (
                  <article
                    className="about-testimonials__slide"
                    key={`${id}-${index}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${realIndex + 1} of ${slideCount}`}
                    aria-hidden={cloned || realIndex !== activeSlide}
                  >
                    <div className="about-testimonials__quote">
                      <p className="about-testimonials__quote-text">{text}</p>
                    </div>
                    <div className="about-testimonials__details">
                      <span className="about-testimonials__name">Vastu Vihar</span>
                      <span className="about-testimonials__job">{job}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="about-testimonials__arrow about-testimonials__arrow--next"
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
          >
            <Chevron direction="right" />
          </button>
          <button
            type="button"
            className="about-testimonials__autoplay"
            onClick={toggleAutoplay}
            aria-label={manuallyPaused ? 'Play testimonials' : 'Pause testimonials'}
            aria-pressed={manuallyPaused}
            title={manuallyPaused ? 'Play testimonials' : 'Pause testimonials'}
          >
            {manuallyPaused ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M8 5.5 18 12 8 18.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <div className="about-testimonials__partners">
          <h2 className="about-testimonials__partners-title">
            Our home financing partners
          </h2>

          <div
            className="about-testimonials__logo-marquee"
            role="group"
            aria-label="Home financing partner logos"
          >
            <div className="about-testimonials__logo-track">
              <PartnerLogoSequence />
              <PartnerLogoSequence duplicate />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
