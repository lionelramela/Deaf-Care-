
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DICTIONARY = [
  { term: "Hello", category: "Greeting" },
  { term: "Thank You", category: "Greeting" },
  { term: "Help", category: "Urgent" },
  { term: "Pain", category: "Medical" },
  { term: "Medicine", category: "Medical" },
  { term: "Water", category: "Daily" },
];

const SignKeyboard: React.FC = () => {
  const [composition, setComposition] = useState<{ url: string, label: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'alphabet' | 'dictionary'>('alphabet');
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const getSign = async (term: string, isLetter: boolean) => {
    if (cache[term]) return cache[term];
    setLoading(prev => new Set(prev).add(term));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `ASL sign for ${isLetter ? 'letter' : 'word'} ${term}. Pure white background, high contrast handshape, 4K education quality.`;
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const url = `data:image/png;base64,${res.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
      setCache(prev => ({ ...prev, [term]: url }));
      return url;
    } catch (e) { return null; } finally {
      setLoading(prev => { const n = new Set(prev); n.delete(term); return n; });
    }
  };

  const add = async (term: string, isLetter: boolean) => {
    const url = await getSign(term, isLetter);
    if (url) setComposition(prev => [...prev, { label: term, url }]);
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      {/* Visual Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 min-h-[380px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-violet/5 rounded-full blur-3xl -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-150"></div>
        
        <div className="flex flex-wrap gap-6 items-center justify-center relative z-10">
          {composition.length === 0 ? (
            <div className="flex flex-col items-center justify-center opacity-30 h-64 w-full">
              <span className="text-8xl mb-6 floating">✍️</span>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-700 dark:text-slate-500">Awaiting Sequence</p>
            </div>
          ) : (
            composition.map((item, i) => (
              <div key={i} className="group relative w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl animate-in zoom-in-50 duration-500 hover:scale-110 hover:-rotate-2 transition-all">
                <img src={item.url} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-brand-violet text-[11px] text-white text-center font-black py-2 uppercase tracking-widest">
                  {item.label}
                </div>
                <button 
                  onClick={() => setComposition(prev => prev.filter((_, idx) => idx !== i))}
                  className="interactive-btn absolute top-2 right-2 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-3xl space-y-8">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem] backdrop-blur-md">
           <button onClick={() => setActiveTab('alphabet')} className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'alphabet' ? 'bg-white dark:bg-slate-700 text-brand-violet shadow-lg scale-105' : 'text-slate-500 hover:text-slate-900'}`}>A - Z Engine</button>
           <button onClick={() => setActiveTab('dictionary')} className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'dictionary' ? 'bg-white dark:bg-slate-700 text-brand-violet shadow-lg scale-105' : 'text-slate-500 hover:text-slate-900'}`}>Medical Lexicon</button>
           <button onClick={() => setComposition([])} className="interactive-btn px-10 py-4 text-[11px] font-black uppercase tracking-widest text-brand-red">Reset</button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[300px] overflow-y-auto no-scrollbar py-4 px-2">
          {activeTab === 'alphabet' ? (
            ALPHABET.map(c => (
              <button 
                key={c} onClick={() => add(c, true)} 
                disabled={loading.has(c)}
                className="interactive-btn aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl text-2xl font-black flex items-center justify-center border-2 border-transparent hover:border-brand-violet text-slate-900 dark:text-white disabled:opacity-30 shadow-sm"
              >
                {loading.has(c) ? <div className="w-6 h-6 border-2 border-brand-violet border-t-transparent rounded-full animate-spin"></div> : c}
              </button>
            ))
          ) : (
            DICTIONARY.map(d => (
              <button 
                key={d.term} onClick={() => add(d.term, false)} 
                disabled={loading.has(d.term)}
                className="interactive-btn py-6 px-4 bg-slate-50 dark:bg-slate-800 rounded-3xl text-[10px] font-black flex items-center justify-center border-2 border-transparent hover:border-brand-violet text-center text-slate-900 dark:text-white uppercase tracking-widest disabled:opacity-30 shadow-sm"
              >
                {loading.has(d.term) ? <div className="w-4 h-4 border-2 border-brand-violet border-t-transparent rounded-full animate-spin"></div> : d.term}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SignKeyboard;
