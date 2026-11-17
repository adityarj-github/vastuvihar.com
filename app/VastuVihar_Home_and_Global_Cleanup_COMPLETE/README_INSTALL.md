# Vastu Vihar — Homepage Elementor-free migration + global CSS audit

The homepage is migrated to its own CSS. **Install the homepage changes first, then test the reduced global stylesheet separately.** Do not remove CSS from your actual project without a backup.

## Summary

- Homepage route: `app/page.jsx`, with no Elementor IDs, JSX data attributes or Elementor runtime.
- Shared homepage layout: `app/home-foundation.css` and `app/home.css`.
- All nine homepage sections: local JSX/TSX and scoped CSS in `components/home/`.
- Standalone homepage calls to action use the existing `components/common/VVArrowButton` and retain its animation.
- Homepage entry animations and visible numeric counters use `components/home/HomeMotion.jsx`.
- Fonts, Spaciaz icon font classes, carousel hooks, privacy controls and other shared components are not renamed/removed.
- Root layout is not replaced, because other site routes still depend on the global theme.

## Install in two stages

1. Commit or back up your working project first. Extract the **homepage ZIP** into the root of your Next.js project, preserving paths.
2. Ensure `components/common/VVArrowButton`, `components/common/StaticPill`, and existing shared navigation/forms are already present (they are NOT replaced by this package).
3. Verify your original home page interactions including media consent, video tabs, brand ticker, model cards, scroll reveal, counters, blog carousel, and `VVArrowButton`.
4. Before the global CSS swap, run:

   ```sh
   sha256sum styles/globals.css
   ```

   The cleaned global stylesheet was generated from the user-provided stylesheet with SHA-256 `ae2e3bb74d197e5b6b882773e162c15377be854fe13a8410074f31778cb1afa9`. If your local file differs, **DO NOT overwrite it blindly**. Merge your newer styles or re-run a dependency audit on the current version.
5. Save a local backup of your stylesheet. Install the separate **global CSS ZIP** to replace `styles/globals.css`. The ZIP includes `styles/globals.backup.original.css` for recovery.
6. The reduced file temporarily keeps imports for `styles/pages/careers.css`, `contact.css` and `projects.css` as compatibility bridges. Remove those imports only after all related pages and any subroutes have been checked. The old `styles/pages/blog.css` import was intentionally removed because it was missing from the supplied repository ZIP and the Blog page has local CSS.
7. Run the actual full build (`npm run build` or your repository's equivalent), then review: `/`, `/about-us/`, `/blog/`, `/category/.../`, `/careers/`, `/careers/apply/`, `/contact/`, `/contact/branch-contact/`, `/contact/site-contact/`, `/projects/`, `/projects/[slug]/`, `/core-values/`, `/faqs/`, `/gallery/`, `/cities/`, `/price-list/`, privacy pages and admin. Test hover/focus, responsive layouts, menus, modal and gallery controls, forms, consent and tracking.
8. After confirming no imports or references remain, you may delete `styles/pages/home.css`. Run `rg 'pages/home\.css|styles/pages/home\.css' . --glob '!node_modules/**' --glob '!.next/**'` before deletion. Do not delete any other page CSS merely because this archive lacks an import.
9. If a page breaks with the pruned CSS, restore the backup (`cp styles/globals.backup.original.css styles/globals.css`) and isolate the missing selector. This is a **reviewed candidate**, not a verified build of your entire application.

## Important caveats

- The global stylesheet was pruned using static JSX/TSX/JS/TS class references across 220 source files from the supplied repository snapshot and the additional components ZIP. Classes assembled dynamically, inserted by CMS content or external scripts may not appear in a static scan. Many known dynamic CSS families were retained, but an end-to-end production build and browser test remains necessary.
- `app/layout.jsx` and other shared components may still use `elementor-kit-4`, `elementor-default` or other legacy tokens. They are deliberately left in place during this stage until the other routes can be independently verified.
- Syntax checks and a simplified CSS/DOM browser comparison at 1440, 1024 and 390px matched the original nine homepage section bounds. No horizontal overflow was found at 1440, 1024, 768, 390 and 320px. These are structural previews, not a complete live Next.js build or pixel-for-pixel screenshots with real assets.

See `GLOBAL_CSS_AUDIT.md` for exact removal counts and remaining dependencies.
