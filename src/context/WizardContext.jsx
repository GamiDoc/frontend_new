import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sessionApi } from '../api/session';
import { projectApi } from '../api/project';

const WizardContext = createContext(null);

const STEP1_DEFAULTS = {
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

export function WizardProvider({ children }) {
  const [page, setPageRaw] = useState('landing');
  const [maxStep, setMaxStep] = useState(1);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
  // When editing an existing project, editingProjectId is set; null = anonymous session mode
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [step1Data, setStep1Data] = useState(STEP1_DEFAULTS);
  const [step2Data, setStep2Data] = useState(STEP2_DEFAULTS);
  const [step3Data, setStep3Data] = useState(STEP3_DEFAULTS);
  const [step4Data, setStep4Data] = useState(STEP4_DEFAULTS);
  const [recommendations, setRecommendations] = useState([]);
  const [step3Recommendations, setStep3Recommendations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // true when an auth user started the wizard but the project hasn't been created yet
  const [pendingAuthProject, setPendingAuthProject] = useState(false);

  // ── History-aware navigation ─────────────────────────────────────────────
  const setPage = useCallback((newPage) => {
    window.history.pushState({ page: newPage }, '', '#' + newPage);
    setPageRaw(newPage);
  }, []);

  useEffect(() => {
    window.history.replaceState({ page: 'landing' }, '', window.location.pathname);
    const handlePopState = (e) => {
      if (e.state?.page) setPageRaw(e.state.page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToStep = useCallback((stepNumber) => {
    const target = STEP_TO_PAGE[stepNumber];
    if (target) setPage(target);
  }, [setPage]);

  // ── New anonymous session → step 1 ──────────────────────────────────────
  const startWizard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.create();
      const sid = data.sessionId || data.id;
      localStorage.setItem('sessionId', sid);
      setSessionId(sid);
      setEditingProjectId(null);
      setStep1Data(STEP1_DEFAULTS);
      setStep2Data(STEP2_DEFAULTS);
      setStep3Data(STEP3_DEFAULTS);
      setStep4Data(STEP4_DEFAULTS);
      setRecommendations([]);
      setStep3Recommendations([]);
      setPdfUrl(null);
      setMaxStep(1);
      setPendingAuthProject(false);
      setPage('setup');
    } catch (e) {
      setError(e.message || 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start wizard for authenticated user — project created lazily on step 1 submit ─
  const createProject = useCallback(() => {
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
    setPendingAuthProject(true);
    setPage('setup');
  }, [setPage]);

  // ── Load an existing project into the wizard for editing ─────────────────
  const loadProject = useCallback((project, targetPage = 'setup') => {
    const steps = project.wizardStatus?.steps || {};

    setEditingProjectId(project.projectId);
    setCurrentProjectId(project.projectId);
    setStep1Data({ ...STEP1_DEFAULTS, ...(steps['1'] || {}) });
    setStep2Data({ ...STEP2_DEFAULTS, ...(steps['2'] || {}) });
    setStep3Data({ ...STEP3_DEFAULTS, ...(steps['3'] || {}) });
    setStep4Data({ ...STEP4_DEFAULTS, ...(steps['4'] || {}) });
    setRecommendations([]);
    setStep3Recommendations([]);
    setPdfUrl(project.pdfUrl || null);
    setMaxStep(project.wizardStatus?.currentStep || 1);
    setPendingAuthProject(false);
    setPage(targetPage);
  }, [setPage]);

  // ── Save step 1 and fetch step-2 recommendations ─────────────────────────
  const submitStep1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (pendingAuthProject) {
        const project = await projectApi.create(step1Data.projectType || 'New Project', '');
        setEditingProjectId(project.projectId);
        setCurrentProjectId(project.projectId);
        setPendingAuthProject(false);
        await projectApi.saveStep(project.projectId, 1, step1Data);
        const recResult = await projectApi.recommend(project.projectId, 2);
        setRecommendations(recResult?.recommendations || []);
      } else if (editingProjectId) {
        await projectApi.saveStep(editingProjectId, 1, step1Data);
        const recResult = await projectApi.recommend(editingProjectId, 2);
        setRecommendations(recResult?.recommendations || []);
      } else {
        await sessionApi.saveStep(sessionId, 1, step1Data);
        const recResult = await sessionApi.recommend(sessionId, 2);
        setRecommendations(recResult?.recommendations || []);
      }
      setMaxStep((prev) => Math.max(prev, 2));
      setPage('methods');
    } catch (e) {
      setError(e.message || 'Failed to save step 1.');
    } finally {
      setLoading(false);
    }
  }, [pendingAuthProject, editingProjectId, sessionId, step1Data, setPage]);

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
        await sessionApi.saveStep(sessionId, 2, step2Data);
        const recResult = await sessionApi.recommend(sessionId, 3);
        setStep3Recommendations(recResult?.recommendations || []);
      }
      setMaxStep((prev) => Math.max(prev, 3));
      setPage('instruments');
    } catch (e) {
      setError(e.message || 'Failed to save step 2.');
    } finally {
      setLoading(false);
    }
  }, [editingProjectId, sessionId, step2Data]);

  // ── Save step 3 and navigate to review ───────────────────────────────────
  const submitStep3 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (editingProjectId) {
        await projectApi.saveStep(editingProjectId, 3, step3Data);
      } else {
        await sessionApi.saveStep(sessionId, 3, step3Data);
      }
      setMaxStep((prev) => Math.max(prev, 4));
      setPage('evaluation');
    } catch (e) {
      setError(e.message || 'Failed to save step 3.');
    } finally {
      setLoading(false);
    }
  }, [editingProjectId, sessionId, step3Data]);

  // ── Save step 4 and generate PDF — caller must catch errors ──────────────
  const generatePDF = useCallback(async () => {
    if (editingProjectId) {
      await projectApi.saveStep(editingProjectId, 4, step4Data);
      const result = await projectApi.generatePDF(editingProjectId);
      setPdfUrl(result?.pdfUrl || null);
      return result;
    }
    await sessionApi.saveStep(sessionId, 4, step4Data);
    const result = await sessionApi.generatePDF(sessionId);
    setPdfUrl(result?.pdfUrl || null);
    return result;
  }, [editingProjectId, sessionId, step4Data]);

  return (
    <WizardContext.Provider
      value={{
        page, setPage,
        maxStep, navigateToStep,
        sessionId,
        editingProjectId,
        step1Data, setStep1Data,
        step2Data, setStep2Data,
        step3Data, setStep3Data,
        step4Data, setStep4Data,
        recommendations,
        step3Recommendations,
        pdfUrl,
        currentProjectId, setCurrentProjectId,
        loading, error,
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
