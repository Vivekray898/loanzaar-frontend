'use client'

import React, { useState, useRef } from 'react';
import Turnstile from '@/components/Turnstile';
import { submitApplication } from '@/services/supabaseService';
import { 
  User, Mail, Phone, ChevronDown, X, CheckCircle2, LucideIcon 
} from 'lucide-react';

interface CreditCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTypes: Array<{ name: string; icon: LucideIcon; desc: string; color: string; }>;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cardType: string;
  monthlyIncome: string;
  employmentType: string;
  message: string;
  consent: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({ isOpen, onClose, cardTypes }) => {
  const turnstileRef = useRef<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cardType: 'Shopping',
    monthlyIncome: '',
    employmentType: 'Salaried',
    message: '',
    consent: false
  });

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const validateField = (fieldName: string, value: string) => {
    const errors = { ...fieldErrors };
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) errors.fullName = 'Full name is required';
        else if (value.trim().length < 2) errors.fullName = 'Min 2 characters required';
        else delete errors.fullName;
        break;
      case 'phone':
        if (!/^[6-9]\d{9}$/.test(value)) errors.phone = 'Invalid 10-digit number';
        else delete errors.phone;
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Invalid email address';
        else delete errors.email;
        break;
    }
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasErrors = Object.keys(fieldErrors).length > 0;
    const missingFields = !formData.fullName || !formData.email || !formData.phone;
    
    if (hasErrors || missingFields) {
      alert("Please check all fields.");
      return;
    }
    if (!captchaToken) { alert('Please verify you are human.'); return; }
    if (!formData.consent) { alert('Please accept terms.'); return; }

    setIsLoading(true);

    try {
         const payload = {
            fullName: formData.fullName,
            email: formData.email,
            mobile: formData.phone,
            loanType: 'Credit Card Application',
            product_type: 'credit-card',
            source: 'website',
            submittedAt: new Date().toISOString(),
            metadata: {
               cardType: formData.cardType,
               monthlyIncome: formData.monthlyIncome,
               employmentType: formData.employmentType,
               message: formData.message
            }
         };

         const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

         const result = await submitApplication(submitPayload);

         if (result && result.success) {
            setSubmitted(true);
            setTimeout(() => {
               setSubmitted(false);
               onClose();
               setFormData({
                  fullName: '', email: '', phone: '', cardType: 'Shopping',
                  monthlyIncome: '', employmentType: 'Salaried', message: '', consent: false
               });
               setCaptchaToken(null);
            }, 3000);
         } else {
            console.error('Credit card submission failed', result);
            alert(result?.message || 'Failed to submit application');
         }
    } catch (error) {
      console.error('Submission Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
       {/* Backdrop */}
       <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
       ></div>
       
       {/* Modal */}
       <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 sm:fade-in duration-300 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-black text-slate-900 text-lg">Quick Application</h3>
             <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
             </button>
          </div>

          <div className="p-6">
             {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                   
                   {/* Personal Details */}
                   <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Details</h4>
                      <div className="relative">
                         <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                         <input 
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => { setFormData({...formData, fullName: e.target.value}); validateField('fullName', e.target.value); }}
                            className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.fullName ? 'border-red-300' : 'border-slate-200'}`}
                            placeholder="Full Name"
                         />
                      </div>
                      {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="relative">
                            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input 
                               type="tel" maxLength={10}
                               value={formData.phone}
                               onChange={(e) => { setFormData({...formData, phone: e.target.value.replace(/\D/g, '')}); validateField('phone', e.target.value); }}
                               className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.phone ? 'border-red-300' : 'border-slate-200'}`}
                               placeholder="Mobile Number"
                            />
                         </div>
                         <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input 
                               type="email"
                               value={formData.email}
                               onChange={(e) => { setFormData({...formData, email: e.target.value}); validateField('email', e.target.value); }}
                               className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-300' : 'border-slate-200'}`}
                               placeholder="Email ID"
                            />
                         </div>
                      </div>
                   </div>

                   {/* Employment Details */}
                   <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="relative">
                            <select 
                               value={formData.monthlyIncome}
                               onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                               <option value="">Monthly Income</option>
                               <option value="<20k">Less than 20k</option>
                               <option value="20k-50k">20k - 50k</option>
                               <option value="50k-1L">50k - 1L</option>
                               <option value=">1L">More than 1L</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                         <div className="relative">
                            <select 
                               value={formData.cardType}
                               onChange={(e) => setFormData({...formData, cardType: e.target.value})}
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                               {cardTypes.map(c => <option key={c.name} value={c.name}>{c.name} Card</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                      </div>
                      
                      <div className="flex bg-slate-50 p-1 rounded-xl">
                         {['Salaried', 'Self-Employed'].map((type) => (
                            <button
                               key={type}
                               type="button"
                               onClick={() => setFormData({...formData, employmentType: type})}
                               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.employmentType === type ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                               {type}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Consent & Submit */}
                   <div className="pt-2 space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                         <input 
                            type="checkbox" 
                            checked={formData.consent}
                            onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                         />
                         <span className="text-xs text-slate-500 leading-snug">
                            I authorize Loanzaar to contact me regarding my application and agree to the <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>.
                         </span>
                      </label>

                      <div className="flex justify-center">
                         <Turnstile 
                            ref={turnstileRef}
                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                            onVerify={handleCaptchaChange}
                         />
                      </div>

                      <button 
                         type="submit" 
                         disabled={isLoading}
                         className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                      >
                         {isLoading ? 'Processing...' : 'Submit Application'}
                      </button>
                   </div>
                </form>
             ) : (
                <div className="text-center py-16 space-y-4">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900">Application Received!</h3>
                      <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                         Our team will review your details and contact you shortly with the best offers.
                      </p>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default CreditCardFormModal;