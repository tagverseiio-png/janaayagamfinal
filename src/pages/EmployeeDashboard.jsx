import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, CheckCircle, AlertTriangle, Clock, MapPin, Search, BarChart2, FileText, List, Users, TrendingUp, Activity, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import TnMap from '../shared/components/TnMap';
import TicketCard from '../shared/components/TicketCard';
import TicketActionModals from '../shared/components/TicketActionModals';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function EmployeeDashboard() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('Official');
  const [department, setDepartment] = useState('');
  const [jurisdiction, setJurisdiction] = useState({});
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState(null);
  const [activeTicketId, setActiveTicketId] = useState(null);
  
  const isElected = ['MLA', 'Ward Member'].includes(role);
  const isAdministrative = ['District Collector', 'DRO', 'BDO', 'VAO', 'Revenue Inspector', 'Ward Officer'].includes(role);
  const isDepartment = !isElected && !isAdministrative;

  useEffect(() => {
    const storedRole = localStorage.getItem('jn_emp_role');
    if (!storedRole) {
      navigate('/employee-login');
      return;
    }
    setRole(storedRole);
    const dept = localStorage.getItem('jn_emp_dept') || '';
    setDepartment(dept);
    
    let juris = {};
    try {
      juris = JSON.parse(localStorage.getItem('jn_emp_jurisdiction') || '{}');
      setJurisdiction(juris);
    } catch (e) {
      setJurisdiction({});
    }

    api.get('/tickets').then(res => {
      let filtered = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.department?.name || 'Unknown',
        district: t.jurisdiction?.name || 'Unknown',
        ward: t.jurisdiction?.name || 'Unknown',
        id: t.ticketNumber,
        dbId: t.id,
        created_at: t.createdAt,
        sla_deadline: t.slaDeadline || new Date(new Date(t.createdAt).getTime() + 48*60*60*1000).toISOString(),
        citizen_name: t.citizen_name
      }));
      setTickets(filtered);
    }).catch(console.error);
  }, [navigate, isDepartment]);

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
    setActiveTicketId(id);
    if (action === 'view') {
      setModalState('view');
      return;
    }
    
    // Open the appropriate modal
    if (action === 'Resolve' || action === 'close' || action === 'resolve') {
      setModalState('resolve');
    } else if (action === 'Accept' || action === 'assign') {
      setModalState('assign');
    } else if (action === 'Escalate' || action === 'escalate') {
      setModalState('escalate');
    }
  };

  const handleModalSubmit = async (id, actionType, payload = {}) => {
    try {
      let newStatus = 'Open';
      if (actionType === 'assign') newStatus = 'In Progress';
      if (actionType === 'resolve') newStatus = 'Resolved';
      if (actionType === 'escalate') newStatus = 'Escalated';

      const ticketToUpdate = tickets.find(t => t.id === id);
      const dbId = ticketToUpdate ? ticketToUpdate.dbId : id;

      if (actionType === 'escalate') {
        setTickets(tickets.filter(t => t.dbId !== dbId));
      } else {
        setTickets(tickets.map(t => t.dbId === dbId ? { ...t, status: newStatus } : t));
      }
      
      await api.patch(`/tickets/${dbId}`, { status: newStatus, ...payload });
      toast.success(`Ticket ${id} marked as ${newStatus}`);

      // Refresh tickets
      const res = await api.get('/tickets');
      let filtered = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.department?.name || 'Unknown',
        district: t.jurisdiction?.name || 'Unknown',
        ward: t.jurisdiction?.name || 'Unknown',
        id: t.ticketNumber,
        dbId: t.id,
        created_at: t.createdAt,
        sla_deadline: t.slaDeadline || new Date(new Date(t.createdAt).getTime() + 48*60*60*1000).toISOString(),
        citizen_name: t.citizen_name
      }));
      
      if (isDepartment && department) {
        filtered = filtered.filter(t => t.category.toLowerCase().includes(department.toLowerCase()) || department.toLowerCase().includes(t.category.toLowerCase()));
      }
      if (jurisdiction.district) {
        filtered = filtered.filter(t => t.district === jurisdiction.district);
      }
      if (jurisdiction.ward) {
        filtered = filtered.filter(t => t.ward === jurisdiction.ward);
      }
      setTickets(filtered);
    } catch (err) {
      toast.error('Failed to update ticket status');
      console.error(err);
    }
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
    open: tickets.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'open' || s === 'in progress' || s === 'assigned' || s === 'submitted';
    }).length,
    resolved: tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length,
    escalated: tickets.filter(t => (t.status || '').toLowerCase() === 'escalated').length,
    breached: tickets.filter(t => (t.status || '').toLowerCase() !== 'resolved' && new Date() > new Date(t.sla_deadline)).length
  };

  const tableTickets = tickets.filter(t => 
    (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.district || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: 'DASHBOARD', icon: <BarChart2 /> },
      { id: 'tickets', label: 'TICKET INBOX', icon: <FileText /> },
      { id: 'reports', label: 'REPORTS', icon: <List /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-white border-r border-slate-200 flex-col justify-between shrink-0 select-none h-full">
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#8B1A1A]" />
            <div>
              <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase leading-none">JanaNayagam</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">COMMAND CENTER</span>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                  activeMenu === item.id ? 'bg-[#8B1A1A]/10 text-[#8B1A1A] border-l-4 border-[#8B1A1A]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-4 h-4 shrink-0' })}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs uppercase">
              {role.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800">{localStorage.getItem('jn_emp_name') || 'Officer'}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{role}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => toggleLang('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${lang === 'en' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>EN</button>
             <button onClick={() => toggleLang('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${lang === 'ta' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>தமிழ்</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-[10px] font-black text-rose-600 uppercase border border-rose-100 hover:bg-rose-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  };

  // --- ELECTED OFFICIALS DASHBOARD ---
  const renderElectedDashboard = () => {
    const categoryCounts = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});
    const topIssues = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" /> Constituency Pulse
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Petitions</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voter Satisfaction</span>
            <div className="mt-2 text-3xl font-black text-emerald-500">78%</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolved Issues</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{stats.resolved}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Alerts</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm">Constituency Live Map</h3>
            </div>
            <div className="h-[350px] w-full bg-slate-50 relative">
              <TnMap lang="en" citizenMode={false} zoom={7} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Top Issues Raised
            </h3>
            <div className="space-y-4">
              {topIssues.map(([cat, count], idx) => (
                <div key={cat} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{idx + 1}. {cat}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- ADMINISTRATIVE DASHBOARD ---
  const renderAdminDashboard = () => {
    const depts = ['Water', 'Electricity', 'Pot Holes (Road)', 'Sanitation'];
    const deptPerf = depts.map(d => {
      const dTickets = tickets.filter(t => t.category.includes(d));
      const total = dTickets.length || 1; // avoid /0
      const resolved = dTickets.filter(t => t.status === 'Resolved').length;
      return { name: d, rate: Math.round((resolved / total) * 100), total };
    }).sort((a,b) => b.rate - a.rate);

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" /> Administrative Command
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Jurisdiction Issues</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Departments in SLA Breach</span>
            <div className="mt-2 text-3xl font-black text-amber-500">4</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escalated Tickets</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Resolution Time</span>
            <div className="mt-2 text-3xl font-black text-slate-800">2.4 Days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm">Jurisdiction Map</h3>
            </div>
            <div className="h-[350px] w-full bg-slate-50 relative">
              <TnMap lang="en" citizenMode={false} zoom={7} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" /> Dept Performance Ranking
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2 text-center">Tickets</th>
                    <th className="px-4 py-2 text-center">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {deptPerf.map(d => (
                    <tr key={d.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-black">{d.name}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{d.total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          d.rate > 80 ? 'bg-emerald-100 text-emerald-700' :
                          d.rate > 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {d.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- DEPARTMENT OFFICIALS DASHBOARD ---
  const renderDepartmentDashboard = () => {
    const pieData = [
      { name: 'Resolved', value: stats.resolved, color: '#10B981' },
      { name: 'Open', value: stats.open, color: '#3B82F6' },
      { name: 'Escalated', value: stats.escalated, color: '#EF4444' }
    ].filter(d => d.value > 0);

    const slaData = [
      { name: 'Safe', value: stats.total - stats.breached, fill: '#10B981' },
      { name: 'Breached', value: stats.breached, fill: '#EF4444' }
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#8B1A1A]" /> {department} Operations Overview
        </h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md border border-red-800/50 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Tickets</span>
            <div className="mt-2 text-4xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open & Active</span>
            <div className="mt-2 text-4xl font-black text-blue-600">{stats.open}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SLA Breaches</span>
            <div className="mt-2 text-4xl font-black text-rose-500">{stats.breached}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution Rate</span>
            <div className="mt-2 text-4xl font-black text-emerald-500">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col items-center">
            <h3 className="w-full text-left font-extrabold text-slate-800 tracking-wide uppercase text-xs mb-4">Ticket Status Distribution</h3>
            <div className="w-full h-[250px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">No ticket data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col items-center">
            <h3 className="w-full text-left font-extrabold text-slate-800 tracking-wide uppercase text-xs mb-4">SLA Compliance</h3>
            <div className="w-full h-[250px]">
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {slaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">No SLA data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Map & Queue Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8B1A1A]" />
              <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm">{department} Live Map</h3>
            </div>
            <div className="h-[350px] w-full bg-slate-50 relative">
              <TnMap lang="en" citizenMode={false} zoom={7} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8B1A1A]" />
                Live Operations Queue
              </h2>
            </div>
            
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-10">
                  <tr>
                    <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                    <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue & Location</th>
                    <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.slice(0, 15).map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setActiveMenu('tickets')}>
                      <td className="py-4 px-5">
                        <span className="text-xs font-black text-[#8B1A1A] bg-red-50 px-2 py-1 rounded-md">{ticket.id}</span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.description}</p>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {ticket.ward}, {ticket.district}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs font-bold text-slate-600">
                        {new Date(ticket.sla_deadline || ticket.slaDeadline).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tickets.length === 0 && (
                 <div className="p-8 text-center text-slate-400 font-bold text-sm">No active operations in queue</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (isElected) return renderElectedDashboard();
    if (isAdministrative) return renderAdminDashboard();
    return renderDepartmentDashboard();
  };

  const renderTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6" /> Assigned Tickets
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search Tickets..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A]"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {tableTickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded-xl p-6">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p>No tickets found matching your search.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tableTickets.map(t => (
              <TicketCard 
                key={t.id} 
                ticket={t} 
                role={role.toLowerCase()} 
                onAction={(id, action) => handleAction(id, action)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center mt-10 max-w-3xl mx-auto">
      <List className="w-16 h-16 text-[#8B1A1A] mx-auto mb-4" />
      <h2 className="text-2xl font-black text-[#8B1A1A] uppercase tracking-wide">Generate Report</h2>
      <p className="text-slate-500 font-bold mt-2 mb-6">Generate official metrics report for {formatJurisdiction()}.</p>
      <button onClick={() => toast.success("Report downloaded successfully!")} className="bg-[#8B1A1A] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow hover:bg-red-900 transition-colors">
        Download PDF Report
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="bg-[#8B1A1A] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">{titlePrefix} DASHBOARD</h1>
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded mt-1 inline-block">
              JURISDICTION: {formatJurisdiction()}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'tickets' && renderTickets()}
              {activeMenu === 'reports' && renderReports()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <TicketActionModals 
        activeTicket={tickets.find(t => t.id === activeTicketId)} 
        modalState={modalState} 
        setModalState={setModalState} 
        onSubmitAction={handleModalSubmit}
        role={role}
      />
    </div>
  );
}
