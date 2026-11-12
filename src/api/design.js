import { api } from './client';

/* Endpoint del Design System (documentazione completa: backend/docs/api/design.md).
   Ogni route esiste in due versioni speculari, scelte dallo `scope`:
     { kind: 'session', id } → /sessions/{id}/design   ospite, dati in Redis, scadono con la sessione
     { kind: 'project', id } → /projects/{id}/design   utente loggato e proprietario, dati in Postgres
   Gli endpoint AI (ai/rewrite, ai/chat) per ora non sono collegati. */
const base = ({ kind, id }) =>
    `/${kind === 'project' ? 'projects' : 'sessions'}/${id}/design`;

export const designApi = {
    get: (scope) => api.get(base(scope)),
    saveSpark: (scope, spark) => api.put(`${base(scope)}/spark`, { spark }),
    // body: { content?, complete?, skip? }
    saveSection: (scope, sectionNumber, body) =>
        api.put(`${base(scope)}/section/${sectionNumber}`, body),
    dashboard: (scope) => api.get(`${base(scope)}/dashboard`),
    // format: 'report' (reasoned design report) | 'gdd' (Game Design Document).
    // The document is generated in the background: progress in status.reportJob.
    generatePDF: (scope, format) =>
        api.post(`${base(scope)}/generate-pdf`, { format }),
    faq: (scope, sectionNumber) =>
        api.get(`${base(scope)}/faq/${sectionNumber}`),
    // PNG/JPEG up to 5 MB (multipart field "file") → { url }
    uploadImage: (scope, file) => {
        const body = new FormData();
        body.append('file', file);
        return api.upload(`${base(scope)}/images`, body);
    },

    // Solo per i progetti
    reports: (projectId) => api.get(`/projects/${projectId}/design/reports`),
    importSession: (projectId, sessionId) =>
        api.post(`/projects/${projectId}/design/import-session`, { sessionId }),
};
