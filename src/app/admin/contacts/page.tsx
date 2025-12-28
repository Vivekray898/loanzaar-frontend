import { serverUrl } from '@/utils/serverUrl';
import ContactList from './ContactList';
import { ShieldAlert } from 'lucide-react';

export default async function ContactsPage() {
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || '';
  
  // 1. Security Check
  if (!internalSecret) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="text-red-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Configuration Error</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The <code>INTERNAL_ADMIN_SECRET</code> is missing. Unable to load admin data securely.
        </p>
      </div>
    );
  }

  // 2. Data Fetching
  const res = await fetch(serverUrl('/api/admin/contacts'), { 
    cache: 'no-store', 
    headers: { 'x-internal-secret': internalSecret } 
  });

  if (!res.ok) {
    return (
      <div className="p-8 flex items-center justify-center text-red-600 bg-red-50 rounded-xl border border-red-100 m-4">
        System Error: Failed to load messages (Status: {res.status})
      </div>
    );
  }

  const json = await res.json();
  const messages = json.data || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Inbox</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            User inquiries and contact form submissions.
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm self-start sm:self-auto">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Total Messages: <span className="text-slate-900 ml-1">{json.meta?.total || messages.length}</span>
          </span>
        </div>
      </div>

      {/* Client UI */}
      <ContactList initialData={messages} />
    </div>
  );
}