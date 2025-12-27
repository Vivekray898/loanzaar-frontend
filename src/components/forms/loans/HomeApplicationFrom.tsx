'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication } from '@/services/firestoreService';
import { X, User, Briefcase, Check, Loader2, IndianRupee, MapPin } from 'lucide-react';

interface FormData {
  fullName: string;
  mobile: string;
  employmentType: string;
  monthlyIncome: string;
  pincode: string;
}

interface HomeApplicationFromProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string;
}

const HomeApplicationFrom: React.FC<HomeApplicationFromProps> = ({ 
  isOpen, 
  onClose, 
  loanType = "Loan Application" 
}) => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    employmentType: 'Salaried',
    monthlyIncome: '',
    pincode: ''
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll
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

  const handleFinalSubmit = async () => {
    if (!formData.monthlyIncome || !formData.pincode) {
       alert("Please fill all financial details.");
       return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        employmentType: formData.employmentType,
        monthlyIncome: formData.monthlyIncome,
        pincode: formData.pincode,
        loanType: loanType || 'Home Loan',
        source: 'website',
        metadata: {
          employmentType: formData.employmentType,
          monthlyIncome: formData.monthlyIncome,
          pincode: formData.pincode
        }
      };

      console.log('📤 Submitting home application to `applications` table', { mobile: payload.mobile });

      const res = await submitApplication(payload);

      if (res && res.success) {
        console.log('✅ Home application submitted:', res.docId || res);
        setStep(3);
      } else {
        console.error('❌ Home application submission failed:', res);
        alert(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting home application:', error);
      alert(error?.message || 'An error occurred while submitting.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{loanType}</h3>
            <p className="text-xs text-slate-500">Quick Application</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 w-full bg-slate-100">
            <div 
              className="h-full bg-emerald-600 transition-all duration-500 ease-out" 
              style={{ width: step === 1 ? '50%' : '100%' }} 
            />
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* STEP 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Let's start with basics</h4>
                <p className="text-sm text-slate-500">We need this to contact you regarding your application.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  placeholder="As per PAN Card"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
                  <input 
                    name="mobile" 
                    type="tel" 
                    maxLength={10} 
                    value={formData.mobile} 
                    onChange={handleInputChange}
                    placeholder="99999 00000"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={handleNextStep} 
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Financial Info */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Employment Details</h4>
                <p className="text-sm text-slate-500">Helps us find lenders matching your profile.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Salaried' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="employmentType" value="Salaried" checked={formData.employmentType === 'Salaried'} onChange={handleInputChange} className="hidden" />
                  <span className="text-sm font-bold">Salaried</span>
                </label>
                <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Self-Employed' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="employmentType" value="Self-Employed" checked={formData.employmentType === 'Self-Employed'} onChange={handleInputChange} className="hidden" />
                  <span className="text-sm font-bold">Business / Self</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Monthly Income</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    name="monthlyIncome" 
                    type="number" 
                    value={formData.monthlyIncome} 
                    onChange={handleInputChange}
                    placeholder="e.g. 45000"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Current Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    name="pincode" 
                    type="number" 
                    maxLength={6} 
                    value={formData.pincode} 
                    onChange={handleInputChange}
                    placeholder="e.g. 110001"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50">
                  Back
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading} 
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
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
                Thank you, <b>{formData.fullName}</b>. Our loan expert will call you on <b>{formData.mobile}</b> shortly to discuss the best offers.
              </p>
              <button 
                onClick={onClose} 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeApplicationFrom;