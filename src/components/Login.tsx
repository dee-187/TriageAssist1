import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Staff',
    hospital: 'City General Hospital',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'Patient') {
          navigate('/patient');
        } else if (data.user.role === 'Staff') {
          navigate('/staff');
        } else if (data.user.role === 'Doctor') {
          navigate('/doctor');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 mb-4 tracking-tight">
          AI-Powered Hospital Triage System
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Prioritize patients faster using intelligent triage support.
        </p>
      </div>

      <div className="w-full max-w-md bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hospital</label>
            <select
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
            >
              <option value="City General Hospital">City General Hospital</option>
              <option value="Apollo Hospital">Apollo Hospital</option>
              <option value="Fortis Hospital">Fortis Hospital</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
            >
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
              Remember me
            </label>
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>

          <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Demo Credentials:</p>
            <ul className="space-y-1">
              <li><span className="font-medium">Staff:</span> username: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">staff</code>, password: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">password</code></li>
              <li><span className="font-medium">Doctor:</span> username: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">drsharma</code> (Cardiology), <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">drsmith</code> (General), <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">drlee</code> (Gynecology), password: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">password</code></li>
              <li><span className="font-medium">Patient:</span> username: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">patient1</code>, password: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">password</code></li>
            </ul>
            <p className="mt-2 text-xs italic">Make sure to select the correct Role from the dropdown above!</p>
          </div>
        </form>
      </div>
    </div>
  );
}
