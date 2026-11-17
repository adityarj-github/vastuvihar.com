# Global CSS cleanup — audit

## Inputs
- User-shared original CSS (Pasted text, November 17 2026): `styles/globals.css`, 40,729 split-lines, 958,113 bytes, SHA-256 `ae2e3bb74d197e5b6b882773e162c15377be854fe13a8410074f31778cb1afa9`.
- Supplied component/repository ZIP snapshots: 220 JS/JSX/TS/TSX files used to build a conservative selector inventory.
- Homepage-specific layout and widget CSS migrated from global into `app/home-foundation.css` and `components/home/*.css`.

## Results
- Original physical line count (`wc -l`): 40,728.
- Reduced global CSS physical line count (`wc -l`): 2,775 (includes comments and the three legacy page imports).
- Lines removed by *pruning plus formatting*: **37,953**.
- Original bytes: 958,113.
- Reduced bytes: 321,740 (~66.4% reduction).
- Original CSS rules: 7,248.
- Rules fully removed after class-reference audit: **4,939**.
- CSS rules retained: 2,309.
- All 9 font-face definitions retained; keyframe definitions and known dynamic markup families retained.
- Other CSS file imports: `home.css` removed; `careers.css`, `contact.css`, `projects.css` remain temporarily for compatibility; `blog.css` not retained because the imported file was not in the supplied repository snapshot and blog now has local styles.

**Interpretation:** Most of the dramatic line-count reduction comes from both removing unreferenced CSS rules and compacting the remaining declarations onto fewer lines. The figure 37,953 is not a claim that 37,953 individual source lines were provably unused. The actual selector audit removed 4,939 whole rules.

## Still needed / intentionally left intact
- Theme reset, typography, spacing, accessibility focus, responsive shared UI styles.
- Font faces, custom Spaciaz icon glyphs and shared button styling.
- Navigation menus (including animation/click behaviors), footer, dropdowns and mobile menu.
- WordPress-generated blog markup, forms, carousel/swiper styles, gallery/lightbox, Google Maps consent, and other dynamic/plugin class families.
- Legacy Elementor selectors referenced by shared and unrefactored pages. Homepage itself no longer uses Elementor classes.

## Caution
This output is a **candidate reduction** based on the supplied snapshots, not a guaranteed complete deletion for a different/current project tree. New pages, dynamic classname composition, imported CSS, and third-party scripts may require retained selectors. Do not replace your existing global CSS unless the source hash matches or you have merged divergent changes. Validate the entire site after installing.
