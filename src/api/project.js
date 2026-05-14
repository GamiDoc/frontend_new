import { api } from './client';

export const projectApi = {
  list: () => api.get('/projects'),
  get: (projectId) => api.get(`/projects/${projectId}`),
  create: (name, description) => api.post('/projects', { name, description }),
  update: (projectId, name, description) => api.patch(`/projects/${projectId}`, { name, description }),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
  saveStep: (projectId, stepNumber, stepData) =>
    api.put(`/projects/${projectId}/wizard/step/${stepNumber}`, { stepData }),
  recommend: (projectId, forStep) =>
    api.post(`/projects/${projectId}/wizard/recommendations`, { forStep }),
  generatePDF: (projectId) =>
    api.post(`/projects/${projectId}/generate-pdf`, {}),
};
