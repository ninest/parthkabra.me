# Parth Kabra's Personal Website

## Code style

- All functions should have a concise comment explaining what the function does if necessary, and if it's complicated, and example or two

## Frontend

### Astro components

- all JS selectors should be prefixed with `$`, for example, `const $input = document.getElementById("input")`

### Internal links

All internal URLs go through `src/utils/links.ts`. Never hardcode internal hrefs.

- Static routes (`/`, `/all`, `/projects`, `/work`): use `routes.*`
- Per-collection links: use `getPostUrl`, `getProjectUrl`, `getWorkUrl`, `getCategoryUrl`, `getPageUrl`, `getMicroblogUrl`
- Search and `resolveRelated` both go through this file — keep it that way

When adding a new route, add its helper here first, then use it from pages/components.

### Related content

Content items can reference related items across collections via `related` in frontmatter using `prefix:id` strings.

Prefixes: `post`, `microblog`, `project`, `work`, `page` (mapped in `src/utils/related.ts`).

When adding a new collection or detail page:
1. Add its prefix to `COLLECTION_MAP` and `COLLECTION_LABELS` in `src/utils/related.ts`
2. Add its URL pattern to `getContentUrl()` (and a per-collection helper) in `src/utils/links.ts`
3. Add its entries to the valid ID set in `src/utils/validate-related.ts`