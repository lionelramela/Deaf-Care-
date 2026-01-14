
import React, { useState, useRef } from 'react';
import { detectAndTranslateLanguage, synthesizeSpeech } from '../services/gemini';

const SA_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇿🇦' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', flag: '🇿🇦' },
  { code: 'tn', name: 'Setswana', flag: '🇿🇦' },
];

interface TranslatorProps {
  onVisualize: (text: string) => void;
}

const Translator: React.FC<TranslatorProps> = ({ onVisualize }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ text: string, detected?: string } | null>(null);
  const [targetLang, setTargetLang] = useState('zu');
  const [isTranslating, setIsTranslating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setResult(null);
    try {
      const tLangName = SA_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      const data = await detectAndTranslateLanguage(inputText, tLangName);
      setResult({ text: data.translatedText, detected: data.detectedLanguage });
    } catch (e) {
      alert("Neural synthesis failed. Please check connection.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async () => {
    if (!result) return;
    const base64Audio = await synthesizeSpeech(result.text);
    if (base64Audio) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-500 block px-1">Translate Output</label>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-brand-red/10 transition-all cursor-pointer shadow-sm"
            >
              {SA_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type anything here..."
            className="w-full h-44 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none focus:ring-4 focus:ring-brand-red/10 transition-all text-xl font-medium resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
          />
          <button 
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="interactive-btn w-full py-5 bg-brand-red text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-red/20 disabled:opacity-30"
          >
            {isTranslating ? 'Synthesizing...' : 'Execute Translation'}
          </button>
        </div>
      </div>

      {result && (
        <div className="p-8 bg-brand-red/5 dark:bg-brand-red/10 border border-brand-red/20 dark:border-brand-red/40 rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500 shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-brand-red uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-md border border-brand-red/10">
              Detected: {result.detected}
            </span>
            <div className="flex gap-4">
              <button 
                onClick={handleSpeak} 
                className="interactive-btn w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-2xl border border-brand-red/5"
              >
                🔊
              </button>
              <button 
                onClick={() => onVisualize(result.text)} 
                className="interactive-btn w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-2xl border border-brand-red/5"
              >
                🤟
              </button>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tighter italic">
            {result.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default Translator;
