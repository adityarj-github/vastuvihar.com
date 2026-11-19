import VVArrowButton from '@/components/common/VVArrowButton';
import './CareersOpportunities.css';

export default function CareersOpportunities() {
  return (
    <aside className="vv-careers-opportunities" aria-labelledby="vv-careers-opportunities-title">
      <span className="vv-careers-opportunities__cutout" aria-hidden="true" />

      <div className="vv-careers-opportunities__inner">
        <div className="vv-careers-opportunities__icon" aria-hidden="true">
          <i className="spaciaz-icon-sms-tracking" />
        </div>

        <h2 id="vv-careers-opportunities-title" className="vv-careers-opportunities__title">
          Opportunities with us
        </h2>

        <p className="vv-careers-opportunities__description">
          We are always up to discover new talents, kindly mail us your resume and portfolio link to
        </p>

        <div className="vv-careers-opportunities__actions">
          <a
            href="mailto:hr@vastuvihar.org"
            className="vv-careers-opportunities__email"
            aria-label="Email your resume to hr@vastuvihar.org"
          >
            hr@vastuvihar.org
          </a>
          <VVArrowButton
            href="/contact/"
            label="contact us"
            className="vv-careers-opportunities__button"
          />
        </div>
      </div>
    </aside>
  );
}
