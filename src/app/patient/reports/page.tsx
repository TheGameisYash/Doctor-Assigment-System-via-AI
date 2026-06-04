'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  symptoms: string;
  status: string;
  createdAt: string;
  filePath?: string | null;
  assignedDoctor?: {
    name: string;
    category: string;
    specialization: string;
  } | null;
}

export default function PatientReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports/my');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Medical Reports</h1>
            <p className="text-slate-400 text-sm mt-1">Review your transcription history and clinical routing logs.</p>
          </div>
          <Link
            href="/patient/upload-report"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 text-sm font-bold shadow transition-all cursor-pointer w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Report</span>
          </Link>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-slate-800 rounded-2xl bg-slate-900/10">
            <span className="text-slate-550 text-sm">Fetching report database...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 text-center p-6">
            <AlertCircle className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-semibold text-lg">No reports submitted yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Get started by uploading your first prescription or clinical report chart to receive a specialist assignment.
            </p>
            <Link
              href="/patient/upload-report"
              className="mt-6 inline-flex items-center gap-1 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <span>Upload Now</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="group rounded-xl border border-slate-850 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white truncate max-w-md">{report.symptoms}</h3>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
                    <span>Submitted: {new Date(report.createdAt).toLocaleString()}</span>
                    {report.filePath && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Attached Document</span>
                      </span>
                    )}
                  </div>

                  {report.assignedDoctor ? (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-950/40 text-teal-400 border border-teal-900/40 rounded-lg text-xs font-semibold">
                      <span>Assigned Specialist:</span>
                      <span className="text-teal-300 font-bold">
                        {report.assignedDoctor.name} ({report.assignedDoctor.category})
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-850 text-slate-400 border border-slate-800 rounded-lg text-xs font-semibold">
                      <span>Routing Status:</span>
                      <span className="font-bold text-slate-300">
                        {report.status === 'PROCESSING' ? 'Awaiting Doctor Availability' : 'Triage In Queue'}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/patient/reports/${report.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-650 hover:bg-slate-800/50 text-slate-200 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer shrink-0"
                >
                  <span>View Dossier</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-slate-650 text-xs border-t border-slate-900 pt-8 mt-16">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
