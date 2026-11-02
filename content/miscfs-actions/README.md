# Actions

Each file in this folder is an action: a shell command you run from the miscfs UI
(Actions, in the sessions sidebar) or that an AI runs through MCP. Its name is the
file name without the extension, so `deploy-site.sh` is the action `deploy-site`.

- It runs with `sh`, as written, from miscfs-content/. To work elsewhere, `cd` there:
  `cd ~/code/site && npm run build && npm run deploy`
- It takes no input, and has miscfs's own environment (PATH, SSH agent, tokens).
- Whatever miscfs holds back is committed before it starts, so `git push` pushes your latest typing.
- Its output shows as it runs; only the latest run of each action is kept.

This README, hidden files and anything in a subfolder (e.g. helper scripts) are not actions.
Actions can never be edited through the UI or MCP, only on disk.
