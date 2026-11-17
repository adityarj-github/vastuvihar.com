import Link from 'next/link';
import './FaqsHeader.css';

export default function FaqsHeader() {
  return (
    <header className="vv-faqs-header">
      <div className="vv-faqs-header__hero">
        <div className="vv-faqs-header__inner">
          <h1 className="vv-faqs-header__title">FAQs</h1>
          <nav className="vv-faqs-header__breadcrumb" aria-label="Breadcrumb">
            <ol className="vv-faqs-header__crumbs">
              <li><Link href="/" prefetch={false}>Home</Link></li>
              <li className="vv-faqs-header__separator" aria-hidden="true" />
              <li aria-current="page">FAQs</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="vv-faqs-header__curve" aria-hidden="true" />
    </header>
  );
}
