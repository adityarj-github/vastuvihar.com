# Consent audit plan

How to check that every consent this site asks for, records and honours works as the notices say. It covers the cookie banner, the Google tag (GTM-M5L3J3ZS), embeds, form consents, marketing opt-out and the consent ledger. **This is an engineering audit, not legal advice.** Legal sign-off items stay in `outstanding-items.md`.

Run it on the **live site (vastuvihar.com)** and on a local production build (`npm run build && npm run start`). The Google tag only loads in production builds, so `next dev` cannot test it.

## 0. Findings already visible in the code (fix or accept before the audit)

| # | Finding | Where | Action |
|---|---|---|---|
| F1 | **`NOTICE_VERSION` was not raised when the Google tag was added.** The cookie notice and policy text change once `TAG_IDS.gtm` is set (Google Ads named, new cookies listed), but a visitor who allowed analytics under `2026-11-v4` before the tag went live is not asked again, and the container loads for them. | `lib/privacy/notices.js:4`, commit `0836ca0` | **Done:** raised to `2026-11-v5` with the consent audit trail |
| F2 | **Docs say there are no trackers.** README §5 says "No trackers found", and `data-inventory.md:47` lists Google Tag Manager as "No". | `docs/dpdp/README.md`, `docs/dpdp/data-inventory.md` | Update both, and the processors list |
| F3 | **Google is not listed as a processor** for the tag. | `data/privacy/processors.js` | Add Google (Tag Manager, Analytics, Ads) with role and contract status "pending" |
| F4 | **The GTM container is outside the code.** Anyone who can publish in the GTM dashboard can add a tag that ignores consent mode (any non-Google tag, such as a pixel or chat widget, unless its consent settings are set). | GTM dashboard | Audit the container (section 3) and restrict publish rights |
| F5 | **Analytics-only visitors still load the full container.** With analytics allowed and advertising refused, Google Ads tags in the container can still send cookieless pings (consent mode "advanced" behaviour). | `lib/privacy/gtm.mjs`, `lib/privacy/tags.js` | Decide with Legal whether cookieless pings are acceptable. If not, set ad tags in GTM to require `ad_storage` ("Require additional consent"), not just rely on built-in checks |
| F6 | **Automated consent tests cannot run.** `npm run test:dpdp` still targets SQLite, not D1. | `scripts/dpdp-compliance-test.mjs` | Port it, or run sections 2 and 5 by hand |

## 1. Scope: every consent point

| Consent | Where it is asked | Where it is stored | Purpose code |
|---|---|---|---|
| Media (YouTube, Vimeo, Maps) | Banner, `ConsentEmbed` "allow" button, policy page | Browser storage + ledger (`recordType: browser`) | `third_party_media` |
| Analytics (Google tag, GA4, Clarity if set) | Banner, policy page | Same | `analytics_cookies` |
| Advertising (Google tag / Google Ads) | Banner, policy page | Same | `remarketing_cookies` |
| Enquiry | Contact section, project enquiry (`ConsentFields form="enquiry"`) | `ConsentRecord` via `/api/leads` | `enquiry_response` |
| Marketing (optional box) | Same forms | `ConsentRecord`, `Lead.marketingConsent`, suppression list | `marketing_communications` |
| Job application | `ApplyForm` | `ConsentRecord` via `/api/careers/apply` | `recruitment` |
| Blog comment | `CommentForm` | `ConsentRecord` via `/api/comments` | `blog_comment` |
| Newsletter | Newsletter signup | `NewsletterSubscriber`, `ConsentRecord` | `newsletter` |
| Withdrawal | Banner, policy page, `/privacy-rights`, marketing opt-out, admin requests | `ConsentRecord` (`WITHDRAWN`), suppression list | all of the above |

## 2. Cookie banner and tag behaviour (browser tests)

Use a fresh browser profile each time, DevTools open on **Application > Cookies / Local Storage** and **Network** (filter `google|doubleclick|clarity|youtube|vimeo`). Use Google Tag Assistant to see consent state.

| # | Test | Expected |
|---|---|---|
| B1 | First visit, before any choice | No request to `googletagmanager.com/gtm.js`, no `_ga`, `_gcl_*`, `_clck` cookies. `dataLayer` has `consent default` all `denied`. Banner opens after ~1 s |
| B2 | Close banner with X, or click the backdrop | Nothing loads. Banner returns on next page load / visit |
| B3 | **Reject Optional** | Nothing loads. Local storage holds `vastu_dpdp_cookie_consent_v1` with all categories `false`. One POST to `/api/privacy/cookie-consent/` returning 201 |
| B4 | **Accept All** | `gtm.js?id=GTM-M5L3J3ZS` loads once. `consent update` all `granted`. `_ga`, `_ga_*`, `_gcl_au` appear. Embeds play |
| B5 | Analytics only | Container loads. `analytics_storage: granted`, all ad keys `denied`. No `_gcl_*`. Check F5: note any request to `googleads`/`doubleclick` |
| B6 | Advertising only | Container loads. `analytics_storage: denied`. No `_ga` |
| B7 | Reload after B4 | Container loads from the `<head>` snippet before hydration, and is not added twice (one `gtm.js` request) |
| B8 | Withdraw (footer "Cookie Settings" > Reject) after B4 | `consent update` to `denied`. `_ga*`, `_gcl_*` cookies deleted on every domain level. A `WITHDRAWN` ledger POST. No further `collect` hits on navigation |
| B9 | Two tabs open, change choice in one | Other tab follows (storage event) |
| B10 | Storage blocked (Chrome: block site data) | No tags load. Withdrawal in the same page view still takes effect |
| B11 | Any `/admin` page, with consent granted | No `gtm.js`, no Clarity, no visitor-activity POSTs |
| B12 | No `<noscript>` GTM iframe in page source | Confirmed absent (it would bypass consent) |
| B13 | Hindi toggle in banner | Hindi text shown. Ledger row has `language: hi` |
| B14 | Banner parity | "Reject Optional" is as visible and as easy as "Accept All". No category is pre-ticked |
| B15 | Console | No CSP errors for Google hosts in `next.config.mjs` (outstanding item D) |
| B16 | Cookie inventory | Every cookie seen in B4 is listed in `COOKIE_INVENTORY` (`lib/privacy/cookieConfig.js`) and the policy. List any extras |

