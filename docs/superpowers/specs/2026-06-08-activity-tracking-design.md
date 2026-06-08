# Activity Tracking — Design Spec
Date: 2026-06-08

## Goal
Send frontend events to `POST /api/v1/activity/events` so the backend activity system captures user behaviour.

## API Contract
```
POST /api/v1/activity/events
Body: { type, sessionId?, projectId?, page?, metadata? }
Response: 202 { status: "accepted" }
```
All calls are fire-and-forget (no await, no UI blocking on failure).

## Architecture

### New file: `src/api/activity.js`
Thin wrapper that calls the endpoint. Silently swallows errors.

```js
activityApi.record(type, opts = {})
// opts: { sessionId, projectId, page, metadata }
```

### Modifications
| File | What changes |
|---|---|
| `src/api/activity.js` | New file |
| `src/context/WizardContext.jsx` | Import activityApi; fire events in setPage, submitStep1/2/3, generatePDF, createProject |
| `src/context/AuthContext.jsx` | Fire events in login, register, logout |
| `src/pages/ProjectDetail.jsx` | Fire event on project delete |

## Event Catalogue
| Type | Metadata |
|---|---|
| `frontend.page_view` | `{ from }` |
| `frontend.wizard.step_submitted` | `{ step, mode: "session"\|"project" }` |
| `frontend.pdf_generated` | `{ mode }` |
| `frontend.auth.login` | — |
| `frontend.auth.register` | — |
| `frontend.auth.logout` | — |
| `frontend.project_created` | — |
| `frontend.project_deleted` | — |

## Non-goals
- No retry logic (fire-and-forget)
- No buffering/batching
- No UI feedback for tracking
