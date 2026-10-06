import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Activity, PlusCircle, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">OpsFlow <span className="text-cyan-400">Agentic AI</span></span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-full">v2.4 Swarm</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Autonomous Enterprise Operations & Multi-Agent Reasoning</p>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-md shadow-cyan-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy New Swarm</span>
            </Link>

            <div className="h-6 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user.name}</div>
                <div className="text-xs text-slate-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
