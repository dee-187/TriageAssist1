/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

export default function PatientIntake() {
  const [isReturning, setIsReturning] = useState(false);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    emergencyContact: '',
    temperature: '',
    bp: '',
    spo2: '',
    weight: '',
    symptoms: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => setPatientsList(data))
      .catch(err => console.error('Failed to fetch patients', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    if (!pId) {
      setFormData({ ...formData, patientId: '', name: '', age: '', gender: 'Male', phone: '', emergencyContact: '' });
      return;
    }
    const p = patientsList.find(x => x.patientId === pId);
    if (p) {
      setFormData({
        ...formData,
        patientId: p.patientId,
        name: p.name,
        age: p.age.toString(),
        gender: p.gender,
        phone: p.phone,
        emergencyContact: p.emergencyContact
      });
    }
  };

  const analyzeSymptoms = async (patientData: any) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an advanced medical triage assistant system. Your task is to analyze the following patient information and reported symptoms to assist healthcare staff with early triage prioritization.
      
      IMPORTANT DISCLAIMER: You are a decision-support tool. You do not replace professional medical judgment or provide medical diagnoses.
      
      Patient Information:
      Age: ${patientData.age}
      Gender: ${patientData.gender}
      Temperature: ${patientData.temperature} °C
      Blood Pressure: ${patientData.bp}
      SpO2: ${patientData.spo2}%
      Weight: ${patientData.weight} kg
      Reported Symptoms: ${patientData.symptoms}
      
      Analyze the symptoms and vital signs in detail. Consider specific symptom characteristics (onset, severity, radiation, associated symptoms) and vital sign deviations from normal ranges for the patient's age.
      
      Provide:
      1. A Risk Percentage (0-100) based on severity.
      2. A Risk Level: 'Critical Risk', 'High Risk', 'Moderate Risk', 'Low Risk', or 'Minimal Risk'.
      3. A Priority Level based on the Emergency Severity Index (ESI): 'Level 1 (Resuscitation)', 'Level 2 (Emergent)', 'Level 3 (Urgent)', 'Level 4 (Less Urgent)', or 'Level 5 (Non-Urgent)'.
      4. A clear, concise summary of the patient-reported information and key clinical concerns.
      5. A recommended action for the intake staff, including which specialty might be most appropriate (e.g., General Practice, Cardiology, Gynecology, Pediatrics, Orthopedics, Dermatology, etc.).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "Risk Percentage (0-100)" },
            riskLevel: { type: Type.STRING, description: "'Critical Risk', 'High Risk', 'Moderate Risk', 'Low Risk', or 'Minimal Risk'" },
            priorityLevel: { type: Type.STRING, description: "'Level 1 (Resuscitation)', 'Level 2 (Emergent)', 'Level 3 (Urgent)', 'Level 4 (Less Urgent)', or 'Level 5 (Non-Urgent)'" },
            aiSummary: { type: Type.STRING, description: "Clear, concise summary" },
            aiRecommendedAction: { type: Type.STRING, description: "Recommended action and specialty" },
          },
          required: ["riskScore", "riskLevel", "priorityLevel", "aiSummary", "aiRecommendedAction"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    return JSON.parse(resultText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      // 1. Call Gemini API from frontend
      const aiResult = await analyzeSymptoms({
        age: formData.age,
        gender: formData.gender,
        temperature: formData.temperature,
        bp: formData.bp,
        spo2: formData.spo2,
        weight: formData.weight,
        symptoms: formData.symptoms,
      });

      // 2. Send data and AI result to backend
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age, 10),
          temperature: parseFloat(formData.temperature),
          spo2: parseFloat(formData.spo2),
          weight: parseFloat(formData.weight),
          aiResult,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData(data);
        setFormData({
          patientId: '', name: '', age: '', gender: 'Male', phone: '', emergencyContact: '',
          temperature: '', bp: '', spo2: '', weight: '', symptoms: '',
        });
        setIsReturning(false);
      } else {
        setError(data.message || 'Triage failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during triage analysis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/30 dark:to-blue-900/30 border-b border-white/20 dark:border-slate-700/50 px-8 py-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Patient Intake</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Enter patient details and vital signs for AI-assisted triage.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {successData && (
          <div className="bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-6 py-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <CheckCircle2 className="w-6 h-6 mt-0.5 flex-shrink-0 text-emerald-500" />
            <div>
              <h3 className="font-bold text-lg mb-1">Patient intake submitted successfully!</h3>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div><span className="font-semibold">Patient ID:</span> <span className="font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{successData.patientId}</span></div>
                <div><span className="font-semibold">Visit ID:</span> <span className="font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{successData.visitId}</span></div>
                <div><span className="font-semibold">Risk Level:</span> <span className="font-bold">{successData.riskLevel}</span></div>
                <div><span className="font-semibold">Priority:</span> <span className="font-bold">{successData.priorityLevel}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={!isReturning} onChange={() => setIsReturning(false)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Patient</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={isReturning} onChange={() => setIsReturning(true)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Returning Patient</span>
          </label>
        </div>

        {isReturning && (
          <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Existing Patient</label>
            <select onChange={handlePatientSelect} value={formData.patientId} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white">
              <option value="">-- Select a patient --</option>
              {patientsList.map(p => (
                <option key={p.patientId} value={p.patientId}>{p.name} ({p.patientId})</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} disabled={isReturning && !!formData.patientId} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white disabled:opacity-60" placeholder="e.g., Jane Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input type="number" name="age" required min="0" max="120" value={formData.age} onChange={handleChange} disabled={isReturning && !!formData.patientId} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white disabled:opacity-60" placeholder="Years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} disabled={isReturning && !!formData.patientId} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white disabled:opacity-60">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} disabled={isReturning && !!formData.patientId} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white disabled:opacity-60" placeholder="e.g., 555-0123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                  <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} disabled={isReturning && !!formData.patientId} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white disabled:opacity-60" placeholder="e.g., 555-0999" />
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Vital Signs</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" required value={formData.temperature} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" placeholder="37.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Pressure</label>
                <input type="text" name="bp" required value={formData.bp} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" placeholder="120/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SpO2 (%)</label>
                <input type="number" name="spo2" required min="0" max="100" value={formData.spo2} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" placeholder="98" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" placeholder="70.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-2 mt-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reported Symptoms</label>
          <textarea
            name="symptoms"
            required
            rows={5}
            value={formData.symptoms}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none dark:text-white"
            placeholder="Describe symptoms, duration, severity, and other details..."
          />
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-semibold mb-1">Disclaimer</p>
            <p>This system functions as a decision-support tool and does not replace professional medical judgment or provide medical diagnoses. Always rely on clinical expertise for final triage decisions.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              'Submit for Triage'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
