---
title: Typer
description: The 10-second typing game
date: 2020-05-18
links:
  - source: github
    url: https://github.com/ninest/typer
    title: GitHub
  - source: web
    url:  https://typer.now.sh
    title: Website
---

import { images } from "./projects/typer/assets"

Typer is a simple typing game to test out your typing speed and compete with friends.

<div className="flex space-x-base">
  <Image {...images.start} />
  <Image {...images.game} />
</div>

The game is quite simple. You start with 10 seconds, and for every word you type correctly, you get one second more, or two if you're lucky. There is also a chance of the text field becoming a password field to further increase the difficulty!

The website is a **progressive web app**, so it works offline and can be added to your home screen as an app.