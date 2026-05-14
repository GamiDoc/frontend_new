import { createContext, useContext, useState, useCallback } from 'react';
import { sessionApi } from '../api/session';

const WizardContext = createContext(null);

const STEP1_DEFAULTS = {
  evaluationGoals: [],
  projectType: '',
  participants: '',
  developmentStage: '',
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

export function WizardProvider({ children }) {
  const [page, setPage] = useState('landing');
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
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

  // Create a new anonymous session and go to step 1
  const startWizard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.create();
      const sid = data.sessionId || data.id;
      localStorage.setItem('sessionId', sid);
      setSessionId(sid);
      setStep1Data(STEP1_DEFAULTS);
      setStep2Data(STEP2_DEFAULTS);
      setStep3Data(STEP3_DEFAULTS);
      setStep4Data(STEP4_DEFAULTS);
      setRecommendations([]);
      setStep3Recommendations([]);
      setPdfUrl(null);
      setPage('setup');
    } catch (e) {
      setError(e.message || 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save step 1 and fetch step-2 recommendations
  const submitStep1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sessionApi.saveStep(sessionId, 1, step1Data);
      const recResult = await sessionApi.recommend(sessionId, 2);
      setRecommendations(recResult?.recommendations || []);
      setPage('methods');
    } catch (e) {
      setError(e.message || 'Failed to save step 1.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, step1Data]);

  // Save step 2 and fetch step-3 recommendations
  const submitStep2 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sessionApi.saveStep(sessionId, 2, step2Data);
      const recResult = await sessionApi.recommend(sessionId, 3);
      setStep3Recommendations(recResult?.recommendations || []);
      setPage('instruments');
    } catch (e) {
      setError(e.message || 'Failed to save step 2.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, step2Data]);

  // Save step 3 and navigate to review
  const submitStep3 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sessionApi.saveStep(sessionId, 3, step3Data);
      setPage('evaluation');
    } catch (e) {
      setError(e.message || 'Failed to save step 3.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, step3Data]);

  // Save step 4 then generate PDF — errors are NOT caught here so the caller can handle them
  const generatePDF = useCallback(async () => {
    await sessionApi.saveStep(sessionId, 4, step4Data);
    const result = await sessionApi.generatePDF(sessionId);
    setPdfUrl(result?.pdfUrl || null);
    return result;
  }, [sessionId, step4Data]);

  return (
    <WizardContext.Provider
      value={{
        page, setPage,
        sessionId,
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
