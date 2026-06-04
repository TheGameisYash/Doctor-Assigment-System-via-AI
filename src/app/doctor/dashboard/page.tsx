'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle2, Clock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

interface Report {
  id: string;
  symptoms: string;
  status: string;
  createdAt: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
}

export default function DoctorDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      // 1. Fetch Doctor Profile
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setDoctorName(meData.user.profile?.name || 'Doctor');
      }

      // 2. Fetch Doctor Assigned Reports
      const reportsRes = await fetch('/api/doctor/reports');
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports);
      }
    } catch (e) {
      console.error('Failed to fetch doctor dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalAssigned = reports.length;
  const activeCount = reports.filter(r => r.status === 'ASSIGNED').length;
  const reviewedCount = reports.filter(r => r.status === 'REVIEWED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <Clock className="h-3 w-3 animate-pulse" />
            PENDING REVIEW
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            REVIEWED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-blue-400 font-bold">{doctorName}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Examine your assigned medical dossiers, inspect transcripts, and check routing categories.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Assignments</div>
            <div className="text-3xl font-bold text-white mt-2">{totalAssigned}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Awaiting Review</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{activeCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Reviewed Cases</div>
            <div className="text-3xl font-bold text-slate-400 mt-2">{reviewedCount}</div>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shortcuts */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Workspace Navigation</h2>

            <Link
              href="/doctor/assigned-reports"
              className="flex items-center gap-4 p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Assigned Dossiers</h3>
                <p className="text-xs text-slate-400 mt-1">Access outstanding charts and classification details</p>
              </div>
            </Link>
          </div>

          {/* Active Work list */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Outstanding Assignments</h2>
              <Link href="/doctor/assigned-reports" className="text-blue-400 text-sm hover:underline flex items-center gap-0.5">
                <span>View all cases</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48 border border-slate-800 rounded-xl bg-slate-900/20">
                <span className="text-slate-550 text-sm">Fetching workspace database...</span>
              </div>
            ) : reports.filter(r => r.status === 'ASSIGNED').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-850 rounded-xl bg-slate-900/10 text-center p-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <p className="text-slate-400 font-semibold">All reviews completed</p>
                <p className="text-xs text-slate-500 mt-1 font-sans">You have no active patient assignments awaiting inspection.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900/30">
                <ul className="divide-y divide-slate-800/60">
                  {reports
                    .filter(r => r.status === 'ASSIGNED')
                    .slice(0, 4)
                    .map((report) => (
                      <li key={report.id} className="hover:bg-slate-900/20 transition-all">
                        <Link href={`/doctor/reports/${report.id}`} className="flex items-center justify-between p-5">
                          <div className="flex-1 pr-4 truncate">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white truncate">{report.patient.name}</span>
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 truncate font-sans">
                              Symptoms: {report.symptoms}
                            </p>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-4">
                              <span>Assigned: {new Date(report.createdAt).toLocaleDateString()}</span>
                              <span>Age: {report.patient.age} years</span>
                              <span>Gender: {report.patient.gender}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-650" />
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-655 text-xs border-t border-slate-900 pt-8 mt-12">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
