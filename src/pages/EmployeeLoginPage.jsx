import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { TN_CONSTITUENCIES, TN_DISTRICTS, getConstituenciesByDistrict } from '../data/constituencies';

const DEPARTMENTS = [
  { name: 'Water', roles: ['AEO', 'Deputy AE', 'Area Engineer', 'GM', 'Executive Director', 'Director'] },
  { name: 'Electricity', roles: ['Lineman', 'Deputy AE', 'Asst AE', 'Area Engineer', 'Super Agent', 'GM'] },
  { name: 'Sanitation', roles: ['DSI', 'Sanitary Inspector', 'Health Inspector', 'City Health Officer', 'Commissioner'] },
  { name: 'PWD/Roads', roles: ['AE', 'Deputy Engineer', 'Executive Engineer', 'SE', 'Chief Engineer'] },
  { name: 'Health', roles: ['Medical Officer', 'Medical Superintendent', 'Director'] },
  { name: 'School Education', roles: ['Headmaster', 'BEO', 'DEO', 'Director'] },
  { name: 'Higher Education', roles: ['Principal', 'Regional Director', 'Director'] },
  { name: 'Revenue', roles: ['Revenue Inspector', 'Tahsildar', 'RDO', 'Collector'] },
  { name: 'Police', roles: ['Sub-Inspector', 'Inspector', 'DSP', 'SP', 'IG', 'DGP'] },
  { name: 'Agriculture', roles: ['Agriculture Officer', 'Deputy Director', 'District Officer', 'Director'] },
  { name: 'Animal Husbandry', roles: ['Veterinary Officer', 'Asst Director', 'Deputy Director', 'Director'] },
  { name: 'Transport', roles: ['MVO', 'RTO', 'Director'] },
  { name: 'Housing (TNHB)', roles: ['AE', 'Executive Engineer', 'SE', 'Director'] },
  { name: 'Highways', roles: ['AE', 'Deputy Engineer', 'Executive Engineer', 'Chief Engineer'] },
  { name: 'Forest', roles: ['Forest Guard', 'Range Officer', 'DFO', 'PCCF'] },
  { name: 'Fisheries', roles: ['Fisheries Officer', 'Deputy Director', 'District Officer', 'Director'] },
  { name: 'Social Welfare', roles: ['CDO', 'Deputy CDO', 'District Officer', 'Director'] },
  { name: 'Adi Dravidar Welfare', roles: ['Project Officer', 'District Officer', 'Director'] },
  { name: 'BC/MBC Welfare', roles: ['Project Officer', 'District Officer', 'Director'] },
  { name: 'Differently Abled Welfare', roles: ['Project Officer', 'District Officer', 'Director'] },
  { name: 'Women & Child Development', roles: ['CDPO', 'District Officer', 'Director'] },
  { name: 'Rural Development', roles: ['VPDO', 'BDO', 'District RD Officer', 'Director'] },
  { name: 'Panchayat', roles: ['Panchayat Secretary', 'Block Panchayat Officer', 'District Officer'] },
  { name: 'Municipality', roles: ['Ward Exec Officer', 'Deputy Commissioner', 'Commissioner', 'Director'] },
  { name: 'Corporation', roles: ['Ward Executive', 'Zonal Officer', 'Commissioner', 'Director'] },
  { name: 'Fire & Rescue', roles: ['Fireman', 'Station Officer', 'Divisional Officer', 'Director'] },
  { name: 'Registrar', roles: ['Sub-Registrar', 'District Registrar', 'IGR'] },
  { name: 'Labour', roles: ['Labour Officer', 'Deputy Labour Commissioner', 'Commissioner'] },
  { name: 'Legal Metrology', roles: ['Inspector', 'Asst Controller', 'Controller'] },
  { name: 'Food Safety', roles: ['Food Safety Officer', 'Designated Officer', 'Commissioner'] },
  { name: 'Cooperative', roles: ['Asst Cooperative Officer', 'District Officer', 'Director'] },
  { name: 'Handlooms & Textiles', roles: ['Inspector', 'Deputy Director', 'Director'] },
  { name: 'Tourism', roles: ['Tourism Officer', 'Deputy Director', 'Director'] },
  { name: 'Industries', roles: ['Project Officer', 'Deputy Director', 'Director'] },
  { name: 'Environment', roles: ['Environmental Officer', 'District Officer', 'Director'] },
  { name: 'Information (DI&PR)', roles: ['District Information Officer', 'Deputy Director', 'Director'] },
  { name: 'Archaeology', roles: ['Field Officer', 'Deputy Director', 'Director'] },
  { name: 'Tamil Development', roles: ['District Officer', 'Deputy Director', 'Director'] },
  { name: 'Sports & Youth', roles: ['District Sports Officer', 'Deputy Director', 'Director'] },
  { name: 'Adi Dravidar Housing', roles: ['Project Officer', 'District Officer', 'Director'] },
  { name: 'Slum Clearance', roles: ['Field Officer', 'Deputy Director', 'Director'] },
  { name: 'Postal Services', roles: ['Postman', 'Postmaster', 'Superintendent', 'Director'] },
  { name: 'Civil Supplies', roles: ['Depot Officer', 'Taluk Supply Officer', 'District Officer', 'Commissioner'] }
];

