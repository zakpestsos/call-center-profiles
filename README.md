# Call Center Profiles — agent viewer

The page call-center agents open on a call:
`https://zakpestsos.github.io/call-center-profiles/?profileId=<Profile_ID>`

GitHub Pages serves it straight from the `main` branch. There is no build step.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole viewer (HTML, CSS and JavaScript in one file). |
| `config-github.js` | `WEB_APP_URL` — the production Apps Script deployment the viewer loads profile data from. Change it only if the backend moves to a new deployment. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. Do not delete. |
| `tests/test_viewer_regions.js` | Region-pricing test suite (runs the viewer in jsdom). |
| `scripts/audit_profiles.js` | Read-only audit: renders every live profile through the viewer and reports problems. |

## Where everything else lives

- **Profile data:** the Master_Client_Profiles Google Sheet.
- **Backend and the profile builder form:** the Apps Script project "Copy of Client Profile System Fixed" (script ID `18AMwv9KQIuO412xoK0tEj6R_IhbvzdYPB_NRpXwK3_inpxpDRKhNp8Ar`). Backend code is not kept in this repo — edit and deploy it in Apps Script.

Older files (Wix pages, old copies of the Apps Script code, setup guides) were removed in the repo cleanup and remain in git history if ever needed.

## Making a change

1. Work on a branch, not directly on `main`.
2. `npm install`, then `npm test` (and `npm run audit` for changes to pricing or rendering).
3. Merge to `main`. GitHub Pages republishes within a few minutes.
4. To undo, revert the merge commit on `main`.

If a change makes previously cached profile data unsafe to render, bump `PROFILE_CACHE_VERSION` in `index.html` (for example `v1` → `v2`) so every agent's browser fetches fresh data.
