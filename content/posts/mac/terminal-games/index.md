---
title: Terminal Games
description: Play tetris, pong, snake, solitaire, and more on Terminal with emacs
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

{% div class="flex items-center justify-between space-x-base" %}
![example command](/images/mac/terminal-games/example-command.png)

![tetris square](/images/mac/terminal-games/tetris-square.png)
{% /div %}

### Pong

```bash
emacs -q --no-splash -f pong
```

![](/images/mac/terminal-games/images/pong.png)

To control the

- Right player: use the up and down arrow keys
- Left player: use the 4 and 6 keys (or left and right arrow keys)

### Snake

```bash
emacs -q --no-splash -f snake
```

![](/images/mac/terminal-games/images/snake.png)

### Doctor

```bash
emacs -q --no-splash -f doctor
```

Speak to a ~~doctor~~ psychotherapist.

![](/images/mac/terminal-games/images/doctor.png)

### Dunnet

```bash
emacs -q --no-splash -f doctor
```

Dunnet is a text-based adventure game.

![](/images/mac/terminal-games/images/dunnet.png)
