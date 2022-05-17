---
title: Remove Mac Screenshot Shadow
description: Enable and disable the shadow in cropped screenshots
date: 2021-06-07
showContents: false
---

import { images } from "./posts/mac/remove-screenshot-shadow/assets"

<Alert variant="primary" title="Summary">

To **disable** the screenshot shadow, run

```bash
defaults write com.apple.screencapture disable-shadow -bool true; killall SystemUIServer
```

And to **enable** the screenshot shadow, run

```bash
defaults write com.apple.screencapture disable-shadow -bool false; killall SystemUIServer
```

</Alert>

By default, when you take a cropped screenshot of a window (with `command-shift-4`), the screenshot has a shadow:


<Image {...images.shadow} />

To **disable** this shadow, run the following commands in Terminal:

```bash
defaults write com.apple.screencapture disable-shadow -bool true
killall SystemUIServer
```

Screenshots should not have the shadow anymore:


<Image {...images.noShadow} />

To **re-enable** shadows on screenshots, run the following commands:

```bash
defaults write com.apple.screencapture disable-shadow -bool false
killall SystemUIServer
```
