'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { registerViaBackend } from '../../services/api';
import Icon from '../../components/Icon';

const RegisterPage = () => {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Register via backend (auto-confirms email — no verification needed)
      await registerViaBackend(email, password, name, role);

      // Step 2: Immediately sign in (works because email is pre-confirmed)
      await signIn(email, password);

      setSuccess('Account created! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] text-left">
      <div className="glass w-full max-w-md p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Icon name="sprout" className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white">Agrovision AI</span>
        </div>

        <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">Create Account</h2>
        <p className="text-xs text-slate-400 mb-6">Join the Precision Agronomy platform — no email verification required</p>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl mb-4 flex items-center gap-2">
            <Icon name="x" className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl mb-4 flex items-center gap-2">
            <Icon name="check-circle" className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Vernekar"
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Register As</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="farmer">Farmer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl border-0 cursor-pointer transition-all mt-2 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Icon name="user" className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-center mt-6 text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
