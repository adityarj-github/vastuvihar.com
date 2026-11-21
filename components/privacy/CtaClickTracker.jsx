'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieChoice } from '@/lib/privacy/cookieChoices';

/**
 * CtaClickTracker
 * Sends a named Microsoft Clarity event for important clicks: phone, WhatsApp, email,
 * price lists and brochures, site visits, enquiries, career applications and other CTAs.
 * Runs only after the visitor allows Analytics. Only the event name is sent.
 */
export default function CtaClickTracker() {
  const pathname = usePathname();
  const choice = useCookieChoice();
  const analytics = choice?.analytics === true;
  // The click listener reads the latest choice without being re-added on every change.
  const consent = useRef({ analytics });
  consent.current = { analytics };

  // Global CTA click listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname?.startsWith('/admin')) return;

    let lastClickTime = 0;
    let lastTarget = null;

    function handleClick(event) {
      try {
        const target = event.target?.closest?.(
          'a, button, [role="button"], input[type="submit"], input[type="button"]'
        );
        if (!target) return;

        // Skip clicks in admin or cookie banner
        if (
          window.location.pathname.startsWith('/admin') ||
          target.closest('[data-privacy-banner]') ||
          target.closest('#cookie-consent-banner') ||
          target.closest('.cookie-consent')
        ) {
          return;
        }

        // Anti-spam debounce (within 400ms on same element)
        const now = Date.now();
        if (lastTarget === target && now - lastClickTime < 400) return;
        lastClickTime = now;
        lastTarget = target;

        const href = (target.getAttribute('href') || target.dataset.href || '').trim();
        const role = target.getAttribute('role') || target.tagName.toLowerCase();
        const rawText = (
          target.innerText ||
          target.textContent ||
          target.getAttribute('aria-label') ||
          target.getAttribute('title') ||
          target.value ||
          ''
        ).trim();
        const text = rawText.replace(/\s+/g, ' ').slice(0, 100);
        const lowerText = text.toLowerCase();
        const lowerHref = href.toLowerCase();
        const currentPath = window.location.pathname;

        const fireClarity = (eventName) => {
          if (consent.current.analytics && typeof window !== 'undefined' && typeof window.clarity === 'function') {
            try {
              window.clarity('event', eventName);
            } catch {}
          }
        };

        // Kept the old call shape so the click rules below read unchanged. Only
        // 'trackCustom' names reach Clarity; nothing goes to any advertiser.
        const fireFbq = (type, eventName) => {
          if (type === 'trackCustom') fireClarity(eventName);
        };

        // A. Phone calls (tel:...)
        if (lowerHref.startsWith('tel:')) {
          const phone = href.replace(/^tel:/i, '').replace(/[^0-9+]/g, '');
          fireFbq('track', 'Contact', {
            content_name: 'Phone Call',
            content_category: 'Contact',
            phone_number: phone,
          });
          fireFbq('trackCustom', 'PhoneCall_Click', {
            phone_number: phone,
            cta_text: text || 'Call',
          });
          return;
        }

        // B. WhatsApp
        if (
          lowerHref.includes('wa.me') ||
          lowerHref.includes('whatsapp.com') ||
          lowerText.includes('whatsapp')
        ) {
          fireFbq('track', 'Contact', {
            content_name: 'WhatsApp',
            content_category: 'Contact',
          });
          fireFbq('trackCustom', 'WhatsApp_Click', {
            cta_text: text || 'WhatsApp',
            destination_url: href,
          });
          return;
        }

        // C. Email (mailto:...)
        if (lowerHref.startsWith('mailto:')) {
          const email = href.replace(/^mailto:/i, '').split('?')[0];
          fireFbq('track', 'Contact', {
            content_name: 'Email Enquiry',
            content_category: 'Contact',
            email: email,
          });
          fireFbq('trackCustom', 'Email_Click', {
            email: email,
            cta_text: text || 'Email',
          });
          return;
        }

        // D. Price List / Brochure / Master Plan / PDF
        if (
          lowerHref.includes('/price-list') ||
          lowerHref.endsWith('.pdf') ||
          lowerText.includes('price list') ||
          lowerText.includes('brochure') ||
          lowerText.includes('master plan') ||
          lowerText.includes('download')
        ) {
          fireFbq('track', 'ViewContent', {
            content_name: text || 'Price List / Brochure',
            content_category: 'Documentation',
            content_type: 'document',
          });
          fireFbq('trackCustom', 'PriceList_Brochure_Click', {
            cta_text: text,
            destination_url: href,
          });
          return;
        }

        // E. Site Visit / Schedule
        if (
          lowerText.includes('site visit') ||
          lowerText.includes('book visit') ||
          lowerText.includes('schedule') ||
          lowerText.includes('book now')
        ) {
          fireFbq('track', 'Schedule', {
            content_name: text || 'Site Visit',
            content_category: 'Booking',
          });
          fireFbq('trackCustom', 'SiteVisit_Click', {
            cta_text: text,
            destination_url: href,
          });
          return;
        }

        // F. Enquiry / Contact CTA
        if (
          lowerText.includes('enquire') ||
          lowerText.includes('get in touch') ||
          lowerText.includes('contact us') ||
          lowerText.includes('contact our team') ||
          lowerText.includes('request') ||
          lowerText.includes('call project team')
        ) {
          fireFbq('track', 'Contact', {
            content_name: text || 'Enquiry CTA',
            content_category: 'CTA',
          });
          fireFbq('trackCustom', 'Enquiry_CTA_Click', {
            cta_text: text,
            destination_url: href,
          });
          return;
        }

        // G. Careers / Apply
        if (lowerText.includes('apply now') || lowerHref.includes('/careers/apply')) {
          fireFbq('trackCustom', 'Job_Apply_Click', {
            cta_text: text || 'Apply Now',
            destination_url: href,
          });
          return;
        }

        // H. All other Buttons & Action links
        const isButton =
          target.tagName === 'BUTTON' ||
          target.getAttribute('role') === 'button' ||
          target.type === 'submit';
        const hasButtonClass = /elementor-button|btn|button|pill|cta/i.test(
          target.className || ''
        );

        if (isButton || hasButtonClass) {
          // Ignore menu toggle hamburger, close icons, carousel navigation arrows
          if (
            /hamburger|menu-mobile|close|dismiss|fab|carouselArrow/i.test(
              target.className || ''
            ) ||
            /open navigation|close navigation/i.test(lowerText)
          ) {
            return;
          }
          if (text && text.length >= 2) {
            fireFbq('trackCustom', 'CTA_Click', {
              cta_text: text,
              cta_role: role,
              destination_url: href || '',
            });
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[CtaClickTracker error]', err);
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [pathname]);

  return null;
}

