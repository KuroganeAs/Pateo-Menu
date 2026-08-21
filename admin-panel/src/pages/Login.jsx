import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/menu" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/menu', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Invalid username or password' : `Login failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface rounded-2xl shadow-card p-8 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Páteo Admin</h1>
          <p className="text-sm text-muted mt-1">Sign in to manage the menu and promos.</p>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy || !username || !password}
          className="w-full rounded-xl bg-primary text-white font-semibold py-2.5 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
