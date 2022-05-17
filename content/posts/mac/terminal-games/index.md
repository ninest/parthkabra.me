---
title: Plays Games On Terminal
description: Play tetris, pong, snake, solitaire, and more games on the Mac Terminal with emacs
date: 2021-06-06
---

Open Terminal, then copy and paste the following commands to play the game:

- Tetris: \
  `emacs -q --no-splash -f tetris`
- Pong: \
  `emacs -q --no-splash -f pong`
- Snake: \
  `emacs -q --no-splash -f snake`
- Solitaire: \
  `emacs -q --no-splash -f solitaire`
- Doctor: \
  `emacs -q --no-splash -f doctor`
- Life: \
  `emacs -q --no-splash -f life`
- Dunnet: \
  `emacs -q --no-splash -f dunnet`

## Examples

### Tetris

Open Terminal, type in `emacs -q --no-splash -f tetris`, and hit Return:

import exampleCommand from './posts/mac/terminal-games/images/example-command.png'

import tetrisSquare from './posts/mac/terminal-games/images/tetris-square.png'

<div className="flex items-center justify-between space-x-base">

<Image src={exampleCommand} width={634} height={636} />

<Image src={tetrisSquare} width={634} height={634} />

</div>

### Pong

```bash
emacs -q --no-splash -f pong
```

import pong from './posts/mac/terminal-games/images/pong.png'

<Image src={pong} width={730} height={466} />

To control the

- Right player: use the up and down arrow keys
- Left player: use the 4 and 6 keys (or left and right arrow keys)

### Snake

```bash
emacs -q --no-splash -f snake
```



import snake from './posts/mac/terminal-games/images/snake.png'

<Image src={snake} width={730} height={466} />

### Doctor

```bash
emacs -q --no-splash -f doctor
```

Speak to a <strike>doctor</strike> psychotherapist.

import doctor from './posts/mac/terminal-games/images/doctor.png'

<Image src={doctor} width={730} height={466} />

### Dunnet

```bash
emacs -q --no-splash -f doctor
```

Dunnet is a text-based adventure game.

import dunnet from './posts/mac/terminal-games/images/dunnet.png'

<Image src={dunnet} width={730} height={466} />