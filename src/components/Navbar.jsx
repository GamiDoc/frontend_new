import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';

function Navbar({ onLogin, onSignup }) {
  const { user, logout } = useAuth();
  const { setPage } = useWizard();
  const [mobileOpen, setMobileOpen] = useState(false);

  function close() { setMobileOpen(false); }

  return (
    <header className="custom-navbar">
      <div className="logo" style={{ cursor: 'pointer' }} onClick={() => { setPage('landing'); close(); }}>GamiDoc</div>

      <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <div className={`nav-actions${mobileOpen ? ' nav-actions--open' : ''}`}>
        {user ? (
          <>
            <span className="nav-user-email">Hi, {user.email.split('@')[0]}</span>
            <button className="btn btn-outline" onClick={() => { setPage('dashboard'); close(); }}>Dashboard</button>
            <button className="btn btn-outline" onClick={() => { logout(); close(); }}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => { onLogin(); close(); }}>Log In</button>
            <button className="btn btn-primary" onClick={() => { onSignup(); close(); }}>Sign Up</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
