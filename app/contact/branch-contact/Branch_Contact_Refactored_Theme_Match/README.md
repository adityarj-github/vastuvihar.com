# Vastu Vihar - Branch Contact page refactor

Extract this ZIP into the **root of your Next.js project** and keep the folder structure.

## Files included

- `app/contact/branch-contact/page.jsx`
- `app/contact/branch-contact/branch-contact.module.css`
- `components/contact/BranchContactView.jsx`
- `components/contact/BranchContactView.module.css`
- `components/contact/ContactHeader.jsx` (backwards-compatible addition of optional `title`/`parentCrumb` props)
- `components/contact/ContactHeader.css` (unchanged from the earlier Contact page refactor, included for completeness)

## Styling / behavior

- Branch page reuses `ContactHeader` and its original `/contact.webp` hero background, breadcrumb positioning and curved bottom edge.
- Main `/contact/` page stays visually unchanged: `ContactHeader` default title is still "Get in touch" with the Home > Get in touch breadcrumb.
- Rounded search, state, and city inputs; brand-blue focus ring; rounded filter panel and contact cards.
- Hover card fill remains blue but the old drop shadow and translateY are removed.
- Primary actions use the *existing* shared `components/common/VVArrowButton` component. No new arrow component or changes to it are included.
- Functional branch search, state/city filters, accordion, person/phone links, map consent and copy-link actions are retained.
- No old Elementor IDs or old `styles/pages/contact.css` import are used on this page.
- The global stylesheet remains unchanged. Please do not remove the legacy global/Contact styles until the Site Contact page and other dependent routes have been migrated.

## Requirements

The following existing project files must remain installed:

- `components/common/VVArrowButton.jsx` and `VVArrowButton.css`
- `components/privacy/ConsentEmbed`
- `data/branch-contacts`
- `components/PageLayout`, `components/JsonLd`, `lib/metadata`
- Public asset `/contact.webp`

## Validation performed

- JSX parsed with the TypeScript JSX parser; CSS parsed with PostCSS.
- CSS Module class references checked against class definitions.
- Static Chromium layout tests at 1649px, 1440px, 1024px, 768px, 390px, and 320px showed no document-level horizontal overflow.
- Hover styling measured with no drop shadow, no card movement, and the blue reveal completing.
- Input focus styling measured with the blue 3px focus ring.

The validation used a static layout simulation with sample branch records and the provided global CSS, **not** a full Next.js build or live application interaction test.
