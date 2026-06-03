import React from 'react';
import { Inter } from 'next/font/google';
import { TranslationProvider } from '../context/TranslationContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AgroMind AI Mini',
  description: 'AI-Powered Smart Farming Intelligence Platform recommending crops and providing chat advice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', paddingBottom: '100px' }}>
              {children}
            </main>
            <BottomNav />
          </div>
        </TranslationProvider>
      </body>
    </html>
  );
}
