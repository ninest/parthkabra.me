---
title: Git Shortlog
description: View a breakdown of commits per user
metaDescription: View a breakdown of commits per user; summarize the commit count of users and authors
date: 2021-05-30
links:
  - source: self
    href: /git/log
    title: Git log
  - source: website
    href: https://git-scm.com/docs/git-shortlog
    title: Git shortlog
  - source: website
    href: https://stackoverflow.com/a/9839491/8677167
    title: Number of commits per author on all branches
---

{% alert variant="primary" title="Summary" open=true &}

To view a list of users and their commit count:

```bash
git shortlog -s -n --all --no-merges
```

{% alert %}

`git shortlog` summarizes the output from `git log`, grouping each commit by user:


```shell {% title="git shortlog" %}
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

Sort by number of commits per user:

```shell {% title="git shortlog -n" %}
ninest (5):
  First commit
  Second commit
  Update README
  Add contributors
  Publish

anotheruser (1):
  Fix bug
```

### `--summary` `-s`

Only provide the commit count of each user.

```bash title="git shortlog -s"
  1 anotheruser
  5 ninest
```

View more options on the [documentation for git shortlog](https://git-scm.com/docs/git-shortlog).

## Breakdown of commits per user

Use the command

```bash
git shortlog -s -n --all --no-merges
```

`--no-merges` ensures that merge commits are not counted.

The output of the command looks like

```bash {% title="git shortlog -s -n --all --no-merges" %}
  5 ninest
  1 anotheruser
```