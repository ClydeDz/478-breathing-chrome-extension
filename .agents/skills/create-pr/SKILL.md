---
name: create-pr
description: "Create a GitHub pull request with a suitable title, a concise ASD-STE100-style summary, links to related open issues, and verified test results. Use when preparing or opening a PR."
---

# Create a Pull Request

Create a clear, accurate pull request (PR) for the current branch. Use the GitHub CLI (`gh`) for GitHub operations.

## Procedure

1. Inspect the repository instructions, current branch, worktree, and changes. Confirm which changes belong in the PR. Do not include unrelated work.
2. Read the PR template at `.github/pull_request_template.md` and any templates in `.github/PULL_REQUEST_TEMPLATE/`. Preserve the template's headings, comments, checklist items, and order. Fill its placeholders accurately.
3. Review the changes and choose a suitable title. Keep it concise and state the main change.
4. Find open issues that relate to the changes. Use `gh issue list --state open` and inspect issue titles and descriptions. Include only issues that the PR actually fixes. In the summary section, add `Closes #<number>` for each issue that the PR fixes. Do not claim that the PR closes an issue when the link is uncertain.
5. Run the repository's documented CI test command locally. For example, use `npm run test:ci` when that is the project's test command. Wait for it to finish. Record the exact command and the actual result. Do not report tests as passing if they fail or do not run.
6. Write a `## Summary of changes` section with concise bullet points. Use ASD-STE100-style language:
   - Use short, direct sentences and common words.
   - Use active voice and name the action or result.
   - Put one change in each bullet.
   - State facts. Do not add vague claims or unnecessary detail.
7. Write a `## Testing` section. List the exact test command and copy its result from the local run. State clearly if a test fails or cannot run. Do not guess or fabricate output.
8. Prepare the PR description from the repository template. Add the `Summary of changes` and `Testing` sections while keeping all original template content and order. Put the `Closes #<number>` lines in the summary section. Keep the description consistent with the code and test results.
9. Check whether the current branch is ready to publish. Do not commit or push user changes without permission. If the branch is not pushed, or contains uncommitted changes that need a commit, ask before taking those actions.
10. Use `gh pr create --title "<title>" --body "<body>"` to open the PR after the branch is available on GitHub. Report the PR URL and any test failures.

## Accuracy checks

- Do not include an issue unless its open description matches the change and the PR resolves it.
- Do not mark checklist items as complete unless the available evidence supports them.
- Do not state that manual testing passed unless it was performed.
- If `gh` is missing or not authenticated, report the blocker. Do not switch to another GitHub client.
