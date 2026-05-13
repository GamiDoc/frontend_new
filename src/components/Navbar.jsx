import { useAuth } from '../context/AuthContext';

function Navbar({ onLogin, onSignup }) {
  const { user, logout } = useAuth();

  return (
    <header className="custom-navbar">
      <div className="logo">GamiDoc</div>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user-email">{user.email}</span>
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
