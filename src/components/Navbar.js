'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import Icon from './Icon';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { locale, setLocale, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: 'activity' },
    { href: '/predict', label: t('predict'), icon: 'sprout' },
    { href: '/disease', label: t('disease'), icon: 'camera' },
    { href: '/advisor', label: t('advisor'), icon: 'message-square' }
  ];

  return (
    <nav className="sk-nav">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '20px' }}>
        <Icon name="sprout" style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
        <span>{t('brand')}</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ display: 'flex', gap: '16px' }} className="desktop-only">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                style={{ textDecoration: 'none', fontWeight: 600, color: pathname === link.href ? 'var(--primary-dark)' : 'var(--text-muted)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="sk-button"
            style={{ padding: '8px 12px', fontSize: '14px' }}
          >
            <Icon name="globe" style={{ width: '16px', height: '16px' }} />
            <span style={{ textTransform: 'uppercase' }}>{locale}</span>
          </button>
          {langOpen && (
            <div className="sk-card" style={{ position: 'absolute', right: 0, top: '45px', width: '120px', padding: '8px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setLocale('en'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>English</button>
              <button onClick={() => { setLocale('hi'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>हिन्दी</button>
              <button onClick={() => { setLocale('mr'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>मराठी</button>
              <button onClick={() => { setLocale('kn'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>ಕನ್ನಡ</button>
              <button onClick={() => { setLocale('te'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>తెలుగు</button>
              <button onClick={() => { setLocale('gu'); setLangOpen(false); }} className="sk-button" style={{ padding: '6px' }}>ગુજરાતી</button>
            </div>
          )}
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{profile?.name || t('navbar_farmer')}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{profile?.role || t('navbar_farmer')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="sk-button"
              style={{ color: '#d9534f', padding: '8px 12px' }}
            >
              <Icon name="log-out" style={{ width: '16px', height: '16px' }} />
              <span>{t('logout')}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" className="sk-button" style={{ textDecoration: 'none' }}>
              {t('login')}
            </Link>
            <Link href="/register" className="sk-button-primary sk-button" style={{ textDecoration: 'none' }}>
              {t('register')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
