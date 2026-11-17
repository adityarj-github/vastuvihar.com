import Link from 'next/link';
import './BlogHero.css';

/** Reusable blog / archive hero; no Elementor wrappers or widget IDs. */
export default function BlogHero({
  title = 'Latest Blogs',
  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blogs' },
  ],
}) {
  return (
    <header className="vv-blog-hero">
      <div className="vv-blog-hero__content">
        <h1 className="vv-blog-hero__title">{title}</h1>

        <nav className="vv-blog-hero__breadcrumbs" aria-label="Breadcrumb">
          <ol className="vv-blog-hero__breadcrumb-list">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="vv-blog-hero__breadcrumb-item">
                {index > 0 && (
                  <span className="vv-blog-hero__separator" aria-hidden="true" />
                )}

                {crumb.href ? (
                  <Link href={crumb.href} prefetch={false}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="vv-blog-hero__round-edge" aria-hidden="true" />
    </header>
  );
}
