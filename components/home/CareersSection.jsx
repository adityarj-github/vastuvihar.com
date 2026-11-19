import VVArrowButton from '@/components/common/VVArrowButton';
import './CareersSection.css';

export default function CareersSection() {
  return (
    <div
      className="vv-block vv-home-careers__careers vv-flex vv-boxed vv-con vv-parent"

    >
      <div className="vv-inner">
        <div
          className="vv-block vv-home-careers__lead-title animated-fast vv-reveal vv-widget vv-heading-widget"


        >
          <div className="vv-widget-inner">
            <h2 className="vv-heading vv-text-default">Make your next</h2>{' '}
          </div>
        </div>
        <div
          className="vv-block vv-home-careers__main-line vv-full animated-fast vv-flex vv-reveal vv-con vv-child"

        >
          <div
            className="vv-block vv-home-careers__career-word vv-widget vv-heading-widget"

          >
            <div className="vv-widget-inner">
              <h2 className="vv-heading vv-text-default">career </h2>{' '}
            </div>
          </div>
          <div
            className="vv-block vv-home-careers__team vv-full vv-flex vv-con vv-child"
          >
            <div
              className="vv-block vv-home-careers__portrait-one vv-widget vv-image-widget"

            >
              <div className="vv-widget-inner">
                <img
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  src="/employee/neeraj.webp"
                  className="attachment-full size-full wp-image-441"
                  alt=""
                />{' '}
              </div>
            </div>
            <div
              className="vv-block vv-home-careers__portrait-two vv-widget vv-image-widget"

            >
              <div className="vv-widget-inner">
                <img
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  src="/employee/brijmohan.webp"
                  className="attachment-full size-full wp-image-439"
                  alt=""
                />{' '}
              </div>
            </div>
            <div
              className="vv-block vv-home-careers__portrait-three vv-widget vv-image-widget"

            >
              <div className="vv-widget-inner">
                <img
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  src="/employee/anuj.webp"
                  className="attachment-full size-full wp-image-440"
                  alt=""
                />{' '}
              </div>
            </div>
            <div
              className="vv-block vv-home-careers__team-plus vv-icon-stacked vv-icon-circle vv-widget vv-icon-widget"

            >
              <div className="vv-widget-inner">
                <div className="vv-icon-wrapper">
                  <div className="vv-icon">
                    <i aria-hidden="true" className="spaciaz-icon- spaciaz-icon-plus"></i>{' '}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="vv-block vv-home-careers__move-word vv-widget vv-heading-widget"

          >
            <div className="vv-widget-inner">
              <h2 className="vv-heading vv-text-default">move</h2>{' '}
            </div>
          </div>
        </div>
        <div
          className="vv-block vv-home-careers__bottom-row vv-full vv-flex vv-con vv-child"
        >
          <div
            className="vv-block vv-home-careers__description vv-widget-mobile-extra--width-initial vv-widget-mobile--width-inherit vv-reveal vv-widget vv-copy-widget"


          >
            <div className="vv-widget-inner">
              Shape your future with us, building careers, developing communities.{' '}
            </div>
          </div>
          <div
            className="vv-block vv-home-careers__cta enable-style-icon-yes animated-fast vv-button-default icon-spaciaz-right vv-reveal vv-widget vv-arrow-widget"


          >
            <div className="vv-widget-inner">
              <div className="vv-button-wrap">
                <VVArrowButton href="/careers/" label="Join our team" className="vv-home-page__careers-cta" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
