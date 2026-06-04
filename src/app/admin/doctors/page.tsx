'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Stethoscope, Plus, Save, Power, UserCheck, AlertCircle, Trash2, Check, X } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  category: string;
  specialization: string;
  experience: number;
  available: boolean;
  status: string;
  user: {
    email: string;
  };
}

export default function AdminDoctorsManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Doctor Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    name: '',
    category: 'General Physician',
    specialization: '',
    experience: '',
  });

  // Edit Doctor Inline State
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    specialization: '',
    experience: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors);
      }
    } catch (e) {
      console.error('Failed to load doctors list:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create doctor profile.');
      }

      setSuccessMessage('Doctor profile created successfully.');
      setShowAddForm(false);
      setAddForm({
        email: '',
        password: '',
        name: '',
        category: 'General Physician',
        specialization: '',
        experience: '',
      });
      await fetchDoctors();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    }
  };

  const handleToggleAvailable = async (id: string, currentVal: boolean) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentVal }),
      });

      if (!res.ok) {
        throw new Error('Failed to update availability.');
      }

      // Update state local
      setDoctors(doctors.map(doc => doc.id === id ? { ...doc, available: !currentVal } : doc));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update availability.');
    }
  };

  const handleToggleStatus = async (id: string, currentVal: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    const newVal = currentVal === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newVal }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status.');
      }

      // Update state local
      setDoctors(doctors.map(doc => doc.id === id ? { ...doc, status: newVal } : doc));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status.');
    }
  };

  const startEdit = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setEditForm({
      name: doc.name,
      category: doc.category,
      specialization: doc.specialization,
      experience: doc.experience.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingDoctorId(null);
  };

  const handleEditSubmit = async (id: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }

      setSuccessMessage('Doctor details updated.');
      setEditingDoctorId(null);
      await fetchDoctors();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save changes.');
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-purple-400" />
              <span>Staff Doctors Directory</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage clinical classifications, shift status, and experience listings.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-650 hover:bg-purple-550 text-white px-4 py-2.5 text-sm font-bold shadow cursor-pointer w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Add Doctor</span>
          </button>
        </div>

        {/* Messaging Panels */}
        {errorMessage && (
          <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4 mb-6 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/20 p-4 mb-6 text-sm text-emerald-400 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add Doctor Form Card */}
        {showAddForm && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 mb-8 backdrop-blur-sm shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Register New Specialist Profile</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="add-name" className="block text-xs font-semibold text-slate-400 mb-1">Doctor Name</label>
                  <input
                    id="add-name"
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="Dr. Sarah Jenkins"
                  />
                </div>
                <div>
                  <label htmlFor="add-email" className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                  <input
                    id="add-email"
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="jenkins@healthcare.com"
                  />
                </div>
                <div>
                  <label htmlFor="add-password" className="block text-xs font-semibold text-slate-400 mb-1">Temporary Password</label>
                  <input
                    id="add-password"
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="add-category" className="block text-xs font-semibold text-slate-400 mb-1">Triage Category</label>
                  <select
                    id="add-category"
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none h-[38px] cursor-pointer"
                  >
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
                <div>
                  <label htmlFor="add-spec" className="block text-xs font-semibold text-slate-400 mb-1">Sub-Specialization</label>
                  <input
                    id="add-spec"
                    type="text"
                    required
                    value={addForm.specialization}
                    onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="Cardiovascular Diseases"
                  />
                </div>
                <div>
                  <label htmlFor="add-exp" className="block text-xs font-semibold text-slate-400 mb-1">Experience (Years)</label>
                  <input
                    id="add-exp"
                    type="number"
                    required
                    min="0"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-sm font-bold shadow cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-slate-800 rounded-xl bg-slate-900/10">
            <span className="text-slate-500 text-sm">Fetching doctors database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className={`rounded-xl border p-5 backdrop-blur-sm relative overflow-hidden transition-all ${
                  doc.status === 'INACTIVE' 
                    ? 'border-slate-900 bg-slate-950/20 opacity-50' 
                    : 'border-slate-800 bg-slate-900/25 hover:border-slate-700'
                }`}
              >
                {/* Editing Inline Form */}
                {editingDoctorId === doc.id ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-1.5">Edit Doctor Profile</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="block w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="block w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 text-xs focus:outline-none h-[28px] cursor-pointer"
                        >
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
                      <div>
                        <label className="block text-slate-400 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={editForm.specialization}
                          onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                          className="block w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          value={editForm.experience}
                          onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                          className="block w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={cancelEdit}
                        className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(doc.id)}
                        className="p-1 px-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal View Card
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">{doc.name}</h4>
                          <span className="text-slate-400 text-xs mt-1 block">{doc.user.email}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${
                          doc.available 
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/25' 
                            : 'bg-red-500/10 text-red-400 border-red-500/25'
                        }`}>
                          {doc.available ? 'AVAILABLE' : 'SHIFT OFF'}
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-4 text-xs">
                        <div>
                          <span className="text-slate-500 block uppercase text-[10px]">Triage Route Category</span>
                          <span className="text-slate-200 font-semibold">{doc.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[10px]">Specialization</span>
                          <span className="text-slate-200">{doc.specialization}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[10px]">Experience</span>
                          <span className="text-slate-200">{doc.experience} Years</span>
                        </div>
                      </div>
                    </div>

                    {/* Action toggles */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => startEdit(doc)}
                        className="text-slate-450 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>

                      <div className="flex items-center gap-3">
                        {/* Toggle shift availability */}
                        <button
                          onClick={() => handleToggleAvailable(doc.id, doc.available)}
                          className={`flex items-center gap-0.5 font-semibold transition-colors cursor-pointer ${
                            doc.available ? 'text-red-400 hover:text-red-300' : 'text-teal-400 hover:text-teal-300'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          <span>{doc.available ? 'End Shift' : 'Start Shift'}</span>
                        </button>

                        {/* Toggle status active/inactive */}
                        <button
                          onClick={() => handleToggleStatus(doc.id, doc.status)}
                          className={`flex items-center gap-0.5 font-semibold transition-colors cursor-pointer ${
                            doc.status === 'ACTIVE' ? 'text-amber-500 hover:text-amber-400' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <span>{doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
