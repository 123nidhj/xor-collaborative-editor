import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Terminal, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to auto-login or register demo accounts
  const handleQuickLogin = async (demoName, demoEmail, demoPass) => {
    setError('');
    setLoading(true);
    try {
      try {
        await login(demoEmail, demoPass);
      } catch {
        // Auto-register demo account if not exists
        await register(demoName, demoEmail, demoPass);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(`Quick login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col bg-tech-grid relative">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        {/* Ambient Glow */}
        <div className="absolute w-[450px] h-[300px] bg-brand-cyan/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 items-center justify-center text-brand-cyan mb-3">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-zinc-400 mt-1">Sign in to your collaborative workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group inline-flex items-center justify-center p-[1px] rounded-xl overflow-hidden text-xs font-semibold shadow-glow-cyan transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-indigo rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black/90 text-white font-medium group-hover:bg-black/75 transition-colors">
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-brand-cyan" />
              </span>
            </button>
          </form>

          {/* Quick Demo Logins for Pair Testing */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-[11px] font-mono text-zinc-500 text-center mb-2.5">
              1-Click Demo Accounts (Test Real-time Multi-user)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Alice', 'alice@demo.io', 'demo1234')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 border border-white/10 hover:border-brand-cyan/40 text-xs text-zinc-300 hover:text-white transition-all font-mono"
              >
                <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                Alice (Demo)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Bob', 'bob@demo.io', 'demo1234')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 border border-white/10 hover:border-brand-indigo/40 text-xs text-zinc-300 hover:text-white transition-all font-mono"
              >
                <span className="w-2 h-2 rounded-full bg-brand-indigo" />
                Bob (Demo)
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-cyan hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
