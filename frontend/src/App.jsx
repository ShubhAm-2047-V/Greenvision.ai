import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogOut, User as UserIcon, Globe, Sun, Moon, MessageSquare, Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TranslationProvider, useTranslation } from './context/TranslationContext';

// Pages imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import CropPredictionPage from './pages/CropPredictionPage';
import DiseaseScannerPage from './pages/DiseaseScannerPage';
import ChatbotWidget from './components/ChatbotWidget';

const AppContent = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { t, locale, changeLocale } = useTranslation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('av_theme') === 'dark');
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('av_theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('av_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full glass border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-dark dark:text-primary-light">
          <Sprout className="w-8 h-8 text-primary animate-pulse" />
          <span>{t('brand')}</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          {isAuthenticated && !isAuthPage && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-semibold hover:text-primary transition-colors">{t('dashboard')}</Link>
              <Link to="/predict" className="text-sm font-semibold hover:text-primary transition-colors">{t('predict')}</Link>
              <Link to="/disease" className="text-sm font-semibold hover:text-primary transition-colors">{t('disease')}</Link>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="uppercase">{locale}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 glass border border-slate-200/50 dark:border-slate-800/50 rounded-lg shadow-lg overflow-hidden z-50">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('en'); setLangOpen(false); }}
                >English</button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('hi'); setLangOpen(false); }}
                >हिन्दी</button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('mr'); setLangOpen(false); }}
                >मराठी</button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('kn'); setLangOpen(false); }}
                >ಕನ್ನಡ</button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('te'); setLangOpen(false); }}
                >తెలుగు</button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => { changeLocale('gu'); setLangOpen(false); }}
                >ગુજરાતી</button>
              </div>
            )}
          </div>

          {/* Auth Management */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
              </div>
              {isAdmin && <Shield className="w-4 h-4 text-accent" title="Admin User" />}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-sm px-4 py-2 rounded-lg transition-all border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )
          )}
        </div>
      </nav>

      {/* Pages Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<CropPredictionPage />} />
          <Route path="/disease" element={<DiseaseScannerPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 py-8 px-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Sprout className="w-5 h-5 text-primary" />
            <span>{t('brand')}</span>
          </div>
          <div className="text-center sm:text-right">
            <p>© {new Date().getFullYear()} {t('brand')}. All rights reserved.</p>
            <p className="mt-1 font-semibold text-primary dark:text-primary-light">Created by ShubDeep Labs</p>
          </div>
        </div>
      </footer>

      {/* AI Agriculture Chatbot floating widget */}
      {isAuthenticated && <ChatbotWidget />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TranslationProvider>
          <AppContent />
        </TranslationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
