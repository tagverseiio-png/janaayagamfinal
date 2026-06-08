import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const getDashboardRoute = (role) => {
  if (role === 'CM') return '/cm/dashboard';
  if (role === 'Superadmin') return '/admin';
  if (role === 'MLA') return '/mla/dashboard';
  if (role === 'Director' || role === 'Minister') return '/minister/dashboard';
  return '/employee/dashboard';
};

export default function EmployeeLoginPage() {
  const { lang, toggleLang } = useLanguage();
  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;
  
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(tLabel('Please enter both username and password', 'பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்'));
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
      
      if (employee.department) {
        localStorage.setItem('jn_emp_dept', employee.department.name);
      }
      
      if (employee.jurisdiction) {
        const jurisValues = {
          [employee.jurisdiction.level.toLowerCase()]: employee.jurisdiction.name
        };
        localStorage.setItem('jn_emp_jurisdiction', JSON.stringify(jurisValues));
        
        if (employee.jurisdiction.level === 'District') {
           localStorage.setItem('jn_emp_district', employee.jurisdiction.name);
        } else if (employee.jurisdiction.level === 'Constituency') {
           localStorage.setItem('jn_emp_constituency', employee.jurisdiction.name);
        }
      }

      localStorage.setItem('jn_role', 'employee');
      localStorage.setItem('jn_name', employee.name);

      toast.success(tLabel(`Welcome ${employee.role}`, `நல்வரவு ${employee.role}`));
      navigate(getDashboardRoute(employee.role));
    } catch (err) {
      toast.error(tLabel('Invalid credentials. Please try again.', 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல்.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen flex flex-col justify-between font-sans">
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
          >
            ← {tLabel('Back', 'திரும்பு')}
          </button>
        </div>
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
          <h1 className="text-[28px] font-black tracking-widest text-[#8B1A1A] uppercase">
            {tLabel('Official Login', 'அதிகாரப்பூர்வ உள்நுழைவு')}
          </h1>
        </div>

        <div className="w-full max-w-md bg-white rounded-[20px] p-[28px] shadow-sm border border-slate-100/80">
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                  {tLabel('Username / Employee ID', 'பயனர்பெயர் / பணியாளர் ஐடி')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={`w-5 h-5 transition-colors ${username.length > 0 ? 'text-[#8B1A1A]' : 'text-slate-300 group-focus-within:text-[#8B1A1A]'}`} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="emp12345"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block ml-1">
                  {tLabel('Password', 'கடவுச்சொல்')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 transition-colors ${password.length > 0 ? 'text-[#8B1A1A]' : 'text-slate-300 group-focus-within:text-[#8B1A1A]'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#8B1A1A] focus:bg-white transition-all shadow-sm tracking-wide"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A1A] disabled:opacity-50 hover:bg-[#7A1515] text-white font-extrabold text-sm rounded-xl py-3.5 shadow-md shadow-[#8B1A1A]/20 transition-all active:scale-[0.98] uppercase tracking-widest mt-2"
            >
              {loading ? tLabel('Logging in...', 'உள்நுழைகிறது...') : tLabel('Secure Login', 'உள்நுழைய')}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
