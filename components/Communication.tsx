
import React, { useState } from 'react';
import { translateTextToSign } from '../services/gemini';
import { SignGlossResult } from '../types';
import WhatsAppSidebar from './WhatsAppSidebar';
import WhatsAppHeader from './WhatsAppHeader';
import WhatsAppChatArea from './WhatsAppChatArea';

const QUICK_PHRASES = [
  "Hello, how are you?",
  "Thank you so much",
  "Where is the restroom?",
  "I need help",
  "Nice to meet you",
  "Excuse me",
  "Wait a moment please",
  "Good morning",
  "I don't understand",
  "Please speak slowly"
];

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'phrases' | 'bridge'>('phrases');
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [glossResult, setGlossResult] = useState<SignGlossResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState('1');

  const handlePhraseClick = async (phrase: string) => {
    setSelectedPhrase(phrase);
    setLoading(true);
    try {
      const result = await translateTextToSign(phrase);
      setGlossResult(result);
    } catch (error) {
      console.error("Communication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-3xl">
      <div className="p-6 border-b border-brand-green/10 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-brand-green dark:text-slate-100 uppercase tracking-tighter italic">Communication Bridge</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Two-Way Interaction Protocols</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-white/5">
          <button 
            onClick={() => setActiveTab('phrases')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'phrases' ? 'bg-white dark:bg-slate-700 text-brand-green shadow-lg scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Phrase Board
          </button>
          <button 
            onClick={() => setActiveTab('bridge')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'bridge' ? 'bg-white dark:bg-slate-700 text-brand-green shadow-lg scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'phrases' ? (
          <div className="h-full p-8 overflow-y-auto space-y-8 no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePhraseClick(phrase)}
                  className={`text-left p-6 rounded-[2rem] border-2 transition-all group ${
                    selectedPhrase === phrase 
                      ? 'bg-brand-green text-white border-brand-green shadow-2xl scale-[1.02]' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-brand-green shadow-sm'
                  }`}
                >
                  <span className="font-extrabold text-lg leading-tight block">{phrase}</span>
                  <span className={`text-[9px] font-black uppercase mt-2 block tracking-widest ${selectedPhrase === phrase ? 'text-white/60' : 'text-slate-400'}`}>
                    PHRASE NODE #{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            {selectedPhrase && (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-brand-green/20 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/5 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-150 duration-1000"></div>
                
                <div className="flex flex-col gap-10 relative z-10">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-brand-green uppercase tracking-[0.4em] block pl-1">Neural ASL Sync</span>
                    {loading ? (
                      <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ) : (
                      <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic border-l-8 border-brand-yellow pl-6">
                        {glossResult?.gloss || "Ready to translate"}
                      </h3>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Movement Protocols</h4>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-tight tracking-tight">
                        {glossResult?.description || "Select a phrase to begin synthesis..."}
                      </p>
                    </div>
                    <div className="bg-brand-green/5 dark:bg-brand-green/10 p-8 rounded-[2.5rem] border border-brand-green/20 dark:border-brand-green/40 shadow-sm">
                      <h4 className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-4">Visual Sequence</h4>
                      <ul className="space-y-4">
                        {glossResult?.movements.map((m, i) => (
                          <li key={i} className="flex items-start gap-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                            <span className="w-6 h-6 bg-brand-green text-white text-[10px] font-black rounded-lg flex items-center justify-center shrink-0 mt-1">{i + 1}</span>
                            <span className="text-md font-bold text-brand-green dark:text-green-400 leading-tight">{m}</span>
                          </li>
                        )) || <li className="text-slate-400 text-sm italic">Awaiting synthesis...</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full animate-in fade-in duration-700">
            <div className="hidden md:block">
              <WhatsAppSidebar activeId={activeChatId} onSelect={setActiveChatId} />
            </div>
            <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
              <WhatsAppHeader 
                contactName={activeChatId === '1' ? 'Dr. Sarah M.' : 'Cape Town Central Pharmacy'} 
                avatar={activeChatId === '1' ? '👩‍⚕️' : '💊'} 
              />
              <WhatsAppChatArea />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
