import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import PatientIntake from './components/PatientIntake';
import StaffDashboard from './components/StaffDashboard';
import DoctorDashboard from './components/DoctorDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />
        <Route path="patient" element={<PatientDashboard />} />
        <Route path="intake" element={<PatientIntake />} />
        <Route path="staff" element={<StaffDashboard />} />
        <Route path="doctor" element={<DoctorDashboard />} />
      </Route>
    </Routes>
  );
}
