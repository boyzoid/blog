---
name: Algolia search pending
description: Algolia search is coded but disabled — waiting for user to provide credentials
type: project
---

Algolia search integration exists but is currently disabled in `content/_data/siteconfig.js` (`algoliaSearch.enabled: false`).

**Why:** User wants to add Algolia search but needs to provide credentials first.

**How to apply:** When user provides Algolia credentials, enable search by:
1. Set `enabled: true` in siteconfig.js
2. Set env vars: `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_API_KEY`, `ALGOLIA_SITE_ID` in a .env file
3. The search UI (input box) will auto-appear in the top nav when enabled — it's already wired up in base.njk via the `siteconfig.algoliaSearch.enabled` conditional.
4. The search reads from an index — confirm the index name with the user (it's currently using `process.env.ALGOLIA_SITE_ID` as the index in src/search.js).
