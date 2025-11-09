# Code Review – `app.js`

## Findings
1. **High – Editing blur swallows the first Delete/Toggle click** (`app.js:105-152`, `app.js:167-187`): Exiting inline edit calls `teardown()` on the input’s `blur`, which immediately runs `refreshUI()` and rebuilds the entire list before the button click that caused the blur is dispatched. If you click Delete (or Toggle) while an edit field is focused, the first click only closes the editor and the intended action never fires because the original button no longer exists when the click event should bubble. Users must click twice, which feels broken. Consider delaying the refresh until after the pending click (e.g., `requestAnimationFrame`), or avoid destroying the row while the pointer event is still in flight.
2. **Medium – Tasks vanish on every reload** (`app.js:7-103`): The single in-memory `tasks` array is never persisted. Refreshing the page or navigating away silently wipes the entire list, which is an unexpected data-loss scenario for a todo app. Persisting to `localStorage` (or at least warning the user) would align with typical expectations.
3. **Low – Focus/accessibility regressions from full rerenders** (`app.js:14-31`, `app.js:189-192`): `refreshUI()` recreates the whole `<ul>` on every operation and there is no attempt to restore the user’s previous focus. After toggling or deleting with the keyboard, focus disappears from the control the user was on, forcing them to Tab from the top again. Additionally, the clear-completed handler always forces focus back to the input, overriding the user’s context. Consider preserving focused element IDs before rerendering or using progressive enhancement that mutates only the affected row.

## Questions / Follow-ups
- Are we planning to add at least smoke tests (Playwright or even unit tests around the reducer-style helpers) to prevent regressions in editing/toggling flows?
- Should tasks persist between sessions (e.g., `localStorage`) or is this intentionally ephemeral?
