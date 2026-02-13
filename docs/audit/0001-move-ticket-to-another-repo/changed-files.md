# Changed files (0001-move-ticket-to-another-repo)

## Modified

| Path | Change |
|------|--------|
| `src/App.tsx` | Added `MoveToRepoDialog` component (lines 874-1055). Added `onMoveTicketToRepo` and `availableRepos` props to `TicketDetailModal` (lines 1098-1099). Added button in ticket detail meta section (lines 1246-1255). Added success/error message display (lines 1257-1271). Added dialog integration (lines 1336-1344). Passed props from HAL context to modal (lines 3530-3531). |
| `src/HalKanbanContext.tsx` | Added `onMoveTicketToRepo?: (ticketPk: string, targetRepoFullName: string) => Promise<void>` and `availableRepos?: string[]` to `HalKanbanContextValue` interface (lines 41-44). |
| `src/KanbanBoard.tsx` | Added `onMoveTicketToRepo` and `availableRepos` props to `KanbanBoardProps` interface (lines 38-41). Added props to component function signature (lines 59-60). Added props to context value (lines 78-79). Added props to dependency array (lines 96-97). |
| `src/index.css` | Added `.ticket-detail-move-repo-btn` styles (lines 466-487). Added `.ticket-detail-success` styles (lines 488-511). |

## Created

| Path | Purpose |
|------|---------|
| `docs/audit/0001-move-ticket-to-another-repo/qa-report.md` | QA review report |
| `docs/audit/0001-move-ticket-to-another-repo/verification.md` | UI-only verification steps |
| `docs/audit/0001-move-ticket-to-another-repo/changed-files.md` | This file |
| `docs/audit/0001-move-ticket-to-another-repo/decisions.md` | Design/tech decisions |

## Unchanged
- package.json, index.html, src/main.tsx, src/frontmatter.ts, vite.config.ts, tsconfig.*, .gitignore
- Existing ticket detail modal functionality unchanged
- Existing kanban board functionality unchanged
