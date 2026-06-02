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
      await registerViaBackend(email, password, name, role);
      await signIn(email, password);
      setSuccess('Account created! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px' }}>
      <div className="sk-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-out)' }}>
            <Icon name="sprout" />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-dark)' }}>AgroMind AI</span>
        </div>

        <div>
          <h2 style={{ margin: '0 0 4px', color: 'var(--primary-dark)' }}>Create Account</h2>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Join the Precision Agronomy platform</p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="x" style={{ width: '16px', height: '16px' }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="check-circle" style={{ width: '16px', height: '16px' }} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px 16px', border: 'none', outline: 'none' }}
            />
          </div>

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
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Register As</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px 16px', border: 'none', outline: 'none' }}
            >
              <option value="farmer">Farmer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="sk-card"
              style={{ background: 'var(--bg-color)', boxShadow: 'var(--shadow-in)', padding: '12px 16px', border: 'none', outline: 'none' }}
            />
          </div>

          <button type="submit" disabled={loading} className="sk-button-primary sk-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontSize: '12px', textAlign: 'center', margin: 0, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
