import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, CheckCircle, AlertTriangle, Clock, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import TnMap from '../shared/components/TnMap';
import { mockTickets } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function EmployeeDashboard() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('Official');
  const [department, setDepartment] = useState('');
  const [jurisdiction, setJurisdiction] = useState({});
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    const storedRole = localStorage.getItem('jn_emp_role');
    if (!storedRole) {
      navigate('/employee-login');
      return;
    }
    setRole(storedRole);
    setDepartment(localStorage.getItem('jn_emp_dept') || '');
    try {
      setJurisdiction(JSON.parse(localStorage.getItem('jn_emp_jurisdiction') || '{}'));
    } catch (e) {
      setJurisdiction({});
    }

    // Process mock tickets for this specific role/jurisdiction
    // In a real app, this would be an API call fetching relevant tickets
    setTickets([...mockTickets]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAction = (id, action) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        let newStatus = t.status;
        if (action === 'Accept') newStatus = 'In Progress';
        if (action === 'Resolve') newStatus = 'Resolved';
        if (action === 'Escalate') newStatus = 'Escalated';
        return { ...t, status: newStatus };
      }
      return t;
    }));
    toast.success(`Ticket ${id} marked as ${action}`);
  };

  const formatJurisdiction = () => {
    if (!jurisdiction) return 'Statewide';
    const parts = [];
    if (jurisdiction.district) parts.push(jurisdiction.district + ' District');
    if (jurisdiction.taluk) parts.push(jurisdiction.taluk + ' Taluk');
    if (jurisdiction.village) parts.push(jurisdiction.village + ' Village');
    if (jurisdiction.ward) parts.push(jurisdiction.ward);
    if (jurisdiction.constituency) parts.push(jurisdiction.constituency);
    if (jurisdiction.division) parts.push(jurisdiction.division + ' Division');
    if (jurisdiction.block) parts.push(jurisdiction.block + ' Block');
    if (jurisdiction.firka) parts.push(jurisdiction.firka + ' Firka');
    if (jurisdiction.circle) parts.push(jurisdiction.circle + ' Circle');
    if (jurisdiction.department) parts.push(jurisdiction.department + ' Dept');
    
    return parts.length > 0 ? parts.join(' • ') : 'Statewide';
  };

  const titlePrefix = department ? `${department} ${role}` : role;
  
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    escalated: tickets.filter(t => t.status === 'Escalated').length,
  };

  return (
    <div className="min-h-screen bg-[#F0EBE3] font-sans flex flex-col">
      {/* Government Top Bar */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#8B1A1A]" />
          <div>
            <h1 className="text-lg font-black text-[#8B1A1A] tracking-wider uppercase">
              {titlePrefix} DASHBOARD
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {formatJurisdiction()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
          <div className="text-right hidden md:block">
            <p className="text-sm font-extrabold text-slate-800">KARTHIK RAJ S.</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">{t('verifiedOfficial')}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl font-bold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{t('totalTickets')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('open')}</span>
            <div className="mt-2 text-3xl font-black text-[#FF9800]">{stats.open}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {t('resolved')}</span>
            <div className="mt-2 text-3xl font-black text-[#4CAF50]">{stats.resolved}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {t('escalated')}</span>
            <div className="mt-2 text-3xl font-black text-[#F44336]">{stats.escalated}</div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#8B1A1A]" />
            <h2 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm">{t('jurisdictionLiveMap')}</h2>
          </div>
          <div className="h-[400px] w-full bg-slate-50 relative">
            <TnMap lang="en" citizenMode={false} zoom={7} />
          </div>
        </div>

        {/* Ticket Queue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#8B1A1A]" />
              {t('recentTicketQueue')}
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={t('searchTickets')} className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-[#8B1A1A]" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ticketId')}</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('issueLocation')}</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-xs font-black text-[#8B1A1A] bg-[#8B1A1A]/10 px-2 py-1 rounded-md">{ticket.id}</span>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">{ticket.createdAt}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm font-extrabold text-slate-700">{ticket.category}</span>
                      <div className="text-xs text-slate-500 font-bold">{ticket.priority} Priority</div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.description}</p>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {ticket.ward}, {ticket.district}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        ticket.status === 'Open' ? 'bg-[#FF9800]/10 text-[#FF9800]' :
                        ticket.status === 'Resolved' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' :
                        ticket.status === 'In Progress' ? 'bg-[#2196F3]/10 text-[#2196F3]' :
                        'bg-[#F44336]/10 text-[#F44336]'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      {ticket.status !== 'Resolved' && (
                        <>
                          <button onClick={() => handleAction(ticket.id, 'Accept')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">{t('accept')}</button>
                          <button onClick={() => handleAction(ticket.id, 'Resolve')} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-colors">{t('resolve')}</button>
                          <button onClick={() => handleAction(ticket.id, 'Escalate')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">{t('escalate')}</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
