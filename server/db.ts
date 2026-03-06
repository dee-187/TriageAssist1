import Database from 'better-sqlite3';

const db = new Database('triage_assist.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    hospital TEXT NOT NULL,
    patientId TEXT UNIQUE,
    doctorId TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS patients (
    patientId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT,
    emergencyContact TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    doctorId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    status TEXT DEFAULT 'Free'
  );

  CREATE TABLE IF NOT EXISTS visits (
    visitId TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    doctorId TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    temperature REAL,
    bp TEXT,
    spo2 REAL,
    weight REAL,
    symptoms TEXT NOT NULL,
    riskScore REAL,
    riskLevel TEXT,
    priorityLevel TEXT,
    aiSummary TEXT,
    aiRecommendedAction TEXT,
    status TEXT DEFAULT 'Waiting',
    FOREIGN KEY (patientId) REFERENCES patients(patientId),
    FOREIGN KEY (doctorId) REFERENCES doctors(doctorId)
  );
`);

// Seed some initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  // Insert default users
  const insertUser = db.prepare('INSERT INTO users (username, password, role, hospital, patientId, doctorId) VALUES (?, ?, ?, ?, ?, ?)');
  const insertDoctor = db.prepare('INSERT INTO doctors (doctorId, name, specialization, status) VALUES (?, ?, ?, ?)');
  const insertPatient = db.prepare('INSERT INTO patients (patientId, name, age, gender, phone, emergencyContact) VALUES (?, ?, ?, ?, ?, ?)');

  // Staff
  insertUser.run('staff', 'password', 'Staff', 'City General Hospital', null, null);
  
  // Doctors
  insertUser.run('drsharma', 'password', 'Doctor', 'City General Hospital', null, 'DOC-001');
  insertDoctor.run('DOC-001', 'Dr. Sharma', 'Cardiology', 'Free');
  
  insertUser.run('drpatel', 'password', 'Doctor', 'City General Hospital', null, 'DOC-002');
  insertDoctor.run('DOC-002', 'Dr. Patel', 'Neurology', 'Busy');

  insertUser.run('drsmith', 'password', 'Doctor', 'City General Hospital', null, 'DOC-003');
  insertDoctor.run('DOC-003', 'Dr. Smith', 'General Practice', 'Free');

  insertUser.run('drlee', 'password', 'Doctor', 'City General Hospital', null, 'DOC-004');
  insertDoctor.run('DOC-004', 'Dr. Lee', 'Gynecology', 'Free');

  insertUser.run('drjones', 'password', 'Doctor', 'City General Hospital', null, 'DOC-005');
  insertDoctor.run('DOC-005', 'Dr. Jones', 'Pediatrics', 'Busy');

  insertUser.run('drbrown', 'password', 'Doctor', 'City General Hospital', null, 'DOC-006');
  insertDoctor.run('DOC-006', 'Dr. Brown', 'Orthopedics', 'Free');

  // Patient
  insertUser.run('patient1', 'password', 'Patient', 'City General Hospital', 'PT-000123', null);
  insertPatient.run('PT-000123', 'John Doe', 45, 'Male', '555-0100', '555-0101');

  // Visit
  const insertVisit = db.prepare(`
    INSERT INTO visits (visitId, patientId, doctorId, temperature, bp, spo2, weight, symptoms, riskScore, riskLevel, priorityLevel, aiSummary, aiRecommendedAction, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVisit.run(
    'VS-000001', 'PT-000123', 'DOC-001', 38.5, '140/90', 94, 82.5, 
    'Patient complains of severe chest pain radiating to left arm, shortness of breath, and sweating for the past 2 hours.',
    85, 'High Risk', 'Level 2 (Emergent)',
    '45yo male presenting with acute severe chest pain radiating to left arm, accompanied by dyspnea and diaphoresis. Elevated BP and temp, borderline SpO2. High suspicion for acute coronary syndrome (ACS).',
    'Immediate ECG, cardiac enzymes, and cardiology consult required. Move to resuscitation bay.',
    'Assigned'
  );
}

export default db;
