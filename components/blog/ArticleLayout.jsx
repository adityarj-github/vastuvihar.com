import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import VVArrowButton from '@/components/common/VVArrowButton';
import './ArticleLayout.css';

/**
 * Single-blog page shell. All visual styles live in ArticleLayout.css.
 * `children` is the article HTML; `afterContent` is for comments and forms,
 * so entry-content typography cannot unintentionally restyle form controls.
 */
export default function ArticleLayout({
  route,
  postId = 'post',
  category = 'Company',
  categoryHref = '/category/company/',
  title,
  publishedDate = 'Nov 20, 2026',
  publishedIso = '2026-11-20T08:29:42+00:00',
  updatedDate,
  updatedIso,
  image,
  imageAlt,
  prevPost,
  nextPost,
  afterContent,
  children,
}) {
  const postHref = route ? `/blog/${encodeURIComponent(route)}/` : '/blog/';

  return (
    <PageLayout route={route}>
      <div className="article-layout">
        <header className="article-layout__hero">
          <div className="article-layout__hero-inner">
            <nav className="article-layout__breadcrumbs" aria-label="Breadcrumb">
              <ol className="article-layout__breadcrumb-list">
                <li className="article-layout__breadcrumb-item">
                  <Link href="/" prefetch={false}>Home</Link>
                </li>
                <li className="article-layout__breadcrumb-item">
                  <Link href="/blog/" prefetch={false}>Blog</Link>
                </li>
                <li className="article-layout__breadcrumb-item">
                  <Link href={categoryHref} prefetch={false}>{category}</Link>
                </li>
                <li className="article-layout__breadcrumb-item article-layout__breadcrumb-item--current">
                  <span aria-current="page" title={title}>{title}</span>
                </li>
              </ol>
            </nav>
          </div>
          <div className="article-layout__hero-round-edge" aria-hidden="true" />
        </header>

        <div id="content" className="site-content clear article-layout__site-content" tabIndex={-1}>
          <div className="col-full">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <article
                  id={`post-${postId}`}
                  className={`article-layout__article post type-post status-publish format-standard hentry${image ? ' has-post-thumbnail' : ''}`}
                >
                  <div className="article-layout__single">
                    <header className="article-layout__entry-header">
                      <div className="article-layout__meta">
                        <div className="article-layout__category">
                          <Link href={categoryHref} rel="category tag" prefetch={false}>
                            {category}
                          </Link>
                        </div>
                        <div className="article-layout__date">
                          <Link href={postHref} rel="bookmark" prefetch={false}>
                            <time dateTime={publishedIso}>{publishedDate}</time>
                          </Link>
                          {updatedDate && updatedIso && (
                            <time dateTime={updatedIso} hidden>{updatedDate}</time>
                          )}
                        </div>
                      </div>
                      <h1 className="article-layout__title entry-title">{title}</h1>
                    </header>

                    {image && (
                      <div className="article-layout__featured">
                        <img
                          width="1290"
                          height="600"
                          src={image}
                          alt={imageAlt || title}
                          decoding="async"
                        />
                      </div>
                    )}

                    <div className="article-layout__body entry-content">
                      {children}
                    </div>

                    {afterContent && (
                      <div className="article-layout__after-content">{afterContent}</div>
                    )}

                    {(prevPost || nextPost) && (
                      <nav className="article-layout__post-navigation" aria-label="Post navigation">
                        <div className="article-layout__nav-links">
                          {prevPost ? (
                            <div className="article-layout__nav-item article-layout__nav-item--previous">
                              <span className="article-layout__nav-label">Previous post</span>
                              <VVArrowButton
                                href={prevPost.href}
                                ariaLabel={`Previous post: ${prevPost.title}`}
                                className="article-layout__nav-button"
                              >
                                <span className="article-layout__nav-title">{prevPost.title}</span>
                              </VVArrowButton>
                            </div>
                          ) : <div className="article-layout__nav-placeholder" aria-hidden="true" />}

                          {nextPost && (
                            <div className="article-layout__nav-item article-layout__nav-item--next">
                              <span className="article-layout__nav-label">Next post</span>
                              <VVArrowButton
                                href={nextPost.href}
                                ariaLabel={`Next post: ${nextPost.title}`}
                                className="article-layout__nav-button"
                              >
                                <span className="article-layout__nav-title">{nextPost.title}</span>
                              </VVArrowButton>
                            </div>
                          )}
                        </div>
                      </nav>
                    )}
                  </div>
                </article>
              </main>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
