# MIT INDIA HACKATHON 2026 — AGENTS.md

## 1. PROJECT

National Level MIT INDIA Hackathon 2026
Pune Qualifier — 21–22 August 2026

The problem statement will be released on the spot.

Our goal is to build a simple, reliable, impressive and demonstrable solution
within the available hackathon time and maximize judging score.

---

## 2. TEAM

- Sakshi — Team Lead / Integration
- Member 2 — TBD
- Member 3 — TBD
- Member 4 — TBD

Team roles will be finalized after the problem statement is released.

---

## 3. CURRENT PROBLEM STATEMENT

STATUS: NOT RELEASED

Do NOT assume or invent the problem statement.

Once released, update:

`requirements/PROBLEM_STATEMENT.md`

with the exact official problem statement.

---

## 4. DEVELOPMENT PHILOSOPHY

Prioritize:

1. Working solution
2. Core problem requirements
3. Simple architecture
4. Fast implementation
5. Reliable demo
6. Good user experience
7. Testing
8. Presentation and judging impact

Avoid unnecessary complexity.

For every technical decision, prefer the simplest solution that satisfies
the requirement.

Do not build features only because they are technically interesting.

---

## 5. AI DEVELOPMENT RULES

AI tools and coding agents are allowed and encouraged when they save time.

Before making significant changes, the AI agent MUST:

1. Read this file.
2. Inspect the existing project structure.
3. Understand the relevant existing code.
4. Identify dependencies and potential side effects.

The AI agent MUST NOT:

- Invent requirements.
- Invent APIs or data.
- Rewrite working code unnecessarily.
- Introduce unnecessary frameworks or dependencies.
- Change the architecture without justification.
- Modify unrelated files.
- Claim that code works without testing it.
- Commit secrets or API keys.
- Push directly to `main`.

When multiple solutions are possible, prefer the fastest,
simplest and most reliable solution suitable for the hackathon.

---

## 6. GIT WORKFLOW

### Branches

`main` = stable, demo-ready code.

Each team member works on their own branch:

- `sakshi`
- `member-2`
- `member-3`
- `member-4`

Never work directly on `main`.

### Before starting work

Make sure the branch is up to date with `main`.

### After completing work

1. Test the changes.
2. Review the changed files.
3. Commit with a clear commit message.
4. Push ONLY to the current member branch.
5. Create a Pull Request to `main`.
6. Request review before merging.

### AI Git rule

Before pushing, verify the current branch.

NEVER push hackathon work to `main` directly.

NEVER force-push unless explicitly approved by the team lead.

---

## 7. DO NOT COMMIT SECRETS

Never commit:

- API keys
- passwords
- tokens
- private credentials
- `.env` files
- private certificates

Use `.env` for local secrets and `.env.example` for required variables.

---

## 8. DOCKER

Docker should be used when it improves consistency,
deployment or development speed.

Do not create unnecessary containers or services.

Keep the Docker architecture as simple as possible.

All team members should be able to start the project using the documented
Docker commands.

Do not add databases, queues, caches or other services unless the solution
actually requires them.

---

## 9. PROBLEM-SOLVING PROCESS

After the problem statement is released:

1. Understand the exact problem.
2. Identify users and stakeholders.
3. Identify the core pain point.
4. Identify constraints.
5. Identify judging opportunities.
6. Generate multiple possible solutions.
7. Compare solutions on:
   - feasibility
   - implementation time
   - impact
   - uniqueness
   - reliability
   - demo potential
8. Select the simplest high-impact solution.
9. Define MVP.
10. Define optional features.
11. Design architecture.
12. Divide work among team members.
13. Implement MVP first.
14. Integrate continuously.
15. Test.
16. Prepare the final demo and presentation.

Do NOT start major implementation before the solution and architecture
are agreed upon.

---

## 10. MVP FIRST

The MVP is the highest priority.

The team must have a working end-to-end flow as early as possible.

Example:

User
→ Frontend
→ Backend
→ Core logic / AI
→ Result

Optional features must never endanger the working MVP.

If time becomes limited:

STOP adding features.

Focus on:

- fixing bugs
- integration
- testing
- UI polish
- demo
- presentation

---

## 11. DEFINITION OF DONE

A task is NOT complete merely because code has been written.

A task is complete only when:

- The required functionality is implemented.
- It integrates with the existing project.
- It has been tested.
- Existing functionality still works.
- No unnecessary code was introduced.
- Required documentation is updated.
- The code is committed to the correct branch.

---

## 12. TASK OWNERSHIP

Every task must have:

- Owner
- Objective
- Requirements
- Dependencies
- Acceptance criteria
- Definition of done

Avoid duplicate work between team members.

If a task affects another member's module, communicate before making
large changes.

---

## 13. CODE QUALITY

Code should be:

- Simple
- Readable
- Modular
- Maintainable
- Appropriate for the hackathon timeline

Do not over-engineer.

Do not optimize prematurely.

Do not create abstractions unless they provide real value.

---

## 14. TESTING

Before creating a Pull Request:

- Run the relevant tests.
- Verify the feature manually when appropriate.
- Verify the application starts successfully.
- Check important error cases.
- Check that existing functionality still works.

The final project must have a reliable demo flow.

---

## 15. DOCUMENTATION

Update documentation when important behaviour,
architecture or setup instructions change.

At minimum, maintain:

- `README.md`
- `requirements/PROBLEM_STATEMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/SOLUTION.md`

Additional documentation can be created when useful.

---

## 16. DECISION RULE

When choosing between two approaches:

Prefer the approach that is:

- Faster to implement
- Easier to understand
- Easier to test
- More reliable during the demo
- Easier for all four members to maintain

A simpler working solution is better than a complicated unfinished solution.

---

## 17. CURRENT STATUS

Repository setup in progress.

Problem statement: NOT RELEASED

Architecture: NOT DECIDED

Technology stack: NOT DECIDED

Team task allocation: NOT DECIDED

MVP: NOT DECIDED

After the official problem statement is released,
update this section immediately.