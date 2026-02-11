# HAL Agents Repository Restoration Plan

## Overview

The `portfolio-2026-hal-agents` repository (https://github.com/beardedphil/portfolio-2026-hal-agents) was originally a standalone repository that was later integrated into the HAL monorepo/superrepo structure. It needs to be restored to its independent state, similar to what was done for the kanban repo.

## Restoration Steps

### 1. Remove Superrepo References
- [ ] Remove any references to HAL superrepo in documentation
- [ ] Remove submodule configuration if present
- [ ] Update `.cursor/rules/` to be standalone (not pointing to superrepo)
- [ ] Remove any "this is a submodule" language from README/docs

### 2. Remove HAL Dependencies
- [ ] Identify any code dependencies on HAL superrepo structure
- [ ] Remove or replace dependencies on shared HAL code
- [ ] Ensure the repo can build/run independently
- [ ] Update package.json if needed

### 3. Update Documentation
- [ ] Update README.md to reflect standalone state
- [ ] Remove references to being part of a monorepo
- [ ] Add repository history note (was standalone, got merged, now restored)
- [ ] Update any process docs that reference superrepo structure

### 4. Verify Independence
- [ ] Test that the repo can be cloned and run standalone
- [ ] Verify all dependencies are properly declared
- [ ] Ensure build scripts work independently
- [ ] Check that documentation is accurate for standalone use

## Similar to Kanban Restoration

The restoration process should mirror what was done for `portfolio-2026-basic-kanban`:
- Remove monorepo/superrepo references
- Make Cursor rules standalone
- Update all documentation
- Ensure the repo works independently

## Repository

Target repository: https://github.com/beardedphil/portfolio-2026-hal-agents
