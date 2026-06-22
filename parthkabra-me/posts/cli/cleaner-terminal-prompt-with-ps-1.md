---
title: Cleaner Terminal Prompt With PS1
description: Making the prompt string cleaner
createdAt: '2024-01-10'
categories:
- cli
updatedAt: '2024-01-10'
---
By default the terminal prompt string is long and shows

```
parthkabra@Parths-MacBook-Pro Folder ~
```

I prefer something cleaner without my username:

```
FolderName/ 
```

In addition, I want the folder name to be **bold**, and a new line after every command.

To do this, I edit `~/.zshrc`:

```bash
# New PS1
NEWLINE=$'\n'
FOLDERNAME='%1d'
FOLDERNAME='%1~'

# Leave line and bold folder name
export PS1="${NEWLINE}%B${FOLDERNAME}/%b ";
```

This can be opened easily with VS Code with : `code ~/.zshrc`.
