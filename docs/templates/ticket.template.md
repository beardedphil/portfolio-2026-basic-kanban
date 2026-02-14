# Ticket Template (Workspace Standard)

Create a new file at `docs/tickets/<task-id>-<short-title>.md` using this template.

**Note**: If this is a **failed ticket being retried**, see the "⚠️ FAILURE HISTORY" section below and ensure all failure markers are present.

```yaml
---
kanbanColumnId: col-todo
status: new
---
```

## Ticket

- **ID**: `<task-id>`
- **Title**: `<short title>` (if retrying a failed ticket, prefix with `[FAILED]` or `[RETRY]`)
- **Owner**: Implementation agent
- **Type**: Feature / Bug / Chore
- **Priority**: P0 / P1 / P2

## Linkage (for tracking)

- **Fixes**: `<ticket-id>` (required for bugfix tickets)
- **Category**: DnD / State / CSS / Build / Process / Other (required for bugfix tickets)

## ⚠️ FAILURE HISTORY (required if this ticket failed before)

**ONLY include this section if this ticket has failed verification and is being retried.**

- **Failed attempt count**: <number>
- **Last failed**: <date>
- **Why it failed**: <clear, specific explanation of what didn't work>
- **What was attempted**: <brief summary of the previous implementation approach>
- **Previous audit**: `docs/audit/<task-id>-<short-title>/` (review `pm-review.md` and `verification.md` for details)
- **Key learnings**: <what we learned from the failure that should inform the retry>

## Goal (one sentence)

<what we want to achieve>

## Human-verifiable deliverable (UI-only)

<Describe exactly what a non-technical human will see/click in the UI.>

## Acceptance criteria (UI-only)

- [ ] <AC 1>
- [ ] <AC 2>
- [ ] <AC 3>

## Constraints

- Keep this task as small as possible while still producing a **human-verifiable** UI change.
- Verification must require **no external tools** (no terminal, no devtools, no console).
- Add/extend **in-app** diagnostics as needed so failures are explainable from within the app.

## Non-goals

- <explicitly out of scope>

## QA failure summary (required for bugfix/retry tickets)

- <what failed, in human terms>
- <expected vs actual behavior>
- <specific acceptance criteria that failed>

## Implementation notes (optional)

- <hints, suspected cause, suggested approach>
- **If retrying a failed ticket**: explicitly reference the failure history above and explain how this attempt differs from the previous one

## Audit artifacts required (implementation agent)

Create `docs/audit/<task-id>-<short-title>/` containing:
- `plan.md`
- `worklog.md`
- `changed-files.md`
- `decisions.md`
- `verification.md` (UI-only)
