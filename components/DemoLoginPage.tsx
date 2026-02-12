'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from '@/lib/demo-config';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const DemoLoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_USER_EMAIL);
  const [password, setPassword] = useState(DEMO_USER_PASSWORD);

  const { user, isLoading, error, signIn, clearError } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email: email.trim(), password });
  };

  const applyDemoCredentials = () => {
    clearError();
    setEmail(DEMO_USER_EMAIL);
    setPassword(DEMO_USER_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">FinanceFlow Demo</h1>
        <p className="mt-2 text-sm text-slate-500">Use the demo account to test the planner.</p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Demo data is automatically cleaned every 15 minutes.
        </div>

        {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={applyDemoCredentials}
              className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:border-slate-300"
            >
              Use demo credentials
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
            >
              {isLoading ? 'Please wait...' : 'Enter demo'}
            </button>
          </div>
        </form>

        <div className="mt-5 text-xs text-slate-500">
          Back to regular auth: <Link href="/" className="text-indigo-600 hover:text-indigo-800">home</Link>
        </div>
      </div>
    </div>
  );
};

export default DemoLoginPage;
