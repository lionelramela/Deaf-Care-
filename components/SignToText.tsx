
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { synthesizeSpeech } from '../services/gemini';

const SignToText: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [lastRecognitionTime, setLastRecognitionTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1280, height: 720 } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const speakResult = async (text: string) => {
    if (!isAudioEnabled) return;
    const base64Audio = await synthesizeSpeech(text);
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

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
  };

  const processFrame = async () => {
    if (isProcessing || !isScanning) return;
    const base64Data = captureFrame();
    if (!base64Data) return;

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "Identify the ASL sign. One word only. Respond 'None' if unclear." }
          ]
        },
        config: { temperature: 0.1 }
      });

      const result = response.text?.trim() || 'None';
      if (result !== 'None' && result !== recognizedText) {
        setRecognizedText(result);
        setLastRecognitionTime(Date.now());
        speakResult(result);
      }
    } catch (err) {
      console.error("Recognition error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isScanning) interval = window.setInterval(processFrame, 2500);
    return () => clearInterval(interval);
  }, [isScanning, isProcessing, recognizedText]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastRecognitionTime > 4000) setRecognizedText('');
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRecognitionTime]);

  return (
    <div className="relative h-full w-full bg-black rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800 group">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                {isScanning ? 'Neural Scan Active' : 'Standby'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isAudioEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          {recognizedText && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white animate-bounce-subtle">
                🤟
              </div>
              <div className="mt-4 bg-white px-10 py-5 rounded-[2rem] shadow-2xl transform -rotate-1 border-b-4 border-slate-200">
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
                  {recognizedText}
                </h3>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className={`px-12 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${
              isScanning ? 'bg-red-600 text-white' : 'bg-brand-green text-white'
            }`}
          >
            {isScanning ? 'Stop Recognition' : 'Launch Vision Hub'}
          </button>
        </div>
      </div>

      {/* Decorative scanline */}
      {isScanning && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green/10 to-transparent h-20 w-full animate-scan pointer-events-none"></div>}
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(600%); }
        }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default SignToText;
