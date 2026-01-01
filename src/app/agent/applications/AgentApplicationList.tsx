'use client'

import React, { useState } from 'react'
import { 
  Calendar, Phone, Mail, MapPin, Search, Filter, 
  Box, FileText, ShieldAlert, Eye, X, Globe, Monitor 
} from 'lucide-react'
import RemarksList from './RemarksList'
import { useAuth } from '@/context/AuthContext'
import { useSignInModal } from '@/context/SignInModalContext'

interface Application {
  id: string
  full_name?: string
  mobile_number?: string
  email?: string
  product_category?: string;
  product_type?: string
  status?: string
  created_at?: string
  [key: string]: any
}

export default function AgentApplicationList({ initialData }: { initialData: Application[] }) {
  // CHANGED: Track selected app object for Modal instead of ID for expansion
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [apps, setApps] = useState<Application[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Status history state
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Fetch assigned applications — wait for AuthContext to confirm session & role
  const { isAuthenticated, loading: authLoading, role, checkSession } = useAuth();
  const { open: openSignIn } = useSignInModal();

  React.useEffect(() => {
    if (initialData && initialData.length > 0) return

    let cancelled = false;

    const fetchAssigned = async () => {
      setLoading(true)
      setError(null)

      try {
        // Wait for auth to settle
        if (authLoading) {
          // Wait up to a short timeout for auth to finish
          const start = Date.now();
          while (authLoading && Date.now() - start < 4000) {
            await new Promise(r => setTimeout(r, 100));
          }
        }

        // If not authenticated, attempt to restore via checkSession
        if (!isAuthenticated) {
          const restored = await checkSession();
          if (!restored) {
            // Show sign-in modal for guests
            try { openSignIn('/agent/applications'); } catch (e) { window.location.href = '/?modal=login&next=' + encodeURIComponent('/agent/applications'); }
            setLoading(false)
            return
          }
        }

        // Confirm role
        if (role !== 'agent') {
          setError('Insufficient permissions to view agent applications');
          setLoading(false);
          return
        }

        const res = await fetch('/api/agent/applications', {
          credentials: 'include'
        })

        if (!res.ok) {
          try {
            const j = await res.json()
            setError(j?.error || `Failed to load applications (Status: ${res.status})`)
          } catch (e) {
            setError(`Failed to load applications (Status: ${res.status})`)
          }
          return
        }

        const json = await res.json()
        if (!cancelled) setApps(json.data || [])
      } catch (err: any) {
        setError(err?.message || 'Failed to load applications')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAssigned()

    return () => { cancelled = true }
  }, [initialData, isAuthenticated, authLoading, role])

  // Fetch status history when an application is selected
  React.useEffect(() => {
    if (!selectedApp?.id) {
      setStatusHistory([])
      return
    }

    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const res = await fetch(`/api/admin/applications/${selectedApp.id}/history`, {
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to fetch history')
        const json = await res.json()
        setStatusHistory(json.data || [])
      } catch (err) {
        console.error('Failed to load status history:', err)
        setStatusHistory([])
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [selectedApp?.id])

  const filteredApps = apps.filter(app =>
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.mobile_number?.includes(searchTerm)
  )

  // Handlers for Modal
  const openModal = (app: Application) => {
    setSelectedApp(app)
    document.body.style.overflow = 'hidden' // Lock background scroll
  }

  const closeModal = () => {
    setSelectedApp(null)
    document.body.style.overflow = 'unset' // Unlock scroll
  }

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/agent/applications/${appId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json?.error || 'Failed to update status')
      }

      const json = await res.json()
      const updated = json.data

      // Update local state
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a))
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: updated.status } : prev)
        // Refetch history
        const historyRes = await fetch(`/api/admin/applications/${appId}/history`, {
          credentials: 'include'
        })
        const historyJson = await historyRes.json()
        if (historyJson.success) setStatusHistory(historyJson.data || [])
      }

      alert('Status updated successfully! Awaiting admin approval.')
    } catch (err: any) {
      alert('Failed to update status: ' + err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="text-red-600" size={28} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Unable to load applications</h3>
        <p className="text-slate-500 mt-2 max-w-md">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
        <div className="inline-flex bg-slate-50 p-3 rounded-full mb-3">
          <FileText className="text-slate-400 animate-pulse" size={26} />
        </div>
        <p className="text-slate-500 text-sm">Loading applications…</p>
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="inline-flex bg-slate-50 p-4 rounded-full mb-4">
          <FileText className="text-slate-400" size={32} />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg">No Applications Assigned</h3>
        <p className="text-slate-500 text-sm mt-1">Check back soon for applications assigned to you.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            No applications match "{searchTerm}"
          </div>
        ) : (
          <>
            {/* --- MOBILE VIEW: Cards (< 768px) --- */}
            <div className="md:hidden space-y-3">
              {filteredApps.map((app) => (
                <MobileCard
                  key={app.id}
                  app={app}
                  onView={() => openModal(app)}
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
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Applied On</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <DesktopRow
                      key={app.id}
                      app={app}
                      onView={() => openModal(app)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* --- MODAL POPUP --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Panel */}
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedApp.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-medium">{selectedApp.product_type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{new Date(selectedApp.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50">
              
              {/* Status Update Section */}
              <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden ring-1 ring-blue-100">
                <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-200">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Update Application Status</h4>
                </div>
                <StatusUpdateForm 
                  appId={selectedApp.id}
                  currentStatus={selectedApp.status}
                  onUpdate={handleStatusUpdate}
                  updating={updatingStatus}
                  metadata={selectedApp.metadata}
                />
              </div>

              {/* Info Grid */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Application Details</h4>
                <ApplicationDetails app={selectedApp} />
              </div>

              {/* Status History */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status History</h4>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  {loadingHistory ? (
                    <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
                  ) : statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {statusHistory.map((log: any) => (
                        <div key={log.id} className="border-l-2 border-slate-200 pl-4 pb-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              {log.action === 'proposed' && <span className="text-xs text-blue-600 font-bold">📝 PROPOSED</span>}
                              {log.action === 'approved' && <span className="text-xs text-green-600 font-bold">✓ APPROVED</span>}
                              {log.action === 'rejected' && <span className="text-xs text-red-600 font-bold">✗ REJECTED</span>}
                              <span className="text-xs text-slate-400">by {log.actor?.full_name || 'Unknown'} ({log.actor_role})</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{log.from_status}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-medium">{log.to_status}</span>
                          </div>
                          {log.reason && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                              <strong>Reason:</strong> {log.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No status changes yet</p>
                  )}
                </div>
              </div>

              {/* Remarks Section */}
              <RemarksList applicationId={selectedApp.id} />
              
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// --- SUB-COMPONENTS ---

function MobileCard({ app, onView }: { app: Application, onView: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div onClick={onView} className="p-4 cursor-pointer active:bg-slate-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{app.full_name}</span>
            <span className="text-xs text-slate-500">{new Date(app.created_at || '').toLocaleDateString()}</span>
          </div>
          <StatusBadge status={app.status} />
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
            {app.product_type}
          </span>
          <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
            View Details <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DesktopRow({ app, onView }: { app: Application, onView: () => void }) {
  return (
    <tr 
      onClick={onView}
      className="cursor-pointer transition-colors hover:bg-slate-50 group"
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
        <div className="flex flex-col gap-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-slate-400" />
            {app.email || 'N/A'}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            {app.city || 'N/A'}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-xs text-slate-500">
        {new Date(app.created_at || '').toLocaleDateString()}
      </td>

      <td className="px-6 py-4 text-right">
        <button 
          className="p-2 rounded-lg border bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <Eye size={16} />
        </button>
      </td>
    </tr>
  )
}

function ApplicationDetails({ app }: { app: Application }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
          <Mail size={12} /> Email
        </label>
        <p className="text-sm text-slate-900 font-medium mt-1 break-all">{app.email || 'N/A'}</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
           <Phone size={12} /> Phone
        </label>
        <p className="text-sm text-slate-900 font-medium mt-1">{app.mobile_number || 'N/A'}</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
           <MapPin size={12} /> City
        </label>
        <p className="text-sm text-slate-900 font-medium mt-1">{app.city || 'N/A'}</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
           <FileText size={12} /> Status
        </label>
        <div className="mt-1">
          <StatusBadge status={app.status} />
        </div>
      </div>
      
      {/* Meta Data */}
      <div className="sm:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
         <div>
            <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
               <Globe size={12} /> Source
            </label>
            <p className="text-xs text-slate-600 mt-1 font-mono">{app.source || 'website'}</p>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
               <Monitor size={12} /> IP
            </label>
            <p className="text-xs text-slate-600 mt-1 font-mono">{app.ip || '—'}</p>
         </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_admin_approval: 'bg-purple-50 text-purple-700 border-purple-200',
    contacted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    docs_collected: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    eligible: 'bg-green-50 text-green-700 border-green-200',
    recommended: 'bg-teal-50 text-teal-700 border-teal-200',
  }

  const statusKey = status?.toLowerCase() || 'new'
  const activeClass = styles[statusKey] || styles.new

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${activeClass}`}>
      {status || 'New'}
    </span>
  )
}

function StatusUpdateForm({ 
  appId, 
  currentStatus, 
  onUpdate, 
  updating,
  metadata 
}: { 
  appId: string
  currentStatus?: string
  onUpdate: (id: string, status: string) => void
  updating: boolean
  metadata?: Record<string, any>
}) {
  const [selectedStatus, setSelectedStatus] = useState('')

  const allowedStatuses = [
    { value: 'contacted', label: 'Contacted' },
    { value: 'docs_collected', label: 'Documents Collected' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'recommended', label: 'Recommended' }
  ]

  const isPendingApproval = currentStatus === 'pending_admin_approval'
  const needsRevision = metadata?.needs_revision === true
  const proposedStatus = metadata?.agent_proposed_status
  const rejectionReason = metadata?.admin_rejection_reason

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm text-slate-600 mb-2 block">Current Status</label>
        <StatusBadge status={currentStatus} />
        
        {isPendingApproval && proposedStatus && (
          <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
            ⏳ Proposed status: <strong>{proposedStatus}</strong> (awaiting admin approval)
          </div>
        )}

        {needsRevision && rejectionReason && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            ❌ Admin rejected: {rejectionReason}
          </div>
        )}
      </div>

      {!isPendingApproval && (
        <>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Update to New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              disabled={updating}
            >
              <option value="">-- Select Status --</option>
              {allowedStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => selectedStatus && onUpdate(appId, selectedStatus)}
            disabled={!selectedStatus || updating}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {updating ? 'Updating...' : 'Submit for Admin Approval'}
          </button>

          <p className="text-xs text-slate-500 italic">
            Note: Status changes will be submitted to admin for approval before being finalized.
          </p>
        </>
      )}
    </div>
  )
}