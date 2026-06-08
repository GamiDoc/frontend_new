# Activity Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send frontend events to `POST /api/v1/activity/events` so the backend activity system captures user page views, wizard actions, auth events, and project operations.

**Architecture:** A thin `activityApi` wrapper calls the backend endpoint as fire-and-forget (errors silently swallowed). WizardContext is the central tracking point for page navigation and wizard actions. AuthContext tracks auth events. ProjectDetail tracks project deletion.

**Tech Stack:** React 18, Vite, existing `api` client in `src/api/client.js`

---

### Task 1: Create `src/api/activity.js`

**Files:**
- Create: `src/api/activity.js`

- [ ] **Step 1: Create the file**

```js
import { api } from './client';

export const activityApi = {
  record(type, opts = {}) {
    const { sessionId, projectId, page, metadata } = opts;
    const body = { type };
    if (sessionId) body.sessionId = sessionId;
    if (projectId) body.projectId = projectId;
    if (page) body.page = page;
    if (metadata) body.metadata = metadata;
    api.post('/activity/events', body).catch(() => {});
  },
};
```

- [ ] **Step 2: Verify the file exists**

```bash
cat src/api/activity.js
```

Expected: file content printed with no error.

- [ ] **Step 3: Commit**

```bash
git add src/api/activity.js
git commit -m "feat(activity): add activityApi.record() fire-and-forget wrapper"
```

---

### Task 2: Modify `src/context/WizardContext.jsx` — page views

**Files:**
- Modify: `src/context/WizardContext.jsx`

Track page navigation. `setPage` is called every time the user moves between wizard steps or app sections.

- [ ] **Step 1: Add import at top of file**

After the existing imports (currently lines 1-3), add:

```js
import { activityApi } from '../api/activity';
```

- [ ] **Step 2: Update `setPage` callback**

Find this existing callback (around line 86-89):
```js
const setPage = useCallback((newPage) => {
  window.history.pushState({ page: newPage }, '', '#' + newPage);
  setPageRaw(newPage);
}, []);
```

Replace with:
```js
const setPage = useCallback((newPage) => {
  window.history.pushState({ page: newPage }, '', '#' + newPage);
  setPageRaw(newPage);
  activityApi.record('frontend.page_view', { page: newPage });
}, []);
```

- [ ] **Step 3: Manual smoke test**

