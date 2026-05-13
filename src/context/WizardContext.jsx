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

export function WizardProvider({ children }) {
  const [page, setPage] = useState('landing');
  const [sessionId, setSessionId] = useState(null);
  const [step1Data, setStep1Data] = useState(STEP1_DEFAULTS);
  const [step2Data, setStep2Data] = useState(STEP2_DEFAULTS);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ensureSession = useCallback(async () => {
    const stored = localStorage.getItem('sessionId');
    if (stored) {
      try {
        await sessionApi.get(stored);
        setSessionId(stored);
        return stored;
      } catch {
        localStorage.removeItem('sessionId');
      }
    }
    const session = await sessionApi.create();
    localStorage.setItem('sessionId', session.sessionId);
    setSessionId(session.sessionId);
    return session.sessionId;
  }, []);

  const startWizard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureSession();
      setPage('setup');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ensureSession]);

  const submitStep1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sid = sessionId || await ensureSession();
      await sessionApi.saveStep(sid, 1, step1Data);
      const result = await sessionApi.recommend(sid, 2);
      setRecommendations(result.recommendations || []);
      setPage('methods');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, step1Data, ensureSession]);

  const submitStep2 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sessionApi.saveStep(sessionId, 2, step2Data);
      setPage('instruments');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, step2Data]);

  return (
    <WizardContext.Provider value={{
      page, setPage,
      sessionId,
      step1Data, setStep1Data,
      step2Data, setStep2Data,
      recommendations,
      loading, error,
      startWizard,
      submitStep1,
      submitStep2,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  return useContext(WizardContext);
}
