import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, CheckCircle, MapPin, X, ArrowRight, 
  Map, Search, Download, Radio, Megaphone, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, 
  List, Phone, Shield, FileText, LogOut
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import StatCard from '../../shared/components/StatCard';
import { 
  SEED_TICKETS, STATE_STATS, DISTRICT_STATS, RESOLUTION_TREND, 
  EMERGENCY_CONTACTS, DISTRICT_COORDINATES, getCategoryCount 
} from '../../data/seedData';

const CATEGORY_COLORS = {
  Water: '#3b82f6', Electricity: '#eab308', Roads: '#64748b', 
  Sanitation: '#22c55e', Revenue: '#8b5cf6', Health: '#ef4444', 
  Education: '#f97316', Welfare: '#ec4899'
};

export default function CmDashboard({ overviewMode = false }) {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  
  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeMapTab, setActiveMapTab] = useState(overviewMode ? 'map' : 'grid');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDeptTab, setActiveDeptTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    navigate('/');
  };

  const generateReport = () => {
    const reportContent = `JANANAYAGAM — CABINET REPORT
Tamil Nadu Civic Command Center
Generated: ${new Date().toLocaleString()}
========================================

STATEWIDE SUMMARY
- Total Open Tickets: ${STATE_STATS.totalOpen}
- Total Resolved: ${STATE_STATS.totalResolved}
- Critical Priority: ${STATE_STATS.criticalPriority}
- Breach Districts: ${STATE_STATS.breachDistricts}
- CM Escalations: ${STATE_STATS.cmEscalations}

DEPARTMENT COMPLAINT VOLUME
${getCategoryCount().map(c => `- ${c.name}: ${c.count} complaints`).join('\n')}

TOP 5 PERFORMING DISTRICTS
- Kanniyakumari: 97% resolved
- Thanjavur: 97% resolved
- Dindigul: 96% resolved
- Chennai: 95% resolved
- Kancheepuram: 94% resolved

DISTRICTS NEEDING ATTENTION
- Tiruvarur: 63% resolution
- Tirupathur: 71% resolution
- Vellore: 75% resolution
- Tiruvannamalai: 75% resolution

========================================
Confidential — Government of Tamil Nadu`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JanaNayagam_Cabinet_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setReportGenerated(true);
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data processing
  const districtsInCrisis = Object.entries(DISTRICT_STATS)
    .filter(([_, stats]) => stats.critical > 5)
    .map(([name, stats]) => ({ name, ...stats }));
  const isCrisisActive = districtsInCrisis.length >= 5;
  const totalCrisisImpact = districtsInCrisis.reduce((sum, d) => sum + d.critical, 0);

  const allDepartments = ['All', 'Water', 'Electricity', 'Roads', 'Sanitation', 'Revenue', 'Health', 'Education', 'Welfare'];
  const deptChartData = allDepartments.filter(d => d !== 'All').map(dept => {
    return { name: dept, count: SEED_TICKETS.filter(t => t.category === dept).length };
  });

  const latestTickets = [...SEED_TICKETS]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  const districtPerformance = Object.entries(DISTRICT_STATS).map(([name, stats]) => {
    const rate = Math.round((stats.resolved / (stats.resolved + stats.open)) * 100) || 0;
    return { name, rate, ...stats };
  }).sort((a, b) => b.rate - a.rate);
  const top5Districts = districtPerformance.slice(0, 5);
  const bottom5Districts = districtPerformance.slice(-5).reverse();

  const deptPerformanceData = allDepartments.filter(d => d !== 'All').map(dept => {
    const deptTickets = SEED_TICKETS.filter(t => t.category === dept);
    const total = deptTickets.length || 1;
    const resolved = deptTickets.filter(t => t.status === 'Resolved').length;
    return { name: dept, rate: Math.round((resolved / total) * 100) };
  }).sort((a, b) => b.rate - a.rate);

  const escalatedTickets = SEED_TICKETS.filter(t => t.status === 'Escalated' && t.priority === 'Critical');

  // Filtered tickets for State Tickets table
  const tableTickets = SEED_TICKETS.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // District details chart
  let districtCategoryData = [];
  if (selectedDistrict) {
    const catCounts = {};
    SEED_TICKETS.filter(t => t.district === selectedDistrict.name).forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    districtCategoryData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
  }

  // Render Sidebar
  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: t('dashboard'), icon: <BarChart2 /> },
      { id: 'tickets', label: t('stateTickets'), icon: <FileText /> },
      { id: 'analytics', label: t('analytics'), icon: <TrendingUp /> },
      { id: 'crisis', label: t('crisisMode'), icon: <AlertTriangle /> },
      { id: 'escalations', label: t('allEscalations'), icon: <ShieldAlert /> },
      { id: 'report', label: t('cabinetReport'), icon: <List /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-white border-r border-slate-200 flex-col justify-between shrink-0 select-none h-full">
        <div>
          {/* Logo Area */}
          <div className="p-5 border-b border-slate-200 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#8B1A1A]" />
            <div>
              <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase leading-none">JanaNayagam</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{t('commandCenter')}</span>
            </div>
          </div>
          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                  activeMenu === item.id ? 'bg-[#8B1A1A]/10 text-[#8B1A1A] border-l-4 border-[#8B1A1A]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-4 h-4 shrink-0' })}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Bottom Profile */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs">KR</div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800">KARTHIK RAJ S.</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">CM</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => toggleLang('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${lang === 'en' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>EN</button>
             <button onClick={() => toggleLang('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${lang === 'ta' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>தமிழ்</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-[10px] font-black text-rose-600 uppercase border border-rose-100 hover:bg-rose-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    );
  };

  // Content Tabs
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white border-l-8 border-l-[#FF6600] border-t-4 border-t-[#138808] rounded-3xl p-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6600] block">Government of Tamil Nadu</span>
            <h1 className="text-3xl font-black text-[#8B1A1A] mt-1 leading-none drop-shadow-sm">Chief Minister's Command Center</h1>
          </div>
        </div>
        <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-2xl font-mono font-black text-slate-800">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={t('statewideOpen')} value={STATE_STATS.totalOpen} icon={<Activity className="text-blue-500 w-5 h-5" />} color="blue" />
        <StatCard label={t('criticalPriority')} value={STATE_STATS.criticalPriority} icon={<ShieldAlert className="text-red-500 w-5 h-5" />} color="red" />
        <StatCard label={t('breachDistricts')} value={STATE_STATS.breachDistricts} icon={<AlertTriangle className="text-amber-500 w-5 h-5" />} color="orange" />
        <StatCard label={t('resolvedMonth')} value={1856} icon={<CheckCircle className="text-emerald-500 w-5 h-5" />} color="green" />
        <StatCard label={t('cmEscalations')} value={STATE_STATS.cmEscalations} icon={<TrendingUp className="text-purple-500 w-5 h-5" />} color="indigo" />
        <StatCard label={t('activeSectors')} value={STATE_STATS.activeSectors} icon={<BarChart2 className="text-slate-500 w-5 h-5" />} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map / Grid Toggle */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-5 h-5" /> District Command View
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setActiveMapTab('grid')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${activeMapTab === 'grid' ? 'bg-[#8B1A1A] text-white shadow' : 'text-slate-500'}`}>Grid</button>
              <button onClick={() => setActiveMapTab('map')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${activeMapTab === 'map' ? 'bg-[#8B1A1A] text-white shadow' : 'text-slate-500'}`}>Map</button>
            </div>
          </div>
          {activeMapTab === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(DISTRICT_STATS).map(([name, stats]) => {
                let colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                if (stats.open > 50) colorClass = 'bg-rose-50 border-rose-200 text-rose-800';
                else if (stats.open >= 10) colorClass = 'bg-amber-50 border-amber-200 text-amber-800';
                return (
                  <div key={name} onClick={() => setSelectedDistrict({ name, ...stats })} className={`p-3 border rounded-xl cursor-pointer hover:opacity-80 transition-opacity h-24 flex flex-col justify-between ${colorClass}`}>
                    <span className="text-[9px] font-black uppercase tracking-wider truncate">{name}</span>
                    <div>
                      <span className="text-xl font-black font-mono block leading-none">{stats.open}</span>
                      <span className="text-[8px] font-bold uppercase opacity-70">Open</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: '450px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer
                center={[10.8505, 78.6677]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                />
                {districtMarkers.map((d, i) => (
                  <CircleMarker
                    key={i}
                    center={[d.lat, d.lng]}
                    radius={d.open > 50 ? 18 : d.open > 20 ? 12 : 8}
                    fillColor={d.open > 50 ? '#EF4444' : d.open > 20 ? '#F59E0B' : '#10B981'}
                    color="#fff"
                    weight={2}
                    fillOpacity={0.8}
                    eventHandlers={{ click: () => setSelectedDistrict({ name: d.name, ...d }) }}
                  >
                    <Popup>
                      <strong>{d.name}</strong><br/>
                      Open: {d.open}<br/>
                      Resolved: {d.resolved}<br/>
                      Critical: {d.critical}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>

        {/* Live Ticket Feed */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[500px] overflow-hidden">
          <div className="p-5 border-b bg-slate-50 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">Live Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {latestTickets.map(ticket => (
              <div key={ticket.id} className={`p-3 rounded-xl border ${ticket.priority === 'Critical' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'} cursor-pointer hover:shadow-md`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono font-black text-xs">{ticket.id}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${ticket.priority === 'Critical' ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>{ticket.priority}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 line-clamp-2">{ticket.description}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100/50 text-[10px] font-bold text-slate-500 uppercase">
                  <span>{ticket.district}</span><span className="text-[#8B1A1A] font-black">{ticket.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStateTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6" /> State Tickets Registry
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search ID, District, Category..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A]"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0">
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Category</th>
              <th className="p-4 border-b">District</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Priority</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
            {tableTickets.map(t => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-mono font-black">{t.id}</td>
                <td className="p-4">{t.category}</td>
                <td className="p-4">{t.district}</td>
                <td className="p-4">{t.status}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-black ${t.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6" /> State Analytics & Performance
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dept Bar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
           <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide mb-4">Dept Complaint Volume</h3>
           <div className="flex flex-wrap gap-2 mb-4">
              {allDepartments.map(dept => (
                <button 
                  key={dept} onClick={() => setActiveDeptTab(dept)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${activeDeptTab === dept ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >{dept}</button>
              ))}
           </div>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="count" fill="#8B1A1A" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide mb-4">7-Day Resolution Trend</h3>
          <div className="h-[250px] w-full mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RESOLUTION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} name="Resolved" />
                <Line type="monotone" dataKey="filed" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48', strokeWidth: 2 }} name="Filed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top/Bottom Districts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide mb-4">District Resolution Rates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[10px] font-black uppercase text-emerald-600 mb-2 border-b pb-1">Top 5 Performers</h4>
              <div className="space-y-2">
                {top5Districts.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-700 mb-1">
                      <span>{d.name}</span><span>{d.rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.rate}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-rose-600 mb-2 border-b pb-1">Bottom 5 Performers</h4>
              <div className="space-y-2">
                {bottom5Districts.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-700 mb-1">
                      <span>{d.name}</span><span>{d.rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${d.rate}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dept Horizontal Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide mb-4">Dept Resolution Rate</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={deptPerformanceData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="rate" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={15}>
                  {deptPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate > 70 ? '#10b981' : entry.rate > 40 ? '#f59e0b' : '#e11d48'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCrisisMode = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      {isCrisisActive ? (
        <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg border-4 border-red-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-12 h-12 animate-pulse text-yellow-300 shrink-0" />
            <div>
              <h3 className="font-black text-2xl uppercase tracking-wider">Statewide Systemic Alert</h3>
              <p className="font-bold opacity-90 mt-1">Critical issues detected in {districtsInCrisis.length} districts (Total Impact: {totalCrisisImpact}). Immediate intervention required.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-3xl border border-emerald-200 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <div>
            <h3 className="font-black text-lg uppercase tracking-wider">No Active Crises</h3>
            <p className="font-bold text-sm">State metrics are within normal parameters.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-700 uppercase tracking-wide">Crisis Protocol Directory</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Emergency Contacts</p>
          </div>
        </div>
        <div className="space-y-4">
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase">{c.dept}</h4>
                <p className="font-bold text-slate-500 text-xs">{c.officer}</p>
              </div>
              <a href={`tel:${c.phone}`} className="bg-[#8B1A1A] text-white px-6 py-3 rounded-xl font-black font-mono text-sm shadow hover:bg-red-900 transition-colors">
                {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEscalations = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
      <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-6">
        <ShieldAlert className="w-6 h-6" /> Escalation Inbox
      </h2>
      <div className="grid gap-4">
        {escalatedTickets.map(ticket => (
          <div key={ticket.id} className="p-5 border border-red-100 bg-red-50/30 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-black text-sm text-red-700">{ticket.id}</span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border shadow-sm text-slate-600 uppercase">{ticket.district}</span>
              </div>
              <p className="text-sm text-slate-800 font-bold">{ticket.description}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-colors shadow">Direct Intervene</button>
              <button className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-colors border border-slate-300 shadow-sm">Assign Min.</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCabinetReport = () => (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <List className="w-10 h-10 text-[#8B1A1A]" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide mb-3">{t('generateCabinetReport')}</h2>
        <p className="text-sm font-bold text-slate-500 mb-8 max-w-md mx-auto">
          {t('cabinetReportDesc')}
        </p>
        <button onClick={generateReport} className="bg-[#8B1A1A] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow-md hover:bg-red-900 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 mx-auto">
          <Download className="w-5 h-5" /> {t('generateExportPdf')}
        </button>

        {reportGenerated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-left">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg font-bold text-sm mb-4 flex items-center gap-2 justify-center">
              ✅ Cabinet Report generated and downloaded successfully
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-inner overflow-auto max-h-96">
{`JANANAYAGAM — CABINET REPORT
Tamil Nadu Civic Command Center
Generated: ${new Date().toLocaleString()}
========================================

STATEWIDE SUMMARY
- Total Open Tickets: ${STATE_STATS.totalOpen}
- Total Resolved: ${STATE_STATS.totalResolved}
- Critical Priority: ${STATE_STATS.criticalPriority}
- Breach Districts: ${STATE_STATS.breachDistricts}
- CM Escalations: ${STATE_STATS.cmEscalations}

DEPARTMENT COMPLAINT VOLUME
${getCategoryCount().map(c => `- ${c.name}: ${c.count} complaints`).join('\n')}

TOP 5 PERFORMING DISTRICTS
- Kanniyakumari: 97% resolved
- Thanjavur: 97% resolved
- Dindigul: 96% resolved
- Chennai: 95% resolved
- Kancheepuram: 94% resolved

DISTRICTS NEEDING ATTENTION
- Tiruvarur: 63% resolution
- Tirupathur: 71% resolution
- Vellore: 75% resolution
- Tiruvannamalai: 75% resolution

========================================
Confidential — Government of Tamil Nadu`}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const districtMarkers = [
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, open: 14, resolved: 245, critical: 8 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, open: 39, resolved: 180, critical: 5 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198, open: 27, resolved: 156, critical: 3 },
    { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, open: 33, resolved: 145, critical: 4 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460, open: 15, resolved: 134, critical: 2 },
    { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, open: 6, resolved: 98, critical: 1 },
    { name: 'Vellore', lat: 12.9165, lng: 79.1325, open: 49, resolved: 145, critical: 7 },
    { name: 'Erode', lat: 11.3410, lng: 77.7172, open: 12, resolved: 89, critical: 2 },
    { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, open: 2, resolved: 56, critical: 0 },
    { name: 'Dindigul', lat: 10.3624, lng: 77.9695, open: 3, resolved: 67, critical: 1 },
    { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, open: 11, resolved: 78, critical: 2 },
    { name: 'Tiruppur', lat: 11.1085, lng: 77.3411, open: 9, resolved: 78, critical: 1 },
    { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, open: 44, resolved: 134, critical: 7 },
    { name: 'Tiruvarur', lat: 10.7726, lng: 79.6368, open: 52, resolved: 89, critical: 8 },
    { name: 'Villupuram', lat: 11.9401, lng: 79.4861, open: 25, resolved: 98, critical: 4 },
    { name: 'Cuddalore', lat: 11.7480, lng: 79.7714, open: 14, resolved: 98, critical: 2 },
    { name: 'Kanniyakumari', lat: 8.0883, lng: 77.5385, open: 1, resolved: 34, critical: 0 },
    { name: 'Theni', lat: 10.0104, lng: 77.4768, open: 21, resolved: 67, critical: 4 },
    { name: 'Namakkal', lat: 11.2189, lng: 78.1674, open: 9, resolved: 56, critical: 1 },
    { name: 'Karur', lat: 10.9601, lng: 78.0766, open: 12, resolved: 67, critical: 2 },
  ];

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
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
            {activeMenu === 'tickets' && renderStateTickets()}
            {activeMenu === 'analytics' && renderAnalytics()}
            {activeMenu === 'crisis' && renderCrisisMode()}
            {activeMenu === 'escalations' && renderEscalations()}
            {activeMenu === 'report' && renderCabinetReport()}
          </motion.div>
        </AnimatePresence>

        {/* District Detail Slide-in Panel */}
        <AnimatePresence>
          {selectedDistrict && (
            <div className="fixed inset-0 z-[100] flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedDistrict(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
              
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8B1A1A] rounded-xl flex items-center justify-center text-white"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <h2 className="font-black text-xl text-slate-800 uppercase">{selectedDistrict.name}</h2>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">District Profile</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDistrict(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                      <span className="block text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Open Tickets</span>
                      <span className="block text-3xl font-black font-mono text-rose-700">{selectedDistrict.open}</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolved</span>
                      <span className="block text-3xl font-black font-mono text-emerald-700">{selectedDistrict.resolved}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2">
                      <PieChartIcon className="w-4 h-4" /> Category Breakdown
                    </h4>
                    {districtCategoryData.length > 0 ? (
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={districtCategoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                              {districtCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 font-bold text-xs uppercase">No active tickets available</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
