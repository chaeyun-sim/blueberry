---
description: Creates a commit message using the repository's template.
argument-hint: [Commit Message]
allowed-tools: Bash(git status), Bash(git diff --staged), Bash(git commit -m "$ARGUMENTS")
---

## Your Task

You are about to create a git commit.

1. **Analyze the context:** Run `git status` and `git diff --staged` to review staged changes.
2. **Follow Conventional Commits format:**
   ```
   <type>(<scope>): <subject>
   ```
   - type: `feat` | `fix` | `refactor` | `chore` | `docs` | `style` | `test`
   - scope: 변경된 파일/기능명 (선택)
   - subject: 명령형, 소문자로 시작, 50자 이내
3. **Stage files:** Stage only the relevant changed files (avoid `git add .`).
4. **Create the Commit:** Use `git commit -m "$ARGUMENTS"`.
