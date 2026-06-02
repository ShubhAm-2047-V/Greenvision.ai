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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px' }}>
      <div className="sk-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: 'var(--primary-dark)' }}>Welcome Back</h2>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Sign in to monitor your farm records</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px 16px', border: 'none', outline: 'none' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Password</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px 16px', border: 'none', outline: 'none' }} 
            />
          </div>
          <button type="submit" disabled={loading} className="sk-button-primary sk-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p style={{ fontSize: '12px', textAlign: 'center', margin: 0, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