Open the app in the browser, navigate between pages (landing → start wizard → setup → back). Open DevTools Network tab. Confirm `POST /api/v1/activity/events` requests appear with `type: "frontend.page_view"`. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/context/WizardContext.jsx
git commit -m "feat(activity): track page views in WizardContext.setPage"
```

---

### Task 3: Modify `src/context/WizardContext.jsx` — wizard step events

**Files:**
- Modify: `src/context/WizardContext.jsx`

Track step submissions and project creation. All events are fire-and-forget, called after the successful API call inside each try block.

- [ ] **Step 1: Update `submitStep1`**

Find the `submitStep1` callback. Inside the `try` block, after `setPage('methods')` (near the end of the try block), add:

```js
// at end of try block in submitStep1, right before the closing brace of try:
const mode = pendingAuthProject || editingProjectId ? 'project' : 'session';
activityApi.record('frontend.wizard.step_submitted', {
  page: 'setup',
  sessionId: editingProjectId ? undefined : sessionId,
  projectId: editingProjectId || undefined,
  metadata: { step: 1, mode },
});
// also track project creation when a new auth project is created
if (pendingAuthProject) {
  activityApi.record('frontend.project_created', {
    page: 'setup',
    projectId: editingProjectId || undefined,
  });
}
```

Wait — `editingProjectId` may have just been set inside the `if (pendingAuthProject)` branch. In that branch, the new project.projectId is set via `setEditingProjectId(project.projectId)`. But React state updates are async so `editingProjectId` is still null at that point in the same render.

Instead, capture the ID in a local variable. The full updated `submitStep1` `try` block should look like:

```js
try {
  let resolvedProjectId = editingProjectId;

  if (pendingAuthProject) {
    const project = await projectApi.create(step1Data.projectName || step1Data.projectType || 'Evaluation Plan', step1Data.projectType || '');
    resolvedProjectId = project.projectId;
    setEditingProjectId(project.projectId);
    setCurrentProjectId(project.projectId);
    setPendingAuthProject(false);
    await projectApi.saveStep(project.projectId, 1, step1Data);
    const recResult = await projectApi.recommend(project.projectId, 2);
    setRecommendations(recResult?.recommendations || []);
    activityApi.record('frontend.project_created', { page: 'setup', projectId: resolvedProjectId });
  } else if (editingProjectId) {
    if (step1Data.projectName) {
      await projectApi.update(editingProjectId, step1Data.projectName, step1Data.projectType || '');
    }
    await projectApi.saveStep(editingProjectId, 1, step1Data);
    const recResult = await projectApi.recommend(editingProjectId, 2);
    setRecommendations(recResult?.recommendations || []);
  } else {
    await sessionApi.saveStep(sessionId, 1, step1Data);
    const recResult = await sessionApi.recommend(sessionId, 2);
    setRecommendations(recResult?.recommendations || []);
  }
  setSavedSnapshots((prev) => ({ ...prev, 1: JSON.parse(JSON.stringify(step1Data)) }));
  setMaxStep((prev) => Math.max(prev, 2));
  activityApi.record('frontend.wizard.step_submitted', {
    page: 'setup',
    sessionId: resolvedProjectId ? undefined : sessionId,
    projectId: resolvedProjectId || undefined,
    metadata: { step: 1, mode: resolvedProjectId ? 'project' : 'session' },
  });
  setPage('methods');
} catch (e) {
  setError(e.message || 'Failed to save step 1.');
}
```

- [ ] **Step 2: Update `submitStep2`**

Inside `submitStep2`'s `try` block, after `setMaxStep(...)` and before (or after) the `setPage('instruments')` call, add:

```js
activityApi.record('frontend.wizard.step_submitted', {
  page: 'methods',
  sessionId: editingProjectId ? undefined : sessionId,
  projectId: editingProjectId || undefined,
  metadata: { step: 2, mode: editingProjectId ? 'project' : 'session' },
});
```

- [ ] **Step 3: Update `submitStep3`**

Inside `submitStep3`'s `try` block, after `setSavedSnapshots(...)` and before `setPage('evaluation')`, add:

```js
activityApi.record('frontend.wizard.step_submitted', {
  page: 'instruments',
  sessionId: editingProjectId ? undefined : sessionId,
  projectId: editingProjectId || undefined,
  metadata: { step: 3, mode: editingProjectId ? 'project' : 'session' },
});
```

- [ ] **Step 4: Update `generatePDF`**

Inside `generatePDF`, after the final `return result` of each branch but before the function ends, add tracking. Replace the whole `generatePDF` callback with:

```js
const generatePDF = useCallback(async () => {
  if (editingProjectId) {
    await projectApi.saveStep(editingProjectId, 4, step4Data);
    const result = await projectApi.generatePDF(editingProjectId);
    setPdfUrl(result?.pdfUrl || null);
    activityApi.record('frontend.pdf_generated', {
      page: 'evaluation',
      projectId: editingProjectId,
      metadata: { mode: 'project' },
    });
    return result;
  }
  await sessionApi.saveStep(sessionId, 4, step4Data);
  const result = await sessionApi.generatePDF(sessionId);
  setPdfUrl(result?.pdfUrl || null);
  activityApi.record('frontend.pdf_generated', {
    page: 'evaluation',
    sessionId,
    metadata: { mode: 'session' },
  });
  return result;
}, [editingProjectId, sessionId, step4Data]);
```

- [ ] **Step 5: Manual smoke test**

Run through the full wizard (setup → methods → instruments → evaluation → generate PDF). Confirm in DevTools Network:
- `frontend.wizard.step_submitted` events with `step: 1`, `step: 2`, `step: 3`
- `frontend.pdf_generated` event
- If started from dashboard as authenticated user: `frontend.project_created` event

- [ ] **Step 6: Commit**

```bash
git add src/context/WizardContext.jsx
git commit -m "feat(activity): track wizard step submissions and PDF generation"
```

---

### Task 4: Modify `src/context/AuthContext.jsx` — auth events

**Files:**
- Modify: `src/context/AuthContext.jsx`

- [ ] **Step 1: Add import**

After the existing imports (lines 1-3), add:

```js
import { activityApi } from '../api/activity';
```

- [ ] **Step 2: Update `login` callback**

Find the `login` callback (around line 51-55):
```js
const login = useCallback(async (email, password) => {
  const result = await authApi.login(email, password);
  applyAuthResult(result);
  return result;
}, [applyAuthResult]);
```

Replace with:
```js
const login = useCallback(async (email, password) => {
  const result = await authApi.login(email, password);
  applyAuthResult(result);
  activityApi.record('frontend.auth.login', { page: 'auth' });
  return result;
}, [applyAuthResult]);
```

- [ ] **Step 3: Update `register` callback**

Find the `register` callback (around line 57-61):
```js
const register = useCallback(async (email, password) => {
  const result = await authApi.register(email, password);
  applyAuthResult(result);
  return result;
}, [applyAuthResult]);
```

Replace with:
```js
const register = useCallback(async (email, password) => {
  const result = await authApi.register(email, password);
  applyAuthResult(result);
  activityApi.record('frontend.auth.register', { page: 'auth' });
  return result;
}, [applyAuthResult]);
```

- [ ] **Step 4: Update `logout` callback**

Find the `logout` callback (around line 63-67):
```js
const logout = useCallback(async () => {
  try { await authApi.logout(); } catch { /* ignore */ }
  clearLogoutTimer();
  setAccessToken(null);
  setUser(null);
}, [clearLogoutTimer]);
```

Replace with:
```js
const logout = useCallback(async () => {
  activityApi.record('frontend.auth.logout', { page: 'auth' });
  try { await authApi.logout(); } catch { /* ignore */ }
  clearLogoutTimer();
  setAccessToken(null);
  setUser(null);
}, [clearLogoutTimer]);
```

Note: `logout` fires the event before clearing the token so the Authorization header is still attached (the activity endpoint accepts unauthenticated requests too, so this is just a nice-to-have).

- [ ] **Step 5: Manual smoke test**

Log in, log out, register a new account. Check DevTools Network for `frontend.auth.login`, `frontend.auth.logout`, `frontend.auth.register` events.

- [ ] **Step 6: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat(activity): track auth events (login, register, logout)"
```