### Embeds

| # | Test | Expected |
|---|---|---|
| E1 | Home hero, project video, branch/contact map, lightbox video, with media not allowed | Poster or placeholder only. No request to `youtube-nocookie.com`, `vimeo`, `google.com/maps` |
| E2 | Click "allow" on one embed | Only `media` saved and logged (`source: embed`). Banner still asks about analytics/advertising |

### Event tracking

| # | Test | Expected |
|---|---|---|
| T1 | Submit an enquiry with analytics + advertising allowed | `generate_lead` / conversion sent with no form data in the payload |
| T2 | Click phone, WhatsApp, email CTAs (`CtaClickTracker`) | Clarity event name only, and only if analytics allowed. No phone number or text in the event |
| T3 | Land with `?gclid=…&utm_source=…` | Click ID value never stored. Ad source saved to session storage only after advertising is allowed, removed on refusal |

## 3. Google Tag Manager container review

Export the live container (Admin > Export Container) and keep the JSON with the audit record.

| # | Check |
|---|---|
| G1 | List every tag, trigger and variable. Each tag maps to a category (analytics or advertising) |
| G2 | Each tag's **Consent settings**: Google tags rely on built-in checks; every non-Google tag has "Require additional consent" set |
| G3 | No Custom HTML tag that sets cookies, reads form fields, or loads third-party scripts without a consent requirement |
| G4 | No tag fires on `/admin` (the snippet already skips it, but confirm no history-change trigger re-fires there) |
| G5 | GA4: IP and data settings, data retention (2 or 14 months), Google signals off unless Legal agrees, no user-ID or PII in parameters |
| G6 | Google Ads: under-18 exclusions and remarketing audience settings (outstanding item C) |
| G7 | Workspace users: who can publish. Limit to named staff, enable 2-step verification, and record the list |
| G8 | Version history: note the live version number. Any later publish needs a re-run of section 2 |

## 4. Consent ledger and server checks

Check in D1 (`npx wrangler d1 execute ... --remote`) or Admin > Privacy & Compliance.

| # | Check | Expected |
|---|---|---|
| L1 | Each banner choice in section 2 | One `ConsentRecord` per answered category, with `browserKey` (hashed), `noticeVersion`, `language`, `source`. No IP, no raw browser ID |
| L1a | Each banner choice in section 2, in Admin > Privacy > **Consent audit** | One `ConsentAuditEvent` row per save: right action, an answer per category (– where not asked), language, IP ending `.0` (or `::` for IPv6), and a notice hash marked "(live)" |
| L2 | Each form submission | `GRANTED` row for the form purpose. Marketing row only if the box was ticked |
| L3 | Opt-out via `/api/privacy/marketing-opt-out` | `Lead.marketingConsent=false`, suppression keys for every linked phone/email, newsletter unsubscribed, `WITHDRAWN` rows |
| L4 | Re-tick marketing on a suppressed number | Suppression wins. No new marketing grant takes effect |
| L5 | Refuse analytics/advertising after browsing | Visitor events for that `browserKey` and category deleted |
| L6 | Rate limit on `/api/privacy/cookie-consent/` | 31st POST in an hour is refused (behind Cloudflare) |
| L7 | Bad input | Invalid `browserId` or empty choices returns 400 |
| L8 | Older leads with no consent record | Count them, and record the decision for outstanding item 16 |

## 5. Notices and documents

| # | Check |
|---|---|
| N1 | Banner text, `ConsentFields` text and `/privacy-policy` describe the same categories, providers, cookies and durations as found in section 2 |
| N2 | Policy names Google (via the Google tag) as a recipient that may process data outside India |
| N3 | `NOTICE_VERSION` matches the wording now live (see F1) |
| N4 | Hindi text matches English in meaning (outstanding item 2) |
| N5 | `data-inventory.md`, `processors.js` and README §5 updated (F2, F3) |

## 6. Evidence and sign-off

For each test keep: date, browser, URL, screenshot of cookies and network, the `dataLayer` dump, and the ledger rows. Store them with the GTM export, and note the git commit and GTM version tested.

| Step | Owner |
|---|---|
| Fix F1 to F3, port or bypass F6 | Developer |
| Sections 2, 4 on local build, then on vastuvihar.com | Developer |
| Section 3 container review | Marketing / whoever owns GTM, with Developer |
| F5 decision, section 5 wording | Legal |
| Record results in `test-report.md` | Developer |

## 7. When to re-run

- Any GTM publish, new tag ID in the environment, or new embed.
- Any change to `lib/privacy/notices.js`, the banner, `tags.js`, `gtm.mjs` or `cookieConfig.js`.
- Every 6 months otherwise, since providers change their cookies.
