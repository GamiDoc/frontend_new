import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModal({ mode: initialMode, onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);

  function clearErrors() {
    setGlobalError(null);
    setEmailError(null);
    setPasswordError(null);
  }

  function validate() {
    let ok = true;
    if (!email.trim()) {
      setEmailError('Email is required.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      ok = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      ok = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      ok = false;
    }
    return ok;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      (onSuccess || onClose)();
    } catch (err) {
      const code = err.code;
      if (code === 'INVALID_CREDENTIALS') {
        setEmailError('Invalid email or password.');
        setPasswordError('Invalid email or password.');
      } else if (code === 'EMAIL_ALREADY_EXISTS') {
        setEmailError('This email is already registered.');
      } else if (code === 'INVALID_PASSWORD') {
        setPasswordError('Password must be at least 8 characters.');
      } else if (code === 'INVALID_EMAIL') {
        setEmailError('Please enter a valid email address.');
      } else {
        setGlobalError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    clearErrors();
    setEmail('');
    setPassword('');
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>

        {globalError && <p className="auth-error">{globalError}</p>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
              className={emailError ? 'input--error' : ''}
              autoFocus
            />
            {emailError && <span className="auth-field-error">{emailError}</span>}
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
              className={passwordError ? 'input--error' : ''}
            />
            {passwordError && <span className="auth-field-error">{passwordError}</span>}
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>No account? <button className="auth-link" onClick={() => switchMode('register')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-link" onClick={() => switchMode('login')}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
