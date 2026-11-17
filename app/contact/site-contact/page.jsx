import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import ContactHeader from '@/components/contact/ContactHeader';
import SiteContactView from '@/components/contact/SiteContactView';
import { createPageMetadata } from '@/lib/metadata';
import styles from './site-contact.module.css';

export const metadata = createPageMetadata({
  title: 'Vastu Vihar Project Sites: Addresses & Phone Numbers',
  description:
    'Find the address and phone number of Vastu Vihar project sites to plan a site visit, listed by state and city.',
  path: '/contact/site-contact/',
});

export default function SiteContactPage() {
  return (
    <PageLayout route="contact">
      <div id="content" className={`site-content-page clear ${styles.page}`} tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <ContactHeader
                title="Site Contact"
                parentCrumb={{ label: 'Contact', href: '/contact/' }}
              />
              <SiteContactView />
            </main>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Contact', path: '/contact/' },
          { name: 'Site Contact' },
        ]}
      />
    </PageLayout>
  );
}
