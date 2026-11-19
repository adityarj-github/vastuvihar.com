'use client';

import VVArrowButton from '@/components/common/VVArrowButton';

import './HeroSection.css';
import { useState } from 'react';

import { useMediaConsent } from '@/lib/privacy/cookieChoices';

const YOUTUBE_IDS = [
  'z23qYKxkkiU',
  'w_x03DkwmOY',
  'x52x2VKPUcg',
];

const HERO_POSTERS = ['/ananta/ananta.webp', '/villa/simplex.webp', '/villa/ceo.webp'];

export default function HeroSection() {
  const [activeVideo, setActiveVideo] = useState(0);
  const mediaAllowed = useMediaConsent();

  return (
    <div
      className="vv-block vv-home-hero__hero vv-full vv-flex vv-con vv-parent"
      id="tab_video"

    >
      {/* Direct child of the outer hero: covers the entire hero, not an inner column. */}
      <div className="vv-hero-background" aria-hidden="true">
        {/* The video is a third-party frame, so a local image shows until media consent. */}
        {mediaAllowed ? (
          <iframe
            key={YOUTUBE_IDS[activeVideo]}
            className="vv-hero-background-player"
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_IDS[activeVideo]}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_IDS[activeVideo]}&controls=0&playsinline=1&rel=0`}
            title="Vastu Vihar background video"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
            allowFullScreen
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <img
            src={HERO_POSTERS[activeVideo]}
            alt=""
            width="1920"
            height="1000"
            fetchPriority="high"
            decoding="async"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
          />
        )}
      </div>
      <div
        className="vv-block vv-home-hero__inner vv-flex vv-boxed vv-con vv-child"
      >
        <div className="vv-inner">
          <div
            className="vv-block vv-home-hero__copy vv-full vv-flex vv-con vv-child"

          >
            <div
              className="vv-block vv-home-hero__headline vv-widget--width-initial vv-reveal vv-widget vv-heading-widget"


            >
              <div className="vv-widget-inner">
                <h1 className="vv-heading vv-text-default">
                  Your Dream Home, Our Commitment.
                </h1>{' '}
              </div>
            </div>
            <div
              className="vv-block vv-home-hero__cta enable-style-icon-yes animated-fast vv-button-default icon-spaciaz-right vv-reveal vv-widget vv-arrow-widget"


            >
              <div className="vv-widget-inner">
                <div className="vv-button-wrap">
                  <VVArrowButton href="/projects/" label="View all Models" className="vv-home-page__hero-cta" />
                </div>
              </div>
            </div>
            <div
              className="vv-block vv-home-hero__video-tabs vv-video-style vv-widget vv-video-tabs-widget"

            >
              <div className="vv-widget-inner">
                <div className="video-tabs-element" >
                  <div className="video-tabs-nav">
                    <div className={`video-tab-nav-item ${activeVideo === 0 ? "active" : ""}`} data-tab="video-tab-0" role="button" tabIndex={0} aria-label="Play video 1" aria-pressed={activeVideo === 0} onClick={() => setActiveVideo(0)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveVideo(0); } }}>
                      <div className="vv-video-tabs-image">
                        <img
                          decoding="async"
                          width="190"
                          height="80"
                          src="/ananta/ananta.webp"
                          className="attachment-full size-full wp-image-7480"
                          alt=""
                        />{' '}
                      </div>
                    </div>
                    <div className={`video-tab-nav-item ${activeVideo === 1 ? "active" : ""}`} data-tab="video-tab-1" role="button" tabIndex={0} aria-label="Play video 2" aria-pressed={activeVideo === 1} onClick={() => setActiveVideo(1)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveVideo(1); } }}>
                      <div className="vv-video-tabs-image">
                        <img
                          loading="lazy"
                          decoding="async"
                          width="190"
                          height="80"
                          src="/villa/simplex.webp"
                          className="attachment-full size-full wp-image-7481"
                          alt=""
                        />{' '}
                      </div>
                    </div>
                    <div className={`video-tab-nav-item ${activeVideo === 2 ? "active" : ""}`} data-tab="video-tab-2" role="button" tabIndex={0} aria-label="Play video 3" aria-pressed={activeVideo === 2} onClick={() => setActiveVideo(2)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveVideo(2); } }}>
                      <div className="vv-video-tabs-image">
                        <img
                          loading="lazy"
                          decoding="async"
                          width="190"
                          height="80"
                          src="/villa/ceo.webp"
                          className="attachment-full size-full wp-image-7479"
                          alt=""
                        />{' '}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="vv-block vv-home-hero__white-curve vv-widget vv-spacer-widget"

      >
        <div className="vv-widget-inner">
          <div className="vv-spacer">
            <div className="vv-spacer-inner"></div>
          </div>
        </div>
      </div>
      <div
        className="vv-block vv-home-hero__poster vv-absolute vv-widget vv-image-widget"


      >
        <div className="vv-widget-inner">
          <img
            loading="lazy"
            decoding="async"
            width="1920"
            height="1000"
            src="/ananta/ananta.webp"
            className="attachment-full size-full wp-image-6383"
            alt=""
          />{' '}
        </div>
      </div>
    </div>
  );
}
