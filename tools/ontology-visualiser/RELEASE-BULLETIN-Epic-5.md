# Release Bulletin — Epic 5: Multi-Source Loading

**Version:** 4.5.0
**Date:** February 2026
**Branch:** `feature/epic-5-multi-source-loading`

---

## Summary

Epic 5 adds URL-based loading, recent files history, bookmarks/favorites, a visual GitHub repository browser with branch/tag selection, and a PAT settings modal with token validation. These features make the visualiser fully self-service for loading ontologies from any source.

---

## New Features

### URL Loading (Stories 5.2.1, 5.2.2)
- **Load from URL** toolbar button opens a modal where you can paste any public JSON ontology URL
- **CDN registry mode** checkbox treats the URL as a registry index and batch-loads all entries
- Friendly CORS error messages when servers block cross-origin requests
- Escape key, click-outside, and Enter key support on the modal

### Recent Files (Stories 5.3.1, 5.3.2)
- Auto-tracks the last 20 loaded ontologies with source, name, format, and timestamp
- **Recent** tab in the Library panel shows history with source icons (file, GitHub, URL, registry)
- One-click reload for URL and registry sources
- Human-readable relative timestamps ("2m ago", "3h ago", "1d ago")
- "Clear History" button to wipe recent list
- Deduplication by URL/path prevents duplicate entries

### Bookmarks / Favorites (Story 5.3.3)
- Star icon in the header toggles bookmark on the currently loaded ontology
- Bookmarked ontologies appear in a "Favorites" section at the top of the Recent tab
- Remove individual bookmarks with the x button
- Bookmark state persists via localStorage

### GitHub Repository Browser (Stories 5.1.1, 5.1.2)
- **Load from GitHub** now opens a visual modal instead of `prompt()` dialogs
- Enter `owner/repo` to connect, then browse the file tree visually
- Branch and tag selector with dropdown (fetches from GitHub API)
- Folder navigation with breadcrumb trail and back button
- JSON/JSONLD files are highlighted and clickable for loading
- File size display for all entries
- "Change Repo" button to switch repositories

### GitHub PAT Settings (Story 5.1.3 — descoped from OAuth)
- Gear icon next to "Load from GitHub" opens a settings modal
- Enter, validate, and save Personal Access Tokens
- "Remember across sessions" checkbox persists token in localStorage
- Token validation shows connected username and scopes
- "Clear Token" button to remove stored credentials
- Auto-validate on page load (non-blocking) with status dot indicator

---

## Technical Details

### Storage Architecture
| Data | Storage | Reason |
|------|---------|--------|
| Recent files (metadata) | localStorage | Lightweight, no heavy data |
| Bookmarks (metadata) | localStorage | Lightweight, no heavy data |
| GitHub PAT (session) | sessionStorage | Security default |
| GitHub PAT (persisted) | localStorage | Opt-in only |
| Ontology data (saved) | IndexedDB | Heavy JSON payloads |

### New/Modified Modules
- **`github-loader.js`** — Added GitHub browser API (`listBranches`, `listTags`, `getRepoTree`, `fetchFileContent`) and PAT management (`getGitHubPAT`, `setGitHubPAT`, `clearGitHubPAT`, `validatePAT`)
- **`library-manager.js`** — Added `addRecentFile`, `getRecentFiles`, `clearRecentFiles`, `addBookmark`, `removeBookmark`, `getBookmarks`, `isBookmarked`
- **`state.js`** — Added `githubBrowser` state object
- **`app.js`** — URL loading, recent files UI, bookmark toggle, GitHub browser functions, PAT settings, window bindings

### New HTML Modals
- `#url-modal` — URL loading with registry mode toggle
- `#github-modal` — Two-step repo browser (connect + browse)
- `#github-settings-modal` — PAT management with validation

---

## Test Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| `recent-bookmarks.test.js` | 19 | All pass |
| `github-loader.test.js` | 15 | All pass |
| Existing tests | 67 | 66 pass, 1 pre-existing failure |
| **Total** | **101** | **100 pass** |

---

## Files Changed

| File | Change Type |
|------|-------------|
| `browser-viewer.html` | Modified — 3 modals, bookmark star, gear button |
| `js/app.js` | Modified — ~300 lines added (URL, recent, bookmarks, GitHub browser, PAT settings) |
| `js/github-loader.js` | Modified — GitHub API helpers + PAT management |
| `js/library-manager.js` | Modified — Recent files + bookmarks CRUD |
| `js/state.js` | Modified — `githubBrowser` state |
| `css/viewer.css` | Modified — Recent items, bookmarks, GitHub tree styles |
| `tests/recent-bookmarks.test.js` | **New** — 19 tests |
| `tests/github-loader.test.js` | **New** — 15 tests |
| `README.md` | Modified — v4.5.0, new features |
| `ARCHITECTURE.md` | Modified — v4.5.0, new modules/data sources |
| `RELEASE-BULLETIN-Epic-5.md` | **New** — This file |
