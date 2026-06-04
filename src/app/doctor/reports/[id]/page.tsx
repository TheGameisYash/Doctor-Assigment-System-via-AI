'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle2, Clock, ShieldAlert, Heart, Stethoscope, Sparkles, User, AlertCircle, Eye } from 'lucide-react';

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
}

export default function DoctorReportDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [report, setReport] = useState<ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied. This report is not assigned to you.');
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

  const handleMarkReviewed = async () => {
    setActionLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const res = await fetch(`/api/doctor/reports/${id}/mark-reviewed`, {
        method: 'PATCH',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update review status.');
      }

      setFeedback({ text: 'Case marked as reviewed successfully.', type: 'success' });
      await fetchReportDetails();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Failed to complete review.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

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
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <Link href="/doctor/dashboard" className="text-blue-400 font-bold hover:underline">
          &larr; Return to Workspace
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
        {/* Back Link */}
        <Link href="/doctor/assigned-reports" className="inline-flex items-center gap-1 text-sm text-slate-450 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assigned Cases</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Clinical Dossier Workspace</h1>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-slate-500 text-xs mt-2">Dossier ID: {report.id} &bull; Assigned: {new Date(report.createdAt).toLocaleString()}</p>
          </div>

          {/* Action button */}
          {report.status === 'ASSIGNED' ? (
            <button
              onClick={handleMarkReviewed}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 text-sm font-bold shadow cursor-pointer transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Case Reviewed</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-850 text-slate-400 rounded-lg text-sm font-bold">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
              <span>Case Closed / Reviewed</span>
            </div>
          )}
        </div>

        {/* Feedback Message */}
        {feedback.text && (
          <div className={`rounded-lg border p-4 mb-6 text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400'
              : 'border-red-900/30 bg-red-950/20 text-red-400'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Patient and Transcript */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Patient Demographics */}
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6">
              <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>Patient Demographics</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-450 text-xs block">Patient Name</span>
                  <span className="text-white font-bold">{report.patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-450 text-xs block">Age</span>
                  <span className="text-white font-bold">{report.patient.age} years</span>
                </div>
                <div>
                  <span className="text-slate-450 text-xs block">Gender</span>
                  <span className="text-white font-bold">{report.patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-450 text-xs block">Contact Phone</span>
                  <span className="text-white font-bold">{report.patient.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Symptoms Description */}
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6">
              <h3 className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wider">Symptoms Described</h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{report.symptoms}</p>
            </div>

            {/* Transcript */}
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Medical Transcript Text</h3>
                {report.filePath && (
                  <a
                    href={report.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-450 hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View attached document file</span>
                  </a>
                )}
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {report.reportTranscript || 'No transcript text was generated.'}
              </div>
            </div>
          </div>

          {/* Col 3: AI Routing Information */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI Classification Details */}
            {aiData && (
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
                <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>AI routing information</span>
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
                        aiData.urgency === 'HIGH' ? 'text-red-400' : aiData.urgency === 'MEDIUM' ? 'text-yellow-500' : 'text-slate-350'
                      }`}>{aiData.urgency}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs block">Routing Rationale</span>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{aiData.reason}</p>
                  </div>

                  {aiData.keywords && aiData.keywords.length > 0 && (
                    <div>
                      <span className="text-slate-400 text-xs block mb-1.5">Detected Keywords</span>
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
            
            {/* Clinical Note Safety Rule Banner */}
            <div className="rounded-xl border border-red-500/25 bg-red-950/15 p-5">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span> Triage Safety Protocols</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                As a reminder, this system is strictly designed for **clinical assignment and routing**. AI analysis results are informational. Do not output medical diagnoses, medication recommendations, or treatment proposals directly within the dossier workflow logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-655 text-xs border-t border-slate-900 pt-8 mt-16">
        CareRoute AI System v1.0. All interactions are audited and clinically secure.
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
