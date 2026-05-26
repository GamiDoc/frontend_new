import { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import EvaluationSetup from './pages/EvaluationSetup';
import MethodSelection from './pages/MethodSelection';
import InstrumentSelection from './pages/InstrumentSelection';
import BrowseInstruments from './pages/BrowseInstruments';
import BrowseMethods from './pages/BrowseMethods';
import CustomConstruct from './pages/CustomConstruct';
import EvaluationReview from './pages/EvaluationReview';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import AuthModal from './components/AuthModal';
import { useWizard } from './context/WizardContext';
import { useAuth } from './context/AuthContext';

function LandingPage({ onOpenLogin, onOpenSignup }) {
  const { startWizard, createProject, loading } = useWizard();
  const { user } = useAuth();
  const { setPage } = useWizard();

  return (
    <div className="page">
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
      <main>
        <Hero onStart={user ? createProject : startWizard} loading={loading} />
        <FeatureCards />
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

function ProjectDetailWrapper({ onOpenLogin, onOpenSignup }) {
  const { currentProjectId } = useWizard();
  return <ProjectDetail projectId={currentProjectId} onOpenLogin={onOpenLogin} onOpenSignup={onOpenSignup} />;
}

function App() {
  const { page, setPage } = useWizard();
  const [authModal, setAuthModal] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const stayOnPageRef = useRef(false);

  const openLogin = () => { stayOnPageRef.current = false; setAuthModal('login'); };
  const openSignup = () => { stayOnPageRef.current = false; setAuthModal('register'); };
  const openLoginStay = () => { stayOnPageRef.current = true; setAuthModal('login'); };
  const openSignupStay = () => { stayOnPageRef.current = true; setAuthModal('register'); };
  const closeModal = () => { stayOnPageRef.current = false; setAuthModal(null); };
  const loginSuccess = () => {
    const stay = stayOnPageRef.current;
    stayOnPageRef.current = false;
    setAuthModal(null);
    if (!stay) setPage('dashboard');
  };

  const navProps = { onOpenLogin: openLogin, onOpenSignup: openSignup };
  const wizardProps = { onOpenLogin: openLoginStay, onOpenSignup: openSignupStay };

  return (
    <div className="page">
      {authModal && <AuthModal mode={authModal} onClose={closeModal} onSuccess={loginSuccess} />}

      {page === 'landing'            && <LandingPage {...navProps} />}
      {page === 'setup'              && <EvaluationSetup {...wizardProps} />}
      {page === 'methods'            && <MethodSelection {...wizardProps} />}
      {page === 'instruments'        && <InstrumentSelection {...wizardProps} />}
      {page === 'browse-instruments' && <BrowseInstruments {...wizardProps} />}
      {page === 'browse-methods'     && <BrowseMethods {...wizardProps} />}
      {page === 'custom-construct'   && <CustomConstruct {...wizardProps} />}
      {page === 'evaluation'         && <EvaluationReview {...wizardProps} />}
      {page === 'dashboard'          && <Dashboard {...navProps} />}
      {page === 'project-detail'     && <ProjectDetailWrapper {...navProps} />}
    </div>
  );
}

export default App;
