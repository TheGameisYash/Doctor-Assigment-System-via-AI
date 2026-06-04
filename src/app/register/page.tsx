'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Lock, User, Phone, Calendar, Loader2, ArrowRight } from 'lucide-react';

export default function PatientRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      router.push('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      {/* Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg my-8">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-teal-400 mb-2">
            <ShieldAlert className="h-7 w-7" />
            <span>CareRoute<span className="text-white font-light">AI</span></span>
          </Link>
          <p className="text-slate-400 text-sm">Create Patient Account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Age
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="age"
                    type="number"
                    required
                    min="1"
                    max="125"
                    value={formData.age}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                    placeholder="34"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm h-[38px] cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 py-2.5 text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-teal-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
