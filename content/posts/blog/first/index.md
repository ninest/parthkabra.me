---
title: Lorem Ipsum?
date: 2019-12-24
description: The Testing Grounds
showContents: false
draft: true
---

This post is meant to be for testing the content of this blog. The current iteration of this blog uses Markdoc rather than plain markdown or MDX. You can **safely** ignore this post and *move on*.

## Fences

Here is a react code block:

```tsx
export const MarkdocFence = ({ html, lineNumbers, lineStart = 1, title }: {html: string;lineNumbers: boolean; lineStart: number; title: string; }) => {
  return (
    <div className={lineNumbers ? "line-numbers" : ""}>
      {title && <div>{title}</div>}
      <div
        style={{ ["--start" as any]: lineStart ?? 1 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
```

Here is a more simple code block, but with a title:

```py {% title="something.py" %}
print("hello")
```

Now that both of these work, let's try for something a little more complex:

```ts {% title="typescript.tsx" lineNumbers=true lineStart=10 highlightedLines=[1,2] %}
console.log("Reached here")
// Use debugger please
a++
return a + 10
```