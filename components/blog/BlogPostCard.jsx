import Link from 'next/link';
import './BlogPostCard.css';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/** One fully clickable blog card. Deliberately no nested link or button. */
export default function BlogPostCard({ post }) {
  const href = `/blog/${post.slug}/`;

  return (
    <article className="vv-blog-card">
      <Link
        href={href}
        prefetch={false}
        className="vv-blog-card__link"
        aria-label={`Read ${post.title}`}
      >
        {post.imagePath && (
          <span className="vv-blog-card__thumbnail">
            <img
              src={post.imagePath}
              alt={post.title}
              width={900}
              height={599}
              loading="lazy"
              decoding="async"
            />
          </span>
        )}

        <div className="vv-blog-card__body">
          <span className="vv-blog-card__meta">
            <span className="vv-blog-card__category">{post.category}</span>
            <time
              className="vv-blog-card__date"
              dateTime={new Date(post.createdAt).toISOString()}
            >
              {formatDate(post.createdAt)}
            </time>
          </span>

          <h2 className="vv-blog-card__title">{post.title}</h2>
        </div>
      </Link>
    </article>
  );
}
