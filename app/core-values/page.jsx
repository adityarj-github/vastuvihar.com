import './core-values.css';
import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import ValuesHeader from '@/components/values/ValuesHeader';
import ValuesGrid from '@/components/values/ValuesGrid';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Core Values | Vastu Vihar',
  description:
    'Explore the core values driving Vastu Vihar: high quality, community focus, environmental sustainability, innovation, and genuine partnership.',
  path: '/core-values/',
});

export default function CoreValuesPage() {
  return (
    <PageLayout route="core-values">
      <div id="content" className="site-content-page clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <div className="vv-core-values-page">
                <ValuesHeader />
                <ValuesGrid />
              </div>
            </main>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd items={[{ name: 'Core Values' }]} />
    </PageLayout>
  );
}
