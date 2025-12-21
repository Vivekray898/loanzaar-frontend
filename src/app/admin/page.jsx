'use client'

import React, { useState } from 'react'
import { 
  Users, 
  FileText, 
  LifeBuoy, 
  TrendingUp, 
  Plus, 
  Search, 
  Bell, 
  Menu,
  X,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react'

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)

  // --- Dummy Data ---
  const [stats] = useState([
    { title: 'Total Users', value: '2,543', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Applications', value: '145', change: '+5%', icon: FileText, color: 'bg-emerald-500' },
    { title: 'Pending Tickets', value: '12', change: '-2%', icon: LifeBuoy, color: 'bg-orange-500' },
    { title: 'Total Revenue', value: '₹12.4L', change: '+18%', icon: TrendingUp, color: 'bg-purple-500' },
  ])

  const [applications, setApplications] = useState([
    { id: 'APP-001', user: 'Rahul Verma', type: 'Home Loan', amount: '₹45,00,000', status: 'Pending', date: '2023-10-24' },
    { id: 'APP-002', user: 'Sneha Gupta', type: 'Personal Loan', amount: '₹5,00,000', status: 'Approved', date: '2023-10-23' },
    { id: 'APP-003', user: 'Amit Kumar', type: 'Car Loan', amount: '₹12,00,000', status: 'Rejected', date: '2023-10-22' },
    { id: 'APP-004', user: 'Priya Singh', type: 'Gold Loan', amount: '₹2,00,000', status: 'Pending', date: '2023-10-21' },
  ])

  const [tickets] = useState([
    { id: 'TKT-101', user: 'Rahul Verma', subject: 'Document Upload Issue', priority: 'High' },
    { id: 'TKT-102', user: 'John Doe', subject: 'Login Error', priority: 'Medium' },
  ])

  // --- Actions ---

  // 1. Change Status Logic
  const cycleStatus = (id) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        if (app.status === 'Pending') return { ...app, status: 'Approved' }
        if (app.status === 'Approved') return { ...app, status: 'Rejected' }
        return { ...app, status: 'Pending' }
      }
      return app
    }))
  }

  // 2. Create Application Logic (Dummy)
  const handleCreateApplication = (e) => {
    e.preventDefault()
    const newApp = {
      id: `APP-${Math.floor(Math.random() * 1000)}`,
      user: e.target.username.value,
      type: e.target.type.value,
      amount: `₹${e.target.amount.value}`,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    }
    setApplications([newApp, ...applications])
    setIsAppModalOpen(false)
    alert(`Application Created for ${newApp.user}`)
  }

  // Helper for status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* --- Sidebar (Desktop) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold mr-3">L</div>
          <span className="text-xl font-bold">AdminPanel</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-slate-400"><X /></button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem icon={TrendingUp} label="Dashboard" active />
          <NavItem icon={Users} label="User Management" />
          <NavItem icon={FileText} label="Applications" />
          <NavItem icon={LifeBuoy} label="Support Tickets" />
          <div className="pt-4 border-t border-slate-800 mt-4">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Settings</p>
            <NavItem icon={Settings} label="Configuration" />
          </div>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-500"><Menu /></button>
          
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-full max-w-md mx-4">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input type="text" placeholder="Search users, loans, tickets..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <button 
              onClick={() => setIsAppModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Application
            </button>
          </div>

          {/* 1. Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-${stat.color.replace('bg-', '')}`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color.replace('bg-', '')}-600`} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 2. Recent Applications Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Recent Applications</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Applicant</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {app.user}
                          <div className="text-xs text-slate-500">{app.id}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{app.type}</td>
                        <td className="px-6 py-4 font-mono text-slate-700">{app.amount}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => cycleStatus(app.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}
                          >
                            {app.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600"><MoreVertical className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Ticket Raising / Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Support Tickets</h3>
                <button className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">+ New</button>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-5 w-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {ticket.user.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-500">{ticket.user}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                 <button className="w-full py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-white hover:border-blue-300 transition-all">
                    View All Tickets
                 </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- Create Application Modal --- */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Create New Application</h3>
              <button onClick={() => setIsAppModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateApplication} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Name</label>
                <input name="username" required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter user name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loan Type</label>
                <select name="type" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option>Personal Loan</option>
                  <option>Home Loan</option>
                  <option>Car Loan</option>
                  <option>Business Loan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input name="amount" type="number" required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="500000" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </a>
  )
}

// Icon for Settings
function Settings({className}) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
}