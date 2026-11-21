'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import ConsentFields from '@/components/privacy/ConsentFields';
import VVArrowButton from '@/components/common/VVArrowButton';

type ApplicationFields = {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  experience: string;
  coverLetter: string;
};

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;

export default function ApplyForm() {
  const searchParams = useSearchParams();
  const prefilledTitle = searchParams.get('title')?.trim() || '';

  const [formData, setFormData] = useState<ApplicationFields>({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: prefilledTitle,
    experience: '',
    coverLetter: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Keep the title in sync when navigation changes or removes the title query.
  useEffect(() => {
    setFormData((current) =>
      current.jobTitle === prefilledTitle
        ? current
        : { ...current, jobTitle: prefilledTitle },
    );
  }, [prefilledTitle]);

  function updateField(field: keyof ApplicationFields, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setError('');

    if (file && !RESUME_EXTENSIONS.test(file.name)) {
      setError('Please select a PDF, DOC or DOCX resume.');
      event.target.value = '';
      return;
    }

    if (file && file.size > MAX_RESUME_SIZE) {
      setError('Resume file size exceeds the 5 MB limit.');
      event.target.value = '';
      return;
    }

  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Named inputs, the resume, the privacy consent fields and the honeypot
      // all reach the API directly with the same keys it already expects.
      const data = new FormData(event.currentTarget);
      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: data,
      });
      const result: { error?: string; message?: string } | null =
        await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error || 'Failed to submit application.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="vv-careers-apply__wrapper" aria-labelledby="apply-form-title">
      <div className="vv-careers-apply__container">
        {/* CareersHeader already renders the page's visible h1. */}
        <h2 id="apply-form-title" className="vv-careers-apply__title">
          Apply for {formData.jobTitle || 'a Position'}
        </h2>
        <p className="vv-careers-apply__subtitle">
          Submit your details and resume below. Our HR team will review your application.
        </p>

        {success ? (
          <div className="vv-careers-apply__success" role="status">
            <h3>Application Submitted Successfully!</h3>
            <p>Thank you for applying. We will be in touch soon.</p>
          </div>
        ) : (
          <form className="vv-careers-apply__form" onSubmit={handleSubmit}>
            {error && (
              <div className="vv-careers-apply__error" role="alert">
                {error}
              </div>
            )}

            <div className="vv-careers-apply__row">
              <div className="vv-careers-apply__group">
                <label htmlFor="apply-full-name" className="vv-careers-apply__label">
                  Full Name *
                </label>
                <input
                  id="apply-full-name"
                  name="fullName"
                  required
                  autoComplete="name"
                  type="text"
                  maxLength={120}
                  className="vv-careers-apply__input"
                  value={formData.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                />
              </div>
              <div className="vv-careers-apply__group">
                <label htmlFor="apply-email" className="vv-careers-apply__label">
                  Email Address *
                </label>
                <input
                  id="apply-email"
                  name="email"
                  required
                  autoComplete="email"
                  type="email"
                  className="vv-careers-apply__input"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </div>
            </div>

            <div className="vv-careers-apply__row">
              <div className="vv-careers-apply__group">
                <label htmlFor="apply-phone" className="vv-careers-apply__label">
                  Phone Number *
                </label>
                <input
                  id="apply-phone"
                  name="phone"
                  required
                  autoComplete="tel"
                  type="tel"
                  className="vv-careers-apply__input"
                  value={formData.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </div>
              <div className="vv-careers-apply__group">
                <label htmlFor="apply-job-title" className="vv-careers-apply__label">
                  Position Applied For *
                </label>
                <input
                  id="apply-job-title"
                  name="jobTitle"
                  required
                  type="text"
                  maxLength={160}
                  readOnly={Boolean(prefilledTitle)}
                  className="vv-careers-apply__input"
                  value={formData.jobTitle}
                  onChange={(event) => updateField('jobTitle', event.target.value)}
                />
              </div>
            </div>

            <div className="vv-careers-apply__group">
              <label htmlFor="apply-experience" className="vv-careers-apply__label">
                Years of Experience
              </label>
              <input
                id="apply-experience"
                name="experience"
                type="text"
                maxLength={200}
                placeholder="e.g. 3 Years in Civil Engineering"
                className="vv-careers-apply__input"
                value={formData.experience}
                onChange={(event) => updateField('experience', event.target.value)}
              />
            </div>

            <div className="vv-careers-apply__group">
              <label htmlFor="apply-resume" className="vv-careers-apply__label">
                Resume / CV (PDF, DOC or DOCX) *
              </label>
              <input
                id="apply-resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="vv-careers-apply__file"
                onChange={handleResumeChange}
                onInvalid={() => setError('Please attach your resume (PDF, DOC or DOCX).')}
              />
            </div>

            <div className="vv-careers-apply__group">
              <label htmlFor="apply-cover-letter" className="vv-careers-apply__label">
                Cover Letter / Note
              </label>
              <textarea
                id="apply-cover-letter"
                name="coverLetter"
                rows={4}
                maxLength={4000}
                className="vv-careers-apply__textarea"
                value={formData.coverLetter}
                onChange={(event) => updateField('coverLetter', event.target.value)}
              />
            </div>

            <div className="vv-careers-apply__honeypot" aria-hidden="true">
              <label htmlFor="apply-website">Website</label>
              <input
                id="apply-website"
                name="website_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <ConsentFields form="application" compact />

            <VVArrowButton
              type="submit"
              disabled={isSubmitting}
              className="vv-careers-apply__submit"
              label={isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              ariaLabel={isSubmitting ? 'Submitting application' : 'Submit application'}
            />
          </form>
        )}
      </div>
    </section>
  );
}
