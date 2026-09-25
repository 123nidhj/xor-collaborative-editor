import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Terminal, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col bg-tech-grid relative">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        {/* Ambient Glow */}
        <div className="absolute w-[450px] h-[300px] bg-brand-indigo/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 items-center justify-center text-brand-indigo mb-3">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create Workspace Account</h2>
            <p className="text-xs text-zinc-400 mt-1">Start collaborating with real-time sync</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="ada@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/50"
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
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group inline-flex items-center justify-center p-[1px] rounded-xl overflow-hidden text-xs font-semibold shadow-glow-indigo transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black/90 text-white font-medium group-hover:bg-black/75 transition-colors">
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-brand-indigo" />
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
