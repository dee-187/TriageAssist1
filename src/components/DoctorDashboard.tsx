import React, { useEffect, useState } from 'react';
import { Visit, Doctor, User } from '../types';
import { Activity, Clock, FileText, User as UserIcon, Thermometer, Droplets, Weight, AlertTriangle, Stethoscope } from 'lucide-react';
import { getRiskColor } from '../utils/riskColors';

export default function DoctorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [patientHistory, setPatientHistory] = useState<Visit[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.doctorId) {
        fetchDoctorData(parsedUser.doctorId);
        const interval = setInterval(() => fetchDoctorData(parsedUser.doctorId), 5000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const fetchDoctorData = async (doctorId: string) => {
    try {
      const [doctorRes, visitsRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/visits')
      ]);
      
      if (doctorRes.ok) {
        const doctors = await doctorRes.json();
        const me = doctors.find((d: Doctor) => d.doctorId === doctorId);
        if (me) setDoctor(me);
      }
      
      if (visitsRes.ok) {
        const allVisits = await visitsRes.json();
        const myVisits = allVisits.filter((v: Visit) => v.doctorId === doctorId);
        setVisits(myVisits);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const fetchPatientHistory = async (patientId: string) => {
    try {
      const res = await fetch(`/api/visits/patient/${patientId}`);
      if (res.ok) {
        setPatientHistory(await res.json());
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
    }
  };

  const handleSelectVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    fetchPatientHistory(visit.patientId);
  };

  const toggleStatus = async () => {
    if (!doctor) return;
    const newStatus = doctor.status === 'Free' ? 'Busy' : 'Free';
    try {
      await fetch(`/api/doctors/${doctor.doctorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setDoctor({ ...doctor, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Doctor Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Welcome, {doctor?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
          <button
            onClick={toggleStatus}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              doctor?.status === 'Free' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                doctor?.status === 'Free' ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`font-bold ${doctor?.status === 'Free' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {doctor?.status}
          </span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)] gap-6">
        {/* Left Column: Patient List */}
        <div className="w-1/3 flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/30 dark:to-blue-900/30 border-b border-white/20 dark:border-slate-700/50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-500" />
              My Patients
            </h3>
            <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {visits.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {visits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
                <UserIcon className="w-12 h-12 mb-3 opacity-50" />
                <p>No patients assigned to you currently.</p>
              </div>
            ) : (
              visits.map((visit) => (
                <button
                  key={visit.visitId}
                  onClick={() => handleSelectVisit(visit)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedVisit?.visitId === visit.visitId
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-sm'
                      : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-900 dark:text-white">{visit.patientName}</div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRiskColor(visit.riskLevel)}`}>
                      {visit.riskLevel}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {visit.patientAge}y, {visit.patientGender?.charAt(0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Patient Details */}
        <div className="w-2/3 flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg overflow-hidden">
          {selectedVisit ? (
            <div className="flex-1 overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/30 dark:to-blue-900/30 border-b border-white/20 dark:border-slate-700/50 px-8 py-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedVisit.patientName}</h2>
                    <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        <UserIcon className="w-4 h-4" />
                        {selectedVisit.patientAge} years old • {selectedVisit.patientGender}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Arrived at {new Date(selectedVisit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">|</span>
                      <span className="font-mono text-xs">ID: {selectedVisit.patientId}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getRiskColor(selectedVisit.riskLevel)}`}>
                    {(selectedVisit.riskLevel === 'High Risk' || selectedVisit.riskLevel === 'Critical Risk') && <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold">{selectedVisit.riskLevel}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Vitals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Thermometer className="w-6 h-6 text-rose-500 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Temp</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedVisit.temperature}°C</span>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Activity className="w-6 h-6 text-red-500 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">BP</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedVisit.bp}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Droplets className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">SpO2</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedVisit.spo2}%</span>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Weight className="w-6 h-6 text-emerald-500 mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Weight</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedVisit.weight} kg</span>
                  </div>
                </div>

                {/* AI Assessment */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    AI Triage Assessment
                  </h3>
                  <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">Clinical Summary</h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedVisit.aiSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">Recommended Action</h4>
                      <div className="bg-white/80 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-purple-100 dark:border-purple-800/50 text-purple-800 dark:text-purple-300 font-medium">
                        {selectedVisit.aiRecommendedAction}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Symptoms */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Patient Reported Symptoms
                  </h3>
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif text-lg leading-relaxed">
                      "{selectedVisit.symptoms}"
                    </p>
                  </div>
                </section>

                {/* Patient History */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Patient History
                  </h3>
                  <div className="space-y-4">
                    {patientHistory.filter(h => h.visitId !== selectedVisit.visitId).length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic">No previous visits found for this patient.</p>
                    ) : (
                      patientHistory.filter(h => h.visitId !== selectedVisit.visitId).map(history => (
                        <div key={history.visitId} className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(history.date).toLocaleDateString()}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getRiskColor(history.riskLevel)}`}>
                              {history.riskLevel}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{history.symptoms}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Patient Selected</h3>
              <p className="max-w-md">Select a patient from your list on the left to view their detailed medical information and AI triage assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
