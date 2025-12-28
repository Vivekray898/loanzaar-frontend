import { serverUrl } from '@/utils/serverUrl';
import UserList from './UserList';
import { ShieldAlert } from 'lucide-react';

export default async function UsersPage() {
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || '';

  // 1. Security Configuration Check
  if (!internalSecret) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="text-red-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Server Misconfiguration</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The <code>INTERNAL_ADMIN_SECRET</code> is missing. User data cannot be loaded securely.
        </p>
      </div>
    );
  }

  // 2. Data Fetching
  const res = await fetch(serverUrl('/api/admin/users'), { 
    cache: 'no-store', 
    headers: { 'x-internal-secret': internalSecret } 
  });

  if (!res.ok) {
    return (
      <div className="p-8 flex items-center justify-center text-red-600 bg-red-50 rounded-xl border border-red-100 m-4">
        Error loading users: Server responded with status {res.status}
      </div>
    );
  }

  const json = await res.json();
  const users = json.data || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            View and manage registered customer profiles.
          </p>
        </div>
        
        {/* Stat Badge */}
        <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm self-start sm:self-auto">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Total Users: <span className="text-slate-900 ml-1">{json.meta?.total || users.length}</span>
          </span>
        </div>
      </div>

      {/* Hand off to Client Component */}
      <UserList initialUsers={users} />
    </div>
  );
}