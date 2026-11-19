import Link from 'next/link';
import ProjectBreadcrumb from './ProjectBreadcrumb';
import ProjectFacts from './ProjectFacts';
import ProjectHero from './ProjectHero';
import ProjectDescription from './ProjectDescription';
import ProjectAmenities from './ProjectAmenities';
import ProjectMedia from './ProjectMedia';
import ProjectLocation from './ProjectLocation';
import ProjectEnquiry from './ProjectEnquiry';
import ProjectNavigation from './ProjectNavigation';
import FinancePartners from '@/components/FinancePartners/FinancePartners';
import './ProjectDetails.css';

/** Shared detail page across every Vastu Vihar model. */
export default function ProjectDetails({ project }) {
  const heroImage =
    project.gallery?.find((image) => typeof image === 'string' && image.trim()) ||
    project.image ||
    project.modelTypes?.flatMap((model) => model.layouts || []).find((layout) => layout.url)?.url ||
    '';

  const modelProject = { ...project, image: heroImage };

  return (
    <div className="vv-model-details">
      <ProjectBreadcrumb project={modelProject} />
      <div id="content" className="site-content clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main vv-model-details__main">
              <div className="vv-model-details__heading">
                <div className="vv-model-details__location">
                  <i className="spaciaz-icon-marker" aria-hidden="true" />
                  <Link href={modelProject.locationHref || '/projects/'} rel="tag" prefetch={false}>
                    {modelProject.location}
                  </Link>
                </div>
                <h1 className="vv-model-details__title">{modelProject.title}</h1>
              </div>
              <div className="vv-model-details__content">
                <ProjectFacts project={modelProject} />
                <ProjectHero project={modelProject} />
                <ProjectDescription project={modelProject} />
                <ProjectLocation project={modelProject} />
                <FinancePartners />
                <ProjectAmenities />
                <ProjectMedia project={modelProject} />
                <ProjectEnquiry project={modelProject} />
                <ProjectNavigation project={modelProject} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
