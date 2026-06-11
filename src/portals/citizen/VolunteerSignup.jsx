import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Handshake, ShieldCheck, MapPin, User, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export default function VolunteerSignup() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: localStorage.getItem('jn_name') || '',
    mobile: localStorage.getItem('jn_phone') || '',
    ward: localStorage.getItem('jn_ward_name') || '',
    aadhaar: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/citizen/volunteer', {
        isVolunteer: true,
        volunteerWard: formData.ward
      });
      toast.success(tLabel('Registration Successful!', 'பதிவு வெற்றிகரமாக முடிந்தது!'));
      localStorage.setItem('jn_is_volunteer', 'true');
      localStorage.setItem('jn_volunteer_ward', formData.ward);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(tLabel('Failed to register as volunteer', 'தன்னார்வலராக பதிவு செய்ய முடியவில்லை'));
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-50 flex items-center gap-3 h-14">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
          {tLabel('Volunteer Signup', 'தன்னார்வலர் பதிவு')}
        </h2>
      </div>

      <div className="p-4">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Hero */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-md space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                <Handshake className="w-8 h-8 text-[#8B1A1A]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">
                  {tLabel('Become a JanaNayagam', 'ஜனநாயகமாக மாறுங்கள்')}
                </h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  {tLabel('Empower your ward by becoming a verified volunteer. Help others file issues and escalate critical problems.', 'வார்டுக்கு தன்னார்வலராகி, மற்றவர்களுக்கு உதவுங்கள்.')}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {tLabel('Full Name', 'முழு பெயர்')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#8B1A1A] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {tLabel('Mobile Number', 'கைபேசி எண்')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#8B1A1A] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {tLabel('Assigned Ward', 'ஒதுக்கப்பட்ட வார்டு')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value={formData.ward}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {tLabel('Aadhaar Number (Optional)', 'ஆதார் எண் (விருப்பத்தேர்வு)')}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#8B1A1A] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B1A1A] text-white font-black text-sm py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all mt-4"
              >
                {tLabel('Complete Registration', 'பதிவை முடி')}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">
                {tLabel('Welcome aboard!', 'வரவேற்கிறோம்!')}
              </h3>
              <p className="text-sm font-bold text-slate-400 max-w-[260px]">
                {tLabel('You are now a JanaNayagam volunteer for your ward.', 'நீங்கள் இப்போது உங்கள் வார்டின் தன்னார்வலர்.')}
              </p>
            </div>
            <button
              onClick={() => navigate('/citizen/volunteer-dashboard')}
              className="w-full bg-[#8B1A1A] text-white font-black text-sm py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
            >
              {tLabel('Go to Volunteer Dashboard →', 'தன்னார்வலர் டாஷ்போர்டுக்குச் செல்லவும் →')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
