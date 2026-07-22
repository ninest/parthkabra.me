---
title: First
description: The first post
createdAt: '2001-01-01'
categories:
- blog
updatedAt: '2001-01-01'
---

Links: [First](https://first.com/one/two)

## Hello!

Regular alert with a title:

```component:alert
variant: default
title: "This is a primary alert with a title and a body"
---
This is the body of the alert.
```

Alert without a title:

```component:alert
variant: secondary
---
This is a secondary alert without a title but with a body, obviously.
```

```component:alert
variant: default
---
This is a default one.
```

Chat interface:

<!-- chat component - TODO: convert to component -->

Some more special components: the keyboard:

<!-- keyboard component - TODO: convert to component -->

This is a longer alert:

````component:alert
variant: default
---
This is a pretty long alert

## It has a title!

- And a list of points because why not
- Let's make another one
- We love nested points

```javascript
const a = 1
// javascript rocks
```

## Section two

This just goes on.

Do not nest alerts.

Yeah. It's long.
````

This is some more code:

```markdown
## Hello

- this is a code block
- it is cool
- this is a long code this is a long code this is a long code this is a long code this is a long code
```
