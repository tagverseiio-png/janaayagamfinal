import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, AlertTriangle, MapPin, CheckCircle, Clock } from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';

export default function MinisterDeptView() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('roads');

  const departments = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  useEffect(() => {
    // Generate some highly specific dummy data for the department view
    // so it looks robust and full
    const baseTickets = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    
    // Inject some guaranteed state-level tickets for the minister view
    const extraTickets = [
      {
        id: 'MIN-901',
        category: 'roads',
        title: 'State Highway 44 - Major expansion project delayed due to land acquisition',
        description: 'Multi-district highway project stalled. Requires high-level intervention.',
        status: 'escalated',
        priority: 'critical',
        district: 'Madurai',
        ward: 'All',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        citizen_name: 'Highway Authority'
      },
      {
        id: 'MIN-902',
        category: 'water',
        title: 'Cauvery delta irrigation canal modernization pending',
        description: 'Farmers requesting immediate release of funds for modernization.',
        status: 'open',
        priority: 'high',
        district: 'Thanjavur',
        ward: 'All',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        citizen_name: 'Delta Farmers Assoc.'
      },
      {
        id: 'MIN-903',
        category: 'electricity',
        title: 'Substation upgrade for industrial corridor',
        description: 'Power fluctuations affecting manufacturing units in SIPCOT.',
        status: 'in_progress',
        priority: 'high',
        district: 'Kancheepuram',
        ward: 'SIPCOT',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        citizen_name: 'Industrial Board'
      },
      {
        id: 'MIN-904',
        category: 'health',
        title: 'Medical College Hospital infrastructure fund allocation',
        description: 'New block construction halted pending minister approval.',
        status: 'escalated',
        priority: 'critical',
        district: 'Coimbatore',
        ward: 'Central',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        citizen_name: 'Dean, Medical College'
      }
    ];

    setTickets([...extraTickets, ...baseTickets]);
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesDept = t.category?.toLowerCase() === selectedDept;
    const matchesSearch = (t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.id?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="bg-gradient-to-r from-[#003366] to-[#9a0002] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <h2 className="text-2xl font-black mt-3">
          Department Portfolio Tickets
        </h2>
        <p className="text-xs text-rose-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Statewide Grievance Management View
        </p>
      </div>

      {/* Portfolio Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
          Select Department Portfolio
        </span>
        <div className="flex gap-2 overflow-x-auto p-1 hide-scrollbar bg-slate-100 rounded-2xl border">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                selectedDept === dept
                  ? 'bg-[#9a0002] text-white shadow-sm'
                  : 'text-slate-600 '
              }`}
            >
              {t(`categories.${dept}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search tickets by ID, title, or keywords..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#9a0002] outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        </div>

        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-bold">
              No tickets found for {selectedDept} department.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map(ticket => (
                <TicketCard 
                  key={ticket.id}
                  ticket={ticket}
                  role="minister"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
