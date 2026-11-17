import './contact.css';
import PageLayout from '@/components/PageLayout';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import ContactHeader from '@/components/contact/ContactHeader';
import ContactInfoCards from '@/components/contact/ContactInfoCards';
import ContactSection from '@/components/contact/ContactSection';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Get in Touch | Vastu Vihar',
  description:
    'Get in touch with our team of real estate experts for consultations, model inquiries, site visits, and support across Eastern India.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <PageLayout route="contact">
      <div id="content" className="site-content-page clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <div className="vv-contact-page">
                <ContactHeader />

                <div className="vv-contact-page__content">
                  <ContactInfoCards />
                  <ContactSection />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd items={[{ name: 'Contact' }]} />
    </PageLayout>
  );
}
