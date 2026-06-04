'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Stethoscope, AlertTriangle, Users, Clock, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface Report {
  id: string;
  symptoms: string;
  status: string;
  createdAt: string;
  filePath?: string | null;
  patient: {
    name: string;
  };
  assignedDoctor?: {
    name: string;
    category: string;
  } | null;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }

      const docsRes = await fetch('/api/doctors');
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDoctorsCount(docsData.doctors.length);
      }
    } catch (e) {
      console.error('Failed to fetch admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'PENDING').length;
  const processingCount = reports.filter(r => r.status === 'PROCESSING').length;
  const assignedCount = reports.filter(r => r.status === 'ASSIGNED').length;
  const reviewedCount = reports.filter(r => r.status === 'REVIEWED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full">
            <Clock className="h-3 w-3" />
            PENDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
            <Clock className="h-3 w-3" />
            PROCESSING
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            ASSIGNED
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-purple-400" />
            <span>Admin Control Console</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit triage queues, analyze extraction logs, manage doctor availabilities, and override auto-routing.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase">Total Cases</div>
            <div className="text-3xl font-bold text-white mt-2">{totalReports}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase">Unparsed / Pending</div>
            <div className="text-3xl font-bold text-yellow-500 mt-2">{pendingCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase">Awaiting Doctor</div>
            <div className="text-3xl font-bold text-blue-500 mt-2">{processingCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase">Assigned</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{assignedCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold uppercase">Total Doctors</div>
            <div className="text-3xl font-bold text-purple-400 mt-2">{doctorsCount}</div>
          </div>
        </div>

        {/* Action Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Shortcuts */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Operations Center</h2>
            
            <Link
              href="/admin/reports"
              className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Triage Queue</h3>
                <p className="text-xs text-slate-400 mt-1">Review all active assignments and classification logs</p>
              </div>
            </Link>

            <Link
              href="/admin/doctors"
              className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Manage Doctors</h3>
                <p className="text-xs text-slate-400 mt-1">Create doctor logins and toggle category availability</p>
              </div>
            </Link>

            <Link
              href="/admin/patients"
              className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Patients Ledger</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">View profiles and submit details logs</p>
              </div>
            </Link>
          </div>

          {/* Pending triage board */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Awaiting Action (Pending/Processing)</h2>

            {loading ? (
              <div className="flex justify-center items-center h-64 border border-slate-800 rounded-xl bg-slate-900/20">
                <span className="text-slate-500 text-sm">Fetching case record database...</span>
              </div>
            ) : reports.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-850 rounded-xl bg-slate-900/10 text-center p-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-slate-400 font-semibold">Triage queue is empty</p>
                <p className="text-xs text-slate-500 mt-1">All current patient reports have been analyzed and assigned.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900/30">
                <ul className="divide-y divide-slate-800/60">
                  {reports
                    .filter(r => r.status === 'PENDING' || r.status === 'PROCESSING')
                    .slice(0, 5)
                    .map((report) => (
                      <li key={report.id} className="hover:bg-slate-900/20 transition-all">
                        <Link href={`/admin/reports/${report.id}`} className="flex items-center justify-between p-5">
                          <div className="flex-1 pr-4 truncate">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white truncate">{report.patient.name}</span>
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 truncate font-sans">
                              Symptoms: {report.symptoms}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              Submitted: {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {report.status === 'PROCESSING' && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-semibold">
                                <AlertTriangle className="h-3 w-3" />
                                No Doc Available
                              </span>
                            )}
                            <ChevronRight className="h-5 w-5 text-slate-650" />
                          </div>
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
      <div className="text-center text-slate-650 text-xs border-t border-slate-900 pt-8 mt-12">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
