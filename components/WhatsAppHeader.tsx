
import React from 'react';

interface WhatsAppHeaderProps {
  contactName: string;
  avatar: string;
  onAction?: (action: string) => void;
}

const WhatsAppHeader: React.FC<WhatsAppHeaderProps> = ({ contactName, avatar, onAction }) => {
  return (
    <div className="h-24 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0 relative z-20 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl border border-slate-200 dark:border-slate-700">
          {avatar}
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{contactName}</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em]">Verified Provider</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onAction?.('video')}
          className="interactive-btn w-12 h-12 bg-brand-green/10 dark:bg-brand-green/20 rounded-2xl flex items-center justify-center text-xl text-brand-green"
          title="Start ASL Video Consultation"
        >
          📹
        </button>
        <button 
          onClick={() => onAction?.('info')}
          className="interactive-btn w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl text-slate-500"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};

export default WhatsAppHeader;
