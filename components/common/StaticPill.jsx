import './StaticPill.css';

/** Shared static pill. Keep the same styling in AboutHeader and AboutLeadership. */
export default function StaticPill({ text }) {
  return (
    <div className="static-pill">
      <span className="static-pill__label">{text}</span>
    </div>
  );
}
