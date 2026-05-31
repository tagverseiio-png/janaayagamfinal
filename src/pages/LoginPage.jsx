import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { getPlacesByPincode, getDistrictByPincode } from '../data/pincodeData';

/* ─── 38 Districts of Tamil Nadu ─────────────────────────────────────── */
const districts = [
  { name: "Chennai", tamil: "சென்னை" },
  { name: "Coimbatore", tamil: "கோயம்புத்தூர்" },
  { name: "Madurai", tamil: "மதுரை" },
  { name: "Salem", tamil: "சேலம்" },
  { name: "Trichy", tamil: "திருச்சி" },
  { name: "Vellore", tamil: "வேலூர்" },
  { name: "Tirunelveli", tamil: "திருநெல்வேலி" },
  { name: "Erode", tamil: "ஈரோடு" },
  { name: "Thanjavur", tamil: "தஞ்சாவூர்" },
  { name: "Dindigul", tamil: "திண்டுக்கல்" },
  { name: "Kancheepuram", tamil: "காஞ்சிபுரம்" },
  { name: "Tiruppur", tamil: "திருப்பூர்" },
  { name: "Thoothukudi", tamil: "தூத்துக்குடி" },
  { name: "Nagercoil", tamil: "நாகர்கோவில்" },
  { name: "Cuddalore", tamil: "கடலூர்" },
  { name: "Villupuram", tamil: "விழுப்புரம்" },
  { name: "Nagapattinam", tamil: "நாகப்பட்டினம்" },
  { name: "Dharmapuri", tamil: "தர்மபுரி" },
  { name: "Krishnagiri", tamil: "கிருஷ்ணகிரி" },
  { name: "Namakkal", tamil: "நாமக்கல்" },
  { name: "Karur", tamil: "கரூர்" },
  { name: "Pudukkottai", tamil: "புதுக்கோட்டை" },
  { name: "Sivaganga", tamil: "சிவகங்கை" },
  { name: "Virudhunagar", tamil: "விருதுநகர்" },
  { name: "Ramanathapuram", tamil: "ராமநாதபுரம்" },
  { name: "Theni", tamil: "தேனி" },
  { name: "Nilgiris", tamil: "நீலகிரி" },
  { name: "Perambalur", tamil: "பெரம்பலூர்" },
  { name: "Ariyalur", tamil: "அரியலூர்" },
  { name: "Tiruvarur", tamil: "திருவாரூர்" },
  { name: "Tiruvannamalai", tamil: "திருவண்ணாமலை" },
  { name: "Kallakurichi", tamil: "கள்ளக்குறிச்சி" },
  { name: "Ranipet", tamil: "ராணிப்பேட்டை" },
  { name: "Tenkasi", tamil: "தென்காசி" },
  { name: "Chengalpattu", tamil: "செங்கல்பட்டு" },
  { name: "Mayiladuthurai", tamil: "மயிலாடுதுறை" },
  { name: "Tirupattur", tamil: "திருப்பூர்" },
  { name: "Harur", tamil: "ஹாரூர்" }
];





