import React, { useState, useEffect } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Smartphone, Clock, Radio } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';
import { SEED_TICKETS, getTicketsByWard, STATE_STATS } from '../../data/seedData';

export default function VaoDashboard() {
 const { t, i18n } = useTranslation();
 const [tickets, setTickets] = useState([]);

 useEffect(() => {
 setTickets(SEED_TICKETS);
 }, []);

 // Compute stats
 const wardTickets = getTicketsByWard('Ward 142');
 const openCount = wardTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
 
 const todayStr = new Date().toISOString().split('T')[0];
 const raisedTodayCount = tickets.filter(t => t.assignedTo === 'VAO' && t.createdAt && t.createdAt.startsWith(todayStr)).length;
 
 const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

 // Filter/Sort recent tickets
 const recentTickets = [...tickets]
 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
 .slice(0, 5);

 const formatSla = (slaDeadline) => {
 if (!slaDeadline) return '-';
 const diff = new Date(slaDeadline) - new Date();
 if (diff <= 0) return t('breached');
 const hrs = Math.floor(diff / (1000 * 60 * 60));
 return `${hrs}h left`;
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {/* Title */}
 <div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 VAO Grievance Dashboard
 </h2>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
 Ward 142 Administrative Center
 </p>
 </div>

 {/* KPI Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <StatCard 
 label="Village Open Tickets"
 value={openCount}
 icon={<AlertTriangle className="w-5 h-5 text-[#8B1A1A]" />}
 color="blue"
 />
 <StatCard 
 label="Raised by VAO Today"
 value={raisedTodayCount}
 icon={<Smartphone className="w-5 h-5 text-amber-500" />}
 color="orange"
 />
 <StatCard 
 label="Resolved This Week"
 value={resolvedCount}
 icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
 color="green"
 />
 </div>

      {/* ══ LIVE DISTRICT RADAR SECTION ══ */}
      <div className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-6">
        
        <div className="flex justify-between items-center mb-3 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8B1A1A] animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-700">
              Live District Radar
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase">SECURE</span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-100">
          <TnMap 
            lang={i18n?.language || 'en'} 
            citizenMode={false} 
            height="220px" 
            center={
              (() => {
                const ud = typeof window !== 'undefined' ? localStorage.getItem('jn_district') : null;
                const dMap = {
                  "Chennai": [13.0827, 80.2707],
                  "Madurai": [9.9252, 78.1198],
                  "Coimbatore": [11.0168, 76.9558],
                  "Salem": [11.6643, 78.1460],
                  "Trichy": [10.7905, 78.7047]
                };
                return dMap[ud] || [10.8505, 78.6677];
              })()
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center select-none">
          <div>
            <p className="text-sm font-black text-slate-800">{STATE_STATS.totalActive}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ACTIVE</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">{STATE_STATS.totalResolved}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">RESOLVED</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">{STATE_STATS.totalEscalated}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ESCALATED</p>
          </div>
        </div>

      </div>


 {/* Recent Tickets Compact Table */}
 <div className="space-y-3">
 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
 Recent Grievance Queue
 </h3>

 <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
 <th className="px-5 py-4">ID</th>
 <th className="px-4 py-4">Category</th>
 <th className="px-4 py-4">Citizen Name</th>
 <th className="px-4 py-4">Status</th>
 <th className="px-5 py-4">SLA Deadline</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 ">
 {recentTickets.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-medium italic">
 No active tickets in queue
 </td>
 </tr>
 ) : (
 recentTickets.map(ticket => (
 <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-5 py-4 font-mono text-[#9a0002] ">
 #{ticket.id}
 </td>
 <td className="px-4 py-4 whitespace-nowrap">
 <span className="flex items-center gap-1.5">
 <CategoryIcon category={ticket.category} />
 <span className="uppercase tracking-wide">
 {t(`categories.${ticket.category.toLowerCase()}`)}
 </span>
 </span>
 </td>
 <td className="px-4 py-4 whitespace-nowrap">
 {ticket.citizenName || 'Anonymous'}
 </td>
 <td className="px-4 py-4">
 <StatusBadge status={ticket.status} />
 </td>
 <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-medium">
 {formatSla(ticket.slaDeadline)}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 
</motion.div>
 );
}
