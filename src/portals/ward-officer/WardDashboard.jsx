import React, { useState } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertOctagon, HeartHandshake, CheckCircle2, Flame, Inbox, ShieldAlert, MessageCircle, ArrowRight, UserPlus, MapPin } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import api from '../../services/api';

export default function WardDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const officerWard = localStorage.getItem('jn_ward') || 'Velachery';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          ...t,
          category: t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          id: t.ticketNumber,
          description: t.description,
          ward: t.jurisdiction?.name || 'Unknown' 
        }));
        setTickets(formatted.filter(t => t.ward === officerWard || t.ward.includes('142')));
      } catch (err) {
        console.error('Failed to fetch ward tickets:', err);
      }
    };
    fetchTickets();
  }, []);

  const priorityTickets = tickets.filter(t => t.status !== 'Resolved').slice(0, 3);
  
  const totalOpen = tickets.filter(t => t.status !== 'Resolved').length;
  const resolvedThisMonth = tickets.filter(t => t.status === 'Resolved').length;
  // Mock "Citizens Helped"
  const citizensHelped = resolvedThisMonth * 3 + 12;
  const pendingOverdue = tickets.filter(t => t.status !== 'Resolved' && new Date() > new Date(t.slaDeadline)).length;

  const citizenMessages = [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Friendly Grassroots Header */}
      <div style={{ background: '#8B1A1A' }} className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-end min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full border border-white/20 inline-block mb-2">
            Grassroots Citizen Representative
          </span>
          <h2 className="text-3xl font-black">
            WARD — {officerWard}
          </h2>
          <p className="text-sm text-emerald-100 font-bold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" />
            Direct Citizen Support & Action
          </p>
        </div>
      </div>

      {/* Primary Action Button (Huge) */}
      <button 
        onClick={() => navigate('/ward-officer/file-issue')}
        className="w-full py-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-[0_8px_30px_rgba(5,150,105,0.3)] transition-all duration-300 transform hover:-translate-y-1 border-4 border-white/20 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex items-center justify-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black uppercase tracking-widest text-emerald-100 mb-0.5">Primary Action</span>
            <span className="block text-2xl font-black uppercase tracking-wide">File Issue on Behalf of Citizen</span>
          </div>
          <ArrowRight className="w-6 h-6 ml-4 opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-2 transform" />
        </div>
      </button>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard 
          label="Ward Open Tickets" 
          value={totalOpen} 
          icon={<Inbox className="w-5 h-5 text-blue-500" />}
          color="blue"
        />
        <StatCard 
          label="Pending (Overdue)" 
          value={pendingOverdue} 
          icon={<AlertOctagon className="w-5 h-5 text-rose-600" />}
          color="red"
        />
        <StatCard 
          label="Resolved This Month" 
          value={resolvedThisMonth} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="green"
        />
        <StatCard 
          label="Citizens Helped" 
          value={citizensHelped} 
          icon={<HeartHandshake className="w-5 h-5 text-amber-500" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Messages from Ward Citizens */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pl-1 border-b pb-3">
              <div className="flex items-center gap-2 text-[#8B1A1A]">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                  Messages from Ward Citizens
                </h3>
              </div>
              <span className="text-[10px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full">
                {citizenMessages.filter(m => m.isUrgent).length} URGENT
              </span>
            </div>
            
            <div className="space-y-3">
              {citizenMessages.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-6 text-center">No new messages from citizens.</p>
              ) : (
                citizenMessages.map(msg => (
                  <div key={msg.id} className={`p-4 border rounded-2xl transition-all hover:shadow-md ${msg.isUrgent ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs ${msg.isUrgent ? 'bg-rose-500' : 'bg-slate-400'}`}>
                          {msg.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 block leading-none">{msg.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                        </div>
                      </div>
                      {msg.isUrgent && (
                        <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium pl-10">"{msg.text}"</p>
                    <div className="pl-10 mt-3 flex gap-2">
                      <button className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Reply</button>
                      <button className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Convert to Ticket</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Priority Tickets in Ward */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pl-1 border-b pb-3">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Ward Action Queue
              </h3>
              <button 
                onClick={() => navigate('/ward-officer/tickets')}
                className="text-[10px] font-black uppercase text-[#8B1A1A] hover:text-[#FF6600] transition-colors"
              >
                View Full Inbox
              </button>
            </div>

            {priorityTickets.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-3xl text-slate-400 font-bold">
                No open tickets in your ward!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {priorityTickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id}
                    ticket={ticket}
                    role="ward_officer"
                    onAction={(id, action) => {
                      if (action === 'view') navigate('/ward-officer/tickets');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Zoomed In Single Ward Map */}
          <div className="bg-white rounded-[16px] p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3 select-none">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B1A1A]" />
                <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
                  {officerWard} Boundary Map
                </h3>
              </div>
              <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded">ZOOM LEVEL 13</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-100">
              <TnMap 
                lang={i18n?.language || 'en'} 
                citizenMode={false} 
                height="300px" 
                zoom={13}
                center={[12.9792, 80.2223]} // Coordinates approximate for Velachery Ward 142
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
