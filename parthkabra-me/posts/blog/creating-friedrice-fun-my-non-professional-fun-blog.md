---
title: Creating friedrice.fun, my non-professional fun blog
description: How I used Obsidian and tons of AI to make friedrice.fun in an hour
createdAt: 2026-06-23
categories:
  - blog
  - ai
  - astro
  - obsidian
links:
  - title: friedrice.fun
    url: https://friedrice.fun
---
On Jun 3, 2026, I registered a new domain, [friedrice.fun](https://friedrice.fun). 

By Jun 5, I had a fully optimized blogging set up that mean I could write posts from my phone or laptop, and have them auto-published. Zero extra coding for things like addinga new "directory" pages, or customizing sidebars. And all of this was done in under 2 hours of passive "agentic" (vibe) coding while I was eating [Bettergoods Ultra Thin Pepperoni and Ricotta Pizza](https://friedrice.fun/bettergoods-ultra-thin-pepperoni-and-ricotta-pizza/).

![screenshot of the website https://friedrice.fun](/images/posts/blog/creating-friedrice-fun/friedrice-fun.png)


## So what? This site is super simple

It is very simple, but there is a bit going on behind the scenes:

- **Image loading**. By default, image loading creates layout shift, especially if you scroll down and an image loads above you. I added lazy loading and conversion from PNG/JPG to WebP to make them slightly faster. I also added a blurred image as a placeholder so it looks slighly nicer as it's loading. And there's a script to add width/height explicitly
- **Image thumbnails**. Most pages, especially the food ones, have a tiny image thumbnail. This is a 64x64 pre-generated image. I was originally using the same image on the page and for the thumbnail, just that the thumbnail has the background removed. But this made loading extremely slow.
- **Obsidian vault support**. Obsidian the CMS, so I couldn't rely on Astro content. I had to build a Remark plugin to support "``[[``" wiki-links and Obsidian tags
- **Obsidian bases**. Support a subset of Obsidian bases. This makes it easy to make new directory pages without any custom code.
- **Image grid support**. I love how the Obsidian Minimal theme can support [image grids](https://minimal.guide/image-grids), so I added that to the markdown parser too. See it in action [on this page](https://friedrice.fun/lazy-mexican-chicken-bowl-2026/), with the images on the same row rather than one under the other.

*Note that when I say "I made", I mean "My agent and I made".*

## The publishing flow

This is my flow for adding a new page after dining out / cooking something new. I wanted to try to remove all the friction I could. The more friction I have, the less likely I am to keep it updated.

- Eat the food. Preferably take pictures before I finish eating.
- Open my phone, open Obsidian, and make a note for that food item. I keep everything in one folder, so there's no need to figure out where to put the file. I just need to give it the appropriate tag like `#dining-out` or `#cooked-meal`.
- Write. Paste the images I took
- Use Google Photos / Apple Photos to copy the image without the background. I'm so glad that this is so easy now. So I can make the icon/thumbnail image without having to open my laptop
- Wait for it to publish.

I have the Obsidian vault on iCloud, so it syncs between my Mac and iPhone. 

- Thrice a day, the vault is pushed to a GitHub repo. I used [Bun's new built-in cron](https://bun.com/docs/runtime/cron) for this.
- The content repo dispatches an action to the code repo to trigger a new build.
- The code repo starts the build process. While building on GitHub, it fetches the content from the other GitHub repo. But while building the site locally, it uses the local content.

## Is it worth it?

There definitely are a lot of moving parts. I wish it were easier to do all the image stuff, parse the markdown properly, and just have a more out-of-the-box good experience where I can write content on my phone or laptop and still own all my data.

But, **yes**, to be it's 100% worth it. If there are issues, I'm sure I can fix them. Not that there have been any major issues. Since I control every part of the process, I can customize it how ever I want. 

I created a custom page at https://friedrice.fun/invite-someone-for-fried-rice. Write your name there, then copy and share the link with your friend. Try it out!

If I used something like Wordpress, I'm not sure if making this would have been that easy.