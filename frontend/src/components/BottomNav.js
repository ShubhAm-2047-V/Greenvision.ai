'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import Icon from './Icon';

const BottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: 'activity' },
    { href: '/predict', label: t('predict'), icon: 'sprout' },
    { href: '/disease', label: t('disease'), icon: 'camera' },
    { href: '/advisor', label: t('advisor'), icon: 'message-square' }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-45 md:hidden">
      <div className="glass border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl flex justify-around items-center py-2 px-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 bg-transparent border-0 cursor-pointer transition-all no-underline ${isActive ? 'text-primary font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <Icon name={link.icon} className="w-5 h-5" />
              <span className="text-[9px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
