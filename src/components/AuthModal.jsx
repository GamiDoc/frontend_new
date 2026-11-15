import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { PASSWORD_RULES, passwordIsValid } from '../utils/passwordRules';

const EyeIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

function PasswordInput({
    value,
    onChange,
    className,
    placeholder,
    autoFocus,
    autoComplete,
    describedBy,
}) {
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
                autoComplete={autoComplete}
                aria-describedby={describedBy}
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

// The password rules, ticked live as the user types.
function PasswordRules({ password }) {
    return (
        <ul className="auth-rules" id="password-rules">
            {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(password);
                return (
                    <li
                        key={rule.id}
                        className={ok ? 'auth-rule auth-rule--ok' : 'auth-rule'}
                    >
                        <span aria-hidden="true">{ok ? '✓' : '•'}</span>
                        {rule.label}
                        <span className="visually-hidden">
                            {ok ? ' (done)' : ' (missing)'}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

const PASSWORD_RULES_ERROR = 'The password does not follow the rules below.';
const RESEND_COOLDOWN = 60;

function errorMessage(code) {
    switch (code) {
        case 'NETWORK_ERROR':
            return 'Unable to connect to the server. Please check your connection and try again.';
        case 'INVALID_RESPONSE':
        case 'PARSE_ERROR':
            return 'The server is not responding correctly. Please try again later.';
        case 'INVALID_TOKEN':
            return 'This link is invalid or has expired.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

/**
 * Modes: login, register, check-email (after sign up or a login with an unconfirmed
 * email), forgot, forgot-sent, verify (link of the confirmation email, needs token),
 * reset (link of the password reset email, needs token).
 */
function AuthModal({ mode: initialMode, token, onClose, onSuccess }) {
    const { login, register, verifyEmail, resetPassword } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [globalError, setGlobalError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmError, setConfirmError] = useState(null);
    const [loading, setLoading] = useState(false);
    // verify / reset links: 'checking' → 'ok' | 'invalid'
    const [linkState, setLinkState] = useState(token ? 'checking' : null);
    const [resendIn, setResendIn] = useState(0);

    const done = onSuccess || onClose;
    const choosingPassword = mode === 'register' || mode === 'reset';

    // Open the link of an email: confirm the address, or check the reset link
    useEffect(() => {
        if (!token) return undefined;
        let cancelled = false;
        const check =
            initialMode === 'verify'
                ? verifyEmail(token)
                : authApi.checkResetToken(token);
        check
            .then(() => {
                if (cancelled) return;
                if (initialMode === 'verify') done();
                else setLinkState('ok');
            })
            .catch((err) => {
                if (cancelled) return;
                setLinkState('invalid');
                if (err.code !== 'INVALID_TOKEN') {
                    setGlobalError(errorMessage(err.code));
                }
            });
        return () => {
            cancelled = true;
        };
        // The link is opened once, when the modal appears
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // "Resend the email" waits a minute between two emails (the server does too)
    useEffect(() => {
        if (resendIn <= 0) return undefined;
        const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(id);
    }, [resendIn]);

    function clearErrors() {
        setGlobalError(null);
        setNotice(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmError(null);
    }

    function validateEmail() {
        if (!email.trim()) {
            setEmailError('Email is required.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError('Enter a valid email address.');
            return false;
        }
        return true;
    }

    function validate() {
        let ok = mode === 'reset' ? true : validateEmail();
        if (!password) {
            setPasswordError('Password is required.');
            ok = false;
        } else if (choosingPassword && !passwordIsValid(password)) {
            setPasswordError(PASSWORD_RULES_ERROR);
            ok = false;
        }
        if (choosingPassword) {
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
        if (mode === 'forgot') {
            if (!validateEmail()) return;
        } else if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email.trim(), password);
                done();
            } else if (mode === 'register') {
                const result = await register(email.trim(), password);
                if (result?.verification_required) {
                    setPassword('');
                    setConfirmPassword('');
                    setResendIn(RESEND_COOLDOWN);
                    setMode('check-email');
                } else {
                    done();
                }
            } else if (mode === 'forgot') {
                await authApi.forgotPassword(email.trim());
                setMode('forgot-sent');
            } else if (mode === 'reset') {
                await resetPassword(token, password);
                done();
            }
        } catch (err) {
            const code = err.code;
            if (code === 'INVALID_CREDENTIALS') {
                setGlobalError('Incorrect email or password.');
            } else if (code === 'EMAIL_NOT_VERIFIED') {
                setPassword('');
                setNotice(
                    'Your email address is not confirmed yet. Open the link we sent you, or ask for a new one.',
                );
                setMode('check-email');
            } else if (code === 'EMAIL_ALREADY_EXISTS') {
                setEmailError('An account with this email already exists.');
            } else if (code === 'INVALID_PASSWORD') {
                setPasswordError(PASSWORD_RULES_ERROR);
            } else if (code === 'INVALID_EMAIL') {
                setEmailError('Please enter a valid email address.');
            } else if (code === 'INVALID_TOKEN') {
                setLinkState('invalid');
            } else {
                setGlobalError(errorMessage(code));
            }
        } finally {
            setLoading(false);
        }
    }

    async function resend() {
        setGlobalError(null);
        setLoading(true);
        try {
            await authApi.resendVerification(email.trim());
            setNotice('We sent you a new email.');
            setResendIn(RESEND_COOLDOWN);
        } catch (err) {
            setGlobalError(errorMessage(err.code));
        } finally {
            setLoading(false);
        }
    }

    function switchMode(newMode) {
        setMode(newMode);
        clearErrors();
        setPassword('');
        setConfirmPassword('');
        setLinkState(null);
        if (newMode === 'register') setEmail('');
    }

    const titles = {
        login: 'Log In',
        register: 'Create Account',
        'check-email': 'Check your email',
        forgot: 'Reset your password',
        'forgot-sent': 'Check your email',
        verify: 'Confirming your email',
        reset: 'Choose a new password',
    };

    let body;
    if (mode === 'verify') {
        body =
            linkState === 'invalid' ? (
                <>
                    {globalError ? (
                        <p className="auth-error">{globalError}</p>
                    ) : (
                        <p className="auth-text">
                            This confirmation link is invalid or has expired
                            (links last 24 hours and work once). Log in to get a
                            new one.
                        </p>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary auth-wide"
                        onClick={() => switchMode('login')}
                    >
                        Log in
                    </button>
                </>
            ) : (
                <p className="auth-text" role="status">
                    Please wait…
                </p>
            );
    } else if (mode === 'reset' && linkState !== 'ok') {
        body =
            linkState === 'invalid' ? (
                <>
                    {globalError ? (
                        <p className="auth-error">{globalError}</p>
                    ) : (
                        <p className="auth-text">
                            This reset link is invalid or has expired (links
                            last 1 hour and work once). Ask for a new one.
                        </p>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary auth-wide"
                        onClick={() => switchMode('forgot')}
                    >
                        Send me a new link
                    </button>
                </>
            ) : (
                <p className="auth-text" role="status">
                    Checking the link…
                </p>
            );
    } else if (mode === 'check-email') {
        body = (
            <>
                {notice && (
                    <p className="auth-notice" role="status">
                        {notice}
                    </p>
                )}
                {globalError && <p className="auth-error">{globalError}</p>}
                <p className="auth-text">
                    We sent a confirmation link to <strong>{email}</strong>.
                    Open it to activate your account, then you are logged in.
                </p>
                <p className="auth-hint">
                    The link lasts 24 hours. Can’t find the email? Check the
                    spam folder.
                </p>
                <button
                    type="button"
                    className="btn btn-primary auth-wide"
                    onClick={resend}
                    disabled={loading || resendIn > 0}
                >
                    {resendIn > 0
                        ? `Resend the email (${resendIn}s)`
                        : 'Resend the email'}
                </button>
            </>
        );
    } else if (mode === 'forgot-sent') {
        body = (
            <>
                <p className="auth-text">
                    If an account exists for <strong>{email}</strong>, we sent
                    it a link to choose a new password.
                </p>
                <p className="auth-hint">
                    The link lasts 1 hour. Can’t find the email? Check the spam
                    folder.
                </p>
            </>
        );
    } else {
        body = (
            <>
                {globalError && <p className="auth-error">{globalError}</p>}
                {mode === 'forgot' && (
                    <p className="auth-text">
                        Enter the email of your account: we will send you a link
                        to choose a new password.
                    </p>
                )}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {mode !== 'reset' && (
                        <label>
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError(null);
                                }}
                                className={emailError ? 'input--error' : ''}
                                autoComplete="email"
                                autoFocus
                            />
                            {emailError && (
                                <span className="auth-field-error">
                                    {emailError}
                                </span>
                            )}
                        </label>
                    )}

                    {mode !== 'forgot' && (
                        <label>
                            {mode === 'reset' ? 'New password' : 'Password'}
                            <PasswordInput
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(null);
                                }}
                                className={passwordError ? 'input--error' : ''}
                                autoComplete={
                                    choosingPassword
                                        ? 'new-password'
                                        : 'current-password'
                                }
                                autoFocus={mode === 'reset'}
                                describedBy={
                                    choosingPassword
                                        ? 'password-rules'
                                        : undefined
                                }
                            />
                            {passwordError && (
                                <span className="auth-field-error">
                                    {passwordError}
                                </span>
                            )}
                            {choosingPassword && (
                                <PasswordRules password={password} />
                            )}
                        </label>
                    )}

                    {mode === 'login' && (
                        <button
                            type="button"
                            className="auth-link auth-forgot"
                            onClick={() => switchMode('forgot')}
                        >
                            Forgot your password?
                        </button>
                    )}

                    {choosingPassword && (
                        <label>
                            Confirm Password
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setConfirmError(null);
                                }}
                                className={confirmError ? 'input--error' : ''}
                                autoComplete="new-password"
                            />
                            {confirmError && (
                                <span className="auth-field-error">
                                    {confirmError}
                                </span>
                            )}
                        </label>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait…'
                            : {
                                  login: 'Log In',
                                  register: 'Sign Up',
                                  forgot: 'Send the link',
                                  reset: 'Save and log in',
                              }[mode]}
                    </button>
                </form>
            </>
        );
    }

    let footer = null;
    if (mode === 'login') {
        footer = (
            <>
                No account?{' '}
                <button
                    className="auth-link"
                    onClick={() => switchMode('register')}
                >
                    Sign up
                </button>
            </>
        );
    } else if (mode === 'register') {
        footer = (
            <>
                Already have an account?{' '}
                <button
                    className="auth-link"
                    onClick={() => switchMode('login')}
                >
                    Log in
                </button>
            </>
        );
    } else if (mode !== 'verify') {
        footer = (
            <button className="auth-link" onClick={() => switchMode('login')}>
                Back to log in
            </button>
        );
    }

    return createPortal(
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="auth-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <h2 id="auth-modal-title">{titles[mode]}</h2>

                {body}

                {footer && <p className="auth-switch">{footer}</p>}
            </div>
        </div>,
        document.body,
    );
}

export default AuthModal;
