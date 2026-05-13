import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModal({ mode: initialMode, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
    } catch (err) {
      const code = err.code;
      if (code === 'INVALID_CREDENTIALS') setError('Invalid email or password.');
      else if (code === 'EMAIL_ALREADY_EXISTS') setError('This email is already registered.');
      else if (code === 'INVALID_PASSWORD') setError('Password must be at least 8 characters.');
      else if (code === 'INVALID_EMAIL') setError('Please enter a valid email address.');
      else setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>No account? <button className="auth-link" onClick={() => setMode('register')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-link" onClick={() => setMode('login')}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