const ELECTED_REPS = ['Chief Minister', 'Minister', 'MLA', 'Ward Member'];
const ADMIN_OFFICERS = ['District Collector', 'DRO', 'BDO', 'VAO', 'Ward Officer', 'Revenue Inspector'];

// Dummy data for Taluks and Villages since full DB is not present
const getTaluks = (district) => {
  if (district === 'Chennai') return ['Guindy', 'Mylapore', 'Velachery', 'Egmore', 'Ayanavaram', 'Tondiarpet', 'Perambur', 'Purasawalkam'];
  if (district === 'Coimbatore') return ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam'];
  if (district === 'Madurai') return ['Madurai North', 'Madurai South', 'Melur', 'Thirumangalam', 'Usilampatti'];
  return ['Taluk 1', 'Taluk 2', 'Taluk 3'];
};
const getVillages = (taluk) => [`${taluk} Village A`, `${taluk} Village B`, `${taluk} Village C`];

const circlesByDistrict = {
  'Chennai': ['North Circle', 'South Circle', 'Central Circle', 'East Circle', 'West Circle'],
  'Coimbatore': ['Coimbatore Circle', 'Pollachi Circle', 'Valparai Circle'],
  'Madurai': ['Madurai North Circle', 'Madurai South Circle', 'Melur Circle'],
  'Tiruchirappalli': ['Trichy Circle', 'Lalgudi Circle', 'Musiri Circle'],
  'Salem': ['Salem Circle', 'Mettur Circle', 'Omalur Circle'],
  'Tirunelveli': ['Tirunelveli Circle', 'Tenkasi Circle', 'Sankarankovil Circle'],
  'Vellore': ['Vellore Circle', 'Arakkonam Circle', 'Gudiyattam Circle'],
  'Erode': ['Erode Circle', 'Gobichettipalayam Circle', 'Bhavani Circle'],
  'Thanjavur': ['Thanjavur Circle', 'Kumbakonam Circle', 'Pattukkottai Circle'],
  'Villupuram': ['Villupuram Circle', 'Tindivanam Circle', 'Kallakurichi Circle'],
  'Cuddalore': ['Cuddalore Circle', 'Chidambaram Circle', 'Vriddhachalam Circle'],
  'Nagapattinam': ['Nagapattinam Circle', 'Mayiladuthurai Circle', 'Vedaranyam Circle'],
  'Kancheepuram': ['Kancheepuram Circle', 'Tambaram Circle', 'Chengalpattu Circle'],
  'Thiruvallur': ['Thiruvallur Circle', 'Avadi Circle', 'Ponneri Circle'],
  'Dharmapuri': ['Dharmapuri Circle', 'Palacode Circle', 'Harur Circle'],
  'Krishnagiri': ['Krishnagiri Circle', 'Hosur Circle', 'Bargur Circle'],
  'Tiruvannamalai': ['Tiruvannamalai Circle', 'Arani Circle', 'Chengam Circle'],
  'Namakkal': ['Namakkal Circle', 'Tiruchengodu Circle', 'Rasipuram Circle'],
  'Karur': ['Karur Circle', 'Kulithalai Circle'],
  'Perambalur': ['Perambalur Circle'],
  'Ariyalur': ['Ariyalur Circle', 'Jayankondam Circle'],
  'Pudukkottai': ['Pudukkottai Circle', 'Aranthangi Circle'],
  'Sivagangai': ['Sivagangai Circle', 'Karaikudi Circle'],
  'Theni': ['Theni Circle', 'Periyakulam Circle', 'Bodinayakanur Circle'],
  'Viruthunagar': ['Virudhunagar Circle', 'Sivakasi Circle', 'Rajapalayam Circle'],
  'Ramanathapuram': ['Ramanathapuram Circle', 'Paramakudi Circle'],
  'Thoothukkudi': ['Thoothukudi Circle', 'Kovilpatti Circle', 'Tiruchendur Circle'],
  'Kanniyakumari': ['Nagercoil Circle', 'Padmanabhapuram Circle', 'Colachal Circle'],
  'Tiruppur': ['Tiruppur Circle', 'Dharapuram Circle', 'Udumalaipettai Circle'],
  'The Nilgiris': ['Ooty Circle', 'Coonoor Circle', 'Gudalur Circle'],
  'Thiruvarur': ['Thiruvarur Circle', 'Mannargudi Circle']
};

