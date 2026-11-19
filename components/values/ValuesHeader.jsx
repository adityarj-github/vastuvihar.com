import Link from 'next/link';
import StaticPill from '@/components/common/StaticPill';
import './ValuesHeader.css';

export default function ValuesHeader() {
  return (
    <>
      <header className="vv-values-header">
        <div className="vv-values-header__hero">
          <div className="vv-values-header__inner">
            <h1 className="vv-values-header__title">Core values</h1>
            <nav className="vv-values-header__breadcrumb" aria-label="Breadcrumb">
              <ol className="vv-values-header__crumbs">
                <li><Link href="/" prefetch={false}>Home</Link></li>
                <li className="vv-values-header__separator" aria-hidden="true" />
                <li aria-current="page">Core values</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="vv-values-header__curve" aria-hidden="true" />
      </header>

      <section className="vv-values-header__intro" aria-label="Introduction to our core values">
        <div className="vv-values-header__intro-inner">
          <div className="vv-values-header__pill"><StaticPill text="vastu vihar" /></div>
          <div className="vv-values-header__intro-content">
            <h2 className="vv-values-header__intro-title">
              An exceptional quality that can’t be beaten
            </h2>
          </div>
        </div>
      </section>
    </>
  );
}
