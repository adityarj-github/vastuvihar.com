import './ProjectDescription.css';

export default function ProjectDescription({ project }) {
  const modelType = project.modelTypes?.[0];
  const detailRows = [
    ['Configuration', modelType?.modelName || project.type],
    ['Built-up Area', project.builtUp],
    ['Bedrooms', project.bedrooms],
    ['Bathrooms', project.bathrooms],
    ['Special Features', project.features?.slice(0, 3).join(' • ') || 'Contact us for details'],
  ];
  const benefits = project.benefits?.filter((item) => !/^please contact/i.test(item));

  return (
    <section className="vv-model-description" aria-label={`About ${project.title}`}>
      <div className="vv-model-description__main">
        <h2>About {project.title}</h2>
        <p>{project.description}</p>
        {project.features?.length > 0 && <p>{project.features.join(' · ')}</p>}
        {benefits?.length > 0 && <p>{benefits.join(' · ')}</p>}
      </div>
      <aside className="vv-model-description__details" aria-label="Key details">
        <h3>Key Details</h3>
        <ul>
          {detailRows.map(([label, value]) => (
            <li key={label}><span className="vv-model-description__bullet" aria-hidden="true" /><span><strong>{label}:</strong> {value}</span></li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
