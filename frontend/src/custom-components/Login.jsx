import React, { useState } from 'react'
import { api } from '../src/api/api'

const Login = ({ onSignedIn }) => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const url = import.meta.env.VITE_BASE_URL
    async function submit(e) {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
            onSignedIn((await api.post(`${url}/api/auth/login`, form)).agent)

        } catch (error) {
            setError(error.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className='login' onSubmit={submit}>
            <h1>Agent sign in</h1>
            <label>Email <input type='email' autoComplete='username' required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /> </label>
            <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            {error && <p className="notice error" role="alert">{error}</p>}
            <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
    )
}

export default Login
