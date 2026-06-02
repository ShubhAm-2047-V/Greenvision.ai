import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { TranslationProvider } from '../context/TranslationContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import './globals.css'; // Changed to our new Skeuomorphic Vanilla CSS

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AgroMind AI - Smart Farming Platform',
  description: 'AI-Powered Smart Farming Intelligence Platform recommending crops, diagnostic plant diseases, and optimizing irrigation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TranslationProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', paddingBottom: '100px' }}>
                {children}
              </main>
              <BottomNav />
            </div>
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
