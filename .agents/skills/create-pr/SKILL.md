---
name: create-pr
description: "Create a GitHub pull request with a suitable title, a concise ASD-STE100-style summary, links to related open issues, and verified test results. Use when preparing or opening a PR."
---

# Create a Pull Request

Create a clear, accurate pull request (PR) for the current branch. Use the GitHub CLI (`gh`) for GitHub operations.

## Procedure

1. Inspect the repository instructions, current branch, worktree, and changes. Confirm which changes belong in the PR. Do not include unrelated work.
2. Read `.github/pull_request_template.md`. Use that template as the PR body. Keep its headings, order, type options, checklist items, and wording. Fill the existing prompts; do not add sections or replace the template with a new format.
3. Review the changes and choose a suitable title. Keep it concise and state the main change.
4. Find related open issues with `gh issue list --state open` and inspect their titles and descriptions. In the template's “Does this fix an open issue?” response, list each issue the PR will fix as `Closes #<number>`. Mention related issues that the PR does not fix as related, not as closing references. Do not link an issue when the relationship is uncertain.
5. Run the repository's documented CI test command locally. For example, use `npm run test:ci` when that is the project's test command. Wait for it to finish before updating the checklist. Mark the test checklist item complete only if all required tests pass.
6. Replace “(Insert description here)” under “What has changed and why?” with a concise summary of the actual changes. Use clear, direct bullet points and common words:
   - Use short, direct sentences and common words.
   - Use active voice and name the action or result.
   - Put one change in each bullet.
   - State facts. Do not add vague claims or unnecessary detail.
7. Answer the template's issue prompt accurately. Select one type of change that matches the PR. Mark checklist items only when evidence supports them; leave manual testing unchecked if it was not performed.
8. Do not add extra headings such as “Summary of changes” or “Testing”. The existing template is the complete PR description format. Do not add test logs; report the test outcome with the existing checklist.
9. Check whether the current branch is ready to publish. Do not commit or push user changes without permission. If the branch is not pushed, or contains uncommitted changes that need a commit, ask before taking those actions.
10. Use `gh pr create --title "<title>" --body "<body>"` to open the PR after the branch is available on GitHub. Report the PR URL and any test failures.

## Accuracy checks

- Do not include an issue unless its open description matches the change and the PR resolves it.
- Do not mark checklist items as complete unless the available evidence supports them.
- Do not state that manual testing passed unless it was performed.
- If `gh` is missing or not authenticated, report the blocker. Do not switch to another GitHub client.
