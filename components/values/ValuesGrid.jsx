import { coreValues } from '@/data/core-values';
import ValueCard from './ValueCard';
import './ValuesGrid.css';

export default function ValuesGrid() {
  return (
    <section className="vv-values-grid" aria-label="Vastu Vihar core values">
      <div className="vv-values-grid__inner">
        <div className="vv-values-grid__feature" role="img" aria-label="Vastu Vihar core values banner">
          <span className="vv-values-grid__cutout" aria-hidden="true">
            <span className="vv-values-grid__cutout-corner vv-values-grid__cutout-corner--right" />
            <span className="vv-values-grid__cutout-corner vv-values-grid__cutout-corner--bottom" />
          </span>
        </div>

        <div className="vv-values-grid__cards">
          {coreValues.map((value, index) => (
            <ValueCard key={value.id} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
