# Changelog

All notable push-level changes are documented in this file.

## 2026-02-23

### `306c1ae` - refactor: remove legacy static assets and polish active app branding

- Removed legacy static files not used by the active Next.js app:
  - `index.html`
  - `script.js`
  - `styles.css`
- Updated active header branding text to align with OpenAI/GPT/Codex portfolio positioning.

### `ac56f5a` - docs: add system architecture and request flow documentation

- Added `SYSTEM_ARCHITECTURE.md`.
- Documented:
  - high-level component architecture
  - API request flows
  - runtime module boundaries
  - deployment model
  - extension points

### `8c4e327` - docs: add complete README for OpenAI GPT Codex portfolio

- Added comprehensive `README.md` with:
  - project overview and capabilities
  - local setup and environment variables
  - scripts, routes, and API endpoint map
  - deployment and operations notes

### `0d5d9f9` - feat: rebrand app around OpenAI, GPT, and Codex

- Updated user-facing branding to OpenAI/GPT/Codex across core surfaces.
- Updated metadata, nav labeling, footer branding, and about page positioning.
- Updated package name metadata to align repository identity.
