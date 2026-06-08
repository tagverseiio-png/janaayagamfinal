import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, AlertTriangle, Layers, ArrowRight, ShieldAlert, Map, Radio } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TnMap from '../../shared/components/TnMap';
import TableSkeleton from '../../shared/components/TableSkeleton';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import api from '../../services/api';


export default function SecretaryDashboard() {
 const { t, i18n } = useTranslation();
 const [selectedDept, setSelectedDept] = useState('roads');
 const [tickets, setTickets] = useState([]);
 const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'map'
 const [loadingTable, setLoadingTable] = useState(true);

 const departments = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

 const districtsList = [
 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
 ];

  const [STATE_STATS, setStats] = useState({ totalOpen: 0, totalResolved: 0, criticalTickets: 0, slaBreachRate: 0, resolvedMonth: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(prev => ({
          ...prev,
          totalOpen: statsRes.data.totalOpen,
          totalResolved: statsRes.data.totalResolved,
          criticalTickets: statsRes.data.criticalPriority,
          resolvedMonth: statsRes.data.totalResolved
        }));

        const ticketsRes = await api.get('/tickets');
        const formatted = ticketsRes.data.map(t => ({
          ...t,
          category: t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          id: t.ticketNumber,
          description: t.description
        }));
        setTickets(formatted);
        setLoadingTable(false);
      } catch (err) {
        console.error('Failed to fetch secretary data:', err);
        setLoadingTable(false);
      }
    };
    fetchData();
  }, []);

 const activeTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');

 // Compute District Grid Counts Dynamically
  const districtData = districtsList.map(dist => {
    // Dynamic query from actual tickets matching district and selected sector
    const distTickets = tickets.filter(ticket => ticket.district === dist && ticket.category.toLowerCase() === selectedDept);
    
    const dOpen = distTickets.filter(t => t.status === 'open').length;
    const dResolved = distTickets.filter(t => t.status === 'resolved').length;

    return {
      name: dist,
      open: dOpen,
      resolved: dResolved,
      avgDays: 0 // Cannot compute from mock, leaving as 0 or could calculate if we had resolvedAt
    };
  }).sort((a, b) => b.open - a.open); // Sorted by open descending

  // Systemic Issue Watch logic: Same issue has active complaints in 3+ districts
  const districtsWithActiveIssues = districtData.filter(d => d.open > 0).length;
  const isSystemicFailure = districtsWithActiveIssues >= 3;

 const totalOpenInDept = districtData.reduce((sum, d) => sum + d.open, 0);
 const totalResolvedInDept = districtData.reduce((sum, d) => sum + d.resolved, 0);
 const avgResolutionTime = Math.round(districtData.reduce((sum, d) => sum + d.avgDays, 0) / 38);

 const headingText = t('app_name') === 'ஜனநாயகம்'
 ? 'துறைச் செயலாளர் மாநில டாஷ்போர்டு'
 : 'State Department Secretary Dashboard';

 const systemicWarningTamil = `5+ மாவட்டங்களில் ஒரே பிரச்சினை — கணினி சார்ந்த தோல்விக்கான சாத்தியம்! (செயலில் உள்ளவை: ${districtsWithActiveIssues} மாவட்டங்கள்)`;
 const systemicWarningEnglish = `Same issue in 5+ districts — possible systemic failure! (Active in ${districtsWithActiveIssues} districts)`;

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {/* IAS emblem banner */}
 <div style={{ background: '#8B1A1A' }} className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
 <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
 <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
 State Secretariat • Departmental Administration
 </span>
 <h2 className="text-2xl font-black mt-3">
 {headingText}
 </h2>
 <p className="text-xs text-sky-100 font-bold uppercase tracking-wider mt-1 opacity-90">
 Manage statewide policy execution, program budgets, and bulk administrative queues
 </p>
 </div>

 {/* 1. Statewide Department Selector Toggler */}
 <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
 Select Statewide Department Portfolio
 </span>
 
 <div className="flex gap-2 overflow-x-auto p-1 hide-scrollbar bg-slate-100 rounded-2xl border">
 {departments.map(dept => {
 const isActive = selectedDept === dept;
 return (
 <button
 key={dept}
 onClick={() => setSelectedDept(dept)}
 className={`px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
 isActive
 ? 'bg-[#8B1A1A] text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-800'
 }`}
 >
 {t(`categories.${dept}`)}
 </button>
 );
 })}
 </div>
 </div>

 {/* Tab Selection */}
 <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-2 shadow-sm max-w-sm">
 <button
 onClick={() => setActiveTab('grid')}
 className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
 activeTab === 'grid'
 ? 'bg-[#8B1A1A] text-white shadow-sm'
 : 'text-slate-600 hover:text-[#8B1A1A]'
 }`}
 >
 {t('app_name') === 'ஜனநாயகம்' ? 'கிரிட் காட்சி' : 'Grid View'}
 </button>
 <button
 onClick={() => setActiveTab('map')}
 className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
 activeTab === 'map'
 ? 'bg-[#8B1A1A] text-white shadow-sm'
 : 'text-slate-600 hover:text-[#8B1A1A]'
 }`}
 >
 <Map className="w-4 h-4" />
 <span>{t('app_name') === 'ஜனநாயகம்' ? 'வரைபடம்' : 'Map View'}</span>
 </button>
 </div>

 {activeTab === 'grid' ? (
 <>
 {/* Systemic Failure Warning Banner */}
 <AnimatePresence>
 {isSystemicFailure && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="bg-rose-50 border border-rose-200 p-4.5 rounded-3xl flex items-start gap-3 shadow-inner"
 >
 <ShieldAlert className="w-5.5 h-5.5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
 <div className="space-y-1">
 <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">
 Statewide Systemic Failure Alert
 </span>
 <p className="text-xs text-rose-800 font-extrabold leading-relaxed">
 {t('app_name') === 'ஜனநாயகம்' ? systemicWarningTamil : systemicWarningEnglish}
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* KPI Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard 
 label="Statewide Open"
 value={STATE_STATS.totalOpen.toLocaleString()}
 icon={<AlertTriangle className="text-[#8B1A1A] w-5 h-5" />}
 color="blue"
 />
 <StatCard 
 label="Critical Tickets"
 value={STATE_STATS.criticalTickets.toLocaleString()}
 icon={<ShieldAlert className="text-rose-600 w-5 h-5" />}
 color="red"
 />
 <StatCard 
 label="SLA Breach Rate"
 value={`${STATE_STATS.slaBreachRate}%`}
 icon={<Layers className="text-amber-600 w-5 h-5" />}
 color="orange"
 />
 <StatCard 
 label="Resolved (Month)"
 value={STATE_STATS.resolvedMonth.toLocaleString()}
 icon={<Landmark className="text-emerald-600 w-5 h-5" />}
 color="green"
 />
 </div>

 {/* 38-District Scrollable Performance Table */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pl-1">
 <div className="flex items-center gap-2 text-[#8B1A1A]">
 <Landmark className="w-5 h-5" />
 <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 ">
 38 Districts Summary Matrix
 </h3>
 </div>
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border">
 Sorted by open counts
 </span>
 </div>

 {loadingTable ? (
 <TableSkeleton rows={5} cols={4} />
 ) : (
 <div className="overflow-y-auto max-h-[360px] rounded-2xl border hide-scrollbar shadow-inner bg-slate-50/20">
 <table className="w-full text-left border-collapse text-xs">
 <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider z-10">
 <tr>
 <th className="px-5 py-3">District Name</th>
 <th className="px-5 py-3">Open Complaints ({t(`categories.${selectedDept}`)})</th>
 <th className="px-5 py-3">Resolved</th>
 <th className="px-5 py-3">Avg Resolution Time</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 bg-white ">
 {districtData.map(dist => (
 <tr key={dist.name} className="hover:bg-slate-50/50 ">
 <td className="px-5 py-3.5 font-extrabold text-slate-800 ">{dist.name} District</td>
 <td className="px-5 py-3.5 text-rose-600 font-mono">{dist.open} complaints</td>
 <td className="px-5 py-3.5 text-emerald-600 font-mono">{dist.resolved} resolved</td>
 <td className="px-5 py-3.5 font-mono">{dist.avgDays} days</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </>
 ) : (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full font-sans"
 >
 <div className="mb-4">
 <h3 className="text-lg font-black text-[#8B1A1A] uppercase tracking-wide">
 {t('app_name') === 'ஜனநாயகம்' ? 'தமிழ்நாடு மாநில குறைதீர்க்கும் வரைபடம்' : 'Tamil Nadu State Grievance Map'}
 </h3>
 <p className="text-xs text-slate-500">
 {t('app_name') === 'ஜனநாயகம்' ? 'மாநில அளவிலான துறை வாரியாக குறைதீர்க்கும் எண்ணிக்கையை கண்காணிக்கவும்' : `Statewide district distribution for ${t(`categories.${selectedDept}`)} portfolio`}
 </p>
 </div>
 <ErrorBoundary>
 <TnMap lang={i18n.language} citizenMode={false} zoom={7} />
 </ErrorBoundary>
 </motion.div>
 )}
 
</motion.div>
 );
}
