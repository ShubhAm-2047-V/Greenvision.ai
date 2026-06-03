'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../context/TranslationContext';
import Icon from './Icon';

const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: '/predict', label: t('predict') || 'Predict', icon: 'sprout' },
    { href: '/advisor', label: t('advisor') || 'Advisor', icon: 'message-square' }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '16px', left: '16px', right: '16px', zIndex: 45 }} className="mobile-only">
      <div className="sk-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px', margin: 0 }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: isActive ? 'bold' : 'normal',
                transform: isActive ? 'scale(1.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Icon name={link.icon} style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '10px' }}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
