import Link from 'next/link';
import { ShieldAlert, UserCheck, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.08),transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Header Branding */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-semibold mb-6 animate-pulse">
          <HeartPulse className="h-4 w-4" />
          <span>Intelligent Clinical Routing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent mb-4">
          CareRoute AI
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
          An automated, safe, and efficient doctor routing workflow. Upload clinical transcripts, run OCR analysis, and auto-assign specialized medical attention instantly.
        </p>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          {/* Patient Card */}
          <Link
            href="/login"
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Patient Portal</h3>
              <p className="text-slate-400 text-sm">
                Register, log in, submit medical reports (PDF/images), track your transcription results, and check assigned specialist status.
              </p>
            </div>
            <div className="mt-6 flex items-center text-teal-400 font-medium text-sm gap-1 group-hover:translate-x-1 transition-transform">
              <span>Patient Login</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Doctor Card */}
          <Link
            href="/doctor/login"
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Doctor Panel</h3>
              <p className="text-slate-400 text-sm">
                Access your custom workspace, examine assigned patient cases, view AI routing confidence scores, and mark dossiers as reviewed.
              </p>
            </div>
            <div className="mt-6 flex items-center text-blue-400 font-medium text-sm gap-1 group-hover:translate-x-1 transition-transform">
              <span>Doctor Login</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin/login"
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
              <p className="text-slate-400 text-sm">
                Manage doctor schedules, manually override assignments, audit AI analysis logs, and control clinical routing operations.
              </p>
            </div>
            <div className="mt-6 flex items-center text-purple-400 font-medium text-sm gap-1 group-hover:translate-x-1 transition-transform">
              <span>Admin Console</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-16 text-slate-500 text-xs max-w-md mx-auto border-t border-slate-900 pt-6">
          <p className="mb-1 font-semibold text-slate-400">⚠️ Medical Routing Disclaimer</p>
          <p>
            This AI-assisted tool performs classification and routing. It does not provide medical diagnosis, drug recommendations, or treatment proposals.
          </p>
        </div>
      </div>
    </div>
  );
}
