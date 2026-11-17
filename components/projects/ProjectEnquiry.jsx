import ContactForm from '@/components/ContactForm';
import ConsentFields from '@/components/privacy/ConsentFields';
import VVArrowButton from '@/components/common/VVArrowButton';
import './ProjectEnquiry.css';

const PREFERRED_CITIES = [
  'Ara', 'Buxar', 'Patna', 'Biharsharif', 'Jehanabad', 'Chapra', 'Hajipur', 'Siwan', 'Gaya',
  'Aurangabad', 'Dehri-On-Sone', 'Sasaram', 'Varanasi', 'Mirzapur', 'Gorakhpur', 'Alipurduar',
  'Begusarai', 'Munger', 'Samastipur', 'Bhagalpur', 'Katihar', 'Purnea', 'Saharsa', 'Siliguri',
  'Banka', 'BirtaMode', 'Birganj Nepal', 'Deoghar', 'Giridih', 'Asansol', 'Durgapur', 'Kolkata',
  'Rourkela', 'Bhubaneswar', 'Jamshedpur', 'Ranchi', 'Bokaro', 'Dhanbad', 'Hazaribagh', 'Bettiah',
  'Darbhanga', 'Madhubani', 'Motihari', 'Muzaffarpur', 'Sitamarhi', 'Raxaul',
];

const BUDGETS = [
  ['₹ 10 - 16 Lac', '₹ 10 - 16 Lac (2 BHK Flat)'],
  ['₹ 16 - 24 Lac', '₹ 16 - 24 Lac (2 & 3 BHK Flat)'],
  ['₹ 20 - 35 Lac', '₹ 20 - 35 Lac (Simplex / Row House)'],
  ['₹ 35 - 50 Lac', '₹ 35 - 50 Lac (Duplex Bungalow)'],
  ['₹ 50 - 70 Lac', '₹ 50 - 70 Lac (Luxury Bungalow)'],
  ['₹ 90 - 95 Lac', '₹ 90 - 95 Lac (Hybrid Homes)'],
  ['₹ 1.20 - 1.80 Cr', '₹ 1.20 - 1.80 Cr (CEO Villa)'],
];

export default function ProjectEnquiry({ project }) {
  return (
    <section className="vv-model-enquiry" aria-labelledby="vv-model-enquiry-title">
      <h2 id="vv-model-enquiry-title">Request more information</h2>
      <ContactForm className="vv-model-enquiry__form" aria-label={`Enquiry for ${project?.title || 'Vastu Vihar'}`}>
        <input type="hidden" name="project" value={project?.title || ''} />
        <input type="hidden" name="source" value="project_enquiry_section" />
        <div className="vv-model-enquiry__honeypot" aria-hidden="true">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="vv-model-enquiry__fields">
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-first">First name (required)</label>
          <input id="vv-project-first" type="text" name="firstName" placeholder="First Name*" autoComplete="given-name" required />
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-last">Last name (required)</label>
          <input id="vv-project-last" type="text" name="lastName" placeholder="Last Name*" autoComplete="family-name" required />
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-phone">Phone number (required)</label>
          <input id="vv-project-phone" type="tel" name="phone" placeholder="Phone Number*" autoComplete="tel" required />
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-email">Email address (optional)</label>
          <input id="vv-project-email" type="email" name="email" placeholder="Email Address (optional)" autoComplete="email" />
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-city">Preferred city (required)</label>
          <select id="vv-project-city" name="city" defaultValue="" required>
            <option value="" disabled>Preferred City*</option>
            {PREFERRED_CITIES.map((city) => <option value={city} key={city}>{city}</option>)}
          </select>
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-budget">Budget range (optional)</label>
          <select id="vv-project-budget" name="budget" defaultValue="">
            <option value="">Budget Range (optional)</option>
            {BUDGETS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="vv-model-enquiry__sr-only" htmlFor="vv-project-message">Message</label>
          <textarea id="vv-project-message" name="message" rows={6} placeholder="Message..." />
          <div className="vv-model-enquiry__consent"><ConsentFields form="enquiry" marketing /></div>
          <div className="vv-model-enquiry__action">
            <VVArrowButton type="submit" label="Submit" />
          </div>
        </div>
      </ContactForm>
    </section>
  );
}
