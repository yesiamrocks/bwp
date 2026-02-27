# Build With Pavel — Organized Multi-page Static Site

## Folder structure
- `index.html` (home)
- `about/index.html`
- `contact/index.html`
- `courses/index.html`
- `courses/<course-id>/index.html`
- `legal/terms.html`, `legal/privacy.html`
- `assets/css/styles.css`
- `assets/js/app.js`, `assets/js/data.js`
- `partials/header.html`, `partials/footer.html`
- `assets/images/` (place images here)

## Run locally
Because header/footer are loaded via `fetch()`, use a local server (not `file://`):
- `python -m http.server 8000`
- or VS Code Live Server

Then open: http://localhost:8000/
