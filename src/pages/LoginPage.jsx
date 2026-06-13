import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function LoginPage() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const isPhoneValid = phone.length === 10;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhone(val);
  };

  const handleSendOTP = () => {
    if (!isPhoneValid) {
      toast.error(tLabel('Please enter a valid 10-digit Mobile Number', 'தயவுசெய்து செல்லுபடியாகும் 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்'));
      return;
    }
    setOtpSent(true);
    toast.success(tLabel('Mock OTP sent successfully! (Use any 6 digits)', 'மாதிரி OTP வெற்றிகரமாக அனுப்பப்பட்டது! (ஏதேனும் 6 இலக்கங்களைப் பயன்படுத்தவும்)'));
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast.error(tLabel('Please enter the 6-digit OTP', 'தயவுசெய்து 6-இலக்க OTP-ஐ உள்ளிடவும்'));
      return;
    }
    setOtpVerified(true);
    toast.success(tLabel('Aadhaar eKYC Verified Successfully!', 'ஆதார் இ-கேஒய்சி வெற்றிகரமாக சரிபார்க்கப்பட்டது!'));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error(tLabel('Please complete Aadhaar OTP verification first', 'தயவுசெய்து முதலில் ஆதார் OTP சரிபார்ப்பை பூர்த்தி செய்யவும்'));
      return;
    }

    try {
      const response = await api.post('/auth/citizen/login', {
        phone: phone
      });

      const { token, citizen } = response.data;
      
      // Clear any existing employee session
      localStorage.removeItem('jn_emp_role');
      localStorage.removeItem('jn_emp_dept');
      localStorage.removeItem('jn_emp_jurisdiction');
      localStorage.removeItem('jn_emp_district');
      localStorage.removeItem('jn_emp_constituency');

      // Save backend token and citizen details
      localStorage.setItem('jn_token', token);
      localStorage.setItem('jn_user_id', citizen.id);
      localStorage.setItem('jn_role', 'citizen');
      localStorage.setItem('jn_name', citizen.name);
      localStorage.setItem('jn_is_volunteer', citizen.isVolunteer ? 'true' : 'false');
      localStorage.setItem('jn_volunteer_ward', citizen.volunteerWard || '');

      // Handle location detail restoration
      const storedDistrict = localStorage.getItem('jn_district') || citizen.district || 'Chennai';
      const coords = {
        lat: citizen.jurisdiction?.lat || 10.8505,
        lng: citizen.jurisdiction?.lng || 78.6677
      };

      if (!localStorage.getItem('jn_district')) {
        localStorage.setItem('jn_district', storedDistrict);
        localStorage.setItem('jn_living_district', storedDistrict);
        localStorage.setItem('jn_living_lat', coords.lat.toString());
        localStorage.setItem('jn_living_lng', coords.lng.toString());
        localStorage.setItem('jn_ward_name', 'Ward 1');
        localStorage.setItem('jn_ward_number', '1');
        localStorage.setItem('jn_living_ward', 'Ward 1');
        localStorage.setItem('jn_pincode', '600001');
        localStorage.setItem('jn_area', 'Parrys');
        
        const completeAddress = `Parrys, ${storedDistrict}, Tamil Nadu - 600001`;
        localStorage.setItem('jn_living_address', completeAddress);
      }

      toast.success(tLabel(
        `Identity Verified: Welcome CITIZEN`,
        `அடையாளம் சரிபார்க்கப்பட்டது: நல்வரவு குடிமகன்`
      ));

      navigate('/citizen');
    } catch (err) {
      if (err.response?.data?.code === 'NOT_REGISTERED') {
        toast.info(tLabel('Account not found. Redirecting to Sign Up...', 'கணக்கு கிடைக்கவில்லை. பதிவுக்கு மாற்றப்படுகிறது...'));
        navigate('/signup');
      } else {
        toast.error(tLabel('Login Failed', 'உள்நுழைய முடியவில்லை'));
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ta' : 'en';
    toggleLang(newLang);
    toast.success(newLang === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#8B1A1A]/10 selection:text-[#8B1A1A]">
      {/* Top Government Color Bar */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Header with Bilingual Toggle */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-2 select-none">
          <Shield className="w-5 h-5 text-[#8B1A1A]" />
          <span className="text-xs font-black text-[#8B1A1A] tracking-wider uppercase">JanaNayagam</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#8B1A1A]/20 bg-white hover:bg-slate-50 text-[#8B1A1A] shadow-sm transition-all"
        >
          {lang === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        {/* TOP SECTION (Centred) */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 select-none">
            <Shield className="w-[30px] h-[30px] text-[#8B1A1A]" />
          </div>
          <h1 className="text-[28px] font-black tracking-widest leading-none text-[#8B1A1A]" style={{ letterSpacing: '0.12em' }}>
            {tLabel('JANANAYAGAM', 'ஜனநாயகம்')}
          </h1>
          <p className="text-[11px] font-extrabold text-slate-400 tracking-widest mt-2 uppercase" style={{ letterSpacing: '0.1em' }}>
            {tLabel('TAMIL NADU CIVIC COMMAND CENTER', 'தமிழ்நாடு குடிமை கட்டளை மையம்')}
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white rounded-[20px] p-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/80">
          
          <h2 className="text-lg font-bold text-center text-[#8B1A1A] mb-4">
            {tLabel('Citizen Login', 'குடிமகன் உள்நுழைவு')}
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* STEP 1 — Aadhaar Verification Row */}
            <div className="space-y-3.5">
              
              {/* Govt Link Pill Indicator */}
              <div className="w-full bg-[#FFF0F0] text-[#8B1A1A] rounded-full py-2.5 px-4 flex items-center justify-center gap-2 select-none border border-[#FFD8D8]">
                <Shield className="w-4 h-4 text-[#8B1A1A] fill-[#8B1A1A]/10" />
                <span className="font-extrabold text-[13px] tracking-wider">
                  {t('govtKycLinking')}
                </span>
              </div>

              {/* Mobile Number Input Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                  {tLabel('Mobile Number', 'மொபைல் எண்')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      disabled={otpSent}
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 disabled:opacity-80 disabled:bg-slate-50/50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal focus:border-[#8B1A1A] transition-all"
                    />
                    {isPhoneValid && !otpSent && (
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                    {otpVerified && (
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      </div>
                    )}
                  </div>
                  
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="px-4 bg-[#8B1A1A] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {t('sendOtp')}
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Field (Only show after Send OTP clicked and not verified) */}
              {otpSent && !otpVerified && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel('ENTER 6-DIGIT OTP', 'ஒடிபி (OTP) உள்ளிடவும்')}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="px-4 bg-[#8B1A1A] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all shrink-0 whitespace-nowrap"
                    >
                      {tLabel('Verify OTP', 'சரிபார்')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <AnimatePresence>
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-1"
                >
                  <button
                    type="submit"
                    style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                    className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{tLabel('Enter Command Center', 'கட்டளை மையத்திற்குள் நுழையவும்')}</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* SIGN UP & OFFICIAL PORTAL LINKS */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div style={{ textAlign: 'center' }}>
            <p className="text-xs text-slate-400 mb-1">{tLabel('New here?', 'புதியவரா?')}</p>
            <button
              onClick={() => navigate('/signup')}
              className="text-[#8B1A1A] font-bold text-sm underline underline-offset-2"
            >
              {tLabel('Register / Sign Up', 'பதிவு செய்யவும்')} →
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p className="text-xs text-slate-400 mb-1">{t('officialPortal').split('?')[0]}?</p>
            <button
              onClick={() => navigate('/employee-login')}
              className="text-[#8B1A1A] font-bold text-sm underline underline-offset-2"
            >
              {t('officialPortal').split('?')[1]?.trim() || 'Access Official Portal'} →
            </button>
          </div>
        </div>

        {/* BOTTOM SECURED NOTE */}
        <p className="text-center text-[11px] text-slate-400 font-bold tracking-wide mt-4 select-none">
          {tLabel(
            'Secured by Aadhaar eKYC · Tamil Nadu Government',
            'ஆதார் இ-கேஒய்சி மூலம் பாதுகாக்கப்பட்டது · தமிழ்நாடு அரசு'
          )}
        </p>
      </main>

      {/* Footer bar */}
      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold shrink-0 border-t border-slate-300/30">
        <p>© 2026 Tamil Nadu e-Governance Agency (TNeGA). All rights reserved.</p>
      </footer>
    </div>
  );
}
