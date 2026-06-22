---
title: Creating an AI map maker
description: A map maker application that stores state in the URL, and is agent-native
createdAt: 2026-06-22
categories:
  - blog
  - ai
  - maps
links:
  - title: Map maker tool
    url: /tools/map
  - title: AI map maker tool
    url: /tools/ai-map
  
---
I've always wanted to make a map-making app, a "Google Docs, but for maps". The problem seems to be that no one but me really understands what the use is, so I'm having a hard time convincing people that it's something they (might) need.

## The map tool

Anyways, I thought I might as well build a map tool, but on a smaller scale:

![Map tool showing my favorite places](/images/posts/blog/ai-map-maker/favorite-places.png)

[Click here](https://parthkabra.me/tools/map/?d=p%3Agreen%3APublic%2520Garden%3A42.35394%2C-71.0706%7Cp%3Agreen%3ABoston%2520Common%3A42.35513%2C-71.06566%7Cp%3Ared%3AAMC%3A42.35323%2C-71.06409%7Cp%3Ayellow%3AEsplanade%2520entrance%3A42.35206%2C-71.08996%7Cl%3Agreen%3ACommonwealth%2520Ave%2520Mall%3A42.34954%2C-71.08699%3B42.35131%2C-71.08041%3B42.35365%2C-71.07168&v=2&hl=1) to open this specific map.

It's simple tool that lets you do a few things:
- Create points and lines with a name and color
- Snap points to their walking / cycling / driving path
- Hide all labels to keep the map clean (like I've done in the screenshot)
- Share the map just be copying and sharing the URL

The last feature is important. No accounts needed to share a map, just share the link. The link is pretty long and looks like this for the above map:


https://parthkabra.me/tools/map/?d=p%3Agreen%3APublic%2520Garden%3A42.35394%2C-71.0706%7Cp%3Agreen%3ABoston%2520Common%3A42.35513%2C-71.06566%7Cp%3Ared%3AAMC%3A42.35323%2C-71.06409%7Cp%3Ayellow%3AEsplanade%2520entrance%3A42.35206%2C-71.08996%7Cl%3Agreen%3ACommonwealth%2520Ave%2520Mall%3A42.34954%2C-71.08699%3B42.35131%2C-71.08041%3B42.35365%2C-71.07168&v=2&hl=1

Ugly, but the good thing is that **your AI agents can create it for you**.

I created another tool called [AI Map](/tools/ai-map) that lets AI create the map for you. Just describe what you want to see, and the tool will make a ChatGPT or Claude prompt for you.

![AI demo with the prompt "the boston orange line when it was an elevated line above washington st and now" to make a map](/images/posts/blog/ai-map-maker/ai-demo.png)

Clicking on "Open in ChatGPT" lets you run the prompt:

![What happens when you click open in chatgpt, and see the output result that is a long link](/images/posts/blog/ai-map-maker/in-chatgpt.png)

The problem is that the answer contains a suspiciously long URL, and ChatGPT does hallucinate locations. I have realized that it tries to confirm them, but not always.

The output map looks pretty good though:

![output AI map of the old elevated orange line alongside the new orange line](/images/posts/blog/ai-map-maker/orange-line.png)

[Click here](https://parthkabra.me/tools/map/?v=2&d=l%3Agray%3AFormer%2520Washington%2520St%2520El%3A42.34395%2C-71.066%3B42.3363%2C-71.0772%3B42.3292%2C-71.0842%3B42.31591%2C-71.0982%3B42.30964%2C-71.10516%3B42.30046%2C-71.11333%3AnDover%3BNorthampton%3BDudley%252FNubian%3BEgleston%3BGreen%2520%28old%29%3BForest%2520Hills%2520%28old%29%7Cl%3Ayellow%3ACurrent%2520Orange%2520Line%3A42.35219%2C-71.06269%3B42.34964%2C-71.06386%3B42.34748%2C-71.07459%3B42.34161%2C-71.08331%3B42.33619%2C-71.0895%3B42.33131%2C-71.09561%3B42.32311%2C-71.09981%3B42.31731%2C-71.10419%3B42.31042%2C-71.10763%3B42.29881%2C-71.11489%3AnChinatown%3BTufts%2520Med%3BBack%2520Bay%3BMass%2520Ave%3BRuggles%3BRoxbury%2520Crossing%3BJackson%2520Sq%3BStony%2520Brook%3BGreen%2520St%3BForest%2520Hills&hl=1) to see this map.

## Technical stuff

### The map tool

Honestly, this was surprisingly easy. I made a decision to raw dog javascript rather than use React, ShadCN, and [MapCN](https://mapcn.vercel.app), and that was a great decision. The entire tool is in one file, and 95% of it was written by Claude and Codex. [Agent browser](https://agent-browser.dev) is great for testing web apps.

I've always said this: what's good for humans is also good for agents. The fact that the entire map is stored in the URL meant that my agent could do some testing and return the exact problematic map. Or I could paste in a few map links to give my agent more context.

- Me: Please do some testing and find bugs
- Claude: Sure. Here's a map with issues: `https://parthkabra.me/tools/map?v=...`
- Me: Great, that is an issue, please fix it. Also check out this map `https://parthkabra.me/tools/map?v=...` I have 10 points but I'm only seeing 5

### The AI map maker

This was a lot easier, just have AI make documentation on how to build a URL, and make it accessible: https://parthkabra.me/tools/map/agents. I wanted to use https://parthkabra.me/tools/map/agents.md, but weirdly, ChatGPT was unable to fetch the URL ending in `.md`.  I wonder if it's not supposed to follow "untrusted" prompts.

## More AI tools like this?

With how well this worked (for me), I wonder why we don't see more AI tools that are just instructions + fancy data visualization.