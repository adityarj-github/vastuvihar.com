import { AMENITIES_DATA } from '@/data/amenities';
import './ProjectAmenities.css';

export default function ProjectAmenities() {
  return (
    <section className="vv-model-amenities" aria-labelledby="vv-model-amenities-title">
      <h2 id="vv-model-amenities-title" className="vv-model-amenities__title">Township Amenities</h2>
      <div className="vv-model-amenities__grid">
        {AMENITIES_DATA.map((item) => (
          <article className="vv-model-amenities__card" key={item.id}>
            <div className="vv-model-amenities__decor" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="320" height="104" viewBox="0 0 320 104" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0H320C290.545 0 267.772 24.6753 253.628 49.8666C235.516 82.1247 200.378 104 160 104C119.622 104 84.4835 82.1247 66.3718 49.8666C52.228 24.6753 29.4552 0 0 0Z" fill="white" />
              </svg>
            </div>
            <span className="vv-model-amenities__icon" aria-hidden="true">{item.icon}</span>
            <h3>{item.name}</h3>
            <p>{item.tag}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
