import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-3xl border-slate-200">
        <CardHeader className="gap-3">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">FinanceFlow</CardTitle>
          <CardDescription>Sign in to sync your planner.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <Button
              type="button"
              onClick={() => {
                setMode('signin');
                onClearError();
                onClearInfo();
              }}
              variant="ghost"
              className={`rounded-lg py-2 text-sm font-semibold ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMode('signup');
                onClearError();
                onClearInfo();
              }}
              variant="ghost"
              className={`rounded-lg py-2 text-sm font-semibold ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </Button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}

          {info && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-xl border-slate-200 bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="rounded-xl border-slate-200 bg-white"
                placeholder="At least 6 characters"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-900"
            >
              {isLoading ? 'Please wait...' : submitLabel}
            </Button>
          </form>

          <div className="text-xs text-slate-500">
            Need a quick preview?{' '}
            <Link href="/demo" className="text-indigo-600 hover:text-indigo-800">
              Open demo login
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
