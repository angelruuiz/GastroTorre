'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Moon, Sun } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updateMetaThemeColor = (dark: boolean) => {
    const color = dark ? '#0f172a' : '#ffffff';
    // Update all theme-color meta tags
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length > 0) {
      metas.forEach(meta => meta.setAttribute('content', color));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      updateMetaThemeColor(true);
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      updateMetaThemeColor(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      updateMetaThemeColor(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      updateMetaThemeColor(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm transition-all pt-[env(safe-area-inset-top)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/logo-gastrotorre.jpeg"
              alt="GastroTorre"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-gray-900 dark:text-white leading-none">
              Gastro<span className="text-torre-600">Torre</span>
            </h1>
            <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 tracking-tight mt-0.5">
              Hostelería de Torrelodones
            </p>
          </div>
        </Link>

        {/* Right Actions: Dark Mode + Admin Link */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-oro-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
            title={mounted && isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar modo oscuro"
          >
            {mounted && isDark ? (
              <Sun className="w-4 h-4 text-oro-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 border border-slate-700 dark:border-slate-600"
          >
            <Store className="w-3.5 h-3.5 text-oro-400" />
            <span>Hosteleros</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
