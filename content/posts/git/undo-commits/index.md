---
title: How To Undo Commits
description: Undo your last N commits with git reset
metaDescription: Undo your last N commits with git reset with the --soft option. Revert your last few commits if you make a mistake.
date: 2021-05-29
links:
  - source: docs
    href: https://git-scm.com/docs/git-reset
    title: Git reset
  - source: stackoverflow
    href: https://stackoverflow.com/a/5201642/8677167
    title: Squash my last X commits together
---

To undo your last commit, use

```bash
git reset --soft HEAD~1
```

Change `1` to the number of commits. To undo the last 3 commits, use `git rest --soft HEAD~3`.

This git command does not cause any data loss, it only "un-commits" commits.

## Example

Have you ever made multiple commits because you forgot to small typo or mistake?

```bash title="git log --oneline"
7b2cd48 (HEAD -> main) Update README again
047ecab Update README 2
dad0bf5 Update README typo
4a0bff2 Update README
71e5549 Initialize boilerplate
1fac9d8 First commit
```

Usually, you'd use `git rebase` for things like this. However, the commits we want to merge are the latest commits, so it is easier to undo them, then redo them as one commit.

We need to "un-commit" the last 4 commits, so use


```bash
git reset --soft HEAD~4
```

The last 4 commits are now undone:

```bash title="git log --oneline"
71e5549 (HEAD -> main) Initialize boilerplate
1fac9d8 First commit
```

Now add your new commit:

```bash
git commit -m "Update README"
```

And you've successfully rewritten history

```bash title="git log --oneline"
4f914d4 (HEAD -> main) Update README
71e5549 Initialize boilerplate
1fac9d8 First commit
```