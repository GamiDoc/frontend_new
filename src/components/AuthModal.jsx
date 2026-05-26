import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordInput({ value, onChange, className, placeholder, autoFocus }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password-wrapper">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function AuthModal({ mode: initialMode, onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [loading, setLoading] = useState(false);

  function clearErrors() {
    setGlobalError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
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
    } else if (mode === 'register' && password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      ok = false;
    }
    if (mode === 'register') {
      if (!confirmPassword) {
        setConfirmError('Please confirm your password.');
        ok = false;
      } else if (password !== confirmPassword) {
        setConfirmError('Passwords do not match.');
        ok = false;
      }
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
        setGlobalError('Incorrect email or password.');
      } else if (code === 'EMAIL_ALREADY_EXISTS') {
        setEmailError('An account with this email already exists.');
      } else if (code === 'INVALID_PASSWORD') {
        setPasswordError('Password must be at least 8 characters.');
      } else if (code === 'INVALID_EMAIL') {
        setEmailError('Please enter a valid email address.');
      } else if (code === 'NETWORK_ERROR') {
        setGlobalError('Unable to connect to the server. Please check your connection and try again.');
      } else if (code === 'INVALID_RESPONSE' || code === 'PARSE_ERROR') {
        setGlobalError('The server is not responding correctly. Please try again later.');
      } else {
        setGlobalError('Something went wrong. Please try again.');
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
    setConfirmPassword('');
  }

  return createPortal(
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
            <PasswordInput
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
              className={passwordError ? 'input--error' : ''}
            />
            {passwordError && <span className="auth-field-error">{passwordError}</span>}
          </label>

          {mode === 'register' && (
            <label>
              Confirm Password
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(null); }}
                className={confirmError ? 'input--error' : ''}
              />
              {confirmError && <span className="auth-field-error">{confirmError}</span>}
            </label>
          )}

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
    </div>,
    document.body
  );
}

export default AuthModal;
