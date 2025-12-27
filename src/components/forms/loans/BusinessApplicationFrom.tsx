'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication } from '@/services/firestoreService';
import { X, User, Briefcase, Check, Loader2, IndianRupee, MapPin, Building2, Calendar } from 'lucide-react';

interface FormData {
  fullName: string;
  mobile: string;
  // Personal Fields
  employmentType: string;
  monthlyIncome: string;
  // Business Fields
  businessName: string;
  turnover: string;
  vintage: string; // Years in business
  pincode: string;
}

interface BusinessApplicationFromProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string; // Display title
  loanCategory?: 'personal' | 'business'; // Logic switch
}

const BusinessApplicationFrom: React.FC<BusinessApplicationFromProps> = ({ 
  isOpen, 
  onClose, 
  loanType = "Loan Application",
  loanCategory = 'personal'
}) => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    employmentType: 'Salaried',
    monthlyIncome: '',
    businessName: '',
    turnover: '',
    vintage: '',
    pincode: ''
  });

  // Reset state
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || formData.mobile.length < 10) {
        alert("Please enter a valid Name and 10-digit Mobile Number.");
        return;
      }
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
    // Validation based on category
    if (!formData.pincode) { alert("Pincode is required"); return; }

    if (loanCategory === 'personal' && !formData.monthlyIncome) {
        alert("Monthly Income is required"); return;
    }
    if (loanCategory === 'business' && (!formData.turnover || !formData.businessName)) {
        alert("Business details are required"); return;
    }

    setIsLoading(true);

    (async () => {
      try {
        const payload = {
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: null,
          city: null,
          loanType: loanType || 'Business Loan',
          source: 'website',
          metadata: {
            businessName: formData.businessName || null,
            turnover: formData.turnover || null,
            vintage: formData.vintage || null,
            pincode: formData.pincode || null,
            employmentType: formData.employmentType || null,
            monthlyIncome: formData.monthlyIncome || null
          }
        };

        console.log('📤 Submitting business application to `applications` table', { mobile: payload.mobile });

        const res = await submitApplication(payload);

        if (res && res.success) {
          console.log('✅ Business application submitted:', res.docId || res);
          setStep(3);
        } else {
          console.error('❌ Business application submission failed:', res);
          alert(res?.message || 'Failed to submit application. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error submitting business application:', error);
        alert(error?.message || 'An error occurred while submitting.');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{loanType}</h3>
            <p className="text-xs text-slate-500">
              {loanCategory === 'business' ? 'Business Details' : 'Quick Application'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 w-full bg-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: Contact Info (Same for both) */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Information</h4>
                <p className="text-sm text-slate-500">We need this to verify your identity.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per PAN Card" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
                  <input name="mobile" type="tel" maxLength={10} value={formData.mobile} onChange={handleInputChange} placeholder="99999 00000" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <button onClick={handleNextStep} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all">
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Logic Switch based on Category */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  {loanCategory === 'business' ? <Building2 className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {loanCategory === 'business' ? 'Business Profile' : 'Employment Details'}
                </h4>
                <p className="text-sm text-slate-500">Helps us check your eligibility.</p>
              </div>

              {/* --- BUSINESS FIELDS --- */}
              {loanCategory === 'business' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Business Name</label>
                    <input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Acme Traders" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Annual Turnover</label>
                        <select name="turnover" value={formData.turnover} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700">
                            <option value="">Select</option>
                            <option value="<20L">Less than 20L</option>
                            <option value="20L-50L">20L - 50L</option>
                            <option value="50L-1Cr">50L - 1 Cr</option>
                            <option value=">1Cr">Above 1 Cr</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Vintage</label>
                        <select name="vintage" value={formData.vintage} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700">
                            <option value="">Years</option>
                            <option value="<1">New (&lt;1 Yr)</option>
                            <option value="1-3">1-3 Years</option>
                            <option value="3+">3+ Years</option>
                        </select>
                    </div>
                  </div>
                </>
              ) : (
              /* --- PERSONAL FIELDS --- */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Salaried' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="employmentType" value="Salaried" checked={formData.employmentType === 'Salaried'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-bold">Salaried</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Self-Employed' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="employmentType" value="Self-Employed" checked={formData.employmentType === 'Self-Employed'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-bold">Self-Employed</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Monthly Income</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleInputChange} placeholder="e.g. 45000" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
                    </div>
                  </div>
                </>
              )}

              {/* Common Pincode Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Current Pincode</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input name="pincode" type="number" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 110001" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50">Back</button>
                <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Offers'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Thank you, <b>{formData.fullName}</b>. Our business loan expert will contact you on <b>{formData.mobile}</b> shortly.
              </p>
              <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg">Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessApplicationFrom;