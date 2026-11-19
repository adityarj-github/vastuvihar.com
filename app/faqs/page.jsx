import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import FaqsHeader from '@/components/faqs/FaqsHeader';
import FaqsTicker from '@/components/faqs/FaqsTicker';
import FaqAccordion from '@/components/faqs/FaqAccordion';
import { createPageMetadata } from '@/lib/metadata';
import './faqs.css';

export const metadata = createPageMetadata({
  title: 'Frequently Asked Questions | Vastu Vihar',
  description:
    'Find answers about Vastu Vihar bungalows and flats, land ownership, township amenities, home loans, project locations, and booking a site visit.',
  path: '/faqs/',
});

export default function FaqsPage() {
  return (
    <PageLayout route="faqs">
      <div id="content" className="site-content-page clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <div className="vv-faqs-page">
                <FaqsHeader />
                <FaqsTicker />
                <FaqAccordion />
              </div>
            </main>
          </div>
        </div>
      </div>

      <BreadcrumbJsonLd items={[{ name: 'FAQs' }]} />
    </PageLayout>
  );
}
