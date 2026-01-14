
import React from 'react';

const CONTACTS = [
  { id: '1', name: 'Dr. Sarah M.', lastMsg: 'I have reviewed your results.', time: '10:45 AM', unread: 2, avatar: '👩‍⚕️' },
  { id: '2', name: 'Cape Town Central Pharmacy', lastMsg: 'Prescription is ready for collection.', time: 'Yesterday', unread: 0, avatar: '💊' },
  { id: '3', name: 'ASL Support Group', lastMsg: 'Meeting starts in 10 minutes!', time: '9:12 AM', unread: 5, avatar: '🤟' },
  { id: '4', name: 'Emergency Triage', lastMsg: 'Please confirm your location.', time: 'Monday', unread: 0, avatar: '🚑' },
];

const WhatsAppSidebar: React.FC<{ activeId: string, onSelect: (id: string) => void }> = ({ activeId, onSelect }) => {
  return (
    <div className="w-full md:w-80 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-500">
      <div className="p-6 space-y-4">
        <h3 className="text-sm font-black text-brand-green uppercase tracking-widest">Medical Directory</h3>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search providers..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs border-none focus:ring-2 focus:ring-brand-green/20 transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {CONTACTS.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelect(contact.id)}
            className={`w-full p-6 flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
              activeId === contact.id ? 'bg-brand-green/5 dark:bg-brand-green/10 border-l-4 border-l-brand-green' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-sm">
              {contact.avatar}
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{contact.name}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{contact.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight italic">"{contact.lastMsg}"</p>
            </div>
            {contact.unread > 0 && (
              <div className="bg-brand-red text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse shadow-lg">
                {contact.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppSidebar;
