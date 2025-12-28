"use client";

import React, { useState, useMemo } from 'react';
import { 
  User, MapPin, Phone, Mail, Calendar, ShieldCheck, 
  Search, Filter, MoreHorizontal, Clock, Copy 
} from 'lucide-react';

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin';
}

export default function UserList({ initialUsers }: { initialUsers: UserData[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleChangeRole = async (targetUser: UserData, newRole: 'user' | 'admin') => {
    if (targetUser.role === newRole) return;
    if (!confirm(`Change role of ${targetUser.full_name || targetUser.email} to ${newRole}?`)) return;

    const oldRole = targetUser.role;
    setUpdatingUserId(targetUser.id);

    try {
      // optimistic update
      setUsers(prev => prev.map(u => u.user_id === targetUser.user_id ? { ...u, role: newRole } : u));

      const { data } = await (await import('@/config/supabase')).supabase.auth.getSession();
      const token = data?.session?.access_token;

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ user_id: targetUser.user_id, role: newRole })
      });

      if (!res.ok) throw new Error('Server error');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');

      // update from server result
      setUsers(prev => prev.map(u => u.user_id === targetUser.user_id ? { ...u, role: json.data.role } : u));
    } catch (e) {
      alert('Failed to change role. ' + (e as Error).message);
      setUsers(prev => prev.map(u => u.user_id === targetUser.user_id ? { ...u, role: oldRole } : u));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  // Empty State
  if (initialUsers.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
          <User className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg">No users found</h3>
        <p className="text-slate-500 text-sm mt-1">The user database is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
          No matches found for "{searchTerm}"
        </div>
      ) : (
        <>
          {/* --- MOBILE VIEW: Grid of Cards (< 768px) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <MobileUserCard key={user.id} user={user} onChangeRole={handleChangeRole} busy={updatingUserId === user.id} />
            ))}
          </div>

          {/* --- DESKTOP VIEW: Table (>= 768px) --- */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Profile</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Timeline</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <DesktopUserRow key={user.id} user={user} onChangeRole={handleChangeRole} busy={updatingUserId === user.id} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENTS
   ========================================================================= */

function MobileUserCard({ user, onChangeRole, busy }: { user: UserData, onChangeRole: (u: UserData, role: 'user'|'admin') => Promise<void>, busy?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar url={user.photo_url} alt={user.full_name} size="md" />
          <div>
            <h3 className="font-bold text-slate-900">{user.full_name || 'Unnamed User'}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-medium">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleSelector user={user} onChange={onChangeRole} busy={busy} />
          <button className="text-slate-400 p-1 hover:bg-slate-50 rounded">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <InfoItem icon={<Mail size={14} />} text={user.email} />
        <InfoItem icon={<Phone size={14} />} text={user.phone} />
        <InfoItem icon={<MapPin size={14} />} text={user.address} />
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} />
          Joined {new Date(user.created_at).toLocaleDateString()}
        </div>
        <button className="text-blue-600 font-medium hover:underline">
          View Profile
        </button>
      </div>
    </div>
  );
}

function DesktopUserRow({ user, onChangeRole, busy }: { user: UserData, onChangeRole: (u: UserData, role: 'user'|'admin') => Promise<void>, busy?: boolean }) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      {/* Profile */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar url={user.photo_url} alt={user.full_name} size="sm" />
          <div>
            <div className="font-bold text-slate-900 text-sm">{user.full_name || 'Unnamed'}</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 group-hover:text-blue-500 transition-colors cursor-pointer" title="Copy ID">
               ID: {user.user_id?.split('-')[0]}...
            </div>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={12} className="text-slate-400" />
            {user.email || <span className="italic text-slate-300">No Email</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={12} className="text-slate-400" />
            {user.phone || <span className="italic text-slate-300">No Phone</span>}
          </div>
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-4">
        <div className="flex items-start gap-2 max-w-[180px]">
          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-600 leading-snug">
            {user.address || <span className="italic text-slate-300">Not provided</span>}
          </span>
        </div>
      </td>

      {/* Timeline */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5" title="Date Joined">
            <Calendar size={12} className="text-slate-400" /> 
            {new Date(user.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400" title="Last Updated">
            <Clock size={12} /> 
            {new Date(user.updated_at).toLocaleDateString()}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                Active
            </span>
            <RoleSelector user={user} onChange={onChangeRole} busy={busy} />
            <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
                <MoreHorizontal size={16} />
            </button>
        </div>
      </td>
    </tr>
  );
}

// --- HELPER COMPONENTS ---

function Avatar({ url, alt, size }: { url?: string, alt?: string, size: 'sm' | 'md' }) {
  const sizeClasses = size === 'md' ? 'w-10 h-10' : 'w-9 h-9';
  
  if (url) {
    return (
      <img 
        src={url} 
        alt={alt || 'User'} 
        className={`${sizeClasses} rounded-full object-cover border border-slate-200 shadow-sm`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200`}>
      <User size={size === 'md' ? 20 : 16} />
    </div>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode, text?: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
      <span className="truncate w-full">{text}</span>
    </div>
  );
}

function RoleSelector({ user, onChange, busy }: { user: UserData, onChange: (u: UserData, role: 'user'|'admin') => Promise<void>, busy?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (newRole: 'user'|'admin') => {
    if (user.role === newRole) return;
    setLoading(true);
    try {
      await onChange(user, newRole);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <select
        value={user.role || 'user'}
        onChange={(e) => handleChange(e.target.value as 'user' | 'admin')}
        disabled={loading || busy}
        className="text-sm rounded-md border border-slate-200 px-2 py-1 bg-white"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}