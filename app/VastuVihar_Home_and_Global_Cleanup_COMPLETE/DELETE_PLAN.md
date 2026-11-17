# CSS deletion plan — do not blindly delete files

### Safe only after installing the migrated homepage and running a full build
- `styles/pages/home.css` — the homepage now imports `app/home-foundation.css`, `app/home.css` and its local component styles. Verify with ripgrep that no other page imports the old CSS.
- Obsolete Elementor *homepage-only* rules in the prior `styles/globals.css` — these are removed from the proposed slimmed stylesheet, with the original file backed up.

### Retain temporarily
- `styles/globals.css` — REPLACE with the audited candidate, do not delete outright.
- `styles/pages/careers.css`, `styles/pages/contact.css`, `styles/pages/projects.css` — still imported by the proposed globals CSS as a compatibility bridge pending route-by-route verification.
- `styles/pages/blog.css` if it exists in your live project — check its remaining imports, especially category/blog routes, before deleting. It was absent from the ZIP inventory.
- `components/common/VVArrowButton` and its CSS, `StaticPill`, all shared layout/navigation/footer CSS, icon-font assets, and legacy root body classes.
- Shared Elementor-related styles still required by unrefactored pages and dynamic markup until those are verified.

### Not decidable from the uploaded snapshots
- Old `components/layout/` duplicates, `components/common/` barrels, all animation/utility files — use a project-wide import/reference graph and a full Next.js build before deleting.

### Suggested commands

```sh
rg -n 'pages/home\.css|styles/pages/home\.css' app components styles
rg -n 'elementor-|elementor-kit|data-elementor|e-con' app components
npm run build
```

Make a git commit before deleting any file. Save one backup of your original `styles/globals.css`, and only promote the reduced stylesheet after route-by-route testing.
