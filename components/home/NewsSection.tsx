import VVArrowButton from '@/components/common/VVArrowButton';
import './NewsSection.css';
import Link from 'next/link';
import { orEmpty, prisma } from '@/lib/prisma';
import StaticPill from '../common/StaticPill';

// Format dates: "Nov 7, 2026"
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default async function NewsSection() {
  // Fetch latest 3 published posts so exactly 3 cards fit in one line
  const posts = await prisma.blogPost
    .findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    .catch(orEmpty('Home news'));

  if (posts.length === 0) return null;

  return (
    <div
      className="vv-block vv-home-news__news vv-flex vv-boxed vv-con vv-parent"
    >
      <div className="vv-inner">

        {/* ==========================================
            SECTION HEADER
        ========================================== */}
        <div
          className="vv-block vv-home-news__intro vv-full vv-flex vv-con vv-child"

        >
          <StaticPill text="Recent Blogs" />

          <div
            className="vv-block vv-home-news__heading vv-widget--width-initial animated-fast vv-reveal vv-widget vv-heading-widget"


          >
            <div className="vv-widget-inner">
              <h2 className="vv-heading vv-text-default">
                Discover inspiration and trends
              </h2>
            </div>
          </div>
        </div>

        {/* ==========================================
            VIEW ALL POSTS BUTTON
        ========================================== */}
        <div
          className="vv-block vv-home-news__cta-row vv-full vv-flex vv-con vv-child"
        >
          <div
            className="vv-block vv-home-news__cta enable-style-icon-yes animated-fast vv-button-outline icon-spaciaz-right vv-reveal vv-widget vv-arrow-widget"


          >
            <div className="vv-widget-inner">
              <div className="vv-button-wrap">
                <VVArrowButton href="/blog/" label="View all posts" className="vv-home-page__news-cta" />
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            COMPACT 3-CARD BLOG GRID
        ========================================== */}
        <div
          className="vv-block vv-home-news__post-list vv-widget--width-inherit animated-fast vv-reveal vv-widget vv-post-grid-widget"


        >
          <div className="vv-widget-inner">
            <div className="vv-home-blog-grid">
              {posts.map((post) => {
                const postUrl = `/blog/${post.slug}/`;

                return (
                  <article key={post.id} className="vv-home-blog-card">
                    <Link
                      href={postUrl}
                      prefetch={false}
                      className="vv-home-blog-link"
                      aria-label={`Read ${post.title}`}
                    >
                      {/* 5:4 Thumbnail */}
                      {post.imagePath ? (
                        <div className="vv-home-blog-thumb">
                          <img
                            loading="lazy"
                            decoding="async"
                            width={800}
                            height={640}
                            src={post.imagePath}
                            alt={post.title}
                            className="vv-home-blog-img"
                          />
                        </div>
                      ) : null}

                      {/* Content */}
                      <div className="vv-home-blog-body">
                        <div className="vv-home-blog-meta">
                          <span className="vv-home-blog-category">
                            {post.category}
                          </span>
                          <span className="vv-home-blog-divider" aria-hidden="true" />
                          <time
                            className="vv-home-blog-date"
                            dateTime={post.createdAt.toISOString()}
                          >
                            {formatDate(post.createdAt)}
                          </time>
                        </div>

                        <h3 className="vv-home-blog-title">
                          <span>{post.title}</span>
                        </h3>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
