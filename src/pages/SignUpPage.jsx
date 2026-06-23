import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function SignUpPage() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Form selections
  const [district, setDistrict] = useState('');
  const [dbDistricts, setDbDistricts] = useState([]);
  const [dbWards, setDbWards] = useState([]);

  useEffect(() => {
    // Fetch real districts from API
    api.get('/metadata/jurisdictions?level=DISTRICT')
      .then(res => setDbDistricts(res.data))
      .catch(console.error);
  }, []);

  // Pincode Auto-Suggest Ward flow states
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [apiDistrictInfo, setApiDistrictInfo] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [isDistrictLocked, setIsDistrictLocked] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');

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

  const fetchPincodeDetails = async (pin) => {
    setPincodeLoading(true);
    setPincodeStatus('idle');
    
    // Simulate a brief loading delay to showcase premium UX spinner
    await new Promise(resolve => setTimeout(resolve, 450));

    try {
      const response = await api.get(`/metadata/pincode/${pin}`);
      const data = response.data;
      
      if (data && data.length > 0 && pin === '600004') {
        const placeList = data.map(p => p.place);
        const districtName = data[0].district;
        
        setAreas(placeList);
        setPincodeStatus('success');
        setDistrict(districtName);
        setApiDistrictInfo(`${districtName}, Tamil Nadu`);
        setIsDistrictLocked(true);
        toast.success(tLabel("Pincode located!", "பின்கோடு கண்டறியப்பட்டது!"));
      } else {
        setPincodeStatus('error');
        setAreas([]);
        toast.error(tLabel("Currently, only Mylapore - Chennai is supported. Please use pincode 600004.", "தற்போது, மயிலாப்பூர் - சென்னை மட்டுமே ஆதரிக்கப்படுகிறது. தயவுசெய்து பின்கோடு 600004 ஐப் பயன்படுத்தவும்."));
      }
    } catch (err) {
      console.error('Pincode lookup failed:', err);
      setPincodeStatus('error');
      setAreas([]);
      toast.error(tLabel("Pincode service error.", "பின்கோடு சேவை பிழை."));
    }
    setPincodeLoading(false);
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPincode(value);
      setPincodeStatus('idle');
      
      if (value.length === 6) {
        // Auto-blur input
        e.target.blur();
        // Trigger lookup
        await fetchPincodeDetails(value);
      } else {
        // Clear dependent fields if pincode is not 6 digits
        setAreas([]);
        setSelectedArea('');
        setSelectedWard('');
      }
    }
  };

  useEffect(() => {
    if (!district) return;
    
    // Fetch all wards directly to avoid hierarchical mismatch issues
    api.get(`/metadata/jurisdictions?level=WARD`)
      .then(res => {
        const filtered = res.data.filter(w => w.name === 'Mylapore Section');
        setDbWards(filtered);
        
        // Auto-select if it's the only one
        if (filtered.length === 1) {
          setSelectedWard(filtered[0].name);
        }
      })
      .catch(console.error);
  }, [district]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error(tLabel('Please complete Aadhaar OTP verification first', 'தயவுசெய்து முதலில் ஆதார் OTP சரிபார்ப்பை பூர்த்தி செய்யவும்'));
      return;
    }

    if (!citizenName.trim()) {
      toast.error(tLabel('Please enter your full name', 'தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்'));
      return;
    }

    if (pincode.length !== 6 || pincodeStatus !== 'success') {
      toast.error(tLabel('Please enter a valid 6-digit Pincode and complete lookup', 'தயவுசெய்து செல்லுபடியாகும் 6-இலக்க பின்கோடை உள்ளிட்டு சரிபார்ப்பை பூர்த்தி செய்யவும்'));
      return;
    }

    if (!selectedArea) {
      toast.error(tLabel('Please select your Area / Locality', 'தயவுசெய்து உங்கள் பகுதி / வட்டாரத்தைத் தேர்ந்தெடுக்கவும்'));
      return;
    }

    if (!selectedWard) {
      toast.error(tLabel('Please select your Ward', 'தயவுசெய்து உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்'));
      return;
    }

    // Just use selectedWard name directly or a default hash if missing
    let wardNumber = '1';
    const match = selectedWard.match(/\d+/);
    if (match) {
      wardNumber = match[0];
    }

    // Lookup coordinates by dynamic district data
    const selectedDistObj = dbDistricts.find(d => d.name === district);
    const coords = { 
      lat: selectedDistObj?.lat || 10.8505, 
      lng: selectedDistObj?.lng || 78.6677 
    };

    try {
      const response = await api.post('/auth/citizen/signup', {
        phone: phone,
        name: citizenName,
        district: district
      });

      const { token, citizen } = response.data;
      
      // Save backend token and citizen details
      localStorage.setItem('jn_token', token);
      localStorage.setItem('jn_user_id', citizen.id);
      localStorage.setItem('jn_role', 'citizen');
      localStorage.setItem('jn_name', citizen.name);
      localStorage.setItem('jn_is_volunteer', citizen.isVolunteer ? 'true' : 'false');
      localStorage.setItem('jn_volunteer_ward', citizen.volunteerWard || '');

      // Save Pincode & Location details
      localStorage.setItem('jn_pincode', pincode);
      localStorage.setItem('jn_area', selectedArea);
      localStorage.setItem('jn_ward_name', selectedWard);
      localStorage.setItem('jn_ward_number', wardNumber);
      localStorage.setItem('jn_district', district);
      localStorage.setItem('jn_living_lat', coords.lat.toString());
      localStorage.setItem('jn_living_lng', coords.lng.toString());

      const completeAddress = `${selectedArea}, ${district}, Tamil Nadu - ${pincode}`;
      localStorage.setItem('jn_living_address', completeAddress);
      localStorage.setItem('jn_living_district', district);
      localStorage.setItem('jn_living_ward', `Ward ${wardNumber}`);
      
      const today = new Date();
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + 90);
      localStorage.setItem('jn_location_last_updated', today.toISOString());
      localStorage.setItem('jn_location_next_update', nextDate.toISOString());

      toast.success(tLabel(
        `Registration Successful! Welcome CITIZEN`,
        `பதிவு வெற்றிகரமாக முடிந்தது! நல்வரவு குடிமகன்`
      ));

      navigate('/citizen');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      toast.error(tLabel(errorMsg, 'பதிவு செய்ய முடியவில்லை'));
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

        {/* REGISTRATION CARD */}
        <div className="w-full max-w-md bg-white rounded-[20px] p-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/80">
          
          <h2 className="text-lg font-bold text-center text-[#8B1A1A] mb-4">
            {tLabel('Citizen Registration', 'குடிமகன் பதிவு')}
          </h2>

          <form onSubmit={handleSignUp} className="space-y-5">
            
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

              {/* OTP Field */}
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

            {/* Profile and Location Details (Only show after OTP verified) */}
            <AnimatePresence>
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 overflow-visible pt-1"
                >
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('Full Name', 'முழு பெயர்')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder={tLabel('Enter your full name', 'உங்கள் முழு பெயரை உள்ளிடவும்')}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-800 font-extrabold text-sm shadow-sm tracking-wide"
                      />
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-[#FF9800] font-bold mt-1.5 select-none">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                      <span>{tLabel('Name is locked to Official Govt Database.', 'பெயர் அரசு அதிகாரப்பூர்வ தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது.')}</span>
                    </div>
                  </div>

                  {/* PINCODE input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {t('pincode')}
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="e.g. 600001"
                        style={{ height: '52px' }}
                        className="w-full bg-white border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal transition-all"
                      />
                      {pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <svg className="animate-spin h-4 w-4 text-[#8B1A1A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {pincodeStatus === 'success' && !pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                        </div>
                      )}
                      {pincodeStatus === 'error' && !pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <AlertTriangle className="w-5 h-5 text-[#F44336]" />
                        </div>
                      )}
                    </div>

                    {/* Success / Error labels */}
                    {pincodeStatus === 'success' && apiDistrictInfo && (
                      <div className="text-[12px] font-black text-emerald-600 pl-1 animate-in fade-in slide-in-from-top-1">
                        ✓ {apiDistrictInfo}
                      </div>
                    )}
                    {pincodeStatus === 'error' && (
                      <div className="text-[12px] font-black text-[#F44336] pl-1 animate-in fade-in slide-in-from-top-1">
                        {tLabel("Currently, only Mylapore - Chennai is supported. Please use pincode 600004.", "தற்போது, மயிலாப்பூர் - சென்னை மட்டுமே ஆதரிக்கப்படுகிறது. தயவுசெய்து பின்கோடு 600004 ஐப் பயன்படுத்தவும்.")}
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-lg p-2.5 flex items-start gap-2 select-none">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#1976D2] shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-[#1976D2] leading-normal">
                        {tLabel(
                          "Enter your home pincode — not your office or workplace pincode.",
                          "உங்கள் வீட்டு பின்கோடை உள்ளிடவும் — அலுவலக பின்கோடு அல்ல."
                        )}
                      </p>
                    </div>
                  </div>

                  {/* AREA / LOCALITY dropdown */}
                  {pincodeStatus === 'success' && areas.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('AREA / LOCALITY', 'பகுதி / வட்டாரம்')}
                      </label>
                      <select
                        required
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">{tLabel("Select your area", "உங்கள் பகுதியைத் தேர்ந்தெடுக்கவும்")}</option>
                        {areas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* DISTRICT field */}
                  {pincodeStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('DISTRICT', 'மாவட்டம்')}
                      </label>
                      <div className="relative">
                        {isDistrictLocked ? (
                          <>
                            <input
                              type="text"
                              readOnly
                              value={district}
                              className="w-full bg-slate-50/80 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-500 font-extrabold text-sm shadow-sm select-none"
                            />
                            <button
                              type="button"
                              onClick={() => setIsDistrictLocked(false)}
                              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                              title={tLabel("Unlock and edit district", "மாவட்டத்தைத் திருத்தத் திறக்கவும்")}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                          </>
                        ) : (
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-white border border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer transition-all"
                          >
                            {dbDistricts.map(d => (
                              <option key={d.id} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* YOUR WARD dropdown */}
                  {pincodeStatus === 'success' && selectedArea && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('YOUR WARD', 'உங்கள் வார்டு')}
                      </label>
                      <select
                        required
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">{tLabel("Select your ward", "உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்")}</option>
                        {dbWards.map(w => (
                          <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                    className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>{tLabel('Register & Enter Command Center', 'பதிவு செய்து கட்டளை மையத்திற்குள் நுழையவும்')}</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* ALREADY REGISTERED? LOGIN LINK */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p className="text-xs text-slate-400 mb-2">{tLabel('Already have an account?', 'ஏற்கனவே கணக்கு உள்ளதா?')}</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#8B1A1A] font-bold text-sm underline underline-offset-2"
          >
            {tLabel('Citizen Login', 'குடிமகன் உள்நுழைவு')} →
          </button>
        </div>

        {/* BOTTOM SECURED NOTE */}
        <p className="text-center text-[11px] text-slate-400 font-bold tracking-wide mt-2 select-none">
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
