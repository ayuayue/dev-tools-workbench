# Hide All Group And Remove Favorites Page

## Summary

Remove the visible `all` and `favorites` browse pages from the workbench navigation.
Keep per-tool favorite starring and persisted favorite data, but remove the dedicated favorites browsing surface.

## Goals

- Hide the visible "All Tools" entry from the sidebar and main browsing flow.
- Remove the visible "Favorites" page from the sidebar and main browsing flow.
- Keep the star toggle on tool cards and preserve favorite IDs in local storage and config import/export.
- Keep search working across the full tool catalog without relying on an `all` page state.
- Preserve drag sorting only for real module groups.

## Non-Goals

- Removing favorite data from storage or import/export.
- Changing the underlying tool execution model, tabs, or workspace behavior.
- Redesigning sidebar layout or search UI beyond the minimum changes required.

## Current State

`src/App.tsx` treats `all` and `favorites` as special top-level groups.
The app initializes into `all`, search behavior leans on `all` as a catch-all browse state, and several empty states and status messages are specific to the all/favorites pages.
`src/data/toolRegistry.ts` also exposes `all` and `favorites` in `TOOL_GROUPS`, which makes them appear in the sidebar alongside real tool modules.

## Recommended Approach

Use only real tool groups as visible navigation targets and remove the browse-page concept for `all` and `favorites`.

Implementation intent:

- Filter sidebar-visible groups down to real module groups only.
- Change app startup fallback from `all` to the first real group.
- Keep search global across real tools, but render results directly in the main content area without switching to an `all` page mode.
- Keep favorite toggling and persistence, but remove favorites-page-specific rendering, counts, labels, and empty states.
- Remove browse-only messaging and related branches that only existed for `all` or `favorites`.

## Alternatives Considered

### 1. Hide entries only, keep internal `all` and `favorites` flows

This is the smallest edit, but it leaves hidden states and page-specific conditionals in place.
That increases the risk of future UI inconsistencies when search or fallback logic re-enters those hidden states.

### 2. Remove `favorites`, keep hidden `all` as an internal search page

This reduces some complexity, but it keeps the app conceptually dependent on an invisible browse page.
The resulting state model remains harder to reason about than necessary.

### 3. Recommended: remove both visible browse pages from the active UI model

This gives the cleanest navigation and the simplest future maintenance story.
The implementation is still small because it mainly deletes special cases rather than introducing new abstractions.

## Architecture Changes

### Navigation

The visible sidebar list should be built from real module groups only, such as `text`, `format`, `encode`, and other actual tool categories.
`all` and `favorites` should no longer be user-selectable destinations.

### Active Group State

The active group should default to the first real module group.
If persisted or transient state ever points at `all` or `favorites`, the app should normalize back to a real group instead of rendering a removed page.

### Search

Search should continue matching against the full tool catalog, but only across real tools.
The result presentation should be independent of `all` and should render as a search-results state inside the main content area.

### Favorites

Favorite IDs remain part of application state, local storage, and config export/import.
The favorite star remains available on tool cards and tool lists.
The only removed behavior is the dedicated favorites browse page.

## Component-Level Changes

### `src/data/toolRegistry.ts`

- Remove `all` and `favorites` from visible group definitions used for navigation.
- Keep type compatibility only where needed to avoid broader churn during this change.
- Ensure filtering helpers still operate correctly for real module groups.

### `src/App.tsx`

- Remove translated metadata that only exists for `all` and `favorites` page rendering.
- Change initial active group selection away from `all`.
- Remove search fallbacks and browse-only branches that depend on `all` or `favorites`.
- Remove favorites-page sections, counts, labels, and empty-state handling.
- Keep favorite persistence and favorite toggle feedback messages.
- Limit reorder logic to real module groups.

### Sidebar and Main Content

- Sidebar should render only real module groups.
- Main content should show either the selected real group or global search results.
- Empty states should be generic to group filtering or search, not to a removed browse page.

## Data Flow

1. User selects a real group from the sidebar.
2. App filters tools for that group.
3. If search text exists, the app computes matching tools across the full real-tool catalog.
4. Rendered cards remain star-able, and star actions update favorite IDs in state and storage.
5. No flow routes the user into an `all` or `favorites` page state.

## Error Handling And Edge Cases

- If an old persisted state references `all` or `favorites`, normalize to the first real group.
- If a search has no matches, show the existing generic no-results message.
- If a user has favorite IDs saved for tools that still exist, keep them intact with no visible favorites page.
- If favorite IDs refer to removed tools, existing filtering behavior should continue to ignore missing tools gracefully.

## Testing Strategy

- Verify the sidebar no longer shows "全部工具 / All Tools" or "收藏工具 / Favorites".
- Verify initial load lands on the first real group.
- Verify search still finds tools from outside the currently selected group.
- Verify clicking the star still adds/removes favorites and persists through reload.
- Verify config export/import still round-trips favorite IDs.
- Verify no empty-state or status copy still references the removed pages.
- Run `pnpm run check` after implementation.

## Risks

- Search logic may currently rely on `all` semantics in more places than the initial pass reveals.
- Some copy or count badges may still assume `favorites` exists unless all page-specific branches are removed.
- If type cleanup is too aggressive, it could create avoidable churn; this change should prefer minimal safe deletion.

## Rollout Notes

This is a local UI simplification with no data migration requirement.
Existing favorite data remains compatible.
