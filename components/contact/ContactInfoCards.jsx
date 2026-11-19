import VVArrowButton from '@/components/common/VVArrowButton';
import './ContactInfoCards.css';

const officeMapUrl =
  'https://www.google.com/maps/search/?api=1&query=417%2C%20419%2C%204th%20Floor%2C%20Aashiana%20Tower%2C%20Exhibition%20Road%2C%20Old%20Jakkanpur%2C%20Lodipur%2C%20Patna%2C%20Bihar%20800001';

const contactCards = [
  {
    id: 'email',
    heading: 'Enquiry email',
    text: 'info@vastuvihar.org',
    icon: 'spaciaz-icon-envelope-open',
    href: 'mailto:info@vastuvihar.org',
    label: 'Email us',
  },
  {
    id: 'phone',
    heading: 'Phone number',
    text: '+91 95340 95340',
    icon: 'spaciaz-icon-call-out',
    href: 'tel:+919534095340',
    label: 'Call us',
  },
  {
    id: 'location',
    heading: 'Location',
    text: '417, 419, 4th Floor, Aashiana Tower, Exhibition Road, Old Jakkanpur, Lodipur, Patna, Bihar - 800001',
    icon: 'spaciaz-icon-marker-pin',
    href: officeMapUrl,
    label: 'Visit us',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
];

export default function ContactInfoCards() {
  return (
    <section className="vv-contact-info" aria-label="Contact details">
      <div className="vv-contact-info__grid">
        {contactCards.map(({ id, heading, text, icon, href, label, target, rel }, index) => (
          <article
            key={id}
            className={`vv-contact-info__card vv-contact-info__card--${id}`}
            style={{ '--vv-contact-card-index': index }}
          >
            <div className="vv-contact-info__details">
              <span className="vv-contact-info__icon" aria-hidden="true">
                <i className={icon} />
              </span>
              <h2 className="vv-contact-info__heading">{heading}</h2>
              <p className="vv-contact-info__text">
                {id === 'email' ? <a href={href}>{text}</a> : text}
              </p>
            </div>

            <VVArrowButton
              href={href}
              label={label}
              target={target}
              rel={rel}
              className="vv-contact-info__action"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
