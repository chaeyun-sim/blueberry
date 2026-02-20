---
description: Pushes the changes to current branch.
argument-hint: [branch or leave empty for current]
allowed-tools: Bash(git branch --show-current), Bash(git status), Bash(git push)
---

## Your Task

You are about to push. Use **✅ 성공** / **❌ 실패** / **🔄 진행 중** when reporting each step.

1. **Branch auto-detection**: When no argument is given, confirm with the user whether to use the current branch (from `git branch --show-current`) before proceeding.
2. **Context check**: Run `git status`. If there is nothing to push, exit immediately.
3. **Push**: Run `git push` to push to the remote.
