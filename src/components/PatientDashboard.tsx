import React, { useEffect, useState } from 'react';
import { User, Visit, Patient } from '../types';
import { Activity, Clock, FileText, Activity as ActivityIcon, Thermometer, Droplets, Weight, User as UserIcon, Ambulance } from 'lucide-react';
import { getRiskColor } from '../utils/riskColors';

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.patientId) {
        fetchData(parsedUser.patientId);
      }
    }
  }, []);

  const fetchData = async (patientId: string) => {
    try {
      const [patientRes, visitsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`),
        fetch(`/api/visits/patient/${patientId}`)
      ]);
      
      if (patientRes.ok) setPatient(await patientRes.json());
      if (visitsRes.ok) setVisits(await visitsRes.json());
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Activity className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Patient Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Welcome back, {patient?.name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm text-slate-500 dark:text-slate-400">Patient ID:</span>
            <span className="ml-2 font-mono font-semibold text-purple-600 dark:text-purple-400">{patient?.patientId}</span>
          </div>
          <p className="text-xs italic text-slate-500 dark:text-slate-400 max-w-[250px] text-right">
            "Health is a state of complete harmony of the body, mind and spirit."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-500" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="text-slate-500 dark:text-slate-400">Age</span>
              <span className="font-medium text-slate-900 dark:text-white">{patient?.age} years</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="text-slate-500 dark:text-slate-400">Gender</span>
              <span className="font-medium text-slate-900 dark:text-white">{patient?.gender}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="text-slate-500 dark:text-slate-400">Phone</span>
              <span className="font-medium text-slate-900 dark:text-white">{patient?.phone}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Ambulance className="w-4 h-4 text-red-500" /> Emergency Contact</span>
              <span className="font-medium text-slate-900 dark:text-white">{patient?.emergencyContact}</span>
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Visit History
          </h3>
          
          {visits.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No previous visits found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.visitId} className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {new Date(visit.date).toLocaleDateString()}
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {visit.visitId}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Status: <span className="font-medium text-slate-700 dark:text-slate-300">{visit.status}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(visit.riskLevel)}`}>
                      {visit.riskLevel}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-rose-500" />
                      <span className="text-slate-700 dark:text-slate-300">{visit.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ActivityIcon className="w-4 h-4 text-red-500" />
                      <span className="text-slate-700 dark:text-slate-300">{visit.bp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-700 dark:text-slate-300">{visit.spo2}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300">{visit.weight} kg</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Symptoms:</span> {visit.symptoms}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
