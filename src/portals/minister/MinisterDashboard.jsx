import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, CheckCircle, MapPin, X, ArrowRight, 
  Map, Search, Download, Radio, Megaphone, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, 
  List, Phone, Shield, FileText, LogOut, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import StatCard from '../../shared/components/StatCard';
import api from '../../services/api';


export default function MinisterDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedDept, setSelectedDept] = useState('Water');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    navigate('/');
  };

  const departments = ['Water', 'Electricity', 'Roads', 'Sanitation', 'Revenue', 'Health', 'Education', 'Welfare'];

  const [deptTickets, setDeptTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          ...t,
          category: t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          id: t.ticketNumber,
          description: t.description
        }));
        setDeptTickets(formatted.filter(t => t.category === selectedDept));
      } catch (err) {
        console.error('Failed to fetch minister tickets:', err);
      }
    };
    fetchTickets();
  }, [selectedDept]);
  
  const totalOpen = deptTickets.filter(t => t.status !== 'Resolved').length;
  const resolvedCount = deptTickets.filter(t => t.status === 'Resolved').length;
  const resolutionRate = deptTickets.length > 0 ? Math.round((resolvedCount / deptTickets.length) * 100) : 0;
  
  const breachDistrictsCount = new Set(
    deptTickets.filter(t => t.status !== 'Resolved' && new Date() > new Date(t.slaDeadline)).map(t => t.district)
  ).size;

  const avgResolutionTime = selectedDept === 'Water' ? '2.4 Days' : selectedDept === 'Health' ? '1.2 Days' : '3.5 Days';

  const tableTickets = deptTickets.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const districtsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
    'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
    'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  const districtPerformanceData = Array.from(districtsList).map(dist => {
    const distTickets = deptTickets.filter(t => t.district === dist);
    const dOpen = distTickets.filter(t => t.status === 'open').length;
    const dResolved = distTickets.filter(t => t.status === 'resolved').length;
    
    const dTotal = dOpen + dResolved || 1;
    const rate = Math.round((dResolved / dTotal) * 100);

    return {
      name: dist,
      open: dOpen,
      resolved: dResolved,
      rate: rate
    };
  }).sort((a, b) => b.rate - a.rate);

  const districtMarkers = [
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, open: 14 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, open: 39 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198, open: 27 },
    { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, open: 33 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460, open: 15 },
    { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, open: 6 },
    { name: 'Vellore', lat: 12.9165, lng: 79.1325, open: 49 },
    { name: 'Erode', lat: 11.3410, lng: 77.7172, open: 12 },
    { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, open: 2 },
    { name: 'Dindigul', lat: 10.3624, lng: 77.9695, open: 3 },
    { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, open: 11 },
    { name: 'Tiruppur', lat: 11.1085, lng: 77.3411, open: 9 },
    { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, open: 44 },
    { name: 'Tiruvarur', lat: 10.7726, lng: 79.6368, open: 52 },
    { name: 'Villupuram', lat: 11.9401, lng: 79.4861, open: 25 },
    { name: 'Cuddalore', lat: 11.7480, lng: 79.7714, open: 14 },
    { name: 'Kanniyakumari', lat: 8.0883, lng: 77.5385, open: 1 },
    { name: 'Theni', lat: 10.0104, lng: 77.4768, open: 21 },
    { name: 'Namakkal', lat: 11.2189, lng: 78.1674, open: 9 },
    { name: 'Karur', lat: 10.9601, lng: 78.0766, open: 12 },
  ];

  const generateReport = () => {
    alert("Department Report Generated successfully.");
  };

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: 'DASHBOARD', icon: <BarChart2 /> },
      { id: 'tickets', label: 'DEPT TICKETS', icon: <FileText /> },
      { id: 'analytics', label: 'ANALYTICS', icon: <TrendingUp /> },
      { id: 'crisis', label: 'CRISIS MODE', icon: <AlertTriangle /> },
      { id: 'escalate', label: 'ESCALATE TO CM', icon: <ShieldAlert /> },
      { id: 'report', label: 'REPORTS', icon: <List /> },
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
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs">KR</div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800">{localStorage.getItem('jn_emp_name') || 'Minister'}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">MINISTER</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'en' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>EN</button>
             <button onClick={() => i18n.changeLanguage('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'ta' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>தமிழ்</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-[10px] font-black text-rose-600 uppercase border border-rose-100 hover:bg-rose-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard 
          label={`Statewide ${selectedDept} Open`}
          value={totalOpen.toLocaleString()}
          icon={<AlertTriangle className="text-[#8B1A1A] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label={`${selectedDept} Resolution Rate`}
          value={`${resolutionRate}%`}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
        <StatCard 
          label="Districts in Breach"
          value={breachDistrictsCount}
          icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label="Avg Resolution Time"
          value={avgResolutionTime}
          icon={<Clock className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-black text-lg text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5" /> District Command View
          </h3>
          <div style={{ height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={[10.8505, 78.6677]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {districtMarkers.map((d, i) => (
                <CircleMarker key={i} center={[d.lat, d.lng]} radius={d.open > 50 ? 18 : d.open > 20 ? 12 : 8}
                  fillColor={d.open > 50 ? '#EF4444' : d.open > 20 ? '#F59E0B' : '#10B981'}
                  color="#fff" weight={2} fillOpacity={0.8}>
                  <Popup><strong>{d.name}</strong><br/>Open: {d.open}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[520px] overflow-hidden">
          <div className="p-5 border-b bg-slate-50 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">{selectedDept} Live Queue</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {deptTickets.slice(0, 10).map(ticket => (
              <div key={ticket.id} className={`p-3 rounded-xl border ${ticket.priority === 'Critical' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'} cursor-pointer hover:shadow-md`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono font-black text-xs">{ticket.id}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${ticket.priority === 'Critical' ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>{ticket.priority}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 line-clamp-2">{ticket.description}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100/50 text-[10px] font-bold text-slate-500 uppercase">
                  <span>{ticket.district}</span><span className="text-[#8B1A1A] font-black">{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeptTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6" /> {selectedDept} Tickets
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search ID, District, Status..." 
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
              <th className="p-4 border-b">District</th>
              <th className="p-4 border-b">Description</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Priority</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
            {tableTickets.map(t => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-mono font-black">{t.id}</td>
                <td className="p-4">{t.district}</td>
                <td className="p-4 truncate max-w-xs">{t.description}</td>
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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
      <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6" /> {selectedDept} Performance Ranking
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">Rank</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3 text-center">Open Tickets</th>
              <th className="px-4 py-3 text-center">Resolution Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
            {districtRanking.map((row, index) => (
              <tr key={row.name} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-black text-slate-500">#{index + 1}</td>
                <td className="px-4 py-4 font-black">{row.name}</td>
                <td className="px-4 py-4 text-center font-mono text-rose-600">{row.open}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                    row.rate > 80 ? 'bg-emerald-100 text-emerald-700' :
                    row.rate > 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {row.rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const crisisTickets = deptTickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved');
  const isCrisisActive = crisisTickets.length >= 3;
  const escalatedTickets = deptTickets.filter(t => t.status === 'Escalated' && t.priority === 'Critical');

  const renderCrisisMode = () => (
    <div className="space-y-6 max-w-4xl mx-auto mt-6">
      {isCrisisActive ? (
        <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg border-4 border-red-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-12 h-12 animate-pulse text-yellow-300 shrink-0" />
            <div>
              <h3 className="font-black text-2xl uppercase tracking-wider">{selectedDept} Systemic Alert</h3>
              <p className="font-bold opacity-90 mt-1">Critical issues detected in multiple districts. Immediate intervention required.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-3xl border border-emerald-200 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <div>
            <h3 className="font-black text-lg uppercase tracking-wider">No Active Crises</h3>
            <p className="font-bold text-sm">{selectedDept} metrics are within normal parameters.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 border-b pb-4 border-slate-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-700 uppercase tracking-wide">Critical {selectedDept} Issues</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Requires Immediate Attention</p>
          </div>
        </div>
        
        {crisisTickets.length > 0 ? (
          <div className="space-y-4">
            {crisisTickets.map(ticket => (
              <div key={ticket.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono font-black text-sm">{ticket.id}</span>
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Critical</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-2">{ticket.description}</p>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span><MapPin className="w-3 h-3 inline mr-1"/>{ticket.district}</span>
                  <span>{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 font-bold py-8">No critical issues active.</p>
        )}
      </div>
    </div>
  );

  const renderEscalate = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full mt-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-6">
        <ShieldAlert className="w-6 h-6" /> Escalation Inbox
      </h2>
      {escalatedTickets.length > 0 ? (
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
                <button className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-colors border border-slate-300 shadow-sm">Review</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShieldAlert className="w-16 h-16 text-[#8B1A1A] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-wide">All escalated issues have been reviewed.</h2>
        </div>
      )}
    </div>
  );

  const renderReport = () => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center mt-10 max-w-3xl mx-auto">
      <List className="w-16 h-16 text-[#8B1A1A] mx-auto mb-4" />
      <h2 className="text-2xl font-black text-[#8B1A1A] uppercase tracking-wide">Generate {selectedDept} Report</h2>
      <p className="text-slate-500 font-bold mt-2 mb-6">Generate official metrics report for {selectedDept} across all 38 districts.</p>
      <button onClick={generateReport} className="bg-[#8B1A1A] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow hover:bg-red-900 transition-colors">
        Download PDF Report
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-[#8B1A1A] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">MINISTER DASHBOARD</h1>
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded mt-1 inline-block">
              DEPARTMENT-WIDE — {selectedDept} across 38 Districts
            </span>
          </div>
          <div className="flex gap-2 z-10 overflow-x-auto hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                  selectedDept === dept ? 'bg-white text-[#8B1A1A] shadow-md' : 'bg-[#7a1717] text-red-100 hover:bg-[#681414]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu + selectedDept}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'tickets' && renderDeptTickets()}
              {activeMenu === 'analytics' && renderAnalytics()}
              {activeMenu === 'crisis' && renderCrisisMode()}
              {activeMenu === 'escalate' && renderEscalate()}
              {activeMenu === 'report' && renderReport()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
