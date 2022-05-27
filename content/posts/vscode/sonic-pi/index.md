---
title: Running Sonic Pi From VSCode
description: Tasks and keybindings in VSCode to play sound from Sonic Pi
date: 2020-06-26
links:
  - source: web
    href: https://github.com/Widdershin/sonic-pi-cli
    title: sonic-pi-cli
  - source: web
    href: https://code.visualstudio.com/docs/getstarted/keybindings
    title: Key Bindings for Visual Studio Code
  - source: reddit
    href: https://www.reddit.com/r/vscode/comments/h8cy6z/can_i_get_keyboard_shortcuts_to_only_work_on/
    title: Can I get keyboard shortcuts to only work on files of a specific extension?
---

While Sonic Pi's editor is great, I prefer VSCode for everything code-related. Unfortunately, there is no Sonic Pi VSCode extension ([yet](https://in-thread.sonic-pi.net/t/vs-code-extension/3935/38)).

Using custom tasks and keybindings, we can make our own "extension".

## 1. Install [sonic-pi-cli](https://github.com/Widdershin/sonic-pi-cli)

```bash
gem install sonic-pi-cli

# On Mac you may have to use sudo:
sudo gem install sonic-pi-cli
```

Once installed, **open the Sonic Pi** app and enter the following in your Terminal to make sure it works properly:

```bash
sonic_pi play 50
```

<Alert variant="warning" title="ERROR: Sonic Pi is not listening on 4557 - is it running?">

If you get this error, it means the Sonic Pi is not open. Open the app, then try the command again.

</Alert>

## 2. Use sonic-pi-cli to play music from a ruby file

Create a file with the `.rb` extension with some Sonic Pi Ruby code, for example:

```ruby title="music.ruby"
play :E4
```

In your Terminal, enter the following command to play the file with `sonic-pi-cli`:

```bash
cat music.rb | sonic_pi
```

To stop music, run

```bash
sonic_pi stop
```

At this stage, we can already use VSCode. However, it is quite inconvenient to type `sonic_pi stop` and `cat music.rb | sonic_pi` every time we make a change.

<Alert compact variant="primary" title="What does the '|' character mean?">

`|` is the pipe operator. In short, it passes the output of one command (`cat music.rb`) to another (`sonic_pi`). Read more here: [piping in Unix or Linux](https://www.geeksforgeeks.org/piping-in-unix-or-linux/).

</Alert>

## 3. Configuring keyboard shortcuts

VSCode makes it easy to create to run `sonic_pi stop` and `cat music.rb | sonic_pi` using **tasks** and **keybindings**.

### Tasks

All VSCode tasks are stored in `tasks.json`. Top open this file, enter the command ">Tasks: Open user tasks" in the command palette, and you should see a file like this:

```json title="tasks.json"
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": []
}
```

We need to add two tasks:

- One to start playing the _current file_ with `sonic-pi-cli`: `cat <current file> | sonic_pi`
- One to stop playing: `sonic_pi stop`.

Both are of type `shell`. We also have to give them unique labels so we can reference them in keybindings. I'm going to use `sp-run` and `sp-stop`.

Add the tasks like this:

```json title="tasks.json"
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    // PLAY MUSIC
    {
      "label": "sp-run",
      "type": "shell",
      "command": "cat ${file} | sonic_pi"
    },

    // STOP PLAYING
    {
      "label": "sp-stop",
      "type": "shell",
      "command": "sonic_pi stop"
    }
  ]
}
```

### Keybindings

We need to add keybindings to run these tasks.

import {VscGoToFile} from 'react-icons/vsc'

Open `keybindings.json` with the keyboard shortcut `cmd-K cmd-s`. Click the button on the top right (<VscGoToFile className="inline" />) to open the file in JSON. It should look something like this:

```json title="keybindings.json"
// Place your key bindings in this file to override the defaults
[
  // ..
  // all of your keybindings
  // ...
]
```

To bind a keyboard shortcut to a task, we have to set its `command` to `workbench.action.tasks.runTask`. We also want to limit this keyboard shortcut to Ruby (`.rb`) files, so we can set `when` to `editorLangId == ruby`.

I am going to use `ctrl-alt-S` to play (`sp-run`) and `ctrl-alt-A` to stop (`sp-stop`).

```json title="keybindings.json"
// Place your key bindings in this file to override the defaults
[
  // ..
  // all your other keybindings
  // ...

  // for sonic pi
  {
    "key": "ctrl+alt+s", // customize the shortcut
    "command": "workbench.action.tasks.runTask",
    "args": "sp-run",
    "when": "editorLangId == ruby" // limit these keybindings to work in ruby files
  },
  {
    "key": "ctrl+alt+a", // customize the shortcut
    "command": "workbench.action.tasks.runTask",
    "args": "sp-stop",
    "when": "editorLangId == ruby"
  }
]
```

To make sure this works, add the following to your `music.rb`:

```ruby title="music.rb"
live_loop :main do
  play :E4
  sleep 1
end
```

Use the keyboard shortcut you defined to start playing (`ctrl-alt-S` in my case).

You should see VSCode's terminal open up with a message like

```bash
> Executing task: cat /users/spv/music.rb | sonic_pi <

Terminal will be reused by tasks, press any key to close it.
```

If it works, try making a change. For example:

```ruby title="music.rb"
live_loop :main do
  play :C4 # <- changed
  sleep 1
end
```

Use your keyboard shortcut to start playing again (`ctrl-alt-S` in my case). If the sound playing changes, try stopping it with your shortcut (`ctrl-alt-D` in my case).

## Logs

Sonic Pi logs cannot be shown in VSCode yet. Use the Sonic Pi sidebar to see them.
