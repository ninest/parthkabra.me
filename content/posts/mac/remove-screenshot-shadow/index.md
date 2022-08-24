---
title: Remove Mac Screenshot Shadow
description: Enable and disable the shadow in cropped screenshots
date: 2021-06-07
showContents: false
---



{% alert variant="primary" title="Summary" open=true %}

To **disable** the screenshot shadow, run

```bash
defaults write com.apple.screencapture disable-shadow -bool true; killall SystemUIServer
```

And to **enable** the screenshot shadow, run

```bash
defaults write com.apple.screencapture disable-shadow -bool false; killall SystemUIServer
```

{% /alert %}

By default, when you take a cropped screenshot of a window (with `command-shift-4`), the screenshot has a shadow:


![shadow](/images/mac/remove-screenshot-shadow/shadow.png)

To **disable** this shadow, run the following commands in Terminal:

```bash
defaults write com.apple.screencapture disable-shadow -bool true
killall SystemUIServer
```

Screenshots should not have the shadow anymore:


![no-shadow](/images/mac/remove-screenshot-shadow/no-shadow.png)

To **re-enable** shadows on screenshots, run the following commands:

```bash
defaults write com.apple.screencapture disable-shadow -bool false
killall SystemUIServer
```
