import React, { useState, useEffect } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Flame, Clock, MapPin, Landmark, ArrowRight, ShieldAlert, Radio } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import { SEED_TICKETS, DISTRICT_STATS } from '../../data/seedData';

export default function MlaDashboard() {
 const { t, i18n } = useTranslation();
 const navigate = useNavigate();
 const [tickets, setTickets] = useState(SEED_TICKETS.filter(t => t.ward >= 'Ward 140' && t.ward <= 'Ward 147'));

 // Priority feed: from mock tickets
 const priorityFeed = tickets;

 const headingText = t('app_name') === 'ஜனநாயகம்'
 ? 'சட்டமன்ற உறுப்பினர் தொகுதி டாஷ்போர்டு'
 : 'MLA Constituency Dashboard';

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {/* Government Colored Top Ribbed Greeting */}
 <div style={{ background: '#8B1A1A' }} className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
 <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
 <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
 Legislative Assembly Representative
 </span>
 <h2 className="text-2xl font-black mt-3">
 {headingText}
 </h2>
 <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mt-1 opacity-90">
 Velachery Constituency (Wards 140-147)
 </p>
 </div>

 {/* KPI Stats Grid - 5 Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
 <div className="col-span-1">
 <StatCard 
 label="Total Open"
 value={DISTRICT_STATS.totalOpen.toLocaleString()}
 icon={<AlertTriangle className="text-[#8B1A1A] w-4.5 h-4.5" />}
 color="blue"
 />
 </div>
 <div className="col-span-1">
 <StatCard 
 label="Critical Issues"
 value={DISTRICT_STATS.criticalTickets.toLocaleString()}
 icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
 color="red"
 />
 </div>
 <div className="col-span-1">
 <StatCard 
 label="Resolved"
 value={DISTRICT_STATS.resolvedMonth.toLocaleString()}
 icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
 color="green"
 />
 </div>
 <div className="col-span-1">
 <StatCard 
 label="Escalated"
 value={DISTRICT_STATS.escalatedToState.toLocaleString()}
 icon={<Flame className="text-amber-500 w-4.5 h-4.5" />}
 color="orange"
 />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <StatCard 
 label="SLA Breach Rate"
 value={`${DISTRICT_STATS.slaBreachRate}%`}
 icon={<Clock className="text-slate-500 w-4.5 h-4.5" />}
 color="slate"
 />
 </div>
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


 {/* Constituency Coverage */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
 <div className="flex items-center gap-3 text-[#8B1A1A]">
 <Landmark className="w-6 h-6" />
 <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-800 ">
 Constituency Jurisdiction
 </h3>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-600 ">
 <div className="bg-slate-50 p-3 rounded-xl border">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">District</span>
 <span className="text-slate-800 text-sm">Chennai</span>
 </div>
 <div className="bg-slate-50 p-3 rounded-xl border">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Taluks Included</span>
 <span className="text-slate-800 text-sm">Velachery, Sholinganallur</span>
 </div>
 <div className="bg-slate-50 p-3 rounded-xl border col-span-2">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Covered Wards (8)</span>
 <span className="text-[#8B1A1A] text-sm">Wards 140, 141, 142, 143, 144, 145, 146, 147</span>
 </div>
 </div>
 </div>

 {/* Quick Action */}
 <button 
 onClick={() => navigate('/mla/raise')}
 className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300"
 >
 <span>{t('raise_issue')}</span>
 <ArrowRight className="w-4.5 h-4.5" />
 </button>

 {/* Priority issues feed */}
 <div className="space-y-3">
 <div className="flex justify-between items-center pl-1">
 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
 Constituency Priority Feed
 </h3>
 <button 
 onClick={() => navigate('/mla/tickets')}
 className="text-[10px] font-black uppercase text-[#8B1A1A] hover:text-[#8B1A1A] transition-all"
 >
 All Tickets
 </button>
 </div>

 {priorityFeed.length === 0 ? (
 <div className="text-center py-10 bg-white border border-slate-200 rounded-3xl text-slate-400 font-bold">
 No critical or aged tickets in constituency queue
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {priorityFeed.map(ticket => (
 <TicketCard 
 key={ticket.id}
 ticket={ticket}
 role="mla"
 onAction={(id, action) => {
 if (action === 'view') {
 navigate('/mla/tickets');
 }
 }}
 />
 ))}
 </div>
 )}
 </div>

 
</motion.div>
 );
}
