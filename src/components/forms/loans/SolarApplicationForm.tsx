'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';
import { submitApplication } from '../../../services/firestoreService';
import { X, User, Sun, Check, Loader2, MapPin, Zap, ArrowRight, IndianRupee } from 'lucide-react';

interface SolarFormData {
  fullName: string;
  mobile: string;
  pincode: string;
  monthlyBill: string;
  installationSize: string;
  panelsType: string;
  roofType: string;
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
  const [formData, setFormData] = useState<SolarFormData>({
    fullName: '',
    mobile: '',
    pincode: '',
    monthlyBill: '',
    installationSize: '',
    panelsType: 'Monocrystalline',
    roofType: 'Concrete'
  });

  // Reset state on open/close
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const prevOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      timer = setTimeout(() => setStep(1), 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen]);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Step 1 Validation
  const handleNextStep = () => {
    if (!formData.fullName.trim() || formData.mobile.length < 10) {
      alert('Please enter a valid Name and 10-digit Mobile Number.');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation & Submit
  const handleFinalSubmit = async () => {
    if (!formData.pincode || !formData.monthlyBill) {
      alert('Please fill in your location and electricity bill details.');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        pincode: formData.pincode,
        loanType: 'solar-loan',
        metadata: {
          monthlyBill: formData.monthlyBill,
          installationSize: formData.installationSize,
          panelsType: formData.panelsType,
          roofType: formData.roofType,
          loanCategory
        }
      };

      const res = await submitApplication(payload);
      
      if (res && res.success) {
        setStep(3); // Move to Success Screen
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
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-100">
                Subsidy Available
              </span>
            </h3>
            <p className="text-xs text-slate-500">Go green with easy EMIs</p>
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
              className="h-full bg-green-600 transition-all duration-500 ease-out" 
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
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-green-100">
                  <User className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Contact Details</h4>
                <p className="text-sm text-slate-500">We need this to generate your solar quote.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInput} 
                  placeholder="e.g. Rajesh Kumar" 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
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
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                onClick={handleNextStep} 
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Solar & Roof Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-yellow-100">
                  <Sun className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Installation Details</h4>
                <p className="text-sm text-slate-500">Tell us about your energy needs.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Monthly Bill</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      name="monthlyBill" 
                      type="number" 
                      value={formData.monthlyBill} 
                      onChange={handleInput} 
                      placeholder="e.g. 3500" 
                      className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                    />
                  </div>
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
                      className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Panel Preference</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Monocrystalline', 'Polycrystalline'].map((type) => (
                    <label key={type} className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center text-sm font-bold transition-all ${formData.panelsType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                      <input 
                        type="radio" 
                        name="panelsType" 
                        value={type} 
                        checked={formData.panelsType === type} 
                        onChange={handleInput} 
                        className="hidden" 
                      />
                      {type === 'Monocrystalline' ? 'Mono (High Eff.)' : 'Poly (Standard)'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Roof Type</label>
                    <select 
                      name="roofType" 
                      value={formData.roofType} 
                      onChange={handleInput} 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-700"
                    >
                      <option value="Concrete">Concrete</option>
                      <option value="Metal Shed">Metal Shed</option>
                      <option value="Tiles">Tiles</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Size (Optional)</label>
                    <input 
                      name="installationSize" 
                      value={formData.installationSize} 
                      onChange={handleInput} 
                      placeholder="e.g. 5 kW" 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                    />
                 </div>
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
                  className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Free Quote'}
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
        {step < 3 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
              100% Free Consultation & Site Visit
            </p>
          </div>
        )}
      </div>
    </div>
  );
}