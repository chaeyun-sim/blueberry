---
description: Creates a pull request using the repository's template.
argument-hint: [PR Title]
allowed-tools: Bash(git diff HEAD), Bash(git status), Bash(gh pr create*)
---

## Your Task

You are about to create a GitHub pull request.

1.  **Analyze the context:** Review the current git status and the diff of changes since the last commit.
2.  **Use the PR Template:** The official PR template for this repository is provided below.
3.  **Fill out the Template:** Populate the template with relevant information based on the code changes. Be thorough and follow the template's structure.
4.  **Create the Pull Request:** Use the `gh pr create` command. The title for the pull request will be "$ARGUMENTS". Pass the completed template content as the body of the PR.

## PR Template

@.github/pull_request_template.md
