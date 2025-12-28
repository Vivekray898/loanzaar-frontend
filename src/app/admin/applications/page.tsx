import { serverUrl } from '@/utils/serverUrl';
import ApplicationList from './ApplicationList';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export default async function ApplicationsPage() {
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || '';
  
  // 1. Config Check
  if (!internalSecret) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="text-red-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Server Configuration Error</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The <code>INTERNAL_ADMIN_SECRET</code> environment variable is missing. 
          Security protocols prevent loading this data.
        </p>
      </div>
    );
  }

  // 2. Data Fetching
  const res = await fetch(serverUrl('/api/admin/applications'), { 
    cache: 'no-store', 
    headers: { 'x-internal-secret': internalSecret } 
  });
  
  if (!res.ok) {
    return (
      <div className="p-8 flex items-center justify-center text-red-600 bg-red-50 rounded-xl border border-red-100 m-4">
        Failed to load applications (System Status: {res.status})
      </div>
    );
  }

  const json = await res.json();
  const apps = json.data || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Loan Applications</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Review and manage incoming loan requests.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {json.meta?.total || apps.length} Records
          </span>
          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-200 rounded-full shadow-sm">
             <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <ApplicationList initialData={apps} />
    </div>
  );
}