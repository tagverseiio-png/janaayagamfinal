import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, LogOut, CheckCircle, AlertTriangle, Clock, MapPin, Search, BarChart2, FileText, List, Users, TrendingUp, Activity, Target, Phone, ArrowUpRight, CheckCircle2, User, ChevronRight, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import TnMap from '../shared/components/TnMap';
import TicketCard from '../shared/components/TicketCard';
import TicketActionModals from '../shared/components/TicketActionModals';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function EmployeeDashboard() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const { department: routeDept, role: routeRole } = useParams();
  const [role, setRole] = useState('Official');
  const [department, setDepartment] = useState('');
  const [jurisdiction, setJurisdiction] = useState({});
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState(null);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [fieldWorkers, setFieldWorkers] = useState([]);

  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const fetchFieldWorkers = async () => {
    try {
      const res = await api.get('/metadata/employees?role=Field Worker');
      setFieldWorkers(res.data.map(w => ({
        ...w,
        status: w.status || 'Active',
        tasks: 0 // We could count these from tickets if needed
      })));
    } catch (err) {
      console.error('Failed to fetch field workers:', err);
    }
  };

  // 1. Fetch tickets and user details on mount
  const fetchTickets = () => {
    setLoading(true);
    api.get('/tickets')
      .then(res => {
        const mapped = res.data.map(t => ({
          ...t,
          category: t.categoryName || t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          ward: t.jurisdiction?.name || 'Unknown',
          id: t.ticketNumber,
          dbId: t.id,
          created_at: t.createdAt,
          sla_deadline: t.slaDeadline || new Date(new Date(t.createdAt).getTime() + 48*60*60*1000).toISOString(),
          citizen_name: t.citizen_name || t.citizen?.name || 'Anonymous'
        }));
        setTickets(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch tickets:', err);
        toast.error(tLabel('Failed to load tickets. Please check your connection.', 'புகார்களை ஏற்ற முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்க்கவும்.'));
      })
      .finally(() => setLoading(false));
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStatsData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('jn_role');
    if (storedRole !== 'employee') {
      navigate('/employee-login');
      return;
    }
    
    const empRole = routeRole || localStorage.getItem('jn_emp_role');
    setRole(empRole);
    setDepartment(routeDept || localStorage.getItem('jn_emp_dept') || '');
    
    try {
      setJurisdiction(JSON.parse(localStorage.getItem('jn_emp_jurisdiction') || '{}'));
    } catch (e) {
      setJurisdiction({});
    }

    fetchTickets();
    fetchStats();
    fetchFieldWorkers();
  }, [navigate, routeDept, routeRole]);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    toast.success(tLabel('Logged out successfully', 'வெற்றிகரமாக வெளியேறப்பட்டது'));
    navigate('/');
  };

  const handleAction = (id, action) => {
    setActiveTicketId(id);
    if (action === 'view') {
      setModalState('view');
      return;
    }
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
      const ticketToUpdate = tickets.find(t => t.id === id);
      const dbId = ticketToUpdate ? ticketToUpdate.dbId : id;
      
      let newStatus = ticketToUpdate ? ticketToUpdate.status : 'Open';
      if (actionType === 'assign') newStatus = 'In Progress';
      if (actionType === 'resolve') newStatus = 'Resolved';
      if (actionType === 'escalate') newStatus = 'Escalated';
      if (actionType === 'reassign') newStatus = 'Assigned';

      await api.patch(`/tickets/${dbId}`, { status: newStatus, ...payload });
      toast.success(tLabel(`Ticket action submitted successfully`, `புகார் நடவடிக்கை சமர்ப்பிக்கப்பட்டது`));
      setModalState(null);
      fetchTickets();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update ticket';
      toast.error(tLabel(errMsg, 'நடவடிக்கை சமர்ப்பிக்க முடியவில்லை'));
      console.error(err);
    }
  };

  const formatJurisdiction = () => {
    if (!jurisdiction) return 'Statewide';
    const parts = [];
    if (jurisdiction.district) parts.push(jurisdiction.district);
    if (jurisdiction.ward) parts.push(jurisdiction.ward);
    if (jurisdiction.constituency) parts.push(jurisdiction.constituency);
    return parts.length > 0 ? parts.join(' • ') : tLabel('Statewide', 'மாநிலம் முழுவதும்');
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'OPEN'].includes((t.status || '').toUpperCase())).length,
    resolved: tickets.filter(t => ['RESOLVED', 'CLOSED'].includes((t.status || '').toUpperCase())).length,
    escalated: tickets.filter(t => (t.status || '').toUpperCase() === 'ESCALATED').length,
    breached: tickets.filter(t => !['RESOLVED', 'CLOSED'].includes((t.status || '').toUpperCase()) && new Date() > new Date(t.sla_deadline)).length
  };

  // Filtered tickets in Inbox tab
  const inboxTickets = tickets.filter(t => 
    (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );


  // ==========================================
  // AAE DASHBOARD
  // ==========================================
  const renderAAEDashboard = () => {
    const unassigned = tickets.filter(t => ['SUBMITTED', 'OPEN'].includes((t.status || '').toUpperCase()));
    const activeTasks = tickets.filter(t => ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].includes((t.status || '').toUpperCase()));

    // Recurring Fault detector (More than 2 complaints in same category/street)
    const faultGroups = {};
    tickets.forEach(t => {
      const key = `${t.category} - ${t.ward}`;
      if (!faultGroups[key]) faultGroups[key] = [];
      faultGroups[key].push(t);
    });
    const recurringFaults = Object.entries(faultGroups)
      .filter(([_, list]) => list.length >= 2)
      .map(([key, list]) => ({ name: key, count: list.length }));

    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Unassigned Tickets', 'ஒதுக்கப்படாதவை')}</span>
            <div className="mt-2 text-3xl font-black">{unassigned.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Active Field Tasks', 'செயலில் உள்ளவை')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{activeTasks.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Escalated', 'மேல்முறையீடு')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Field Crew Status', 'பணிக்குழு')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">{fieldWorkers.filter(w => w.status === 'Active').length} / {fieldWorkers.length} Active</div>
          </div>
        </div>

        {/* Unassigned Inbox Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
            {tLabel('⚡ Unassigned Inbox (Immediate Action Needed)', '⚡ ஒதுக்கப்படாத புகார்கள் (உடனடி நடவடிக்கை தேவை)')}
          </h3>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 pr-2">
            {unassigned.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 py-6 text-center">{tLabel('All tickets assigned!', 'அனைத்து புகார்களும் ஒதுக்கப்பட்டுவிட்டன!')}</p>
            ) : (
              unassigned.map(t => (
                <div key={t.id} className="py-3 flex justify-between items-center gap-4 text-xs font-bold">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#8B1A1A] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">{t.id}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.category}</span>
                    </div>
                    <p className="text-slate-700 line-clamp-1">{t.description}</p>
                  </div>
                  <button
                    onClick={() => handleAction(t.id, 'assign')}
                    style={{ backgroundColor: '#8B1A1A' }}
                    className="text-white text-[10px] font-black px-3.5 py-2 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {tLabel('Assign Worker', 'பணியாளரை நியமி')}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Queue (Assigned to Me) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
            {tLabel('📋 My Action Queue (Assigned Tasks)', '📋 என் நடவடிக்கை வரிசை (ஒதுக்கப்பட்ட பணிகள்)')}
          </h3>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 pr-2">
            {activeTasks.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 py-6 text-center">{tLabel('No active tasks assigned to you.', 'உங்களுக்கு ஒதுக்கப்பட்ட பணிகள் எதுவுமில்லை.')}</p>
            ) : (
              activeTasks.map(t => (
                <div key={t.id} className="py-3 flex justify-between items-center gap-4 text-xs font-bold">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">{t.id}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.category}</span>
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded ${t.status === 'ESCALATED' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{t.status}</span>
                    </div>
                    <p className="text-slate-700 line-clamp-1">{t.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(t.id, 'Resolve')}
                      className="bg-emerald-600 text-white text-[10px] font-black px-3 py-2 rounded-lg cursor-pointer"
                    >
                      {tLabel('Resolve', 'தீர்வு செய்')}
                    </button>
                    <button
                      onClick={() => handleAction(t.id, 'escalate')}
                      className="bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg cursor-pointer"
                    >
                      {tLabel('Escalate', 'மேல்முறையீடு')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Roster & Tracker Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roster Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
              {tLabel('Roster of Field Workers', 'களப் பணியாளர்கள் விவரம்')}
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {fieldWorkers.map(w => (
                <div key={w.name} className="flex justify-between items-center p-3 border border-slate-100 rounded-2xl text-xs font-bold bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A] flex items-center justify-center font-black">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-slate-800">{w.name}</p>
                      <p className="text-[9px] text-slate-450 uppercase">{tLabel(`Tasks Active: ${w.tasks}`, `செயலில் உள்ள பணிகள்: ${w.tasks}`)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      w.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-550'
                    }`}>
                      {w.status}
                    </span>
                    <a
                      href={`tel:${w.phone}`}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Fault Widget */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
                {tLabel('🚨 Recurring Fault Detector', '🚨 மீண்டும் ஏற்படும் பழுது கண்டறிதல்')}
              </h3>
              <p className="text-xs text-slate-450 font-bold leading-normal">
                {tLabel('System flags areas with multiple complaints in the last 7 days as infrastructure failures.', 'கடந்த 7 நாட்களில் பல புகார்களைப் பெற்ற பகுதிகளை உள்கட்டமைப்பு தோல்விகளாகக் கணினி கொடி காட்டுகிறது.')}
              </p>

              <div className="space-y-3">
                {recurringFaults.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-8">{tLabel('No recurring faults detected.', 'மீண்டும் மீண்டும் ஏற்படும் பழுதுகள் எதுவும் இல்லை.')}</p>
                ) : (
                  recurringFaults.map(f => (
                    <div key={f.name} className="flex justify-between items-center p-3.5 bg-red-50 border border-red-100 text-xs font-black rounded-2xl text-red-800">
                      <span>⚠️ {f.name}</span>
                      <span className="bg-red-200/60 border border-red-300/40 rounded-full px-3 py-0.5 text-[10px]">{f.count} Petitions</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {recurringFaults.length > 0 && (
              <button 
                onClick={() => toast.success('Dispatched Maintenance Crew for detailed survey')} 
                className="w-full py-3 bg-[#8B1A1A] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md mt-4 transition-all hover:bg-red-900 cursor-pointer"
              >
                {tLabel('Dispatch Infrastructure Inspection', 'உள்கட்டமைப்பு ஆய்வைத் தொடங்கு')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // AE DASHBOARD
  // ==========================================
  const renderAEDashboard = () => {
    const escalated = tickets.filter(t => t.status === 'ESCALATED');

    // Karthikeyan AAE stats mock
    const openAAECnt = tickets.filter(t => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;
    const resolvedAAECnt = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Action Queue', 'என் நடவடிக்கை வரிசை')}</span>
            <div className="mt-2 text-3xl font-black">{escalated.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Sub-Jurisdictions', 'துணை வார்டுகள்')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{statsData?.subJurisdictionCount || 0} Wards</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('SLA compliance', 'காலக்கெடு இணக்கம்')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">{statsData?.resolutionRate || 92}%</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Department', 'துறை')}</span>
            <div className="mt-2 text-xl font-black text-slate-800 uppercase tracking-widest">{department || 'Electricity'}</div>
          </div>
        </div>

        {/* Action Queue & Performance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Queue */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
              {tLabel('⚠️ My Action Queue (Escalated to AE)', '⚠️ என் நடவடிக்கை வரிசை (மேல்முறையீடுகள்)')}
            </h3>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-80 pr-2">
              {escalated.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-10 text-center">{tLabel('No pending escalations.', 'நிலுவையில் உள்ள மேல்முறையீடுகள் எதுவுமில்லை.')}</p>
              ) : (
                escalated.map(t => (
                  <div key={t.id} className="py-3.5 space-y-2 text-xs font-bold">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#8B1A1A] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">{t.id}</span>
                          <span className="text-[9px] font-black text-slate-450 uppercase">{t.category}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 line-clamp-1">{t.description}</h5>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(t.id, 'Resolve')}
                        style={{ backgroundColor: '#8B1A1A' }}
                        className="flex-1 text-white text-[10px] font-black py-2 rounded-lg cursor-pointer"
                      >
                        {tLabel('Resolve', 'தீர்வு செய்')}
                      </button>
                      <button
                        onClick={() => handleAction(t.id, 'escalate')}
                        className="flex-1 bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg cursor-pointer"
                      >
                        {tLabel('Escalate to Minister', 'அமைச்சருக்கு அனுப்பு')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AAE Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
              {tLabel('Assistant Area Engineers Performance', 'உதவி மின் பொறியாளர்களின் செயல்பாடு')}
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5">Officer</th>
                    <th className="py-2.5 text-center">Open Tasks</th>
                    <th className="py-2.5 text-center">Resolved</th>
                    <th className="py-2.5 text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <p className="font-black text-slate-800">Er. S. Karthikeyan</p>
                      <p className="text-[9px] text-slate-400">Chennai South Area</p>
                    </td>
                    <td className="py-3 text-center">{openAAECnt}</td>
                    <td className="py-3 text-center text-emerald-600">{resolvedAAECnt}</td>
                    <td className="py-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-100">
                        94%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // DSI / SI / HI DASHBOARD
  // ==========================================
  const renderFieldInspectorDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Pending Tasks', 'நிலுவைப்பணிகள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.open}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Completed Operations', 'முடித்த பணிகள்')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{stats.resolved}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Escalations Received', 'பெற்ற மேல்முறையீடுகள்')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('SLA Compliance', 'காலக்கெடு இணக்கம்')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">{statsData?.resolutionRate || 89}%</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
            {tLabel('Operations Queue', 'பணி வரிசை')}
          </h3>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-96 pr-2">
            {tickets.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 py-12 text-center">{tLabel('No tasks in queue.', 'பணி வரிசையில் பணிகள் எதுவும் இல்லை.')}</p>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="py-4 flex justify-between items-center gap-4 text-xs font-bold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#8B1A1A] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">{t.id}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.category}</span>
                    </div>
                    <p className="text-slate-800 text-sm line-clamp-1">{t.description}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">📍 {t.ward}, {t.district}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(t.id, 'Resolve')}
                      style={{ backgroundColor: '#8B1A1A' }}
                      className="text-white text-[10px] font-black px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      {tLabel('Resolve', 'தீர்வு செய்')}
                    </button>
                    <button
                      onClick={() => handleAction(t.id, 'escalate')}
                      className="bg-slate-900 text-white text-[10px] font-black px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      {tLabel('Escalate', 'மேல்முறையீடு')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // CHI DASHBOARD (Interactive Zone -> Div -> Ward Drill Tree)
  // ==========================================
  const renderCHIDashboard = () => {
    // Construct zone/div/ward tree dynamically from tickets
    const tree = {};
    tickets.forEach(t => {
      const zoneName = t.jurisdiction?.parent?.name || "Statewide";
      const divName = t.jurisdiction?.parent?.parent?.name || "General Division";
      const wardName = t.ward || "General Ward";

      if (!tree[zoneName]) tree[zoneName] = {};
      if (!tree[zoneName][divName]) tree[zoneName][divName] = {};
      if (!tree[zoneName][divName][wardName]) tree[zoneName][divName][wardName] = [];
      tree[zoneName][divName][wardName].push(t);
    });

    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Total Division Petitions', 'மொத்தப் புகார்கள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Sanitation Index', 'சுகாதாரக் குறியீடு')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">84 / 100</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Escalations Pending', 'மேல்முறையீடுகள்')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Active Inspector Squads', 'செயலில் உள்ள குழுக்கள்')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">12 Teams</div>
          </div>
        </div>

        {/* Dynamic Drill Tree Widget */}
        <ChiDrillTree tree={tree} handleAction={handleAction} tLabel={tLabel} />
      </div>
    );
  };

  // ==========================================
  // COMMISSIONER & DEPT COMMISSIONER DASHBOARD
  // ==========================================
  const renderCommissionerDashboard = () => {
    // District / Zone leader board based on real stats
    const leaderboard = statsData?.districtPerformance || [];

    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Statewide Operations', 'மாநில செயல்பாடுகள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.total} Petitions</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('City Overall SLA', 'ஒட்டுமொத்த காலக்கெடு இணக்கம்')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">91.4%</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Intervention Alerts', 'தலையீடு அலாரங்கள்')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">8 Alerts</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Minister Directives', 'அமைச்சரின் உத்தரவுகள்')}</span>
            <div className="mt-2 text-3xl font-black text-indigo-600">14 Directives</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leader Board */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
              {tLabel('District / Zone Operational Performance', 'மாவட்ட / மண்டல செயல்பாட்டுத் திறன்')}
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5">Zone</th>
                    <th className="py-2.5 text-center">Open</th>
                    <th className="py-2.5 text-center">Resolved</th>
                    <th className="py-2.5 text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {leaderboard.map(z => (
                    <tr key={z.name} className="hover:bg-slate-50/50">
                      <td className="py-3 font-black text-slate-800">{z.name}</td>
                      <td className="py-3 text-center">{z.open}</td>
                      <td className="py-3 text-center text-emerald-600">{z.resolved}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          parseFloat(z.rate) > 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {z.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cabinet Report Generator */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4 flex flex-col justify-between select-none">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1">
                {tLabel('📊 Cabinet Performance Summary', '📊 அமைச்சரவை செயல்பாட்டுத் தொகுப்பு')}
              </h3>
              <p className="text-xs text-slate-450 font-bold leading-normal">
                {tLabel('Compile and download a comprehensive operational summary package for review by the Cabinet and the Chief Minister.', 'அமைச்சரவை மற்றும் முதலமைச்சரின் பரிசீலனைக்காக விரிவான செயல்பாட்டுத் தொகுப்பைத் தயார் செய்து பதிவிறக்கவும்.')}
              </p>
            </div>
            
            <button 
              onClick={() => toast.success(tLabel('PDF Report Downloaded Successfully!', 'PDF அறிக்கை வெற்றிகரமாக பதிவிறக்கப்பட்டது!'))}
              style={{ backgroundColor: '#8B1A1A' }}
              className="w-full py-4 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer mt-6"
            >
              <FileDown className="w-4 h-4 text-white/90" />
              <span>{tLabel('Export Cabinet Brief (PDF)', 'அமைச்சரவை குறிப்பை ஏற்றுமதி செய் (PDF)')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const normalizedRole = (role || '').toUpperCase().replace(/\s+/g, '_');
    if (['AAE', 'ASSISTANT_AREA_ENGINEER', 'WARD_AEO', 'ASST_AREA_ENGINEER', 'JE', 'JUNIOR_ENGINEER'].includes(normalizedRole)) return renderAAEDashboard();
    if (['AE', 'AREA_ENGINEER', 'AEE', 'ASSISTANT_EXECUTIVE_ENGINEER', 'EE', 'EXECUTIVE_ENGINEER', 'SE', 'SUPERINTENDING_ENGINEER', 'CE', 'CHIEF_ENGINEER'].includes(normalizedRole)) return renderAEDashboard();
    if (['DSI', 'SI', 'HI', 'DIVISION_SANITARY_INSPECTOR', 'SANITARY_INSPECTOR', 'HEALTH_INSPECTOR'].includes(normalizedRole)) return renderFieldInspectorDashboard();
    if (normalizedRole === 'CHI' || normalizedRole === 'CITY_HEALTH_OFFICER') return renderCHIDashboard();
    if (['DEPT_COMMISSIONER', 'COMMISSIONER'].includes(normalizedRole)) return renderCommissionerDashboard();
    
    // Fallback elected/admin view
    if (['MLA', 'WARD_MEMBER'].includes(normalizedRole)) return renderElectedDashboard();
    if (['DISTRICT_COLLECTOR', 'DRO', 'BDO', 'VAO', 'REVENUE_INSPECTOR', 'WARD_OFFICER'].includes(normalizedRole)) return renderAdminDashboard();
    return renderDepartmentDashboard();
  };

  // --- ELECTED OFFICIALS DASHBOARD ---
  const renderElectedDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-650" /> {tLabel('Constituency Pulse', 'தொகுதி துடிப்பு')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Total Petitions', 'மொத்த மனுக்கள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Voter Satisfaction', 'வாக்காளர் திருப்தி')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-500">78%</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Resolved Issues', 'தீர்க்கப்பட்டவை')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{stats.resolved}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Critical Alerts', 'முக்கிய எச்சரிக்கைகள்')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.escalated}</div>
          </div>
        </div>
      </div>
    );
  };

  // --- ADMINISTRATIVE DASHBOARD ---
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-650" /> {tLabel('Administrative Command', 'நிர்வாகக் கட்டளை')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{tLabel('Total Jurisdiction Issues', 'மொத்தப் புகார்கள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Departments in SLA Breach', 'காலக்கெடு மீறிய துறைகள்')}</span>
            <div className="mt-2 text-3xl font-black text-amber-500">4</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Escalated Tickets', 'மேல்முறையீடுகள்')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{statsData?.totalEscalated || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Avg Resolution Time', 'சராசரி தீர்வு காலம்')}</span>
            <div className="mt-2 text-3xl font-black text-slate-800">{statsData?.avgResolutionTime || 2.4} Days</div>
          </div>
        </div>
      </div>
    );
  };

  // --- DEPARTMENT OPERATIONS OVERVIEW ---
  const renderDepartmentDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#8B1A1A]" /> {department} Operations Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1A1A] to-red-900 text-white p-5 rounded-2xl shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-85">{tLabel('Total Tickets', 'மொத்தப் புகார்கள்')}</span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Active & Open', 'செயலில் உள்ளவை')}</span>
            <div className="mt-2 text-3xl font-black text-blue-600">{stats.open}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('SLA Breached', 'காலக்கெடு மீறியவை')}</span>
            <div className="mt-2 text-3xl font-black text-rose-500">{stats.breached}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tLabel('Resolution Rate', 'தீர்வு விகிதம்')}</span>
            <div className="mt-2 text-3xl font-black text-emerald-600">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</div>
          </div>
        </div>

        <div className="mt-8">
           {renderTickets()}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    const menuItems = [
      { id: 'dashboard', label: tLabel('DASHBOARD', 'டாஷ்போர்டு'), icon: <BarChart2 /> },
      { id: 'tickets', label: tLabel('TICKET INBOX', 'புகார் பெட்டி'), icon: <FileText /> },
      { id: 'map', label: tLabel('AREA MAP', 'பகுதி வரைபடம்'), icon: <MapPin /> },
      { id: 'reports', label: tLabel('REPORTS', 'அறிக்கைகள்'), icon: <List /> },
    ];

    return (
      <aside className="hidden md:flex w-[240px] bg-white border-r border-slate-200 flex-col justify-between shrink-0 select-none h-full z-10">
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
                className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
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
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs uppercase">
              {role.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 truncate max-w-[150px]">{localStorage.getItem('jn_emp_name') || 'Officer'}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{role}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => toggleLang('en')} className={`flex-1 py-1 text-[10px] font-black rounded cursor-pointer ${lang === 'en' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>EN</button>
             <button onClick={() => toggleLang('ta')} className={`flex-1 py-1 text-[10px] font-black rounded cursor-pointer ${lang === 'ta' ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'}`}>தமிழ்</button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-[10px] font-black text-rose-600 uppercase border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> <span>{tLabel('Logout', 'வெளியேறு')}</span>
          </button>
        </div>
      </aside>
    );
  };

  const renderTickets = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6" /> {tLabel('Assigned Tickets', 'ஒதுக்கப்பட்ட புகார்கள்')}
        </h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder={tLabel('Search Tickets...', 'புகார்களைத் தேடு...')} 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8B1A1A]"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {inboxTickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded-xl p-6">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <p>{tLabel('No tickets found matching your search.', 'உங்கள் தேடலுக்கு ஏற்ற புகார்கள் எதுவும் இல்லை.')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inboxTickets.map(t => (
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

  const renderMap = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[calc(100vh-100px)] flex flex-col relative z-0">
      <h2 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide flex items-center gap-2 mb-4 shrink-0">
        <MapPin className="w-6 h-6" /> {tLabel('Area Map View', 'பகுதி வரைபடம்')}
      </h2>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {inboxTickets.map(ticket => {
            if (!ticket.lat || !ticket.lng) return null;
            const pConf = {
              'P1': 'red',
              'P2': 'orange',
              'P3': 'gray'
            }[ticket.priority] || 'gray';
            
            return (
              <CircleMarker 
                key={ticket.id}
                center={[ticket.lat, ticket.lng]}
                radius={8}
                pathOptions={{ color: pConf, fillColor: pConf, fillOpacity: 0.7 }}
                eventHandlers={{
                  click: () => handleAction(ticket.id, 'view')
                }}
              >
                <Popup>
                  <div className="text-sm font-bold">{ticket.category}</div>
                  <div className="text-xs">{ticket.description}</div>
                  <div className="text-xs font-black mt-1" style={{color: pConf}}>{ticket.priority || 'P3'}</div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center mt-10 max-w-3xl mx-auto">
      <List className="w-16 h-16 text-[#8B1A1A] mx-auto mb-4" />
      <h2 className="text-2xl font-black text-[#8B1A1A] uppercase tracking-wide">{tLabel('Generate Report', 'அறிக்கை உருவாக்கு')}</h2>
      <p className="text-slate-500 font-bold mt-2 mb-6">{tLabel(`Generate official metrics report for ${formatJurisdiction()}.`, `மதிப்பீட்டு அறிக்கையை உருவாக்கு: ${formatJurisdiction()}.`)}</p>
      <button onClick={() => toast.success(tLabel("Report downloaded successfully!", "அறிக்கை வெற்றிகரமாக பதிவிறக்கப்பட்டது!"))} className="bg-[#8B1A1A] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow hover:bg-red-900 transition-all cursor-pointer">
        {tLabel('Download PDF Report', 'PDF அறிக்கை பதிவிறக்கு')}
      </button>
    </div>
  );

  const titlePrefix = department ? `${department} ${role}` : role;

  return (
    <div className="flex h-screen bg-[#F0EBE3] font-sans">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Top Header */}
        <div className="bg-[#8B1A1A] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider">{titlePrefix} {tLabel('DASHBOARD', 'டாஷ்போர்டு')}</h1>
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded mt-1 inline-block">
              {tLabel('JURISDICTION', 'அதிகார வரம்பு')}: {formatJurisdiction()}
            </span>
          </div>
        </div>

        {/* Dashboard Area */}
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
              {activeMenu === 'map' && renderMap()}
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

// Collapsible Accodion Tree Helper Component for CHI Dashboard
function ChiDrillTree({ tree, handleAction, tLabel }) {
  const [expandedZone, setExpandedZone] = useState(null);
  const [expandedDiv, setExpandedDiv] = useState(null);
  const [expandedWard, setExpandedWard] = useState(null);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-5 space-y-4 shadow-sm select-none">
      <h3 className="font-extrabold text-slate-800 tracking-wide uppercase text-sm">{tLabel('Zone ➔ Div ➔ Ward ➔ Ticket Tree', 'மண்டலம் ➔ பிரிவு ➔ வார்டு ➔ புகார் மரம்')}</h3>
      <div className="space-y-3">
        {Object.entries(tree).map(([zone, divs]) => (
          <div key={zone} className="border border-slate-250/60 rounded-2xl overflow-hidden bg-slate-50/20">
            <button
              onClick={() => {
                setExpandedZone(expandedZone === zone ? null : zone);
                setExpandedDiv(null);
                setExpandedWard(null);
              }}
              className="w-full bg-slate-50/50 border-b border-slate-100 px-4 py-3.5 flex justify-between items-center text-xs font-black text-slate-700 uppercase tracking-wider hover:bg-slate-100/30 transition-colors"
            >
              <span>📂 {zone}</span>
              <span className="bg-slate-200/60 rounded-full px-2.5 py-0.5 text-[10px]">
                {Object.values(divs).reduce((acc, wMap) => acc + Object.values(wMap).reduce((sum, list) => sum + list.length, 0), 0)} {tLabel('Tickets', 'புகார்கள்')}
              </span>
            </button>
            
            {expandedZone === zone && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-100 pl-6">
                {Object.entries(divs).map(([div, wards]) => (
                  <div key={div} className="border border-slate-150/60 rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        setExpandedDiv(expandedDiv === div ? null : div);
                        setExpandedWard(null);
                      }}
                      className="w-full bg-slate-50/30 px-3.5 py-2.5 flex justify-between items-center text-[11px] font-extrabold text-slate-600 uppercase hover:bg-slate-100/20 transition-colors"
                    >
                      <span>📁 {div}</span>
                      <span className="bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 text-[9px]">
                        {Object.values(wards).reduce((acc, list) => acc + list.length, 0)}
                      </span>
                    </button>
                    
                    {expandedDiv === div && (
                      <div className="p-2 bg-white space-y-1.5 pl-4 border-t border-slate-100">
                        {Object.entries(wards).map(([ward, wardTickets]) => (
                          <div key={ward} className="space-y-1.5">
                            <button
                              onClick={() => setExpandedWard(expandedWard === ward ? null : ward)}
                              className="w-full flex justify-between items-center text-[10px] font-bold text-[#8B1A1A] hover:bg-red-50/50 p-2 rounded-lg transition-colors"
                            >
                              <span>📍 {ward}</span>
                              <span className="bg-red-50 border border-red-100 px-2 py-0.5 rounded text-[8px] font-black">{wardTickets.length} Active</span>
                            </button>
                            
                            {expandedWard === ward && (
                              <div className="pl-4 space-y-2.5 pt-1.5 pb-2 border-l-2 border-slate-100 ml-1.5">
                                {wardTickets.map(t => (
                                  <div key={t.id} className="bg-slate-50 rounded-xl p-3 border border-slate-150/60 text-[11px] font-bold text-slate-700 flex justify-between items-center gap-3">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black text-white bg-[#8B1A1A] px-1.5 py-0.2 rounded">{t.id}</span>
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">{t.category}</span>
                                      </div>
                                      <p className="line-clamp-1 text-slate-800 leading-normal">{t.description}</p>
                                    </div>
                                    <button
                                      onClick={() => handleAction(t.id, 'view')}
                                      className="text-[10px] text-[#8B1A1A] font-black hover:underline cursor-pointer border border-[#8B1A1A]/20 bg-white hover:bg-[#8B1A1A]/5 rounded-lg px-2.5 py-1.5 shrink-0 transition-all"
                                    >
                                      {tLabel('Inspect', 'ஆய்வு செய்')}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
