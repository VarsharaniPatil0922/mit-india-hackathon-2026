---
trigger: always_on
---

# MIT INDIA Hackathon Project Rules

## Project Context

Always read `AGENTS.md` before making significant changes.

## Development

Before implementing a feature:

1. Inspect the existing project.
2. Understand the current architecture.
3. Identify dependencies.
4. Make the smallest appropriate change.

Do not rewrite working code unnecessarily.

## Docker

When Docker is used:

- Prefer reproducible containerized environments.
- Do not install dependencies directly on the host when they belong inside a container.
- Keep Docker configuration simple.
- Do not create unnecessary services.
- Verify containers actually start before declaring the task complete.

## Git

- Never push directly to `main`.
- Work only on the current assigned branch.
- Never switch branches without user confirmation.
- Never force-push.
- Never delete branches.
- Check `git status` before committing.
- Push only to the current working branch.

## Security

- Never expose API keys.
- Never commit `.env`.
- Never hardcode secrets.
- Use `.env` for local secrets.

## AI-generated code

AI-generated code must be tested.

Do not assume generated code is correct.

If an implementation introduces unnecessary complexity, prefer a simpler solution.