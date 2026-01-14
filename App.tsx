
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import Dashboard from './components/Dashboard';
import TextToSign from './components/TextToSign';
import VoiceToText from './components/VoiceToText';
import AlphabetRef from './components/AlphabetRef';
import Communication from './components/Communication';
import Translator from './components/Translator';
import SignKeyboard from './components/SignKeyboard';
import CommunityHub from './components/CommunityHub';
import SignToText from './components/SignToText';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('dchi-theme') === 'dark' || (!('dchi-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dchi-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dchi-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.DASHBOARD: return <Dashboard onNavigate={setActiveMode} />;
      case AppMode.TEXT_TO_SIGN: return <TextToSign />;
      case AppMode.VOICE_TO_TEXT: return <VoiceToText />;
      case AppMode.ALPHABET: return <AlphabetRef />;
      case AppMode.COMMUNICATION: return <Communication />;
      case AppMode.TRANSLATOR: return <Translator onVisualize={() => setActiveMode(AppMode.TEXT_TO_SIGN)} />;
      case AppMode.SIGN_KEYBOARD: return <SignKeyboard />;
      case AppMode.COMMUNITY: return <CommunityHub />;
      case AppMode.SIGN_TO_TEXT: return <SignToText />;
      default: return <Dashboard onNavigate={setActiveMode} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500 text-slate-900 dark:text-slate-100">
      <header className="h-28 px-6 flex items-center justify-between bg-white dark:bg-white border-b border-slate-200 dark:border-slate-200 shrink-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          {activeMode !== AppMode.DASHBOARD && (
            <button 
              onClick={() => setActiveMode(AppMode.DASHBOARD)}
              className="interactive-btn w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-200 rounded-2xl text-slate-900 dark:text-slate-900 shadow-sm"
              aria-label="Back to Dashboard"
            >
              <span className="text-2xl">←</span>
            </button>
          )}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => setActiveMode(AppMode.DASHBOARD)}
          >
            <Logo className="h-16 sm:h-20 transition-all duration-500 group-hover:scale-[1.02]" />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a 
            href="https://www.deafcarehealthcare.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="interactive-btn hidden xs:flex h-12 px-5 items-center gap-3 bg-brand-green/10 text-brand-green dark:text-brand-green rounded-2xl text-[11px] font-black uppercase tracking-widest border border-brand-green/20 shadow-sm"
          >
            <span>🌐</span>
            <span className="hidden sm:inline">Official Site</span>
          </a>
          <button 
            onClick={toggleTheme}
            className="interactive-btn w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-100 rounded-2xl text-xl shadow-sm border border-slate-200 dark:border-slate-200 text-slate-900 dark:text-slate-900"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="max-w-5xl mx-auto h-full px-4 py-8 relative z-10">
          {renderContent()}
        </div>
      </main>

      <nav className="h-24 flex items-center justify-around bg-white dark:bg-white border-t border-slate-200 dark:border-slate-200 shrink-0 px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors">
        <NavItem icon="🏠" label="Home" active={activeMode === AppMode.DASHBOARD} color="text-brand-green" onClick={() => setActiveMode(AppMode.DASHBOARD)} />
        <NavItem icon="⌨️" label="Keys" active={activeMode === AppMode.SIGN_KEYBOARD} color="text-brand-violet" onClick={() => setActiveMode(AppMode.SIGN_KEYBOARD)} />
        <NavItem icon="🎙️" label="Voice" active={activeMode === AppMode.VOICE_TO_TEXT} color="text-brand-sky" onClick={() => setActiveMode(AppMode.VOICE_TO_TEXT)} />
        <NavItem icon="👁️" label="Sign" active={activeMode === AppMode.SIGN_TO_TEXT} color="text-brand-yellow" onClick={() => setActiveMode(AppMode.SIGN_TO_TEXT)} />
        <NavItem icon="🌍" label="Hub" active={activeMode === AppMode.COMMUNITY} color="text-brand-emerald" onClick={() => setActiveMode(AppMode.COMMUNITY)} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, color: string, onClick: () => void }> = ({ icon, label, active, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`nav-bounce flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300 ${
      active ? `${color} scale-110 -translate-y-2 font-bold` : 'text-slate-500 dark:text-slate-500'
    }`}
  >
    <span className={`text-3xl transition-transform ${active ? 'floating' : ''}`}>{icon}</span>
    <span className={`text-[10px] font-black uppercase tracking-tight transition-all ${active ? 'opacity-100 mt-1' : 'opacity-70 mt-0'}`}>{label}</span>
    {active && (
      <div className={`h-1.5 w-1.5 rounded-full bg-current mt-1 animate-pulse`}></div>
    )}
  </button>
);

export default App;
