# parthkabra.me
My personal website, at https://parthkabra.me

## Codebases
- parthkabra-me-site: the website, in Astro. Builds from an export of the miscfs instance (`scripts/content.mjs`); `npm run dev` serves it at http://hel:2102
  - Hosted on Cloudflare as the Worker `me`: the static build plus `worker/index.ts`, which handles the subscribe form with D1. `npm run cf:dev` runs it locally at http://hel:2104 with a local D1 (`npm run migrate` first; put `NTFY_TOPIC=` in `.dev.vars` so tests don't notify), `npm run cf:preview` uploads a version without sending it traffic, and `npm run cf:deploy` deploys
- content: the miscfs instance `parthkabra-me` (config and actions tracked here), served at https://mecms.hel.misc.page (tailnet only, also http://hel:8003) by the systemd user service `miscfs@parthkabra-me`. Its content root, `content/miscfs-content/`, is its own git repo (https://github.com/ninest/parthkabra.me-content, private) and is ignored by this one; miscfs commits every save there, and the `git-push` action pushes it
- miscfs source: `../miscfs` (https://github.com/ninest/miscfs) — read its AGENTS.md, GLOSSARY.md and docs/ for how miscfs works
## Agents
- Prefix all commits with the agent's name and model, for example "codex(GPT-6.1-sol): ..." or "claude(opus-5.5): ..."
- Story: if the work involves a story to review, post a link to it when you start and finish working so that it is easier to track work
- Commit after finishing a ticket / unit of work
- Links: give every URL served from this machine as `http://hel:<port>/...` (its Tailscale name), so the user can open it from their phone or laptop. Dev servers use ports 2000–2999; 8000+ is reserved for applications.
