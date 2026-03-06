import React, { useEffect, useState } from 'react';
import { Visit, Doctor } from '../types';
import { Activity, Search, AlertTriangle, User, Clock, Stethoscope } from 'lucide-react';
import { getRiskColor } from '../utils/riskColors';

export default function StaffDashboard() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, doctorsRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/doctors')
      ]);
      if (visitsRes.ok) setVisits(await visitsRes.json());
      if (doctorsRes.ok) setDoctors(await doctorsRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleAssignDoctor = async (visitId: string, doctorId: string) => {
    try {
      await fetch(`/api/visits/${visitId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });
      fetchData();
    } catch (error) {
      console.error('Error assigning doctor:', error);
    }
  };

  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || v.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'All' || v.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Calculate risk percentages
  const totalVisits = visits.length || 1;
  const highRiskCount = visits.filter(v => v.riskLevel === 'Critical Risk' || v.riskLevel === 'High Risk').length;
  const moderateRiskCount = visits.filter(v => v.riskLevel === 'Moderate Risk').length;
  const lowRiskCount = visits.filter(v => v.riskLevel === 'Low Risk' || v.riskLevel === 'Minimal Risk').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Staff Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Monitor triage queue and doctor availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Analytics Panel */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Risk Analytics
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-red-600 dark:text-red-400">High Risk</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((highRiskCount / totalVisits) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(highRiskCount / totalVisits) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-orange-600 dark:text-orange-400">Moderate Risk</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((moderateRiskCount / totalVisits) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(moderateRiskCount / totalVisits) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Low Risk</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((lowRiskCount / totalVisits) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(lowRiskCount / totalVisits) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Occupancy */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-500" />
            Doctor Occupancy
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {doctors.map(doctor => (
              <div key={doctor.doctorId} className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${doctor.status === 'Free' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{doctor.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.specialization}</p>
                  <p className={`text-xs font-medium mt-1 ${doctor.status === 'Free' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {doctor.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Patient Queue
          </h3>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white"
              />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white"
            >
              <option value="All">All Risks</option>
              <option value="Critical Risk">Critical Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Minimal Risk">Minimal Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symptoms</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Doctor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVisits.map((visit) => (
                <tr key={visit.visitId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{visit.patientName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span>ID: {visit.patientId}</span>
                      <span>•</span>
                      <span>{visit.patientAge}y</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate" title={visit.symptoms}>
                      {visit.symptoms}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getRiskColor(visit.riskLevel)}`}>
                      {(visit.riskLevel === 'High Risk' || visit.riskLevel === 'Critical Risk') && <AlertTriangle className="w-3 h-3" />}
                      {visit.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {visit.doctorId ? (
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{visit.doctorName}</div>
                    ) : (
                      <select
                        onChange={(e) => handleAssignDoctor(visit.visitId, e.target.value)}
                        className="px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Doctor</option>
                        {doctors.filter(d => d.status === 'Free').map(d => (
                          <option key={d.doctorId} value={d.doctorId}>{d.name} ({d.specialization})</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No patients found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
