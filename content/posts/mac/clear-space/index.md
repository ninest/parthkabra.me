---
title: Clear Space On Mac
description: Reclaim space from XCode and other folders on your Mac
date: 2021-06-06
---

## XCode

Reclaiming space from XCode mainly involves deleting files from `~/Library/Developer/`.

### Caches

Folders inside `~/Library/Developer/CoreSimulator/Caches/dyld` can be deleted safely.

Source: [Apple discussions](https://discussions.apple.com/thread/250834316), [Stackoverflow](https://stackoverflow.com/a/66882407/8677167)

### Simulators

Run `xcrun simctl delete unavailable` to delete old iOS simulators for runtimes which are not supported anymore.

{/* xcrun simctl erase all */}

{/* Device Support */}

### CoreSimulator Logs

Files inside `~/Library/Logs/CoreSimulator` can be deleted safely.

Source: [Stackoverflow](https://stackoverflow.com/a/42703818/8677167)

### Archives

Delete archives no longer required from `~/Library/Developer/Xcode/Archives/`. Note that you may need certain Archives for debugging purposes. You should not delete these if you want to debug deployed versions of your apps.

Source: [Stackoverflow](https://stackoverflow.com/a/7284632/8677167)


### Derived Data

Files inside `~/Library/Developer/Xcode/Derived Data/` can be deleted safely.

Source: [Stackoverflow](https://stackoverflow.com/a/18933382/8677167)

### iOS Device Logs

Files inside `~/Library/Developer/Xcode/iOS Device Logs` can be deleted safely.

Source: [Stackoverflow](https://stackoverflow.com/a/39381660/8677167)

## Brew

Run `brew cleanup` to remove old versions of installed formulae.

Source: [Stackoverflow](https://stackoverflow.com/a/65503502/8677167)

## node_modules

Run `npx npkill` to find and delete `node_modules/` folders across your computer.

## npm

Run `npm cache clean --force` to clear the ache from `~/.npm/`.

## Yarn

Run `yarn cache clean` to delete cache from `~/Library/Caches/Yarn/`.

## Gradle

Delete files inside `~/.gradle/caches`.

Source: [Stackoverflow](https://stackoverflow.com/a/30450020/8677167)