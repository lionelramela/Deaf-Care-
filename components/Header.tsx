
import React from 'react';
import { AppMode } from '../types';
import Logo from './Logo';

interface HeaderProps {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeMode, setActiveMode, isDarkMode, toggleTheme }) => {
  const navItems = [
    { id: AppMode.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { id: AppMode.SIGN_KEYBOARD, label: 'Sign Keys', icon: '⌨️' },
    { id: AppMode.TEXT_TO_SIGN, label: 'Sign Studio', icon: '🎹' },
    { id: AppMode.VOICE_TO_TEXT, label: 'Voice Feed', icon: '🎙️' },
    { id: AppMode.TRANSLATOR, label: 'Translator', icon: '🌐' },
    { id: AppMode.ALPHABET, label: 'Visual Lab', icon: '🔤' },
  ];

  return (
    <header className="sticky top-0 z-[100] transition-all duration-500">
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/40 dark:border-white/5"></div>
      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="flex items-center justify-between h-28">
          
          <div 
            className="flex items-center cursor-pointer group shrink-0"
            onClick={() => setActiveMode(AppMode.DASHBOARD)}
          >
            <div className="relative">
              <Logo className="h-16 sm:h-20 transition-all duration-500 group-hover:scale-[1.02]" />
              <div className="absolute -inset-2 bg-brand-green/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-white/40 dark:border-white/5 transition-all overflow-x-auto no-scrollbar max-w-[600px]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMode(item.id)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-tighter shrink-0 group ${
                    activeMode === item.id
                      ? 'text-brand-green dark:text-green-400'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {activeMode === item.id && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-500"></div>
                  )}
                  <span className={`relative z-10 text-lg transition-transform duration-500 group-hover:scale-125 ${activeMode === item.id ? 'animate-float' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </nav>

            <button 
              onClick={toggleTheme}
              className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-90 overflow-hidden"
              title="Toggle Neural Aesthetics"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 text-xl group-hover:rotate-12 transition-transform duration-500">
                {isDarkMode ? '🌞' : '🌙'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
