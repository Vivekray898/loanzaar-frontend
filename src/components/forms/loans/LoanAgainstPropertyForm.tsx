'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication } from '@/services/supabaseService';
import { X, Home, User, Check, Loader2, MapPin, Building } from 'lucide-react';
import Turnstile from '@/components/Turnstile'; // ✅ Added Import

interface FormData {
  fullName: string;
  mobile: string;
  email?: string;
  propertyValue: string;
  loanAmountDesired: string;
  propertyType: 'residential' | 'commercial' | '';
  ownership: 'owner' | 'co-owner' | 'mortgaged' | '';
  occupancy: 'self' | 'rented' | '';
  pincode: string;
  city?: string;
}

interface LoanAgainstPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string;
}

export default function LoanAgainstPropertyForm({ isOpen, onClose, loanType = 'Loan Against Property' }: LoanAgainstPropertyFormProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    propertyValue: '',
    loanAmountDesired: '',
    propertyType: '',
    ownership: '',
    occupancy: '',
    pincode: '',
    city: ''
  });

  // ✅ Added Captcha State
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setCaptchaToken(null); // ✅ Reset captcha
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || formData.mobile.length < 10) {
        alert('Please enter a valid name and 10-digit mobile number.');
        return;
      }
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.propertyValue || !formData.loanAmountDesired || !formData.pincode) {
      alert('Please fill required property and contact fields.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email || null,
        city: formData.city || null,
        loanType: loanType || 'Loan Against Property',
        product_type: 'loan-against-property',
        source: 'website',
        metadata: {
          propertyValue: formData.propertyValue || null,
          loanAmountDesired: formData.loanAmountDesired || null,
          propertyType: formData.propertyType || null,
          ownership: formData.ownership || null,
          occupancy: formData.occupancy || null,
          pincode: formData.pincode || null
        }
      };

      // ✅ Include Captcha Token
      const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

      console.log('📤 Submitting LAP application...', { mobile: payload.mobile });

      const res = await submitApplication(submitPayload);
      
      if (res && res.success) {
        console.log('✅ LAP application submitted:', res.docId || res);
        setStep(3);
        setCaptchaToken(null); // ✅ Clear token on success
      } else {
        console.error('❌ LAP submission failed:', res);
        alert(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting LAP application:', error);
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
            <p className="text-xs text-slate-500">Quick Property Application</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 w-full bg-slate-100">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Information</h4>
                <p className="text-sm text-slate-500">We will contact you regarding loan options.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per documents" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
                  <input name="mobile" type="tel" maxLength={10} value={formData.mobile} onChange={handleInputChange} placeholder="99999 00000" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email (optional)</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>

              <button onClick={handleNextStep} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Property Details</h4>
                <p className="text-sm text-slate-500">Tell us about the property to get accurate offers.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Estimated Property Value</label>
                <input name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} placeholder="e.g. 1,50,00,000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Desired Loan Amount</label>
                <input name="loanAmountDesired" value={formData.loanAmountDesired} onChange={handleInputChange} placeholder="e.g. 50,00,000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Property Type</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium">
                    <option value="">Select</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Ownership Status</label>
                  <select name="ownership" value={formData.ownership} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium">
                    <option value="">Select</option>
                    <option value="owner">Sole Owner</option>
                    <option value="co-owner">Co-owner</option>
                    <option value="mortgaged">Already Mortgaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Occupancy</label>
                <select name="occupancy" value={formData.occupancy} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium">
                  <option value="">Select</option>
                  <option value="self">Owner Occupied</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Current Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input name="pincode" type="number" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 110001" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
                </div>
              </div>

              {/* ✅ Captcha Widget */}
              {TURNSTILE_SITE_KEY && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-3">Security Check</p>
                  <Turnstile sitekey={TURNSTILE_SITE_KEY} onVerify={(token) => setCaptchaToken(token)} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading || (!!TURNSTILE_SITE_KEY && !captchaToken)} 
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (!!TURNSTILE_SITE_KEY && !captchaToken ? 'Complete Security Check' : 'Get Offers')}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Thank you, <b>{formData.fullName}</b>. Our loan expert will contact you on <b>{formData.mobile}</b> shortly with LAP options.
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
}