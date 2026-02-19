# PM Handoff Notes (Process + Gotchas)

This file is for future PM agents working in this repo.

## Role boundaries

- PM agent work: write tickets, run `npm run sync-tickets` after editing `docs/tickets/`, review artifacts, and update rules in Supabase.
- Implementation agents: implement code, create audit artifacts, and handle feature branches + merges.

## Global rules single source of truth

- This repo is intended to be used as a submodule inside `portfolio-2026-hal/`.
- **Rules live in Supabase**, not in `.cursor/rules`. The only local rule points to Supabase and explains how to access rules there.
- Agents fetch basic instructions from Supabase and request more rules for specific scenarios as needed.

## Common gotchas we hit

- **Supabase schema drift**: if the UI shows columns but no tickets after connecting, the Supabase schema may be missing required tables (e.g. `kanban_columns`). Prefer an in-app banner that tells the user exactly what’s missing.
- **Credential source-of-truth**: when connecting via HAL postMessage / folder picker, ensure the same Supabase URL/key state is used for both fetch and update paths (DnD persistence).
- **Duplicate columns regression**: avoid merging Supabase columns with local default columns in render paths (single source of truth per mode).

## Cross-repo work

- Tickets may be *discovered* in one repo but *implemented* in another (e.g. HAL finds a kanban bug that belongs in the kanban repo). Keep the ticket where it was discovered, but ensure implementation artifacts live with the code changes.

