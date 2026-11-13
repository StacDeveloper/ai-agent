import { useState } from "react";
import { api, url } from "../api/api.js";

export default function Login({ onSignedIn }) {
    const [mode, setMode] = useState('signin'); // 'signin' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '', code: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const registering = mode === 'register';
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    function switchMode() {
        setMode(registering ? 'signin' : 'register');
        setError('');
    }

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const path = registering ? '/api/auth/register' : '/api/auth/login';
            const body = registering
                ? form
                : { email: form.email, password: form.password };
                
            console.log(url, path, body)
            const res = await api.post(`${url}${path}`, body);
            onSignedIn(res.agent);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form className="login" onSubmit={submit}>
            <h1>{registering ? 'Create agent account' : 'Agent sign in'}</h1>

            {registering && (
                <label>
                    Name
                    <input required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} />
                </label>
            )}

            <label>
                Email
                <input type="email" required autoComplete="username" value={form.email} onChange={set('email')} />
            </label>

            <label>
                Password
                <input
                    type="password"
                    required
                    minLength={registering ? 8 : undefined}
                    autoComplete={registering ? 'new-password' : 'current-password'}
                    value={form.password}
                    onChange={set('password')}
                />
                {registering && <span className="muted">At least 8 characters.</span>}
            </label>

            {registering && (
                <label>
                    Access code
                    <input required autoComplete="off" value={form.code} onChange={set('code')} />
                    <span className="muted">Ask your team lead for the code.</span>
                </label>
            )}

            {error && <p className="notice error" role="alert">{error}</p>}

            <button className="primary" disabled={busy}>
                {busy ? (registering ? 'Creating account…' : 'Signing in…') : (registering ? 'Create account' : 'Sign in')}
            </button>

            <button type="button" className="link" onClick={switchMode}>
                {registering ? 'Already have an account? Sign in' : 'New agent? Create an account'}
            </button>
        </form>
    );
}