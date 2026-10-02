'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Moon, Sun } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updateMetaThemeColor = (dark: boolean) => {
    const color = dark ? '#111111' : '#ffffff';
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#232323] shadow-sm transition-all pt-[env(safe-area-inset-top)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo Oficial GastroTorre */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-[#FFCC00] flex items-center justify-center p-1 shadow-md shadow-[#FFCC00]/20 overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-[#FFCC00]">
            <img
              src={mounted && isDark ? "/gastrotorre_logo_negro.png" : "/gastrotorre_logo_negro.png"}
              alt="GastroTorre Logo Oficial"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-[#111111] dark:text-white leading-none">
              GASTRO<span className="text-[#FFCC00]">TORRE</span>
            </h1>
            <p className="text-[10px] font-semibold text-[#555555] dark:text-[#888888] tracking-tight mt-0.5">
              Hostelería de Torrelodones
            </p>
          </div>
        </Link>

        {/* Right Actions: Dark Mode + Admin Link */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[#F4F4F2] dark:bg-[#232323] text-[#111111] dark:text-[#FFCC00] hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-90 border border-slate-200 dark:border-[#232323] shadow-sm flex items-center justify-center"
            title={mounted && isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar modo oscuro"
          >
            {mounted && isDark ? (
              <Sun className="w-4 h-4 text-[#FFCC00]" />
            ) : (
              <Moon className="w-4 h-4 text-[#111111]" />
            )}
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black shadow-md shadow-[#FFCC00]/20 transition-all active:scale-95 border border-[#FFCC00]"
          >
            <Store className="w-3.5 h-3.5 text-[#111111]" />
            <span>Hosteleros</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
