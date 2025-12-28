"use client";

import React, { useState } from 'react';
import { 
  Eye, MapPin, Globe, Monitor, ChevronDown, ChevronUp, 
  Calendar, Phone, Mail, Box, Search, Filter, ArrowRight 
} from 'lucide-react';

interface Application {
  id: string;
  full_name?: string;
  mobile_number?: string;
  email?: string;
  product_category?: string;
  product_type?: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export default function ApplicationList({ initialData }: { initialData: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Empty State
  if (initialData.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
          <Box className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg">No applications found</h3>
        <p className="text-slate-500 text-sm mt-1">New applications will appear here instantly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Toolbar / Search (Visual Only for UI) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* --- MOBILE VIEW: Cards (< 768px) --- */}
      <div className="md:hidden space-y-3">
        {initialData.map((app) => (
          <MobileCard 
            key={app.id} 
            app={app} 
            isExpanded={expandedId === app.id} 
            onToggle={() => toggleExpand(app.id)} 
          />
        ))}
      </div>

      {/* --- DESKTOP VIEW: Table (>= 768px) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold">Applicant</th>
              <th className="px-6 py-4 font-semibold">Product Info</th>
              <th className="px-6 py-4 font-semibold">Context</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialData.map((app) => (
              <DesktopRow 
                key={app.id} 
                app={app} 
                isExpanded={expandedId === app.id} 
                onToggle={() => toggleExpand(app.id)} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENTS (To keep main logic clean)
   ========================================================================= */

// 1. MOBILE CARD COMPONENT
function MobileCard({ app, isExpanded, onToggle }: { app: any, isExpanded: boolean, onToggle: () => void }) {
  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 shadow-sm'}`}>
      <div onClick={onToggle} className="p-4 cursor-pointer active:bg-slate-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{app.full_name}</span>
            <span className="text-xs text-slate-500">{new Date(app.created_at).toLocaleDateString()}</span>
          </div>
          <StatusBadge status={app.status} />
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
              {app.product_type}
            </span>
          </div>
          <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
            {isExpanded ? 'Close' : 'View Details'} {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2">
          <ExpandedDetails app={app} />
        </div>
      )}
    </div>
  );
}

// 2. DESKTOP ROW COMPONENT
function DesktopRow({ app, isExpanded, onToggle }: { app: any, isExpanded: boolean, onToggle: () => void }) {
  return (
    <>
      <tr 
        onClick={onToggle}
        className={`cursor-pointer transition-colors group ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
      >
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{app.full_name}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <Phone size={10} /> {app.mobile_number}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col items-start gap-1">
            <span className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold uppercase tracking-wide shadow-sm">
              {app.product_type}
            </span>
            <span className="text-xs text-slate-500 capitalize pl-1">
              {app.product_category}
            </span>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              {app.city || 'N/A'}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              {new Date(app.created_at).toLocaleDateString()}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <StatusBadge status={app.status} />
        </td>

        <td className="px-6 py-4 text-right">
          <button 
            className={`p-2 rounded-lg border transition-all ${
              isExpanded 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-slate-50 shadow-inner">
          <td colSpan={5} className="p-0 border-b border-slate-200">
            <div className="p-6 md:p-8 animate-in fade-in duration-300">
              <ExpandedDetails app={app} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// 3. THE SHARED DETAILS VIEW (Used in both Mobile & Desktop)
function ExpandedDetails({ app }: { app: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Primary Data */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Box size={14} className="text-blue-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Data</h4>
          </div>
          <div className="p-5">
             {app.metadata && Object.keys(app.metadata).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  {Object.entries(app.metadata).map(([key, value]) => (
                    <div key={key} className="group">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block group-hover:text-blue-500 transition-colors">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 italic text-sm">No specific metadata captured for this application.</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Sidebar: Contact & Tech */}
      <div className="space-y-4">
        {/* Contact Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Details</h4>
          <div className="space-y-3">
             <InfoItem icon={<Mail size={14} />} label="Email" value={app.email} />
             <InfoItem icon={<Phone size={14} />} label="Mobile" value={app.mobile_number} />
             <InfoItem icon={<MapPin size={14} />} label="City" value={app.city} />
          </div>
        </div>

        {/* Audit Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Audit Trail</span>
            <Monitor size={14} className="text-slate-300"/>
          </h4>
          <div className="space-y-3">
            <InfoItem icon={<Globe size={14} />} label="Source" value={app.source} />
            <InfoItem icon={<Monitor size={14} />} label="IP Addr" value={app.ip} />
            <div className="pt-3 border-t border-slate-100 mt-3">
               <span className="text-[10px] text-slate-400 block mb-1">User Agent</span>
               <p className="text-[10px] text-slate-600 leading-tight line-clamp-2" title={app.user_agent}>
                 {app.user_agent || 'Unknown'}
               </p>
            </div>
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors">
             View Full JSON <ArrowRight size={12} />
          </button>
        </div>
      </div>

    </div>
  );
}

// 4. HELPER: STATUS BADGE
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
    rejected: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
  };
  
  const statusKey = status?.toLowerCase() || 'new';
  const activeClass = styles[statusKey] || styles.new;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ring-1 ring-inset ${activeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusKey === 'approved' ? 'bg-emerald-500' : statusKey === 'rejected' ? 'bg-red-500' : 'bg-current opacity-50'}`}></span>
      {status}
    </span>
  );
}

// 5. HELPER: INFO ROW
function InfoItem({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-slate-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-medium truncate" title={String(value)}>{value || 'N/A'}</p>
      </div>
    </div>
  );
}