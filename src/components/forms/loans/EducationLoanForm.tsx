'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication } from '@/services/firestoreService';
import { X, GraduationCap, User, Check, Loader2, MapPin } from 'lucide-react';

interface FormData {
  fullName: string;
  mobile: string;
  email?: string;
  course: string;
  institution: string;
  loanAmountDesired: string;
  tenurePreference: string;
  pincode: string;
  city?: string;
}

interface EducationLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  loanType?: string;
}

export default function EducationLoanForm({ isOpen, onClose, loanType = 'Education Loan' }: EducationLoanFormProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    course: '',
    institution: '',
    loanAmountDesired: '',
    tenurePreference: '',
    pincode: '',
    city: ''
  });

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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
    if (!formData.course || !formData.institution || !formData.loanAmountDesired || !formData.pincode) {
      alert('Please fill required education and contact fields.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email || null,
        city: formData.city || null,
        loanType: loanType || 'Education Loan',
        product_type: 'education-loan',
        source: 'website',
        metadata: {
          course: formData.course || null,
          institution: formData.institution || null,
          loanAmountDesired: formData.loanAmountDesired || null,
          tenurePreference: formData.tenurePreference || null,
          pincode: formData.pincode || null
        }
      };

      console.log('📤 Submitting Education Loan application to `applications` table', { mobile: payload.mobile });

      const res = await submitApplication(payload);
      if (res && res.success) {
        console.log('✅ Education loan submitted:', res.docId || res);
        setStep(3);
      } else {
        console.error('❌ Education loan submission failed:', res);
        alert(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting education loan application:', error);
      alert((error as any)?.message || 'An error occurred while submitting.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{loanType}</h3>
            <p className="text-xs text-slate-500">Quick Education Loan Application</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step < 3 && (
          <div className="h-1 w-full bg-slate-100">
            <div className="h-full bg-purple-600 transition-all duration-500 ease-out" style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>
        )}

        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Information</h4>
                <p className="text-sm text-slate-500">We will contact you regarding loan options.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per documents" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-medium">+91</span>
                  <input name="mobile" type="tel" maxLength={10} value={formData.mobile} onChange={handleInputChange} placeholder="99999 00000" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Email (optional)</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
              </div>

              <button onClick={handleNextStep} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-[0.98] transition-all">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Education Details</h4>
                <p className="text-sm text-slate-500">Provide course and institution details.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Course / Program</label>
                <input name="course" value={formData.course} onChange={handleInputChange} placeholder="e.g. MBA" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Institution</label>
                <input name="institution" value={formData.institution} onChange={handleInputChange} placeholder="e.g. ABC University" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Desired Loan Amount</label>
                <input name="loanAmountDesired" value={formData.loanAmountDesired} onChange={handleInputChange} placeholder="e.g. 5,00,000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Preferred Tenure</label>
                <select name="tenurePreference" value={formData.tenurePreference} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium">
                  <option value="">Select</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Current Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input name="pincode" type="number" maxLength={6} value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 110001" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50">Back</button>
                <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Offers'}</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Thank you, <b>{formData.fullName}</b>. Our loan expert will contact you on <b>{formData.mobile}</b> shortly with Education Loan options.</p>
              <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg">Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
