# OpenCode issue automation (GPT-6 Astra)

The repository workflow `.github/workflows/opencode.yml` runs OpenCode V2's CLI in GitHub Actions using `openai/gpt-6-astra`. It creates a fix branch and pull request after typecheck and tests pass.

## One-time setup

1. Merge the workflow into the repository's default branch. GitHub's `issue_comment` trigger reads workflows from that branch.
2. Open **Settings → Secrets and variables → Actions → New repository secret**. Add **`OPENAI_API_KEY`**, with an OpenAI API key that has access to GPT-6 Astra. Never put its value in an issue or commit. Local ChatGPT/OpenCode sign-in is not automatically available to GitHub runners.
3. Under **Settings → Actions → General → Workflow permissions**, enable **Allow GitHub Actions to create and approve pull requests**. The workflow requests contents, issues, and pull-request write permissions. It creates PRs; it does not approve or merge them.
4. Ensure GitHub Actions is enabled and organizational policy permits the actions used here.

The OpenCode Agent app can remain installed. This workflow uses the documented V2 CLI with GitHub's job token for publishing, rather than an app-specific token exchange. Comments and PRs are published as `github-actions[bot]`.

## Request a fix

Create a **GitHub issue** with reproduction steps, expected/actual behavior, and acceptance criteria. Then add a new comment:

```text
/opencode Fix this issue. Add regression tests and run typecheck and tests.
```

`/oc` is also supported. The command must start the comment; a bare `/opencode` requests a fix for the issue description. The commenter must have write, maintain, or admin access to the repository.

The workflow reads the issue title/body and triggering comment. Include essential requirements there; it does not collect the complete comment history or download attachments automatically. This setup handles issue comments, not PR review comments.

## What happens

1. The bot posts a link to its Actions run.
2. A fresh default-branch checkout installs dependencies and the OpenCode CLI.
3. Astra implements the request. The workflow then runs `npm run typecheck`, `npm test`, and a whitespace check independently.
4. If checks pass and there are changes, the workflow pushes a unique branch, opens a PR, and posts the link to the issue. Merging a PR with its `Fixes #...` link closes the GitHub issue.
5. If there are no changes or a step fails, the bot comments with the outcome. Failed runs remain available in Actions. A failed check does not publish the generated changes.

Each new command starts a separate default-branch attempt; it does not update a previous AI PR. Review or close an existing attempt before requesting another. Runs for one issue are serialized. The job has a 30-minute timeout.

## Jira and APK builds

This workflow does **not** monitor or transition Jira issues. To request a Jira fix here, copy the requirements into a GitHub issue and include the Jira key/link. Automatic Jira triggering/status synchronization requires a separate integration.

It also does not build/install an APK or test a physical device. After merging, use the existing **Build Android APK** workflow and perform device acceptance.

## Troubleshooting

- **No run:** verify the workflow is on the default branch, the command starts a new issue comment, and the commenter has repository write access.
- **Missing secret/model error:** verify `OPENAI_API_KEY`, API billing/model access, and the model shown in the Actions log.
- **PR creation denied:** enable the repository setting above and check organization restrictions. The fix branch may already have been pushed if only PR creation failed.
- **Tests fail:** inspect the run log. The workflow does not skip failing tests.

Reference: [OpenCode V2 CLI CI usage](https://opencode.ai/v2/docs/cli/commands/#ci).

## Setup verification

The workflow YAML, two embedded GitHub scripts, and five Bash scripts passed local syntax checks. Five mocked request-handler checks covered `/opencode`, `/oc`, multiline requests, read-only commenters, and non-command prefixes. A live GitHub/model run has not been performed; it requires the repository secret and settings described above.
