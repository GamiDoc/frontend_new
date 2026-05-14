import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';

function Navbar({ onLogin, onSignup }) {
  const { user, logout } = useAuth();
  const { setPage } = useWizard();

  return (
    <header className="custom-navbar">
      <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setPage('landing')}>GamiDoc</div>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user-email">Hi, {user.email.split('@')[0]}</span>
            <button className="btn btn-outline" onClick={() => setPage('dashboard')}>Dashboard</button>
            <button className="btn btn-outline" onClick={logout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={onLogin}>Log In</button>
            <button className="btn btn-primary" onClick={onSignup}>Sign Up</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
