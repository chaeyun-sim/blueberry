---
description: Pushes the changes to current branch.
argument-hint: [branch or leave empty for current]
allowed-tools: Bash(git branch --show-current), Bash(git status), Bash(git log), Bash(git push), Bash(npm run build:dev)
---

## Your Task

You are about to push. Use **✅ 성공** / **❌ 실패** / **🔄 진행 중** when reporting each step.

1. **Branch auto-detection**: When no argument is given, confirm with the user whether to use the current branch (from `git branch --show-current`) before proceeding.
2. **Context check**: Run `git status` and review the diff since the last commit. If there is nothing to push, exit immediately.
3. **Conflict detection and notification**: If a merge conflict occurs, stop the workflow and notify the user. Use `git merge --abort` if needed, then exit.
4. **Per-step build verification**: After merging into each environment, run that environment’s build (e.g. `npm run build:dev` after merging into dev). If the build fails, roll back that merge and notify the user.
5. **Push**: If all conditions are met, run `git push` to push to the remote.
