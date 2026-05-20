import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import EvaluationSetup from './pages/EvaluationSetup';
import MethodSelection from './pages/MethodSelection';
import InstrumentSelection from './pages/InstrumentSelection';
import BrowseInstruments from './pages/BrowseInstruments';
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
  const { page } = useWizard();
  const [authModal, setAuthModal] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const openLogin = () => setAuthModal('login');
  const openSignup = () => setAuthModal('register');
  const closeModal = () => setAuthModal(null);

  const navProps = { onOpenLogin: openLogin, onOpenSignup: openSignup };

  return (
    <div className="page">
      {authModal && <AuthModal mode={authModal} onClose={closeModal} />}

      {page === 'landing'            && <LandingPage {...navProps} />}
      {page === 'setup'              && <EvaluationSetup {...navProps} />}
      {page === 'methods'            && <MethodSelection {...navProps} />}
      {page === 'instruments'        && <InstrumentSelection {...navProps} />}
      {page === 'browse-instruments' && <BrowseInstruments {...navProps} />}
      {page === 'custom-construct'   && <CustomConstruct {...navProps} />}
      {page === 'evaluation'         && <EvaluationReview {...navProps} />}
      {page === 'dashboard'          && <Dashboard {...navProps} />}
      {page === 'project-detail'     && <ProjectDetailWrapper {...navProps} />}
    </div>
  );
}

export default App;
