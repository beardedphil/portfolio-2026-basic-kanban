# Portfolio 2026 - Basic Kanban Board

A standalone kanban board application with Supabase integration for ticket management.

## Features

- Drag-and-drop kanban board
- Supabase backend for ticket storage
- File system integration for local ticket management
- Real-time synchronization between docs and database

## Development

```bash
npm install
npm run dev
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Project Structure

- `src/` - React application source code
- `docs/` - Project documentation, tickets, and audit logs
- `scripts/` - Utility scripts (e.g., `sync-tickets.js`)

## Repository History

This repository was originally a standalone kanban board application. It was later integrated into a monorepo/superrepo structure, and has now been restored to its independent state.

The repository has been split from the larger monorepo structure into three separate repositories:

1. **portfolio-2026-basic-kanban** (this repo) - The kanban board application ✅
2. **hal-template** - Template/scaffold for new projects (separate repo) ⏳
3. **portfolio-2026-shared-docs** - Shared documentation and process templates (separate repo) ⏳

Each repository is now independent and can be developed separately. See `REPOSITORY_SPLIT.md` for more details.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run sync-tickets` - Sync tickets between `docs/tickets/` and Supabase
