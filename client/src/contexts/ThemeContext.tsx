import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeConfig } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeConfig: ThemeConfig;
}

const themeConfigs: Record<Theme, ThemeConfig> = {
  classic: {
    name: 'classic',
    displayName: '经典蓝',
    colors: {
      primary: 'rgb(14, 165, 233)',
      secondary: 'rgb(59, 130, 246)',
      accent: 'rgb(99, 102, 241)',
      background: 'rgb(248, 250, 252)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(71, 85, 105)',
    },
  },
  dark: {
    name: 'dark',
    displayName: '暗夜黑',
    colors: {
      primary: 'rgb(168, 162, 158)',
      secondary: 'rgb(120, 113, 108)',
      accent: 'rgb(245, 158, 11)',
      background: 'rgb(15, 23, 42)',
      surface: 'rgb(30, 41, 59)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
    },
  },
  gold: {
    name: 'gold',
    displayName: '金融金',
    colors: {
      primary: 'rgb(245, 158, 11)',
      secondary: 'rgb(217, 119, 6)',
      accent: 'rgb(180, 83, 9)',
      background: 'rgb(255, 251, 235)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(120, 53, 15)',
      textSecondary: 'rgb(146, 64, 14)',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'classic';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 更新CSS变量
    const root = document.documentElement;
    const config = themeConfigs[newTheme];
    
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // 更新body类名
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${newTheme}`);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  const themeConfig = themeConfigs[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};