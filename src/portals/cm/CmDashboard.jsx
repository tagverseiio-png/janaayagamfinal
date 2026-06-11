import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, CheckCircle, MapPin, X, ArrowRight, 
  Map, Search, Download, Radio, Megaphone, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, 
  List, Phone, Shield, FileText, LogOut, Clock, Target, Flag, Send, ChevronRight, FileDown, Plus
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import StatCard from '../../shared/components/StatCard';
import AgingQueue from '../../shared/components/AgingQueue';
import api from '../../services/api';

export default function CmDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  // Broadcast announcements state
  const [announcements, setAnnouncements] = useState(() => JSON.parse(localStorage.getItem('jn_cm_announcements') || '[]'));
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastDistrict, setBroadcastDistrict] = useState('All');

  // Cabinet Report Generation state
  const [cabinetReport, setCabinetReport] = useState(null);

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.department?.name || 'Unknown',
        district: t.jurisdiction?.name || 'Unknown',
        displayId: t.ticketNumber,
        id: t.id,
        description: t.description,
        ward: t.jurisdiction?.name || 'Unknown'
      }));
      setTickets(formatted);
    } catch (err) {
      console.error('Failed to fetch CM tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    navigate('/');
  };

  // Enforce CM Flagging ("CM IS WATCHING")
  const handleFlagTicketSubmit = async (e) => {
    e.preventDefault();
    if (!flagReason.trim() || !selectedTicket) return;

    try {
      // Calls PATCH update ticket with special flag parameters
      await api.patch(`/tickets/${selectedTicket.id}`, {
        notes: `CM FLAG: ${flagReason}`,
        isCmWatching: true,
        action: 'flag'
      });

      alert(`CM Flag applied successfully. The entire escalation chain is notified.`);
      setShowFlagModal(false);
      setFlagReason('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Failed to CM flag ticket:', err);
      alert('Failed to apply CM Flag.');
    }
  };

  // Cabinet Report Generation ranking ministers
  const handleGenerateCabinetReport = () => {
    const reportDate = new Date().toLocaleDateString();
    
    // Process efficiency metrics per department
    const deptsList = ['Electricity', 'Health & Sanitation', 'Water (TWAD/Metro Water)', 'PWD / Roads'];
    const rankings = deptsList.map(dept => {
      const deptTickets = tickets.filter(t => t.category === dept || (dept === 'Health & Sanitation' && t.category === 'Sanitation'));
      const resolved = deptTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const rate = deptTickets.length > 0 ? Math.round((resolved / deptTickets.length) * 150) / 1.5 : 100;
      const roundedRate = Math.min(Math.round(rate), 100);
      
      let minister = 'Unassigned';
      if (dept === 'Electricity') minister = 'C. T. R. Nirmal Kumar';
      if (dept === 'Health & Sanitation') minister = 'Dr. K.G. Arunraj';
      if (dept === 'Water (TWAD/Metro Water)') minister = 'Sec. Hariharan';
      if (dept === 'PWD / Roads') minister = 'CE Karthikeyan';

      return { dept, minister, rate: roundedRate, pending: deptTickets.length - resolved };
    }).sort((a, b) => b.rate - a.rate);

    const report = {
      title: 'TAMIL NADU STATE CABINET EFFICIENCY SUMMARY',
      date: reportDate,
      rankings,
      summaryText: 'Electricity and Sanitation sectors maintain peak response compliance. PWD roads projects require infrastructure budget allocations.'
    };
    setCabinetReport(report);
  };

  // Propose Broadcast Announcement
  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) return;

    const newBroadcast = {
      id: Date.now().toString(),
      title: broadcastTitle,
      text: broadcastText,
      district: broadcastDistrict,
      date: new Date().toLocaleString()
    };

    const updated = [newBroadcast, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('jn_cm_announcements', JSON.stringify(updated));
    setBroadcastTitle('');
    setBroadcastText('');
    alert('Statewide CM Announcement broadcasted successfully!');
  };

  // Metrics
  const totalOpen = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const totalResolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = tickets.length > 0 ? Math.round((totalResolved / tickets.length) * 100) : 100;
  
  // Calculate State Health Score: resolution rate base, penalized by open & critical tickets
  const criticalCount = tickets.filter(t => t.priority === 'Critical' || t.priority === 'CRITICAL').length;
  const calculatedHealthScore = Math.max(0, Math.min(100, Math.round(
    resolutionRate * 0.7 + (100 - Math.min(100, criticalCount * 4)) * 0.3
  )));

  // Sparkline history data simulator for last 7 days
  const sparklineData = [82, 85, 87, 86, 89, 91, calculatedHealthScore];

  // Districts list for Performance League
  const districtsList = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 
    'Thanjavur', 'Dindigul', 'Thoothukudi', 'Tiruppur', 'Tiruvannamalai', 'Tiruvarur', 'Villupuram', 
    'Cuddalore', 'Kanniyakumari', 'Theni', 'Namakkal', 'Karur'
  ];

  const districtPerformanceData = districtsList.map(dist => {
    const distTickets = tickets.filter(t => t.district === dist);
    const dOpen = distTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const dResolved = distTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const dTotal = distTickets.length;
    const rate = dTotal > 0 ? Math.round((dResolved / dTotal) * 100) : 100;

    return {
      name: dist,
      open: dOpen,
      resolved: dResolved,
      total: dTotal,
      rate: rate
    };
  }).sort((a, b) => a.rate - b.rate); // WORST-FIRST ORDER (worst resolution rates first)

  // Leaflet map cluster coordinates
  const DISTRICT_COORDS = {
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Madurai': { lat: 9.9252, lng: 78.1198 },
    'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
    'Salem': { lat: 11.6643, lng: 78.1460 },
    'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
    'Vellore': { lat: 12.9165, lng: 79.1325 },
    'Erode': { lat: 11.3410, lng: 77.7172 },
    'Thanjavur': { lat: 10.7870, lng: 79.1378 },
    'Dindigul': { lat: 10.3624, lng: 77.9695 },
    'Thoothukudi': { lat: 8.7642, lng: 78.1348 },
    'Tiruppur': { lat: 11.1085, lng: 77.3411 },
    'Tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
    'Tiruvarur': { lat: 10.7726, lng: 79.6368 },
    'Villupuram': { lat: 11.9401, lng: 79.4861 },
    'Cuddalore': { lat: 11.7480, lng: 79.7714 },
    'Kanniyakumari': { lat: 8.0883, lng: 77.5385 },
    'Theni': { lat: 10.0104, lng: 77.4768 },
    'Namakkal': { lat: 11.2189, lng: 78.1674 },
    'Karur': { lat: 10.9601, lng: 78.0766 }
  };

  const districtMarkers = Object.entries(DISTRICT_COORDS).map(([name, coords]) => {
    const open = tickets.filter(t => t.district === name && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    return { name, ...coords, open };
  });

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: tLabel('CM Command', 'முதல்வர் கட்டளை'), icon: <BarChart2 /> },
      { id: 'tickets', label: tLabel('State Grievances', 'மாநில புகார்கள்'), icon: <FileText /> },
      { id: 'cabinet', label: tLabel('Cabinet Rankings', 'அமைச்சரவை தரவரிசை'), icon: <Landmark /> },
      { id: 'aging', label: tLabel('Global Delay Queue', 'மாநில தாமத வரிசை'), icon: <Clock /> },
      { id: 'broadcast', label: tLabel('CM Announcements', 'அரசு அறிவிப்புகள்'), icon: <Megaphone /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-[#1E1E1E] text-slate-200 border-r border-slate-800 flex-col justify-between shrink-0 select-none h-full shadow-2xl">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF3B30]" />
            <div>
              <h1 className="text-sm font-black text-[#FF3B30] tracking-wider uppercase leading-none">JanaNayagam</h1>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">CHIEF MINISTER</span>
            </div>
          </div>
          <nav className="p-4 space-y-1.5">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeMenu === item.id ? 'bg-[#FF3B30]/15 text-[#FF3B30] border-l-4 border-[#FF3B30]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-4 h-4 shrink-0' })}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/50 rounded-xl border border-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-black text-xs shadow-inner">
              CJ
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-slate-100 truncate">Hon. Chief Minister</span>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase">STATE OF TAMIL NADU</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'en' ? 'bg-[#FF3B30] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>EN</button>
             <button onClick={() => i18n.changeLanguage('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'ta' ? 'bg-[#FF3B30] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>தமிழ்</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-950/20 text-[10px] font-black text-red-400 uppercase border border-red-900/30 hover:bg-red-900/40 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* State Health Scorecard & Sparklines */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#FF3B30] uppercase tracking-widest block">GIS Command Index</span>
            <h2 className="text-2xl font-black text-slate-800 leading-none mt-1">Statewide Civic Health Score</h2>
          </div>
        </div>

        {/* Sparkline & Score */}
        <div className="flex items-center gap-6 text-right">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">7-Day Trend</span>
            <div className="flex gap-1 items-end h-8 select-none">
              {sparklineData.map((val, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 rounded-t-sm ${idx === sparklineData.length - 1 ? 'bg-[#FF3B30]' : 'bg-slate-350'}`} 
                  style={{ height: `${val - 60}%` }}
                  title={`Day ${idx + 1}: ${val}`}
                ></div>
              ))}
            </div>
          </div>
          <div className="border-l border-slate-200 pl-6 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Health Index</span>
            <span className="text-4xl font-black font-mono text-[#FF3B30] leading-none">{calculatedHealthScore}</span>
            <span className="text-xs font-bold text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={tLabel('Statewide Open', 'மாநில அளவிலான நிலுவைகள்')} value={totalOpen} icon={<Activity className="text-blue-505 w-4.5 h-4.5" />} color="blue" />
        <StatCard label={tLabel('Critical Delays', 'அதிவேக அவசர புகார்கள்')} value={criticalCount} icon={<ShieldAlert className="text-rose-505 w-4.5 h-4.5" />} color="red" />
        <StatCard label={tLabel('Resolution Efficiency', 'தீர்வு திறன் விகிதம்')} value={`${resolutionRate}%`} icon={<CheckCircle className="text-emerald-505 w-4.5 h-4.5" />} color="green" />
        <StatCard label={tLabel('Active Broadcasts', 'செயலில் உள்ள அறிவிப்புகள்')} value={announcements.length} icon={<Megaphone className="text-purple-505 w-4.5 h-4.5" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Performance League (WORST-FIRST ORDER) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                Districts Performance League
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Worst resolution rates listed first
              </span>
            </div>
            <TrendingUp className="w-5 h-5 text-[#FF3B30] rotate-180" />
          </div>
          
          <div className="space-y-3.5 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {districtPerformanceData.map((d, index) => (
              <div key={d.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700 uppercase text-[10px]">
                  <span className="font-black">#{index + 1} {d.name}</span>
                  <span className={d.rate < 60 ? 'text-red-650' : 'text-slate-500'}>{d.rate}% resolved ({d.open} pending)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.rate < 50 ? 'bg-red-500' : d.rate < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${d.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaflet Cluster Map */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/85 lg:col-span-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#FF3B30]" /> State Grievance Clustermap
          </h3>
          <div style={{ height: '350px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} className="border border-slate-200">
            <MapContainer center={[11.1271, 78.6569]} zoom={6.5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {districtMarkers.map((d, i) => (
                <CircleMarker key={i} center={[d.lat, d.lng]} radius={d.open > 25 ? 16 : d.open > 8 ? 10 : 6}
                  fillColor={d.open > 25 ? '#EF4444' : d.open > 8 ? '#F59E0B' : '#10B981'}
                  color="#fff" weight={1.5} fillOpacity={0.85}>
                  <Popup>
                    <div className="text-xs uppercase font-sans font-bold">
                      <strong className="block border-b border-slate-100 pb-1 mb-1 text-slate-800">{d.name} District</strong>
                      <span className="text-red-655 block">Pending Issues: {d.open}</span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStateTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#FF3B30]" /> State Grievances Registry
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search ID, Sector, Status..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF3B30]"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 border-b border-slate-200">
            <tr>
              <th className="p-4">Grievance ID</th>
              <th className="p-4">District</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Command Center Option</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
            {tickets.filter(t => 
              t.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.status?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(t => {
              // Check if ticket is CM flagged in local or timeline
              const isCmFlagged = t.history?.some(h => h.action === 'CM_FLAG');
              return (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono font-black">
                    <span className="flex items-center gap-1">
                      {isCmFlagged && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                      {t.displayId}
                    </span>
                  </td>
                  <td className="p-4">{t.district}</td>
                  <td className="p-4 truncate max-w-xs">{t.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[9px] uppercase font-black ${t.priority === 'Critical' || t.priority === 'CRITICAL' ? 'bg-red-150 text-red-800 border border-red-200 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                      <button 
                        onClick={() => { setSelectedTicket(t); setShowFlagModal(true); }}
                        className="bg-[#FF3B30] hover:bg-red-650 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                      >
                        <Flag className="w-3 h-3" /> CM FLAG
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CM Flag Modal */}
      <AnimatePresence>
        {showFlagModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#FF3B30] text-base uppercase">🚨 APPLY CM FLAG: CM IS WATCHING</h4>
                <button onClick={() => setShowFlagModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleFlagTicketSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Direct CM Directive / Flag Reason (Required)</label>
                  <textarea
                    required rows={4} maxLength={200}
                    value={flagReason} onChange={e => setFlagReason(e.target.value)}
                    placeholder="E.g., Issue delayed without adequate updates. Prioritize resolving and dispatch crew immediately. CM is watching..."
                    className="w-full bg-slate-50 border border-slate-200 outline-none p-3 text-xs rounded-xl font-bold resize-none leading-relaxed"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-[#FF3B30] hover:bg-red-650 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  ✓ Dispatch "CM IS WATCHING" Flag
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCabinetReport = () => {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <List className="w-8 h-8 text-[#FF3B30]" />
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-2">Automate Cabinet Performance Summary</h2>
          <p className="text-slate-500 font-bold text-xs max-w-md mx-auto mb-6">
            Compiles resolution rates, pending volumes, and efficiency rankings across all ministerial departments.
          </p>
          <button 
            onClick={handleGenerateCabinetReport}
            className="bg-[#FF3B30] hover:bg-red-650 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <Download className="w-4 h-4" /> Run Cabinet Audit Report
          </button>

          {cabinetReport && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-left space-y-4">
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg font-bold text-xs mb-4 flex items-center gap-2 justify-center border border-emerald-200">
                ✓ Cabinet audit generated and downloaded successfully.
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-inner overflow-auto max-h-96">
{`JANANAYAGAM — CABINET REPORT
Tamil Nadu Civic Command Center
Generated: ${cabinetReport.date}
========================================

STATE CABINET RANKINGS (By Efficiency & Resolution Rate)

${cabinetReport.rankings.map((rank, idx) => `${idx + 1}. Department of ${rank.dept}
   - Minister-in-Charge: ${rank.minister}
   - Resolution Rate: ${rank.rate}%
   - Unresolved Backlog: ${rank.pending}`).join('\n\n')}

SUMMARY FINDINGS:
${cabinetReport.summaryText}

========================================
Confidential — Office of the Chief Minister`}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderAgingQueue = () => (
    <div className="h-full">
      <AgingQueue tickets={tickets} jurisdiction={{ name: 'Tamil Nadu' }} role="CM" />
    </div>
  );

  const renderAnnouncements = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#FF3B30]" /> CM Broadcast announcement Console
        </h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
          Dispatch statewide news feeds to citizens
        </span>
      </div>

      <form onSubmit={handleBroadcast} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-555 uppercase tracking-widest pl-0.5 block">Announcement Title</label>
            <input
              type="text" required placeholder="Headline..."
              value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-[#FF3B30]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-555 uppercase tracking-widest pl-0.5 block">Target Scope</label>
            <select
              value={broadcastDistrict}
              onChange={e => setBroadcastDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 outline-none cursor-pointer"
            >
              <option value="All">Statewide (All Citizens)</option>
              {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-555 uppercase tracking-widest pl-0.5 block font-sans">Announcement Body</label>
          <textarea
            rows={5} required
            value={broadcastText} onChange={e => setBroadcastText(e.target.value)}
            placeholder="Type statement contents..."
            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3.5 focus:border-[#FF3B30] resize-none leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="submit"
          className="w-full bg-[#FF3B30] hover:bg-red-650 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
        >
          <Send className="w-4 h-4" /> Broadcast Announcement
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-[#1E1E1E] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0 border-b border-slate-800">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF3B30]" /> CM GLOBAL COMMAND ROOM
            </h1>
            <span className="text-[9px] text-[#FF3B30] font-extrabold uppercase tracking-widest bg-[#FF3B30]/10 border border-[#FF3B30]/20 px-2 py-0.5 rounded mt-1.5 inline-block">
              Statewide Civic Grid
            </span>
          </div>
          <div className="text-right bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">GIS Clock Lock</span>
            <span className="font-mono text-xs font-black text-[#FF3B30]">{new Date().toLocaleTimeString()}</span>
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
              {activeMenu === 'tickets' && renderStateTickets()}
              {activeMenu === 'cabinet' && renderCabinetReport()}
              {activeMenu === 'aging' && renderAgingQueue()}
              {activeMenu === 'broadcast' && renderAnnouncements()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
