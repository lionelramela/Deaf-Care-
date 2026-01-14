
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createLiveTranscriptionSession } from '../services/gemini';
import { TranscriptionItem } from '../types';

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const VoiceToText: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<TranscriptionItem[]>([]);
  const [livePreview, setLivePreview] = useState('');
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, livePreview]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      setIsListening(true);

      const sessionPromise = createLiveTranscriptionSession({
        onopen: () => {
          const source = audioContext.createMediaStreamSource(stream);
          const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s?.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);
        },
        onmessage: (msg: any) => {
          if (msg.serverContent?.inputTranscription) {
            setLivePreview(msg.serverContent.inputTranscription.text);
          }
          if (msg.serverContent?.turnComplete) {
            setLivePreview(prev => {
              if (prev) setMessages(m => [...m, { id: Date.now().toString(), text: prev, type: 'user', timestamp: new Date() }]);
              return '';
            });
          }
        },
        onclose: () => setIsListening(false),
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      alert("Mic access denied.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest">Live Transcript</h2>
        <button 
          onClick={() => setMessages([])} 
          className="interactive-btn px-4 py-2 text-[10px] font-black text-brand-red uppercase tracking-widest hover:bg-brand-red/10 rounded-xl"
        >
          Clear Journal
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl p-8 overflow-y-auto no-scrollbar space-y-6"
      >
        {messages.length === 0 && !livePreview && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10 space-y-4">
            <span className="text-8xl floating">🎙️</span>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Awaiting audio input stream...</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="animate-in slide-in-from-bottom-2 duration-300">
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed border-b border-slate-50 dark:border-slate-800/50 pb-4 tracking-tight">
              {m.text}
            </p>
          </div>
        ))}
        {livePreview && (
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-ping"></div>
            <p className="text-xl font-black text-brand-green italic tracking-tighter">
              "{livePreview}..."
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={isListening ? stopListening : startListening}
          className={`interactive-btn w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl transition-all relative ${
            isListening ? 'bg-brand-red' : 'bg-brand-green'
          }`}
        >
          {isListening && <span className="absolute inset-0 rounded-[2rem] bg-brand-red animate-ping opacity-20"></span>}
          <span className="relative z-10 text-white">{isListening ? '🛑' : '🎙️'}</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceToText;
