import Link from 'next/link';
import './Breadcrumb.css';

/**
 * Reusable page banner. No Elementor classes or runtime dependencies.
 *
 * @param {object} props
 * @param {string} props.title - Visible banner heading and final breadcrumb.
 * @param {{label: string, href?: string}[]} [props.items] - Breadcrumbs between Home and title.
 * @param {'h1'|'h2'|'div'|'span'} [props.titleAs] - Preserves the existing API for pages with a separate h1.
 */
export default function Breadcrumb({ title, items = [], titleAs: Title = 'h1' }) {
  const crumbs = [{ label: 'Home', href: '/' }, ...items, { label: title }];

  return (
    <header className="vv-breadcrumb-banner">
      <div className="vv-breadcrumb-banner__overlay" aria-hidden="true" />

      <div className="vv-breadcrumb-banner__inner">
        <Title className="vv-breadcrumb-banner__title">{title}</Title>

        <nav className="vv-breadcrumb-banner__nav" aria-label="Breadcrumb">
          <ol className="vv-breadcrumb-banner__list">
            {crumbs.map((crumb, index) => {
              const isCurrent = index === crumbs.length - 1;

              return (
                <li className="vv-breadcrumb-banner__item" key={`${index}-${crumb.label}`}>
                  {index > 0 && (
                    <span className="vv-breadcrumb-banner__dot" aria-hidden="true" />
                  )}
                  {isCurrent ? (
                    <span className="vv-breadcrumb-banner__current" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : crumb.href ? (
                    <Link href={crumb.href} prefetch={false}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="vv-breadcrumb-banner__curve" aria-hidden="true" />
    </header>
  );
}
