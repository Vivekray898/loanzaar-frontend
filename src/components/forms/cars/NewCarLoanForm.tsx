'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication, getClientProfileId } from '@/services/supabaseService';
import { X, User, Car, Check, Loader2, MapPin, IndianRupee } from 'lucide-react';
import Turnstile from '@/components/Turnstile';

interface FormData {
  fullName: string;
  mobile: string;
  email?: string;
  vehicleModel: string;
  onRoadPrice: string;
  loanAmount: string;
  tenure: string;
  pincode: string;
}

interface NewCarLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string;
}

export default function NewCarLoanForm({ 
  isOpen, 
  onClose, 
  loanType = 'New Car Loan' 
}: NewCarLoanFormProps) {
  
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    vehicleModel: '',
    onRoadPrice: '',
    loanAmount: '',
    tenure: '',
    pincode: ''
  });

  // Captcha State
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Reset state on open/close
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      timer = setTimeout(() => {
        setStep(1);
        setCaptchaToken(null);
      }, 300);
      document.body.style.overflow = '';
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || formData.mobile.length < 10) {
        alert('Please enter a valid Name and 10-digit Mobile Number.');
        return;
      }
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.vehicleModel || !formData.onRoadPrice || !formData.pincode) {
      alert('Please fill in the required vehicle and loan details.');
      return;
    }

    setIsLoading(true);
    
    try {
      const profileId = await getClientProfileId();
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email || null,
        pincode: formData.pincode,
        loanType: loanType,
        product_type: 'new-car-loan',
        source: 'website',
        metadata: {
          vehicleModel: formData.vehicleModel,
          onRoadPrice: formData.onRoadPrice,
          loanAmount: formData.loanAmount,
          tenure: formData.tenure || null
        },
        profileId: profileId || undefined
      };

      const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

      console.log('📤 Submitting New Car Loan application...', { mobile: payload.mobile });

      const res = await submitApplication(submitPayload);
      
      if (res && res.success) {
        console.log('✅ Application submitted:', res);
        setStep(3);
        setCaptchaToken(null);
      } else {
        alert(res?.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
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
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {loanType}
            </h3>
            <p className="text-xs text-slate-500">Get 100% On-Road Funding</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 w-full bg-slate-100">
            <div 
              className="h-full bg-red-600 transition-all duration-500 ease-out" 
              style={{ width: step === 1 ? '50%' : '100%' }} 
            />
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: Contact Information */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-red-100">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Details</h4>
                <p className="text-sm text-slate-500">We need this to check your eligibility.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInput} 
                  placeholder="As per PAN Card" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email (Optional)</label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInput} 
                  placeholder="you@example.com" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                />
              </div>

              <button 
                onClick={handleNextStep} 
                className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Vehicle & Loan Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-red-100">
                  <Car className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Car Details</h4>
                <p className="text-sm text-slate-500">Tell us about the car you plan to buy.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Car Model</label>
                <input 
                  name="vehicleModel" 
                  value={formData.vehicleModel} 
                  onChange={handleInput} 
                  placeholder="e.g. Tata Nexon Creative" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">On-Road Price</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      name="onRoadPrice" 
                      value={formData.onRoadPrice} 
                      onChange={handleInput} 
                      placeholder="e.g. 12,00,000" 
                      className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Loan Amount</label>
                   <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      name="loanAmount" 
                      value={formData.loanAmount} 
                      onChange={handleInput} 
                      placeholder="e.g. 10,00,000" 
                      className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Tenure</label>
                    <select 
                      name="tenure" 
                      value={formData.tenure} 
                      onChange={handleInput} 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-700"
                    >
                      <option value="">Select</option>
                      <option value="36">3 Years</option>
                      <option value="48">4 Years</option>
                      <option value="60">5 Years</option>
                      <option value="72">6 Years</option>
                      <option value="84">7 Years</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        name="pincode" 
                        maxLength={6} 
                        value={formData.pincode} 
                        onChange={handleInput} 
                        placeholder="e.g. 400001" 
                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
                      />
                    </div>
                 </div>
              </div>

              {/* Security Check */}
              {TURNSTILE_SITE_KEY && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-3">Security Check</p>
                  <Turnstile sitekey={TURNSTILE_SITE_KEY} onVerify={(token) => setCaptchaToken(token)} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading || (!!TURNSTILE_SITE_KEY && !captchaToken)} 
                  className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (!!TURNSTILE_SITE_KEY && !captchaToken ? 'Complete Security Check' : 'Get Offers')}
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
                Thank you, <b>{formData.fullName}</b>. Our loan expert will contact you on <b>{formData.mobile}</b> shortly.
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
             <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
               <MapPin className="w-3 h-3" /> Services available in your area
             </p>
          </div>
        )}
      </div>
    </div>
  );
}