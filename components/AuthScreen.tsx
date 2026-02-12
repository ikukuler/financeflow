import React, { useState } from 'react';
import Link from 'next/link';

interface AuthScreenProps {
  isLoading: boolean;
  error: string | null;
  info: string | null;
  onSignIn: (input: { email: string; password: string }) => Promise<boolean>;
  onSignUp: (input: { email: string; password: string }) => Promise<boolean>;
  onClearError: () => void;
  onClearInfo: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  isLoading,
  error,
  info,
  onSignIn,
  onSignUp,
  onClearError,
  onClearInfo,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitLabel = mode === 'signin' ? 'Sign In' : 'Create Account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    const action = mode === 'signin' ? onSignIn : onSignUp;
    const ok = await action({ email: email.trim(), password });

    if (ok && mode === 'signin') {
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">FinanceFlow</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to sync your planner with Supabase.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              onClearError();
              onClearInfo();
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              onClearError();
              onClearInfo();
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}

        {info && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {isLoading ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <div className="mt-5 text-xs text-slate-500">
          Need a quick preview?{' '}
          <Link href="/demo" className="text-indigo-600 hover:text-indigo-800">
            Open demo login
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
