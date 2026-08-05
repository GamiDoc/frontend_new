import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { sessionApi } from '../api/session';
import { projectApi } from '../api/project';
import { activityApi } from '../api/activity';

const WizardContext = createContext(null);

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const STEP1_DEFAULTS = {
  projectName: '',
  evaluationGoals: [],
  projectType: '',
  participants: '',
  developmentStage: '',
  // constraints
  accessibility: '',
  time: '',
  extraConstraints: [],
  // research specification
  researchEnabled: false,
  researchObjective: '',
  researchQuestions: [],
  hypotheses: [],
};

const STEP2_DEFAULTS = {
  selectedMethods: [],
};

const STEP3_DEFAULTS = {
  selectedInstruments: [],
  customConstructs: [],
};

const STEP4_DEFAULTS = {
  nextSteps: [
    'Conduct a pilot test to identify potential issues and refine instructions.',
    'Coordinate with participants and schedule your evaluation sessions.',
    'Observe user interactions and collect data.',
  ],
  notes: '',
};

const STEP_TO_PAGE = { 1: 'setup', 2: 'methods', 3: 'instruments', 4: 'evaluation' };

// R1 — the wizard configuration lives client-side until the user decides to
// save it, so registration can be postponed to the end of the flow without
// ever losing what has been entered.
const DRAFT_KEY = 'gamidoc.wizardDraft';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const draft = loadDraft();

