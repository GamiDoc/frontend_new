import { api } from './client';

export const sessionApi = {
  create: () => api.post('/sessions/create', {}),
  get: (sessionId) => api.get(`/sessions/${sessionId}`),
  saveStep: (sessionId, stepNumber, stepData) =>
    api.put(`/sessions/${sessionId}/wizard/step/${stepNumber}`, { stepData }),
  recommend: (sessionId, forStep) =>
    api.post(`/sessions/${sessionId}/wizard/recommendations`, { forStep }),
  generatePDF: (sessionId) =>
    api.post(`/sessions/${sessionId}/generate-pdf`, {}),
  downloadPDF: (sessionId) =>
    api.downloadBlob(`/sessions/${sessionId}/download-pdf`),
  convertToProject: (sessionId, name, description) =>
    api.post(`/sessions/${sessionId}/convert`, { name, description }),
};
