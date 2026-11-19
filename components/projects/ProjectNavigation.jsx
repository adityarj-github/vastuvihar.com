import Link from 'next/link';
import { getProject } from '@/data/projects';
import './ProjectNavigation.css';

/** Simple previous/next model links, preserving the original Spaciaz navigation style. */
export default function ProjectNavigation({ project }) {
  const previous = project.previousSlug ? getProject(project.previousSlug) : null;
  const next = project.nextSlug ? getProject(project.nextSlug) : null;
  if (!previous && !next) return null;

  return (
    <nav className="vv-model-navigation" aria-label="Project navigation">
      <div className="vv-model-navigation__slot">
        {previous && (
          <Link
            href={`/projects/${previous.slug}/`}
            rel="prev"
            prefetch={false}
            className="vv-model-navigation__link"
            aria-label={`Previous project: ${previous.title}`}
          >
            <span className="vv-model-navigation__text">
              <i className="spaciaz-icon-chevron-left" aria-hidden="true" />
              prev.
            </span>
          </Link>
        )}
      </div>
      <div className="vv-model-navigation__slot vv-model-navigation__slot--next">
        {next && (
          <Link
            href={`/projects/${next.slug}/`}
            rel="next"
            prefetch={false}
            className="vv-model-navigation__link"
            aria-label={`Next project: ${next.title}`}
          >
            <span className="vv-model-navigation__text">
              next
              <i className="spaciaz-icon-chevron-right" aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
