---
title: Using JetBrains Mono in VS Code
description: Download and install the JetBrains Mono font on Visual Studio Code on Mac
date: 2022-05-27
links:
  - source: web
    href: https://www.jetbrains.com/lp/mono/
    title: JetBrains Mono
showContents: false
---

<span className="font-mono font-bold">JetBrains Mono</span> is a relatively newer font optimized for code. To use it with VS Code, download it from [JetBrains' website](https://www.jetbrains.com/lp/mono/). To install it on Mac, open the downloaded the folder and double click the both files in `fonts > variable`. This should open font book and install the fonts. Once complete, the fonts can be used in any application like Pages or Word.

To use the font in VS Code, add the following to `settings.json`:

```json5
"editor.fontFamily": "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
"editor.fontLigatures": true,
```

### Ligatures

Font ligatures combine two or more characters, and <span className="font-mono">JetBrains Mono</span> has quite a few:

| Regular font | JetBrains Mono                             |
| ------------ | ------------------------------------------ |
| ==           | <span className="font-mono">==</span>      |
| !=           | <span className="font-mono">!=</span>      |
| !==          | <span className="font-mono">!==</span>     |
| ->           | <span className="font-mono">-></span>      |
| \|>          | <span className="font-mono">\|></span>     |
| {"<>"}       | <span className="font-mono">{"<>"}</span>  |
| {"</>"}      | <span className="font-mono">{"</>"}</span> |

See a list of all [the font's features](https://www.jetbrains.com/lp/mono/#key-features).