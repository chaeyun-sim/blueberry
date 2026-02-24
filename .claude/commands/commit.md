---
description: Creates a commit message using the repository's template.
argument-hint: [Commit Message]
allowed-tools: Bash(git status), Bash(git diff --staged), Base(git add), Bash(git commit -m "$ARGUMENTS"), Bash(npm run build:dev)
---

## Your Task

You are about to create a git commit.

1. **Analyze the context:** Run `git status` and `git diff --staged` to review staged changes.
2. **Check if the build is successful**: Check if the build is successful by running `npm run build:dev`. If the build is not successful, fix the errors and build again. If the error needs double-check, ask for confirmation.
3. **Ask for including files**: Ask for confirmation before including `.yml`, `.yaml`, `.xml`, `.log` files in the commit.
4. **Ask for confirmation:** Ask for confirmation before committing the changes.
5. **Follow Conventional Commits format:**

   ```
   <type>(<scope>): <subject>
   ```

   - type: `feat` | `fix` | `refactor` | `chore` | `docs` | `style` | `test`
   - scope: 변경된 파일/기능명 (선택)
   - subject: 명령형, 소문자로 시작, 50자 이내, 반드시 한글로

6. **Stage files:** Stage only the relevant changed files using `git add <file>`. If the file is not relevant, ask for confirmation, and then unstage the file using `git restore --staged`
7. **Create the Commit:** Use `git commit -m "$ARGUMENTS"`.
