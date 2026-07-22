---
title: "My favorite developer tools in 2026"
description: "Notes on the web frameworks, hosting platforms, editors, and AI coding tools I enjoy using as a fullstack developer in 2026"
createdAt: 2026-04-20
updatedAt: 2026-04-20
categories: [blog]
---

Related: [My favorite tech in 2025](/blog/tech-review-mid-2025)

```component:alert
variant: secondary
---
⚠️ These are some of my unfiltered notes on frameworks and tools I’ve used, moved away from, or want to try next.
```

TLDR: I'm leaning more toward Astro, Cloudflare, Railway, and terminal-based AI coding agents. I still think Next.js, Vercel, and Cursor are good tools, but they are no longer my default choices for personal projects.

## Web frameworks

- Astro: probably still my favorite framework for content-heavy and mostly static sites
  - Way simpler than Next and Tanstack Start
  - Probably has the best integrations with Cloudflare
  - It is the kind of framework where I feel like I spend more time building the site and less time thinking about the framework
- Tanstack Start: amazing framework that I'd choose over Next for a lot of app-like projects
  - The main thing holding me back is file-based routing
  - It's possible to go with config based routing, but I found the docs a little lacking. They're probably much better now though
  - Switching from Next to Tanstack Start felt like a night and day difference for local development speed
- Next: still powerful, but not my default anymore
  - It's been too slow for me
  - I often feel like I spend too much time working around the framework instead of with it

Some frameworks I look forward to using

- [Remix v3](https://github.com/remix-run/remix): I've always wanted Rails but for JS, and this seems to be the closest we'll ever get
  - It seems very batteries-included but also divided into packages, so it should be easy to use just what you need
  - I do wonder about its adoption, though I guess it should be fine since each package has zero dependencies
- [RedwoodSDK](https://rwsdk.com/): This seems really interesting as I'm getting deeper into Cloudflare
  - I'm excited about the [realtime features](https://rwsdk.com/realtime) like `useSyncedState`

## Hosting

- Railway: probably my default for backend-heavy personal projects
  - I do wish it was easier for me (my agent) to do things without the web UI
  - I wish there was a better local development experience
  - I do believe that they are working on solutions for both of these
  - I wish their Postgres and S3 had better data viewers. AFAIK, there's currently no way to browse your Railway S3 bucket without an external app
- Cloudflare: seems like an amazing all-in-one solution, with some vendor lock-in though
  - I like how they are making things local and AI-first. As it turns out, a good DX for agents translates to a good DX for humans!
  - I prefer Cloudflare Workers for static/slightly dynamic sites way more than Vercel now
  - I want to explore Durable Objects, R2, and D1
- Vercel: unfortunately, I'm moving off for personal projects
  - Nothing wrong with Vercel, but I feel I get more out of Railway and Cloudflare

## Editors and AI tools

- Cursor: very open to moving away from it
  - I was on the student plan, but the included $20 would get over within a day or so of "regular" work. I realized I had to switch when I ended up using $400 in a single month
  - It's buggy
  - We use Cursor at work, and I prefer terminal agents over a sidebar. I find it easier to chat with multiple agents at once
- Claude Code and Codex
  - I think $20 for Claude Code and $20 for Codex work reasonably well for my personal use
  - $20 of Codex takes me further than $20 of Claude Code
- Codex/Claude Code desktop app
  - I used them and loved them, but ended up forgetting about them and going back to the TUI versions
- Zed: I want to explore it this year
