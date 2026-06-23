import React, { useState, useEffect } from 'react';
import { 
  Zap, Bell, Bot, User, Clock as ClockIcon, TrendingUp, TrendingDown,
  AlertTriangle, Shield, CheckCircle, Activity, ChevronRight, X, ArrowRight, ActivitySquare,
  AlertOctagon, CornerUpRight, Server, Power, BarChart, LineChart as LineChartIcon, MapPin, 
  Settings, PhoneCall, ArrowUpRight, CheckCircle2, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

import api from '../../services/api';

const ROLE_ALIASES = {
  AAE: ['AAE', 'Assistant Area Engineer', 'Assistant AE', 'Ward (AEO)', 'Assistant Area Engineer (Electricity)', 'aae_electricity'],
  AE: ['AE', 'Area Engineer', 'Area Engineer (Electricity)', 'ae_chennai'],
  DSI: ['DSI', 'Division Sanitary Inspector', 'Division Sanitary Inspector (GCC)', 'Division Sanitary Inspector (Health)', 'dsi_admin'],
  SI: ['SI', 'Sanitary Inspector', 'Sanitary Inspector (Health)', 'si_admin'],
  HI: ['HI', 'Health Inspector', 'Health Inspector (Health)', 'hi_admin'],
  CHI: ['CHI', 'City Health Inspector', 'City Health Inspector (Health)', 'chi_admin'],
  CITY_HEALTH_INSPECTOR: ['CHI', 'City Health Inspector', 'City Health Inspector (Health)', 'chi_admin'],
  DEPT_COMMISSIONER: ['DEPT_COMMISSIONER', 'Department Commissioner', 'dept_comm_admin'],
  DEPARTMENT_COMMISSIONER: ['DEPT_COMMISSIONER', 'Department Commissioner', 'dept_comm_admin'],
  COMMISSIONER: ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner', 'comm_admin'],
  CORPORATION_COMMISSIONER: ['COMMISSIONER', 'Commissioner', 'Corporation Commissioner', 'comm_admin'],
  Minister: ['MINISTER', 'Minister', 'Cabinet Minister', 'Minister (Electricity & Energy Resources)', 'Minister (Health)', 'minister_electricity', 'minister_health']
};

const rolesMatch = (roleA, roleB) => {
  if (!roleA || !roleB) return false;
  const normA = roleA.toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');
  const normB = roleB.toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');
  if (normA === normB) return true;

  const candidatesA = ROLE_ALIASES[normA] || ROLE_ALIASES[roleA] || [roleA];
  const candidatesB = ROLE_ALIASES[normB] || ROLE_ALIASES[roleB] || [roleB];

  const normCandidatesA = candidatesA.map(r => r.toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, ''));
  const normCandidatesB = candidatesB.map(r => r.toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, ''));

  return normCandidatesA.some(r => normCandidatesB.includes(r));
};

