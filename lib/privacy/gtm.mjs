// The Google tag (Google Tag Manager container) placed at the top of <head> on every page.
// Shared by next.config.mjs (security policy), cookieConfig.js and the root layout.
//
// Production builds use DEFAULT_GTM_ID unless NEXT_PUBLIC_GTM_ID is set. Set it to an
// empty string to switch the tag off. `next dev` and local Cloudflare builds never load it.
export const DEFAULT_GTM_ID = 'GTM-M5L3J3ZS';
export const GTM_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
export const gtmScriptUrl = (id) => `https://www.googletagmanager.com/gtm.js?id=${id}`;

// Next.js only inlines NEXT_PUBLIC_ values written out in full like this.
export function gtmContainerId(setting = process.env.NEXT_PUBLIC_GTM_ID, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv !== 'production') return null;
  const id = (setting === undefined ? DEFAULT_GTM_ID : setting).trim();
  return GTM_PATTERN.test(id) ? id : null;
}

/**
 * Google's snippet, with two changes so it keeps to the cookie notice: consent starts as
 * the visitor's saved choice (denied if there is none), and the container itself is only
 * fetched once analytics or advertising has been allowed. If it has not, lib/privacy/tags.js
 * fetches it the moment the visitor allows either. Never runs in the admin area.
 */
export function gtmSnippet(id, storageKey, noticeVersion) {
  const args = [id, storageKey, noticeVersion, gtmScriptUrl(id)].map((value) => JSON.stringify(value)).join(',');
  return `(function(w,d,id,key,version,src){
if(w.location.pathname.indexOf('/admin')===0)return;
w.dataLayer=w.dataLayer||[];
w.gtag=w.gtag||function gtag(){w.dataLayer.push(arguments);};
var c=null;try{c=JSON.parse(w.localStorage.getItem(key)||'null');}catch(e){}
if(!c||c.version!==version)c={};
var a=c.analytics===true?'granted':'denied',ad=c.advertising===true?'granted':'denied';
w.gtag('consent','default',{analytics_storage:a,ad_storage:ad,ad_user_data:ad,ad_personalization:ad});
w.gtag('js',new Date());
if(a==='granted'||ad==='granted'){var s=d.createElement('script');s.async=true;s.src=src;d.head.appendChild(s);}
})(window,document,${args});`;
}
