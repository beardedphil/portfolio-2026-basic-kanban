# Verification (0001-move-ticket-to-another-repo)

All checks are done **in the browser only**. No terminal, devtools, or console.

## Prerequisites
1. In the project folder: `npm install` then `npm run dev`.
2. Open the app in a browser.
3. A Supabase project with the `tickets` table and at least one ticket.
4. HAL integration must provide:
   - `onMoveTicketToRepo` callback prop
   - `availableRepos` array with at least one repository other than the current one
5. At least one ticket visible in any column of the kanban board.

---

## Step 1: Open ticket details
- **Action:** Click on any ticket card in the kanban board to open the ticket detail modal.
- **Check:** 
  - Ticket detail modal opens
  - Ticket title, ID, and content are visible
- **Pass:** Modal opens and displays ticket information.

---

## Step 2: Verify button visibility
- **Action:** Look at the ticket detail modal, specifically the metadata section (below the title, showing ID and Priority if available).
- **Check:** 
  - If `availableRepos` contains repositories other than the current one: **"Move to another repo's To Do"** button is visible in the metadata section
  - If no other repositories are available: button is **not** visible
- **Pass:** Button appears/disappears correctly based on available repositories.

---

## Step 3: Open move dialog
- **Action:** Click the **"Move to another repo's To Do"** button.
- **Check:** 
  - A dialog opens with title "Move to another repo's To Do"
  - Dialog shows ticket title and ID
  - Dialog contains a dropdown labeled "Target Repository"
  - Dropdown shows available repositories (excluding current repo)
  - Dialog has "Move Ticket" and "Cancel" buttons
- **Pass:** Dialog opens with all expected elements.

---

## Step 4: Test dialog accessibility (keyboard navigation)
- **Action:** With dialog open, use keyboard only:
  - Press `Tab` to navigate through elements
  - Press `Shift+Tab` to navigate backwards
  - Press `Escape` to close dialog
  - Press `Enter` on "Move Ticket" button when a repo is selected
- **Check:** 
  - Tab navigation cycles through all focusable elements (Close button, dropdown, Move Ticket, Cancel)
  - Escape closes the dialog
  - Enter activates the Move Ticket button when enabled
- **Pass:** All keyboard interactions work correctly.

---

## Step 5: Test empty repository list
- **Action:** If possible, test with `availableRepos` containing only the current repository (or empty array).
- **Check:** 
  - Dialog shows message: "No other repositories available. Connect additional repositories to move tickets between them."
  - No dropdown or action buttons are shown
- **Pass:** Empty state is handled gracefully.

---

## Step 6: Select repository and move (success path)
- **Action:** 
  1. In the dialog, select a target repository from the dropdown
  2. Click **"Move Ticket"** button
- **Check:** 
  - Button shows "Moving..." while operation is in progress
  - Dialog closes after move completes
  - Success message appears in ticket detail modal: "Ticket moved to {repo}'s To Do column successfully."
  - Success message has a "Dismiss" button
  - Ticket detail modal closes automatically after ~1.5 seconds
  - Ticket no longer appears in the original repository's board (verify by checking the board)
- **Pass:** Move operation completes successfully with proper feedback.

---

## Step 7: Verify ticket in target repository
- **Action:** Navigate to or view the target repository's kanban board.
- **Check:** 
  - The moved ticket appears in the target repository's **To Do** column
  - Ticket has the same ID and title
- **Pass:** Ticket appears in correct location in target repository.

---

## Step 8: Test error handling
- **Action:** 
  - If possible, simulate an error (e.g., invalid repository, network error, or permission denied)
  - Attempt to move a ticket to a repository that will fail
- **Check:** 
  - Error message appears in the dialog: "Failed to move ticket. Please check your access to the target repository and try again."
  - Error message is clear and actionable
  - Dialog remains open (does not close on error)
  - "Move Ticket" button becomes enabled again (not stuck in "Moving..." state)
  - User can retry or cancel
- **Pass:** Errors are handled gracefully with clear messaging.

---

## Step 9: Test cancel operation
- **Action:** 
  1. Open move dialog
  2. Select a repository
  3. Click **"Cancel"** button (or press Escape, or click backdrop)
- **Check:** 
  - Dialog closes
  - No move operation occurs
  - Ticket remains in original location
  - No success/error messages appear
- **Pass:** Cancel works correctly without side effects.

---

## Step 10: Test button visibility across columns
- **Action:** 
  - Open tickets from different columns (To Do, Doing, Done, etc.)
  - Check if the "Move to another repo's To Do" button appears in all columns
- **Check:** 
  - Button is visible regardless of which column the ticket is in
- **Pass:** Button works from any column (as per acceptance criteria).

---

## Step 11: Test with screen reader (accessibility)
- **Action:** Enable screen reader (NVDA/JAWS/VoiceOver) and navigate the move dialog.
- **Check:** 
  - Dialog title is announced
  - Button has accessible label: "Move to another repo's To Do"
  - Dropdown is properly labeled: "Select target repository"
  - Success/error messages are announced
- **Pass:** Screen reader can navigate and understand all elements.

---

## Summary
- If steps 1–11 pass, the deliverable is verified.
- If any step fails, note which step and what you saw.
- **Note**: Steps 6-7 require HAL integration to fully verify. If HAL is not available, document that integration testing is pending.

---

## Known Limitations / Integration Requirements

1. **HAL Integration Required**: The actual ticket movement depends on HAL's implementation of `onMoveTicketToRepo` callback. This verification assumes HAL properly:
   - Updates the ticket's `repo_full_name` in Supabase
   - Moves ticket to target repo's "To Do" column (`kanban_column_id = 'col-todo'`)
   - Removes ticket from source repo's board

2. **Repository List**: The `availableRepos` prop must be provided by HAL. Verification assumes HAL correctly:
   - Fetches list of repositories user has access to
   - Filters out repositories user doesn't have write access to
   - Excludes current repository from the list

3. **Error Scenarios**: Some error scenarios (permission denied, invalid repo) may only be testable with proper HAL integration and Supabase permissions setup.