/* ─── Hardcoded Wards Mapping by District ────────────────────────────── */
const wardsByDistrict = {
  "Chennai": [
    "Ward 1 - Thiruvottiyur", "Ward 2 - Manali", "Ward 3 - Madhavaram",
    "Ward 4 - Tondiarpet", "Ward 5 - Royapuram", "Ward 6 - Harbour",
    "Ward 7 - Basin Bridge", "Ward 8 - Perambur", "Ward 9 - Kolathur",
    "Ward 10 - Villivakkam", "Ward 11 - Ambattur", "Ward 12 - Annanagar",
    "Ward 13 - Teynampet", "Ward 14 - Egmore", "Ward 15 - Park Town",
    "Ward 16 - Thousand Lights", "Ward 17 - Anna Nagar", "Ward 18 - Valasaravakkam",
    "Ward 19 - Kodambakkam", "Ward 20 - Alandur", "Ward 21 - Adyar",
    "Ward 22 - Velachery", "Ward 23 - Sholinganallur", "Ward 24 - Perungudi",
    "Ward 25 - Madipakkam", "Ward 26 - Guindy", "Ward 27 - Saidapet",
    "Ward 28 - Mylapore", "Ward 29 - Royapettah", "Ward 30 - Nungambakkam"
  ],
  "Coimbatore": [
    "Ward 1 - Ukkadam", "Ward 2 - Singanallur", "Ward 3 - Peelamedu",
    "Ward 4 - RS Puram", "Ward 5 - Gandhipuram", "Ward 6 - Saibaba Colony",
    "Ward 7 - Vadavalli", "Ward 8 - Kuniyamuthur", "Ward 9 - Kavundampalayam",
    "Ward 10 - Thondamuthur"
  ],
  "Madurai": [
    "Ward 1 - Tallakulam", "Ward 2 - Anna Nagar", "Ward 3 - KK Nagar",
    "Ward 4 - Palanganatham", "Ward 5 - Vilangudi", "Ward 6 - Arasaradi",
    "Ward 7 - Thiruppalai", "Ward 8 - Anaiyur", "Ward 9 - Tavithanpatti",
    "Ward 10 - Goripalayam"
  ],
  "Salem": [
    "Ward 1 - Shevapet", "Ward 2 - Suramangalam", "Ward 3 - Hasthampatti",
    "Ward 4 - Kondalampatti", "Ward 5 - Ammapet", "Ward 6 - Alagapuram",
    "Ward 7 - Fairlands", "Ward 8 - Gugai"
  ],
  "Trichy": [
    "Ward 1 - Ariyamangalam", "Ward 2 - Manachanallur", "Ward 3 - Srirangam",
    "Ward 4 - Golden Rock", "Ward 5 - Palakkarai", "Ward 6 - Woraiyur",
    "Ward 7 - KK Nagar", "Ward 8 - Ponmalai"
  ],
  "Vellore": [
    "Ward 1 - Sainathapuram", "Ward 2 - Gandhi Nagar", "Ward 3 - Kosapet",
    "Ward 4 - Bagayam", "Ward 5 - Sathuvachari", "Ward 6 - Alamelumangapuram"
  ],
  "Tirunelveli": [
    "Ward 1 - Melapalayam", "Ward 2 - Palayamkottai", "Ward 3 - Vannarpet",
    "Ward 4 - Manakadu", "Ward 5 - Pettai", "Ward 6 - Krishnapuram"
  ],
  "Thanjavur": [
    "Ward 1 - Medical College Road", "Ward 2 - South Rampart",
    "Ward 3 - Vallam Road", "Ward 4 - Kumbakonam Road", "Ward 5 - Nanjikottai"
  ],
  "Erode": [
    "Ward 1 - Veerappanchatiram", "Ward 2 - Surampatti",
    "Ward 3 - Arisipalayam", "Ward 4 - Chithode", "Ward 5 - Modakurichi"
  ],
  "Tiruppur": [
    "Ward 1 - Velampalayam", "Ward 2 - Anupparpalayam",
    "Ward 3 - Avinashi Road", "Ward 4 - Muthur", "Ward 5 - Rayapuram"
  ]
};

/* ─── District Centroid Coordinates for Stamping ──────────────────────── */
const districtCoords = {
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Tiruppur": { lat: 11.1085, lng: 77.3411 }
};
const defaultCoords = { lat: 10.8505, lng: 78.6677 };

