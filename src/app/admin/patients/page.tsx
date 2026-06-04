'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, User, ShieldAlert } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  reportCount: number;
}

export default function AdminPatientsLedger() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientsData();
  }, []);

  const fetchPatientsData = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        
        // Extract unique patients
        const patientMap: Record<string, Patient> = {};
        data.reports.forEach((report: any) => {
          const p = report.patient;
          if (p) {
            if (!patientMap[p.id]) {
              patientMap[p.id] = {
                id: p.id,
                name: p.name,
                age: p.age,
                gender: p.gender,
                phone: p.phone,
                email: report.patient.user?.email || 'N/A', // fallback if not populated
                reportCount: 0,
              };
            }
            patientMap[p.id].reportCount += 1;
          }
        });

        setPatients(Object.values(patientMap));
      }
    } catch (e) {
      console.error('Failed to load patients ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-1 flex flex-col justify-between">
      <div>
        {/* Back Link */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-400" />
            <span>Patients Ledger</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registered patient records, contact particulars, and submission counts.
          </p>
        </div>

        {/* Patients Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-slate-800 rounded-xl bg-slate-900/10">
            <span className="text-slate-500 text-sm">Loading ledger...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 text-center p-6">
            <ShieldAlert className="h-12 w-12 text-slate-650 mb-2" />
            <p className="text-slate-400 font-semibold">No patients found</p>
            <p className="text-xs text-slate-500 mt-1">There are no patient records currently registered in the database.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900/25">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-300 font-medium">
                  <tr>
                    <th scope="col" className="px-6 py-4">Patient Name</th>
                    <th scope="col" className="px-6 py-4">Age</th>
                    <th scope="col" className="px-6 py-4">Gender</th>
                    <th scope="col" className="px-6 py-4">Contact Phone</th>
                    <th scope="col" className="px-6 py-4 text-center">Submitted Dossiers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-805 text-slate-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{patient.name}</span>
                      </td>
                      <td className="px-6 py-4">{patient.age} years</td>
                      <td className="px-6 py-4">{patient.gender}</td>
                      <td className="px-6 py-4">{patient.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {patient.reportCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
