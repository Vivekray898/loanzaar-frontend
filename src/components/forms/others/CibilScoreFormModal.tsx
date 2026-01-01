'use client'

import React, { useState, useRef } from 'react';
import Turnstile from '@/components/Turnstile';
import { submitApplication, getClientProfileId } from '@/services/supabaseService';
import { User, Phone, CreditCard, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CibilScoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CibilScoreFormModal: React.FC<CibilScoreFormModalProps> = ({ isOpen, onClose }) => {
  const turnstileRef = useRef<any>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    panNumber: '',
    consent: false
  });

  // Validation Logic
  const validateField = (field: string, value: any) => {
    const errors = { ...fieldErrors };
    switch (field) {
      case 'fullName':
        if (!value.trim()) errors.fullName = 'Required';
        else delete errors.fullName;
        break;
      case 'phone':
        if (!/^[6-9]\d{9}$/.test(value)) errors.phone = 'Invalid phone';
        else delete errors.phone;
        break;
      case 'panNumber':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) errors.panNumber = 'Invalid PAN';
        else delete errors.panNumber;
        break;
      default: break;
    }
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) { alert('Please accept terms.'); return; }
    if (!captchaToken) { alert('Please verify you are human.'); return; }
    // Final synchronous validation: trim strings and sanitize phone
    const errors: Record<string, string> = { ...fieldErrors };

    const fullName = (formData.fullName || '').trim();
    const phoneSanitized = (formData.phone || '').toString().replace(/\D/g, '');
    // If user pasted +91XXXXXXXXXX keep last 10 digits
    const phone = phoneSanitized.length > 10 ? phoneSanitized.slice(-10) : phoneSanitized;
    const pan = (formData.panNumber || '').toString().trim().toUpperCase();

    if (!fullName) errors.fullName = 'Required'; else delete errors.fullName;
    if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Invalid phone'; else delete errors.phone;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) errors.panNumber = 'Invalid PAN'; else delete errors.panNumber;

    setFieldErrors(errors);

    const hasErrors = Object.keys(errors).length > 0;
    const hasEmpty = [fullName, phone, pan].some(v => v === '');

    if (hasErrors || hasEmpty) {
      alert('Please fix errors or fill all fields.');
      return;
    }

    // update sanitized values into state so payload is clean
    setFormData(prev => ({ ...prev, fullName, phone, panNumber: pan }));

    setIsLoading(true);
    try {
      const profileId = await getClientProfileId();
      const payload = {
        fullName: formData.fullName,
        mobile: formData.phone,
        email: null,
        city: null,
        loanType: 'CIBIL Score Request',
        source: 'website',
        metadata: {
          panNumber: formData.panNumber
        },
        profileId: profileId || undefined
      };

      const submitPayload = captchaToken ? { ...payload, captchaToken } : payload;

      const res = await submitApplication(submitPayload);

      if (res && res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
          setFormData({ fullName: '', phone: '', panNumber: '', consent: false });
          setCaptchaToken(null);
        }, 3000);
      } else {
        console.error('CIBIL submission failed', res);
        alert(res?.message || 'Failed to submit. Please try again later.');
      }
    } catch (err) {
      console.error('Error submitting CIBIL form', err);
      alert('Error submitting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-50 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center rounded-t-3xl">
          <h3 className="font-black text-slate-900 text-lg">Your Details</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Full Name (As per PAN)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    value={formData.fullName}
                    onChange={(e) => { setFormData({...formData, fullName: e.target.value}); validateField('fullName', e.target.value); }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                    placeholder="John Doe"
                  />
                </div>
                {fieldErrors.fullName && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" maxLength={10}
                    value={formData.phone}
                    onChange={(e) => { 
                      const v = e.target.value.replace(/\D/g,''); 
                      setFormData({...formData, phone: v}); 
                      validateField('phone', v); 
                    }}
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                    placeholder="9876543210"
                  />
                </div>
                {fieldErrors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">PAN Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    value={formData.panNumber}
                    maxLength={10}
                    onChange={(e) => { 
                      const v = e.target.value.toUpperCase(); 
                      setFormData({...formData, panNumber: v}); 
                      validateField('panNumber', v); 
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wide ${fieldErrors.panNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                    placeholder="ABCDE1234F"
                  />
                </div>
                {fieldErrors.panNumber && <p className="text-[10px] text-red-500 mt-1 font-medium">{fieldErrors.panNumber}</p>}
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <input 
                  type="checkbox" id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                  className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-[11px] text-blue-800 leading-snug">
                  I agree to the Terms & Privacy Policy. I authorize Loanzaar to fetch my credit report from the bureau.
                </label>
              </div>

              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onVerify={setCaptchaToken}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>Get My Score Now <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Sent!</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                We are fetching your report. You will receive an email with the details shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CibilScoreFormModal;