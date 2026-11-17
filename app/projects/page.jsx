import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { projects } from '@/data/projects';
import { filterProjects } from '@/data/project-filters';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilters from '@/components/projects/ProjectFilters';
import { createPageMetadata } from '@/lib/metadata';
import './projects.css';

// A single canonical URL also covers filtered views.
export const metadata = createPageMetadata({
  title: 'Homes & Bungalow Models | Vastu Vihar',
  description:
    'Explore Vastu Vihar bungalow, row house and apartment designs, floor plans and indicative prices.',
  path: '/projects/',
});

export default async function ProjectsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const filters = {
    status: typeof params.status === 'string' ? params.status : '',
    type: typeof params.type === 'string' ? params.type : '',
    beds: typeof params.beds === 'string' ? params.beds : '',
    budget: typeof params.budget === 'string' ? params.budget : '',
  };

  const filteredModels = filterProjects(projects, filters);

  return (
    <PageLayout route="projects">
      <div className="vv-projects-archive">
        <header className="vv-projects-archive__hero">
          <div className="vv-projects-archive__hero-inner">
            <h1 className="vv-projects-archive__title">Our Home Models</h1>
            <nav className="vv-projects-archive__breadcrumbs" aria-label="Breadcrumb">
              <Link href="/" prefetch={false}>Home</Link>
              <span className="vv-projects-archive__separator" aria-hidden="true" />
              <span aria-current="page">Home Models</span>
            </nav>
          </div>
          <span className="vv-projects-archive__hero-curve" aria-hidden="true" />
        </header>

        <div id="content" className="site-content clear" tabIndex={-1}>
          <div className="col-fluid">
            <div id="primary" className="content-area">
              <main id="main" className="site-main vv-projects-archive__main">
                <ProjectFilters filters={filters} />
                {filteredModels.length > 0 ? (
                  <div className="vv-projects-archive__grid">
                    {filteredModels.map((model) => (
                      <ProjectCard key={model.slug} model={model} />
                    ))}
                  </div>
                ) : (
                  <div className="vv-projects-archive__empty" role="status">
                    <p>No models match your filters. Please change your selection and try again.</p>
                    <Link href="/projects/" prefetch={false}>View all models</Link>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd items={[{ name: 'Home Models' }]} />
    </PageLayout>
  );
}
