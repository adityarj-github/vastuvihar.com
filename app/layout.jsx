import './globals.css';
import { site } from '@/data/site';
import CookieConsent from '@/components/CookieConsent/CookieConsent';
import NavigationShell from '@/components/NavigationShell/NavigationShell';
import TrackingTags from '@/components/privacy/TrackingTags';
import CtaClickTracker from '@/components/privacy/CtaClickTracker';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/metadata';
import { gtmContainerId, gtmSnippet } from '@/lib/privacy/gtm.mjs';
import { CONSENT_STORAGE_KEY } from '@/lib/privacy/cookieConfig';
import { NOTICE_VERSION } from '@/lib/privacy/notices';

// Every page, and every route below this layout, is rendered on the server for each
// request. Nothing is prerendered at build time.
export const dynamic = 'force-dynamic';

const gtmId = gtmContainerId();


const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: site.name,
      legalName: 'Technoculture Building Centre Pvt. Ltd.',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}${site.logo}`,
      foundingDate: '1994',
      email: site.email,
      telephone: site.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '417, 419, 4th Floor, Aashiana Tower, Exhibition Road, Old Jakkanpur, Lodipur',
        addressLocality: 'Patna',
        addressRegion: 'Bihar',
        postalCode: '800001',
        addressCountry: 'IN',
      },
      sameAs: [
        'https://www.facebook.com/VastuViharOfficial',
        'https://www.instagram.com/vastuvihar_official',
        'https://www.youtube.com/@vastu_vihar',
        'https://in.linkedin.com/company/vastu-vihar-technoculture-building-centre-pvt-ltd',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: site.name,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} – ${site.tagline}`, template: `%s | ${site.name}` },
  description: 'Discover our projects, people, values, and opportunities.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag: one per page, first thing in <head>. See lib/privacy/gtm.mjs. */}
        {gtmId && (
          <script id="google-tag" dangerouslySetInnerHTML={{ __html: gtmSnippet(gtmId, CONSENT_STORAGE_KEY, NOTICE_VERSION) }} />
        )}
      </head>
      <body className="theme-spaciaz elementor-default elementor-kit-4">
        <JsonLd data={siteJsonLd} />
        <NavigationShell
          cookieConsent={<CookieConsent />}
        >
          {children}
        </NavigationShell>
        <TrackingTags />
        <CtaClickTracker />
      </body>
    </html>
  );
}