export function WizardProvider({ children }) {
  const [page, setPageRaw] = useState('landing');
  const [maxStep, setMaxStep] = useState(draft?.maxStep || 1);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
  // When editing an existing project, editingProjectId is set; null = anonymous session mode
  const [editingProjectId, setEditingProjectId] = useState(draft?.editingProjectId || null);
  const [step1Data, setStep1Data] = useState(draft?.step1Data || STEP1_DEFAULTS);
  const [step2Data, setStep2Data] = useState(draft?.step2Data || STEP2_DEFAULTS);
  const [step3Data, setStep3Data] = useState(draft?.step3Data || STEP3_DEFAULTS);
  const [step4Data, setStep4Data] = useState(draft?.step4Data || STEP4_DEFAULTS);
  const [recommendations, setRecommendations] = useState([]);
  const [step3Recommendations, setStep3Recommendations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // true when a logged-in user started the wizard — the project is created only
  // once the plan is finished (R1), not on step 1.
  const [pendingAuthProject, setPendingAuthProject] = useState(draft?.pendingAuthProject || false);
  // Set when the user jumps back to an earlier step from the review page, so we
  // can offer a forward-facing way back instead of re-walking the whole wizard (R6).
  const [reviewReturn, setReviewReturn] = useState(false);

  // Saved snapshots — last-saved copy of each step's data
  const [savedSnapshots, setSavedSnapshots] = useState({ 1: null, 2: null, 3: null });

  // Track current page to record 'from' in page_view events
  const pageRef = useRef('landing');
  useEffect(() => { pageRef.current = page; }, [page]);

  const PAGE_TO_STEP = { setup: 1, methods: 2, instruments: 3, evaluation: 4 };
  const currentStep = PAGE_TO_STEP[page] || null;

  const currentStepDirty = useMemo(() => {
    if (!currentStep || currentStep > maxStep) return false;
    const snapshot = savedSnapshots[currentStep];
    if (!snapshot) return false;
    const dataMap = { 1: step1Data, 2: step2Data, 3: step3Data };
    const current = dataMap[currentStep];
    if (!current) return false;
    return !deepEqual(current, snapshot);
  }, [currentStep, maxStep, savedSnapshots, step1Data, step2Data, step3Data]);

  const effectiveMaxStep = currentStepDirty ? currentStep : maxStep;

  // ── Persist the draft locally so registering / reloading never loses work ──
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        maxStep, editingProjectId, pendingAuthProject,
        step1Data, step2Data, step3Data, step4Data,
      }));
    } catch {
      // storage full or disabled — the wizard still works, just without recovery
    }
  }, [maxStep, editingProjectId, pendingAuthProject, step1Data, step2Data, step3Data, step4Data]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }, []);

  const [draftAvailable, setDraftAvailable] = useState(
    Boolean(draft?.step1Data?.projectName) && (draft?.maxStep || 1) > 1
  );

  // ── History-aware navigation ─────────────────────────────────────────────
  const setPage = useCallback((newPage) => {
    window.history.pushState({ page: newPage }, '', '#' + newPage);
    activityApi.record('frontend.page_view', { page: newPage, metadata: { from: pageRef.current } });
    setPageRaw(newPage);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    window.history.replaceState({ page: 'landing' }, '', window.location.pathname);
    const handlePopState = (e) => {
      if (e.state?.page) setPageRaw(e.state.page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Session recovery ─────────────────────────────────────────────────────
  // The local draft outlives the backend session, so a step save may hit a
  // session that no longer exists. In that case create a fresh one and replay
  // every step from the draft — the user never re-enters anything (R1).
  const saveSessionStep = useCallback(async (stepNumber) => {
    const steps = { 1: step1Data, 2: step2Data, 3: step3Data, 4: step4Data };
    if (sessionId) {
      try {
        await sessionApi.saveStep(sessionId, stepNumber, steps[stepNumber]);
        return sessionId;
      } catch (e) {
        if (e.status !== 404) throw e;
      }
    }
    const created = await sessionApi.create();
    const sid = created.sessionId || created.id;
    localStorage.setItem('sessionId', sid);
    setSessionId(sid);
    for (let s = 1; s <= stepNumber; s++) {
      await sessionApi.saveStep(sid, s, steps[s]);
    }
    return sid;
  }, [sessionId, step1Data, step2Data, step3Data, step4Data]);

  const navigateToStep = useCallback((stepNumber) => {
    if (stepNumber > effectiveMaxStep) return;
    const target = STEP_TO_PAGE[stepNumber];
    if (target) setPage(target);
  }, [setPage, effectiveMaxStep]);

  // ── New anonymous session → step 1 ──────────────────────────────────────
  // saveAtEnd marks a flow started by a logged-in user: the wizard still runs on
  // a transient session and only becomes a dashboard project once finished (R1).
  const startWizard = useCallback(async (saveAtEnd = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.create();
      const sid = data.sessionId || data.id;
      localStorage.setItem('sessionId', sid);
      setSessionId(sid);
      setEditingProjectId(null);
      setCurrentProjectId(null);
      setStep1Data(STEP1_DEFAULTS);
      setStep2Data(STEP2_DEFAULTS);
      setStep3Data(STEP3_DEFAULTS);
      setStep4Data(STEP4_DEFAULTS);
      setRecommendations([]);
      setStep3Recommendations([]);
      setPdfUrl(null);
      setMaxStep(1);
      setSavedSnapshots({ 1: null, 2: null, 3: null });
      setPendingAuthProject(saveAtEnd);
      setReviewReturn(false);
      setDraftAvailable(false);
      setPage('setup');
    } catch (e) {
      setError(e.message || 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  }, [setPage]);

  // ── Start wizard for an authenticated user — project created at the end ──
  const createProject = useCallback(() => startWizard(true), [startWizard]);

  // ── Resume the locally stored draft without touching the backend ─────────
  const resumeDraft = useCallback(() => {
    setReviewReturn(false);
    setDraftAvailable(false);
    setPage(STEP_TO_PAGE[Math.min(draft?.maxStep || 1, 4)] || 'setup');
  }, [setPage]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setDraftAvailable(false);
    setStep1Data(STEP1_DEFAULTS);
    setStep2Data(STEP2_DEFAULTS);
    setStep3Data(STEP3_DEFAULTS);
    setStep4Data(STEP4_DEFAULTS);
    setMaxStep(1);
    setEditingProjectId(null);
    setPendingAuthProject(false);
  }, [clearDraft]);

  // ── Load an existing project into the wizard for editing ─────────────────
  const loadProject = useCallback(async (project, targetPage = 'setup') => {
    const steps = project.wizardStatus?.steps || {};
    const currentStep = project.wizardStatus?.currentStep || 1;

    const s1 = { ...STEP1_DEFAULTS, ...(steps['1'] || {}), projectName: project.name || steps['1']?.projectName || '' };
    const s2 = { ...STEP2_DEFAULTS, ...(steps['2'] || {}) };
    const s3 = { ...STEP3_DEFAULTS, ...(steps['3'] || {}) };

    setEditingProjectId(project.projectId);
    setCurrentProjectId(project.projectId);
    setStep1Data(s1);
    setStep2Data(s2);
    setStep3Data(s3);
    setStep4Data({ ...STEP4_DEFAULTS, ...(steps['4'] || {}) });
    setPdfUrl(project.pdfUrl || null);
    setMaxStep(currentStep);
    setSavedSnapshots({
      1: currentStep >= 1 ? JSON.parse(JSON.stringify(s1)) : null,
      2: currentStep >= 2 ? JSON.parse(JSON.stringify(s2)) : null,
      3: currentStep >= 3 ? JSON.parse(JSON.stringify(s3)) : null,
    });
    setPendingAuthProject(false);
    setReviewReturn(false);
    setDraftAvailable(false);

    try {
      const rec2 = currentStep >= 2
        ? await projectApi.recommend(project.projectId, 2)
        : null;
      setRecommendations(rec2?.recommendations || []);
    } catch {
      setRecommendations([]);
    }

    try {
      const rec3 = currentStep >= 3
        ? await projectApi.recommend(project.projectId, 3)
        : null;
      setStep3Recommendations(rec3?.recommendations || []);
    } catch {
      setStep3Recommendations([]);
    }

    setPage(targetPage);
  }, [setPage]);

  // ── Save step 1 and fetch step-2 recommendations ─────────────────────────
  const submitStep1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resolvedProjectId = editingProjectId;

      if (editingProjectId) {
        if (step1Data.projectName) {
          await projectApi.update(editingProjectId, step1Data.projectName, step1Data.projectType || '');
        }
        await projectApi.saveStep(editingProjectId, 1, step1Data);
        const recResult = await projectApi.recommend(editingProjectId, 2);
        setRecommendations(recResult?.recommendations || []);
      } else {
        const sid = await saveSessionStep(1);
        const recResult = await sessionApi.recommend(sid, 2);
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
      if (reviewReturn) {
        setReviewReturn(false);
        setPage('evaluation');
      } else {
        setPage('methods');
      }
    } catch (e) {
      setError(e.message || 'Failed to save step 1.');
    } finally {
      setLoading(false);
    }
  }, [editingProjectId, sessionId, step1Data, setPage, saveSessionStep, reviewReturn]);

  // ── Save step 2 and fetch step-3 recommendations ─────────────────────────
  const submitStep2 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (editingProjectId) {
        await projectApi.saveStep(editingProjectId, 2, step2Data);
        const recResult = await projectApi.recommend(editingProjectId, 3);
        setStep3Recommendations(recResult?.recommendations || []);
      } else {
        const sid = await saveSessionStep(2);
        const recResult = await sessionApi.recommend(sid, 3);
        setStep3Recommendations(recResult?.recommendations || []);
      }
      setSavedSnapshots((prev) => ({ ...prev, 2: JSON.parse(JSON.stringify(step2Data)) }));
      setMaxStep((prev) => Math.max(prev, 3));
      activityApi.record('frontend.wizard.step_submitted', {
        page: 'methods',
        sessionId: editingProjectId ? undefined : sessionId,
        projectId: editingProjectId || undefined,
        metadata: { step: 2, mode: editingProjectId ? 'project' : 'session' },
      });
      if (reviewReturn) {
        setReviewReturn(false);
        setPage('evaluation');
      } else {
        setPage('instruments');
      }
    } catch (e) {
      setError(e.message || 'Failed to save step 2.');
    } finally {
      setLoading(false);
    }
  }, [editingProjectId, sessionId, step2Data, setPage, saveSessionStep, reviewReturn]);

  // ── Save step 3 and navigate to review ───────────────────────────────────
  const submitStep3 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (editingProjectId) {
        await projectApi.saveStep(editingProjectId, 3, step3Data);
      } else {
        await saveSessionStep(3);
      }
      setSavedSnapshots((prev) => ({ ...prev, 3: JSON.parse(JSON.stringify(step3Data)) }));
      setMaxStep((prev) => Math.max(prev, 4));
      activityApi.record('frontend.wizard.step_submitted', {
        page: 'instruments',
        sessionId: editingProjectId ? undefined : sessionId,
        projectId: editingProjectId || undefined,
        metadata: { step: 3, mode: editingProjectId ? 'project' : 'session' },
      });
      setReviewReturn(false);
      setPage('evaluation');
    } catch (e) {
      setError(e.message || 'Failed to save step 3.');
    } finally {
      setLoading(false);
    }
  }, [editingProjectId, sessionId, step3Data, setPage, saveSessionStep]);

  // ── Editing a single step from the review page (R6) ──────────────────────
  // Instead of walking backwards through the wizard, the user jumps straight to
  // the step being changed and is returned forward to the review on save.
  const editStepFromReview = useCallback((stepNumber) => {
    const target = STEP_TO_PAGE[stepNumber];
    if (!target) return;
    setReviewReturn(true);
    setPage(target);
  }, [setPage]);

  const returnToReview = useCallback(() => {
    setReviewReturn(false);
    setPage('evaluation');
  }, [setPage]);

  // ── Save step 4 and generate PDF — caller must catch errors ──────────────
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
    const sid = await saveSessionStep(4);
    const result = await sessionApi.generatePDF(sid);
    setPdfUrl(result?.pdfUrl || null);
    activityApi.record('frontend.pdf_generated', {
      page: 'evaluation',
      sessionId: sid,
      metadata: { mode: 'session' },
    });
    return result;
  }, [editingProjectId, step4Data, saveSessionStep]);

  return (
    <WizardContext.Provider
      value={{
        page, setPage,
        maxStep, effectiveMaxStep, navigateToStep,
        sessionId,
        editingProjectId, setEditingProjectId,
        step1Data, setStep1Data,
        step2Data, setStep2Data,
        step3Data, setStep3Data,
        step4Data, setStep4Data,
        recommendations,
        step3Recommendations,
        pdfUrl,
        currentProjectId, setCurrentProjectId,
        loading, error,
        pendingAuthProject,
        reviewReturn, editStepFromReview, returnToReview,
        draftAvailable, resumeDraft, discardDraft, clearDraft,
        startWizard,
        createProject,
        loadProject,
        submitStep1,
        submitStep2,
        submitStep3,
        generatePDF,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  return useContext(WizardContext);
}
