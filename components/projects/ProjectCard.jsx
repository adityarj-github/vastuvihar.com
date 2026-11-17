import Link from 'next/link';
import { modelType, getBudgetCategories } from '@/data/project-filters';
import './ProjectCard.css';

export default function ProjectCard({ model }) {
  return (
    <article className="vv-model-card">
      <Link
        href={`/projects/${model.slug}/`}
        prefetch={false}
        className="vv-model-card__link"
        data-budget={getBudgetCategories(model).join(',')}
        data-min-price={model.minPrice}
        data-max-price={model.maxPrice}
        data-type={modelType(model)}
        data-status={model.youtubeId ? 'walkthrough' : 'no-walkthrough'}
        data-beds={model.bedrooms}
        aria-label={`${model.title} - ${model.priceRange}`}
      >
        <div className="vv-model-card__photo">
          <img
            width="1920"
            height="1344"
            src={model.image}
            alt={model.title}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="vv-model-card__content">
          <div className="vv-model-card__status">
            <span>{model.priceRange}</span>
          </div>
          <div className="vv-model-card__location">
            <i className="spaciaz-icon-marker" aria-hidden="true" />
            <span>{model.bedrooms} BHK{model.builtUp !== 'Not specified' ? ` · ${model.builtUp}` : ''}</span>
          </div>
          <h2 className="vv-model-card__title">{model.title}</h2>
        </div>
      </Link>
    </article>
  );
}
