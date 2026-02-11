# Repository Split Documentation

This repository (`portfolio-2026-basic-kanban`) was originally a standalone kanban board application. It was later integrated into a monorepo/superrepo structure, and is now being restored to its independent state. The repository has been split from the larger monorepo structure into three separate, independent repositories.

## The Three Repositories

### 1. portfolio-2026-basic-kanban (This Repo) ✅
- **Purpose**: The kanban board application
- **Repository**: https://github.com/beardedphil/portfolio-2026-basic-kanban
- **Contents**: 
  - React application (`src/`)
  - Project-specific documentation (`docs/`)
  - Build configuration and scripts
- **Status**: ✅ Restored to standalone and independent state
- **Note**: This was the original standalone repo that got merged into a monorepo; it's now been restored to independence

### 2. hal-template (Separate Repo)
- **Purpose**: Template/scaffold for creating new projects
- **Contents**: 
  - `.cursor/rules/` - Cursor agent rules
  - `docs/templates/` - Ticket and review templates
  - `docs/process/` - Process documentation
  - `scripts/sync-tickets.js` - Ticket sync script
  - `.env.example` - Environment variable template
- **Status**: ⚠️ Needs to be extracted into its own repository
- **Action Required**: 
  1. Create a new repository named `hal-template`
  2. Copy the contents that were previously in `hal-template/` directory
  3. Initialize as a standalone git repository

### 3. portfolio-2026-shared-docs (Separate Repo)
- **Purpose**: Shared documentation and process templates
- **Contents**:
  - Reusable documentation templates
  - Process documentation that applies across projects
  - Shared Cursor rules (if needed)
- **Status**: ⚠️ Needs to be created
- **Action Required**:
  1. Create a new repository named `portfolio-2026-shared-docs`
  2. Extract shared templates and process docs from this repo
  3. Initialize as a standalone git repository

## What Was Removed

From this repository:
- ✅ `hal-template/` directory (to be moved to separate repo)
- ✅ HAL project wizard UI (no longer needed)
- ✅ Superrepo/submodule references in documentation
- ✅ References to `portfolio-2026-hal/` superrepo

## Benefits of the Split

1. **Independence**: Each repository can be developed, versioned, and deployed independently
2. **Isolation**: Changes to one component don't affect others
3. **Clarity**: Clear separation of concerns
4. **Flexibility**: Each repo can have its own release cycle and dependencies

## Next Steps

1. ✅ Kanban app repo cleaned up (this repo)
2. ⏳ Extract `hal-template` into its own repository
3. ⏳ Create `portfolio-2026-shared-docs` repository
4. ⏳ Update any cross-repo references if needed
