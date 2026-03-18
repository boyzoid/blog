---
name: Theme redesign 2026-03
description: Blog was redesigned from Chirpy sidebar layout to clean top-nav minimalist theme in March 2026
type: project
---

Completed a full theme redesign switching from a dark-purple sidebar (Chirpy-inspired) layout to a clean, minimalist top-nav layout.

**Why:** User wanted something clean, crisp, and minimalist with proper dark/light mode and Algolia search.

**How to apply:** Be aware of the new layout architecture when making future changes — there is no longer a sidebar; navigation is in the sticky top nav.

Key decisions made:
- **Accent color:** NY Giants helmet blue (#0B2265), mapped to `giants-800` in Tailwind config. Dark mode uses `giants-300` (#748ec3) for legibility.
- **Layout:** Replaced left-sidebar grid with a sticky top nav. Content is full-width with an optional right aside (TOC + recents) on xl screens.
- **Dark mode:** Fully implemented — inline anti-FOUC script in head.njk reads `localStorage` and `prefers-color-scheme`. Toggle button (sun/moon) in nav calls `toggleDarkMode()`. Tailwind `darkMode: 'class'` is active.
- **Colors:** Tailwind v2 (not v3) — uses `gray-*` not `zinc-*`. Giants blue palette added as `giants` in tailwind.config.js.
- **Algolia search:** Code exists in src/search.js but is disabled (`enabled: false` in siteconfig.js). User will provide creds later.
- **Scroll:** Window-level scroll events (was #right-area container scroll). scrollToTop uses window.scrollTo.
- **Files changed:** tailwind.config.js, assets/css/site.css (full rewrite), content/_includes/base.njk (full rewrite), content/_includes/head.njk (anti-FOUC script), content/_includes/post.njk, content/_includes/postlist.njk, content/_includes/recents.njk, content/_includes/toc.njk, content/index.njk, content/archive.njk, src/ui.js, src/index.js.
