// What this deployment actually has switched on. A category is only offered, and the
// policy only mentions it, when its tag ID is set. Safe to import from client code.
import { COOKIE_CATEGORY_TEXT, PURPOSES } from './notices';
import { gtmContainerId } from './gtm.mjs';

// Where the visitor's cookie choice is kept. Read before hydration by the Google tag snippet.
export const CONSENT_STORAGE_KEY = 'vastu_dpdp_cookie_consent_v1';

// The anonymous consent ID, also kept in a first-party cookie. Set when a choice is first saved.
export const CONSENT_ID_COOKIE = 'vv_consent_id';
export const CONSENT_ID_MAX_AGE = 365 * 24 * 60 * 60;

// A malformed ID is treated as unset, because these values end up in script URLs.
const tagId = (value, pattern) => {
  const id = (value || '').trim();
  return pattern.test(id) ? id : null;
};

// Next.js only inlines NEXT_PUBLIC_ values written out in full like this.
export const TAG_IDS = {
  ga4: tagId(process.env.NEXT_PUBLIC_GA4_ID, /^G-[A-Z0-9]{4,20}$/),
  googleAds: tagId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID, /^AW-\d{5,20}$/),
  googleAdsLeadLabel: tagId(process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL, /^[\w-]{4,40}$/),
  clarity: tagId(process.env.NEXT_PUBLIC_CLARITY_ID, /^[a-z0-9]{6,20}$/),
  // The Google tag container. Its tags run under Google consent mode, so it needs both
  // the analytics and the advertising choice to be offered.
  gtm: gtmContainerId(),
};

export const CATEGORY_PURPOSES = {
  media: PURPOSES.MEDIA,
  analytics: PURPOSES.ANALYTICS,
  advertising: PURPOSES.ADVERTISING,
};

export const COOKIE_PURPOSES = Object.values(CATEGORY_PURPOSES);

// The tag cookies this site knows about, by category. Only their names are ever logged.
export const TRACKED_COOKIES = {
  analytics: /^(_ga|_ga_.*|_gid|_gat.*|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)$/,
  advertising: /^(_gcl_.*)$/,
};

export const AD_CHANNELS = ['google_ads', 'meta', 'campaign'];

// What the visitor activity log accepts from each tag, and the categories it can run under.
export const TAG_EVENTS = {
  google_tag: { categories: ['analytics', 'advertising'], events: ['script_loaded', 'script_failed'] },
  google_analytics: { categories: ['analytics'], events: ['configured', 'generate_lead'] },
  google_ads: { categories: ['advertising'], events: ['configured', 'page_view', 'conversion'] },
  microsoft_clarity: { categories: ['analytics'], events: ['script_loaded', 'script_failed', 'initialised'] },
};

export const OFFERED_CATEGORIES = [
  'media',
  ...(TAG_IDS.ga4 || TAG_IDS.clarity || TAG_IDS.gtm ? ['analytics'] : []),
  ...(TAG_IDS.googleAds || TAG_IDS.gtm ? ['advertising'] : []),
];

const advertiserNames = (language) => {
  const names = [(TAG_IDS.googleAds || TAG_IDS.gtm) && 'Google Ads'].filter(Boolean);
  return names.join(language === 'hi' ? ' और ' : ' and ');
};

export function categoryText(category, language = 'en') {
  const { name, description } = COOKIE_CATEGORY_TEXT[category][language];
  return { name, description: typeof description === 'function' ? description(advertiserNames(language)) : description };
}

// Every cookie or storage item the site or its enabled tags are known to use. Providers
// can change theirs, so re-check this list against the live site before relying on it.
const COOKIES = [
  { name: CONSENT_STORAGE_KEY, provider: 'Vastu Vihar', category: 'necessary', type: 'Browser storage', purpose: 'Remembers your cookie choices and a random consent ID', duration: 'Until you clear it' },
  { name: CONSENT_ID_COOKIE, provider: 'Vastu Vihar', category: 'necessary', type: 'Cookie', purpose: 'Holds the random consent ID that your saved cookie choices are recorded against', duration: '1 year' },
  { name: 'vv_admin_session', provider: 'Vastu Vihar', category: 'necessary', type: 'Cookie', purpose: 'Keeps authorised staff signed in. Not set for visitors', duration: '10 hours' },
  { name: 'YouTube, Vimeo and Google Maps cookies', provider: 'Google, Vimeo', category: 'media', type: 'Third-party cookies', purpose: 'Set by these services when their content loads', duration: 'Set by the provider' },
  ...(TAG_IDS.googleAds
    ? [{ name: 'vastu_ad_source_v1', provider: 'Vastu Vihar', category: 'advertising', type: 'Browser storage', purpose: 'Remembers the advert or campaign that brought you here during this visit', duration: 'Until you close the tab' }]
    : []),
  ...(TAG_IDS.ga4 || TAG_IDS.gtm
    ? [
        { name: '_ga', provider: 'Google', category: 'analytics', type: 'Cookie', purpose: 'Tells visitors apart in Google Analytics', duration: 'Up to 2 years' },
        { name: '_ga_*', provider: 'Google', category: 'analytics', type: 'Cookie', purpose: 'Keeps track of the current visit in Google Analytics', duration: 'Up to 2 years' },
      ]
    : []),
  ...(TAG_IDS.clarity
    ? [
        { name: '_clck', provider: 'Microsoft', category: 'analytics', type: 'Cookie', purpose: 'Tells visitors apart in Microsoft Clarity', duration: 'Up to 1 year' },
        { name: '_clsk', provider: 'Microsoft', category: 'analytics', type: 'Cookie', purpose: 'Joins the page views of one visit in Microsoft Clarity', duration: '1 day' },
        { name: 'Microsoft cookies (such as CLID, MUID)', provider: 'Microsoft', category: 'analytics', type: 'Third-party cookies', purpose: 'Set by Microsoft Clarity on Microsoft domains', duration: 'Set by the provider' },
      ]
    : []),
  ...(TAG_IDS.googleAds || TAG_IDS.gtm
    ? [
        { name: '_gcl_au', provider: 'Google', category: 'advertising', type: 'Cookie', purpose: 'Measures advert conversions', duration: 'Up to 90 days' },
        { name: 'Google Ads cookies (such as IDE)', provider: 'Google', category: 'advertising', type: 'Third-party cookies', purpose: 'Remarketing and advert measurement, on Google domains', duration: 'Set by the provider' },
      ]
    : []),
];

export const COOKIE_INVENTORY = COOKIES;
