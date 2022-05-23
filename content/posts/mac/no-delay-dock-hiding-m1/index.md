---
title: Show/Hide the Dock instantly
description: Showing and hiding dock instantly
date: 2022-05-23
showContents: false
---

To show and hide the dock instantly, open Terminal and run:

```bash
defaults write com.apple.dock autohide-delay -float 0 && defaults write com.apple.dock autohide-time-modifier -float 0 && killall Dock
```

To get back the default animation and delay before showing the dock, run:

```bash
defaults delete com.apple.dock autohide-delay && defaults delete com.apple.dock autohide-time-modifier && killall Dock
```

This works on M1 macs on macOS 12.0 Monterey.

<Alert>

Before running these commands, ensure that the "Automatically hide and show the Dock" setting is enabled. Find this setting in System Preferences > Dock & Menu Bar.

</Alert>