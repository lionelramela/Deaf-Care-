
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const CACHE_KEY = "dchi_asl_alphabet_cache";

interface LetterData {
  url: string;
  description: string;
  timestamp: number;
}

const AlphabetRef: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'fingerspell' | 'synthesis'>('gallery');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [cache, setCache] = useState<Record<string, LetterData>>(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load ASL cache", e);
      return {};
    }
  });
  const [loadingLetters, setLoadingLetters] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }, [cache]);

  const getLetterGuide = useCallback(async (letter: string) => {
    const upperLetter = letter.toUpperCase();
    if (!ALPHABET.includes(upperLetter)) return;
    
    // We fetch even if in cache if explicitly called for refresh/synthesis
    setLoadingLetters(prev => {
      const next = new Set(prev);
      next.add(upperLetter);
      return next;
    });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePrompt = `A high-quality educational illustration of a human hand performing the American Sign Language (ASL) sign for the letter '${upperLetter}'. Style: Minimalist, professional medical diagram. Lighting: High contrast, clear shadows. White background.`;
      const textPrompt = `Provide a precise 1-sentence physical instruction for forming the ASL handshape for the letter '${upperLetter}'.`;

      const [textRes, imgRes] = await Promise.all([
        ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: textPrompt,
        }),
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: imagePrompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        })
      ]) as [GenerateContentResponse, GenerateContentResponse];

      let imageUrl = '';
      const candidates = imgRes.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      const newData: LetterData = {
        url: imageUrl,
        description: textRes.text?.trim() || "Instruction not available.",
        timestamp: Date.now()
      };

      setCache(prev => ({ ...prev, [upperLetter]: newData }));
      return newData;
    } catch (error) {
      console.error(`Error generating letter ${upperLetter}:`, error);
      return null;
    } finally {
      setLoadingLetters(prev => {
        const next = new Set(prev);
        next.delete(upperLetter);
        return next;
      });
    }
  }, []);

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    setSyncProgress(0);
    for (let i = 0; i < ALPHABET.length; i++) {
      const letter = ALPHABET[i];
      if (!cache[letter]) {
        await getLetterGuide(letter);
      }
      setSyncProgress(Math.round(((i + 1) / ALPHABET.length) * 100));
    }
    setIsSyncingAll(false);
  };

  const handleLetterClick = async (letter: string) => {
    setSelectedLetter(letter);
    if (!cache[letter] && !loadingLetters.has(letter)) {
      await getLetterGuide(letter);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9FB] dark:bg-slate-900 transition-colors duration-500 overflow-x-hidden pb-20">
      <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1B5E20] dark:text-green-400 tracking-tight flex items-center gap-3 italic">
               <span className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center text-lg not-italic">🔬</span>
               ASL VISUAL LAB
            </h2>
            <p className="text-slate-600 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-1">Neural Handshape Reference Library</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-white/5 backdrop-blur-md">
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === 'gallery' ? 'bg-white dark:bg-slate-700 text-[#1B5E20] dark:text-green-400 shadow-lg scale-105' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Index Gallery
              </button>
              <button 
                onClick={() => setActiveTab('fingerspell')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === 'fingerspell' ? 'bg-white dark:bg-slate-700 text-[#1B5E20] dark:text-green-400 shadow-lg scale-105' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Fingerspell
              </button>
              <button 
                onClick={() => setActiveTab('synthesis')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === 'synthesis' ? 'bg-white dark:bg-slate-700 text-[#1B5E20] dark:text-green-400 shadow-lg scale-105' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Neural Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 lg:p-14 overflow-y-auto no-scrollbar scroll-smooth">
        {activeTab === 'gallery' && (
          <div className="space-y-14 max-w-5xl mx-auto">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-4">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`aspect-square flex items-center justify-center text-2xl font-black rounded-2xl transition-all duration-500 shadow-sm relative group overflow-hidden ${
                    selectedLetter === letter 
                      ? 'bg-[#1B5E20] dark:bg-green-700 text-white scale-110 shadow-2xl z-20 ring-4 ring-brand-green/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-500 hover:text-[#1B5E20] dark:hover:text-green-400 hover:-translate-y-1 hover:shadow-md border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cache[letter] ? (
                    <img src={cache[letter].url} alt={letter} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="relative z-10">{letter}</span>
                  )}
                  {cache[letter] && <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-brand-yellow rounded-full z-20" />}
                  {loadingLetters.has(letter) && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-30">
                      <div className="w-6 h-6 border-3 border-brand-green border-t-transparent animate-spin rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedLetter && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3.5rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-hidden relative group/detail">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover/detail:scale-150 transition-transform duration-1000"></div>
                
                <div className="flex flex-col md:flex-row gap-14 items-center md:items-start relative z-10">
                  <div className="w-full md:w-96 aspect-square bg-slate-50 dark:bg-slate-950 rounded-[3rem] overflow-hidden relative flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group/img">
                    {loadingLetters.has(selectedLetter) ? (
                      <div className="flex flex-col items-center gap-6 text-center p-10">
                        <div className="w-16 h-16 border-4 border-brand-green/10 border-t-brand-green rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-brand-green uppercase tracking-[0.4em] animate-pulse">Rendering Handshape...</span>
                      </div>
                    ) : cache[selectedLetter] ? (
                      <>
                        <img 
                          src={cache[selectedLetter].url} 
                          alt={`ASL Handshape for ${selectedLetter}`} 
                          className="w-full h-full object-cover transition-all duration-1000 group-hover/img:scale-110 group-hover/img:rotate-1" 
                        />
                        <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl opacity-0 group-hover/img:opacity-100 transition-all translate-y-2 group-hover/img:translate-y-0">
                           <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-2 h-2 bg-brand-green rounded-full"></span> AI Precision Model
                           </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-10 space-y-4 opacity-10">
                         <span className="text-9xl block text-slate-900 dark:text-slate-100">🔠</span>
                         <p className="text-xs font-black uppercase tracking-widest">Awaiting Command</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-10 py-6 w-full">
                    <div className="flex items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
                      <h3 className="text-[10rem] font-black text-[#1B5E20] dark:text-green-400 leading-none tracking-tighter drop-shadow-2xl">{selectedLetter}</h3>
                      <div className="pb-4 space-y-2">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-1 bg-brand-yellow rounded-full"></div>
                           <span className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em]">Sequence Node</span>
                        </div>
                        <p className="text-xl font-bold text-slate-500 dark:text-slate-500 italic">"The phonetic foundation of visual language."</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-brand-green-soft dark:bg-green-400/5 p-8 rounded-[2rem] border border-brand-green/10 dark:border-green-400/10 hover:bg-white dark:hover:bg-slate-750 transition-colors duration-500 group/inst">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="w-3 h-3 bg-brand-yellow rounded-full group-hover/inst:scale-150 transition-transform" />
                           <h4 className="text-[11px] font-black text-[#1B5E20] dark:text-green-400 uppercase tracking-widest">Neural Movement Guide</h4>
                        </div>
                        <p className="text-slate-900 dark:text-slate-300 text-2xl font-black leading-tight italic tracking-tight">
                          {cache[selectedLetter]?.description || (loadingLetters.has(selectedLetter) ? "DCHI AI is decoding skeletal handshape geometry..." : "Initializing reference guide...")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                         <button className="interactive-btn py-5 bg-brand-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-green/20">
                           Download Medical Guide
                         </button>
                         <button 
                          onClick={() => handleLetterClick(selectedLetter!)}
                          className="interactive-btn py-5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                         >
                           Regenerate AI
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fingerspell' && (
          <div className="space-y-12 animate-in fade-in duration-1000 max-w-5xl mx-auto">
            <div className="max-w-3xl mx-auto space-y-6 relative group/input">
              <label className="text-[11px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-brand-green rounded-full"></span> 
                 Initialize Fingerspelling Sequence
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 15))}
                  placeholder="IDENTIFY TERM..."
                  className="w-full bg-white dark:bg-slate-800 text-[#1B5E20] dark:text-green-400 text-5xl font-black p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl focus:outline-none focus:ring-[1rem] focus:ring-[#1B5E20]/5 dark:focus:ring-green-400/5 transition-all uppercase tracking-widest placeholder:text-slate-200 dark:placeholder:text-slate-850"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-400 dark:text-slate-700 flex flex-col items-end leading-none">
                  <span className="text-3xl text-slate-500 dark:text-slate-600">{word.length}</span>
                  <span className="tracking-[0.5em]">MAX 15</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold text-center uppercase tracking-[0.4em] animate-pulse">Auto-Synthesizing sequential handshapes</p>
            </div>

            {word ? (
              <div className="flex gap-8 overflow-x-auto pb-16 pt-6 px-4 snap-x no-scrollbar mask-gradient scroll-smooth">
                {word.toUpperCase().split('').map((char, idx) => (
                  <div key={idx} className="flex-shrink-0 w-72 snap-center group/card animate-in slide-in-from-right-8 duration-700" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col items-center hover:-translate-y-4 hover:rotate-1 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
                      <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative border-b border-slate-100 dark:border-slate-800 group-hover/card:bg-white transition-colors">
                        {cache[char] ? (
                          <img src={cache[char].url} alt={char} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
                        ) : (
                          <div className="flex flex-col items-center gap-5 p-10 text-center">
                            <div className="w-12 h-12 border-4 border-[#1B5E20]/10 dark:border-green-400/10 border-t-[#1B5E20] dark:border-t-green-400 animate-spin rounded-full" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rendering '{char}'</span>
                          </div>
                        )}
                        <div className="absolute top-6 left-6 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                           <span className="text-xs font-black text-slate-500">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="p-8 w-full bg-[#1B5E20] dark:bg-green-700 text-center relative group-hover/card:bg-brand-yellow transition-colors duration-500">
                        <span className="text-5xl font-black text-white group-hover/card:text-brand-green-dark tracking-tighter transition-all duration-500 group-hover/card:scale-125 inline-block">{char}</span>
                        <div className="absolute top-2 right-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                           <span className="text-4xl font-black italic">PHN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-slate-500 dark:text-slate-800 gap-8 opacity-40 group/empty">
                <div className="text-[10rem] animate-float opacity-30 group-hover/empty:opacity-60 transition-opacity">⌨️</div>
                <div className="text-center space-y-2">
                   <p className="font-black text-xl uppercase tracking-[0.5em] text-slate-600 dark:text-slate-700">Awaiting Neural Sequence</p>
                   <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Protocol Standby: Ready to Decode</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'synthesis' && (
          <div className="space-y-12 animate-in fade-in duration-1000 max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-slate-800 p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-1000"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-5xl floating">⚡</div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Library Sync</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm mx-auto">
                    Generate and cache high-definition AI sign images for the entire ASL alphabet. This data is stored locally for offline access.
                  </p>
                </div>

                {isSyncingAll ? (
                  <div className="space-y-6">
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-green transition-all duration-500 shadow-[0_0_20px_rgba(27,94,32,0.4)]"
                        style={{ width: `${syncProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-brand-green uppercase tracking-widest animate-pulse">Synthesizing...</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{syncProgress}% COMPLETE</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleSyncAll}
                    className="interactive-btn w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-brand-green/20"
                  >
                    Start Neural Synthesis
                  </button>
                )}
                
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                  Powered by Gemini 2.5 Flash Image • Local Persistance: {Object.keys(cache).length}/26 Indexed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 opacity-50">
              {ALPHABET.map(l => (
                <div key={l} className="aspect-square bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                  {cache[l] ? (
                    <img src={cache[l].url} alt={l} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-xl font-black text-slate-200 dark:text-slate-700">{l}</span>
                  )}
                  {cache[l] && <div className="absolute top-1 right-1 w-2 h-2 bg-brand-green rounded-full shadow-sm"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default AlphabetRef;
