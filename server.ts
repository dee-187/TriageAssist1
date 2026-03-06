import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './server/db.js';
import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password, role, hospital } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND role = ? AND hospital = ?').get(username, password, role, hospital);
  
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Patients Routes
app.get('/api/patients', (req, res) => {
  const patients = db.prepare('SELECT * FROM patients ORDER BY createdAt DESC').all();
  res.json(patients);
});

app.get('/api/patients/:patientId', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE patientId = ?').get(req.params.patientId);
  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ message: 'Patient not found' });
  }
});

// Visits Routes
app.get('/api/visits', (req, res) => {
  const visits = db.prepare(`
    SELECT v.*, p.name as patientName, p.age as patientAge, p.gender as patientGender, p.phone, p.emergencyContact, d.name as doctorName
    FROM visits v
    JOIN patients p ON v.patientId = p.patientId
    LEFT JOIN doctors d ON v.doctorId = d.doctorId
    ORDER BY v.date DESC
  `).all();
  res.json(visits);
});

app.get('/api/visits/patient/:patientId', (req, res) => {
  const visits = db.prepare('SELECT * FROM visits WHERE patientId = ? ORDER BY date DESC').all(req.params.patientId);
  res.json(visits);
});

// Doctors Routes
app.get('/api/doctors', (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors').all();
  res.json(doctors);
});

app.put('/api/doctors/:doctorId/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE doctors SET status = ? WHERE doctorId = ?').run(status, req.params.doctorId);
  res.json({ success: true });
});

app.put('/api/visits/:visitId/assign', (req, res) => {
  const { doctorId } = req.body;
  db.prepare("UPDATE visits SET doctorId = ?, status = 'Assigned' WHERE visitId = ?").run(doctorId, req.params.visitId);
  res.json({ success: true });
});

app.post('/api/triage', async (req, res) => {
  try {
    const { name, age, gender, phone, emergencyContact, temperature, bp, spo2, weight, symptoms, patientId: existingPatientId, aiResult } = req.body;
    
    let patientId = existingPatientId;
    
    // If no patient ID provided, generate one and create patient
    if (!patientId) {
      patientId = `PT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      db.prepare('INSERT INTO patients (patientId, name, age, gender, phone, emergencyContact) VALUES (?, ?, ?, ?, ?, ?)')
        .run(patientId, name, age, gender, phone, emergencyContact);
        
      // Also create a user for them to login
      db.prepare('INSERT INTO users (username, password, role, hospital, patientId) VALUES (?, ?, ?, ?, ?)')
        .run(patientId.toLowerCase(), 'password', 'Patient', 'City General Hospital', patientId);
    }
    
    const visitId = `VS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    db.prepare(`
      INSERT INTO visits (visitId, patientId, temperature, bp, spo2, weight, symptoms, riskScore, riskLevel, priorityLevel, aiSummary, aiRecommendedAction)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(visitId, patientId, temperature, bp, spo2, weight, symptoms, aiResult.riskScore, aiResult.riskLevel, aiResult.priorityLevel, aiResult.aiSummary, aiResult.aiRecommendedAction);

    res.json({ success: true, patientId, visitId, ...aiResult });
  } catch (error: any) {
    console.error('Triage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
