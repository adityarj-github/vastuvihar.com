import Link from 'next/link';
import './ProjectBreadcrumb.css';

/** Reusable model-specific banner, without global breadcrumb-image overrides. */
export default function ProjectBreadcrumb({ project }) {
  const bannerImage =
    project?.image && /^\/[a-zA-Z0-9_./-]+$/.test(project.image)
      ? project.image
      : '/About.webp';

  return (
    <header
      className="vv-model-breadcrumb"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), url(${JSON.stringify(bannerImage)})` }}
    >
      <div className="vv-model-breadcrumb__inner">
        <nav className="vv-model-breadcrumb__nav" aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>Home</Link>
          <span aria-hidden="true" className="vv-model-breadcrumb__separator" />
          <Link href="/projects/" prefetch={false}>Models</Link>
          <span aria-hidden="true" className="vv-model-breadcrumb__separator" />
          <span aria-current="page">{project.title}</span>
        </nav>
      </div>
      <span className="vv-model-breadcrumb__curve" aria-hidden="true" />
    </header>
  );
}
