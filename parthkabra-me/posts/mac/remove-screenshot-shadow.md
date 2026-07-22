---
title: Remove Mac Screenshot Shadow
description: Enable and disable the shadow in cropped screenshots
createdAt: '2021-06-07'
categories:
- mac
updatedAt: '2023-12-18'
---
````component:alert
variant: default
title: "Summary"
---
To **disable** the screenshot shadow, run

```
defaults write com.apple.screencapture disable-shadow -bool true; killall SystemUIServer
```

And to **enable** the screenshot shadow, run

```
defaults write com.apple.screencapture disable-shadow -bool false; killall SystemUIServer
```
````

By default, when you take a cropped screenshot of a window (with `command-shift-4`), the screenshot has a shadow:

![Mac screenshot with window shadow](/images/posts/mac/remove-screenshot-shadow/shadow.png)

To **disable** this shadow, run the following commands in Terminal:

```
defaults write com.apple.screencapture disable-shadow -bool true
killall SystemUIServer
```

Screenshots should not have the shadow anymore:

![Mac screenshot without window shadow](/images/posts/mac/remove-screenshot-shadow/no-shadow.png)

To **re-enable** shadows on screenshots, run the following commands:

```
defaults write com.apple.screencapture disable-shadow -bool false
killall SystemUIServer
```
