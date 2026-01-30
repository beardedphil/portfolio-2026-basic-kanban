# Work log (0011-supabase-ticketstore-v0-connect-and-list)

## Summary
- Added Ticket Store mode: Docs | Supabase.
- Supabase mode: config panel (Project URL, Anon key, Connect), connection status, last error, "Saved locally" when config in localStorage.
- Connect flow: test query to verify table exists; on success fetch tickets and show list + Ticket Viewer; on missing table show "Supabase not initialized" and setup SQL.
- Debug panel: Ticket Store (Supabase) section.

## Commit and status (fill after commit)
When ready for verification, run from repo root:
```bash
git add -A && git status -sb
git commit -m "feat(0011): Supabase ticket store v0 — config, connect, list (read-only)"
```
Then paste below:
- **Commit hash:** _(e.g. abc1234)_
- **git status -sb:** _(output after commit)_
