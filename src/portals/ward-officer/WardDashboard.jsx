import React, { useState } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, CheckCircle2, Flame, Inbox, ShieldAlert, Radio } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import { wardSeedData } from '../../data/wardSeedData';

export default function WardDashboard() {
 const { t, i18n } = useTranslation();
 const navigate = useNavigate();
 const [stats, setStats] = useState(wardSeedData.stats);
 const [tickets, setTickets] = useState(wardSeedData.tickets);

 // Compute derived stats from tickets:
 const totalOpen = tickets.filter(t => t.status !== 'RESOLVED').length;
 const overdueSLA = tickets.filter(t => t.slaBreached).length;
 const resolvedToday = tickets.filter(t => t.status === 'RESOLVED').length;
 const escalatedToBDO = tickets.filter(t => t.status === 'ESCALATED').length;

 // Priority Inbox: open tickets
 const priorityTickets = tickets.filter(t => t.status !== 'RESOLVED').slice(0, 5);

 const getAlertText = () => {
 const isTamil = t('app_name') === 'ஜனநாயகம்';
 if (isTamil) {
 return `${overdueSLA} புகார்கள் காலக்கெடு தாண்டியது! உடனே நடவடிக்கை எடுங்கள்.`;
 }
 return `${overdueSLA} tickets are overdue! Act now.`;
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
 Ward Officer Dashboard
 </h2>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
 Velachery Ward 142 Control Board
 </p>
 </div>

 {/* Red Alert Banner for Overdue Tickets */}
 {overdueSLA > 0 && (
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-5 shadow-[0_4px_15px_rgba(225,29,72,0.1)] flex items-start gap-4"
 >
 <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
 <ShieldAlert className="w-6 h-6 animate-pulse" />
 </div>
 <div>
 <h4 className="text-sm font-black text-rose-700 uppercase tracking-wide">
 Critical Warning
 </h4>
 <p className="text-xs sm:text-sm text-rose-600 font-extrabold mt-1 leading-relaxed">
 {getAlertText()}
 </p>
 </div>
 </motion.div>
 )}

 {/* KPI Cards Grid */}
 <div className="stat-grid">
 <StatCard 
 label="TOTAL OPEN" 
 value={totalOpen} 
 icon={<Inbox className="w-5 h-5 text-blue-500" />}
 color="blue"
 />
 <StatCard 
 label="OVERDUE (SLA BREACHED)" 
 value={overdueSLA} 
 icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
 color="red"
 />
 <StatCard 
 label="RESOLVED TODAY" 
 value={resolvedToday} 
 icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
 color="green"
 />
 <StatCard 
 label="ESCALATED TO BDO" 
 value={escalatedToBDO} 
 icon={<Flame className="w-5 h-5 text-amber-500" />}
 color="orange"
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
            <p className="text-sm font-black text-slate-800">1,204</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ACTIVE</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">8,432</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">RESOLVED</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">89</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ESCALATED</p>
          </div>
        </div>

      </div>


 {/* Priority Inbox list */}
 <div className="space-y-3">
 <div className="flex justify-between items-center pl-1">
 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
 Priority Inbox (SLA Urgency)
 </h3>
 <button 
 onClick={() => navigate('/ward-officer/inbox')}
 className="text-[10px] font-black uppercase text-[#8B1A1A] hover:text-[#FF6600] transition-colors"
 >
 View Full Inbox
 </button>
 </div>

 {priorityTickets.length === 0 ? (
 <div className="text-center py-10 bg-white border border-slate-200 rounded-3xl text-slate-400 font-bold">
 No pending tickets in queue!
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {priorityTickets.map(ticket => {
 // Highlight orange if ticket is older than 20 hours
 const hoursSinceCreation = (new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60);
 const isOld = hoursSinceCreation > 20;

 return (
 <div 
 key={ticket.id} 
 className={`rounded-2xl transition-all ${
 isOld 
 ? 'p-1.5 bg-amber-50/70 border border-amber-200 shadow-sm' 
 : ''
 }`}
 >
 <TicketCard 
 ticket={ticket}
 role="ward_officer"
 onAction={(id, action) => {
 if (action === 'view') {
 navigate('/ward-officer/inbox');
 }
 }}
 />
 {isOld && (
 <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 pl-4 pt-1 block">
 ⚠️ Warning: Ticket is older than 20 hours!
 </span>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 
</motion.div>
 );
}
