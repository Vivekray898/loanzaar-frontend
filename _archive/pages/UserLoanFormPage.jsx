import React, { useState } from 'react';
import Meta from '../components/Meta';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload } from 'lucide-react';
import { submitLoanApplication } from '../services/firestoreService';

function UserLoanFormPage() {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    loanType: '',
    loanAmount: '',
    monthlyIncome: '',
    employmentType: '',
    cityState: '',
    consent: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data with proper types
      const submissionData = {
        ...formData,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        // monthlyIncome stays as string per schema definition
      };

      // Submit to Firestore instead of backend
      const result = await submitLoanApplication(submissionData);

      if (result.success) {
        alert('✅ ' + result.message);
        navigate('/dashboard/applications');
      } else {
        alert('❌ ' + result.message);
        console.error('Loan submission error:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Meta 
        title="Apply for Loan - Loanzaar" 
        description="Submit your loan application easily with our online form. Quick processing and instant approvals."
      />
      <h1 className="text-3xl font-bold text-slate-800">Apply for Loan</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loan Type *</label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Select Loan Type</option>
              <option value="Personal">Personal Loan</option>
              <option value="Home">Home Loan</option>
              <option value="Business">Business Loan</option>
              <option value="Education">Education Loan</option>
              <option value="Gold">Gold Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loan Amount *</label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type *</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Select Employment Type</option>
              <option value="Salaried">Salaried</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Income *</label>
            <input
              type="text"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">City, State *</label>
            <input
              type="text"
              name="cityState"
              value={formData.cityState}
              onChange={handleChange}
              required
              placeholder="e.g., Mumbai, Maharashtra"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            required
            className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
          />
          <label className="text-sm text-slate-700">
            I agree to the terms and conditions and consent to data processing *
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default UserLoanFormPage;
