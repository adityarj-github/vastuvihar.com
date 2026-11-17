import Link from 'next/link';
import './ContactHeader.css';

/**
 * Shared Contact banner. With no props, the main /contact/ page is unchanged.
 * Other contact routes can share its background, title, breadcrumb and curve.
 */
export default function ContactHeader({
  title = 'Get in touch',
  parentCrumb = null,
}) {
  return (
    <header className="vv-contact-header">
      <div className="vv-contact-header__hero">
        <div className="vv-contact-header__inner">
          <h1 className="vv-contact-header__title">{title}</h1>

          <div className="vv-contact-header__bottom">
            <nav aria-label="Breadcrumb" className="vv-contact-header__breadcrumb">
              <ol className="vv-contact-header__crumbs">
                <li>
                  <Link href="/" prefetch={false}>Home</Link>
                </li>
                <li className="vv-contact-header__separator" aria-hidden="true" />
                {parentCrumb && (
                  <>
                    <li>
                      <Link href={parentCrumb.href} prefetch={false}>
                        {parentCrumb.label}
                      </Link>
                    </li>
                    <li className="vv-contact-header__separator" aria-hidden="true" />
                  </>
                )}
                <li aria-current="page">{title}</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <div className="vv-contact-header__curve" aria-hidden="true" />
    </header>
  );
}
