'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Search, Clock, CheckCircle2, AlertTriangle, ChevronRight, Filter } from 'lucide-react';

interface Report {
  id: string;
  symptoms: string;
  status: string;
  createdAt: string;
  aiResult?: string | null;
  patient: {
    name: string;
  };
  assignedDoctor?: {
    name: string;
    category: string;
  } | null;
}

export default function AdminReportsBoard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
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

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // 1. Search filter
    const matchesSearch = report.patient.name.toLowerCase().includes(search.toLowerCase()) || 
                          report.symptoms.toLowerCase().includes(search.toLowerCase());
    
    // 2. Status filter
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;

    // 3. Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'ALL') {
      if (report.aiResult) {
        try {
          const aiJson = JSON.parse(report.aiResult);
          matchesCategory = aiJson.suggestedCategory === categoryFilter;
        } catch {
          matchesCategory = false;
        }
      } else {
        matchesCategory = false; // no aiResult but category filter active
      }
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Back navigation */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-400" />
            <span>Triage Reports Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse and filter all reports, inspect transcripts, rerun analysis, or manually assign cases.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 mb-8 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Filter className="h-4 w-4" />
            <span>Filter Panel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase">Search</label>
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-slate-500 pointer-events-none flex items-center" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient or symptoms..."
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950/85 py-2 pl-9 pr-3 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/85 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none h-[38px] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="REVIEWED">REVIEWED</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase">Doctor Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/85 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none h-[38px] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="ENT Specialist">ENT Specialist</option>
                <option value="Diabetologist">Diabetologist</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table/Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-slate-800 rounded-xl bg-slate-900/10">
            <span className="text-slate-500 text-sm">Fetching reports database...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 text-center p-6">
            <AlertTriangle className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-slate-400 font-semibold">No matching reports found</p>
            <p className="text-xs text-slate-550 mt-1">Try clearing filters or adjusting search queries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              let category = 'N/A';
              if (report.aiResult) {
                try {
                  category = JSON.parse(report.aiResult).suggestedCategory;
                } catch {}
              }
              return (
                <div
                  key={report.id}
                  className="rounded-xl border border-slate-850 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                      <span>Submitted: {new Date(report.createdAt).toLocaleString()}</span>
                      <span className="text-purple-400">AI Suggested Category: {category}</span>
                    </div>

                    {report.assignedDoctor ? (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-950/40 text-teal-400 border border-teal-900/40 rounded-lg text-xs font-semibold">
                        <span>Assigned Doctor:</span>
                        <span className="text-teal-300 font-bold">
                          {report.assignedDoctor.name} ({report.assignedDoctor.category})
                        </span>
                      </div>
                    ) : (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 text-red-400 border border-red-900/40 rounded-lg text-xs font-semibold">
                        <span>Unassigned:</span>
                        <span className="font-bold">
                          {report.status === 'PROCESSING' ? 'Awaiting Doctor' : 'Awaiting Analysis'}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-650 hover:bg-slate-800/50 text-slate-200 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer shrink-0"
                  >
                    <span>Manage Case</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
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
