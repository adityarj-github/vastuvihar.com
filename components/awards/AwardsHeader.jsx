import Link from 'next/link';
import styles from './AwardsHeader.module.css';

export default function AwardsHeader() {
  return (
    <>
      <header className={styles.root}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.title}>Our awards</h1>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <ol className={styles.crumbs}>
                <li>
                  <Link href="/" prefetch={false}>Home</Link>
                </li>
                <li className={styles.separator} aria-hidden="true" />
                <li aria-current="page">Our awards</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className={styles.curve} aria-hidden="true" />
      </header>

      <section className={styles.introContainer} aria-labelledby="vv-awards-intro-heading">
        <div className={styles.introContent}>
          <h2 className={styles.introTitle} id="vv-awards-intro-heading">
            Awards &amp; Recognitions
          </h2>
          <p className={styles.introDescription}>
            Vastu Vihar’s dedication to quality construction, innovation, and affordable
            homeownership has earned prestigious recognition through its founder, Vinay Kumar
            Tiwary, reflecting the company’s vision, commitment to excellence, and contribution
            to the real estate sector.
          </p>
        </div>
      </section>
    </>
  );
}
