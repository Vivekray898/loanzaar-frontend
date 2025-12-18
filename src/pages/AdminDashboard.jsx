'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import AdminSidebar from '../components/AdminSidebar';
import AdminAuthGuard from '../components/AdminAuthGuard';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  Users, 
  FileText, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Shield
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { authenticatedFetch as fetchWithFirebaseToken } from '../utils/supabaseTokenHelper';
import LoanApplicationsTab from '../components/LoanApplicationsTab';
import InsuranceApplicationsTab from '../components/InsuranceApplicationsTab';
import SupportCenter from '../components/SupportCenter';
import AdminCollectionDashboard from '../components/admin/AdminCollectionDashboard';
import { ToastProvider } from '../context/ToastContext';

function AdminDashboard() {
  const { loading: authLoading } = useAdminAuth(); // ✅ Get Firebase auth loading state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [collectionsData, setCollectionsData] = useState({
    admin_loans: [],
    admin_insurance: [],
    admin_messages: [],
    admin_users: [],
    cibil_score: [],
    insurance_applications: [],
    loan_applications: [],
    other_data: []
  });

  // ✅ CRITICAL: Only fetch dashboard stats AFTER Firebase auth is ready
  useEffect(() => {
    if (!authLoading) {
      console.log('✅ Auth ready - now safe to fetch dashboard stats');
      fetchDashboardStats();
      fetchAllCollectionsData();
    } else {
      console.log('⏳ Waiting for Firebase auth to initialize before fetching stats...');
    }
  }, [authLoading]); // ✅ Re-run when authLoading changes

  // Add a refresh button effect
  useEffect(() => {
    console.log('📊 Collections data updated:', collectionsData);
  }, [collectionsData]);

  const fetchAllCollectionsData = async () => {
    try {
      console.log('📊 Fetching all collections data via backend...');
      const collections = ['admin_loans', 'admin_insurance', 'admin_messages', 'admin_users', 'cibil_score', 'insurance_applications', 'loan_applications', 'other_data'];
      
      const allData = {};
      for (const collectionName of collections) {
        try {
          console.log(`⏳ Fetching ${collectionName}...`);
          const response = await fetchWithFirebaseToken(`/admin/collections/${collectionName}`);
          
          if (response.ok) {
            const result = await response.json();
            allData[collectionName] = result.data || [];
            console.log(`✅ ${collectionName}: ${allData[collectionName].length} documents`);
          } else {
            console.warn(`⚠️ ${collectionName}: Failed with status ${response.status}`);
            allData[collectionName] = [];
          }
        } catch (err) {
          console.error(`❌ Error fetching ${collectionName}:`, err);
          allData[collectionName] = [];
        }
      }
      console.log('📊 All collections fetched:', allData);
      setCollectionsData(allData);
    } catch (err) {
      console.error('❌ Error fetching collections data:', err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      // Use fetchWithFirebaseToken to automatically include Firebase token
      // Note: API_BASE_URL already includes '/api', so use '/admin/stats' not '/api/admin/stats'
      const response = await fetchWithFirebaseToken('/admin/stats');

      // Check if response is ok
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || `Failed to fetch statistics (${response.status})`);
        // Show dashboard with placeholder data even if stats fail to load
        setStats({
          overview: { totalUsers: 0, totalLoans: 0, totalInsurance: 0, totalRevenue: 0 },
          loansByType: [],
          loansByStatus: [],
          monthlyLoans: [],
          recentLoans: []
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch statistics');
        // Show dashboard with placeholder data
        setStats({
          overview: { totalUsers: 0, totalLoans: 0, totalInsurance: 0, totalRevenue: 0 },
          loansByType: [],
          loansByStatus: [],
          monthlyLoans: [],
          recentLoans: []
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Show dashboard with placeholder data even if fetch fails
      setStats({
        overview: { totalUsers: 0, totalLoans: 0, totalInsurance: 0, totalRevenue: 0 },
        loansByType: [],
        loansByStatus: [],
        monthlyLoans: [],
        recentLoans: []
      });
      setError('Backend service temporarily unavailable. Showing placeholder data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  // Prepare chart data
  const loanTypeData = stats?.loansByType?.map(item => ({
    name: item._id,
    value: item.count,
    amount: item.totalAmount
  })) || [];

  const statusData = stats?.loansByStatus?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];

  const monthlyData = stats?.monthlyLoans?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    count: item.count,
    amount: item.totalAmount / 100000 // Convert to lakhs
  })) || [];

  // Render different sections based on activeSection state
  if (activeSection === 'loans') {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <LoanApplicationsTab />
          </div>
        </div>
      </div>
    );
  }
  
  if (activeSection === 'insurance') {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <InsuranceApplicationsTab />
          </div>
        </div>
      </div>
    );
  }
  
  if (activeSection === 'support') {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <SupportCenter />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'collections') {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <ToastProvider>
              <AdminCollectionDashboard />
            </ToastProvider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Meta 
        title="Admin Dashboard - Loanzaar Management" 
        description="Manage loan applications, users, and platform operations. Admin dashboard with real-time analytics and reports."
      />
      
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 space-y-6">
          {/* Error Alert - Show if backend is unavailable */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Backend Service Notice</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.overview?.totalUsers || 0}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total Loans */}
        <div className="bg-linear-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Total Applications</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.overview?.totalLoans || 0}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pending Loans */}
        <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Pending Requests</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.overview?.pendingLoans || 0}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">New Messages</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.overview?.newMessages || 0}</h3>
              <p className="text-green-100 text-xs mt-1">of {stats?.overview?.totalMessages || 0} total</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Collections Summary Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Collections Overview</h2>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700"><strong>Debug Info:</strong></p>
          <p className="text-xs text-blue-600 font-mono mt-2">
            {Object.entries(collectionsData).map(([name, data]) => `${name}: ${data?.length || 0}`).join(' | ')}
          </p>
          <button 
            onClick={fetchAllCollectionsData}
            className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            🔄 Retry Fetch
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-600 font-semibold text-sm">Admin Loans</p>
            <p className="text-2xl font-bold text-blue-800 mt-2">{collectionsData.admin_loans?.length || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-purple-600 font-semibold text-sm">Admin Insurance</p>
            <p className="text-2xl font-bold text-purple-800 mt-2">{collectionsData.admin_insurance?.length || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-green-600 font-semibold text-sm">Admin Messages</p>
            <p className="text-2xl font-bold text-green-800 mt-2">{collectionsData.admin_messages?.length || 0}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-orange-600 font-semibold text-sm">Admin Users</p>
            <p className="text-2xl font-bold text-orange-800 mt-2">{collectionsData.admin_users?.length || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-red-600 font-semibold text-sm">CIBIL Score</p>
            <p className="text-2xl font-bold text-red-800 mt-2">{collectionsData.cibil_score?.length || 0}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-indigo-600 font-semibold text-sm">Insurance Applications</p>
            <p className="text-2xl font-bold text-indigo-800 mt-2">{collectionsData.insurance_applications?.length || 0}</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <p className="text-pink-600 font-semibold text-sm">Loan Applications</p>
            <p className="text-2xl font-bold text-pink-800 mt-2">{collectionsData.loan_applications?.length || 0}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
            <p className="text-teal-600 font-semibold text-sm">Other Data</p>
            <p className="text-2xl font-bold text-teal-800 mt-2">{collectionsData.other_data?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Types Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800">Loans by Type</h2>
          </div>
          {loanTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              No loan data available
            </div>
          )}
        </div>

        {/* Loan Status Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800">Application Status</h2>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              No status data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends Line Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">Monthly Loan Trends</h2>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                name="Applications"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                name="Amount (₹ Lakhs)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-400">
            No monthly data available
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Loan Applications</h2>
        {stats?.recentLoans?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Loan Type</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLoans.map((loan) => (
                  <tr key={loan._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{loan.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {loan.loanType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">₹{loan.loanAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        loan.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        loan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        loan.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No recent applications
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardWithGuard() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
}

