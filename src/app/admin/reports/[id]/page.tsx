'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle2, Clock, ShieldAlert, Heart, Stethoscope, Sparkles, User, RefreshCw, AlertCircle, Save } from 'lucide-react';

interface ReportDetails {
  id: string;
  symptoms: string;
  reportTranscript: string;
  filePath: string | null;
  aiResult: string | null;
  status: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  assignedDoctor?: {
    id: string;
    name: string;
    category: string;
    specialization: string;
  } | null;
  assignments: Array<{
    id: string;
    assignedBy: string;
    reviewStatus: string;
    createdAt: string;
    doctor: {
      name: string;
      category: string;
    };
  }>;
}

interface Doctor {
  id: string;
  name: string;
  category: string;
  specialization: string;
  available: boolean;
  status: string;
}

export default function AdminReportDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  // Actions Loading State
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch Report
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        throw new Error('Failed to load report details.');
      }
      const data = await res.json();
      setReport(data.report);
      setSelectedDoctorId(data.report.assignedDoctorId || '');

      // 2. Fetch Doctors List
      const docsRes = await fetch('/api/doctors');
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDoctors(docsData.doctors);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching case details.');
    } finally {
      setLoading(false);
    }
  };

  // Re-run AI Analysis
  const handleReanalyze = async () => {
    setActionLoading(true);
    setFeedbackMessage({ text: '', type: '' });
    
    try {
      const res = await fetch(`/api/admin/reports/${id}/reanalyze`, {
        method: 'POST'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Re-analysis failed.');
      }

      setFeedbackMessage({ text: 'AI analysis completed successfully.', type: 'success' });
      // Reload report details
      await fetchData();
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to analyze.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Override Doctor Assignment
  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) {
      setFeedbackMessage({ text: 'Please select a doctor to assign.', type: 'error' });
      return;
    }

    setActionLoading(true);
    setFeedbackMessage({ text: '', type: '' });

    try {
      const res = await fetch(`/api/admin/reports/${id}/assign-doctor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoctorId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Assignment update failed.');
      }

      setFeedbackMessage({ text: 'Doctor assigned successfully by Admin.', type: 'success' });
      await fetchData();
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to assign.', type: 'error' });
    } finally {
      setActionLoading(false);
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
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Case</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
        <Link href="/admin/dashboard" className="text-teal-400 font-bold hover:underline">
          &larr; Return to Admin Dashboard
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Back Link */}
        <Link href="/admin/reports" className="inline-flex items-center gap-1 text-sm text-slate-450 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Triage Reports</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Manage Case Dossier</h1>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-slate-500 text-xs mt-2">Dossier ID: {report.id} &bull; Submitted: {new Date(report.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReanalyze}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-850 px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-55"
            >
              <RefreshCw className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>Rerun AI Analysis</span>
            </button>
          </div>
        </div>

        {/* Alerts / Feedback Banner */}
        {feedbackMessage.text && (
          <div className={`rounded-lg border p-4 mb-6 text-sm flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-900/30 bg-emerald-950/20 text-emerald-400'
              : 'border-red-900/30 bg-red-950/20 text-red-400'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Patient Profile, Symptoms, Transcript */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Patient Demographic Card */}
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
                  <span className="text-slate-455 text-xs block">Age</span>
                  <span className="text-white font-bold">{report.patient.age} years</span>
                </div>
                <div>
                  <span className="text-slate-455 text-xs block">Gender</span>
                  <span className="text-white font-bold">{report.patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-455 text-xs block">Contact Phone</span>
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
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Extracted Medical Transcript</h3>
                {report.filePath && (
                  <a
                    href={report.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-450 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View original file attachment</span>
                  </a>
                )}
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {report.reportTranscript || 'No transcript text extracted yet.'}
              </div>
            </div>
          </div>

          {/* Col 3: Override Assignment & AI Routing Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Override Assignment Control */}
            <div className="rounded-xl border border-purple-550/20 bg-purple-950/5 p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
              <h3 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="h-4.5 w-4.5" />
                <span>Override Assignment</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="doctor-select" className="block text-xs text-slate-400 mb-2">
                    Select Care Provider
                  </label>
                  <select
                    id="doctor-select"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    disabled={actionLoading}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Unassigned / Select Doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.category} - {doc.available ? 'Available' : 'Busy'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssignDoctor}
                  disabled={actionLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white py-2 text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Assignment</span>
                </button>
              </div>
            </div>

            {/* AI Result Inspector */}
            {aiData && (
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
                <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>AI Classification Log</span>
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

                  <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-500 flex justify-between">
                    <span>Manual review required:</span>
                    <span className="font-bold">{aiData.manualReviewRequired ? 'TRUE' : 'FALSE'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Timeline */}
        {report.assignments && report.assignments.length > 0 && (
          <div className="mt-10 rounded-xl border border-slate-850 bg-slate-900/10 p-6">
            <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider">Assignment History</h3>
            <div className="relative border-l border-slate-800 pl-6 ml-2 space-y-6">
              {report.assignments.map((asg: any) => (
                <div key={asg.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] mt-1.5 h-2 w-2 rounded-full bg-purple-550 border border-purple-500 shadow shadow-purple-550" />
                  <div className="text-sm">
                    <span className="font-semibold text-white">Assigned to: {asg.doctor?.name}</span>
                    <span className="text-slate-400 text-xs font-light ml-2">
                      ({asg.doctor?.category})
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned By: <span className="font-semibold text-purple-400">{asg.assignedBy}</span> &bull; 
                      Review Status: <span className="font-semibold text-slate-300">{asg.reviewStatus}</span> &bull; 
                      Timestamp: {new Date(asg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