export default function EmployeeLoginPage() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  // Step 1 & 2
  const [rawAadhaar, setRawAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 3
  const [category, setCategory] = useState('');

  // Step 4
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');

  // Step 5 (Jurisdictions)
  const [jurisdictionValues, setJurisdictionValues] = useState({});

  const handleAadhaarChange = (e) => {
    const inputVal = e.target.value.replace(/\s/g, '');
    let newRaw = '';
    let digitIndex = 0;
    for (let i = 0; i < inputVal.length; i++) {
      if (inputVal[i] === '•' || inputVal[i] === '●') {
        newRaw += rawAadhaar[digitIndex] || '';
        digitIndex++;
      } else if (/\D/.test(inputVal[i])) {
      } else {
        newRaw += inputVal[i];
        digitIndex++;
      }
    }
    if (newRaw.length <= 16) setRawAadhaar(newRaw);
  };

  const getDisplayAadhaar = () => {
    let display = '';
    for (let i = 0; i < rawAadhaar.length; i++) {
      if (i < 12) display += '•';
      else display += rawAadhaar[i];
      if ((i === 3 || i === 7 || i === 11) && i < rawAadhaar.length - 1) display += ' ';
    }
    return display;
  };

  const handleSendOTP = () => {
    if (rawAadhaar.length !== 16) {
      toast.error('Please enter a valid 16-digit Aadhaar Number');
      return;
    }
    setOtpSent(true);
    toast.success('OTP sent successfully!');
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setOtpVerified(true);
    toast.success('Employee Aadhaar Verified Successfully!');
  };

  const updateJurisdiction = (key, value) => {
    setJurisdictionValues(prev => ({ ...prev, [key]: value }));
  };

  const renderJurisdictionFields = () => {
    const selectClass = "w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all mb-3";
    const inputClass = "w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm focus:border-[#8B1A1A] transition-all mb-3";

    if (!role) return null;

    if (role === 'Chief Minister') return <p className="text-sm text-slate-500 font-bold mb-1">Entire State Jurisdiction</p>;

    if (role === 'Minister') {
      return (
        <select onChange={e => updateJurisdiction('department', e.target.value)} className={selectClass}>
          <option value="">Select Department</option>
          {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
      );
    }

    if (role === 'MLA') {
      return (
        <>
          <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={jurisdictionValues.constituency || ''} onChange={e => updateJurisdiction('constituency', e.target.value)} className={selectClass}>
            <option value="">Select Constituency</option>
            {jurisdictionValues.district && getConstituenciesByDistrict(jurisdictionValues.district).map(c => (
              <option key={c.acNo} value={c.name}>{c.acNo}. {c.name}</option>
            ))}
          </select>
        </>
      );
    }

    if (role === 'Ward Member') {
      return (
        <>
          <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="number" min="1" max="200" placeholder="Enter Ward Number (1-200)" onChange={e => updateJurisdiction('ward', e.target.value)} className={inputClass} />
        </>
      );
    }
    
    if (role === 'Ward Officer') {
      return (
        <>
          <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="number" min="1" max="200" placeholder="Enter Ward Number (1-200)" onChange={e => updateJurisdiction('ward', e.target.value)} className={inputClass} />
        </>
      );
    }

    if (role === 'District Collector') {
      return (
        <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
          <option value="">Select District</option>
          {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      );
    }

    if (role === 'DRO') {
      return (
        <>
          <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="text" placeholder="Select Revenue Division" onChange={e => updateJurisdiction('division', e.target.value)} className={inputClass} />
        </>
      );
    }

    if (role === 'BDO') {
      return (
        <>
          <select value={jurisdictionValues.district || ''} onChange={e => updateJurisdiction('district', e.target.value)} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="text" placeholder="Select Block" onChange={e => updateJurisdiction('block', e.target.value)} className={inputClass} />
        </>
      );
    }

    if (role === 'VAO') {
      return (
        <>
          <select onChange={e => { updateJurisdiction('district', e.target.value); updateJurisdiction('taluk', ''); updateJurisdiction('village', ''); }} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={jurisdictionValues.taluk || ''} onChange={e => { updateJurisdiction('taluk', e.target.value); updateJurisdiction('village', ''); }} className={selectClass}>
            <option value="">Select Taluk</option>
            {jurisdictionValues.district && getTaluks(jurisdictionValues.district).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={jurisdictionValues.village || ''} onChange={e => updateJurisdiction('village', e.target.value)} className={selectClass}>
            <option value="">Select Village</option>
            {jurisdictionValues.taluk && getVillages(jurisdictionValues.taluk).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </>
      );
    }

    if (role === 'Revenue Inspector') {
      return (
        <>
          <select onChange={e => { updateJurisdiction('district', e.target.value); updateJurisdiction('taluk', ''); }} className={selectClass}>
            <option value="">Select District</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={jurisdictionValues.taluk || ''} onChange={e => updateJurisdiction('taluk', e.target.value)} className={selectClass}>
            <option value="">Select Taluk</option>
            {jurisdictionValues.district && getTaluks(jurisdictionValues.district).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Select Firka" onChange={e => updateJurisdiction('firka', e.target.value)} className={inputClass} />
        </>
      );
    }

    // Default for Department Officials
    return (
      <>
        <select onChange={e => { updateJurisdiction('district', e.target.value); updateJurisdiction('circle', ''); }} className={selectClass}>
          <option value="">Select District</option>
          {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={jurisdictionValues.circle || ''}
          onChange={e => updateJurisdiction('circle', e.target.value)}
          className={selectClass}
        >
          <option value=''>Select Circle/Division</option>
          {jurisdictionValues.district && (circlesByDistrict[jurisdictionValues.district] || []).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </>
    );
  };

  const getDashboardRoute = () => {
    switch (role) {
      case 'Chief Minister': return '/cm-dashboard';
      case 'Minister': return '/minister-dashboard';
      case 'MLA': return '/mla-dashboard';
      case 'Ward Member': return '/ward-member-dashboard';
      case 'District Collector': return '/collector-dashboard';
      case 'DRO': return '/dro-dashboard';
      case 'BDO': return '/bdo-dashboard';
      case 'VAO': return '/vao-dashboard';
      case 'Ward Officer': return '/ward-officer-dashboard';
      case 'Revenue Inspector': return '/ri-dashboard';
      default:
        if (department && role) {
          const makeKebab = (str) => str.toLowerCase().replace(/[\s\/\(\)&]+/g, '-').replace(/-$/, '');
          return `/dept/${makeKebab(department)}/${makeKebab(role)}`;
        }
        return '/dashboard';
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!otpVerified || !category || !role) {
      toast.error('Please complete all fields.');
      return;
    }

    localStorage.setItem('jn_emp_role', role);
    if (department) localStorage.setItem('jn_emp_dept', department);
    localStorage.setItem('jn_emp_jurisdiction', JSON.stringify(jurisdictionValues));
    
    // Explicitly requested save format for MLA/Ward Member
    if (jurisdictionValues.constituency) localStorage.setItem('jn_emp_constituency', jurisdictionValues.constituency);
    if (jurisdictionValues.district) localStorage.setItem('jn_emp_district', jurisdictionValues.district);

    // Save standard keys to maintain auth status
    localStorage.setItem('jn_role', 'employee');
    localStorage.setItem('jn_name', 'KARTHIK RAJ S.');

    toast.success(`Welcome ${role}`);
    navigate(getDashboardRoute());
  };

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#8B1A1A]/10 selection:text-[#8B1A1A]">
      {/* Top Government Color Bar */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-2 select-none">
          <Shield className="w-5 h-5 text-[#8B1A1A]" />
          <span className="text-xs font-black text-[#8B1A1A] tracking-wider uppercase">JanaNayagam</span>
        </div>
        <button
          onClick={() => {
            const newLang = lang === 'en' ? 'ta' : 'en';
            toggleLang(newLang);
            toast.success(newLang === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
          }}
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
            JANANAYAGAM
          </h1>
          <p className="text-[11px] font-extrabold text-slate-400 tracking-widest mt-2 uppercase" style={{ letterSpacing: '0.1em' }}>
            TAMIL NADU CIVIC COMMAND CENTER
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white rounded-[20px] p-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/80">
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-3.5">
              {/* Govt Link Pill Indicator */}
              <div className="w-full bg-[#FFF0F0] text-[#8B1A1A] rounded-full py-2.5 px-4 flex items-center justify-center gap-2 select-none border border-[#FFD8D8]">
                <Shield className="w-4 h-4 text-[#8B1A1A] fill-[#8B1A1A]/10" />
                <span className="font-extrabold text-[13px] tracking-wider">
                  OFFICIAL & EMPLOYEE PORTAL
                </span>
              </div>

              {/* Aadhaar Input Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                  AADHAAR NUMBER
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
                      Send OTP
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
                    ENTER 6-DIGIT OTP
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
                      Verify OTP
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 overflow-visible pt-1"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      AADHAAR VERIFIED NAME
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
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      SELECT CATEGORY
                    </label>
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setRole(''); setDepartment(''); setJurisdictionValues({}); }}
                      className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Elected Representative">Elected Representative</option>
                      <option value="Administrative Officer">Administrative Officer</option>
                      <option value="Department Official">Department Official</option>
                    </select>
                  </div>

                  {category === 'Department Official' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        DEPARTMENT
                      </label>
                      <select
                        value={department}
                        onChange={(e) => { setDepartment(e.target.value); setRole(''); setJurisdictionValues({}); }}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  {category && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        ROLE
                      </label>
                      <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value); setJurisdictionValues({}); }}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">Select Role</option>
                        {category === 'Elected Representative' && ELECTED_REPS.map(r => <option key={r} value={r}>{r}</option>)}
                        {category === 'Administrative Officer' && ADMIN_OFFICERS.map(r => <option key={r} value={r}>{r}</option>)}
                        {category === 'Department Official' && department && DEPARTMENTS.find(d => d.name === department)?.roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}

                  {role && (
                    <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-2 block" style={{ letterSpacing: '0.08em' }}>
                        JURISDICTION
                      </label>
                      {renderJurisdictionFields()}
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                    className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        </div>

        {/* BACK TO CITIZEN LINK */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 font-bold text-sm underline underline-offset-2"
          >
            ← {t('backToCitizen')}
          </button>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold shrink-0 border-t border-slate-300/30">
        <p>© 2026 Tamil Nadu e-Governance Agency (TNeGA). All rights reserved.</p>
      </footer>
    </div>
  );
}
