'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export type ThemeMode = 'light' | 'dark' | 'auto' | 'high-contrast';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: ThemeMode) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' | 'high-contrast' {
  if (mode === 'auto') {
    return getSystemTheme();
  }
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';
    const savedFontSize = (localStorage.getItem('fontSize') || 'medium') as 'small' | 'medium' | 'large';

    if (savedTheme) {
      setThemeState(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } else {
      setResolvedTheme(getSystemTheme());
    }

    setReduceMotionState(savedReduceMotion);
    setFontSizeState(savedFontSize);

    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        setResolvedTheme(getSystemTheme());
      }
    };

    systemThemeQuery.addEventListener('change', handleSystemThemeChange);
    return () => systemThemeQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-font-size', fontSize);

    if (reduceMotion) {
      root.style.setProperty('--motion-duration', '0.01ms');
    } else {
      root.style.setProperty('--motion-duration', '');
    }
  }, [resolvedTheme, reduceMotion, fontSize, mounted]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem('theme', newTheme);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('theme_preferences').upsert({
          user_id: user.id,
          theme_mode: newTheme,
          reduce_motion: reduceMotion,
          font_size: fontSize,
        } as any);
      }
    } catch (error) {
      console.error('Failed to sync theme preference:', error);
    }
  };

  const setReduceMotion = async (value: boolean) => {
    setReduceMotionState(value);
    localStorage.setItem('reduceMotion', value.toString());

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('theme_preferences').upsert({
          user_id: user.id,
          theme_mode: theme,
          reduce_motion: value,
          font_size: fontSize,
        } as any);
      }
    } catch (error) {
      console.error('Failed to sync motion preference:', error);
    }
  };

  const setFontSize = async (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('theme_preferences').upsert({
          user_id: user.id,
          theme_mode: theme,
          reduce_motion: reduceMotion,
          font_size: size,
        } as any);
      }
    } catch (error) {
      console.error('Failed to sync font size preference:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        reduceMotion,
        setReduceMotion,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
