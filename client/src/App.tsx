import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import MobileMenu from './components/Layout/MobileMenu';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Register from './pages/Register';
import VipCenter from './pages/VipCenter';
import AdminDashboard from './pages/AdminDashboard';
import './locales/i18n';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
            <Header />
            <MobileMenu />
            <main>
              <Routes>
                <Route path="/" element={<Calculator />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/vip" element={<VipCenter />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-primary)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;