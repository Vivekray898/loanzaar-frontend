'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Clock, CheckCircle, MessageSquare, PlusCircle, TrendingUp } from 'lucide-react';
import UserSupportChat from '../components/UserSupportChat';
// DashboardSidebar removed; layout wrapper handles sidebar
import { auth } from '../config/firebase';

function UserDashboardPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedLoans: 0,
    totalMessages: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    // Simplified initialization - just load default stats
    // The backend API call has been removed since you're using Firebase auth directly
    console.log('📊 Dashboard initialized with default stats');
    setLoading(false);
  }, []);

  // Note: Backend API calls removed - using Firebase authentication directly
  // If you need to fetch data from backend in the future, implement it here with Firebase tokens

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: FileText,
      label: 'Total Applications',
      value: stats?.totalApplications || 0,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Pending Applications',
      value: stats?.pendingApplications || 0,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      icon: CheckCircle,
      label: 'Approved Loans',
      value: stats?.approvedLoans || 0,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: MessageSquare,
      label: 'Support Messages',
      value: stats?.totalMessages || 0,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Render support chat if activeTab is support
  if (activeTab === 'support') {
    return (
      <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={20} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'support'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={20} />
            Support & Help
          </button>
        </div>
        <UserSupportChat />
      </div>
    );
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <Meta title="Dashboard | Loanzaar" description="Your LoanZaar dashboard with application summary, support and recent activity." />
            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6 flex-wrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <TrendingUp size={20} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'support'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <MessageSquare size={20} />
                Support & Help
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{card.label}</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-2">{card.value}</h3>
                      </div>
                      <div className={`${card.bgColor} p-4 rounded-xl`}>
                        <Icon className={`w-8 h-8 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apply for New Loan */}
              <Link
                href="/dashboard/apply-loan"
                className="group bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Apply for a New Loan</h3>
                    <p className="text-sky-100 mt-1">Start your loan application journey</p>
                  </div>
                </div>
              </Link>

              {/* Loan Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Loan Progress</h3>
                    <p className="text-slate-600 mt-1">{stats?.approvedLoans || 0} loans approved</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Application Success Rate</span>
                    <span>
                      {stats?.totalApplications > 0 
                        ? Math.round((stats.approvedLoans / stats.totalApplications) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.totalApplications > 0 
                          ? (stats.approvedLoans / stats.totalApplications) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">My Applications</h2>
                <Link
                  href="/dashboard/applications"
                  className="text-sky-600 hover:text-sky-700 font-semibold text-sm"
                >
                  View All →
                </Link>
              </div>

              {recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Type</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Details</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((application) => (
                        <tr key={application._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-medium text-slate-800">
                            {application.type === 'loan' ? 'Loan' : 'Insurance'}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            {application.type === 'loan'
                              ? `${application.loanType} - ₹${application.loanAmount?.toLocaleString()}`
                              : `${application.insuranceType} - ₹${application.coverageAmount || 'N/A'}`}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No applications yet</p>
                  <Link
                    href="/dashboard/apply-loan"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Apply for Your First Loan or Insurance
                  </Link>
                </div>
              )}
            </div>
    </div>
    );
  }

export default UserDashboardPage;

