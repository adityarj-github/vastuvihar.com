import './AboutHeader.css';
import Link from 'next/link';
import StaticPill from '../common/StaticPill';

export default function AboutHeader() {
  return (
    <section className="about-header" aria-label="About Vastu Vihar">
      <div className="about-header__hero">
        <div className="about-header__hero-inner">
          <h1 className="about-header__page-title">About us</h1>

          <nav className="about-header__breadcrumbs" aria-label="Breadcrumb">
            <ol className="about-header__breadcrumb-list">
              <li>
                <Link href="/" prefetch={false}>
                  Home
                </Link>
              </li>
              <li className="about-header__breadcrumb-separator" aria-hidden="true">
                <span />
              </li>
              <li aria-current="page">About us</li>
            </ol>
          </nav>
        </div>

        <div className="about-header__hero-edge" aria-hidden="true" />
      </div>

      <div className="about-header__intro">
        <div className="about-header__intro-grid">
          <div className="about-header__intro-left">
            <StaticPill text="ABOUT US" />

            <h2 className="about-header__intro-title">
              Making home ownership a reality since 1994
            </h2>
          </div>

          <div className="about-header__intro-right">
            <p className="about-header__lead">
              Explore Vastu Vihar bungalows, flats and integrated townships. Our
              property advisors can help you choose a home that fits your family,
              location and budget.
            </p>

            <p className="about-header__description">
              Founded in Patna in 1994, Technoculture Building Centre Pvt. Ltd.
              (Vastu Vihar) has grown into a trusted residential developer with
              more than 20,000 homes across Eastern India. Our focus is on
              accessible homeownership, quality construction, thoughtful layouts
              and community amenities.
            </p>

            <Link
              href="/contact/"
              className="about-header__contact-link"
              prefetch={false}
            >
              <span>contact our team</span>
              <span className="about-header__contact-icon" aria-hidden="true">
                <span className="about-header__contact-icon-wrap">
                  <span className="about-header__contact-arrow">
                    <i className="spaciaz-icon-arrow-long-right" />
                  </span>
                  <span className="about-header__contact-arrow about-header__contact-arrow--hover">
                    <i className="spaciaz-icon-arrow-long-right" />
                  </span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
