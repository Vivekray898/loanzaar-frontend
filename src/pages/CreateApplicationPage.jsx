'use client'

import React, { useState, useEffect } from 'react';
import Meta from '../components/Meta';
import { FileText, Shield, Check, AlertCircle } from 'lucide-react';
import { submitLoanApplication, submitInsuranceApplication } from '../services/firestoreService';
import { authenticatedFetch as fetchWithFirebaseToken } from '../utils/supabaseTokenHelper';

function CreateApplicationPage() {
  const [applicationType, setApplicationType] = useState('loan');
  
  // SEO Meta
  // Title/description targeted for admin create app page
  const pageMeta = {
    title: 'Create Application | Admin - Loanzaar',
    description: 'Admin interface to create loan or insurance applications on behalf of users.'
  };
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Loan form data
  const [loanData, setLoanData] = useState({
    loanType: 'Personal Loan',
    loanAmount: '',
    monthlyIncome: '',
    employmentType: 'Salaried',
    remarks: ''
  });

  // Insurance form data
  const [insuranceData, setInsuranceData] = useState({
    insuranceType: 'Life Insurance',
    coverageAmount: '',
    insuranceTerm: '10 Years',
    employmentType: 'Salaried',
    monthlyIncome: '',
    age: '',
    cityState: '',
    medicalHistory: '',
    existingPolicies: '',
    remarks: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Use fetchWithFirebaseToken to attach admin Firebase ID token
      const response = await fetchWithFirebaseToken(`/admin/users?role=user`);

      const data = await response.json();
      if (data.success) {
        // Filter to only show normal users (not admins)
        const normalUsers = (data.data || []).filter(u => u.role !== 'admin');
        setUsers(normalUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('adminToken');
      // Fix: Use 'adminData' key which is set by admin login  
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const adminId = adminData?._id || adminData?.adminId || adminData?.id;
      
      const user = users.find(u => u._id === selectedUser);

      if (!user) {
        setError('Please select a user');
        setLoading(false);
        return;
      }

      if (!adminId) {
        setError('Admin ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('📤 Creating loan application for user:', user);

      // Convert "Personal Loan" -> "Personal", "Home Loan" -> "Home", etc.
      const loanTypeValue = loanData.loanType.replace(' Loan', '').replace('Loan Against Property', 'Property');

      const payload = {
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        cityState: user.cityState || user.city || 'Not Provided', // Required field
        dateOfBirth: user.dateOfBirth || '',
        panNumber: user.panNumber || '',
        aadhaarNumber: user.aadhaarNumber || '',
        loanType: loanTypeValue,
        loanAmount: Number(loanData.loanAmount),
        monthlyIncome: loanData.monthlyIncome,
        employmentType: loanData.employmentType,
        remarks: loanData.remarks || '',
        consent: true, // Required field - admin creates on behalf of user
        userId: user._id,
        createdBy: 'admin', // ✅ Track that admin created this
        createdByAdmin: true, // ✅ Flag for admin-created
        status: 'Pending'
      };

      console.log('📦 Loan payload (submitting to Firestore):', payload);

      // Submit to Firestore instead of directly to MongoDB
      const result = await submitLoanApplication(payload);
      console.log('📥 Firestore submission response:', result);
      
      if (result.success) {
        setSuccess(true);
        setLoanData({
          loanType: 'Personal Loan',
          loanAmount: '',
          monthlyIncome: '',
          employmentType: 'Salaried',
          remarks: ''
        });
        setSelectedUser('');
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to create loan application');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Failed to create loan application');
      console.error('Error:', error);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('adminToken');
      // Fix: Use 'adminData' key which is set by admin login
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const adminId = adminData?._id || adminData?.adminId || adminData?.id;
      
      const user = users.find(u => u._id === selectedUser);

      if (!user) {
        setError('Please select a user');
        setLoading(false);
        return;
      }

      if (!adminId) {
        setError('Admin ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('📤 Creating insurance application for user:', user);

      const payload = {
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        insuranceType: insuranceData.insuranceType,
        coverageAmount: insuranceData.coverageAmount,
        insuranceTerm: insuranceData.insuranceTerm,
        employmentType: insuranceData.employmentType,
        monthlyIncome: insuranceData.monthlyIncome,
        age: insuranceData.age,
        cityState: insuranceData.cityState || '',
        medicalHistory: insuranceData.medicalHistory || '',
        existingPolicies: insuranceData.existingPolicies || '',
        remarks: insuranceData.remarks || '',
        userId: user._id,
        createdBy: 'admin', // ✅ Track that admin created this
        createdByAdmin: true, // ✅ Flag for admin-created
        status: 'Pending'
      };

      console.log('📦 Insurance payload (submitting to Firestore):', payload);

      // Submit to Firestore instead of directly to MongoDB
      const result = await submitInsuranceApplication(payload);
      console.log('📥 Firestore submission response:', result);
      
      if (result.success) {
        setSuccess(true);
        setInsuranceData({
          insuranceType: 'Life Insurance',
          coverageAmount: '',
          insuranceTerm: '10 Years',
          employmentType: 'Salaried',
          monthlyIncome: '',
          age: '',
          cityState: '',
          medicalHistory: '',
          existingPolicies: '',
          remarks: ''
        });
        setSelectedUser('');
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to create insurance application');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Failed to create insurance application');
      console.error('Error:', error);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Meta title={pageMeta.title} description={pageMeta.description} />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Create Application</h1>
        <p className="text-slate-600 mt-1">Create loan or insurance application on behalf of a user</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>Application created successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Application Type Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Application Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setApplicationType('loan')}
            className={`p-4 rounded-lg border-2 transition-all ${
              applicationType === 'loan'
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Loan Application</p>
          </button>
          <button
            onClick={() => setApplicationType('insurance')}
            className={`p-4 rounded-lg border-2 transition-all ${
              applicationType === 'insurance'
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Insurance Application</p>
          </button>
        </div>
      </div>

      {/* User Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select User
        </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          required
        >
          <option value="">-- Select a user --</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name || user.fullName} - {user.email} - {user.phone}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-2">
          Total {users.length} registered users
        </p>
      </div>

      {/* Loan Form */}
      {applicationType === 'loan' && (
        <form onSubmit={handleLoanSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Loan Application Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loan Type
              </label>
              <select
                value={loanData.loanType}
                onChange={(e) => setLoanData({ ...loanData, loanType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                required
              >
                <option>Personal Loan</option>
                <option>Home Loan</option>
                <option>Business Loan</option>
                <option>Gold Loan</option>
                <option>Education Loan</option>
                <option>Loan Against Property</option>
                <option>Machinery Loan</option>
                <option>Solar Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanData.loanAmount}
                onChange={(e) => setLoanData({ ...loanData, loanAmount: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., 500000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={loanData.monthlyIncome}
                onChange={(e) => setLoanData({ ...loanData, monthlyIncome: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., 50000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employment Type
              </label>
              <select
                value={loanData.employmentType}
                onChange={(e) => setLoanData({ ...loanData, employmentType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option>Salaried</option>
                <option>Self-Employed</option>
                <option>Business Owner</option>
                <option>Professional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={loanData.remarks}
              onChange={(e) => setLoanData({ ...loanData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedUser}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Loan Application'}
          </button>
        </form>
      )}

      {/* Insurance Form */}
      {applicationType === 'insurance' && (
        <form onSubmit={handleInsuranceSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Insurance Application Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Insurance Type
              </label>
              <select
                value={insuranceData.insuranceType}
                onChange={(e) => setInsuranceData({ ...insuranceData, insuranceType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                required
              >
                <option>Life Insurance</option>
                <option>Health Insurance</option>
                <option>General Insurance</option>
                <option>All Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Coverage Amount
              </label>
              <input
                type="text"
                value={insuranceData.coverageAmount}
                onChange={(e) => setInsuranceData({ ...insuranceData, coverageAmount: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., ₹50 Lakhs"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Insurance Term
              </label>
              <select
                value={insuranceData.insuranceTerm}
                onChange={(e) => setInsuranceData({ ...insuranceData, insuranceTerm: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option>10 Years</option>
                <option>15 Years</option>
                <option>20 Years</option>
                <option>25 Years</option>
                <option>30 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={insuranceData.age}
                onChange={(e) => setInsuranceData({ ...insuranceData, age: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., 30"
                min="18"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employment Type
              </label>
              <select
                value={insuranceData.employmentType}
                onChange={(e) => setInsuranceData({ ...insuranceData, employmentType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option>Salaried</option>
                <option>Self-Employed</option>
                <option>Business Owner</option>
                <option>Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={insuranceData.monthlyIncome}
                onChange={(e) => setInsuranceData({ ...insuranceData, monthlyIncome: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., 50000"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City/State
              </label>
              <input
                type="text"
                value={insuranceData.cityState}
                onChange={(e) => setInsuranceData({ ...insuranceData, cityState: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Medical History (Optional)
            </label>
            <textarea
              value={insuranceData.medicalHistory}
              onChange={(e) => setInsuranceData({ ...insuranceData, medicalHistory: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              rows="2"
              placeholder="Any pre-existing conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Existing Policies (Optional)
            </label>
            <textarea
              value={insuranceData.existingPolicies}
              onChange={(e) => setInsuranceData({ ...insuranceData, existingPolicies: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              rows="2"
              placeholder="List any existing insurance policies..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={insuranceData.remarks}
              onChange={(e) => setInsuranceData({ ...insuranceData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedUser}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Insurance Application'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateApplicationPage;

