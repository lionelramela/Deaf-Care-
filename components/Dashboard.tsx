
import React from 'react';
import { AppMode } from '../types';

interface DashboardProps {
  onNavigate: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 px-2 group/hero relative z-10">
        <div className="space-y-4 flex-1 pt-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-green/10 rounded-full mb-2 border border-brand-green/20">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-green">Neural Core V3.1 Active</span>
          </div>
          <h2 className="text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[0.95]">
            Bridging the <br/>
            <span className="text-brand-green italic underline decoration-brand-yellow/30 underline-offset-8">Silence</span>.
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-xl font-medium max-w-xl leading-relaxed pt-2">
            South African healthcare, reimagined through intelligent visual protocols and real-time sign recognition.
          </p>
          <div className="flex flex-wrap items-center gap-5 pt-6">
            <button 
              onClick={() => onNavigate(AppMode.SIGN_TO_TEXT)}
              className="interactive-btn px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl"
            >
              Launch Recognition
            </button>
            <button 
              onClick={() => onNavigate(AppMode.TEXT_TO_SIGN)}
              className="interactive-btn px-10 py-5 bg-brand-yellow text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl border-b-4 border-slate-900/10"
            >
              Open Studio
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
        <DashboardCard 
          icon="👁️" 
          title="Sign Recognition" 
          desc="AI-powered visual to text/voice converter." 
          color="bg-brand-yellow"
          className="md:col-span-7 h-72"
          onClick={() => onNavigate(AppMode.SIGN_TO_TEXT)}
        />
        <DashboardCard 
          icon="🎹" 
          title="Sign Studio" 
          desc="Professional ASL video synthesis." 
          color="bg-brand-green"
          className="md:col-span-5 h-72"
          onClick={() => onNavigate(AppMode.TEXT_TO_SIGN)}
        />
        <DashboardCard 
          icon="🎙️" 
          title="Voice Feed" 
          desc="Low-latency transcription." 
          color="bg-brand-sky"
          className="md:col-span-4 h-60"
          onClick={() => onNavigate(AppMode.VOICE_TO_TEXT)}
        />
        <DashboardCard 
          icon="🌐" 
          title="Translator" 
          desc="South African dialect bridge." 
          color="bg-brand-red"
          className="md:col-span-4 h-60"
          onClick={() => onNavigate(AppMode.TRANSLATOR)}
        />
        <DashboardCard 
          icon="⌨️" 
          title="Sign Keys" 
          desc="Visual composition tool." 
          color="bg-brand-violet"
          className="md:col-span-4 h-60"
          onClick={() => onNavigate(AppMode.SIGN_KEYBOARD)}
        />
        <DashboardCard 
          icon="🌍" 
          title="Community Hub" 
          desc="Connect, share, and find medical centers." 
          color="bg-brand-emerald"
          className="md:col-span-8 h-52"
          onClick={() => onNavigate(AppMode.COMMUNITY)}
        />
        <a 
          href="https://www.deafcarehealthcare.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bento-card relative overflow-hidden group p-8 rounded-[3rem] flex flex-col items-start text-left bg-gradient-to-br from-slate-800 to-slate-950 md:col-span-4 h-52 interactive-btn"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="bg-white/10 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-auto border border-white/20 shadow-md">🇿🇦</div>
          <div className="mt-4 text-white">
            <h3 className="font-black text-xl mb-1 tracking-tighter uppercase italic leading-none">Official Portal</h3>
            <p className="text-[9px] opacity-60 font-black uppercase tracking-widest">Global DCHI Network</p>
          </div>
        </a>
      </div>

      <div className="text-center pb-12 opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 italic">South African Innovation Node</p>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ icon: string, title: string, desc: string, color: string, className?: string, onClick: () => void }> = ({ icon, title, desc, color, className, onClick }) => (
  <button 
    onClick={onClick}
    className={`bento-card interactive-btn relative overflow-hidden group p-10 rounded-[3.5rem] flex flex-col items-start text-left ${color} ${className}`}
  >
    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-[2] transition-transform duration-1000"></div>
    <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mb-auto border border-white/30 shadow-xl group-hover:rotate-6 transition-all duration-500">
      {icon}
    </div>
    <div className="mt-6 text-white">
      <h3 className="font-black text-3xl mb-2 tracking-tighter uppercase italic leading-none">{title}</h3>
      <p className="text-base opacity-90 font-medium leading-tight max-w-[240px] tracking-tight">{desc}</p>
    </div>
  </button>
);

export default Dashboard;
