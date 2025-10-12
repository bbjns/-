import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeType } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themes: { value: ThemeType; label: string }[] = [
    { value: 'dark', label: t('theme.dark') },
    { value: 'blue', label: t('theme.blue') },
    { value: 'gold', label: t('theme.gold') }
  ];

  const languages = [
    { code: 'zh', label: t('language.zh') },
    { code: 'en', label: t('language.en') },
    { code: 'ko', label: t('language.ko') }
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="logo">
              <h1>{t('app.title')}</h1>
              <p className="subtitle">{t('app.subtitle')}</p>
            </div>
          </div>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/calculator" onClick={() => setMenuOpen(false)}>
              {t('app.calculator')}
            </Link>
            {user ? (
              <>
                <Link to="/membership" onClick={() => setMenuOpen(false)}>
                  {t('app.membership')}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    {t('app.admin')}
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-button">
                  {t('app.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  {t('app.login')}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  {t('app.register')}
                </Link>
              </>
            )}
          </nav>

          <div className="header-controls">
            <div className="control-group">
              <label>{t('theme.title')}</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                {themes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>{t('language.title')}</label>
              <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
                {languages.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2024 {t('app.subtitle')}</p>
      </footer>
    </div>
  );
};

export default Layout;
