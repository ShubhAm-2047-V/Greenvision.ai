'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

const LoginPage = () => {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] text-left">
      <div className="glass w-full max-w-md p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Welcome Back</h2>
        <p className="text-xs text-slate-400 mb-6">Sign in to monitor your farm records</p>
        
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg border-0 cursor-pointer transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Icon name="refresh-cw" className="w-4 h-4 animate-spin" />} Sign In
          </button>
        </form>
        <p className="text-xs text-center mt-6 text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
