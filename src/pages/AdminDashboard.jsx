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
  Shield,
  Database
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

  // ✅ CRITICAL: Only fetch dashboard stats AFTER Firebase auth is ready
  useEffect(() => {
    if (!authLoading) {
      console.log('✅ Auth ready - now safe to fetch dashboard stats');
      fetchDashboardStats();
    } else {
      console.log('⏳ Waiting for Firebase auth to initialize before fetching stats...');
    }
  }, [authLoading]); // ✅ Re-run when authLoading changes

  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      const response = await fetchWithFirebaseToken('/admin/stats');

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || `Failed to fetch statistics (${response.status})`);
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

          {/* Welcome Section */}
          <div className="bg-linear-to-r from-rose-500 via-rose-400 to-orange-400 rounded-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Welcome Back, Admin!</h1>
            <p className="text-rose-100">Manage your platform, track analytics, and grow your business.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.overview?.totalUsers || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Active accounts</p>
              </div>
            </div>

            {/* Total Loans */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Loans</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.overview?.totalLoans || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Applications</p>
              </div>
            </div>

            {/* Insurance Applications */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Insurance Apps</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.overview?.totalInsurance || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Applications</p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">₹{(stats?.overview?.totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loans by Type */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieChartIcon size={20} className="text-rose-600" />
                Loans by Type
              </h3>
              {loanTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={loanTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
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
                <p className="text-slate-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Loans by Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Loans by Status
              </h3>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Monthly Loans Trend */}
            <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-green-600" />
                Monthly Loan Applications Trend
              </h3>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="count" stroke="#ef4444" name="Applications" />
                    <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#3b82f6" name="Total Amount (Lakhs)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export wrapped with AdminAuthGuard for security
export default function AdminDashboardPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
}
