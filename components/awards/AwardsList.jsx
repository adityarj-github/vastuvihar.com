import { awards } from '@/data/awards';
import './AwardsList.css';

export default function AwardsList() {
  return (
    <section className="vv-awards-list" aria-label="Vastu Vihar awards and recognition">
      <div className="vv-awards-list__grid">
        {awards.map((award) => (
          <article className="vv-awards-list__card" key={award.id}>
            <div className="vv-awards-list__image-wrap">
              <img
                src={award.image}
                alt={award.alt}
                width={award.width}
                height={award.height}
                loading="lazy"
                decoding="async"
                className="vv-awards-list__image"
              />
            </div>
            <h3 className="vv-awards-list__title">{award.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
