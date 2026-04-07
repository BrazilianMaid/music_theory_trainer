# Project Pipeline — Claude Code Orchestration File

This file is the persistent rulebook for all agent activity in this repository.
Every Claude Code session reads this file first. No agent operates outside these rules.

---

## Pipeline Overview

This project uses a 7-agent pipeline with manual developer gates between each handoff.
Agent prompts live in `/agents/`. Load the appropriate agent file at the start of each session.

```
[Agent 1] Intake & Planner
[Agent 2] Architect
[Agent 3] UI/UX Designer
[Agent 4] Builder          ← fully self-directed
[Agent 5] Code Reviewer
[Agent 6] QA & Peer Review
[Agent 7] Deployment & Monitor
```

---

## Global Rules — Apply to Every Agent

### Gates
- No agent proceeds to the next phase without explicit developer approval in chat.
- Gate sign-off must be logged in `docs/decisions.md` with a timestamp.
- "Looks good" is not sign-off. Sign-off is: *"Approved. Agent [N] proceed."*

### Branching
- All code work happens on feature branches. Format: `feature/agent4-[feature-name]`
- Never commit directly to `main`.
- `main` is only touched by Agent 7 at deployment, after all gate approvals are logged.

### Commit Messages
Follow conventional commits format:
```
feat: add user authentication module
fix: resolve null pointer on empty cart
chore: update dependencies
docs: add architecture decision for auth approach
```

### Logging
Every agent writes to the repo. Nothing lives only in chat.

| File | Owner | Trigger |
|---|---|---|
| `docs/build-log.md` | Agent 4 | Every build session |
| `docs/architecture.md` | Agent 2 | Architecture phase; updated on approved changes |
| `docs/decisions.md` | Any agent | Any deviation or gate approval |
| `docs/deployment-log.md` | Agent 7 | Every deployment |
| `docs/qa-reports/` | Agent 6 | Every QA cycle (timestamped) |

### Unauthorized Actions
No agent may:
- Add features not in the approved spec
- Change the project goal or scope
- Approve its own gate
- Merge to `main`
- Act on missing information — flag it and stop

### Missing Information Protocol
If an agent cannot complete its task due to missing information:
1. State exactly what is missing
2. State what the impact is
3. Stop and wait for developer input
Do not guess. Do not proceed with assumptions.

---

## How to Start a Session

1. Open Claude Code in the project root
2. Tell Claude which agent is active: *"We are running Agent [N]."*
3. Claude Code will load this file automatically and reference the appropriate agent prompt in `/agents/`
4. Provide the required inputs for that agent (listed in each agent file)

---

## Tech Stack Defaults

These apply unless Agent 2 documents a different decision in `docs/architecture.md`:

- **Frontend:** React (Vite)
- **Hosting:** Vercel
- **Version control:** GitHub
- **Error monitoring:** Sentry (free tier)
- **Uptime monitoring:** UptimeRobot (free tier)
- **Styling:** Tailwind CSS
- **Environment variables:** `.env.example` maintained in repo (no secrets committed)

---

## Roadmap (Deferred — Do Not Implement in v1)

- Automated test suite and CI/CD pre-deploy testing
- Parallel agent execution
- Staging environment
- Database and auth layer standards
- Multi-environment `.env` management
