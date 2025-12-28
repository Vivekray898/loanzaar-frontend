import { FileText, Clock, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react'
import { serverUrl } from '@/utils/serverUrl'

export default async function AgentDashboard() {
  const internalSecret = process.env.INTERNAL_ADMIN_SECRET || ''

  // Fetch agent stats
  let stats = { assigned: 0, pending: 0 }

  if (internalSecret) {
    try {
      const res = await fetch(serverUrl('/api/agent/stats'), {
        cache: 'no-store',
        headers: { 'x-internal-secret': internalSecret }
      })

      if (res.ok) {
        const json = await res.json()
        if (json?.success) {
          stats = json.data
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{currentDate}</div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, Agent</h1>
           <p className="text-slate-500 mt-1">Here is what’s happening with your applications today.</p>
        </div>
        <div className="hidden md:block">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
           </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Assigned */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 transition-transform hover:scale-[1.01]">
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-100 mb-2">
                 <FileText size={18} />
                 <span className="text-sm font-medium">Total Assigned</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold">{stats.assigned}</div>
              <div className="mt-4 text-xs font-medium bg-white/10 inline-block px-2 py-1 rounded">
                 Lifetime
              </div>
           </div>
           <FileText className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 rotate-12" />
        </div>

        {/* Card 2: Pending */}
        <div className="relative overflow-hidden bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-amber-300 transition-colors group">
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-amber-600 transition-colors">
                 <Clock size={18} />
                 <span className="text-sm font-medium">Pending Review</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-slate-900">{stats.pending}</div>
              <div className="mt-4 text-xs text-amber-600 font-medium flex items-center gap-1">
                 <TrendingUp size={12} /> Needs Attention
              </div>
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
           </div>
        </div>

        {/* Card 3: Action Placeholder (or Completed) */}
        <div className="relative overflow-hidden bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-green-300 transition-colors group">
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-green-600 transition-colors">
                 <CheckCircle2 size={18} />
                 <span className="text-sm font-medium">Action Required</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-slate-900">{stats.pending > 0 ? stats.pending : 0}</div>
              <p className="mt-4 text-xs text-slate-400">Applications waiting for update</p>
           </div>
        </div>
      </div>

      {/* 3. Quick Actions & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/agent/applications"
              className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl border border-slate-200 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-sm">View Applications</div>
                    <div className="text-xs text-slate-400 group-hover:text-blue-400">Manage assigned loans</div>
                 </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </a>
            
             {/* Placeholder for future action */}
             <div className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
                    <TrendingUp size={20} />
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-sm text-slate-500">View Reports</div>
                    <div className="text-xs text-slate-400">Coming soon</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Tips / Sidebar */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 md:p-8 relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-white font-bold text-lg mb-2">Agent Tips</h3>
              <ul className="space-y-3 text-sm">
                 <li className="flex gap-2">
                    <span className="text-blue-400">•</span> Review metadata for user device info.
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-400">•</span> Update status promptly after calling.
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-400">•</span> Check remarks history before action.
                 </li>
              </ul>
           </div>
           {/* Decorative background circle */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 rounded-full opacity-20 blur-2xl"></div>
        </div>
      </div>
    </div>
  )
}