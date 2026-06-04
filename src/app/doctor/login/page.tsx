'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jenkins@healthcare.com', password: 'doctor123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      if (data.user.role !== 'DOCTOR') {
        throw new Error('Unauthorized. You are not registered as a Doctor.');
      }
      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (data.user.role !== 'DOCTOR') {
        throw new Error('Unauthorized. You are not registered as a Doctor.');
      }

      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      {/* Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-blue-400 mb-2">
            <Stethoscope className="h-7 w-7" />
            <span>CareRoute<span className="text-white font-light">AI</span></span>
          </Link>
          <p className="text-slate-400 text-sm font-medium">Doctor Workspace Login</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Professional Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3.5 text-slate-100 placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                  placeholder="doctor@healthcare.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3.5 text-slate-100 placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white py-3 text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Doctor Workspace Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950/40 hover:bg-slate-900/60 text-slate-200 py-2.5 text-sm font-semibold transition-all cursor-pointer"
              >
                <span>Login as Demo Doctor</span>
              </button>
            </div>
          </form>
        </div>

        {/* Back to main router */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            &larr; Back to Main Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
