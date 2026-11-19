import './AboutLeadership.css';
import Link from 'next/link';
import StaticPill from '../common/StaticPill';

/**
 * About page: "Discover Vastu Vihar" feature cards.
 * All component-specific layout and presentation lives in AboutLeadership.css.
 * StaticPill keeps its own shared stylesheet.
 */
const cards = [
  {
    number: '01.',
    title: 'What we do',
    text:
      'We offer bungalows, flats and thoughtfully planned townships with a focus on affordable, quality living for families across Eastern India.',
    buttonText: 'Our Projects',
    href: '/projects/',
    theme: 'olive',
    image: '/png/nano.webp',
  },
  {
    number: '02.',
    title: 'Our impact',
    text:
      'Our communities bring homes, parks, play areas and everyday conveniences together to support a better way of life.',
    buttonText: 'See Projects',
    href: '/projects/',
    theme: 'primary',
    image: '/png/rainbow.webp',
  },
  {
    number: '03.',
    title: 'Core values',
    text:
      'We value trust, transparent communication, quality engineering and accessible housing that makes long-term homeownership possible.',
    buttonText: 'Discover more',
    href: '/core-values/',
    theme: 'navy',
    image: '/png/ganga.webp',
  },
];

function ArrowButton({ href, title }) {
  return (
    <Link
      href={href}
      className="about-leadership__arrow-link"
      prefetch={false}
      aria-label={`Explore ${title}`}
    >
      <span className="about-leadership__arrow-circle" aria-hidden="true">
        <span className="about-leadership__arrow-icon-wrap">
          <span className="about-leadership__arrow-icon">
            <i className="spaciaz-icon-arrow-long-right" />
          </span>
          <span className="about-leadership__arrow-icon about-leadership__arrow-icon--hover">
            <i className="spaciaz-icon-arrow-long-right" />
          </span>
        </span>
      </span>
    </Link>
  );
}

function Card({ card }) {
  return (
    <article
      className={`about-leadership__card about-leadership__card--${card.theme}`}
    >
      <span className="about-leadership__number" aria-hidden="true">
        {card.number}
      </span>

      <div className="about-leadership__card-content">
        <h3 className="about-leadership__card-title">{card.title}</h3>
        <p className="about-leadership__card-description">{card.text}</p>
        <Link
          href={card.href}
          className="about-leadership__text-link"
          prefetch={false}
        >
          {card.buttonText}
        </Link>
      </div>

      {card.image && (
        <div className="about-leadership__decoration" aria-hidden="true">
          <img
            src={card.image}
            alt=""
            width="351"
            height="272"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <ArrowButton href={card.href} title={card.title} />
    </article>
  );
}

export default function AboutLeadership() {
  return (
    <section className="about-leadership" aria-labelledby="about-leadership-title">
      <div className="about-leadership__inner">
        <StaticPill text="Explore Company" />

        <h2 className="about-leadership__heading" id="about-leadership-title">
          Discover <br /> Vastu Vihar
        </h2>

        <div className="about-leadership__grid">
          {cards.map((card) => (
            <Card key={card.number} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
