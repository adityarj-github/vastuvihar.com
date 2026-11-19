import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import ConsentEmbed from '@/components/privacy/ConsentEmbed';
import ConsentFields from '@/components/privacy/ConsentFields';
import VVArrowButton from '@/components/common/VVArrowButton';
import './ContactSection.css';

const officeMapEmbed =
  'https://maps.google.com/maps?q=417%2C%20419%2C%204th%20Floor%2C%20Aashiana%20Tower%2C%20Exhibition%20Road%2C%20Old%20Jakkanpur%2C%20Lodipur%2C%20Patna%2C%20Bihar%20800001&t=m&z=15&output=embed&iwloc=near';

function ContactDirectoryCard({ href, label, index, kind, tag, description }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="vv-contact-section__directory-card"
      aria-label={`Explore ${label}`}
    >
      {/* Drawn street-map art: no downloaded background image. */}
      <svg
        className="vv-contact-section__directory-map"
        viewBox="0 0 310 170"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g className="vv-contact-section__directory-roads" strokeLinecap="round">
          <path d="M-20 122C34 119 45 86 90 92S151 128 191 104 260 67 335 53" />
          <path d="M-20 32C38 41 62 76 103 67S170 25 220 30 282 46 340 15" />
          <path d="M-10 159C50 147 73 148 122 120S211 80 331 97" />
          <path d="M53-20C57 37 69 85 55 185" />
          <path d="M135-10C151 42 134 72 151 105S183 145 174 185" />
          <path d="M244-20C226 30 246 68 237 106S210 147 217 185" />
          <path d="M306-10C290 43 298 65 286 97S289 146 280 180" />
        </g>
        <g className="vv-contact-section__directory-roads vv-contact-section__directory-roads--minor" strokeLinecap="round">
          <path d="M-8 72 102 160M92-12 187 185M177-5 275 175M-9 142 290-18" />
          <path d="M20 10 300 162M96 5 280 105M-15 105 322 125" />
        </g>
      </svg>

      {/* Numbered badge changes to an appropriate icon on hover/focus. */}
      <span className="vv-contact-section__directory-index" aria-hidden="true">
        <span className="vv-contact-section__directory-index-number">{index}</span>
        <svg
          className="vv-contact-section__directory-index-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {kind === 'Site' ? (
            <>
              <path d="M3 10.5 12 3l9 7.5V21H3V10.5Z" />
              <path d="M9 21v-7h6v7M3 11h18" />
            </>
          ) : (
            <>
              <path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18" />
              <path d="M9 7h2m4 0h1M9 11h2m4 0h1M9 15h2m4 0h1M10 21v-3h4v3" />
            </>
          )}
        </svg>
      </span>

      <span className="vv-contact-section__directory-eyebrow">{kind}</span>
      <span className="vv-contact-section__directory-meta">{tag}</span>
      <span className="vv-contact-section__directory-title">{label}</span>
      <span className="vv-contact-section__directory-description">{description}</span>

      <span className="vv-contact-section__directory-cta">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 18 18 6M8 6h10v10" />
        </svg>
        Learn More
      </span>
    </Link>
  );
}

export default function ContactSection() {
  return (
    <section className="vv-contact-section" aria-labelledby="vv-contact-section-title">
      <div className="vv-contact-section__form-column">
        <h2 id="vv-contact-section-title" className="vv-contact-section__title">
          Send us a message
        </h2>

        {/* ContactForm owns the /api/leads POST, validation, tracking and status text. */}
        <ContactForm className="vv-contact-form" aria-label="Contact form">
          <div className="vv-contact-section__honeypot" aria-hidden="true">
            <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="vv-contact-section__fields">
            <div className="vv-contact-section__field">
              <label htmlFor="vv-contact-first-name" className="vv-contact-section__sr-only">
                First name (required)
              </label>
              <input
                id="vv-contact-first-name"
                type="text"
                name="firstName"
                placeholder="First Name *"
                autoComplete="given-name"
                required
              />
            </div>
            <div className="vv-contact-section__field">
              <label htmlFor="vv-contact-last-name" className="vv-contact-section__sr-only">
                Last name (required)
              </label>
              <input
                id="vv-contact-last-name"
                type="text"
                name="lastName"
                placeholder="Last Name *"
                autoComplete="family-name"
                required
              />
            </div>
            <div className="vv-contact-section__field">
              <label htmlFor="vv-contact-phone" className="vv-contact-section__sr-only">
                Phone number (required)
              </label>
              <input
                id="vv-contact-phone"
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                autoComplete="tel"
                required
              />
            </div>
            <div className="vv-contact-section__field">
              <label htmlFor="vv-contact-email" className="vv-contact-section__sr-only">
                Email (optional)
              </label>
              <input
                id="vv-contact-email"
                type="email"
                name="email"
                placeholder="Email (optional)"
                autoComplete="email"
              />
            </div>
            <div className="vv-contact-section__field vv-contact-section__field--full">
              <label htmlFor="vv-contact-message" className="vv-contact-section__sr-only">
                Your message
              </label>
              <textarea
                id="vv-contact-message"
                name="message"
                rows={6}
                placeholder="Message..."
              />
            </div>
            <div className="vv-contact-section__field vv-contact-section__field--full vv-contact-section__consent">
              <ConsentFields form="enquiry" marketing />
            </div>
            <div className="vv-contact-section__field vv-contact-section__field--full vv-contact-section__submit-wrap">
              <VVArrowButton type="submit" label="submit" className="vv-contact-section__submit" />
            </div>
          </div>
        </ContactForm>
      </div>

      <div className="vv-contact-section__directory-links" aria-label="Contact directory">
        <ContactDirectoryCard
          href="/contact/site-contact"
          index="01"
          kind="Site"
          tag="PROJECT CONTACTS"
          label="Site Contact"
          description="Get in touch with our project site teams."
        />
        <ContactDirectoryCard
          href="/contact/branch-contact"
          index="02"
          kind="Branch"
          tag="OFFICE CONTACTS"
          label="Branch Contact"
          description="Find your nearest branch office contacts."
        />
      </div>

      <div className="vv-contact-section__map">
        <div className="vv-contact-section__map-embed">
          <ConsentEmbed provider="Google Maps">
            <iframe
              loading="lazy"
              src={officeMapEmbed}
              title="Vastu Vihar Corporate Office, Patna"
              aria-label="Vastu Vihar Corporate Office, Patna"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </ConsentEmbed>
        </div>
      </div>
    </section>
  );
}
