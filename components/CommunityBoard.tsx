
import React, { useState } from 'react';
import { CommunityPost } from '../types';
import { refineCommunityPost } from '../services/gemini';

const INITIAL_POSTS: CommunityPost[] = [
  { id: '1', author: 'Dr. Sarah M.', category: 'Update', content: 'New clinic hours for ASL-supported sessions starting next week in Cape Town! We are excited to welcome more families.', date: '2 hours ago', likes: 24 },
  { id: '2', author: 'Thabo N.', category: 'Testimonial', content: 'The sign studio feature helped me communicate with my doctor for the first time without an external interpreter. Truly life-changing technology.', date: '5 hours ago', likes: 112 },
  { id: '3', author: 'DCHI Team', category: 'News', content: 'Our South Africa Healthcare Initiative has officially reached 5,000 active users this month. Thank you for being part of this journey.', date: '1 day ago', likes: 89 },
];

const CommunityBoard: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'All' | 'News' | 'Update' | 'Testimonial'>('All');
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'Testimonial' as const });
  const [isRefining, setIsRefining] = useState(false);

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

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 max-w-4xl mx-auto pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-brand-green dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
             <span className="text-5xl floating">🌍</span> Community Hub
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] px-1">Neural Connection Node</p>
        </div>
        <button 
          onClick={() => setIsPosting(true)}
          className="interactive-btn bg-brand-green text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-green/20"
        >
          Post Experience
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/40 dark:bg-slate-900/40 p-2 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
        {['All', 'News', 'Update', 'Testimonial'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
              activeTab === tab 
                ? 'bg-white dark:bg-slate-800 text-brand-green dark:text-white shadow-xl scale-105' 
                : 'text-slate-500 hover:text-slate-800 hover:scale-105'
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Posting Modal */}
      {isPosting && (
        <div className="bg-white dark:bg-slate-900 border-4 border-brand-green/10 p-10 rounded-[4rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-black uppercase tracking-[0.3em] text-brand-green text-sm">Create Neural Post</h3>
            <button onClick={() => setIsPosting(false)} className="interactive-btn w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400">✕</button>
          </div>
          
          <div className="flex gap-3 relative z-10">
            {['News', 'Update', 'Testimonial'].map((cat) => (
              <button
                key={cat}
                onClick={() => setNewPost(prev => ({ ...prev, category: cat as any }))}
                className={`interactive-btn px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                  newPost.category === cat 
                    ? 'bg-brand-green text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative z-10">
            <textarea 
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Draft your community message here..."
              className="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-none focus:ring-4 focus:ring-brand-green/10 text-xl font-medium resize-none text-slate-900 dark:text-white"
            />
            <button 
              onClick={handleRefine}
              disabled={isRefining || !newPost.content}
              className="interactive-btn absolute bottom-6 right-6 bg-white dark:bg-slate-700 px-6 py-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-600 text-[10px] font-black text-brand-green flex items-center gap-2 disabled:opacity-50"
            >
              {isRefining ? '⌛ Synthesis...' : '✨ Neural Polish'}
            </button>
          </div>

          <button 
            onClick={handlePost}
            className="interactive-btn w-full py-6 bg-brand-green text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-brand-green/30"
          >
            Broadcast to Hub
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="grid grid-cols-1 gap-8">
        {filteredPosts.map((post) => (
          <div 
            key={post.id} 
            className="group bento-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[4rem] shadow-md transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                  👤
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">{post.author}</h4>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">{post.date}</span>
                </div>
              </div>
              <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all duration-500 group-hover:scale-110 ${
                post.category === 'News' ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30' :
                post.category === 'Update' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' :
                'bg-brand-red/10 text-brand-red border-brand-red/30'
              }`}>
                {post.category}
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug tracking-tighter italic border-l-4 border-brand-green/20 pl-6 group-hover:border-brand-green transition-all duration-500">
              "{post.content}"
            </p>

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
              <div className="flex gap-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="interactive-btn flex items-center gap-3 text-slate-400 hover:text-brand-red transition-all group/like"
                >
                  <span className="text-2xl group-hover/like:animate-wiggle">❤️</span>
                  <span className="text-sm font-black tracking-widest">{post.likes}</span>
                </button>
                <button className="interactive-btn flex items-center gap-3 text-slate-400 hover:text-brand-sky transition-all group/reply">
                  <span className="text-2xl group-hover/reply:translate-x-1">💬</span>
                  <span className="text-sm font-black tracking-widest uppercase">Reply</span>
                </button>
              </div>
              <button className="interactive-btn text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-green">
                Share Neural Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityBoard;
