'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { X, User, Shield, Check, Loader2, Calendar, Phone } from 'lucide-react';
import { submitApplication } from '../../../services/firestoreService';

interface LifeInsuranceFormData {
  fullName: string;
  mobile: string;
  age: string;
  gender: string;
  pincode: string;
  coverageAmount: string;
}

interface LifeInsuranceFormProps {
  isOpen: boolean;
  onClose: () => void;
  insuranceType?: string; // e.g. "Life Insurance", "Health Insurance"
}

const LifeInsuranceForm: React.FC<LifeInsuranceFormProps> = ({ 
  isOpen, 
  onClose, 
  insuranceType = "Life Insurance" 
}) => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<LifeInsuranceFormData>({
    fullName: '',
    mobile: '',
    age: '',
    gender: 'Male',
    pincode: '',
    coverageAmount: ''
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

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.age || !formData.pincode) {
       alert("Please fill all details to get an accurate quote.");
       return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        pincode: formData.pincode,
        loanType: 'life-insurance',
        source: 'website',
        metadata: {
          age: formData.age,
          gender: formData.gender,
          coverageAmount: formData.coverageAmount,
          insuranceType
        }
      };

      const res = await submitApplication(payload);

      if (res && res.success) {
        setStep(3);
        console.log(`Submitted ${insuranceType} Inquiry:`, res);
      } else {
        alert(res?.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{insuranceType}</h3>
            <p className="text-xs text-slate-500">Get Free Quotes</p>
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
              className="h-full bg-teal-600 transition-all duration-500 ease-out" 
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
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Who is this for?</h4>
                <p className="text-sm text-slate-500">We need your contact details to share the best quotes.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInput} 
                  placeholder="e.g. Aditi Sharma" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
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
                    onChange={handleInput} 
                    placeholder="99999 00000" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={handleNextStep} 
                className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next Step
              </button>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Personal Details</h4>
                <p className="text-sm text-slate-500">Helps us calculate accurate premiums.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInput} 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Current Age</label>
                  <input 
                    name="age" 
                    type="number" 
                    maxLength={2}
                    value={formData.age} 
                    onChange={handleInput} 
                    placeholder="e.g. 30" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Coverage Amount (Sum Assured)</label>
                <select 
                  name="coverageAmount" 
                  value={formData.coverageAmount} 
                  onChange={handleInput} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                >
                  <option value="">Select Amount</option>
                  <option value="50L">₹50 Lakhs</option>
                  <option value="1Cr">₹1 Crore</option>
                  <option value="2Cr">₹2 Crores</option>
                  <option value="5Cr+">Above ₹5 Crores</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                <input 
                  name="pincode" 
                  maxLength={6} 
                  value={formData.pincode} 
                  onChange={handleInput} 
                  placeholder="e.g. 400001" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading} 
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'View Plans'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Thank you, <b>{formData.fullName}</b>. Our insurance expert will call you on <b>{formData.mobile}</b> shortly to guide you.
              </p>
              <button 
                onClick={onClose} 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg transition-all"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        {step < 3 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              100% Spam Free. Your data is secure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeInsuranceForm;