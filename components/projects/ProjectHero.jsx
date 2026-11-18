import './ProjectHero.css';

export default function ProjectHero({ project }) {
  if (!project.image) return null;
  return (
    <figure className="vv-model-hero">
      <img
        fetchPriority="high"
        decoding="async"
        width="1290"
        height="600"
        src={project.heroImage}
        alt={project.title}
      />
    </figure>
  );
}
