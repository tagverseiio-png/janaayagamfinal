import React, { useState, useEffect } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Landmark, ShieldAlert, AlertTriangle, ArrowRight, HelpCircle, Radio } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import api from '../../services/api';
 export default function DroDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [talukData, setTalukData] = useState([]);
  const [stats, setStats] = useState({ totalActive: 0, totalResolved: 0, totalEscalated: 0 });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          ...t,
          category: t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          id: t.ticketNumber,
          taluk: t.jurisdiction?.name || 'Unknown'
        }));
        
        const districtName = localStorage.getItem('jn_emp_district') || 'Chennai';
        const districtTickets = formatted.filter(t => t.district === districtName);
        setTickets(districtTickets);

        // Group by taluk for Revenue tickets (or all tickets if we want to show jurisdiction)
        const talukMap = {};
        districtTickets.forEach(ticket => {
          const jName = ticket.taluk;
          if (!talukMap[jName]) talukMap[jName] = { name: jName, open: 0, avgDays: 4 };
          if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
            talukMap[jName].open += 1;
          }
        });
        setTalukData(Object.values(talukMap));
      } catch (err) {
        console.error('Failed to fetch DRO tickets:', err);
      }
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats({
          totalActive: statsRes.data.totalOpen || 0,
          totalResolved: statsRes.data.totalResolved || 0,
          totalEscalated: statsRes.data.totalEscalated || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchTickets();
  }, []);

  const totalOpenRevenue = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const pattaIssues = tickets.filter(t => t.category.toLowerCase().includes('patta')).length;
  const encroachmentIssues = tickets.filter(t => t.category.toLowerCase().includes('encroachment')).length;

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {/* Revenue Header Panel */}
 <div className="bg-gradient-to-r from-[#9a0002] to-rose-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
 <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
 <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
 Revenue & Land Administration Department
 </span>
 <h2 className="text-2xl font-black mt-3">
 {t('app_name') === 'ஜனநாயகம்' ? 'வருவாய் துறை டாஷ்போர்டு' : 'District Revenue Dashboard'}
 </h2>
 <p className="text-xs text-rose-100 font-bold uppercase tracking-wider mt-1 opacity-90">
 Land Records • Patta Transfers • Encroachments
 </p>
 </div>

 {/* KPI Stats Cards - 3 Cards */}
 <div className="stat-grid-3">
 <StatCard 
 label={t('total_revenue_open')}
 value={totalOpenRevenue}
 icon={<FileText className="text-[#9a0002] w-5 h-5" />}
 color="red"
 />
 <StatCard 
 label={t('patta_issues')}
 value={pattaIssues}
 icon={<Landmark className="text-amber-500 w-5 h-5" />}
 color="orange"
 />
 <StatCard 
 label={t('encroachment_issues')}
 value={encroachmentIssues}
 icon={<ShieldAlert className="text-rose-500 w-5 h-5" />}
 color="blue"
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
            <p className="text-sm font-black text-slate-800">{stats.totalActive}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ACTIVE</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">{stats.totalResolved}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">RESOLVED</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">{stats.totalEscalated}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ESCALATED</p>
          </div>
        </div>

      </div>


 {/* District Taluks Table */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
 <div className="flex items-center gap-2.5 text-[#9a0002]">
 <Landmark className="w-5 h-5" />
 <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 ">
 Taluk Revenue Performance
 </h3>
 </div>

 <div className="overflow-x-auto rounded-2xl border">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
 <th className="px-5 py-3.5">Taluk Name</th>
 <th className="px-5 py-3.5">Open Revenue Tickets</th>
 <th className="px-5 py-3.5">Avg Days to Resolve</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 ">
 {talukData.map(taluk => (
 <tr key={taluk.name} className="hover:bg-slate-50/50 ">
 <td className="px-5 py-4 font-extrabold text-slate-800 ">{taluk.name} Taluk</td>
 <td className="px-5 py-4 font-mono text-rose-600">{taluk.open} active</td>
 <td className="px-5 py-4 font-mono">{taluk.avgDays} days</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Quick Action Link */}
 <button 
 onClick={() => navigate('/dro/tickets')}
 className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#9a0002] to-rose-700 hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300"
 >
 <span>Manage Revenue Tickets Queue</span>
 <ArrowRight className="w-4.5 h-4.5" />
 </button>
 
</motion.div>
 );
}
