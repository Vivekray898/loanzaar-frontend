'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication, getClientProfileId } from '@/services/supabaseService';
import { validateIndianMobile } from '@/utils/phoneValidation';
import { 
  X, User, Briefcase, Check, Loader2, IndianRupee, 
  MapPin, Building, Home, ArrowRight, ArrowLeft, Building2 
} from 'lucide-react';


interface FormData {
  fullName: string;
  mobile: string;
  // Personal Fields
  employmentType: string;
  monthlyIncome: string;
  // Business Fields
  businessName: string;
  turnover: string;
  vintage: string;
  // Address Fields
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface MachineryApplicationFromProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string; 
  loanCategory?: 'personal' | 'business';
}

const MachineryApplicationFrom: React.FC<MachineryApplicationFromProps> = ({ 
  isOpen, 
  onClose, 
  loanType = "Loan Application",
  loanCategory = 'personal'
}) => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    employmentType: 'Salaried',
    monthlyIncome: '',
    businessName: '',
    turnover: '',
    vintage: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });


  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Reset state on open
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);

      }, 300);
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
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      if (phoneError) setPhoneError(null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const nextStep = () => {
    // Step 1 Validation
    if (step === 1) {
      const phoneValidation = validateIndianMobile(formData.mobile);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
      
      if (!formData.fullName.trim()) {
        alert("Please enter your full name.");
        return;
      }
    }
    
    // Step 2 Validation
    if (step === 2) {
      if (loanCategory === 'personal' && !formData.monthlyIncome) {
        alert("Please enter your monthly income.");
        return;
      }
      if (loanCategory === 'business' && (!formData.businessName || !formData.turnover)) {
        alert("Please fill in your business details.");
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
        alert("Please fill in your complete address details.");
        return;
    }

    setIsLoading(true);

    try {
      const profileId = await getClientProfileId();
      const payload = {
        full_name: formData.fullName,
        mobile_number: formData.mobile,
        product_category: loanCategory === 'business' ? 'Business Loan' : 'Personal Loan',
        product_type: loanType || 'Machinery Loan',
        
        // Address Mapping
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        source: 'website',
        metadata: {
          ...(loanCategory === 'business' ? {
            businessName: formData.businessName,
            turnover: formData.turnover,
            vintage: formData.vintage
          } : {
            employmentType: formData.employmentType,
            monthlyIncome: formData.monthlyIncome
          })
        },
        profileId: profileId || undefined
      };

      const submitPayload = payload;

      console.log('📤 Submitting machinery application...', payload);

      const res = await submitApplication(submitPayload);
      
      if (res && res.success) {
        setStep(4); // Success Step

        alert(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ Submission error:', err);
      alert(err?.message || 'Submission failed. Please try again.');
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
              className="h-full bg-orange-600 transition-all duration-500 ease-out" 
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
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Information</h4>
                <p className="text-sm text-slate-500">We need this to verify your identity.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  placeholder="As per PAN Card" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
                  <input 
                    name="mobile" 
                    type="tel"
                    inputMode="numeric"
                    maxLength={10} 
                    value={formData.mobile} 
                    onChange={handleInputChange} 
                    placeholder="99999 00000" 
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium ${phoneError ? 'border-red-500' : 'border-slate-200'}`}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-600 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              <button 
                onClick={nextStep} 
                className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* --- STEP 2: BUSINESS/PERSONAL PROFILE --- */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    <input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Acme Industries" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Turnover</label>
                        <select name="turnover" value={formData.turnover} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-700">
                            <option value="">Select</option>
                            <option value="<20L">Less than 20L</option>
                            <option value="20L-1Cr">20L - 1 Cr</option>
                            <option value="1Cr-5Cr">1 Cr - 5 Cr</option>
                            <option value=">5Cr">Above 5 Cr</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Vintage</label>
                        <select name="vintage" value={formData.vintage} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-700">
                            <option value="">Years</option>
                            <option value="<2">New (&lt;2 Yrs)</option>
                            <option value="2-5">2-5 Years</option>
                            <option value="5+">5+ Years</option>
                        </select>
                    </div>
                  </div>
                </>
              ) : (
              /* --- PERSONAL FIELDS --- */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Salaried' ? 'border-orange-500 bg-orange-50/50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="employmentType" value="Salaried" checked={formData.employmentType === 'Salaried'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-bold">Salaried</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.employmentType === 'Self-Employed' ? 'border-orange-500 bg-orange-50/50 text-orange-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="employmentType" value="Self-Employed" checked={formData.employmentType === 'Self-Employed'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-bold">Self-Employed</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Monthly Income</label>
                    <input name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleInputChange} placeholder="e.g. 45000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={prevStep} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={nextStep} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: ADDRESS --- */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Current Location</h4>
                <p className="text-sm text-slate-500">We need your address for verification.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 1</label>
                <input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Factory / Shop No, Street" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Address Line 2 (Optional)</label>
                <input name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Area, Landmark" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">City</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                  <input name="pincode" type="number" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="000000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">State</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium" />
                </div>
              </div>



              <div className="flex gap-3 pt-2">
                <button onClick={prevStep} className="px-5 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading} 
                  className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
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
                Thank you, <b>{formData.fullName}</b>. Our machinery loan team will contact you on <b>{formData.mobile}</b> shortly.
              </p>
              <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg transition-all">
                Back to Home
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        {step < 4 && (
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

export default MachineryApplicationFrom;