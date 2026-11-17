# Awards & Recognition refactor

Copy the folders inside this ZIP into the root of the Vastu Vihar Next.js project.

## Files
- `app/our-awards/page.jsx` — removes unused Breadcrumb import and all Elementor wrappers; preserves metadata, PageLayout, and breadcrumb JSON-LD.
- `app/our-awards/our-awards.css` — route-scoped box-sizing and background.
- `components/awards/AwardsHeader.jsx` + `AwardsHeader.module.css` — retains hero image `/awards/hero.webp`, existing intro, breadcrumbs, and a white curved band that truly overlaps the hero.
- `components/awards/AwardsList.jsx` + `AwardsList.css` — imports the unchanged `data/awards.js`, retains award images and original hover opacity; scoped layout and 2-column mobile.

## Notes
- No new button was added, so the common `VVArrowButton` is not used or changed.
- Keep existing `data/awards.js` and your files in `public/awards/`.
- `global.css` remains untouched. Do not remove old global rules until the final cleanup.
- No direct server/database operations have changed.
