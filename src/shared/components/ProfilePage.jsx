import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Activity, LogOut, ArrowLeft, Handshake, PhoneCall, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const isEmployee = localStorage.getItem('jn_role') === 'employee';
  const role = isEmployee ? (localStorage.getItem('jn_emp_role') || 'Official').toLowerCase() : (localStorage.getItem('jn_role') || 'citizen');
  const name = localStorage.getItem('jn_name') || 'Guest User';
  const ward = localStorage.getItem('jn_ward') || localStorage.getItem('jn_living_ward') || localStorage.getItem('jn_ward_name') || '';
  const district = localStorage.getItem('jn_district') || 'Chennai';
  const constituency = localStorage.getItem('jn_constituency') || 'Velachery';
  const department = localStorage.getItem('jn_department') || 'Municipal Administration';
  const isVolunteer = localStorage.getItem('jn_is_volunteer') === 'true';
  const phone = localStorage.getItem('jn_phone') || '';
  const empDept = localStorage.getItem('jn_emp_dept') || '';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Role details mapping
  const roleDisplayNames = {
    citizen: tLabel('Citizen', 'பொதுமக்கள்'),
    vao: tLabel('Village Administrative Officer (VAO)', 'கிராம நிர்வாக அலுவலர்'),
    ward_officer: tLabel('Ward Officer', 'வார்டு அதிகாரி'),
    bdo: tLabel('Block Development Officer (BDO)', 'வட்டார வளர்ச்சி அலுவலர்'),
    dro: tLabel('District Revenue Officer (DRO)', 'மாவட்ட வருவாய் அலுவலர்'),
    mla: tLabel('Member of Legislative Assembly (MLA)', 'சட்டமன்ற உறுப்பினர் (MLA)'),
    collector: tLabel('District Collector', 'மாவட்ட ஆட்சியர்'),
    dept_secretary: tLabel('Department Secretary', 'துறைச் செயலாளர்'),
    minister: tLabel('Cabinet Minister', 'அமைச்சர்'),
    cm: tLabel('Chief Minister (CM)', 'முதலமைச்சர்'),
    aae: tLabel('Assistant Associate Engineer (AAE)', 'உதவி மின் பொறியாளர்'),
    ae: tLabel('Assistant Engineer (AE)', 'உதவி பொறியாளர்'),
    zonal_officer: tLabel('Zonal Officer', 'மண்டல அதிகாரி'),
    commissioner: tLabel('Commissioner', 'ஆணையர்'),
    ri: tLabel('Revenue Inspector (RI)', 'வருவாய் ஆய்வாளர்'),
    official: tLabel('Civic Official', 'நகராட்சி அதிகாரி')
  };

  const getJurisdictionLabel = () => {
    if (isEmployee) {
      try {
        const jurisStr = localStorage.getItem('jn_emp_jurisdiction');
        if (jurisStr) {
          const juris = JSON.parse(jurisStr);
          const entries = Object.entries(juris);
          if (entries.length > 0) {
            return `${entries[0][0].toUpperCase()}: ${entries[0][1]}`;
          }
        }
      } catch (e) {}
      const empDistrict = localStorage.getItem('jn_emp_district');
      const empConstituency = localStorage.getItem('jn_emp_constituency');
      if (empConstituency) return `${tLabel('Constituency', 'தொகுதி')}: ${empConstituency}`;
      if (empDistrict) return `${tLabel('District', 'மாவட்டம்')}: ${empDistrict}`;
      return district;
    }

    switch (role) {
      case 'citizen':
        return `${tLabel('Ward', 'வார்டு')} ${ward}, ${district}`;
      case 'vao':
        return `${tLabel('Village', 'கிராமம்')} ${ward || 'Velachery'}, ${district}`;
      case 'ward_officer':
        return `${tLabel('Ward', 'வார்டு')} ${ward}, ${district}`;
      case 'bdo':
        return `${tLabel('Taluk', 'வட்டம்')} Velachery, ${district}`;
      case 'dro':
        return `${tLabel('Revenue Division', 'வருவாய் பிரிவு')}, ${district}`;
      case 'mla':
        return `${tLabel('Constituency', 'தொகுதி')} ${constituency}, ${district}`;
      case 'collector':
        return `${district} ${tLabel('District', 'மாவட்டம்')}`;
      case 'dept_secretary':
        return `${department} ${tLabel('Department', 'துறை')}`;
      case 'minister':
        return `${department} ${tLabel('Portfolio', 'பொறுப்பு')}`;
      case 'cm':
        return tLabel('Tamil Nadu State', 'தமிழ்நாடு மாநிலம்');
      default:
        return district;
    }
  };

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('jn_lng', lng);
    toast.success(lng === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  const getDashboardRoute = () => {
    if (!isEmployee) return '/citizen/feed';
    const empRole = (localStorage.getItem('jn_emp_role') || '').toUpperCase();
    const empDept = localStorage.getItem('jn_emp_dept') || '';

    if (empRole === 'CM') return '/cm';
    if (empRole === 'SUPERADMIN' || empRole === 'SUPER_ADMIN') return '/admin';
    if (empRole === 'MLA') return '/mla';
    if (empRole === 'MINISTER') return '/minister';
    if (empRole === 'WARD MEMBER' || empRole === 'PANCHAYAT_PRESIDENT') return '/ward-member-dashboard';
    if (empRole === 'DISTRICT COLLECTOR' || empRole === 'COLLECTOR') return '/collector-dashboard';
    if (empRole === 'DRO' || empRole === 'RDO' || empRole === 'TAHSILDAR') return '/dro-dashboard';
    if (empRole === 'BDO') return '/bdo-dashboard';
    if (empRole === 'VAO') return '/vao-dashboard';
    if (empRole === 'WARD OFFICER' || empRole === 'ZONAL_OFFICER') return '/ward-officer-dashboard';
    if (empRole === 'RI' || empRole === 'COMMISSIONER') return '/ri-dashboard';
    if (empDept) {
      return `/dept/${encodeURIComponent(empDept)}/${encodeURIComponent(empRole)}`;
    }
    return '/employee-login';
  };

  const handleBackClick = () => {
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getDashboardRoute(), { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success(tLabel('Logged out successfully', 'வெற்றிகரமாக வெளியேறப்பட்டது'));
    if (isEmployee) {
      navigate('/employee-login', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="w-full pb-24 select-none bg-[#F0EBE3] min-h-screen">
      {/* ══ PAGE HEADER ══ */}
      <div className="bg-white sticky top-0 z-50 border-b border-slate-200 shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button
            onClick={handleBackClick}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            style={{ minWidth: '44px', minHeight: '44px' }}
            title={tLabel("Back to Dashboard", "கட்டுப்பாட்டு அறைக்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
          </button>

          <h2 className="text-base font-black text-slate-800 tracking-wide uppercase">
            {isEmployee ? tLabel("Official Profile Card", "உத்தியோகபூர்வ அட்டை") : tLabel("Profile & Settings", "சுயவிவரம் & அமைப்புகள்")}
          </h2>

          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Top Centered Section / Avatar */}
        <div className="flex flex-col items-center text-center space-y-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8B1A1A] via-[#FF6600] to-[#138808]"></div>
          
          {/* Avatar Profile Photo */}
          {isEmployee ? (
            <div className="w-24 h-24 rounded-full shadow-md border-4 border-white select-none relative overflow-hidden bg-slate-100">
              <img 
                src={['Anandhi', 'Priyadharshini'].some(f => name.includes(f)) ? '/jana_feed_media/officer_female.png' : '/jana_feed_media/officer_male.png'} 
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm" title="Verified Badge">
                <span className="text-white text-[10px] font-black">✓</span>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8B1A1A] to-[#FF6600] text-white flex items-center justify-center font-extrabold text-[36px] shadow-md border-4 border-white select-none relative">
              {initials}
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm" title="Verified Badge">
                <span className="text-white text-[10px] font-black">✓</span>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
              {name}
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-black uppercase bg-red-50 text-[#8B1A1A] border border-[#8B1A1A]/10">
              {roleDisplayNames[role] || roleDisplayNames['official']}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>GOVERNMENT OF TAMIL NADU</span>
            <span>TNeGA VERIFIED</span>
          </div>
        </div>

        {/* Details & Settings List */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          
          {isEmployee ? (
            /* ══ OFFICIAL DETAILS SHEET ══ */
            <div className="divide-y divide-slate-100">
              <div className="p-4 space-y-1 bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Name</span>
                <p className="text-sm font-extrabold text-slate-800">{name}</p>
              </div>
              
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Designation</span>
                <p className="text-sm font-extrabold text-[#8B1A1A] uppercase">{roleDisplayNames[role] || role.toUpperCase()}</p>
              </div>

              {empDept && (
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Department</span>
                  <p className="text-sm font-extrabold text-slate-800">{empDept}</p>
                </div>
              )}

              <div className="p-4 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Constituency / Jurisdiction Zone</span>
                <p className="text-sm font-extrabold text-slate-800">{getJurisdictionLabel()}</p>
              </div>

              <div className="p-4 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Details</span>
                <p className="text-sm font-extrabold text-slate-800">{phone || tLabel('+91 94440 00000 (Official Hotline)', '+91 94440 00000 (உத்தியோகபூர்வ உதவி எண்)')}</p>
              </div>

              {/* Language Switch for Official */}
              <div className="flex items-center justify-between p-4 bg-slate-50/20">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Interface Language</span>
                  <span className="text-[10px] text-slate-400 font-bold">Select translation</span>
                </div>
                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/50 shadow-inner">
                  <button
                    onClick={() => toggleLanguage('en')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${!isTa ? 'bg-[#8B1A1A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => toggleLanguage('ta')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${isTa ? 'bg-[#8B1A1A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ══ CITIZEN DETAILS & SETTINGS ══ */
            <>
              {/* Row: Aadhaar */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('Aadhaar Verification', 'ஆதார் சரிபார்ப்பு')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('XXXX-XXXX-1234 (Masked)', 'XXXX-XXXX-1234 (மறைக்கப்பட்டது)')}
                  </span>
                </div>
                <button
                  onClick={() => toast.info(tLabel('OTP verification triggered for Aadhaar update', 'ஆதார் சரிபார்ப்பு OTP தூண்டப்பட்டது'))}
                  className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#8B1A1A] uppercase tracking-wider"
                >
                  {tLabel('Re-verify', 'மீண்டும் சரிபார்')}
                </button>
              </div>

              {/* Citizen Row Links */}
              <button
                onClick={() => navigate(isVolunteer ? '/citizen/volunteer-dashboard' : '/citizen/volunteer-signup')}
                className="w-full flex items-center p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-red-50 rounded-xl mr-3 shrink-0">
                  <Handshake className="w-5 h-5 text-[#8B1A1A]" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('Become a JanaNayagam', 'ஜனநாயகம் ஆகுங்கள்')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Serve your ward', 'வார்டு சேவை')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/citizen/sos')}
                className="w-full flex items-center p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-blue-50 rounded-xl mr-3 shrink-0">
                  <PhoneCall className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('SOS Help', 'அவசரம்')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Emergencies · 112', 'உதவி எண்கள் · 112')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/citizen/refer')}
                className="w-full flex items-center p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-indigo-50 rounded-xl mr-3 shrink-0">
                  <Share2 className="w-5 h-5 text-indigo-800" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('Invite a Friend', 'பரிந்துரை')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Refer & earn', 'பகிர்ந்து கொள்க')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/how-it-works')}
                className="w-full flex items-center p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-emerald-50 rounded-xl mr-3 shrink-0">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('How it works', 'இது எப்படி செயல்படுகிறது')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Understanding JanaNayagam', 'ஜனநாயகம் குறித்து அறிய')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/about-us')}
                className="w-full flex items-center p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-amber-50 rounded-xl mr-3 shrink-0">
                  <Handshake className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('About Us', 'எங்களை பற்றி')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Our mission & team', 'எங்கள் நோக்கம்')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Language Toggle */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('App Language', 'பயன்பாட்டு மொழி')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Select translation', 'மொழியை தேர்வு செய்')}
                  </span>
                </div>
                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/50 shadow-inner">
                  <button
                    onClick={() => toggleLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${!isTa ? 'bg-[#8B1A1A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => toggleLanguage('ta')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${isTa ? 'bg-[#8B1A1A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Location Settings */}
              <button
                onClick={() => navigate(`/${role.replace('_', '-')}/profile/location`)}
                className="w-full flex items-center justify-between p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-800">
                    {tLabel('Location Settings', 'இருப்பிட அமைப்புகள்')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {tLabel('Update current living address', 'வசிப்பிட முகவரியை மாற்று')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Info Rows */}
              <div className="px-4 py-3 bg-slate-50/50 space-y-2 border-b border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">{tLabel('My Issues Filed', 'நான் அளித்த புகார்கள்')}</span>
                  <span className="text-slate-600 font-extrabold">3</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">{tLabel('My Claims Count', 'எனது உரிமைகள் எண்ணிக்கை')}</span>
                  <span className="text-slate-600 font-extrabold">12</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">{tLabel('App Version', 'பயன்பாட்டு பதிப்பு')}</span>
                  <span className="text-slate-600 font-extrabold">JanaNayagam v1.0</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">{tLabel('Built by', 'தயாரிப்பு')}</span>
                  <span className="text-slate-600 font-extrabold">{tLabel('Tamil Nadu Government', 'தமிழ்நாடு அரசு')}</span>
                </div>
              </div>
            </>
          )}

          {/* Logout Row */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 text-center text-sm font-black text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isEmployee ? tLabel('Secure Logout & Exit Session', 'பாதுகாப்பாக வெளியேறி அமர்வை முடி') : tLabel('Logout Session', 'அமர்விலிருந்து வெளியேறு')}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
