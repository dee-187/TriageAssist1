import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, Moon, Sun } from 'lucide-react';
import { User } from '../types';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navLinks = () => {
    if (!user) return null;
    
    if (user.role === 'Patient') {
      return (
        <button onClick={() => navigate('/patient')} className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Patient Dashboard
        </button>
      );
    }
    
    if (user.role === 'Staff') {
      return (
        <>
          <button onClick={() => navigate('/intake')} className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Patient Intake
          </button>
          <button onClick={() => navigate('/staff')} className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Staff Dashboard
          </button>
        </>
      );
    }
    
    if (user.role === 'Doctor') {
      return (
        <button onClick={() => navigate('/doctor')} className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Doctor Dashboard
        </button>
      );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Gradient Blur Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <header className="relative z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(user ? `/${user.role.toLowerCase()}` : '/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 tracking-tight">
              TriageAssist
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-xl border border-white/20 dark:border-slate-600/50">
              {navLinks()}
            </nav>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-sm font-medium transition-all border border-white/20 dark:border-slate-600/50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
