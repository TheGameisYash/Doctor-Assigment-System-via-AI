'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, Clock, ShieldAlert, Heart, Stethoscope, Sparkles } from 'lucide-react';

interface ReportDetails {
  id: string;
  symptoms: string;
  reportTranscript: string;
  filePath: string | null;
  aiResult: string | null;
  status: string;
  createdAt: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  assignedDoctor?: {
    name: string;
    category: string;
    specialization: string;
  } | null;
}

export default function PatientReportDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied. You do not own this report.');
        }
        throw new Error('Failed to load report details.');
      }
      const data = await res.json();
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
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

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center text-slate-350 text-sm">
        <span>Loading report details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Unauthorized / Error</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <Link href="/patient/dashboard" className="text-teal-400 font-bold hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!report) return null;

  // Parse AI Result JSON
  let aiData: any = null;
  if (report.aiResult) {
    try {
      aiData = JSON.parse(report.aiResult);
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Back navigation */}
        <Link href="/patient/reports" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Reports</span>
        </Link>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Report Dossier</h1>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-slate-500 text-xs mt-2">Dossier ID: {report.id} &bull; Submitted: {new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Patient details & Symptoms (Left, spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Symptoms Card */}
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6">
              <h3 className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wider">Symptoms Described</h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{report.symptoms}</p>
            </div>

            {/* Extracted Transcript Card */}
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Extracted Medical Transcript</h3>
                {report.filePath && (
                  <a
                    href={report.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:underline border border-teal-500/20 bg-teal-500/5 px-2.5 py-1 rounded-lg"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View original file</span>
                  </a>
                )}
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {report.reportTranscript || 'No transcript text was generated. Try manual edit or re-upload.'}
              </div>
            </div>
          </div>

          {/* Column 2: Triage Assignment Card (Right, spans 1 column) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI Classification Details */}
            {aiData && (
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
                <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>AI Triage Decision</span>
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Suggested Specialist Category</span>
                    <span className="text-white font-bold text-lg">{aiData.suggestedCategory}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-xs block">Confidence Score</span>
                      <span className="text-white font-semibold">{(aiData.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Urgency Status</span>
                      <span className={`font-bold ${
                        aiData.urgency === 'HIGH' ? 'text-red-400' : aiData.urgency === 'MEDIUM' ? 'text-yellow-500' : 'text-slate-300'
                      }`}>{aiData.urgency}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs block">Routing Rationale</span>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{aiData.reason}</p>
                  </div>

                  {aiData.keywords && aiData.keywords.length > 0 && (
                    <div>
                      <span className="text-slate-400 text-xs block mb-1.5">Detected Clinical Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiData.keywords.map((kw: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-500 flex justify-between">
                    <span>Triage engine safe-route policy</span>
                    <span>Triage: ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* Specialist Assignment */}
            {report.assignedDoctor ? (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                <h3 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="h-4.5 w-4.5" />
                  <span>Clinical Assignment</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 text-xs block">Assigned Specialist</span>
                    <span className="text-white font-bold text-lg">{report.assignedDoctor.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Department Category</span>
                    <span className="text-slate-300 text-sm font-medium">{report.assignedDoctor.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Sub-specialization</span>
                    <span className="text-slate-300 text-xs">{report.assignedDoctor.specialization}</span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 mt-4 text-[10px] text-slate-500">
                    Your assigned medical practitioner has been notified and is currently inspecting your clinical charts.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6 text-center">
                <Stethoscope className="h-10 w-10 text-slate-650 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm">Specialist Assignment Pending</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  We are matching your case with an active doctor in the suggested category. Check back shortly or contact admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-650 text-xs border-t border-slate-900 pt-8 mt-16">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
