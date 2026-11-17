import StaticPill from '@/components/common/StaticPill';
import './FaqsTicker.css';

export default function FaqsTicker() {
  return (
    <section className="vv-faqs-ticker" aria-label="Frequently asked questions introduction">
      <div className="vv-faqs-ticker__inner">
        <div className="vv-faqs-ticker__pill">
          <StaticPill text="vastu vihar FAQs" />
        </div>
        <h2 className="vv-faqs-ticker__title" id="vv-faqs-heading">
          Everything you need to know
        </h2>
      </div>
    </section>
  );
}
