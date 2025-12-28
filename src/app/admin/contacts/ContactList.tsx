"use client";

import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Monitor, MessageSquare, Calendar, 
  Globe, Search, Filter, ChevronDown, ChevronUp, Inbox 
} from 'lucide-react';

interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  subject?: string;
  message: string;
  city?: string;
  state?: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
  reason?: string;
}

export default function ContactList({ initialData }: { initialData: ContactMessage[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Empty State
  if (initialData.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
          <Inbox className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg">Inbox is empty</h3>
        <p className="text-slate-500 text-sm mt-1">No contact messages have been received yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* --- MOBILE VIEW: Cards (< 768px) --- */}
      <div className="md:hidden space-y-3">
        {initialData.map((msg) => (
          <div 
            key={msg.id} 
            className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expandedId === msg.id ? 'border-purple-500 shadow-md ring-1 ring-purple-500/20' : 'border-slate-200 shadow-sm'}`}
          >
            <div onClick={() => toggleExpand(msg.id)} className="p-4 cursor-pointer active:bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-900">{msg.full_name}</div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="text-sm text-slate-600 font-medium mb-1 truncate">
                {msg.subject || 'No Subject'}
              </div>
              
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {msg.message}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={12} /> {msg.email}
                </div>
                <button className="text-purple-600 text-xs font-bold flex items-center gap-1">
                  {expandedId === msg.id ? 'Close' : 'Read'} {expandedId === msg.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
              </div>
            </div>

            {expandedId === msg.id && (
              <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2">
                <ExpandedMessageDetails msg={msg} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- DESKTOP VIEW: Table (>= 768px) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold w-1/4">Sender</th>
              <th className="px-6 py-4 font-semibold w-1/4">Subject</th>
              <th className="px-6 py-4 font-semibold w-1/4">Preview</th>
              <th className="px-6 py-4 font-semibold w-1/6">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialData.map((msg) => {
              const isExpanded = expandedId === msg.id;
              return (
                <React.Fragment key={msg.id}>
                  <tr 
                    onClick={() => toggleExpand(msg.id)}
                    className={`cursor-pointer transition-colors group ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                        {msg.full_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Mail size={10} /> {msg.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-slate-800 truncate max-w-[200px]" title={msg.subject}>
                        {msg.subject || <span className="text-slate-400 italic">No Subject</span>}
                      </div>
                      {msg.reason && (
                        <span className="inline-block mt-1 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 capitalize">
                          {msg.reason}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <p className="text-xs text-slate-500 line-clamp-2 max-w-[250px] leading-relaxed">
                        {msg.message}
                      </p>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col text-xs text-slate-500">
                        <span className="font-medium">{new Date(msg.created_at).toLocaleDateString()}</span>
                        <span className="text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top text-right">
                       <button 
                        className={`p-2 rounded-lg border transition-all ${
                          isExpanded 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row Content */}
                  {isExpanded && (
                    <tr className="bg-slate-50 shadow-inner">
                      <td colSpan={5} className="p-0 border-b border-slate-200">
                        <div className="p-6 md:p-8 animate-in fade-in duration-300">
                          <ExpandedMessageDetails msg={msg} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: The Expanded View (Shared) ---

function ExpandedMessageDetails({ msg }: { msg: ContactMessage }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Main Message Content */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare size={14} className="text-purple-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Message</h4>
          </div>
          <div className="p-5">
            <h5 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {msg.subject || 'No Subject'}
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {msg.message}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sidebar: Contact Info & Tech Audit */}
      <div className="space-y-4">
        
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sender Details</h4>
          <div className="space-y-3">
            <InfoRow icon={<Mail size={14} />} label="Email" value={msg.email} />
            <InfoRow icon={<Phone size={14} />} label="Phone" value={msg.mobile_number} />
            <InfoRow icon={<MapPin size={14} />} label="Location" value={[msg.city, msg.state].filter(Boolean).join(', ')} />
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Technical Audit</span>
            <Monitor size={14} className="text-slate-300"/>
          </h4>
          <div className="space-y-3">
            <InfoRow icon={<Globe size={14} />} label="IP Address" value={msg.ip} />
            <InfoRow icon={<Calendar size={14} />} label="Received" value={new Date(msg.created_at).toLocaleString()} />
            
            <div className="pt-3 border-t border-slate-100 mt-3">
               <span className="text-[10px] text-slate-400 block mb-1">User Agent</span>
               <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-500 font-mono break-all leading-tight">
                 {msg.user_agent || 'Unknown UA'}
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="text-slate-400 shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">{label}</span>
        <p className="text-slate-900 font-medium truncate" title={value || ''}>{value || 'N/A'}</p>
      </div>
    </div>
  );
}