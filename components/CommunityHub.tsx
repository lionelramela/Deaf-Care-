
import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { GoogleGenAI } from "@google/genai";
import { refineCommunityPost } from '../services/gemini';

const INITIAL_POSTS: CommunityPost[] = [
  { id: '1', author: 'Dr. Sarah M.', category: 'Update', content: 'New clinic hours for ASL-supported sessions starting next week in Cape Town!', date: '2 hours ago', likes: 24 },
  { id: '2', author: 'Thabo N.', category: 'Testimonial', content: 'The sign studio feature helped me communicate with my doctor for the first time without an external interpreter.', date: '5 hours ago', likes: 112 },
  { id: '3', author: 'DCHI Team', category: 'News', content: 'Our South Africa Healthcare Initiative has officially reached 5,000 active users this month.', date: '1 day ago', likes: 89 },
];

const SA_WEATHER_HUBS = [
  { city: 'Johannesburg', province: 'Gauteng', temp: 24, condition: 'Clear', icon: '☀️', color: 'from-brand-sky to-blue-600' },
  { city: 'Pretoria', province: 'Gauteng', temp: 26, condition: 'Sunny', icon: '☀️', color: 'from-orange-400 to-brand-yellow' },
  { city: 'Soweto', province: 'Gauteng', temp: 25, condition: 'Partly Cloudy', icon: '⛅', color: 'from-brand-green to-emerald-700' },
  { city: 'Cape Town', province: 'Western Cape', temp: 19, condition: 'Windy', icon: '💨', color: 'from-indigo-500 to-brand-violet' },
  { city: 'Durban', province: 'KwaZulu-Natal', temp: 28, condition: 'Humid', icon: '🌊', color: 'from-cyan-500 to-blue-500' },
];

interface NewsItem {
  title: string;
  uri: string;
}

interface GroundingLink {
  title: string;
  uri: string;
  snippet?: string;
  address?: string;
}

