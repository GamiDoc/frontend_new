// Password rules for sign up and password reset. Keep them in sync with the backend
// (backend/internal/auth/password.go).
export const PASSWORD_RULES = [
    {
        id: 'length',
        label: 'Between 8 and 72 characters',
        test: (password) =>
            password.length >= 8 &&
            new TextEncoder().encode(password).length <= 72,
    },
    {
        id: 'upper',
        label: 'An uppercase letter (A–Z)',
        test: (password) => /\p{Lu}/u.test(password),
    },
    {
        id: 'lower',
        label: 'A lowercase letter (a–z)',
        test: (password) => /\p{Ll}/u.test(password),
    },
    {
        id: 'digit',
        label: 'A number (0–9)',
        test: (password) => /\p{Nd}/u.test(password),
    },
];

export function passwordIsValid(password) {
    return PASSWORD_RULES.every((rule) => rule.test(password));
}
