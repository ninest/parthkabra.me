---
title: How To Use The Say Command
description: Using the built-in MacOS say command, and customizing the voice.
date: 2021-05-31
links:
  - source: docs
    href: https://ss64.com/osx/say.html
    title: Say Man page
  - source: stackoverflow
    href: https://apple.stackexchange.com/q/96808/419233
    title: Default speaking rate of speech synthesis program
  - source: stackoverflow
    href: https://stackoverflow.com/q/16501663/8677167
    title: Mac's say command to mp3
---

To have your computer speak to you open your terminal and enter:

```bash
say "Your Text Here"
```

## Customizing the voice

Pass in `--voice` (or `-v`). For example:

```bash 
say "Jelly" -v "Albert"
```


To list out all voices, use 

```bash
say -v '?'
```

<Alert open={false} title="Finding voices from system preferences">

There is another way to find voices.

Go to the **System Preferences** app. Open **Accessibility** > **Spoken Content**. You will see the **System Voice** dropdown.

Open that dropdown and note down the voice names you see (but don't change them!). Here are a list of voices I see:
- Daniel
- Kate
- Deranged
- ...

import spokenContent from './posts/mac/say/images/spoken_content.png'

<Image src={spokenContent} width={657} height={479} />

For example, 

```bash 
say "This is the deranged voice" -v "Deranged"
```

</Alert>


<Alert open={false} title="Testing out different voices">

Go to the **System Preferences** app. Open **Accessibility** > **Spoken Content**. You will see the **System Voice** dropdown.

Scroll to the bottom and click the "Customize" button:

import customize from './posts/mac/say/images/customize.png'

<Image src={customize} width={653} height={477} />

You can now browse through all voices, and click "Play" to test them out:

import browse from './posts/mac/say/images/browse.png'

<Image src={browse} width={657} height={478} />

</Alert>

## Reading from a file

Use the `--input-file` (`-f`) to specify the file to read from.

Say you have this file:


```txt title="song.txt"
We're no strangers to love
You know the rules and so do I
A full commitment's what I'm thinking of
You wouldn't get this from any other guy
```

Have your computer sing with

```bash
say -f song.text
```

You an also use the pipe operator: `cat song.text | say`.



## Rate

Use `--rate` (`-r`) to control the rate in **words per minute** of the sound.

For example, 

```bash
say "I am in a rush!" -r 500
```

<Alert title="What is the default rate?">

See this question on AskDifferent: [What is the default speaking rate for the speech synthesis program?](https://apple.stackexchange.com/q/96808/419233)

</Alert>

## Saving as mp4 or aiff

Pass in the `--output-file` (`-o`) to pass an output file. For example:

```bash
say "Happy birthday!" -o birthday.mp3
```

Note that some audios may not support one of the formats.

<Alert title="Saving as mp3">

If you try to save the output as an `mp3` file (example: `say "hello" -o voice.mp3`), you may see this error: 

```bash
Specifying ExtAudioFileRef failed: -50
```

To save as `mp3`, first save as `aiff`, then use the lame encoder to convert it to `mp3`:

```bash
say "Never gonna give you up" -o voice.aiff
lame -m m voice.aiff voice.mp3
```

Install lame with `brew install lame`.

Credits to [this answer on stackoverflow](https://stackoverflow.com/q/16501663/8677167).

</Alert>