'use client';

import { useEffect, useId, useRef, useState } from 'react';
import VVArrowButton from '@/components/common/VVArrowButton';
import './CareersShowcase.css';

export default function CareersShowcase({ jobs = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const detailsRef = useRef(null);
  const headingRef = useRef(null);
  const roleRefs = useRef([]);
  const regionId = useId();
  const headingId = useId();
  const selectedJob = selectedIndex === null ? null : jobs[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null || !selectedJob) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    detailsRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    headingRef.current?.focus({ preventScroll: true });
  }, [selectedIndex, selectedJob]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    function onEscape(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDetails();
      }
    }

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [selectedIndex]);

  function closeDetails() {
    const previousIndex = selectedIndex;
    setSelectedIndex(null);
    if (previousIndex !== null) {
      // Put keyboard focus back on the row that opened the details.
      requestAnimationFrame(() => roleRefs.current[previousIndex]?.focus());
    }
  }

  function selectJob(index) {
    if (selectedIndex === index) {
      closeDetails();
    } else {
      setSelectedIndex(index);
    }
  }

  if (!jobs.length) {
    return (
      <section className="vv-careers-showcase vv-careers-showcase--empty" aria-label="Current vacancies">
        <h2>No open positions at the moment.</h2>
        <p>Please check back later for new career opportunities.</p>
      </section>
    );
  }

  return (
    <section className="vv-careers-showcase" aria-label="Current vacancies">
      <div className="vv-careers-showcase__list">
        {jobs.map((job, index) => (
          <button
            key={job.id}
            ref={(element) => { roleRefs.current[index] = element; }}
            type="button"
            className={`vv-careers-showcase__role${selectedIndex === index ? ' vv-careers-showcase__role--active' : ''}`}
            aria-controls={regionId}
            aria-expanded={selectedIndex === index}
            onClick={() => selectJob(index)}
          >
            <span className="vv-careers-showcase__type">
              <span>{job.type || 'Open position'}</span>
            </span>
            <span className="vv-careers-showcase__title">{job.title}</span>
            <span className="vv-careers-showcase__location">
              <i aria-hidden="true" className="spaciaz-icon-marker" />
              <span>{job.location}</span>
            </span>
            <span className="vv-careers-showcase__plus" aria-hidden="true">
              <i className="spaciaz-icon-plus-1" />
            </span>
          </button>
        ))}
      </div>

      <div
        className="vv-careers-showcase__details"
        id={regionId}
        ref={detailsRef}
        role="region"
        aria-labelledby={headingId}
        hidden={!selectedJob}
      >
        {selectedJob && (
          <>
            <button
              type="button"
              className="vv-careers-showcase__close"
              onClick={closeDetails}
              aria-label="Close job details"
            >
              <svg
                className="vv-careers-showcase__close-icon"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 23.691 22.723"
              >
                <g transform="translate(-126.154 -143.139)">
                  <line x2="23" y2="22" transform="translate(126.5 143.5)" fill="none" stroke="currentColor" strokeWidth="5" />
                  <path d="M0,22,23,0" transform="translate(126.5 143.5)" fill="none" stroke="currentColor" strokeWidth="5" />
                </g>
              </svg>
            </button>

            <h2 id={headingId} ref={headingRef} tabIndex={-1} className="vv-careers-showcase__detail-title">
              {selectedJob.title}
            </h2>
            <div className="vv-careers-showcase__detail-content">
              <div className="vv-careers-showcase__description">
                <h3>Job Description</h3>
                <p>{selectedJob.description}</p>

                {selectedJob.requirements && (
                  <>
                    <h3>Key Requirements</h3>
                    <p>{selectedJob.requirements}</p>
                  </>
                )}
              </div>

              <div className="vv-careers-showcase__meta">
                <div className="vv-careers-showcase__meta-items">
                  {selectedJob.department && (
                    <div><i aria-hidden="true" className="spaciaz-icon-calendar" />{selectedJob.department}</div>
                  )}
                  {selectedJob.type && (
                    <div><i aria-hidden="true" className="spaciaz-icon-clock" />{selectedJob.type}</div>
                  )}
                  {selectedJob.location && (
                    <div><i aria-hidden="true" className="spaciaz-icon-marker-pin" />{selectedJob.location}</div>
                  )}
                </div>
                <VVArrowButton
                  href={`/careers/apply?title=${encodeURIComponent(selectedJob.title)}`}
                  label="Apply Now"
                  className="vv-careers-showcase__apply"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
