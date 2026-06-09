import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const getDashboardRoute = (role, departmentName) => {
  const r = role ? role.toUpperCase() : '';
  if (r === 'CM') return '/cm-dashboard';
  if (r === 'SUPERADMIN' || r === 'SUPER_ADMIN') return '/admin';
  if (r === 'MLA') return '/mla-dashboard';
  if (r === 'MINISTER') return '/minister-dashboard';
  if (r === 'WARD MEMBER' || r === 'PANCHAYAT_PRESIDENT') return '/ward-member-dashboard';
  if (r === 'DISTRICT COLLECTOR' || r === 'COLLECTOR') return '/collector-dashboard';
  if (r === 'DRO' || r === 'RDO' || r === 'TAHSILDAR') return '/dro-dashboard';
  if (r === 'BDO') return '/bdo-dashboard';
  if (r === 'VAO') return '/vao-dashboard';
  if (r === 'WARD OFFICER' || r === 'ZONAL_OFFICER') return '/ward-officer-dashboard';
  if (r === 'RI' || r === 'COMMISSIONER') return '/ri-dashboard';
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error(tLabel('Username and Password are required', 'பயனர் பெயர் மற்றும் கடவுச்சொல் தேவை'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/employee/login', {
        username,
        password
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

      if (employee.jurisdiction) {
        const level = employee.jurisdiction.level;
        const name = employee.jurisdiction.name;
        const jurisValues = {
          [level.toLowerCase()]: name
        };
        localStorage.setItem('jn_emp_jurisdiction', JSON.stringify(jurisValues));
        
        if (level === 'DISTRICT') {
          localStorage.setItem('jn_emp_district', name);
        } else if (level === 'CONSTITUENCY') {
          localStorage.setItem('jn_emp_constituency', name);
        }
      } else {
        localStorage.removeItem('jn_emp_jurisdiction');
        localStorage.removeItem('jn_emp_district');
        localStorage.removeItem('jn_emp_constituency');
      }

      toast.success(tLabel(`Access Granted: Welcome ${employee.name}`, `அணுகல் அனுமதி: நல்வரவு ${employee.name}`));
      navigate(getDashboardRoute(employee.role, employee.department?.name));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials';
      toast.error(tLabel(errorMsg, 'உள்நுழைவு தோல்வியடைந்தது. விவரங்களைச் சரிபார்க்கவும்.'));
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
            {tLabel('Secure Official Access — Government of Tamil Nadu', 'பாதுகாப்பான உத்தியோகபூர்வ அணுகல் நுழைவு')}
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-200/50">
          
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / User ID */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                {tLabel('User ID / Username', 'பயனர் ஐடி / பெயர்')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-[#8B1A1A]" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tLabel('Enter User ID', 'பயனர் ஐடி உள்ளிடவும்')}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                {tLabel('Password', 'கடவுச்சொல்')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#8B1A1A]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tLabel('Enter Password', 'கடவுச்சொல் உள்ளிடவும்')}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Note box */}
            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 select-none text-center">
              <p className="text-[11px] font-bold text-[#B78103] leading-normal">
                {tLabel(
                  'Employee accounts are created by the Super Admin. Contact your administrator if you do not have credentials.',
                  'பணியாளர் கணக்குகள் சூப்பர் அட்மினால் மட்டுமே உருவாக்கப்படுகின்றன. விவரங்கள் இல்லை எனில் நிர்வாகியைத் தொடர்பு கொள்ளவும்.'
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A1A] hover:bg-[#7A1515] text-white font-extrabold text-xs rounded-xl py-4 shadow-md shadow-[#8B1A1A]/10 transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              {loading ? tLabel('Logging in...', 'உள்நுழைகிறது...') : tLabel('Secure Login', 'பாதுகாப்பான உள்நுழைவு')}
            </button>
          </form>

        </div>
      </main>

      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold shrink-0 border-t border-slate-300/30">
        <p>© 2026 Tamil Nadu e-Governance Agency (TNeGA). All rights reserved.</p>
      </footer>
    </div>
  );
}
