import './ProjectFacts.css';

const FACTS = [
  { key: 'bedrooms', label: 'Bedrooms', icon: 'spaciaz-icon-layer-2' },
  { key: 'type', label: 'Home Type', icon: 'spaciaz-icon-buliding-2' },
  { key: 'builtUp', label: 'Built-up Area', icon: 'spaciaz-icon-format-square' },
  { key: 'plotArea', label: 'Plot / Land Area', icon: 'spaciaz-icon-calendar-2' },
  { key: 'priceRange', label: 'Price Range', icon: 'spaciaz-icon-dollar-circle' },
];

export default function ProjectFacts({ project }) {
  return (
    <section className="vv-model-facts" aria-label="Model facts">
      {FACTS.map(({ key, label, icon }) => (
        <div className="vv-model-facts__item" key={key}>
          <span className="vv-model-facts__icon" aria-hidden="true"><i className={icon} /></span>
          <div className="vv-model-facts__text">
            <h2>{label}</h2>
            <p>{project[key] || 'Not specified'}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