const CommunityHub: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'All' | 'News' | 'Update' | 'Testimonial'>('All');
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'Testimonial' as const });
  const [isRefining, setIsRefining] = useState(false);

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  // Maps Grounding state
  const [mapResults, setMapResults] = useState<string>('');
  const [mapLinks, setMapLinks] = useState<GroundingLink[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsNewsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Find 5 latest healthcare, accessibility, and deaf community news updates in South Africa. Return them as a summary.",
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const groundings = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundings) {
        const extractedNews = groundings
          .filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web.title || "Latest Healthcare Update",
            uri: chunk.web.uri || "#"
          }))
          .slice(0, 5);
        setNews(extractedNews);
      }
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setIsNewsLoading(false);
    }
  };

  const findNearbyHealthcare = async () => {
    setIsMapLoading(true);
    setMapResults('');
    setMapLinks([]);
    setMapError(null);

    try {
      // Step 1: Get User Location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 10000, 
          enableHighAccuracy: true 
        });
      });

      const { latitude, longitude } = position.coords;

      // Step 2: Use Gemini Maps Grounding to find Hospitals
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the 5 closest hospitals, medical centers, and emergency clinics relative to my current location. 
        For each center, check if they provide specialized support for the hearing impaired or ASL/Sign Language interpretation services. 
        Provide a list with names and brief helpful descriptions.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: { latitude, longitude }
            }
          }
        }
      });

      setMapResults(response.text || "Scan complete. Verified hospitals are listed below.");
      
      // Step 3: Extract Verified Place Links
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        const links: GroundingLink[] = groundingMetadata.groundingChunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any) => ({
            title: chunk.maps.title,
            uri: chunk.maps.uri,
            snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0] || "Hospital / Medical Center",
            address: chunk.maps.address
          }));
        setMapLinks(links);
      }
    } catch (err: any) {
      console.error("Maps search error:", err);
      if (err.code === 1) {
        setMapError("Location access denied. Please enable GPS and allow location access to find hospitals.");
      } else if (err.code === 3) {
        setMapError("Location request timed out. Please try again in an area with better signal.");
      } else {
        setMapError("Neural link failure. Could not fetch geographic hospital nodes.");
      }
    } finally {
      setIsMapLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handlePost = () => {
    if (!newPost.content.trim()) return;
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      category: newPost.category,
      content: newPost.content,
      date: 'Just now',
      likes: 0
    };
    setPosts([post, ...posts]);
    setNewPost({ content: '', category: 'Testimonial' });
    setIsPosting(false);
  };

  const handleRefine = async () => {
    if (!newPost.content.trim()) return;
    setIsRefining(true);
    const refined = await refineCommunityPost(newPost.content, newPost.category);
    setNewPost(prev => ({ ...prev, content: refined }));
    setIsRefining(false);
  };

  const filteredPosts = activeTab === 'All' ? posts : posts.filter(p => p.category === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      
      {/* WhatsApp Community Connection Banner */}
      <a 
        href="https://whatsapp.com/channel/0029VbC5X7mBadmWycNFCY3r" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative overflow-hidden bg-[#25D366] p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-green-500/20 hover:scale-[1.01] transition-all duration-500 cursor-pointer"
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-5xl group-hover:rotate-12 transition-transform duration-500">
            💬
          </div>
          <div className="text-white">
            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-1">Official WhatsApp Channel</h3>
            <p className="text-sm font-bold opacity-90 uppercase tracking-widest">Join the DCHI Community Network</p>
          </div>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-4 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Connect Instantly</span>
          <div className="h-14 px-8 bg-white text-[#25D366] rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl">
            Join Channel →
          </div>
        </div>
      </a>

      {/* Weather Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-sky/10 rounded-lg flex items-center justify-center text-lg">🌡️</div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest italic">Regional Hub Pulse</h4>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400">Scroll for Gauteng & Major Centers</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto p-6 no-scrollbar snap-x scroll-smooth">
          {SA_WEATHER_HUBS.map((hub, idx) => (
            <div 
              key={idx} 
              className={`flex-shrink-0 w-64 snap-center p-6 rounded-[2rem] bg-gradient-to-br ${hub.color} text-white shadow-lg relative overflow-hidden group/card hover:scale-[1.02] transition-transform duration-500`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl group-hover/card:scale-125 transition-transform"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-70">{hub.province}</span>
                    <h5 className="text-lg font-black tracking-tight leading-none uppercase italic">{hub.city}</h5>
                  </div>
                  <span className="text-3xl animate-bounce-subtle">{hub.icon}</span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-black tracking-tighter">{hub.temp}°</span>
                    <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">{hub.condition}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Hospital Locator (Maps Grounding) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>
          
          <div className="flex flex-col gap-8 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-violet/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-500">🏥</div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Hospital Hub Finder</h4>
                  <p className="text-[10px] font-black text-brand-violet uppercase tracking-[0.3em]">Live Geolocation Tracking Node</p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end opacity-40">
                <span className="text-[8px] font-black uppercase tracking-widest">Type: Hospital Grounding</span>
                <span className="text-[8px] font-black uppercase tracking-widest">Signal: GPS Enabled</span>
              </div>
            </div>

            {mapError && (
              <div className="bg-brand-red/10 border border-brand-red/20 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
                <span className="text-3xl">📍</span>
                <div>
                   <p className="text-sm font-black uppercase text-brand-red tracking-widest mb-1">Signal Interrupted</p>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{mapError}</p>
                </div>
              </div>
            )}

            {!mapResults && !isMapLoading ? (
              <div className="space-y-8 py-4">
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-xl italic border-l-4 border-brand-violet/20 pl-6">
                    "Sync your location to identify verified medical centers and hospitals nearby. DCHI AI prioritizes centers with documented accessibility support."
                  </p>
                </div>
                <button 
                  onClick={findNearbyHealthcare}
                  className="interactive-btn px-12 py-6 bg-brand-violet text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-violet/30 flex items-center gap-4"
                >
                  <span>Find Closest Hospitals</span>
                  <span className="opacity-40">📡</span>
                </button>
              </div>
            ) : isMapLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-10">
                <div className="relative">
                  <div className="w-32 h-32 border-[10px] border-brand-violet/10 border-t-brand-violet rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🏨</div>
                  {/* Decorative orbital rings */}
                  <div className="absolute -inset-4 border border-brand-violet/5 rounded-full animate-ping"></div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-sm font-black uppercase tracking-[0.6em] text-brand-violet animate-pulse">Syncing Hospital Nodes...</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Pinging Satellite Geodata Protocols</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-brand-violet/20 transition-colors">
                   <p className="text-slate-800 dark:text-slate-300 font-bold leading-relaxed text-lg whitespace-pre-wrap italic">
                     {mapResults}
                   </p>
                </div>
                
                {mapLinks.length > 0 && (
                  <div className="space-y-8">
                    <h5 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 px-4 flex items-center gap-4">
                      <div className="w-3 h-3 bg-brand-violet rounded-full animate-pulse"></div>
                      Verified Hospital Pins
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {mapLinks.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex flex-col p-8 bg-white dark:bg-slate-800 hover:bg-brand-violet group/link hover:scale-[1.03] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-500"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-black text-slate-900 dark:text-white group-hover/link:text-white tracking-tighter uppercase italic">{link.title}</span>
                            <span className="text-2xl group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform">↗️</span>
                          </div>
                          {link.address && (
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover/link:text-white/60 uppercase tracking-widest mb-3">
                              📍 {link.address}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 group-hover/link:text-white/90 line-clamp-3 italic font-medium leading-relaxed mb-4">
                            "{link.snippet}"
                          </p>
                          <div className="mt-auto flex items-center justify-between border-t border-slate-50 dark:border-slate-700 group-hover/link:border-white/10 pt-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-brand-violet group-hover/link:text-white">
                               Start Navigation
                             </span>
                             <span className="text-xs opacity-0 group-hover/link:opacity-100 transition-opacity">🗺️</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => { setMapResults(''); setMapLinks([]); }}
                    className="px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-violet transition-all hover:bg-brand-violet/10 border border-transparent hover:border-brand-violet/20"
                  >
                    Reset Map Buffer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Neural News Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-brand-red/20 transition-colors duration-1000"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/20 rounded-xl flex items-center justify-center text-xl">📡</div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Neural News Feed</h4>
              </div>
            </div>

            <div className="flex-1 space-y-4 no-scrollbar overflow-y-auto">
              {isNewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 w-full bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />
                  ))}
                </div>
              ) : news.length > 0 ? (
                news.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-5 bg-slate-900/50 hover:bg-brand-red/10 rounded-[1.5rem] border border-slate-800 hover:border-brand-red/30 transition-all group/news"
                  >
                    <span className="text-[13px] font-black text-slate-300 group-hover/news:text-brand-red leading-tight tracking-tight uppercase italic line-clamp-2 mb-2 transition-colors">
                      {item.title}
                    </span>
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Verified Signal</span>
                       <span className="text-xs group-hover/news:translate-x-1 transition-transform opacity-30 group-hover/news:opacity-100">→</span>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic text-center py-10 uppercase tracking-widest">No active news signals.</p>
              )}
            </div>

            <button 
              onClick={fetchNews}
              className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors border border-white/5"
            >
              Refresh Data stream
            </button>
          </div>
        </div>
      </div>

      {/* Main Feed Header */}
      <div className="space-y-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-brand-green dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
               Verified Hub Stream
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] px-1">Community Insights & Interaction</p>
          </div>
          <button 
            onClick={() => setIsPosting(true)}
            className="interactive-btn bg-brand-green text-white px-10 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand-green/30 border-b-4 border-black/20 transition-all hover:scale-105 active:scale-95"
          >
            Broadcast Neural Entry
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/40 dark:bg-slate-900/40 p-2 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
          {['All', 'News', 'Update', 'Testimonial'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-800 text-brand-green dark:text-white shadow-xl scale-105' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>

        {/* Post Composition Area */}
        {isPosting && (
          <div className="bg-white dark:bg-slate-900 border-2 border-brand-green/20 p-10 rounded-[3.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between">
              <h3 className="font-black uppercase tracking-[0.3em] text-brand-green text-xs italic">Sync Node to Stream</h3>
              <button onClick={() => setIsPosting(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-brand-red transition-colors">✕</button>
            </div>
            
            <div className="flex gap-3">
              {['Update', 'Testimonial'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewPost(prev => ({ ...prev, category: cat as any }))}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    newPost.category === cat ? 'bg-brand-green text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea 
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Initialize broadcast content..."
                className="w-full h-40 p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none focus:ring-4 focus:ring-brand-green/10 text-xl font-bold italic resize-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700 shadow-inner transition-all"
              />
              <button 
                onClick={handleRefine}
                disabled={isRefining || !newPost.content}
                className="absolute bottom-6 right-6 bg-white dark:bg-slate-700 px-6 py-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-600 text-[10px] font-black text-brand-green flex items-center gap-3 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
              >
                {isRefining ? '⌛ Synthesis...' : '✨ Neural Polish'}
              </button>
            </div>

            <button 
              onClick={handlePost}
              className="interactive-btn w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-brand-green/30 border-b-4 border-black/20"
            >
              Authorize Broadcast
            </button>
          </div>
        )}

        {/* Community Feed Stream */}
        <div className="grid grid-cols-1 gap-8">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3.5rem] shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-6 transition-transform">
                    {post.author === 'Dr. Sarah M.' ? '👩‍⚕️' : post.author === 'DCHI Team' ? '🏢' : '🇿🇦'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase italic leading-none mb-1 group-hover:text-brand-green transition-colors">{post.author}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.date}</span>
                  </div>
                </div>
                <span className={`px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  post.category === 'News' ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30' :
                  post.category === 'Update' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' :
                  'bg-brand-red/10 text-brand-red border-brand-red/30'
                }`}>
                  {post.category}
                </span>
              </div>

              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 leading-tight tracking-tighter italic border-l-8 border-brand-green/10 pl-8 group-hover:border-brand-green transition-all duration-700">
                "{post.content}"
              </p>

              <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                <div className="flex gap-8">
                  <button onClick={() => setPosts(p => p.map(item => item.id === post.id ? {...item, likes: item.likes + 1} : item))} className="flex items-center gap-3 text-slate-400 hover:text-brand-red transition-all group/like">
                    <span className="text-3xl group-hover/like:scale-125 transition-transform">❤️</span>
                    <span className="text-sm font-black tracking-widest">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-3 text-slate-400 hover:text-brand-sky transition-all group/reply">
                    <span className="text-3xl group-hover/reply:translate-x-1 transition-transform">💬</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">Engage</span>
                  </button>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-green transition-all">
                  Broadcast Share Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
