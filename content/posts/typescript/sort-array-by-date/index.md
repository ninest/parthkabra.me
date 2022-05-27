---
title: Sort an Array By Date
description: Using .sort and .getTime
date: 2022-05-30
showContents: false
---

If we have a list that looks like this:

```ts
const posts = [
  { slug: "third", date: new Date("2022-02-23") },
  { slug: "fourth", date: new Date("2022-01-10") },
  { slug: "first", date: new Date("2022-01-01") },
  { slug: "second", date: new Date("2022-01-05") },
]
```

We can create a new list of posts sorted by date:

```ts
// Ascending order:
posts.sort((postA, postB) => postA.date.getTime() - postB.date.getTime())
// Descending order (latest post first):
posts.sort((postA, postB) => postB.date.getTime() - postA.date.getTime())
```

<Alert title="What do the arguments in .sort mean?" open={false}>
The above code can be made easier to understand using `a` and `z` instead of `postA` and `postB`.

```ts
// Ascending order:
posts.sort((a, z) => a.date.getTime() - z.date.getTime())
// Descending order (latest post first):
posts.sort((a, z) => z.date.getTime() - a.date.getTime())
```

Or a more simplified example with dates:

```ts
const numbers = [4, 7, 2, 9, 34, 2, 0]
// Ascending order:
numbers.sort((a, z) => a - z)
// Descending order:
numbers.sort((a, z) => z - a)
```

In short,

- Ascending order (or earliest first): `a - z`
- Descending order (or latest first): `z - a`

</Alert>

### Why use .getTime?

JavaScript implicitly coerces dates to numbers when trying to subtract one from another, so using `.getTime()` and subtracting numbers is more efficient. Additionally, requires the arguments in the `.sort` function 

If you try sorting dates in typescript like `dates.sort((a, z) => a - z)` without using `.getTime()`, you may see the following errors:

```ts
The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type
The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type
```