'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Clock, CheckCircle2, ChevronRight, AlertCircle, Filter } from 'lucide-react';

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

export default function DoctorReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, REVIEWED

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/doctor/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (e) {
      console.error('Failed to load assignments list:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <Clock className="h-3 w-3" />
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

  const filteredReports = reports.filter((report) => {
    if (filter === 'PENDING') return report.status === 'ASSIGNED';
    if (filter === 'REVIEWED') return report.status === 'REVIEWED';
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Back Link */}
        <Link href="/doctor/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-450 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-blue-400" />
              <span>Assigned Case Ledger</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-sans">
              Examine assigned dossiers, audit transcripts, and mark cases as reviewed.
            </p>
          </div>

          {/* Filter Toggles */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto shrink-0">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'PENDING' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('REVIEWED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'REVIEWED' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reviewed
            </button>
          </div>
        </div>

        {/* Assignments Ledger */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-slate-800 rounded-xl bg-slate-900/10">
            <span className="text-slate-500 text-sm">Loading ledger...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 text-center p-6">
            <AlertCircle className="h-12 w-12 text-slate-650 mb-3" />
            <p className="text-slate-400 font-semibold text-lg">No cases found</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              You do not have any {filter !== 'ALL' ? filter.toLowerCase() : ''} assignments registered.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group rounded-xl border border-slate-850 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white truncate max-w-md">{report.patient.name}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-2 truncate font-sans">
                    Symptoms: {report.symptoms}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-450">
                    <span>Assigned: {new Date(report.createdAt).toLocaleString()}</span>
                    <span>Patient Details: {report.patient.age}y &bull; {report.patient.gender}</span>
                  </div>
                </div>

                <Link
                  href={`/doctor/reports/${report.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-650 hover:bg-slate-800/50 text-slate-200 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer shrink-0"
                >
                  <span>Examine Dossier</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-slate-655 text-xs border-t border-slate-900 pt-8 mt-16">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
