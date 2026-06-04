'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface Report {
  id: string;
  symptoms: string;
  status: string;
  createdAt: string;
  assignedDoctor?: {
    name: string;
    category: string;
  };
}

export default function PatientDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get profile info
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setPatientName(userData.user.profile?.name || 'Patient');
      }

      // Get reports
      const reportsRes = await fetch('/api/reports/my');
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length;
  const assignedCount = reports.filter(r => r.status === 'ASSIGNED').length;
  const reviewedCount = reports.filter(r => r.status === 'REVIEWED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full">
            <Clock className="h-3 w-3" />
            PENDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
            <Clock className="h-3 w-3" />
            PROCESSING
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            ASSIGNED
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
            Welcome back, <span className="text-teal-400 font-bold">{patientName}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Check the status of your medical report transcripts and specialist assignments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Uploads</div>
            <div className="text-3xl font-bold text-white mt-2">{totalReports}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Processing</div>
            <div className="text-3xl font-bold text-yellow-500 mt-2">{pendingCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Assigned Doctors</div>
            <div className="text-3xl font-bold text-teal-400 mt-2">{assignedCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Cases Reviewed</div>
            <div className="text-3xl font-bold text-slate-400 mt-2">{reviewedCount}</div>
          </div>
        </div>

        {/* Action Center & Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Triage Center</h2>

            <Link
              href="/patient/upload-report"
              className="flex items-center gap-4 p-5 rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/40 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Upload New Report</h3>
                <p className="text-xs text-slate-400 mt-1">Submit prescriptions or reports for automated routing</p>
              </div>
            </Link>

            <Link
              href="/patient/reports"
              className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-lg bg-slate-800 text-slate-300 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">View Reports History</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">Browse logs and specialist assignments</p>
              </div>
            </Link>
          </div>

          {/* Recent Reports List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Recent Reports</h2>
              <Link href="/patient/reports" className="text-teal-400 text-sm hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48 border border-slate-800 rounded-xl bg-slate-900/20">
                <span className="text-slate-500 text-sm">Loading records...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-850 rounded-xl bg-slate-900/10 text-center p-6">
                <AlertCircle className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-slate-400 font-semibold">No medical reports found</p>
                <p className="text-xs text-slate-500 mt-1">Upload a prescription to get assigned to a specialist.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900/30">
                <ul className="divide-y divide-slate-800/60">
                  {reports.slice(0, 4).map((report) => (
                    <li key={report.id} className="hover:bg-slate-900/20 transition-all">
                      <Link href={`/patient/reports/${report.id}`} className="flex items-center justify-between p-5">
                        <div className="flex-1 pr-4 truncate">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white truncate">{report.symptoms}</span>
                            {getStatusBadge(report.status)}
                          </div>
                          <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
                            <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                            {report.assignedDoctor && (
                              <span className="text-teal-400 font-medium">
                                Doctor: {report.assignedDoctor.name} ({report.assignedDoctor.category})
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-600" />
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
      <div className="text-center text-slate-600 text-xs border-t border-slate-900 pt-8 mt-12">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
