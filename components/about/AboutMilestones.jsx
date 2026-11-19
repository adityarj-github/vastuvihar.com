'use client';

import { useRef } from 'react';
import Link from 'next/link';
import './AboutMilestones.css';

const milestones = [
  {
    year: '1994',
    image: '/png/p1.webp',
    text: 'Technoculture Building Centre Pvt. Ltd. was founded in Patna, beginning a journey to make quality housing more accessible.',
  },
  {
    year: '2001',
    image: '/png/p2.webp',
    text: 'The Vastu Vihar brand introduced planned bungalow communities for families in Bihar and Jharkhand.',
  },
  {
    year: '2008',
    image: '/png/p3.webp',
    text: 'Advanced earthquake-resistant construction technology and engineered building methods became key priorities.',
  },
  {
    year: '2020',
    image: '/png/p4.webp',
    text: 'Vastu Vihar grew its network of townships with parks, community facilities and thoughtfully planned residential spaces.',
  },
  {
    year: '2026',
    image: '/png/ananta.webp',
    text: 'Continuing our journey across Eastern India and Nepal with thoughtfully designed homes and integrated townships.',
  },
];

export default function AboutMilestones() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = Math.min(slider.clientWidth * 0.85, 700);

    slider.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="about-milestones">
      <div className="about-milestones__container">
        <div className="about-milestones__header">
          <span className="about-milestones__label">OUR STORY</span>
          <h2 className="about-milestones__heading">32+ years of a remarkable journey</h2>
        </div>

        <div className="about-milestones__slider-wrapper">
          <button
            type="button"
            className="about-milestones__arrow about-milestones__arrow--left"
            onClick={() => scroll('left')}
            aria-label="Previous milestones"
            aria-controls="about-milestones-slider"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            id="about-milestones-slider"
            ref={sliderRef}
            className="about-milestones__slider"
          >
            {milestones.map((milestone) => (
              <article className="about-milestones__card" key={milestone.year}>
                <h3 className="about-milestones__year">{milestone.year}</h3>

                <div className="about-milestones__image">
                  <img
                    src={milestone.image}
                    alt={`Vastu Vihar journey ${milestone.year}`}
                    loading="lazy"
                  />
                </div>

                <div className="about-milestones__line" aria-hidden="true">
                  <span className="about-milestones__dot" />
                </div>

                <p className="about-milestones__description">{milestone.text}</p>
              </article>
            ))}

            <article className="about-milestones__card about-milestones__card--cta">
              <Link
                href="/contact/"
                className="about-milestones__cta"
                prefetch={false}
              >
                <span>Plan your</span>
                <strong>site visit</strong>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          </div>

          <button
            type="button"
            className="about-milestones__arrow about-milestones__arrow--right"
            onClick={() => scroll('right')}
            aria-label="Next milestones"
            aria-controls="about-milestones-slider"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
