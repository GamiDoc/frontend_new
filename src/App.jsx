import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import EvaluationSetup from './pages/EvaluationSetup';
import MethodSelection from './pages/MethodSelection';
import AuthModal from './components/AuthModal';
import { useWizard } from './context/WizardContext';

function LandingPage({ onOpenLogin, onOpenSignup }) {
  const { startWizard, loading } = useWizard();

  function handleStartProject() {
    startWizard();
  }

  return (
    <div className="page">
      <Navbar onLogin={onOpenLogin} onSignup={onOpenSignup} />
      <main>
        <Hero onStart={handleStartProject} loading={loading} />
        <FeatureCards />
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { page } = useWizard();
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

  const openLogin = () => setAuthModal('login');
  const openSignup = () => setAuthModal('register');
  const closeModal = () => setAuthModal(null);

  return (
    <div className="page">
      {authModal && <AuthModal mode={authModal} onClose={closeModal} />}

      {page === 'landing' && (
        <LandingPage onOpenLogin={openLogin} onOpenSignup={openSignup} />
      )}
      {page === 'setup' && (
        <EvaluationSetup onOpenLogin={openLogin} onOpenSignup={openSignup} />
      )}
      {page === 'methods' && (
        <MethodSelection onOpenLogin={openLogin} onOpenSignup={openSignup} />
      )}
      {page === 'instruments' && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Instrument Selection — coming soon</h2>
        </div>
      )}
    </div>
  );
}

export default App;