---

### Task 5: Modify `src/pages/ProjectDetail.jsx` — project delete event

**Files:**
- Modify: `src/pages/ProjectDetail.jsx`

- [ ] **Step 1: Add import**

After the existing imports (lines 1-6), add:

```js
import { activityApi } from '../api/activity';
```

- [ ] **Step 2: Update `handleDelete`**

Find the existing `handleDelete` function (lines 83-93):
```js
async function handleDelete() {
  if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
  setDeleting(true);
  try {
    await projectApi.delete(projectId);
    setPage('dashboard');
  } catch (e) {
    setError(e.message);
    setDeleting(false);
  }
}
```

Replace with:
```js
async function handleDelete() {
  if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
  setDeleting(true);
  try {
    await projectApi.delete(projectId);
    activityApi.record('frontend.project_deleted', { page: 'project-detail', projectId });
    setPage('dashboard');
  } catch (e) {
    setError(e.message);
    setDeleting(false);
  }
}
```

- [ ] **Step 3: Manual smoke test**

Delete a project from ProjectDetail. Check DevTools Network for `frontend.project_deleted` event with the correct `projectId`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ProjectDetail.jsx
git commit -m "feat(activity): track project deletion"
```

---

## Self-Review

**Spec coverage:**
- ✓ `POST /api/v1/activity/events` wrapper → Task 1
- ✓ `frontend.page_view` → Task 2
- ✓ `frontend.wizard.step_submitted` (steps 1-3) → Task 3
- ✓ `frontend.pdf_generated` → Task 3
- ✓ `frontend.auth.login` → Task 4
- ✓ `frontend.auth.register` → Task 4
- ✓ `frontend.auth.logout` → Task 4
- ✓ `frontend.project_created` → Task 3 (step 1)
- ✓ `frontend.project_deleted` → Task 5

**No placeholders found.**

**Type consistency:** `activityApi.record(type, opts)` used consistently across all tasks. `opts.sessionId`, `opts.projectId`, `opts.page`, `opts.metadata` match the backend contract.