export default function MinisterDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Live States
  const [stats, setStats] = useState({
    totalOpen: 0,
    totalResolved: 0,
    criticalPriority: 0,
    totalTickets: 0,
    totalEscalated: 0,
    resolutionRate: 100,
    healthScore: 100,
    avgResolutionTime: 2.4,
    districtPerformance: []
  });
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Direction directives popup modal
  const [directionModalOpen, setDirectionModalOpen] = useState(false);
  const [selectedTicketForDirection, setSelectedTicketForDirection] = useState(null);
  const [directionText, setDirectionText] = useState('');

  const deptName = localStorage.getItem('jn_emp_dept') || 'Electricity & Energy Resources';
  const deptId = localStorage.getItem('jn_emp_dept_id');
  const isHealth = deptName.toLowerCase().includes('health') || deptName.toLowerCase().includes('sanit');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch dashboard stats
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      // 2. Fetch all scoped tickets
      const ticketsRes = await api.get('/tickets');
      setTickets(ticketsRes.data);

      // 3. Fetch hierarchy steps
      const hierarchyRes = await api.get(`/metadata/hierarchy?department=${isHealth ? 'sanitation' : 'electricity'}`);
      setHierarchyData(hierarchyRes.data);

      // 4. Fetch department employees
      if (deptId) {
        const employeesRes = await api.get(`/metadata/employees?departmentId=${deptId}`);
        setEmployees(employeesRes.data);
      } else {
        const employeesRes = await api.get('/metadata/employees');
        setEmployees(employeesRes.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load live command center data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptId, deptName]);

  const getEscalationReason = (ticket) => {
    if (ticket.history && ticket.history.length > 0) {
      const escEvent = ticket.history.find(h => h.action?.includes('escalat') || h.action?.includes('flag'));
      if (escEvent) return escEvent.notes;
      const lastEvent = ticket.history[0];
      if (lastEvent) return lastEvent.notes;
    }
    return ticket.description || 'No detailed reason provided.';
  };

  // Format tickets to match layout requirements
  const formatTicket = (t) => {
    const createdTime = new Date(t.created_at || t.createdAt);
    const diffMs = new Date() - createdTime;
    const pendingHrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    
    return {
      ...t,
      id: t.ticketNumber || `TN-${t.id.slice(-6)}`,
      dbId: t.id,
      type: t.categoryName || t.title || 'General',
      district: t.district || 'Chennai',
      zone: t.ward || 'Mylapore',
      locality: t.title || 'Mylapore',
      pendingHrs,
      citizensAffected: (t.claimCount || 0) + 1,
      reason: getEscalationReason(t),
      status: t.status?.toLowerCase() || 'submitted',
      assignedTo: t.assignedTo
    };
  };

  const formattedTickets = tickets.map(formatTicket);

  // Active tickets
  const activeTickets = formattedTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');

  // Total households affected
  const totalHouseholdsAffected = activeTickets.reduce((acc, t) => acc + t.citizensAffected, 0);

  // Priority Escalations
  const escalations = formattedTickets.filter(t => t.status === 'escalated' || t.priority === 'CRITICAL');

  // AI Governance Insights
  const aiInsights = isHealth ? [
    { id: "ai-1", type: "critical", text: "Sanitation complaints in Chennai rose 42% in 14 days; 68% from waste accumulation failures in 3 DSI zones — preventive clearing recommended." },
    { id: "ai-2", type: "warning", text: "High risk of public dumping and water logging in GCC area due to upcoming monsoon season. Deploy additional sanitary crews." },
    { id: "ai-3", type: "success", text: "Resolution time in Mylapore Section improved by 15% after sanitary inspector redistribution." }
  ] : [
    { id: "ai-1", type: "critical", text: "Electricity complaints in Chennai North rose 42% in 14 days; 68% from transformer failures in 3 AAE zones — preventive maintenance recommended." },
    { id: "ai-2", type: "warning", text: "High risk of grid overload in Madurai South due to upcoming festival season. Deploy additional field crews to substations." },
    { id: "ai-3", type: "success", text: "Resolution time in Coimbatore improved by 15% after AE redistribution." }
  ];

  // Dynamic Hierarchy Stats
  const steps = hierarchyData?.steps || [];
  const reversedSteps = [...steps].reverse();

  const dynamicHierarchyStats = reversedSteps.map((step) => {
    const roleName = step.role;
    const activeOfficersCount = employees.filter(emp => rolesMatch(emp.role, roleName)).length;

    let received = 0;
    let solvedFirst = 0;
    let escalated = 0;

    formattedTickets.forEach(ticket => {
      const isCurrentlyAssigned = ticket.assignedTo && rolesMatch(ticket.assignedTo.role, roleName);
      let reachedLevel = isCurrentlyAssigned;
      let resolvedAtLevel = false;
      let escalatedFromLevel = false;

      if (ticket.history && Array.isArray(ticket.history)) {
        ticket.history.forEach(evt => {
          const actorRole = evt.employee?.role || '';
          if (rolesMatch(actorRole, roleName)) {
            reachedLevel = true;
            if (evt.action?.includes('status_changed_to_RESOLVED') || evt.action?.includes('status_changed_to_CLOSED')) {
              resolvedAtLevel = true;
            }
            if (evt.action?.includes('escalat') || evt.action === 'volunteer_escalation') {
              escalatedFromLevel = true;
            }
          }
        });
      }

      if (reachedLevel) received++;
      if (resolvedAtLevel) solvedFirst++;
      if (escalatedFromLevel) escalated++;
    });

    return {
      id: roleName.toLowerCase().replace(/\s+/g, '_'),
      levelName: roleName,
      received,
      solvedFirst,
      escalated,
      avgResponseHrs: step.slaDays * 12,
      officersActive: activeOfficersCount
    };
  });

  const citizenPortalLevel = {
    id: 'citizen',
    levelName: 'Citizen Portal',
    received: tickets.length,
    solvedFirst: 0,
    escalated: tickets.length,
    avgResponseHrs: 0,
    officersActive: 0
  };

  const hierarchyStats = [...dynamicHierarchyStats, citizenPortalLevel];

  // Officers list for performance display
  const officersAtSelectedLevel = selectedLevel 
    ? employees
        .filter(emp => rolesMatch(emp.role, selectedLevel.levelName))
        .map(emp => {
          const assigned = formattedTickets.filter(t => t.assignedToId === emp.id);
          const pending = assigned.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
          
          let resolvedCount = 0;
          tickets.forEach(t => {
            if (t.history && Array.isArray(t.history)) {
              const solved = t.history.some(h => h.employeeId === emp.id && (h.action?.includes('RESOLVED') || h.action?.includes('CLOSED')));
              if (solved) resolvedCount++;
            }
          });

          return {
            id: emp.id,
            name: emp.name,
            role: emp.role,
            location: emp.jurisdiction?.name || 'Mylapore Section',
            casesHandled: resolvedCount || assigned.length,
            pendingLoad: pending,
            rating: 4.8
          };
        })
    : [];

  // Actions
  const handleMarkUrgent = async (ticketId) => {
    try {
      await api.patch(`/tickets/${ticketId}`, {
        priority: 'CRITICAL',
        notes: 'Priority upgraded to CRITICAL by Minister directive.'
      });
      toast.success('Grievance marked as CRITICAL priority.');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update priority.');
    }
  };

  const handleOpenDirection = (ticket) => {
    setSelectedTicketForDirection(ticket);
    setDirectionText('');
    setDirectionModalOpen(true);
  };

  const handleSendDirectionSubmit = async () => {
    if (!directionText.trim()) {
      toast.error('Please enter instructions.');
      return;
    }
    try {
      await api.patch(`/tickets/${selectedTicketForDirection.dbId}`, {
        notes: `MINISTERIAL DIRECTION: ${directionText}`
      });
      toast.success('Ministerial directive dispatched and recorded.');
      setDirectionModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit direction.');
    }
  };

  // Districts data
  const districts = stats.districtPerformance || [];

  // Trends data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const liveTrends = months.map(m => {
    const count = tickets.filter(t => {
      const date = new Date(t.created_at || t.createdAt);
      return months[date.getMonth()] === m;
    }).length;
    return { month: m, grievances: count };
  });

  const trends = liveTrends.some(t => t.grievances > 0)
    ? liveTrends
    : [
        { month: 'Jan', grievances: 820 },
        { month: 'Feb', grievances: 950 },
        { month: 'Mar', grievances: 1100 },
        { month: 'Apr', grievances: 980 },
        { month: 'May', grievances: 1250 },
        { month: 'Jun', grievances: 1420 },
        { month: 'Jul', grievances: tickets.length || 1350 }
      ];

  // Map markers
  const liveMapMarkers = formattedTickets
    .filter(t => t.lat && t.lng && t.status !== 'resolved' && t.status !== 'closed')
    .map(t => ({
      id: t.dbId,
      lat: t.lat,
      lng: t.lng,
      title: t.title,
      district: t.district,
      zone: t.zone,
      severity: t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'high' : 'medium'
    }));

  const mapMarkers = liveMapMarkers.length > 0
    ? liveMapMarkers
    : [
        { id: 'm1', lat: 13.0418, lng: 80.2507, title: 'Transformer Sparking / Ground Fault', district: 'Chennai', zone: 'Mylapore', severity: 'high' },
        { id: 'm2', lat: 13.0294, lng: 80.2676, title: 'Low Voltage Supply Fluctuations', district: 'Chennai', zone: 'Royapuram', severity: 'medium' }
      ];

  const renderScoreDot = (status) => {
    const colors = {
      green: 'bg-emerald-500',
      yellow: 'bg-amber-500',
      red: 'bg-rose-500'
    };
    return <div className={`w-3 h-3 rounded-full ${colors[status] || colors.green}`} />;
  };

  const getStatusBadge = (status) => {
    if (status === 'critical' || status === 'escalated') return <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest animate-pulse">Critical</span>;
    if (status === 'active' || status === 'assigned' || status === 'in_progress') return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Active</span>;
    return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Resolved</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-500 text-xs font-bold uppercase tracking-widest">
        Loading Command Center...
      </div>
    );
  }

  const scoreStatus = stats.healthScore >= 80 ? 'green' : stats.healthScore >= 60 ? 'yellow' : 'red';

  return (
    <div className="min-h-screen bg-[#F0EBE3] text-slate-800 font-sans overflow-x-hidden relative pb-20">

      <main className="max-w-[1600px] mx-auto px-6 py-8 relative z-10 space-y-10">

        {/* SECTION 1 — Hero KPI Cards */}
        <section>
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
            {isHealth ? 'State Health & Sanitation Command' : 'State Electricity Command'}
          </p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-6">
            <Zap className="w-8 h-8 text-[#8B1A1A]" fill="currentColor" />
            {isHealth ? 'Health & Sanitation' : 'Electricity'} Minister Dashboard
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* KPI 1 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Grievances</span>
                <Shield className="w-4 h-4 text-[#8B1A1A]" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.totalTickets.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>SLA Stabilized</span>
                </div>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolution</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.resolutionRate}%</div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  {stats.totalResolved.toLocaleString()} resolved
                </div>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white border border-rose-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isHealth ? 'Active Issues' : 'Active Outages'}
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-rose-600 mb-1">{stats.totalOpen}</div>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  {totalHouseholdsAffected.toLocaleString()} affected citizens
                </div>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Escalations</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-amber-600 mb-1">{stats.totalEscalated}</div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  Dir & Min Level
                </div>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isHealth ? 'Avg Resolution' : 'Restoration'}
                </span>
                <ClockIcon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 mb-1">
                  {isHealth ? (
                    <>{stats.avgResolutionTime}<span className="text-lg text-slate-400 ml-1">days</span></>
                  ) : (
                    <>{Math.round(stats.avgResolutionTime * 24)}<span className="text-lg text-slate-400 ml-1">hrs</span></>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>SLA Compliant</span>
                </div>
              </div>
            </div>

            {/* KPI 6 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Health Score</span>
                {renderScoreDot(scoreStatus)}
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.healthScore}<span className="text-lg text-slate-400 ml-1">/100</span></div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  Department wide
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Hierarchical Escalation Command Flow */}
        <section className="space-y-4">
          <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-[#8B1A1A]" />
            Escalation Command Flow
          </h2>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative">
            <div className="flex items-center justify-between gap-4">
              {hierarchyStats.slice().reverse().map((level, idx) => (
                <React.Fragment key={level.id}>
                  <div
                    onClick={() => setSelectedLevel(level)}
                    className={`flex-1 rounded-xl border p-4 cursor-pointer transition-all duration-300 ${selectedLevel?.id === level.id ? 'bg-[#8B1A1A]/5 border-[#8B1A1A]/40 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider truncate max-w-[130px]" title={level.levelName}>{level.levelName}</div>
                      <div className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                        {level.officersActive} Active
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Received</div>
                        <div className="text-sm font-bold text-slate-700">{level.received.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Solved</div>
                        <div className="text-sm font-bold text-emerald-600">{level.solvedFirst.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Escalated</div>
                        <div className="text-sm font-bold text-rose-600">{level.escalated.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">SLA limit</div>
                        <div className="text-sm font-bold text-slate-700">{level.avgResponseHrs > 0 ? `${level.avgResponseHrs}h` : '-'}</div>
                      </div>
                    </div>
                  </div>

                  {idx < hierarchyStats.length - 1 && (
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence>
              {selectedLevel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#8B1A1A]">
                        {selectedLevel.levelName} — Officer Performance
                      </h3>
                      <button onClick={() => setSelectedLevel(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <th className="pb-2 font-semibold">Officer Name</th>
                            <th className="pb-2 font-semibold">Location</th>
                            <th className="pb-2 font-semibold text-right">Cases Handled</th>
                            <th className="pb-2 font-semibold text-right">Pending Load</th>
                            <th className="pb-2 font-semibold text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                          {officersAtSelectedLevel.map(officer => (
                            <tr key={officer.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                              <td className="py-3 font-medium flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center text-[10px] font-black text-[#8B1A1A]">
                                  {officer.name.charAt(0)}
                                </div>
                                {officer.name}
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 bg-slate-100 px-1.5 py-0.5 rounded">{officer.role}</span>
                              </td>
                              <td className="py-3 text-xs text-slate-600">{officer.location}</td>
                              <td className="py-3 text-right font-mono text-xs font-bold">{officer.casesHandled}</td>
                              <td className="py-3 text-right font-mono text-xs font-bold text-rose-600">{officer.pendingLoad}</td>
                              <td className="py-3 text-right">
                                <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <span className="text-amber-500 text-[10px]">★</span>
                                  <span className="text-xs font-mono font-bold text-amber-700">{officer.rating.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {officersAtSelectedLevel.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-xs text-slate-400 uppercase tracking-widest">
                                No officers found for this level in the department
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          {/* SECTION 3 — Minister Priority Escalation Desk */}
          <section className="col-span-2 space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Priority Escalation Desk
            </h2>
            <div className="space-y-4">
              {escalations.map((esc) => {
                return (
                  <div key={esc.dbId} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex gap-5 hover:shadow-md transition-shadow border-l-4 border-l-rose-400">
                    <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                      {getStatusBadge(esc.status)}
                      <div className="text-xs font-mono font-bold text-slate-400 mt-2">{esc.id}</div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-black text-slate-900 capitalize">{esc.type} Issue — {esc.district}</h3>
                          <p className="text-xs text-slate-500">{esc.zone} Zone, {esc.locality}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-rose-600">{esc.pendingHrs} hrs pending</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {esc.citizensAffected.toLocaleString()} Citizens Affected
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 text-slate-600">
                        <span className="font-bold text-slate-500">Escalation Reason:</span> {esc.reason}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Current Officer:</span>
                          <span className="font-black text-[#8B1A1A]">{esc.assignedTo?.name || 'Unassigned'}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{esc.assignedTo?.role || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDirection(esc)}
                            className="text-[10px] font-black uppercase tracking-widest bg-[#8B1A1A]/10 text-[#8B1A1A] hover:bg-[#8B1A1A]/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1 border border-[#8B1A1A]/20"
                          >
                            <CornerUpRight className="w-3 h-3" /> Direction
                          </button>
                          {esc.priority !== 'CRITICAL' && (
                            <button
                              onClick={() => handleMarkUrgent(esc.dbId)}
                              className="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1 border border-rose-200"
                            >
                              <Activity className="w-3 h-3" /> Mark Urgent
                            </button>
                          )}
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest border border-slate-150 px-2.5 py-1.5 rounded bg-slate-50 font-bold select-none">
                            Channel: {esc.channel || 'WEB'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {escalations.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 uppercase tracking-widest text-xs font-bold">
                  No priority escalated issues in scope
                </div>
              )}
            </div>
          </section>

          {/* SECTION 7 — AI Governance Assistant */}
          <section className="col-span-1 space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#8B1A1A]" />
              AI Governance Insights
            </h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
              <div className="space-y-4">
                {aiInsights.map(insight => (
                  <div key={insight.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                    {insight.type === 'critical' ? <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> :
                     insight.type === 'warning' ? <Activity className="w-5 h-5 text-amber-500 shrink-0" /> :
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                    <p className="text-xs text-slate-600 leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button className="text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-between">
                  Daily Briefing <ArrowUpRight className="w-3 h-3" />
                </button>
                <button className="text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-between">
                  High-Risk Infra <ArrowUpRight className="w-3 h-3" />
                </button>
                <button className="text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-between">
                  Predicted Outages <ArrowUpRight className="w-3 h-3" />
                </button>
                <button className="text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-between">
                  Inefficient Zones <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* SECTION 4 — District Performance */}
          <section className="space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-[#8B1A1A]" />
              District & City Performance
            </h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">District</th>
                    <th className="py-3 px-4 font-semibold text-right">Grievances</th>
                    <th className="py-3 px-4 font-semibold text-right">Resolution</th>
                    <th className="py-3 px-4 font-semibold text-right">Avg Close</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {districts.map(dist => {
                    const status = dist.rate > 80 ? 'green' : dist.rate > 60 ? 'yellow' : 'red';
                    return (
                      <tr key={dist.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{dist.name}</td>
                        <td className="py-3 px-4 text-right font-mono">{dist.total.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono font-bold ${dist.rate > 80 ? 'text-emerald-600' : dist.rate > 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {dist.rate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{stats.avgResolutionTime} days</td>
                        <td className="py-3 px-4 text-center flex justify-center mt-1">
                          {renderScoreDot(status)}
                        </td>
                      </tr>
                    );
                  })}
                  {districts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 uppercase tracking-widest">
                        No district performance data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 8 — Infrastructure Health */}
          <section className="space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#8B1A1A]" />
              Infrastructure Health
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {isHealth ? (
                <>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-black uppercase tracking-widest">Sanitation Trucks</span>
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-800">320</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Active Fleet</div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Faulty / Out of Service</span>
                        <span className="font-mono text-rose-600 font-black">{activeTickets.length}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Maintenance Due</span>
                        <span className="font-mono text-amber-600 font-black">15</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">High Risk Routes</span>
                        <span className="font-mono text-rose-700 font-black">5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Public Health Centers</div>
                        <div className="text-2xl font-black text-slate-800">45 <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">Operational</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Hygiene Score</div>
                        <div className="text-xl font-mono text-[#8B1A1A] font-black">91/100</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Sewerage & Waste Lines</div>
                        <div className="text-xl font-black text-slate-800">{activeTickets.filter(t => t.description?.toLowerCase().includes('sewer') || t.description?.toLowerCase().includes('waste') || t.description?.toLowerCase().includes('drain')).length} <span className="text-[10px] text-rose-600 uppercase tracking-widest font-black">Clogged</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Clearing Ongoing</div>
                        <div className="text-xl font-mono text-amber-600 font-black">18</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-black uppercase tracking-widest">Transformers</span>
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-800">12,500</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Total Monitored</div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Faulty</span>
                        <span className="font-mono text-rose-600 font-black">{activeTickets.filter(t => t.description?.toLowerCase().includes('transfo') || t.description?.toLowerCase().includes('power')).length || activeTickets.length}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Maintenance Due</span>
                        <span className="font-mono text-amber-600 font-black">350</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">High Risk</span>
                        <span className="font-mono text-rose-700 font-black">42</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Substations</div>
                        <div className="text-2xl font-black text-slate-800">210 <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">Active</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Avg Score</div>
                        <div className="text-xl font-mono text-[#8B1A1A] font-black">88/100</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Electric Lines</div>
                        <div className="text-xl font-black text-slate-800">{activeTickets.filter(t => t.description?.toLowerCase().includes('line') || t.description?.toLowerCase().includes('wire') || t.description?.toLowerCase().includes('cable')).length} <span className="text-[10px] text-rose-600 uppercase tracking-widest font-black">Damaged</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Repair Ongoing</div>
                        <div className="text-xl font-mono text-amber-600 font-black">65</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* SECTION 9 — Historical Trends */}
          <section className="space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-[#8B1A1A]" />
              Historical Grievance Trends
            </h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrievances" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                    itemStyle={{ color: '#8B1A1A' }}
                  />
                  <Area type="monotone" dataKey="grievances" stroke="#8B1A1A" strokeWidth={3} fillOpacity={1} fill="url(#colorGrievances)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* SECTION 6 — TN Live Electricity Map */}
          <section className="space-y-4">
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              TN Live {isHealth ? 'Health & Sanitation' : 'Electricity'} Map
            </h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-[300px] relative z-0">
              <MapContainer
                center={[11.1271, 78.6569]}
                zoom={6}
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {mapMarkers.map(marker => (
                  <CircleMarker
                    key={marker.id}
                    center={[marker.lat, marker.lng]}
                    radius={marker.severity === 'high' ? 12 : 8}
                    fillColor={marker.severity === 'high' ? '#f43f5e' : '#f59e0b'}
                    color={marker.severity === 'high' ? '#f43f5e' : '#f59e0b'}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.4}
                  >
                    <Popup>
                      <div className="p-1">
                        <div className="font-bold text-slate-800 text-xs mb-1">{marker.title}</div>
                        <div className="text-[10px] text-slate-500">{marker.district} District — {marker.zone} Zone</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
              <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-2 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 border border-rose-500" /> High Severity
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50 border border-amber-500" /> Medium Severity
                </div>
              </div>
            </div>
          </section>
        </div>

      </main>

      {/* DIRECTION DIRECTIVE POPUP MODAL */}
      <AnimatePresence>
        {directionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 text-[#8B1A1A]">
                  <CornerUpRight className="w-4 h-4" /> Issue Ministerial Direction
                </h4>
                <button onClick={() => setDirectionModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Target Grievance
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border text-xs">
                  <div className="font-bold text-slate-700">{selectedTicketForDirection?.type}</div>
                  <div className="text-slate-500 mt-1">{selectedTicketForDirection?.id} · {selectedTicketForDirection?.district} District</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                  Direction Instructions
                </label>
                <textarea
                  required
                  rows={4}
                  value={directionText}
                  onChange={(e) => setDirectionText(e.target.value)}
                  placeholder="Enter direct ministerial instructions for the assigned officer. This will be appended to the ticket ATR history trail..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-2xl text-slate-800 text-xs shadow-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDirectionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-650 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendDirectionSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#8B1A1A]/90 text-white font-extrabold text-xs uppercase transition-colors shadow-md"
                >
                  Submit Direction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
