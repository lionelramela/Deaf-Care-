
import React, { useState } from 'react';
import { translateTextToSign } from '../services/gemini';
import { SignGlossResult } from '../types';
import { GoogleGenAI } from "@google/genai";
import ApiKeyGuard from './ApiKeyGuard';

const TextToSignContent: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<(SignGlossResult & { originalText: string })[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [activeMovement, setActiveMovement] = useState<{ resultIndex: number; moveIndex: number | 'full' } | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setResults([]);
    setVideoUrl(null);
    setActiveMovement(null);

    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    const processedResults: (SignGlossResult & { originalText: string })[] = [];

    try {
      for (const line of lines) {
        const data = await translateTextToSign(line);
        processedResults.push({ ...data, originalText: line });
      }
      setResults(processedResults);
    } catch (e) {
      console.error("Batch synthesis error:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const renderVideo = async (text: string, resultIndex: number, moveIndex: number | 'full') => {
    setIsRenderingVideo(true);
    setVideoUrl(null);
    setActiveMovement({ resultIndex, moveIndex });
    
    try {
      // Create new client right before call as per instructions
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = moveIndex === 'full'
        ? `A professional, high-quality ASL demonstration video for the full phrase gloss: "${text}". White studio background, centered framing.`
        : `A focused ASL demonstration video for the specific movement: "${text}". Minimalist studio setting.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { 
          numberOfVideos: 1, 
          resolution: '720p', 
          aspectRatio: '16:9' 
        }
      });
      
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok && response.status === 404) {
           // Handle "Requested entity was not found" as per guidelines
           (window as any).aistudio.openSelectKey();
           return;
        }
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      console.error("Video rendering error:", e);
      setActiveMovement(null);
    } finally {
      setIsRenderingVideo(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-brand-green uppercase tracking-[0.4em] px-1">Phrase Input Buffer</label>
            <p className="text-slate-400 text-[9px] uppercase tracking-widest pl-1 font-bold italic">Separate lines for batch synthesis</p>
          </div>
          <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Veo Visual Core</span>
        </div>
        
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Hello, how can I help you today?&#10;I need to find the pharmacy."
          className="w-full h-40 p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none focus:ring-4 focus:ring-brand-green/10 transition-all text-2xl font-bold italic resize-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700"
        />
        
        <button 
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
          className="interactive-btn w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-brand-green/20 hover:brightness-110 disabled:opacity-30 flex items-center justify-center gap-4 text-xs"
        >
          {isTranslating ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Decoding Grammar...</span>
            </>
          ) : (
            <span>Initiate Visual Synthesis</span>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            {results.map((result, rIdx) => (
              <div key={rIdx} className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-700">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Neural Node #{rIdx + 1}</span>
                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic border-l-4 border-brand-yellow pl-4">{result.gloss}</h4>
                  </div>
                  <button 
                    onClick={() => renderVideo(result.gloss, rIdx, 'full')}
                    disabled={isRenderingVideo}
                    className="interactive-btn flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] border bg-slate-50 dark:bg-slate-800 text-brand-green border-brand-green/10"
                  >
                    <span>Full Loop</span>
                    <span>🎬</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.movements.map((move, mIdx) => (
                    <button 
                      key={mIdx} 
                      onClick={() => renderVideo(move, rIdx, mIdx)}
                      disabled={isRenderingVideo}
                      className={`p-6 rounded-[1.5rem] text-left transition-all duration-500 flex justify-between items-center shadow-sm border ${
                        activeMovement?.resultIndex === rIdx && activeMovement?.moveIndex === mIdx
                          ? 'bg-brand-green text-white border-brand-green' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-sm font-bold truncate pr-2">{move}</span>
                      <span>📹</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-slate-950 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white dark:border-slate-800 aspect-square flex items-center justify-center relative group">
              {videoUrl ? (
                <video src={videoUrl} autoPlay loop controls className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-14 space-y-6">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-5xl floating">🔭</div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    Select a node to initialize the visual rendering protocol.
                  </p>
                </div>
              )}
              
              {isRenderingVideo && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-brand-green/10 border-t-brand-green rounded-full animate-spin"></div>
                  <span className="text-white text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synthesizing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TextToSign: React.FC = () => (
  <ApiKeyGuard>
    <TextToSignContent />
  </ApiKeyGuard>
);

export default TextToSign;
