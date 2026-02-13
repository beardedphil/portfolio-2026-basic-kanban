# Decisions (0001-move-ticket-to-another-repo)

## Dialog-based repository selection
- **Decision:** Use a modal dialog (`MoveToRepoDialog`) with a dropdown (`<select>`) for repository selection, rather than an inline dropdown or other UI pattern.
- **Rationale:** 
  - Provides clear separation of the move action from the ticket detail view
  - Allows for better error handling and user feedback
  - Consistent with other modal patterns in the app (e.g., validation sections)
  - Provides space for clear messaging about the operation

## Button placement in ticket detail meta
- **Decision:** Place the "Move to another repo's To Do" button in the `ticket-detail-meta` section alongside ticket ID and Priority.
- **Rationale:** 
  - Keeps action buttons near ticket metadata
  - Maintains visual hierarchy (not competing with primary content)
  - Follows existing pattern of metadata display
  - **Note:** Could be moved to header actions area in future for better visibility

## Conditional button visibility
- **Decision:** Only show the button when `onMoveTicketToRepo` callback is provided, `availableRepos` exists, and there are repositories other than the current one.
- **Rationale:** 
  - Prevents showing a button that would fail or be confusing
  - Better UX: don't show functionality that isn't available
  - Matches acceptance criteria: "repositories the user has access to"

## Filter current repository from list
- **Decision:** Filter out the current repository (`halCtx?.repoFullName`) from the available repositories list in the dialog.
- **Rationale:** 
  - Prevents users from trying to move a ticket to its current location
  - Clearer UX: only shows valid target repositories
  - Matches acceptance criteria: "another repository"

## Success message with auto-close
- **Decision:** Show success message in ticket detail modal, then auto-close modal after 1.5 seconds.
- **Rationale:** 
  - Provides immediate feedback that operation succeeded
  - Auto-closing reduces friction (user doesn't need to manually close)
  - **Note:** 1.5 seconds might be too short; could be increased to 2-3 seconds or made user-dismissible

## Error handling in dialog
- **Decision:** Show error messages in the dialog itself during move operation, and in ticket detail modal if dialog is closed.
- **Rationale:** 
  - Errors during move are shown where the action is happening (dialog)
  - If user closes dialog, error persists in ticket detail modal for visibility
  - Clear error messages with actionable guidance

## Delegate move logic to HAL
- **Decision:** The actual ticket movement (updating Supabase, changing `repo_full_name`, moving to To Do column) is handled by HAL via the `onMoveTicketToRepo` callback prop.
- **Rationale:** 
  - Kanban library doesn't own data or credentials
  - HAL owns all Supabase operations
  - Keeps separation of concerns: Kanban handles UI, HAL handles data
  - Matches existing pattern for other operations (e.g., `onMoveTicket`, `onUpdateTicketBody`)

## Accessibility implementation
- **Decision:** Implement full keyboard navigation, ARIA labels, focus trap, and screen reader support.
- **Rationale:** 
  - Matches acceptance criteria: "accessible (keyboard navigable, has a visible label)"
  - Follows existing accessibility patterns in the app
  - Ensures feature is usable by all users

## Button styling
- **Decision:** Use primary button styling (blue background) for the move button, consistent with other action buttons.
- **Rationale:** 
  - Clear visual hierarchy: action buttons are prominent
  - Consistent with existing button patterns
  - Good contrast for accessibility

## No loading state in ticket detail modal
- **Decision:** Dialog shows "Moving..." state, but ticket detail modal doesn't show a loading indicator during move operation.
- **Rationale:** 
  - Dialog provides feedback during the operation
  - Modal remains interactive (user could close it if needed)
  - **Note:** Could add loading overlay in future for better UX
