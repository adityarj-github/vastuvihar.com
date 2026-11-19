import VVArrowButton from '@/components/common/VVArrowButton';
import Link from 'next/link';

import './ProjectsSection.css';
import StaticPill from '../common/StaticPill';
const tickerItems = ['housing models', '·', 'housing models', '·'];

const projects = [
  {
    name: 'Ananta Bungalow',
    type: 'bungalow',
    status: 'Premium',
    image: '/villa/ananta.webp',
    imageWidth: 1920,
    imageHeight: 1344,
    href: '/projects/ananta-bungalow/',
    details: 'BUA: 1800 Sqft, 50 - 70 Lac',
  },
  {
    name: 'CEO Bungalow',
    type: 'bungalow',
    status: 'Premium',
    image: '/villa/ceo.webp',
    imageWidth: 1920,
    imageHeight: 1280,
    href: '/projects/ceo-bungalow/',
    details: 'BUA: 2500 Sqft, 90 Lac - 1.80Cr',
  },
  {
    name: 'Simplex Bungalow',
    type: 'bungalow',
    status: '2-BHK',
    image: '/villa/simplex.webp',
    imageWidth: 1920,
    imageHeight: 1248,
    href: '/projects/simplex-bungalow/',
    details: 'BUA: 1000 Sqft, 30 - 35 Lac',
  },
  {
    name: 'Ganga',
    alt: 'Ganga Flat',
    type: 'flat',
    status: 'Flat',
    image: '/villa/ganga.webp',
    imageWidth: 1920,
    imageHeight: 1081,
    href: '/projects/ganga-new-2bhk/',
    details: 'BUA: 510 Sqft, 10 - 16 Lac',
  },
];

function ScrollingTicker() {
  return (
    <div className="vv-scrolling">
      <div className="vv-scrolling-wrapper">
        {Array.from({ length: 5 }).map((_, groupIndex) => (
          <div className="vv-scrolling-inner" key={groupIndex}>
            {tickerItems.map((item, itemIndex) => (
              <div className="vv-scrolling-item" key={`${groupIndex}-${itemIndex}`}>
                <div className="vv-scrolling-item-inner">
                  <div
                    className={`scrolling-title ${
                      itemIndex % 2 === 0
                        ? itemIndex === 0
                          ? 'vv-ticker-label-one'
                          : 'vv-ticker-label-two'
                        : itemIndex === 1
                          ? 'vv-ticker-dot-one'
                          : 'vv-ticker-dot-two'
                    }`}
                  >
                    <span>{item}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="grid-item">
      <div
        className="project-item project-style-1"
        data-type={project.type}
      >
        <div className="project-post-thumbnail">
          <div className="project-status">
            <Link href="#" rel="tag" prefetch={false}>
              {project.status}
            </Link>
          </div>

          <Link href={project.href} prefetch={false} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img
              loading="lazy"
              decoding="async"
              width={project.imageWidth}
              height={project.imageHeight}
              src={project.image}
              className="attachment-full size-full wp-post-image"
              alt={project.alt || project.name}
            />
          </Link>
        </div>

        <div className="project-content">
          <div className="project-location">
            <Link href={project.href} rel="tag" prefetch={false}>
              {project.details}
            </Link>
          </div>

          <h4 className="project-title delta">
            <Link href={project.href} prefetch={false}>
              {project.name}
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  return (
    <div
      className="vv-block vv-home-projects__projects vv-flex vv-boxed vv-con vv-parent"
    >
      <div className="vv-inner">
        <div
          className="vv-block vv-home-projects__intro vv-full vv-flex vv-con vv-child"

        >
            <StaticPill text="Our Models" />
          <div
            className="vv-block vv-home-projects__title vv-widget--width-initial animated-fast vv-reveal vv-widget vv-heading-widget"


          >
            <div className="vv-widget-inner">
              <h2 className="vv-heading vv-text-default">
                Explore our bungalow &amp; duplex models
              </h2>
            </div>
          </div>
        </div>

        <div
          className="vv-block vv-home-projects__cta vv-full vv-flex vv-con vv-child"
        >
          <div
            className="vv-block vv-home-projects__cta-wrapper enable-style-icon-yes animated-fast vv-button-outline icon-spaciaz-right vv-reveal vv-widget vv-arrow-widget"


          >
            <div className="vv-widget-inner">
              <div className="vv-button-wrap">
                <VVArrowButton href="/projects/" label="View all models" className="vv-home-page__projects-cta" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="vv-block vv-home-projects__model-cards vv-widget--width-inherit vv-project-style-1 overflow-to-none vv-widget vv-widget-spaciaz-projects"


        >
          <div className="vv-widget-inner">
            <div className="vv-project-wrapper">
              <div className="d-grid">
                {projects.map((project) => (
                  <ProjectCard key={project.href} project={project} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