export default function LoginPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [rawAadhaar, setRawAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Form selections
  const [district, setDistrict] = useState('Chennai');


  // Pincode Auto-Suggest Ward flow states
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [apiDistrictInfo, setApiDistrictInfo] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [isDistrictLocked, setIsDistrictLocked] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Masking implementation for Aadhaar: mask first 8 digits with '•'
  const handleAadhaarChange = (e) => {
    const inputVal = e.target.value.replace(/\s/g, ''); // Remove spaces
    let newRaw = '';
    let digitIndex = 0;

    for (let i = 0; i < inputVal.length; i++) {
      if (inputVal[i] === '•' || inputVal[i] === '●') {
        newRaw += rawAadhaar[digitIndex] || '';
        digitIndex++;
      } else if (/\D/.test(inputVal[i])) {
        // Ignore non-digits
      } else {
        newRaw += inputVal[i];
        digitIndex++;
      }
    }

    if (newRaw.length <= 16) {
      setRawAadhaar(newRaw);
    }
  };

  const getDisplayAadhaar = () => {
    let display = '';
    for (let i = 0; i < rawAadhaar.length; i++) {
      if (i < 12) {
        display += '•';
      } else {
        display += rawAadhaar[i];
      }
      if ((i === 3 || i === 7 || i === 11) && i < rawAadhaar.length - 1) {
        display += ' ';
      }
    }
    return display;
  };

  const handleSendOTP = () => {
    if (rawAadhaar.length !== 16) {
      toast.error(tLabel('Please enter a valid 16-digit Aadhaar Number', 'தயவுசெய்து செல்லுபடியாகும் 16-இலக்க ஆதார் எண்ணை உள்ளிடவும்'));
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

    const districtName = getDistrictByPincode(pin);
    const placeList = getPlacesByPincode(pin).map(p => p.place);
    
    if (districtName && placeList.length > 0) {
      setAreas(placeList);
      setPincodeStatus('success');
      setDistrict(districtName);
      setApiDistrictInfo(`${districtName}, Tamil Nadu`);
      setIsDistrictLocked(true);
      toast.success(tLabel("Pincode located!", "பின்கோடு கண்டறியப்பட்டது!"));
    } else {
      setPincodeStatus('error');
      setAreas([]);
      toast.error(tLabel("Pincode not found. Please check and try again.", "பின்கோடு கிடைக்கவில்லை. சரிபார்க்கவும்."));
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

  const getDistrictWards = () => {
    const list = wardsByDistrict[district];
    if (list && list.length > 0) {
      return list;
    }
    // Generic fallback
    const fallback = [];
    for (let i = 1; i <= 20; i++) {
      fallback.push(`Ward ${i}`);
    }
    return fallback;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error(tLabel('Please complete Aadhaar OTP verification first', 'தயவுசெய்து முதலில் ஆதார் OTP சரிபார்ப்பை பூர்த்தி செய்யவும்'));
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

    // Extract ward number from selectedWard (e.g. "Ward 22 - Velachery" -> "22", or "Ward 1" -> "1")
    let wardNumber = '142';
    const match = selectedWard.match(/Ward\s+(\d+)/i);
    if (match) {
      wardNumber = match[1];
    }

    // Lookup coordinates by district center
    const coords = districtCoords[district] || defaultCoords;

    // Generate random session UUID
    const uuid = 'jn-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 5);

    // Save mock flow values to localStorage
    localStorage.setItem('jn_role', 'citizen');
    localStorage.setItem('jn_name', 'KARTHIK RAJ S.');
    localStorage.setItem('jn_ward', wardNumber);
    localStorage.setItem('jn_district', district);
    localStorage.setItem('jn_user_id', uuid);

    // Save Pincode details
    localStorage.setItem('jn_pincode', pincode);
    localStorage.setItem('jn_area', selectedArea);
    localStorage.setItem('jn_ward_name', selectedWard);
    localStorage.setItem('jn_ward_number', wardNumber);
    localStorage.setItem('jn_living_lat', coords.lat.toString());
    localStorage.setItem('jn_living_lng', coords.lng.toString());

    if (!localStorage.getItem('jn_aadhaar_address')) {
      localStorage.setItem('jn_aadhaar_address', "123, Gandhi Nagar, Madurai - 625001");
      localStorage.setItem('jn_aadhaar_district', "Madurai");
      localStorage.setItem('jn_aadhaar_ward', "Ward 45");
    }
    
    // Auto-set the Living Address since they chose it on login!
    const completeAddress = `${selectedArea}, ${district}, Tamil Nadu - ${pincode}`;
    localStorage.setItem('jn_living_address', completeAddress);
    localStorage.setItem('jn_living_district', district);
    localStorage.setItem('jn_living_ward', `Ward ${wardNumber}`);
    localStorage.setItem('jn_living_lat', coords.lat.toString());
    localStorage.setItem('jn_living_lng', coords.lng.toString());
    
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + 90);
    localStorage.setItem('jn_location_last_updated', today.toISOString());
    localStorage.setItem('jn_location_next_update', nextDate.toISOString());

    toast.success(tLabel(
      `Identity Verified: Welcome CITIZEN`,
      `அடையாளம் சரிபார்க்கப்பட்டது: நல்வரவு குடிமகன்`
    ));

    navigate('/citizen');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
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
          {i18n.language === 'en' ? 'தமிழ்' : 'English'}
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
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* STEP 1 — Aadhaar Verification Row */}
            <div className="space-y-3.5">
              
              {/* Govt Link Pill Indicator */}
              <div className="w-full bg-[#FFF0F0] text-[#8B1A1A] rounded-full py-2.5 px-4 flex items-center justify-center gap-2 select-none border border-[#FFD8D8]">
                <Shield className="w-4 h-4 text-[#8B1A1A] fill-[#8B1A1A]/10" />
                <span className="font-extrabold text-[13px] tracking-wider">
                  {tLabel('GOVT KYC LINKING', 'அரசு கேஒய்சி இணைப்பு')}
                </span>
              </div>

              {/* Aadhaar Input Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                  {tLabel('AADHAAR NUMBER', 'ஆதார் எண்')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      disabled={otpSent}
                      value={getDisplayAadhaar()}
                      onChange={handleAadhaarChange}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full bg-slate-50 disabled:opacity-80 disabled:bg-slate-50/50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal focus:border-[#8B1A1A] transition-all"
                    />
                    {rawAadhaar.length === 16 && !otpSent && (
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
                      {tLabel('Send OTP', 'அனுப்பு')}
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

            {/* STEP 2, 3, 4 & Submit Button (Only show after Aadhaar OTP verified) */}
            <AnimatePresence>
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 overflow-visible pt-1"
                >
                  {/* STEP 2 — Aadhaar Verified Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('AADHAAR VERIFIED NAME', 'சரிபார்க்கப்பட்ட பெயர் (ஆதார்)')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="KARTHIK RAJ S."
                        readOnly
                        className="w-full bg-slate-50/80 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-800 font-extrabold text-sm shadow-sm tracking-wide select-none"
                      />
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      </div>
                    </div>
                    
                    {/* Govt Locked warning */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#FF9800] font-bold mt-1.5 select-none">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                      <span>{tLabel('Name is locked to Official Govt Database.', 'பெயர் அரசு அதிகாரப்பூர்வ தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது.')}</span>
                    </div>
                  </div>

                  {/* STEP 3 — Location Fields (Pincode Suggestion Flow) */}
                  
                  {/* PINCODE input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('PINCODE', 'பின்கோடு')}
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
                        {tLabel("Pincode not found. Please check and try again.", "பின்கோடு கிடைக்கவில்லை. சரிபார்க்கவும்.")}
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
                            {districts.map(d => (
                              <option key={d.name} value={d.name}>
                                {isTa ? d.tamil : d.name}
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
                        {getDistrictWards().map(wardName => (
                          <option key={wardName} value={wardName}>{wardName}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}


                  <div className="text-green-600 font-bold text-sm text-center mb-2">
                    ✓ Logging in as: Citizen
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                    className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>{tLabel('Enter Command Center', 'கட்டளை மையத்திற்குள் நுழையவும்')}</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* OFFICIAL LOGIN LINK */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p className="text-xs text-slate-400 mb-2">Government Official or Elected Representative?</p>
          <button
            onClick={() => navigate('/employee-login')}
            className="text-[#8B1A1A] font-bold text-sm underline underline-offset-2"
          >
            Access Official Portal →
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
