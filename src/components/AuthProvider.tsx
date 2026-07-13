'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    // Check auth on load
    checkAuth();
    
    // Check theme on load
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Fallback to system preference or dark mode
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
      }
    }
  }, [checkAuth, setTheme]);

  return <>{children}</>;
}
