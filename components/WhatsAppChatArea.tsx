
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const WhatsAppChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I need assistance with my prescription refill.', sender: 'me', time: '10:40 AM' },
    { id: '2', text: 'Sure, I can help with that. Please confirm your patient ID.', sender: 'other', time: '10:42 AM' },
    { id: '3', text: 'Patient ID is ZA-992384. Thank you.', sender: 'me', time: '10:43 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:invert"></div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative z-10"
      >
        <div className="flex justify-center mb-10">
          <span className="bg-slate-200 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest px-6 py-2 rounded-full shadow-sm">
            End-to-End Neural Encryption Active
          </span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm relative group ${
              msg.sender === 'me' 
                ? 'bg-brand-green text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-800'
            }`}>
              <p className="text-base font-medium leading-relaxed">{msg.text}</p>
              <div className={`mt-2 flex items-center justify-end gap-1 text-[9px] font-bold uppercase tracking-tighter opacity-60`}>
                <span>{msg.time}</span>
                {msg.sender === 'me' && <span>✓✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Hub */}
      <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            <button className="absolute left-4 text-2xl hover:scale-110 transition-transform">➕</button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Communicate clearly..." 
              className="w-full pl-14 pr-14 py-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] border-none text-base font-medium focus:ring-4 focus:ring-brand-green/10 transition-all placeholder:text-slate-400"
            />
            <button className="absolute right-4 text-2xl hover:scale-110 transition-transform">📷</button>
          </div>
          
          <button 
            onClick={handleSend}
            className="interactive-btn w-16 h-16 bg-brand-green text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-brand-green/20"
          >
            {inputText.trim() ? '➡️' : '🎙️'}
          </button>
        </div>
        
        {/* Quick Neural Tools Shortcuts */}
        <div className="flex gap-4 mt-4 px-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-yellow/10 text-brand-yellow text-[9px] font-black uppercase tracking-widest rounded-xl border border-brand-yellow/20 hover:bg-brand-yellow/20 transition-all">
             🤟 Use Sign Studio
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-sky/10 text-brand-sky text-[9px] font-black uppercase tracking-widest rounded-xl border border-brand-sky/20 hover:bg-brand-sky/20 transition-all">
             🎙️ Voice Feed
           </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChatArea;
