"use client";

import React, { useState, useEffect } from 'react';
import { 
  Eye, MapPin, Globe, Monitor, 
  Calendar, Phone, Mail, Box, Search, Filter, 
  ArrowRight, X, Briefcase, Map, CheckCircle, 
  AlertCircle, Home
} from 'lucide-react';
import AdminRemarksList from './AdminRemarksList';

// 1. Updated Interface matching your new Schema
interface Application {
  id: string;
  full_name?: string;
  mobile_number?: string;
  email?: string;
  
  // Specific Address Fields
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Product Fields
  product_category?: string;
  product_type?: string;
  application_stage?: string; // New field
  status?: string;
  source?: string;
  
  // Tech
  ip?: string;
  user_agent?: string;
  created_at?: string;
  
  // Dynamic Data
  metadata?: Record<string, any>;
  [key: string]: any;
}

interface Agent {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  role: string;
}

export default function ApplicationList({ initialData }: { initialData: any[] }) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); 
  const [assigning, setAssigning] = useState<Record<string, boolean>>({}); 

  // ... (Keep existing useEffects for fetching assignments and agents unchanged) ...
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data: { session } } = await (await import('@/config/supabase')).supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/admin/applications/assignments', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!res.ok) return;
        const json = await res.json();
        const map: Record<string, string> = {};
        (json.data || []).forEach((a: any) => { map[a.application_id] = a.agent_user_id });
        setAssignments(map);
      } catch (err) { console.error('Failed to load assignments:', err); }
    }
    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data: { session } } = await (await import('@/config/supabase')).supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/admin/users?role=agent', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!res.ok) return;
        const json = await res.json();
        const agentProfiles = (json.data || []).filter((p: any) => p.role === 'agent');
        setAgents(agentProfiles);
      } catch (err) { console.error('Failed to load agents:', err); }
    };
    fetchAgents();
  }, []);

  const openModal = (app: Application) => {
    setSelectedApp(app);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedApp(null);
    document.body.style.overflow = 'unset';
  };

  const assignApplication = async (appId: string, agentUserId: string) => {
    setAssigning(prev => ({ ...prev, [appId]: true }));
    try {
      const { data: { session } } = await (await import('@/config/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ application_id: appId, agent_user_id: agentUserId })
      });
      if (!res.ok) throw new Error('Failed to assign');
      const json = await res.json();
      if (json.success) setAssignments(prev => ({ ...prev, [appId]: agentUserId }));
    } catch (err) {
      alert('Failed to assign application: ' + (err as Error).message);
    } finally {
      setAssigning(prev => ({ ...prev, [appId]: false }));
    }
  };

  // ... (Keep generic "No applications" view) ...
  if (initialData.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
          <Box className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg">No applications found</h3>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search Bar (Unchanged) */}
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

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {initialData.map((app) => (
            <MobileCard key={app.id} app={app} onViewDetails={() => openModal(app)} />
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Stage/Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialData.map((app) => (
                <DesktopRow key={app.id} app={app} onViewDetails={() => openModal(app)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <DetailsModal 
          app={selectedApp} 
          onClose={closeModal}
          agents={agents}
          onAssign={assignApplication}
          assignments={assignments}
          assigning={assigning}
        />
      )}
    </>
  );
}

// --- SUB-COMPONENTS ---

function MobileCard({ app, onViewDetails }: { app: Application, onViewDetails: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div onClick={onViewDetails} className="p-4 cursor-pointer active:bg-slate-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{app.full_name}</span>
            <span className="text-xs text-slate-500">{new Date(app.created_at || '').toLocaleDateString()}</span>
          </div>
          <StatusBadge status={app.status || 'new'} />
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
           <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                {app.product_type}
            </span>
            <span className="text-xs text-slate-400 capitalize">{app.application_stage || 'started'}</span>
           </div>
          <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
            View <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopRow({ app, onViewDetails }: { app: Application, onViewDetails: () => void }) {
  return (
    <tr onClick={onViewDetails} className="cursor-pointer transition-colors hover:bg-slate-50 group">
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
            {app.city ? `${app.city}, ${app.state}` : 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5 items-start">
            <StatusBadge status={app.status || 'new'} />
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium pl-1">
                Stage: {app.application_stage || 'started'}
            </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 rounded-lg border bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors">
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
}

// --- MODAL & DETAILS ---

function DetailsModal({ app, onClose, agents, onAssign, assignments, assigning }: { app: Application, onClose: () => void, agents: Agent[], onAssign: any, assignments: any, assigning: any }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-start md:items-center justify-center p-4 pt-16 md:pt-20 lg:pt-24">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{app.full_name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Briefcase size={12} />
                <span className="font-medium text-slate-700">{app.product_type}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                 <Calendar size={12} />
                 <span>{new Date(app.created_at || '').toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <ExpandedDetails app={app} agents={agents} onAssign={onAssign} assignments={assignments} assigning={assigning} />
        </div>
      </div>
    </div>
  );
}

function ExpandedDetails({ app, agents, onAssign, assignments, assigning }: { app: Application, agents: Agent[], onAssign: any, assignments: any, assigning: any }) {
  
  // Format Metadata Keys (snake_case to Title Case)
  const formatKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN (Main Info) - Spans 8 cols */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* 1. Agent Assignment Block */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden ring-1 ring-blue-100">
          <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-200 flex items-center gap-2">
            <Globe size={14} className="text-blue-600" />
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Agent Assignment</h4>
          </div>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
             <div className="flex-1">
               <p className="text-sm text-slate-600 mb-1">Current Assignee</p>
               <select
                  value={assignments[app.id] || ''}
                  onChange={(e) => { if (e.target.value) onAssign(app.id, e.target.value); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  disabled={Boolean(assigning[app.id])}
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map(agent => (
                    <option key={agent.user_id} value={agent.user_id}>{agent.full_name || agent.email}</option>
                  ))}
                </select>
             </div>
             {assigning[app.id] && <span className="text-xs text-blue-500 animate-pulse font-medium">Updating...</span>}
          </div>
        </div>

        {/* 2. Structured Application Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader icon={<Briefcase size={14} />} title="Application Details" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
             <DetailItem label="Product Category" value={app.product_category} />
             <DetailItem label="Product Type" value={app.product_type} />
             <DetailItem label="Current Stage" value={app.application_stage} highlight />
             <DetailItem label="Source" value={app.source} />
          </div>
        </div>

        {/* 3. Address & Location (New Schema Fields) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <SectionHeader icon={<Map size={14} />} title="Location & Address" />
           <div className="p-5">
              <div className="flex items-start gap-4">
                 <div className="mt-1 bg-slate-100 p-2 rounded-full text-slate-400">
                    <Home size={18} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                        {app.address_line_1 || <span className="text-slate-400 italic">No street address</span>}
                    </p>
                    {app.address_line_2 && <p className="text-sm text-slate-600">{app.address_line_2}</p>}
                    <p className="text-sm text-slate-600">
                        {[app.city, app.state, app.pincode].filter(Boolean).join(', ')}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* 4. Additional Metadata (Loop) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader icon={<Box size={14} />} title="Additional Form Data" />
          <div className="p-5">
             {app.metadata && Object.keys(app.metadata).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-4">
                  {Object.entries(app.metadata).map(([key, value]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">
                        {formatKey(key)}
                      </span>
                      <span className="text-sm text-slate-800 font-medium break-words block">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 italic text-sm">No extra metadata captured.</p>
                </div>
              )}
          </div>
        </div>

        <AdminRemarksList applicationId={app.id} />
      </div>

      {/* RIGHT COLUMN (Contact & Audit) - Spans 4 cols */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Status</h4>
            <div className="flex justify-between items-center mb-4">
                <StatusBadge status={app.status || 'new'} large />
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                Application is currently in the <strong>{app.application_stage || 'started'}</strong> stage.
            </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h4>
          <div className="space-y-4">
             <ContactRow icon={<Mail size={16} />} label="Email Address" value={app.email} isLink prefix="mailto:" />
             <ContactRow icon={<Phone size={16} />} label="Mobile Number" value={app.mobile_number} isLink prefix="tel:" />
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>System Audit</span>
            <Monitor size={14} className="text-slate-300"/>
          </h4>
          <div className="space-y-4">
            <DetailItem label="IP Address" value={app.ip} small />
            <div className="pt-2 border-t border-slate-100">
               <span className="text-[10px] text-slate-400 block mb-1 font-bold">USER AGENT</span>
               <p className="text-[10px] text-slate-500 font-mono leading-tight break-all">
                 {app.user_agent || 'Unknown'}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER UI COMPONENTS ---

const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
    <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="text-blue-500">{icon}</div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
    </div>
);

const DetailItem = ({ label, value, highlight, small }: { label: string, value: any, highlight?: boolean, small?: boolean }) => (
    <div className="group">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">
        {label}
        </span>
        <span className={`${small ? 'text-xs' : 'text-sm'} ${highlight ? 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold' : 'text-slate-800 font-medium'} break-words`}>
        {value || '—'}
        </span>
    </div>
);

const ContactRow = ({ icon, label, value, isLink, prefix }: { icon: any, label: string, value?: string, isLink?: boolean, prefix?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{label}</p>
            {value ? (
                isLink ? (
                    <a href={`${prefix}${value}`} className="text-sm font-semibold text-blue-600 hover:underline truncate block">
                        {value}
                    </a>
                ) : (
                    <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                )
            ) : (
                <p className="text-sm text-slate-400 italic">Not provided</p>
            )}
        </div>
    </div>
);

function StatusBadge({ status, large }: { status: string, large?: boolean }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30',
    rejected: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30',
    started: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/30',
  };
  const activeClass = styles[status?.toLowerCase()] || styles.new;
  const sizeClass = large ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-wide border ring-1 ring-inset ${activeClass} ${sizeClass}`}>
      <span className={`rounded-full bg-current opacity-50 ${large ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}></span>
      {status || 'New'}
    </span>
  );
}