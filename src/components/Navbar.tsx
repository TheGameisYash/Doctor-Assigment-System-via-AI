'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, LogOut, Upload, FileText, User, Users, ClipboardList, Stethoscope, Menu, X } from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  role: string;
  profile?: {
    name: string;
  };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        // If we are on a protected page (patient, doctor, admin) and the auth check fails,
        // we should clear the token cookie via POST logout and redirect to the correct login page.
        const isProtectedRoute = pathname.startsWith('/patient') || 
                                 pathname.startsWith('/admin') || 
                                 pathname.startsWith('/doctor');
        const isLoginPage = pathname === '/login' || 
                            pathname === '/admin/login' || 
                            pathname === '/doctor/login';
        
        if (isProtectedRoute && !isLoginPage) {
          // Clear httpOnly cookie by calling the logout endpoint first, then redirect
          fetch('/api/auth/me', { method: 'POST' })
            .catch(() => {})
            .finally(() => {
              // Determine redirect destination
              let redirectUrl = '/login';
              if (pathname.startsWith('/admin')) {
                redirectUrl = '/admin/login';
              } else if (pathname.startsWith('/doctor')) {
                redirectUrl = '/doctor/login';
              }
              window.location.href = redirectUrl;
            });
        }
      }
    } catch (e) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/me', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        // Direct redirects based on current path to avoid auth loop
        if (pathname.startsWith('/admin')) {
          router.push('/admin/login');
        } else if (pathname.startsWith('/doctor')) {
          router.push('/doctor/login');
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null; // Don't show navbar if not logged in

  const isPatient = user.role === 'PATIENT';
  const isAdmin = user.role === 'ADMIN';
  const isDoctor = user.role === 'DOCTOR';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-slate-900/85 backdrop-blur-md text-slate-100 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-teal-400">
              <ShieldAlert className="h-6 w-6 text-teal-400" />
              <span>CareRoute<span className="text-white font-light">AI</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isPatient && (
              <>
                <Link
                  href="/patient/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/dashboard' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/patient/upload-report"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/upload-report' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload Report
                </Link>
                <Link
                  href="/patient/reports"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/reports' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  My Reports
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/dashboard' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/reports"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/reports' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  All Reports
                </Link>
                <Link
                  href="/admin/patients"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/patients' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Patients
                </Link>
                <Link
                  href="/admin/doctors"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/doctors' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Stethoscope className="h-4 w-4" />
                  Manage Doctors
                </Link>
              </>
            )}

            {isDoctor && (
              <>
                <Link
                  href="/doctor/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor/dashboard' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/doctor/assigned-reports"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor/assigned-reports' ? 'text-teal-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Assigned Cases
                </Link>
              </>
            )}
          </div>

          {/* User Profile and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-xs px-2.5 py-1 bg-slate-800 text-teal-300 border border-slate-700/50 rounded-full">
              {user.role}
            </span>
            <span className="text-sm font-light text-slate-300 truncate max-w-[120px]">
              {user.profile?.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 hover:border-red-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-4 space-y-1">
          {isPatient && (
            <>
              <Link
                href="/patient/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/patient/upload-report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Upload Report
              </Link>
              <Link
                href="/patient/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                My Reports
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                All Reports
              </Link>
              <Link
                href="/admin/patients"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Patients
              </Link>
              <Link
                href="/admin/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Manage Doctors
              </Link>
            </>
          )}

          {isDoctor && (
            <>
              <Link
                href="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/doctor/assigned-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Assigned Cases
              </Link>
            </>
          )}

          <div className="pt-4 pb-2 border-t border-slate-800 flex items-center justify-between px-3">
            <div>
              <p className="text-sm font-semibold text-white">{user.profile?.name || user.email}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1 bg-red-950/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
