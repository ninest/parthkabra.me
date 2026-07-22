---
title: Git Shortlog
description: View a breakdown of commits per user
createdAt: '2021-05-30'
categories:
- git
updatedAt: '2023-12-18'
---

Links: [Git log](/git/log), [Git shortlog docs](https://git-scm.com/docs/git-shortlog), [Number of commits per author on all branches](https://stackoverflow.com/a/9839491/8677167)

````component:alert
variant: default
title: "Examples"
---
To view a list of users and their commit count:

```
git shortlog -s -n --all --no-merges
```
````

`git shortlog` summarizes the output from `git log`, grouping each commit by user:

```
anotheruser (1):
  Fix bug

ninest (5):
  First commit
  Second commit
  Update README
  Add contributors
  Publish
```

## Options

### `--numbered`, `-n`

Sort by number of commits per user: `git shortlog -n`:

```
ninest (5):
  First commit
  Second commit
  Update README
  Add contributors
  Publish

anotheruser (1):
  Fix bug
```

### `--summary`  `-s`

Only provide the commit count of each user: `git shortlog -s`:

```
  1 anotheruser
  5 ninest
```

View more options on the [documentation for git shortlog](https://git-scm.com/docs/git-shortlog).

## Breakdown of commits per user

Use the command

```
git shortlog -s -n --all --no-merges
```

`--no-merges` ensures that merge commits are not counted.

The output of the command looks like

```
  5 ninest
  1 anotheruser
```
