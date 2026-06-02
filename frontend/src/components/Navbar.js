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
    <nav className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl text-primary-dark dark:text-emerald-400 bg-transparent border-0 cursor-pointer no-underline">
        <Icon name="sprout" className="w-7 h-7 sm:w-8 h-8 text-primary" />
        <span className="text-slate-800 dark:text-white">{t('brand')}</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-6">
        {user && (
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`text-sm font-semibold hover:text-primary transition-colors no-underline ${pathname === link.href ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all bg-transparent cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <Icon name="globe" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <span className="uppercase hidden sm:inline">{locale}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 glass border border-slate-200/50 dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden z-50 flex flex-col bg-white dark:bg-slate-900">
              <button onClick={() => { setLocale('en'); setLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors bg-transparent border-0 cursor-pointer text-slate-700 dark:text-slate-350">English</button>
              <button onClick={() => { setLocale('hi'); setLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors bg-transparent border-0 cursor-pointer text-slate-700 dark:text-slate-350">हिन्दी</button>
              <button onClick={() => { setLocale('mr'); setLangOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors bg-transparent border-0 cursor-pointer text-slate-700 dark:text-slate-350">मराठी</button>
            </div>
          )}
        </div>

        {/* Authentication Links */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{profile?.name || 'Farmer'}</span>
              <span className="text-xs text-slate-500 capitalize">{profile?.role || 'Farmer'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs sm:text-sm p-1.5 sm:px-4 sm:py-2 rounded-lg transition-all border border-rose-500/20 cursor-pointer"
            >
              <Icon name="log-out" className="w-4 h-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/login" className="text-xs sm:text-sm font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg no-underline text-slate-700 dark:text-slate-300">
              {t('login')}
            </Link>
            <Link href="/register" className="text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:shadow-primary/20 transition-all no-underline">
              {t('register')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
