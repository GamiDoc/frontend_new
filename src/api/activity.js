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
