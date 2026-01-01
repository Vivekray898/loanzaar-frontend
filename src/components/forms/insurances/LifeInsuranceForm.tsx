'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { X, User, Shield, Check, Loader2, Calendar, Phone, MapPin, Heart, Home, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { submitApplication, getClientProfileId } from '@/services/supabaseService';
import Turnstile from '@/components/Turnstile';
import { OtpVerifier } from '@/components/OtpVerifier';

interface LifeInsuranceFormData {
  fullName: string;
  mobile: string;
  age: string;
  gender: string;
  coverageAmount: string;
  // Address Fields
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface LifeInsuranceFormProps {
  isOpen: boolean;
  onClose: () => void;
  insuranceType?: string; // e.g. "Life Insurance", "Term Plan"
}

const LifeInsuranceForm: React.FC<LifeInsuranceFormProps> = ({ 
  isOpen, 
  onClose, 
  insuranceType = "Life Insurance" 
}) => {
  const [step, setStep] = useState<number | 'otp'>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<LifeInsuranceFormData>({
    fullName: '',
    mobile: '',
    age: '',
    gender: 'Male',
    coverageAmount: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // OTP flow handled by `OtpVerifier` component
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{ userId: string; password?: string | null } | null>(null);

  // progress percent considers the OTP step as ~33%
  const progressPercent = step === 'otp' ? 33.333 : (typeof step === 'number' ? (step / 3) * 100 : 0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
          setStep(1);
        setCaptchaToken(null);

        // Reset OTP state
        setOtpVerified(false);
        setCreatedUserCredentials(null);
      }, 300);
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

  const [contactError, setContactError] = useState<string | null>(null);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // sanitize mobile input to digits only and limit to 10 chars
    if (name === 'mobile') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, mobile: digits });
      if (contactError) setContactError(null);
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // OTP flows are delegated to the reusable `OtpVerifier` component (no internal mock OTP logic here).
  const nextStep = () => {
    // Step 1 Validation + send OTP
    if (step === 1) {
      if (!formData.fullName.trim()) {
        alert("Please enter a valid Name.");
        return;
      }

      // Validate mobile using libphonenumber-js
      const phone = parsePhoneNumberFromString(formData.mobile, 'IN');
      if (!phone || !phone.isValid() || phone.country !== 'IN') {
        setContactError('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      // Normalize to national digits (keep existing UI value, server expects raw digits)
      setContactError(null);

      // Show OTP step (actual sending / verification handled by `OtpVerifier`)
      setStep('otp');
      return;
    }

    // Guard: prevent skipping OTP (race conditions)
    if (step === 2 && !otpVerified) {
      alert("Please verify your mobile number first.");
      setStep('otp');
      return;
    }

    // Step 2 Validation
    if (step === 2) {
      if (!formData.age || !formData.coverageAmount) {
        alert("Please fill in your age and coverage details.");
        return;
      }
    }

    setStep(prev => (typeof prev === 'number' ? prev + 1 : prev));
  };

  const prevStep = () => {
    if (step === 'otp') {
      setStep(1);
      return;
    }
    setStep(prev => (typeof prev === 'number' ? prev - 1 : 1));
  };

  const handleFinalSubmit = async () => {
    // Step 3 Validation (Address)
    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
       alert("Please fill in your complete address details.");
       return;
    }

    setIsLoading(true);

    try {
      const clientProfileId = await getClientProfileId();
      const payload = {
        full_name: formData.fullName,
        mobile_number: formData.mobile,
        
        // Address Mapping
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        // Backwards-compatible lead id and preferred explicit profile id
        user_id: createdUserCredentials?.userId || (typeof window !== 'undefined' ? localStorage.getItem('lead_user_id') : null),
        profileId: clientProfileId || undefined,

        loanType: 'life-insurance', // Kept for consistency
        product_type: 'life-insurance',
        source: 'website',
        metadata: {
          age: formData.age,
          gender: formData.gender,
          coverageAmount: formData.coverageAmount,
          insuranceType
        }
      };

      const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

      console.log(`📤 Submitting ${insuranceType} Inquiry...`, { mobile: payload.mobile_number, user_id: payload.user_id });

      const res = await submitApplication(submitPayload);

      if (res && res.success) {
        setStep(4); // Success Step
        setCaptchaToken(null);
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
            <p className="text-xs text-slate-500">Secure your family's future</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step !== 4 && (
          <div className="h-1 w-full bg-slate-100">
            <div 
              className="h-full bg-teal-600 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* --- STEP 1: CONTACT INFO --- */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Get Started</h4>
                <p className="text-sm text-slate-500">We need your details to find the best plan.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInput} 
                  placeholder="e.g. Rahul Kumar" 
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
                  {contactError && <p className="text-xs text-red-600 mt-2">{contactError}</p>}
                </div>
              </div>

              <button 
                onClick={nextStep} 
                className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* --- OTP VERIFICATION --- */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <OtpVerifier
                mobile={formData.mobile}
                fullName={formData.fullName}
                onSuccess={(data) => {
                  setOtpVerified(true);
                  setCreatedUserCredentials(data);
                  setStep(2);
                }}
                onBack={() => setStep(1)}
              />
            </div>
          )}

          {/* --- STEP 2: PERSONAL DETAILS --- */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Your Profile</h4>
                <p className="text-sm text-slate-500">Help us calculate your premium.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Age</label>
                  <input 
                    name="age" 
                    type="number" 
                    value={formData.age} 
                    onChange={handleInput} 
                    placeholder="e.g. 35" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Sum Assured (Cover)</label>
                <select 
                  name="coverageAmount" 
                  value={formData.coverageAmount} 
                  onChange={handleInput} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                >
                  <option value="">Select Amount</option>
                  <option value="50L">₹ 50 Lakhs</option>
                  <option value="1Cr">₹ 1 Crore</option>
                  <option value="2Cr">₹ 2 Crores</option>
                  <option value="5Cr+">₹ 5 Crores+</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={prevStep} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={nextStep} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: ADDRESS --- */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Current Residence</h4>
                <p className="text-sm text-slate-500">For accurate policy issuance.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 1</label>
                <input 
                  name="addressLine1" 
                  value={formData.addressLine1} 
                  onChange={handleInput} 
                  placeholder="House No, Building, Street" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 2 (Optional)</label>
                <input 
                  name="addressLine2" 
                  value={formData.addressLine2} 
                  onChange={handleInput} 
                  placeholder="Area, Landmark" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">City</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input name="city" value={formData.city} onChange={handleInput} placeholder="City" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                  <input name="pincode" maxLength={6} value={formData.pincode} onChange={handleInput} placeholder="000000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">State</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="state" value={formData.state} onChange={handleInput} placeholder="State" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium" />
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
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Free Quote'}
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
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Thank you, <b>{formData.fullName}</b>. Our life insurance expert will contact you on <b>{formData.mobile}</b> shortly.
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
        {step !== 4 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
             <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
               <Shield className="w-3 h-3" /> Data is secure & encrypted
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeInsuranceForm;