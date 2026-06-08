import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Lock, User, Key, CheckCircle, Fingerprint, MapPin, Award, Building, Compass } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const getDashboardRoute = (role, departmentName) => {
  if (role === 'CM') return '/cm-dashboard';
  if (role === 'Superadmin') return '/admin';
  if (role === 'MLA') return '/mla-dashboard';
  if (role === 'Minister') return '/minister-dashboard';
  if (role === 'Ward Member') return '/ward-member-dashboard';
  if (role === 'District Collector') return '/collector-dashboard';
  if (role === 'DRO') return '/dro-dashboard';
  if (role === 'BDO') return '/bdo-dashboard';
  if (role === 'VAO') return '/vao-dashboard';
  if (role === 'Ward Officer') return '/ward-officer-dashboard';
  if (role === 'RI') return '/ri-dashboard';
  if (departmentName) {
    return `/dept/${encodeURIComponent(departmentName)}/${encodeURIComponent(role)}`;
  }
  return '/employee-login';
};

export default function EmployeeLoginPage() {
  const { lang, toggleLang } = useLanguage();
  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;
  
  const navigate = useNavigate();

  // Step state: 1 = Aadhaar, 2 = OTP, 3 = Category & Name, 4 = Role & Jurisdiction
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Authentication credentials
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');

  // Verified Identity Information
  const [name, setName] = useState('');
  const [homeDistrict, setHomeDistrict] = useState('');

  // Selected Scope configuration
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [customVillage, setCustomVillage] = useState('');
  const [customFirka, setCustomFirka] = useState('');
  
  // Department official custom level/name
  const [selectedJurisLevel, setSelectedJurisLevel] = useState('');
  const [selectedJurisName, setSelectedJurisName] = useState('');

  // Dynamic Metadata lists
  const [departments, setDepartments] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [childJurisdictions, setChildJurisdictions] = useState([]); // Wards/Blocks under selected district

  // Load initial meta lists
  useEffect(() => {
    api.get('/metadata/departments')
      .then(res => setDepartments(res.data))
      .catch(console.error);

    api.get('/metadata/jurisdictions?level=DISTRICT')
      .then(res => setDistricts(res.data))
      .catch(console.error);

    api.get('/metadata/jurisdictions?level=CONSTITUENCY')
      .then(res => setConstituencies(res.data))
      .catch(console.error);
  }, []);

  // Fetch sub-locations when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setChildJurisdictions([]);
      return;
    }
    const distObj = districts.find(d => d.name === selectedDistrict);
    if (!distObj) return;

    api.get(`/metadata/jurisdictions?parentId=${distObj.id}`)
      .then(res => setChildJurisdictions(res.data))
      .catch(console.error);
  }, [selectedDistrict, districts]);

  // Format Aadhaar formatting (numbers only)
  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    setAadhaar(val);
  };

  // Send OTP
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (aadhaar.length < 12) {
      toast.error(tLabel('Please enter a valid 12 or 16-digit Aadhaar Number', 'செல்லுபடியாகும் ஆதார் எண்ணை உள்ளிடவும்'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success(tLabel('Mock OTP sent to Aadhaar-linked mobile! (Use 123456)', 'மாதிரி OTP ஆதார் எண்ணுடன் இணைக்கப்பட்ட மொபைலுக்கு அனுப்பப்பட்டது! (123456 பயன்படுத்தவும்)'));
    }, 600);
  };

  // Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp !== '123456') {
      toast.error(tLabel('Invalid verification code. Use 123456', 'தவறான OTP குறியீடு. 123456 பயன்படுத்தவும்'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate Aadhaar eKYC name and location retrieval
      setName('Karthik Raj S.');
      setHomeDistrict('Chennai');
      setStep(3);
      toast.success(tLabel('Aadhaar eKYC Verified Successfully!', 'ஆதார் இ-கேஒய்சி வெற்றிகரமாக சரிபார்க்கப்பட்டது!'));
    }, 700);
  };

  // Submit Profile & Role scoping config to log in
  const handleOnboardingLogin = async (e) => {
    e.preventDefault();

    if (!category || !role) {
      toast.error(tLabel('Please select your official category and role', 'உங்கள் அதிகாரம் மற்றும் பணியை தேர்ந்தெடுக்கவும்'));
      return;
    }

    // Prepare jurisdiction level & name to send to backend
    let jurisdictionLevel = 'STATE';
    let jurisdictionName = 'Tamil Nadu';
    let departmentName = '';

    if (role === 'CM') {
      jurisdictionLevel = 'STATE';
      jurisdictionName = 'Tamil Nadu';
    } else if (role === 'Minister') {
      if (!selectedDept) {
        toast.error(tLabel('Please select your Department', 'தயவுசெய்து உங்கள் துறையைத் தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'STATE';
      jurisdictionName = 'Tamil Nadu';
      departmentName = selectedDept;
    } else if (role === 'MLA') {
      if (!selectedConstituency) {
        toast.error(tLabel('Please select your Constituency', 'தயவுசெய்து உங்கள் தொகுதியைத் தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'CONSTITUENCY';
      jurisdictionName = selectedConstituency;
    } else if (role === 'Ward Member') {
      if (!selectedDistrict || !selectedWard) {
        toast.error(tLabel('Please select your District and Ward', 'தயவுசெய்து உங்கள் மாவட்டம் மற்றும் வார்டைத் தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'WARD';
      jurisdictionName = selectedWard;
    } else if (role === 'District Collector') {
      if (!selectedDistrict) {
        toast.error(tLabel('Please select your District', 'தயவுசெய்து உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'DISTRICT';
      jurisdictionName = selectedDistrict;
    } else if (role === 'DRO') {
      if (!selectedDistrict || !selectedTaluk) {
        toast.error(tLabel('Please select District and Revenue Division', 'மாவட்டம் மற்றும் வருவாய் பிரிவை தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'WARD'; // taluk mapped as ward
      jurisdictionName = selectedTaluk;
    } else if (role === 'BDO') {
      if (!selectedDistrict || !selectedBlock) {
        toast.error(tLabel('Please select District and Block', 'மாவட்டம் மற்றும் ஒன்றியத்தை தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'BLOCK';
      jurisdictionName = selectedBlock;
    } else if (role === 'VAO') {
      if (!selectedDistrict || !selectedTaluk || !customVillage) {
        toast.error(tLabel('Please complete all village location fields', 'கிராம இருப்பிடப் புலங்களை பூர்த்தி செய்யவும்'));
        return;
      }
      jurisdictionLevel = 'WARD';
      jurisdictionName = selectedTaluk; // VAO scoped taluk-level/ward
    } else if (role === 'Ward Officer') {
      if (!selectedDistrict || !selectedWard) {
        toast.error(tLabel('Please select District and Ward', 'மாவட்டம் மற்றும் வார்டை தேர்ந்தெடுக்கவும்'));
        return;
      }
      jurisdictionLevel = 'WARD';
      jurisdictionName = selectedWard;
    } else if (role === 'RI') {
      if (!selectedDistrict || !selectedTaluk || !customFirka) {
        toast.error(tLabel('Please fill all Firka location details', 'ஃபிர்கா இருப்பிட விவரங்களை நிரப்பவும்'));
        return;
      }
      jurisdictionLevel = 'WARD';
      jurisdictionName = selectedTaluk;
    } else if (category === 'Department Official') {
      if (!selectedDept || !selectedJurisLevel || !selectedJurisName) {
        toast.error(tLabel('Please select Department, Level, and Name', 'துறை, நிலை மற்றும் பெயரைத் தேர்ந்தெடுக்கவும்'));
        return;
      }
      departmentName = selectedDept;
      jurisdictionLevel = selectedJurisLevel;
      jurisdictionName = selectedJurisName;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/employee/aadhaar-login', {
        aadhaar,
        name,
        category,
        role,
        departmentName,
        jurisdictionLevel,
        jurisdictionName
      });

      const { token, employee } = response.data;
      
      localStorage.setItem('jn_token', token);
      localStorage.setItem('jn_emp_role', employee.role);
      localStorage.setItem('jn_role', 'employee');
      localStorage.setItem('jn_name', employee.name);
      
      if (employee.department) {
        localStorage.setItem('jn_emp_dept', employee.department.name);
      } else {
        localStorage.removeItem('jn_emp_dept');
      }

      const jurisValues = {
        [jurisdictionLevel.toLowerCase()]: jurisdictionName
      };
      localStorage.setItem('jn_emp_jurisdiction', JSON.stringify(jurisValues));
      
      if (jurisdictionLevel === 'DISTRICT') {
        localStorage.setItem('jn_emp_district', jurisdictionName);
      } else if (jurisdictionLevel === 'CONSTITUENCY') {
        localStorage.setItem('jn_emp_constituency', jurisdictionName);
      }

      toast.success(tLabel(`Access Granted: ${employee.role}`, `அணுகல் அனுமதி: ${employee.role}`));
      navigate(getDashboardRoute(employee.role, departmentName));
    } catch (err) {
      toast.error(tLabel('Failed to scope login credentials.', 'உள்நுழைவு தகவல்களைச் சமர்ப்பிக்க முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#8B1A1A]/10 selection:text-[#8B1A1A]">
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
        >
          ← {tLabel('Back to Citizen Portal', 'திரும்பு குடிமகன் தளம்')}
        </button>
        <button
          onClick={() => toggleLang(lang === 'en' ? 'ta' : 'en')}
          className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#8B1A1A]/20 bg-white hover:bg-slate-50 text-[#8B1A1A] shadow-sm transition-all"
        >
          {lang === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 select-none">
            <Shield className="w-[30px] h-[30px] text-[#8B1A1A]" />
          </div>
          <h1 className="text-[24px] font-black tracking-widest text-[#8B1A1A] uppercase">
            {tLabel('CIVIC OFFICIAL PORTAL', 'அதிகாரப்பூர்வ கட்டுப்பாட்டு அறை')}
          </h1>
          <p className="text-[10px] text-slate-500 font-extrabold tracking-wider mt-1 uppercase">
            {tLabel('Secure eKYC Gate — Government of Tamil Nadu', 'பாதுகாப்பான ஆதார் சரிபார்ப்பு நுழைவு')}
          </p>
        </div>

        <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-slate-200/50">
          
          {/* STEP 1: Enter Aadhaar */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                  {tLabel('Employee Aadhaar Number', 'பணியாளர் ஆதார் எண்')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Fingerprint className="w-5 h-5 text-slate-400 group-focus-within:text-[#8B1A1A]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={aadhaar}
                    onChange={handleAadhaarChange}
                    placeholder="e.g. 12 or 16 digit number"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm tracking-wide"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B1A1A] hover:bg-[#7A1515] text-white font-extrabold text-xs rounded-xl py-4 shadow-md shadow-[#8B1A1A]/10 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? tLabel('Sending OTP...', 'OTP அனுப்பப்படுகிறது...') : tLabel('Request OTP Verification', 'OTP கோரவும்')}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">
                    {tLabel('Enter OTP Code', 'OTP குறியீட்டை உள்ளிடவும்')}
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Aadhaar mobile ending in *8943
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-slate-400 group-focus-within:text-[#8B1A1A]" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit verification code"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm tracking-wide text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl py-4 shadow-md transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? tLabel('Verifying...', 'சரிபார்க்கப்படுகிறது...') : tLabel('Confirm Identity', 'அடையாளத்தை உறுதிசெய்')}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-bold text-[#8B1A1A] hover:underline"
              >
                {tLabel('Change Aadhaar Number', 'ஆதார் எண்ணை மாற்றவும்')}
              </button>
            </form>
          )}

          {/* STEP 3: Category Select */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                    {tLabel('Aadhaar eKYC Verified', 'ஆதார் சரிபார்க்கப்பட்டது')}
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    {tLabel(`Linked to: ${name} (${homeDistrict} Resident)`, `இணைக்கப்பட்டுள்ளது: ${name} (${homeDistrict})`)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                    {tLabel('Official Full Name', 'அதிகாரப்பூர்வ முழு பெயர்')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                    {tLabel('Select Official Category', 'அதிகாரப் பிரிவைத் தேர்ந்தெடுக்கவும்')}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'Elected Representative', label: 'Elected Representative', sub: 'CM, Ministers, MLAs, Councillors', icon: <Award className="w-5 h-5 text-amber-500" /> },
                      { id: 'Administrative Officer', label: 'Administrative Officer', sub: 'Collector, BDO, VAO, DRO', icon: <Building className="w-5 h-5 text-indigo-500" /> },
                      { id: 'Department Official', label: 'Department Official', sub: 'AEs, Inspectors, Directors (43 Depts)', icon: <Compass className="w-5 h-5 text-emerald-500" /> }
                    ].map(catItem => (
                      <button
                        key={catItem.id}
                        onClick={() => {
                          setCategory(catItem.id);
                          setRole(''); // reset
                          setStep(4);
                        }}
                        className="p-4 border-2 border-slate-200 hover:border-[#8B1A1A] bg-slate-50 hover:bg-slate-50/50 rounded-2xl flex items-center gap-4 transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                          {catItem.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">{catItem.label}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{catItem.sub}</p>
                        </div>
                        <span className="text-[#8B1A1A] font-black text-sm pr-1 group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Role & Scope Selection */}
          {step === 4 && (
            <form onSubmit={handleOnboardingLogin} className="space-y-6">
              <div className="flex justify-between items-center ml-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {category} / {name}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-wider hover:underline"
                >
                  Change Category
                </button>
              </div>

              {/* Elected Representative Dropdowns */}
              {category === 'Elected Representative' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                      {tLabel('Select Political Role', 'அரசியல் பதவியைத் தேர்ந்தெடுக்கவும்')}
                    </label>
                    <select
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white"
                    >
                      <option value="">{tLabel('-- Choose Role --', '-- பதவியைத் தேர்ந்தெடுக்கவும் --')}</option>
                      <option value="CM">Chief Minister (CM)</option>
                      <option value="Minister">State Minister</option>
                      <option value="MLA">MLA (Legislative Assembly)</option>
                      <option value="Ward Member">Ward Councillor</option>
                    </select>
                  </div>

                  {role === 'Minister' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('Portfolio / Department', 'துறைப் பொறுப்பு')}
                      </label>
                      <select
                        required
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white"
                      >
                        <option value="">{tLabel('-- Choose Department --', '-- துறையைத் தேர்ந்தெடுக்கவும் --')}</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {role === 'MLA' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('Legislative Constituency', 'சட்டமன்றத் தொகுதி')}
                      </label>
                      <select
                        required
                        value={selectedConstituency}
                        onChange={(e) => setSelectedConstituency(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white"
                      >
                        <option value="">{tLabel('-- Choose Constituency --', '-- தொகுதியைத் தேர்ந்தெடுக்கவும் --')}</option>
                        {constituencies.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {role === 'Ward Member' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select District', 'மாவட்டம்')}
                        </label>
                        <select
                          required
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedWard('');
                          }}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- District --', '-- மாவட்டம் --')}</option>
                          {districts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select Ward', 'வார்டு')}
                        </label>
                        <select
                          required
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- Ward --', '-- வார்டு --')}</option>
                          {childJurisdictions.filter(j => j.level === 'WARD').map(j => (
                            <option key={j.id} value={j.name}>{j.name}</option>
                          ))}
                          {/* Fallback wards if none seeded for district yet */}
                          {childJurisdictions.filter(j => j.level === 'WARD').length === 0 && (
                            Array.from({ length: 30 }).map((_, i) => (
                              <option key={i} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Administrative Officer Dropdowns */}
              {category === 'Administrative Officer' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                      {tLabel('Select Administrative Role', 'நிர்வாகப் பதவியைத் தேர்ந்தெடுக்கவும்')}
                    </label>
                    <select
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white"
                    >
                      <option value="">{tLabel('-- Choose Role --', '-- பதவியைத் தேர்ந்தெடுக்கவும் --')}</option>
                      <option value="District Collector">District Collector</option>
                      <option value="DRO">DRO (District Revenue Officer)</option>
                      <option value="BDO">BDO (Block Development Officer)</option>
                      <option value="VAO">VAO (Village Administrative Officer)</option>
                      <option value="Ward Officer">Ward Officer</option>
                      <option value="RI">RI (Revenue Inspector)</option>
                    </select>
                  </div>

                  {/* Collector scope */}
                  {role === 'District Collector' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('District Jurisdiction', 'மாவட்ட எல்லை')}
                      </label>
                      <select
                        required
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                      >
                        <option value="">{tLabel('-- Select District --', '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் --')}</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* DRO / RI / VAO scope */}
                  {['DRO', 'RI', 'VAO'].includes(role) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                            {tLabel('Select District', 'மாவட்டம்')}
                          </label>
                          <select
                            required
                            value={selectedDistrict}
                            onChange={(e) => {
                              setSelectedDistrict(e.target.value);
                              setSelectedTaluk('');
                            }}
                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                          >
                            <option value="">{tLabel('-- District --', '-- மாவட்டம் --')}</option>
                            {districts.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                            {tLabel('Select Taluk / Division', 'வட்டம் / தாலுகா')}
                          </label>
                          <select
                            required
                            value={selectedTaluk}
                            onChange={(e) => setSelectedTaluk(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                          >
                            <option value="">{tLabel('-- Taluk --', '-- தாலுகா --')}</option>
                            {childJurisdictions.filter(j => j.level === 'WARD').map(j => (
                              <option key={j.id} value={j.name}>{j.name}</option>
                            ))}
                            {childJurisdictions.filter(j => j.level === 'WARD').length === 0 && (
                              <option value="Taluk Center">Taluk Center</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {role === 'VAO' && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                            {tLabel('Village Panchayat Name', 'கிராம ஊராட்சி பெயர்')}
                          </label>
                          <input
                            type="text"
                            required
                            value={customVillage}
                            onChange={(e) => setCustomVillage(e.target.value)}
                            placeholder="e.g. Melur Panchayat"
                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A]"
                          />
                        </div>
                      )}

                      {role === 'RI' && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                            {tLabel('Firka Office Name', 'பிர்கா அலுவலக பெயர்')}
                          </label>
                          <input
                            type="text"
                            required
                            value={customFirka}
                            onChange={(e) => setCustomFirka(e.target.value)}
                            placeholder="e.g. Alandur Firka"
                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* BDO scope */}
                  {role === 'BDO' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select District', 'மாவட்டம்')}
                        </label>
                        <select
                          required
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedBlock('');
                          }}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- District --', '-- மாவட்டம் --')}</option>
                          {districts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select Panchayat Block', 'ஒன்றியம்')}
                        </label>
                        <select
                          required
                          value={selectedBlock}
                          onChange={(e) => setSelectedBlock(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- Block --', '-- ஒன்றியம் --')}</option>
                          {childJurisdictions.filter(j => j.level === 'BLOCK').map(j => (
                            <option key={j.id} value={j.name}>{j.name}</option>
                          ))}
                          {childJurisdictions.filter(j => j.level === 'BLOCK').length === 0 && (
                            <option value="Block Headquarters">Block Headquarters</option>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Ward Officer scope */}
                  {role === 'Ward Officer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select District', 'மாவட்டம்')}
                        </label>
                        <select
                          required
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedWard('');
                          }}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- District --', '-- மாவட்டம் --')}</option>
                          {districts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                          {tLabel('Select Ward', 'வார்டு')}
                        </label>
                        <select
                          required
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- Ward --', '-- வார்டு --')}</option>
                          {childJurisdictions.filter(j => j.level === 'WARD').map(j => (
                            <option key={j.id} value={j.name}>{j.name}</option>
                          ))}
                          {childJurisdictions.filter(j => j.level === 'WARD').length === 0 && (
                            Array.from({ length: 30 }).map((_, i) => (
                              <option key={i} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Department Official Dropdowns */}
              {category === 'Department Official' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                      {tLabel('Select Department', 'துறையைத் தேர்ந்தெடுக்கவும்')}
                    </label>
                    <select
                      required
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B1A1A]"
                    >
                      <option value="">{tLabel('-- Choose Department --', '-- துறையைத் தேர்ந்தெடுக்கவும் --')}</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('Official Position/Role', 'பதவி / பதவிப் பெயர்')}
                      </label>
                      <select
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                      >
                        <option value="">{tLabel('-- Choose Role --', '-- பதவியைத் தேர்ந்தெடுக்கவும் --')}</option>
                        <option value="AE">Assistant Engineer (AE)</option>
                        <option value="Lineman">Lineman / Field Inspector</option>
                        <option value="Area Engineer">Area Engineer</option>
                        <option value="Director">Department Director</option>
                        <option value="Superintendent">Superintendent</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('Jurisdiction Scope Level', 'எல்லை நிலை')}
                      </label>
                      <select
                        required
                        value={selectedJurisLevel}
                        onChange={(e) => setSelectedJurisLevel(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                      >
                        <option value="">{tLabel('-- Level --', '-- எல்லை நிலை --')}</option>
                        <option value="STATE">State Level (Tamil Nadu)</option>
                        <option value="DISTRICT">District Level</option>
                        <option value="BLOCK">Block Level</option>
                        <option value="WARD">Ward Level</option>
                      </select>
                    </div>
                  </div>

                  {selectedJurisLevel && selectedJurisLevel !== 'STATE' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                        {tLabel('Jurisdiction Location Name', 'எல்லை வட்டாரப் பெயர்')}
                      </label>
                      {selectedJurisLevel === 'DISTRICT' ? (
                        <select
                          required
                          value={selectedJurisName}
                          onChange={(e) => setSelectedJurisName(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        >
                          <option value="">{tLabel('-- Select District --', '-- மாவட்டம் --')}</option>
                          {districts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={selectedJurisName}
                          onChange={(e) => setSelectedJurisName(e.target.value)}
                          placeholder={tLabel('e.g. Ward 12 or Alandur Block', 'உதா: வார்டு 12')}
                          className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3.5 focus:outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B1A1A] hover:bg-[#7A1515] text-white font-extrabold text-xs rounded-xl py-4 shadow-md shadow-[#8B1A1A]/10 transition-all active:scale-[0.98] uppercase tracking-widest mt-4"
              >
                {loading ? tLabel('Creating Profile...', 'உள்நுழைகிறது...') : tLabel('Save Scope & Access Dashboard', 'சேமித்து டாஷ்போர்டு திறக்கவும்')}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
