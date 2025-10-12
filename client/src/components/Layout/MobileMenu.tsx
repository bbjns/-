import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme, Language } from '../../types';

const MobileMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: '🧮', label: t('nav.calculator'), path: '/' },
    ...(user ? [
      { icon: '📊', label: t('nav.dashboard'), path: '/dashboard' },
      { icon: '👤', label: t('nav.profile'), path: '/profile' },
      { icon: '💎', label: '会员中心', path: '/vip' },
      ...(user.isVip ? [{ icon: '⚙️', label: t('nav.admin'), path: '/admin' }] : [])
    ] : [
      { icon: '🔑', label: t('nav.login'), path: '/login' },
      { icon: '📝', label: t('nav.register'), path: '/register' }
    ])
  ];

  const themes = [
    { value: 'classic' as Theme, label: t('theme.classic'), color: 'bg-blue-500' },
    { value: 'dark' as Theme, label: t('theme.dark'), color: 'bg-gray-800' },
    { value: 'gold' as Theme, label: t('theme.gold'), color: 'bg-yellow-500' }
  ];

  const languages = [
    { value: 'zh' as Language, label: '中文', flag: '🇨🇳' },
    { value: 'ko' as Language, label: '한국어', flag: '🇰🇷' },
    { value: 'en' as Language, label: 'English', flag: '🇺🇸' }
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    i18n.changeLanguage(newLanguage);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* 汉堡菜单按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-dark-800 shadow-lg rounded-full p-3 border border-gray-200 dark:border-dark-600"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 侧边菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-dark-800 shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              {/* 头部 */}
              <div className="p-6 border-b border-gray-200 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {t('app.title')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('app.subtitle')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 用户信息 */}
              {user && (
                <div className="p-6 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                      {user.isVip && (
                        <span className="inline-block bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded-full mt-1">
                          VIP会员
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 菜单项 */}
              <div className="py-4">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* 主题切换 */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('theme.title')}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme === themeOption.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${themeOption.color}`}></div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {themeOption.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 语言切换 */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('language.title')}
                </div>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        i18n.language === lang.value
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 退出登录 */}
              {user && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-600">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;