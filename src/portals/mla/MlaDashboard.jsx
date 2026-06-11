import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, CheckCircle, MapPin, X, ArrowRight, 
  Map, Search, Download, Radio, Megaphone, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, 
  List, Phone, Shield, FileText, LogOut, Flag, Clock, Plus
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import StatCard from '../../shared/components/StatCard';
import AgingQueue from '../../shared/components/AgingQueue';
import api from '../../services/api';

export default function MlaDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Retrieve logged in user and constituency details
  const userName = localStorage.getItem('jn_name') || 'Thiru P. Venkataramanan';
  const constituency = 'Mylapore';
  const district = 'Chennai';

  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mlaTickets, setMlaTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  // MLACDS Works
  const [mlacdsWorks, setMlacdsWorks] = useState(() => {
    const defaultWorks = [
      { id: '1', title: 'Construction of Rainwater Harvesting Pit near Luz', category: 'Water Sanitation', allotted: 850000, utilized: 800000, status: 'Completed', ward: 'Ward 171' },
      { id: '2', title: 'Renovation of Municipal Park at CIT Colony', category: 'Infrastructure', allotted: 1500000, utilized: 1200000, status: 'In Progress', ward: 'Ward 172' },
      { id: '3', title: 'Installation of high-mast LED lights in Kutchery Road', category: 'Electricity', allotted: 600000, utilized: 0, status: 'Proposed', ward: 'Ward 170' }
    ];
    const stored = localStorage.getItem('jn_mlacds_works');
    return stored ? JSON.parse(stored) : defaultWorks;
  });

  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkCategory, setNewWorkCategory] = useState('');
  const [newWorkAllotted, setNewWorkAllotted] = useState('');
  const [newWorkWard, setNewWorkWard] = useState('Ward 170');

  useEffect(() => {
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
          ward: t.jurisdiction?.name || 'Ward 171'
        }));
        
        // Filter tickets to Mylapore constituency (Ward 170, 171, 172, 173, Mylapore Section)
        const mylaporeWards = ['Ward 170', 'Ward 171', 'Ward 172', 'Ward 173', 'Mylapore Section'];
        const filtered = formatted.filter(t => 
          mylaporeWards.includes(t.ward) || 
          mylaporeWards.includes(t.district) || 
          t.jurisdiction?.name === 'Mylapore Section' || 
          t.jurisdiction?.parent?.name === 'Mylapore'
        );
        setMlaTickets(filtered);
      } catch (err) {
        console.error('Failed to fetch MLA tickets:', err);
      }
    };
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

  // Enforce Flagging only - writes a history timeline event
  const handleFlagTicketSubmit = async (e) => {
    e.preventDefault();
    if (!flagReason.trim() || !selectedTicket) return;

    try {
      // Calls PATCH update ticket with notes to trigger MLA_FLAG history action in backend
      await api.patch(`/tickets/${selectedTicket.id}`, {
        notes: `MLA FLAG: ${flagReason}`
      });

      alert(`Ticket ${selectedTicket.displayId} successfully flagged.`);
      setShowFlagModal(false);
      setFlagReason('');
      setSelectedTicket(null);

      // Refresh list
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.department?.name || 'Unknown',
        district: t.jurisdiction?.name || 'Unknown',
        displayId: t.ticketNumber,
        id: t.id,
        description: t.description,
        ward: t.jurisdiction?.name || 'Ward 171'
      }));
      const mylaporeWards = ['Ward 170', 'Ward 171', 'Ward 172', 'Ward 173', 'Mylapore Section'];
      setMlaTickets(formatted.filter(t => 
        mylaporeWards.includes(t.ward) || 
        mylaporeWards.includes(t.district) || 
        t.jurisdiction?.name === 'Mylapore Section' || 
        t.jurisdiction?.parent?.name === 'Mylapore'
      ));
    } catch (err) {
      console.error('Failed to flag ticket:', err);
      alert('Failed to flag ticket. MLAs are restricted to VIEW + FLAG only.');
    }
  };

  // Propose MLACDS Work
  const handleProposeWork = (e) => {
    e.preventDefault();
    if (!newWorkTitle.trim() || !newWorkCategory || !newWorkAllotted) return;
    
    const newWork = {
      id: Date.now().toString(),
      title: newWorkTitle,
      category: newWorkCategory,
      allotted: parseFloat(newWorkAllotted),
      utilized: 0,
      status: 'Proposed',
      ward: newWorkWard
    };

    const updated = [newWork, ...mlacdsWorks];
    setMlacdsWorks(updated);
    localStorage.setItem('jn_mlacds_works', JSON.stringify(updated));
    setNewWorkTitle('');
    setNewWorkAllotted('');
    setNewWorkCategory('');
    alert('MLACDS constituency work proposed successfully!');
  };

  // MLACDS Budget summaries
  const TOTAL_MLACDS_BUDGET = 30000000; // 3 Crores INR
  const allottedBudget = mlacdsWorks.reduce((sum, w) => sum + w.allotted, 0);
  const utilizedBudget = mlacdsWorks.reduce((sum, w) => sum + w.utilized, 0);
  const remainingBudget = TOTAL_MLACDS_BUDGET - allottedBudget;

  const totalOpen = mlaTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const totalResolved = mlaTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = mlaTickets.length > 0 ? Math.round((totalResolved / mlaTickets.length) * 100) : 100;

  // Ward comparison data inside Mylapore
  const wardComparisonData = ['Ward 170', 'Ward 171', 'Ward 172', 'Ward 173'].map(w => {
    const wardTickets = mlaTickets.filter(t => t.ward === w);
    const wOpen = wardTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const wResolved = wardTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const rate = wardTickets.length > 0 ? Math.round((wResolved / wardTickets.length) * 100) : 100;
    return { name: w, open: wOpen, resolved: wResolved, rate };
  });

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: tLabel('Overview', 'டாஷ்போர்டு'), icon: <BarChart2 /> },
      { id: 'tickets', label: tLabel('Constituency Grid', 'தொகுதி புகார்கள்'), icon: <FileText /> },
      { id: 'mlacds', label: tLabel('MLACDS Works', 'சட்டமன்ற நிதி பணிகள்'), icon: <Landmark /> },
      { id: 'aging', label: tLabel('Delay Queue', 'தாமத புகார்கள்'), icon: <Clock /> },
      { id: 'pulse', label: tLabel('Public Pulse', 'பொதுமக்கள் கருத்து'), icon: <Activity /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-[#1E1E1E] text-slate-200 border-r border-slate-800 flex-col justify-between shrink-0 select-none h-full shadow-2xl">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF6600]" />
            <div>
              <h1 className="text-sm font-black text-[#FF6600] tracking-wider uppercase leading-none">JanaNayagam</h1>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">MLA LEGISLATIVE</span>
            </div>
          </div>
          <nav className="p-4 space-y-1.5">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeMenu === item.id ? 'bg-[#FF6600]/15 text-[#FF6600] border-l-4 border-[#FF6600]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
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
            <div className="w-8 h-8 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-black text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-slate-100 truncate">{userName}</span>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase">MLA — {constituency}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'en' ? 'bg-[#FF6600] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>EN</button>
             <button onClick={() => i18n.changeLanguage('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'ta' ? 'bg-[#FF6600] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>தமிழ்</button>
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
      <div className="bg-white border-l-8 border-l-[#FF6600] border-t-4 border-t-[#138808] rounded-3xl p-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6600] block">{district} District • {constituency} Constituency</span>
            <h1 className="text-2xl font-black text-[#8B1A1A] mt-1 leading-none">MLA Command Dashboard</h1>
          </div>
        </div>
        <div className="text-right bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Legislative Clock</span>
          <span className="text-xs font-mono font-black text-[#FF6600]">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={tLabel('Constituency Open', 'தொகுதி நிலுவைகள்')} value={totalOpen} icon={<Activity className="text-blue-500 w-5 h-5" />} color="blue" />
        <StatCard label={tLabel('Resolution Rate', 'தீர்வு விகிதம்')} value={`${resolutionRate}%`} icon={<CheckCircle className="text-emerald-500 w-5 h-5" />} color="green" />
        <StatCard label={tLabel('allottedMLACDS', 'ஒதுக்கப்பட்ட தொகுதி நிதி')} value={`Rs. ${(allottedBudget/100000).toFixed(1)} L`} icon={<Landmark className="text-purple-500 w-5 h-5" />} color="indigo" />
        <StatCard label={tLabel('utilizedMLACDS', 'பயன்படுத்திய நிதி')} value={`Rs. ${(utilizedBudget/100000).toFixed(1)} L`} icon={<CheckCircle className="text-amber-500 w-5 h-5" />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
            Ward Performance Comparison
          </h3>
          <div className="space-y-4">
            {wardComparisonData.map(w => (
              <div key={w.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700 uppercase text-[10px]">
                  <span className="font-black">{w.name}</span>
                  <span>{w.rate}% resolved ({w.open} pending)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6600] rounded-full" style={{ width: `${w.rate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heat Map or Ward Map view */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/85 lg:col-span-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#FF6600]" /> Mylapore Ward Cluster Map
          </h3>
          <div style={{ height: '320px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} className="border border-slate-200">
            <MapContainer center={[13.0335, 80.2674]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {/* Simulated Ward Centroids */}
              <CircleMarker center={[13.035, 80.269]} radius={12} fillColor="#FF6600" color="#fff" weight={1.5} fillOpacity={0.8}>
                <Popup>Ward 170<br/>Open Issues: 3</Popup>
              </CircleMarker>
              <CircleMarker center={[13.032, 80.265]} radius={15} fillColor="#FF6600" color="#fff" weight={1.5} fillOpacity={0.8}>
                <Popup>Ward 171<br/>Open Issues: 5</Popup>
              </CircleMarker>
              <CircleMarker center={[13.029, 80.271]} radius={8} fillColor="#FF6600" color="#fff" weight={1.5} fillOpacity={0.8}>
                <Popup>Ward 172<br/>Open Issues: 1</Popup>
              </CircleMarker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTicketsRegistry = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#FF6600]" /> Mylapore Constituency Grievances
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search ID, Ward, Status..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF6600]"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 border-b border-slate-200">
            <tr>
              <th className="p-4">Grievance ID</th>
              <th className="p-4">Sector</th>
              <th className="p-4">Description</th>
              <th className="p-4">Ward Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action Options</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
            {mlaTickets.filter(t => 
              t.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              t.ward?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.status?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(t => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-mono font-black">{t.displayId}</td>
                <td className="p-4">{t.category}</td>
                <td className="p-4 truncate max-w-xs">{t.description}</td>
                <td className="p-4">{t.ward}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                    t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4">
                  {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                    <button 
                      onClick={() => { setSelectedTicket(t); setShowFlagModal(true); }}
                      className="bg-[#FF6600] hover:bg-[#E05500] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                    >
                      <Flag className="w-3 h-3 text-white" /> Flag Ticket
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flag Modal */}
      <AnimatePresence>
        {showFlagModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#FF6600] text-base uppercase">MLA Grievance Flagging</h4>
                <button onClick={() => setShowFlagModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleFlagTicketSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Legislative Flag reason notes (Required)</label>
                  <textarea
                    required rows={4} maxLength={200}
                    value={flagReason} onChange={e => setFlagReason(e.target.value)}
                    placeholder="Describe specific reasons for flagging this delay..."
                    className="w-full bg-slate-50 border border-slate-200 outline-none p-3 text-xs rounded-xl font-bold resize-none leading-relaxed"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-[#FF6600] hover:bg-[#E05500] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  🚩 Dispatch Legislative Flag
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderMlacdsWorks = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
      {/* Works Tracker */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
          MLACDS Constituency Works Tracker
        </h3>
        
        {/* Allotted vs Utilized Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Allocation</span>
            <span className="text-base font-black font-mono text-slate-800">Rs. 3.0 Crores</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Fund Allotted</span>
            <span className="text-base font-black font-mono text-blue-700">Rs. {(allottedBudget/100000).toFixed(1)} L</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Fund Remaining</span>
            <span className="text-base font-black font-mono text-emerald-700">Rs. {(remainingBudget/100000).toFixed(1)} L</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Work Project</th>
                <th className="p-3">Ward</th>
                <th className="p-3">Allotted Fund</th>
                <th className="p-3">Utilized Fund</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700">
              {mlacdsWorks.map((work, idx) => (
                <tr key={work.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-black">{work.title}</td>
                  <td className="p-3 text-slate-500">{work.ward}</td>
                  <td className="p-3 font-mono text-blue-700">Rs. {(work.allotted/100000).toFixed(1)} L</td>
                  <td className="p-3 font-mono text-emerald-700">Rs. {(work.utilized/100000).toFixed(1)} L</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      work.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      work.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-655'
                    }`}>
                      {work.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose Work Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#FF6600]" /> Propose MLACDS Work
        </h4>
        <form onSubmit={handleProposeWork} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Constituency Work Description</label>
            <input
              type="text" required placeholder="E.g., Laying of storm water drain..."
              value={newWorkTitle} onChange={e => setNewWorkTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-[#FF6600]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Category / Domain</label>
            <select
              required value={newWorkCategory} onChange={e => setNewWorkCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5"
            >
              <option value="">Select Category</option>
              <option value="Water Sanitation">Water Sanitation</option>
              <option value="Electricity">Electricity</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Health Sector">Health Sector</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Allotted Fund Budget (INR)</label>
            <input
              type="number" required placeholder="E.g. 500000 for 5 Lakhs"
              value={newWorkAllotted} onChange={e => setNewWorkAllotted(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-[#FF6600]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Target Ward Location</label>
            <select
              value={newWorkWard} onChange={e => setNewWorkWard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5"
            >
              <option value="Ward 170">Ward 170</option>
              <option value="Ward 171">Ward 171</option>
              <option value="Ward 172">Ward 172</option>
              <option value="Ward 173">Ward 173</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#FF6600] hover:bg-[#E05500] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md"
          >
            Propose Work project
          </button>
        </form>
      </div>
    </div>
  );

  const renderAgingQueue = () => (
    <div className="h-full">
      <AgingQueue tickets={mlaTickets} jurisdiction={{ name: 'Mylapore' }} role="MLA" />
    </div>
  );

  const renderPublicPulse = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
          Public Pulse & Complaint Trends
        </h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
          Weekly constituency metrics digest
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
          <h4 className="text-[10px] font-black uppercase text-[#FF6600] border-b pb-1 mb-2">Ward Complaint Volumes</h4>
          <div className="space-y-2 leading-relaxed">
            <p>• Ward 171: 42% of all complaints registered this week (mainly sanitation overflows).</p>
            <p>• Ward 170: 28% complaint volume (mostly streetlight repairs).</p>
            <p>• Ward 172: 18% complaint volume (smart metering questions).</p>
            <p>• Ward 173: 12% lowest volume registered.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
          <h4 className="text-[10px] font-black uppercase text-emerald-600 border-b pb-1 mb-2">Constituency Performance Highlights</h4>
          <div className="space-y-2 leading-relaxed">
            <p>• Average resolution time dropped by 12% compared to last fortnight.</p>
            <p>• Citizen satisfaction index up by 4.5% based on feedback forms.</p>
            <p>• Zero pending electricity complaints older than 7 days in Mylapore Section.</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
        <p>Grievance trends indicate an upcoming spike in water-logging complaints. Pre-emptive channel inspections recommended in ward 171.</p>
      </div>
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
              <Shield className="w-5 h-5 text-[#FF6600]" /> MLA COMMAND DASHBOARD
            </h1>
            <span className="text-[9px] text-[#FF6600] font-extrabold uppercase tracking-widest bg-[#FF6600]/10 border border-[#FF6600]/20 px-2 py-0.5 rounded mt-1.5 inline-block">
              {constituency} Constituency · {district}
            </span>
          </div>
          <div className="text-right bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">GIS Clock Lock</span>
            <span className="font-mono text-xs font-black text-[#FF6600]">{new Date().toLocaleTimeString()}</span>
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
              {activeMenu === 'tickets' && renderTicketsRegistry()}
              {activeMenu === 'mlacds' && renderMlacdsWorks()}
              {activeMenu === 'aging' && renderAgingQueue()}
              {activeMenu === 'pulse' && renderPublicPulse()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
