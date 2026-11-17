import Link from 'next/link';
import './CareersHeader.css';

export default function CareersHeader() {
  return (
    <header className="vv-careers-header">
      <div className="vv-careers-header__hero">
        <div className="vv-careers-header__inner">
          <h1 className="vv-careers-header__title">Careers</h1>

          <nav className="vv-careers-header__breadcrumb" aria-label="Breadcrumb">
            <ol className="vv-careers-header__crumbs">
              <li>
                <Link href="/" prefetch={false}>Home</Link>
              </li>
              <li className="vv-careers-header__separator" aria-hidden="true" />
              <li aria-current="page">Careers</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="vv-careers-header__curve" aria-hidden="true" />
    </header>
  );
}
