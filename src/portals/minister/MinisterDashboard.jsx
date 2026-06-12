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

export default function MinisterDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Retrieve logged in department and name
  const userDept = localStorage.getItem('jn_emp_dept') || 'Electricity';
  const userName = localStorage.getItem('jn_name') || 'Minister';

  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedDept] = useState(userDept); // Locked to user's department
  const [searchQuery, setSearchQuery] = useState('');
  const [deptTickets, setDeptTickets] = useState([]);
  
  // Custom States for local persistence
  const [directives, setDirectives] = useState(() => JSON.parse(localStorage.getItem('jn_minister_directives') || '[]'));
  const [flags, setFlags] = useState(() => JSON.parse(localStorage.getItem('jn_minister_flags') || '[]'));
  const [explanations, setExplanations] = useState(() => JSON.parse(localStorage.getItem('jn_explanation_requests') || '[]'));
  const [schemeWorks, setSchemeWorks] = useState(() => {
    const defaultWorks = userDept === 'Electricity' ? [
      { id: '1', title: 'Mylapore Section Transformer Upgrade', scheme: 'Solar Rooftop & Grid modern', budget: 'Rs. 45 Lakhs', targetDate: '2026-08-30', status: 'In Progress' },
      { id: '2', title: 'Smart Meter Installation Drive Chennai South', scheme: 'Smart Metering Initiative', budget: 'Rs. 1.2 Crores', targetDate: '2026-12-15', status: 'Approved' }
    ] : [
      { id: '1', title: 'Zone 4 Primary Health Center Renovation', scheme: 'Urban Primary Health Upgrades', budget: 'Rs. 30 Lakhs', targetDate: '2026-09-10', status: 'In Progress' },
      { id: '2', title: 'Kalaignar Varumun Kappom Preventive Health Camp', scheme: 'Varumun Kappom Thittam', budget: 'Rs. 15 Lakhs', targetDate: '2026-07-05', status: 'Completed' }
    ];
    const stored = localStorage.getItem('jn_scheme_works');
    return stored ? JSON.parse(stored) : defaultWorks;
  });

  const [crisisConfig, setCrisisConfig] = useState(() => {
    const stored = localStorage.getItem('jn_crisis_config');
    return stored ? JSON.parse(stored) : { active: false, targetDistrict: 'All', slaReduction: '50%', broadcastMessage: '' };
  });

  // Officer command tree selection
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [newDirectiveText, setNewDirectiveText] = useState('');
  const [newFlagText, setNewFlagText] = useState('');
  const [explanationSubject, setExplanationSubject] = useState('');

  // Propose scheme work form
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkScheme, setNewWorkScheme] = useState('');
  const [newWorkBudget, setNewWorkBudget] = useState('');
  const [newWorkDate, setNewWorkDate] = useState('');

  // Assembly brief generator state
  const [assemblyConstituency, setAssemblyConstituency] = useState('Mylapore');
  const [generatedBrief, setGeneratedBrief] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    navigate('/');
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          ...t,
          category: t.categoryName || t.departmentName || 'Unknown',
          district: t.jurisdiction?.name || t.district || 'Unknown',
          displayId: t.ticketNumber,
          id: t.id,
          description: t.description
        }));
        // Filter by the minister's locked department (case-insensitive and partial match)
        setDeptTickets(formatted.filter(t => {
          const tDept = (t.departmentName || '').toUpperCase();
          const tCat = (t.category || '').toUpperCase();
          const sDept = (selectedDept || '').toUpperCase();
          
          return tDept.includes(sDept) || sDept.includes(tDept) || 
                 tCat.includes(sDept) || sDept.includes(tCat) ||
                 (sDept.includes('HEALTH') && tCat.includes('SANITATION'));
        }));
      } catch (err) {
        console.error('Failed to fetch minister tickets:', err);
      }
    };
    fetchTickets();
  }, [selectedDept]);

  const handleAction = async (id, action) => {
    try {
      const newStatus = action === 'Resolve' ? 'Resolved' : 'In Progress';
      const notes = action === 'Resolve' 
        ? 'Minister Resolved: Action taken directly by Ministry.'
        : 'Minister Intervened: Grievance prioritized directly.';

      await api.patch(`/tickets/${id}`, { status: newStatus, notes });
      
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.departmentName || 'Unknown',
        district: t.jurisdiction?.name || t.district || 'Unknown',
        displayId: t.ticketNumber,
        id: t.id,
        description: t.description
      }));
      setDeptTickets(formatted.filter(t => {
        const tDept = (t.departmentName || '').toUpperCase();
        const tCat = (t.category || '').toUpperCase();
        const sDept = (selectedDept || '').toUpperCase();
        
        return tDept.includes(sDept) || sDept.includes(tDept) || 
               tCat.includes(sDept) || sDept.includes(tCat) ||
               (sDept.includes('HEALTH') && tCat.includes('SANITATION'));
      }));
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    api.get('/metadata/jurisdictions?level=DISTRICT')
      .then(res => setDistricts(res.data))
      .catch(err => console.error("Failed to fetch districts", err));
  }, []);

  const districtPerformanceData = districts.map(dist => {
    const dName = dist.name;
    const distTickets = deptTickets.filter(t => t.district === dName);
    const dOpen = distTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const dResolved = distTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const dTotal = distTickets.length;
    const rate = dTotal > 0 ? Math.round((dResolved / dTotal) * 100) : 100;

    return {
      name: dName,
      open: dOpen,
      resolved: dResolved,
      total: dTotal,
      rate: rate
    };
  }).sort((a, b) => a.rate - b.rate); // WORST-FIRST ORDER (worst resolution rates first)

  // Leaflet marker details
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
    const open = deptTickets.filter(t => t.district === name && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    return { name, ...coords, open };
  });

  // Total calculations
  const totalOpen = deptTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedCount = deptTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = deptTickets.length > 0 ? Math.round((resolvedCount / deptTickets.length) * 100) : 100;
  const breachDistrictsCount = districtPerformanceData.filter(d => d.open > 0 && d.rate < 60).length;
  
  // Setup Officer Command Tree hierarchy
  const officersList = selectedDept === 'Electricity' ? [
    { id: 'mohanraj', name: 'Er. R. Mohanraj', role: 'Area Engineer', jurisdiction: 'Chennai South Area', phone: '+919444054321', flags: 0, directives: 0 },
    { id: 'karthikeyan', name: 'Er. S. Karthikeyan', role: 'Assistant Area Engineer (AAE)', jurisdiction: 'Mylapore Section', phone: '+919444012345', flags: 0, directives: 0 },
    { id: 'worker_gopal', name: 'Gopal', role: 'Field Crew Lead', jurisdiction: 'Mylapore Section', phone: '+919876500001', flags: 0, directives: 0 },
  ] : [
    { id: 'anandhi', name: 'R. Anandhi, I.A.S.', role: 'Corporation Commissioner', jurisdiction: 'Greater Chennai Corporation', phone: '+919444099999', flags: 0, directives: 0 },
    { id: 'vijayakumar', name: 'T. Vijayakumar, I.A.S.', role: 'Department Commissioner', jurisdiction: 'Statewide', phone: '+919444088888', flags: 0, directives: 0 },
    { id: 'lakshmi', name: 'Dr. S. Lakshmi Narayanan', role: 'City Health Officer (CHI)', jurisdiction: 'Chennai', phone: '+919444077777', flags: 0, directives: 0 },
    { id: 'ramesh', name: 'D. Ramesh Babu', role: 'Health Inspector (HI)', jurisdiction: 'Zone 4', phone: '+919444066666', flags: 0, directives: 0 },
    { id: 'priya', name: 'K. Priyadharshini', role: 'Sanitary Inspector (SI)', jurisdiction: 'Division 14', phone: '+919444055555', flags: 0, directives: 0 },
    { id: 'saravanan', name: 'M. Saravanan', role: 'Division Sanitary Inspector (DSI)', jurisdiction: 'Ward 1: Kodungaiyur', phone: '+919444044444', flags: 0, directives: 0 }
  ];

  // Handler to post a directive
  const handlePostDirective = (officerId) => {
    if (!newDirectiveText.trim()) return;
    const newDir = {
      id: Date.now().toString(),
      officerId,
      officerName: officersList.find(o => o.id === officerId)?.name || 'Officer',
      text: newDirectiveText,
      date: new Date().toLocaleString()
    };
    const updated = [newDir, ...directives];
    setDirectives(updated);
    localStorage.setItem('jn_minister_directives', JSON.stringify(updated));
    setNewDirectiveText('');
    alert(`Directive posted successfully to ${newDir.officerName}`);
  };

  // Handler to flag officer
  const handleFlagOfficer = (officerId) => {
    if (!newFlagText.trim()) return;
    const newFlag = {
      id: Date.now().toString(),
      officerId,
      officerName: officersList.find(o => o.id === officerId)?.name || 'Officer',
      reason: newFlagText,
      date: new Date().toLocaleString()
    };
    const updated = [newFlag, ...flags];
    setFlags(updated);
    localStorage.setItem('jn_minister_flags', JSON.stringify(updated));
    setNewFlagText('');
    alert(`Officer ${newFlag.officerName} has been flagged in records.`);
  };

  // Handler to request explanation
  const handleRequestExplanation = (officerId) => {
    if (!explanationSubject.trim()) return;
    const newRequest = {
      id: Date.now().toString(),
      officerId,
      officerName: officersList.find(o => o.id === officerId)?.name || 'Officer',
      subject: explanationSubject,
      status: 'Pending Response',
      date: new Date().toLocaleString()
    };
    const updated = [newRequest, ...explanations];
    setExplanations(updated);
    localStorage.setItem('jn_explanation_requests', JSON.stringify(updated));
    setExplanationSubject('');
    alert(`Explanation request dispatched to ${newRequest.officerName}`);
  };

  // Propose Scheme Work
  const handleProposeWork = (e) => {
    e.preventDefault();
    if (!newWorkTitle.trim() || !newWorkScheme || !newWorkBudget || !newWorkDate) return;
    const newWork = {
      id: Date.now().toString(),
      title: newWorkTitle,
      scheme: newWorkScheme,
      budget: newWorkBudget,
      targetDate: newWorkDate,
      status: 'Proposed'
    };
    const updated = [newWork, ...schemeWorks];
    setSchemeWorks(updated);
    localStorage.setItem('jn_scheme_works', JSON.stringify(updated));
    setNewWorkTitle('');
    setNewWorkBudget('');
    setNewWorkDate('');
    setNewWorkScheme('');
    alert('New scheme work proposed successfully!');
  };

  // Toggle Crisis Mode
  const handleToggleCrisis = () => {
    const nextActive = !crisisConfig.active;
    const updated = { ...crisisConfig, active: nextActive };
    setCrisisConfig(updated);
    localStorage.setItem('jn_crisis_config', JSON.stringify(updated));
    localStorage.setItem('jn_crisis_mode', nextActive ? 'true' : 'false');
    alert(`Crisis mode ${nextActive ? 'ACTIVATED. standard SLA response limits set to 12 hours.' : 'DEACTIVATED.'}`);
  };

  const handleSaveCrisisBroadcaster = () => {
    localStorage.setItem('jn_crisis_config', JSON.stringify(crisisConfig));
    alert('Crisis broadcast message sent successfully.');
  };

  // Assembly constituency brief generator
  const handleGenerateBrief = () => {
    const isTa = i18n.language === 'ta';
    const totalBriefOpen = Math.round(totalOpen * 0.08) + 3;
    const totalBriefResolved = Math.round(resolvedCount * 0.07) + 12;

    const brief = {
      title: isTa ? `சட்டசபை தொகுதி அறிக்கை — ${assemblyConstituency}` : `Assembly Constituency Prep Brief — ${assemblyConstituency}`,
      constituencyName: assemblyConstituency,
      district: 'Chennai',
      openGrievances: totalBriefOpen,
      resolvedGrievances: totalBriefResolved,
      avgResponse: selectedDept === 'Electricity' ? '4.8 Hours' : '3.2 Hours',
      successStories: isTa ? [
        'Kutchery Road high-voltage snapped cables repaired and restored in less than 3 hours.',
        'Luz Church Road municipal lighting grid updated with automatic smart sensors.'
      ] : [
        'Kutchery Road high-voltage snapped cables repaired and restored in less than 3 hours.',
        'Luz Church Road municipal lighting grid updated with automatic smart sensors.'
      ],
      outstandingIssues: isTa ? [
        'Mylapore temple tank surrounding street lights require transformer line maintenance.',
        'Sanitation lines adjacent to Mylapore Club require structural sewage updates.'
      ] : [
        'Mylapore temple tank surrounding street lights require transformer line maintenance.',
        'Sanitation lines adjacent to Mylapore Club require structural sewage updates.'
      ],
      mlaFlags: isTa ? [
        'Grievance TN-2026-004321 flagged directly by MLA Thiru P. Venkataramanan.'
      ] : [
        'Grievance TN-2026-004321 flagged directly by MLA Thiru P. Venkataramanan.'
      ]
    };
    setGeneratedBrief(brief);
  };

  const generateReport = () => {
    alert("Department Report Generated successfully.");
  };

  const renderSidebar = () => {
    const isTa = i18n.language === 'ta';
    const menuItems = [
      { id: 'dashboard', label: isTa ? 'கட்டுப்பாட்டு அறை' : 'DASHBOARD', icon: <BarChart2 /> },
      { id: 'tickets', label: isTa ? 'துறை புகார்கள்' : 'DEPT TICKETS', icon: <FileText /> },
      { id: 'officer_command', label: isTa ? 'அதிகாரிகள் மரம்' : 'OFFICER COMMAND', icon: <Target /> },
      { id: 'aging_queue', label: isTa ? 'தாமதக் குவியல்' : 'AGING QUEUE', icon: <Clock /> },
      { id: 'schemes_works', label: isTa ? 'திட்டப் பணிகள்' : 'SCHEMES WORKS', icon: <List /> },
      { id: 'crisis', label: isTa ? 'அவசர நிலை' : 'CRISIS MODE', icon: <AlertTriangle /> },
      { id: 'assembly_prep', label: isTa ? 'சட்டசபை தயாரிப்பு' : 'ASSEMBLY PREP', icon: <Landmark /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-[#1E1E1E] text-slate-200 border-r border-slate-800 flex-col justify-between shrink-0 select-none h-full shadow-2xl">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF4C4C]" />
            <div>
              <h1 className="text-sm font-black text-[#FF4C4C] tracking-wider uppercase leading-none">JanaNayagam</h1>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">MINISTRY COMMAND</span>
            </div>
          </div>
          <nav className="p-4 space-y-1.5">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  activeMenu === item.id ? 'bg-[#FF4C4C]/15 text-[#FF4C4C] border-l-4 border-[#FF4C4C]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-4 h-4 shrink-0' })}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 p-1 bg-slate-900/50 rounded-xl border border-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-[#FF4C4C] text-white flex items-center justify-center font-black text-xs shadow-inner">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-slate-100 truncate">{userName}</span>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase">MINISTER OF {selectedDept.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'en' ? 'bg-[#FF4C4C] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>EN</button>
             <button onClick={() => i18n.changeLanguage('ta')} className={`flex-1 py-1 text-[10px] font-black rounded ${i18n.language === 'ta' ? 'bg-[#FF4C4C] text-white' : 'bg-slate-850 text-slate-500 hover:bg-slate-800'}`}>தமிழ்</button>
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
      {crisisConfig.active && (
        <div className="bg-red-650 text-white p-4 rounded-2xl border-l-4 border-red-800 flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-black uppercase tracking-wider">CRISIS MANAGEMENT PROTOCOL ACTIVE: STATEWIDE SLAs REDUCED</span>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard 
          label={`Statewide ${selectedDept} Open`}
          value={totalOpen.toLocaleString()}
          icon={<AlertTriangle className="text-[#FF4C4C] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label={`${selectedDept} Resolution Rate`}
          value={`${resolutionRate}%`}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
        <StatCard 
          label="Districts Needing Action"
          value={breachDistrictsCount}
          icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label="Directives Dispatched"
          value={directives.length}
          icon={<Megaphone className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
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
            <TrendingUp className="w-5 h-5 text-[#FF4C4C] rotate-180" />
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

        {/* Live Ticket Map View */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/85 lg:col-span-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#FF4C4C]" /> District Grievance Clustermap
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
                      <span className="text-red-650 block">Pending Issues: {d.open}</span>
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

  const renderDeptTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#FF4C4C]" /> {selectedDept} Tickets Registry
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search ID, District, Status..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF4C4C]"
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
              <th className="p-4">Direct Action</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700">
            {deptTickets.filter(t => 
              t.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              t.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.status?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(t => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-mono font-black">{t.displayId}</td>
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
                <td className="p-4 flex gap-2">
                  {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                    <>
                      <button 
                        onClick={() => handleAction(t.id, 'Intervene')} 
                        className="bg-slate-800 hover:bg-black text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Intervene
                      </button>
                      <button 
                        onClick={() => handleAction(t.id, 'Resolve')} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOfficerCommand = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
      {/* Officers List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
          Officer Command Hierarchy & Performance
        </h3>
        <div className="space-y-3.5">
          {officersList.map(officer => {
            const officerFlags = flags.filter(f => f.officerId === officer.id).length;
            const officerDirs = directives.filter(d => d.officerId === officer.id).length;
            return (
              <div 
                key={officer.id} 
                onClick={() => setSelectedOfficer(officer)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  selectedOfficer?.id === officer.id ? 'bg-[#FF4C4C]/10 border-[#FF4C4C]' : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-xs text-slate-800">{officer.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                      {officer.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#FF4C4C]" /> {officer.jurisdiction}
                  </div>
                </div>

                <div className="flex gap-2 text-[10px] font-black shrink-0">
                  <span className={`px-2 py-0.5 rounded ${officerFlags > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-200/80 text-slate-505'}`}>
                    Flags: {officerFlags}
                  </span>
                  <span className="bg-slate-200/80 text-slate-505 px-2 py-0.5 rounded">
                    Directives: {officerDirs}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 self-center" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Officer Detail & Command Panel */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        {selectedOfficer ? (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-slate-850">{selectedOfficer.name}</h4>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">{selectedOfficer.role}</p>
            </div>

            {/* Directive Form */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Issue Direct Ministerial Directive</label>
              <textarea
                rows={3}
                placeholder="Type specific action directives..."
                value={newDirectiveText}
                onChange={e => setNewDirectiveText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3 focus:border-[#FF4C4C] resize-none"
              ></textarea>
              <button 
                onClick={() => handlePostDirective(selectedOfficer.id)}
                className="w-full bg-red-650 hover:bg-red-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Directive
              </button>
            </div>

            {/* Flag Officer Form */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Flag Officer for Delay</label>
              <input
                type="text"
                placeholder="Reason for flagging in timeline..."
                value={newFlagText}
                onChange={e => setNewFlagText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3 focus:border-[#FF4C4C]"
              />
              <button 
                onClick={() => handleFlagOfficer(selectedOfficer.id)}
                className="w-full bg-[#FF4C4C] hover:bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Mark Officer Flagged
              </button>
            </div>

            {/* Request Explanation */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Request Official Explanation</label>
              <input
                type="text"
                placeholder="Delayed task description or ID..."
                value={explanationSubject}
                onChange={e => setExplanationSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3 focus:border-[#FF4C4C]"
              />
              <button 
                onClick={() => handleRequestExplanation(selectedOfficer.id)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Request Explanation
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h4 className="font-black text-slate-400 text-sm uppercase">No Officer Selected</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Select an officer from the hierarchy tree to dispatch directives or flags.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAgingQueue = () => (
    <div className="h-full">
      <AgingQueue tickets={deptTickets} jurisdiction={{ name: 'Tamil Nadu' }} role="Minister" />
    </div>
  );

  const renderSchemesWorks = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
      {/* Works List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
          Department Schemes Works Delivery Tracker
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Work Project</th>
                <th className="p-3">Associated Scheme</th>
                <th className="p-3">Allocated Budget</th>
                <th className="p-3">Target Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700">
              {schemeWorks.map((work, idx) => (
                <tr key={work.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-black">{work.title}</td>
                  <td className="p-3 text-slate-500">{work.scheme}</td>
                  <td className="p-3 font-mono text-emerald-700">{work.budget}</td>
                  <td className="p-3 text-slate-500">{work.targetDate}</td>
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
          <Plus className="w-4 h-4 text-emerald-600" /> Propose Scheme Work
        </h4>
        <form onSubmit={handleProposeWork} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Work Project Title</label>
            <input
              type="text" required placeholder="Project description or asset name..."
              value={newWorkTitle} onChange={e => setNewWorkTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-emerald-650"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Associated TN Scheme</label>
            <select
              required value={newWorkScheme} onChange={e => setNewWorkScheme(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5"
            >
              <option value="">Select Scheme</option>
              {selectedDept === 'Electricity' ? (
                <>
                  <option value="Solar Rooftop Scheme">Solar Rooftop Subsidy Scheme</option>
                  <option value="Smart Metering Drive">Smart Metering Drive</option>
                  <option value="Substation upgrade">Substation Upgrade Scheme</option>
                </>
              ) : (
                <>
                  <option value="Varumun Kappom">Varumun Kappom Thittam</option>
                  <option value="Swachh Bharat Cleanliness">Swachh Bharat Cleanliness Drive</option>
                  <option value="PHC Renovations">Primary Health Center Upgrades</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Allocated Budget</label>
            <input
              type="text" required placeholder="E.g. Rs. 35 Lakhs"
              value={newWorkBudget} onChange={e => setNewWorkBudget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-emerald-650"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Target Completion Date</label>
            <input
              type="date" required value={newWorkDate} onChange={e => setNewWorkDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-2.5 focus:border-emerald-650"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md"
          >
            Submit Work proposal
          </button>
        </form>
      </div>
    </div>
  );

  const renderCrisisMode = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" /> Systemic Crisis Control
          </h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
            Emergency override of SLA deadlines
          </span>
        </div>
        
        {/* Toggle */}
        <button 
          onClick={handleToggleCrisis}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md transition-all duration-300 ${
            crisisConfig.active ? 'bg-red-650 text-white' : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {crisisConfig.active ? 'Active: Turn Off' : 'Activate Crisis'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest pl-0.5 block">Target Emergency District</label>
            <select
              value={crisisConfig.targetDistrict}
              onChange={e => setCrisisConfig({ ...crisisConfig, targetDistrict: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 outline-none"
            >
              <option value="All">All Regions (Statewide)</option>
              {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-555 uppercase tracking-widest pl-0.5 block">SLA Response Limit Reduction</label>
            <select
              value={crisisConfig.slaReduction}
              onChange={e => setCrisisConfig({ ...crisisConfig, slaReduction: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 outline-none"
            >
              <option value="50%">Cut SLAs by 50%</option>
              <option value="75%">Cut SLAs by 75%</option>
              <option value="12h">Set Max 12-Hour SLA Limit</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-555 uppercase tracking-widest pl-0.5 block">Public Crisis Broadcast Announcement</label>
          <textarea
            rows={4}
            value={crisisConfig.broadcastMessage}
            onChange={e => setCrisisConfig({ ...crisisConfig, broadcastMessage: e.target.value })}
            placeholder="E.g., Electricity lines damaged in Chennai due to heavy monsoon gusts. Emergency repair crew dispatched. standard SLAs suspended and capped at 12 hours..."
            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3.5 focus:border-red-650 resize-none leading-relaxed"
          ></textarea>
        </div>

        <button 
          onClick={handleSaveCrisisBroadcaster}
          className="w-full bg-red-650 hover:bg-red-700 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
        >
          <Megaphone className="w-4 h-4" /> Dispatch Crisis Announcement
        </button>
      </div>
    </div>
  );

  const renderAssemblyPrep = () => {
    const isTa = i18n.language === 'ta';
    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Selector */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
            Constituency Selector
          </h4>
          <div className="space-y-4 text-xs font-bold">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 block">Constituency Name</label>
              <select
                value={assemblyConstituency}
                onChange={e => setAssemblyConstituency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              >
                <option value="Mylapore">Mylapore</option>
                <option value="Velachery">Velachery</option>
                <option value="Harbor">Harbor</option>
                <option value="Chepauk">Chepauk</option>
              </select>
            </div>
            <button 
              onClick={handleGenerateBrief}
              className="w-full bg-slate-850 hover:bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors"
            >
              Generate Constituency Brief
            </button>
          </div>
        </div>

        {/* Generated Brief */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
          {generatedBrief ? (
            <div className="space-y-6">
              <div className="border-b border-slate-150 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">{generatedBrief.title}</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    District: {generatedBrief.district} · Generated: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => alert('Downloading assembly brief document...')}
                  className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-655 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase"
                >
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Open Grievances</span>
                  <span className="text-xl font-black font-mono text-slate-800">{generatedBrief.openGrievances}</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Resolved</span>
                  <span className="text-xl font-black font-mono text-slate-800">{generatedBrief.resolvedGrievances}</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Avg Response</span>
                  <span className="text-xl font-black font-mono text-emerald-700">{generatedBrief.avgResponse}</span>
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-emerald-600 border-b pb-1 mb-2">Success Stories</h4>
                  <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                    {generatedBrief.successStories.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-red-600 border-b pb-1 mb-2">Criticisms & Pending Challenges</h4>
                  <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                    {generatedBrief.outstandingIssues.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                {generatedBrief.mlaFlags.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-[#FF4C4C] border-b pb-1 mb-2">Active MLA Flags</h4>
                    <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                      {generatedBrief.mlaFlags.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 flex-1 flex flex-col justify-center">
              <Landmark className="w-16 h-16 text-slate-350 mx-auto mb-3" />
              <h4 className="font-black text-slate-400 text-sm uppercase">Constituency Brief Ready</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Select a constituency and click generate to compile legislative briefings.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-[#1E1E1E] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0 border-b border-slate-800">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF4C4C]" /> MINISTER COMMAND DASHBOARD
            </h1>
            <span className="text-[9px] text-[#FF4C4C] font-extrabold uppercase tracking-widest bg-[#FF4C4C]/10 border border-[#FF4C4C]/20 px-2 py-0.5 rounded mt-1.5 inline-block">
              {selectedDept} STATEWIDE JURISDICTION
            </span>
          </div>
          {/* Swapped Out Switcher in place of a decorative/clock component */}
          <div className="text-right bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">GIS Clock Lock</span>
            <span className="font-mono text-xs font-black text-[#FF4C4C]">{new Date().toLocaleTimeString()}</span>
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
              {activeMenu === 'tickets' && renderDeptTickets()}
              {activeMenu === 'officer_command' && renderOfficerCommand()}
              {activeMenu === 'aging_queue' && renderAgingQueue()}
              {activeMenu === 'schemes_works' && renderSchemesWorks()}
              {activeMenu === 'crisis' && renderCrisisMode()}
              {activeMenu === 'assembly_prep' && renderAssemblyPrep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
