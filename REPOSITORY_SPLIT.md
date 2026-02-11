# Repository Split Documentation

This repository (`portfolio-2026-basic-kanban`) was originally a standalone kanban board application. It was later integrated into a monorepo/superrepo structure (HAL), and is now being restored to its independent state.

## Two Subrepos Being Restored

There are **two subrepos** that need to be restored to their independent states:

1. **portfolio-2026-basic-kanban** (this repo) - ✅ Restored
2. **portfolio-2026-hal-agents** - ⏳ Needs restoration to https://github.com/beardedphil/portfolio-2026-hal-agents

The HAL template and shared docs can continue to live in the HAL superrepo for now.

## The Two Subrepos

### 1. portfolio-2026-basic-kanban (This Repo) ✅
- **Purpose**: The kanban board application
- **Repository**: https://github.com/beardedphil/portfolio-2026-basic-kanban
- **Contents**: 
  - React application (`src/`)
  - Project-specific documentation (`docs/`)
  - Build configuration and scripts
- **Status**: ✅ Restored to standalone and independent state
- **Note**: This was the original standalone repo that got merged into a monorepo; it's now been restored to independence

### 2. portfolio-2026-hal-agents ⏳
- **Purpose**: Agent implementations used by HAL
- **Repository**: https://github.com/beardedphil/portfolio-2026-hal-agents
- **Status**: ⚠️ Needs to be restored to standalone state
- **Action Required**: 
  1. Remove any superrepo/submodule references
  2. Remove any dependencies on HAL superrepo structure
  3. Update documentation to reflect standalone state
  4. Ensure it can work independently
  5. Similar cleanup as done for kanban repo

## HAL Template & Shared Docs

The HAL template and shared documentation can continue to live in the HAL superrepo for now. They don't need to be extracted into separate repositories at this time.

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
2. ⏳ Restore `portfolio-2026-hal-agents` to standalone state
   - Remove superrepo/submodule references
   - Remove HAL superrepo dependencies
   - Update documentation
   - Ensure independence
