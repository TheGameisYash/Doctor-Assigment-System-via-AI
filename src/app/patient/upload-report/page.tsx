'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';

type Step = 'IDLE' | 'UPLOADING' | 'EXTRACTING' | 'EXTRACTION_FAILED' | 'ANALYZING' | 'SUCCESS';

export default function UploadReport() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Drag and Drop state
  const [dragging, setDragging] = useState(false);
  
  // Wizard Workflow State
  const [step, setStep] = useState<Step>('IDLE');
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill user profile if logged in
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.profile) {
          setName(data.user.profile.name || '');
          setAge(data.user.profile.age?.toString() || '');
          setGender(data.user.profile.gender || 'Male');
          setPhone(data.user.profile.phone || '');
        }
      }
    } catch (e) {
      console.error('Failed to load profile details:', e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage('');
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  // Execution Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms) {
      setErrorMessage('Please describe your symptoms.');
      return;
    }

    setStep('UPLOADING');
    setErrorMessage('');

    try {
      // 1. Upload file and profile data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('phone', phone);
      formData.append('symptoms', symptoms);
      if (file) {
        formData.append('file', file);
      }

      const uploadRes = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload report file.');
      }

      const reportId = uploadData.report.id;
      setCurrentReportId(reportId);

      // If no file was uploaded, transition straight to manual transcript prompt
      if (!file) {
        setStep('EXTRACTION_FAILED');
        setExtractedText('');
        return;
      }

      // 2. Extract Text (OCR/PDF Parse)
      setStep('EXTRACTING');
      const ocrRes = await fetch(`/api/reports/${reportId}/extract-text`, {
        method: 'POST',
      });

      const ocrData = await ocrRes.json();

      if (!ocrRes.ok || !ocrData.success) {
        setStep('EXTRACTION_FAILED');
        setExtractedText(ocrData.transcript || '');
        return;
      }

      // 3. Analyze Transcript
      setStep('ANALYZING');
      const analyzeRes = await fetch(`/api/reports/${reportId}/analyze`, {
        method: 'POST',
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'AI Routing analysis failed.');
      }

      // 4. Success and Redirect
      setStep('SUCCESS');
      setTimeout(() => {
        router.push(`/patient/reports/${reportId}`);
      }, 2000);

    } catch (err: any) {
      setStep('IDLE');
      setErrorMessage(err.message || 'An error occurred during report processing.');
    }
  };

  // When patient inputs transcript manually after OCR failure
  const handleSaveManualTranscript = async () => {
    if (!currentReportId) return;
    if (!extractedText.trim()) {
      setErrorMessage('Please type or paste the text of your report.');
      return;
    }

    setStep('ANALYZING');
    setErrorMessage('');

    try {
      // 1. Update report transcript in DB
      const saveRes = await fetch(`/api/reports/${currentReportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportTranscript: extractedText, status: 'PROCESSING' }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save manual transcript.');
      }

      // 2. Run analysis
      const analyzeRes = await fetch(`/api/reports/${currentReportId}/analyze`, {
        method: 'POST',
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'AI Routing analysis failed.');
      }

      setStep('SUCCESS');
      setTimeout(() => {
        router.push(`/patient/reports/${currentReportId}`);
      }, 2000);

    } catch (err: any) {
      setStep('EXTRACTION_FAILED');
      setErrorMessage(err.message || 'An error occurred saving and analyzing the report.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-center">
      {/* Wizard Screens */}
      {step === 'IDLE' && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Medical Report</h1>
            <p className="text-slate-400 text-sm mt-1">
              Submit your medical chart, prescription, or scan to get assigned to the correct clinical specialist.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3.5 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Patient Profile Fields */}
              <div className="border-b border-slate-800/80 pb-5">
                <h3 className="text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider">Patient Profile Verification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">
                      Patient Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-slate-400 mb-1">
                      Contact Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      placeholder="123-456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-xs font-medium text-slate-400 mb-1">
                      Age
                    </label>
                    <input
                      id="age"
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      placeholder="34"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-xs font-medium text-slate-400 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-teal-500 focus:outline-none h-[38px]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Symptoms Input */}
              <div>
                <label htmlFor="symptoms" className="block text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">
                  Describe Symptoms
                </label>
                <textarea
                  id="symptoms"
                  required
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none text-sm transition-colors"
                  placeholder="Tell us what you are feeling (e.g. chest pain, skin rash, headache, fever...)"
                />
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">
                  Medical Report File (Optional)
                </label>
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      dragging
                        ? 'border-teal-500 bg-teal-500/5'
                        : 'border-slate-700 hover:border-slate-650 bg-slate-950/40 hover:bg-slate-950/60'
                    }`}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <Upload className="h-10 w-10 text-slate-500 mb-3" />
                    <p className="text-sm font-semibold text-white">Drag & drop report here</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, or PDF (max 10MB)</p>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-8 w-8 text-teal-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 py-3 text-sm font-bold shadow transition-all cursor-pointer"
              >
                <span>Submit and Route Report</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Progress Overlays */}
      {step === 'UPLOADING' && (
        <div className="text-center py-16 space-y-6">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Uploading Report</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Saving your files and clinical details securely to the health server...
          </p>
        </div>
      )}

      {step === 'EXTRACTING' && (
        <div className="text-center py-16 space-y-6">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Extracting Medical Text</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Processing file layout and running local OCR text extraction engine...
          </p>
        </div>
      )}

      {step === 'ANALYZING' && (
        <div className="text-center py-16 space-y-6">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Analyzing & Routing Case</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Running clinical categorization model to find the most suitable medical specialist...
          </p>
        </div>
      )}

      {/* Extraction Failed -> Manual Input Form */}
      {step === 'EXTRACTION_FAILED' && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <AlertCircle className="h-7 w-7 text-yellow-500" />
              <span>Provide Transcript manually</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              We couldn&apos;t automatically extract readable text from your file. Please verify and manually input the report content below to trigger assignment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            <div className="space-y-6">
              {errorMessage && (
                <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3.5 text-sm text-red-400">
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="manual-transcript" className="block text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">
                  Report Transcript / Text
                </label>
                <textarea
                  id="manual-transcript"
                  required
                  rows={10}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-slate-100 placeholder-slate-500 shadow-sm focus:border-teal-500 focus:outline-none text-sm font-mono"
                  placeholder="Paste or type clinical findings, blood pressure, lab values, symptoms, doctor's notes..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('IDLE')}
                  className="flex-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 py-3 text-sm font-bold shadow transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualTranscript}
                  className="flex-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 py-3 text-sm font-bold shadow transition-all cursor-pointer text-center"
                >
                  Analyze & Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Screen */}
      {step === 'SUCCESS' && (
        <div className="text-center py-16 space-y-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce mx-auto" />
          <h2 className="text-2xl font-bold text-white">Triage Assignment Complete</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Report has been categorized. Redirecting you to your specialist route information details page...
          </p>
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
