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

### Links and related content

Per-item external links and "related" cross-references live as plain markdown in the body, not frontmatter:
- Posts/projects/work/pages/tools: a `Links:` / `Related:` block at the **top** of the body.
- Microblog: the same block at the **bottom** of the body.
- Multiple entries are comma-separated; `Links:` and `Related:` lines are separated by a trailing backslash (` \`).

There is no `links`/`related` frontmatter field. The only structured `prefix:id` references remaining are microblog `thread`/`inReplyTo` and collection `items`, resolved via `resolveRelated`/`parseRelatedString` in `src/utils/related.ts`.

When adding a new collection referenced by `thread`/`inReplyTo`/`items`:
1. Add its prefix to `COLLECTION_MAP` and `COLLECTION_LABELS` in `src/utils/related.ts`
2. Add its URL pattern to `getContentUrl()` (and a per-collection helper) in `src/utils/links.ts`
3. Add its entries to the valid ID set in `src/utils/validate-related.ts`

## Agents and harness
- Be as concise as possible, and sacrifice grammar for  the sake of concision
- While planning:
  - Interview me relentlessly about every aspect of this plan until we reach a shared understanding; walk down each branch of the design tree, resolving dependencies between decisions one-by-one
  - For each question, provide your recommended answer; ask the questions one at a time
  - If a question can be answered by exploring the codebase, explore the codebase instead
