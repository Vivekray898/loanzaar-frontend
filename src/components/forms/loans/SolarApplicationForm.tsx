'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication, getClientProfileId } from '@/services/supabaseService';
import { 
  X, User, Sun, Check, Loader2, MapPin, Zap, ArrowRight, 
  ArrowLeft, Building, Home, IndianRupee 
} from 'lucide-react';
import Turnstile from '@/components/Turnstile';

interface FormData {
  fullName: string;
  mobile: string;
  email?: string;
  // Solar Fields
  monthlyBill: string;
  installationSize: string;
  panelsType: string;
  roofType: string;
  // Address Fields
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface SolarApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string;
  loanCategory?: 'personal' | 'business';
}

export default function SolarApplicationForm({ 
  isOpen, 
  onClose, 
  loanType = 'Solar Loan', 
  loanCategory = 'business' 
}: SolarApplicationFormProps) {
  
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    monthlyBill: '',
    installationSize: '',
    panelsType: 'Monocrystalline',
    roofType: 'Concrete',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setCaptchaToken(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    // Step 1 Validation
    if (step === 1) {
      if (!formData.fullName.trim() || formData.mobile.length < 10) {
        alert('Please enter a valid Name and 10-digit Mobile Number.');
        return;
      }
    }
    // Step 2 Validation
    if (step === 2) {
      if (!formData.monthlyBill) {
        alert('Please enter your average monthly electricity bill.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = async () => {
    // Step 3 Validation (Address)
    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in your complete address details.');
      return;
    }

    setIsLoading(true);

    try {
      const profileId = await getClientProfileId();
      const payload = {
        full_name: formData.fullName,
        mobile_number: formData.mobile,
        email: formData.email || null,
        
        // Address Mapping
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        product_category: 'Green Loan',
        product_type: loanType,
        source: 'website',
        metadata: {
          monthlyBill: formData.monthlyBill,
          installationSize: formData.installationSize,
          panelsType: formData.panelsType,
          roofType: formData.roofType
        },
        profileId: profileId || undefined
      };

      const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

      console.log('📤 Submitting solar application...', payload);

      const res = await submitApplication(submitPayload);

      if (res && res.success) {
        setStep(4); // Success Step
        setCaptchaToken(null);
      } else {
        alert(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting solar loan:', error);
      alert((error as any)?.message || 'An error occurred while submitting.');
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
            <h3 className="text-lg font-bold text-slate-900">{loanType}</h3>
            <p className="text-xs text-slate-500">
              {step === 4 ? 'Application Status' : `Step ${step} of 3`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="h-1 w-full bg-slate-100">
            <div 
              className="h-full bg-green-600 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }} 
            />
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* --- STEP 1: IDENTITY --- */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-100 shadow-sm">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Information</h4>
                <p className="text-sm text-slate-500">We will get in touch regarding your installation.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  placeholder="As per Electricity Bill" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" 
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
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email (optional)</label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="you@example.com" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" 
                />
              </div>

              <button 
                onClick={nextStep} 
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* --- STEP 2: SOLAR DETAILS --- */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-100 shadow-sm">
                  <Sun className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Power Requirement</h4>
                <p className="text-sm text-slate-500">Help us estimate your savings.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Avg. Monthly Bill</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    name="monthlyBill" 
                    type="number" 
                    value={formData.monthlyBill} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 3500" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Roof Type</label>
                  <select name="roofType" value={formData.roofType} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-700">
                    <option value="Concrete">Concrete</option>
                    <option value="Tin Shed">Tin Shed</option>
                    <option value="Open Ground">Open Ground</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Panel Type</label>
                  <select name="panelsType" value={formData.panelsType} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-700">
                    <option value="Monocrystalline">Mono Perc</option>
                    <option value="Polycrystalline">Poly</option>
                    <option value="Bifacial">Bifacial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Desired Capacity (kW)</label>
                <input 
                  name="installationSize" 
                  value={formData.installationSize} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 3 kW (Optional)" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={prevStep} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={nextStep} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: ADDRESS --- */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-100 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Installation Site</h4>
                <p className="text-sm text-slate-500">We need this to check solar feasibility.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 1</label>
                <input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="House No, Building, Street" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 2 (Optional)</label>
                <input name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Area, Landmark" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">City</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                  <input name="pincode" type="number" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="000000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">State</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium" />
                </div>
              </div>

              {/* Captcha */}
              {TURNSTILE_SITE_KEY && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-center">
                  <Turnstile sitekey={TURNSTILE_SITE_KEY} onVerify={(token) => setCaptchaToken(token)} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={prevStep} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading || (!!TURNSTILE_SITE_KEY && !captchaToken)} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Quote'}
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 4: SUCCESS --- */}
          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Quote Requested!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Thank you, <b>{formData.fullName}</b>. Our solar expert will analyze your roof details and call you on <b>{formData.mobile}</b> shortly.
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
        {step < 4 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400">
              By submitting, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}