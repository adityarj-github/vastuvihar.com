import './ValuesSection.css';
import StaticPill from '../common/StaticPill';

export default function ValuesSection() {
  const scrollingItems = [
    "Trust & Transparency",
    "Quality Construction",
    "Affordable Homes",
    "Customer Commitment",
    "Integrity & Excellence",
  ];

  return (
    <div
      className="vv-block vv-home-values__values vv-flex vv-boxed vv-con vv-parent"
    >
      <div className="vv-inner">
        <StaticPill text="Our values" />
        <div
          className="vv-block vv-home-values__body vv-full vv-flex vv-con vv-child"
        >
          <div
            className="vv-block vv-home-values__headline animated-fast vv-reveal vv-widget vv-heading-widget"


          >
            <div className="vv-widget-inner">
              <h2 className="vv-heading vv-text-default">
                Built on Trust, Driven by Quality,
                Committed to Affordable Homes.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
