export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskLevel = 'High Risk' | 'Moderate Risk' | 'Low Risk';

export interface User {
  id: number;
  username: string;
  role: 'Patient' | 'Staff' | 'Doctor';
  hospital: string;
  patientId?: string;
  doctorId?: string;
}

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  emergencyContact: string;
  createdAt: string;
}

export interface Doctor {
  doctorId: string;
  name: string;
  specialization: string;
  status: 'Free' | 'Busy';
}

export interface Visit {
  visitId: string;
  patientId: string;
  doctorId?: string;
  date: string;
  temperature: number;
  bp: string;
  spo2: number;
  weight: number;
  symptoms: string;
  riskScore: number;
  riskLevel: RiskLevel;
  priorityLevel: UrgencyLevel;
  aiSummary: string;
  aiRecommendedAction: string;
  status: string;
  
  // Joined fields
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  phone?: string;
  emergencyContact?: string;
  doctorName?: string;
}
