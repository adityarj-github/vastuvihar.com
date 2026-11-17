'use client';

import { useState, type FormEvent } from 'react';
import ConsentFields from '@/components/privacy/ConsentFields';
import VVArrowButton from '@/components/common/VVArrowButton';
import './CommentForm.css';


type CommentFormProps = {
  postId: string;
};

type CommentFields = {
  authorName: string;
  authorEmail: string;
  content: string;
};

const emptyFields: CommentFields = {
  authorName: '',
  authorEmail: '',
  content: '',
};

export default function CommentForm({ postId }: CommentFormProps) {
  const [formData, setFormData] = useState<CommentFields>(emptyFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const submitted = new FormData(form);

    setIsSubmitting(true);
    setMessage('');
    setSucceeded(false);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorName: formData.authorName,
          authorEmail: formData.authorEmail,
          content: formData.content,
          consentPrimary: submitted.get('consentPrimary') === 'true',
          noticeLanguage: submitted.get('noticeLanguage') || 'en',
          website_url: submitted.get('website_url') || '',
        }),
      });

      if (response.ok) {
        setSucceeded(true);
        setMessage('Your comment has been submitted and is awaiting moderation.');
        setFormData(emptyFields);
        form.reset();
      } else {
        const data: { error?: string } | null = await response.json().catch(() => null);
        setMessage(data?.error || 'Failed to post comment.');
      }
    } catch {
      setMessage('A network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="blog-comment-form-container" aria-labelledby="comment-form-title">
      <h3 id="comment-form-title" className="blog-comment-form__title">
        Leave a Reply
      </h3>
      <p className="blog-comment-form__subtitle">
        Your email address is optional and is never published. Required fields are marked *
      </p>

      {message && (
        <div
          className={`blog-comment-form__message ${succeeded ? 'blog-comment-form__message--success' : 'blog-comment-form__message--error'}`}
          role={succeeded ? 'status' : 'alert'}
          aria-live={succeeded ? 'polite' : 'assertive'}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-comment-form">
        {/* Keep the existing anti-spam honeypot in the request payload. */}
        <div className="blog-comment-form__honeypot" aria-hidden="true">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="blog-comment-form__row">
          <div className="blog-comment-form__group">
            <label htmlFor="comment-author-name" className="blog-comment-form__sr-only">
              Full Name (required)
            </label>
            <input
              id="comment-author-name"
              name="authorName"
              type="text"
              required
              autoComplete="name"
              placeholder="Full Name *"
              value={formData.authorName}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, authorName: event.target.value }))
              }
              className="blog-comment-form__field"
            />
          </div>

          <div className="blog-comment-form__group">
            <label htmlFor="comment-author-email" className="blog-comment-form__sr-only">
              Email Address (optional)
            </label>
            <input
              id="comment-author-email"
              name="authorEmail"
              type="email"
              autoComplete="email"
              placeholder="Email Address (optional)"
              value={formData.authorEmail}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, authorEmail: event.target.value }))
              }
              className="blog-comment-form__field"
            />
          </div>
        </div>

        <div className="blog-comment-form__group">
          <label htmlFor="comment-content" className="blog-comment-form__sr-only">
            Write your comment (required)
          </label>
          <textarea
            id="comment-content"
            name="content"
            required
            rows={5}
            placeholder="Write your comment here... *"
            value={formData.content}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, content: event.target.value }))
            }
            className="blog-comment-form__field blog-comment-form__textarea"
          />
        </div>

        <ConsentFields form="comment" />

        <VVArrowButton
          type="submit"
          disabled={isSubmitting}
          className="blog-comment-form__action"
          label={isSubmitting ? 'Posting...' : 'Post Comment'}
          ariaLabel={isSubmitting ? 'Posting comment' : 'Post comment'}
        />
      </form>
    </section>
  );
}
