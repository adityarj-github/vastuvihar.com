import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import ContactHeader from '@/components/contact/ContactHeader';
import BranchContactView from '@/components/contact/BranchContactView';
import { createPageMetadata } from '@/lib/metadata';
import styles from './branch-contact.module.css';

export const metadata = createPageMetadata({
  title: 'Vastu Vihar Branch Offices: Addresses & Phone Numbers',
  description:
    'Find the address, phone number and email of your nearest Vastu Vihar branch office, listed by state and city.',
  path: '/contact/branch-contact/',
});

export default function BranchContactPage() {
  return (
    <PageLayout route="contact">
      <div id="content" className={`site-content-page clear ${styles.page}`} tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <ContactHeader
                title="Branch Contact"
                parentCrumb={{ label: 'Contact', href: '/contact/' }}
              />
              <BranchContactView />
            </main>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Contact', path: '/contact/' },
          { name: 'Branch Contact' },
        ]}
      />
    </PageLayout>
  );
}
