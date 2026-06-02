import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { TranslationProvider } from '../context/TranslationContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import './tailwind-built.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AgroMind AI - Smart Farming Platform',
  description: 'AI-Powered Smart Farming Intelligence Platform recommending crops, diagnostic plant diseases, and optimizing irrigation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-200`}>
        <AuthProvider>
          <TranslationProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 pb-28 md:pb-8">
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
