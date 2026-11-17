import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import AwardsHeader from '@/components/awards/AwardsHeader';
import AwardsList from '@/components/awards/AwardsList';
import { createPageMetadata } from '@/lib/metadata';
import './our-awards.css';

export const metadata = createPageMetadata({
  title: 'Awards & Recognition | Vastu Vihar',
  description:
    'Discover recognitions associated with Vastu Vihar founder Vinay Kumar Tiwary, including the Vishwesariya Award and Bharat Nirman Ratna Award.',
  path: '/our-awards/',
});

export default function OurAwardsPage() {
  return (
    <PageLayout route="our-awards">
      <div id="content" className="site-content-page clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <div className="vv-awards-page">
                <AwardsHeader />
                <AwardsList />
              </div>
            </main>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd items={[{ name: 'Awards & Recognition' }]} />
    </PageLayout>
  );
}
