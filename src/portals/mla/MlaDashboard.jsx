import React, { useState } from 'react';
import TnMap from '../../shared/components/TnMap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, MapPin, Landmark, ArrowRight, ShieldAlert, MessageSquare } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import { SEED_TICKETS } from '../../data/seedData';

export default function MlaDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Filter for Wards 140-147
  const validWards = ['Ward 140', 'Ward 141', 'Ward 142', 'Ward 143', 'Ward 144', 'Ward 145', 'Ward 146', 'Ward 147'];
  const [tickets, setTickets] = useState(SEED_TICKETS.filter(t => validWards.includes(t.ward)));

  const priorityFeed = tickets.filter(t => t.status !== 'Resolved').slice(0, 3);
  
  const openCount = tickets.filter(t => t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;
  
  const pending7Days = tickets.filter(t => {
    if (t.status === 'Resolved') return false;
    const diffTime = Math.abs(new Date() - new Date(t.createdAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 7;
  }).length;

  const citizenFeedback = [
    { id: 1, name: 'Ramesh K.', ward: 'Ward 142', comment: 'Water supply issue was fixed promptly. Thank you MLA sir!', rating: 5, date: '2 days ago' },
    { id: 2, name: 'Priya S.', ward: 'Ward 145', comment: 'Streetlights still not working. Please follow up with EB department.', rating: 2, date: '1 day ago' },
    { id: 3, name: 'Govind M.', ward: 'Ward 144', comment: 'Road patching completed before monsoon. Good work.', rating: 4, date: '4 days ago' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Government Colored Top Ribbed Greeting */}
      <div style={{ background: '#8B1A1A' }} className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
          Legislative Assembly Representative
        </span>
        <h2 className="text-2xl font-black mt-3">
          CONSTITUENCY — Velachery (Wards 140-147)
        </h2>
        <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Constituency Oversight & Direct Citizen Engagement
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard 
          label="Constituency Open"
          value={openCount.toLocaleString()}
          icon={<AlertTriangle className="text-[#8B1A1A] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label="Critical Issues"
          value={criticalCount.toLocaleString()}
          icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label="Pending > 7 Days"
          value={pending7Days.toLocaleString()}
          icon={<Clock className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
        <StatCard 
          label="Resolved"
          value={resolvedCount.toLocaleString()}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
      </div>

      {/* Constituency Coverage */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-[#8B1A1A]">
          <Landmark className="w-6 h-6" />
          <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-800">
            Constituency Jurisdiction
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-600">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/mla/raise')}
              className="py-4 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300"
            >
              <span>Raise Issue on Behalf</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => navigate('/mla/escalate')}
              className="py-4 rounded-2xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
            >
              <AlertTriangle className="w-4.5 h-4.5" />
              <span>Escalate to Collector</span>
            </button>
          </div>

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
                No open tickets in constituency queue
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {priorityFeed.map(ticket => (
                  <TicketCard 
                    key={ticket.id}
                    ticket={ticket}
                    role="mla"
                    onAction={(id, action) => {
                      if (action === 'view') navigate('/mla/tickets');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Zoomed In Constituency Map */}
          <div className="bg-white rounded-[16px] p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 select-none">
              <MapPin className="w-4 h-4 text-[#8B1A1A]" />
              <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
                Constituency Map
              </h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-100">
              <TnMap 
                lang={i18n?.language || 'en'} 
                citizenMode={false} 
                height="250px" 
                zoom={10}
                center={[13.0827, 80.2707]} // Chennai coordinates
              />
            </div>
          </div>

          {/* Citizen Feedback Section */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#8B1A1A] pl-1">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                Citizen Feedback
              </h3>
            </div>
            <div className="space-y-3">
              {citizenFeedback.map(fb => (
                <div key={fb.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-800">{fb.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{fb.date}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-[#8B1A1A] mb-2 inline-block bg-red-50 px-2 py-0.5 rounded">
                    {fb.ward}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
