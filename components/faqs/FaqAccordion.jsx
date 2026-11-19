'use client';

import { useRef, useState } from 'react';
import { faqs } from '@/data/faqs';
import './FaqAccordion.css';

/**
 * Accessible FAQ accordion: first answer open; only one answer open at once.
 * The original Elementor page used 400ms transitions and custom keyboard rules.
 */
export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const triggerRefs = useRef([]);

  const handleKeyDown = (event, index) => {
    let next = null;

    switch (event.key) {
      case 'ArrowDown':
        next = (index + 1) % faqs.length;
        break;
      case 'ArrowUp':
        next = (index - 1 + faqs.length) % faqs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = faqs.length - 1;
        break;
      case 'Escape':
        if (openIndex !== null) {
          event.preventDefault();
          setOpenIndex(null);
        }
        return;
      default:
        return;
    }

    event.preventDefault();
    triggerRefs.current[next]?.focus();
  };

  return (
    <section className="vv-faq-accordion" aria-labelledby="vv-faqs-heading">
      <div className="vv-faq-accordion__list">
        {faqs.map((faq, index) => {
          const expanded = index === openIndex;
          const triggerId = `vv-faq-${index}-trigger`;
          const panelId = `vv-faq-${index}-panel`;

          return (
            <article
              key={faq.id ?? index}
              className={`vv-faq-accordion__item${expanded ? ' vv-faq-accordion__item--open' : ''}`}
            >
              <h3 className="vv-faq-accordion__heading">
                <button
                  ref={(node) => { triggerRefs.current[index] = node; }}
                  id={triggerId}
                  type="button"
                  className="vv-faq-accordion__trigger"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(expanded ? null : index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="vv-faq-accordion__question">{faq.question}</span>
                  <span className="vv-faq-accordion__toggle" aria-hidden="true">
                    <svg
                      className="vv-faq-accordion__chevron"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                className="vv-faq-accordion__panel"
                role="region"
                aria-labelledby={triggerId}
                aria-hidden={!expanded}
                inert={!expanded}
              >
                <div className="vv-faq-accordion__panel-inner">
                  <p className="vv-faq-accordion__answer">{faq.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
