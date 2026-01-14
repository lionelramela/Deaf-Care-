
import React, { useState, useEffect } from 'react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Use the provided aistudio global check
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per instructions to avoid race condition
      setHasKey(true);
    } catch (err) {
      console.error("Key selection failed:", err);
    }
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-brand-yellow/30 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-brand-yellow/10 rounded-full flex items-center justify-center text-5xl floating">
          🔑
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Key Selection Required</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            High-fidelity visual synthesis (Veo 3.1) requires a dedicated API key with billing enabled.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleSelectKey}
            className="interactive-btn w-full py-5 bg-brand-yellow text-slate-900 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand-yellow/20"
          >
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-brand-yellow uppercase tracking-widest hover:underline"
          >
            View Billing Documentation
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeyGuard;
