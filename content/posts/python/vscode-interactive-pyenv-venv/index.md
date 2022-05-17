---
title: Using VSCode Interactive With Pyenv Virtualenv
description: Setting up VSCode Interactive for Python
metaDescription: Setting up VSCode Interactive for Python, pyenv-virtualenv, vscode, python
date: 2021-07-01
links:
  - source: web
    href: https://code.visualstudio.com/docs/python/jupyter-support-py
    title: Python Interactive window
  - source: docs
    href: https://github.com/pyenv/pyenv-virtualenv
    title: Pyenv virtualenv documentation
---

## Creating the virtualenv

Create your folder, and initialize the virtual environment with `pyenv virtualenv`. I will use Python version `3.9.5` and call my environment `project-venv`:

```bash
pyenv virtualenv 3.9.5 project-venv
```

Activate your virtual environment with

```bash
pyenv activate project-venv
```

Confirm that this is working by checking your Python version with `python -V`, and you should see `3.9.5`.

You can also create a file `.python-version` at the root of your project with the path to the virtualenv:


```txt title=".python-version"
3.9.5/envs/project-venv
```

This file tells `pyenv` which [Python version should be used](https://github.com/pyenv/pyenv#choosing-the-python-version). It will also allow `pyenv` to automatically activate the `project-venv` when you open the project folder in Terminal.

If this does not work, ensure that your `.zshrc`/`.bashrc` has the line `eval "$(pyenv virtualenv-init -)"`.

## Selecting the interpreter path

In VSCode's settings, set `python.pythonPath` to the path of the virtualenv `project-venv` we created in the previous step. In my case, it's  `~/.pyenv/versions/3.9.5/envs/fit-venv/bin/python` (On Mac). To confirm that this is working, see the bottom left of your VSCode, where you should see something similar to `Python 3.9.5 64-bit ('venv': venv)`.

## Starting the interactive window

Install `ipykernel` before running code:

```bash
pip install ipykernel
```

Once installed, create a block:

```py
print("Hello!")
```

and run it with `shift+enter`.

## Cleaning up virtualenvs

To list out all versions and virtualenvs with pyenv, run `pyenv versions`. At the bottom, we should see the virtualenv we created:

```bash title="pyenv versions"
...
  system
  ...
  3.9.5/envs/project-venv
  project-venv
```

To delete `project-venv`, run `pyenv uninstall project-venv` and  `pyenv virtualenv-delete project-venv`. If this does not work, open `~/.pyenv/versions/3.9.5/envs`, and manually delete the virtual environment folder.