import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, Filter, AlertTriangle, MapPin, CheckCircle, Clock, X, ArrowUpRight, CheckSquare, MessageSquare } from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';
import { toast } from 'sonner';

import api from '../../services/api';

export default function MinisterDeptView() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeTicket, setActiveTicket] = useState(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateNotes, setEscalateNotes] = useState('');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');

  const deptName = localStorage.getItem('jn_emp_dept') || 'Electricity & Energy Resources';
  const isHealth = deptName.toLowerCase().includes('health') || deptName.toLowerCase().includes('sanit');
  const actualDept = isHealth ? 'health' : 'electricity';

  const [selectedDept, setSelectedDept] = useState(actualDept);
  const departments = isHealth ? ['health'] : ['electricity'];

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.department?.name || 'Unknown',
        district: t.district || t.jurisdiction?.parent?.name || 'Chennai',
        id: t.ticketNumber,
        dbId: t.id,
        description: t.description,
        ward: t.ward || t.jurisdiction?.name || 'Unknown',
        created_at: t.createdAt
      }));
      setTickets(formatted);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch minister portfolio tickets:', err);
      toast.error('Failed to retrieve portfolio tickets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleActionClick = (ticketId, actionType) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (actionType === 'view') {
      setActiveTicket(ticket);
    } else if (actionType === 'escalate') {
      setActiveTicket(ticket);
      setEscalateNotes('');
      setEscalateModalOpen(true);
    } else if (actionType === 'close') {
      setActiveTicket(ticket);
      setCloseNotes('');
      setCloseModalOpen(true);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateNotes.trim()) {
      toast.error('Escalation reason is mandatory.');
      return;
    }

    try {
      await api.patch(`/tickets/${activeTicket.dbId}`, {
        status: 'ESCALATED',
        notes: escalateNotes
      });
      toast.success('Ticket escalated successfully.');
      setEscalateModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to escalate ticket.');
    }
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    if (!closeNotes.trim()) {
      toast.error('Resolution details are mandatory.');
      return;
    }

    try {
      await api.patch(`/tickets/${activeTicket.dbId}`, {
        status: 'RESOLVED',
        notes: closeNotes
      });
      toast.success('Ticket resolved successfully.');
      setCloseModalOpen(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to resolve ticket.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesDept = t.category?.toLowerCase().includes(selectedDept) || selectedDept.includes(t.category?.toLowerCase());
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
                  onAction={handleActionClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {activeTicket && !escalateModalOpen && !closeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTicket(null)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-[#8B1A1A] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={activeTicket.category} />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">Ticket ID: #{activeTicket.id}</span>
                    <h4 className="text-sm font-black uppercase mt-0.5">
                      {activeTicket.category}
                    </h4>
                  </div>
                </div>
                <button onClick={() => setActiveTicket(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex gap-2.5 items-center">
                  <StatusBadge status={activeTicket.status} />
                  <span className="text-[10.5px] font-bold text-slate-400 font-mono">
                    Date: {new Date(activeTicket.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grievance Description</h5>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {activeTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-bold">
                  <div className="bg-slate-50 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Ward / Zone</span>
                    <span className="text-slate-800 ">{activeTicket.ward || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">District</span>
                    <span className="text-slate-800 ">{activeTicket.district || 'Chennai'}</span>
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Reporter</span>
                    <span className="text-slate-800 ">{activeTicket.citizen_name || 'Anonymous'}</span>
                  </div>
                </div>

                {activeTicket.photo && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Evidence</h5>
                    <div className="w-full h-44 border rounded-xl overflow-hidden shadow-inner">
                      <img src={activeTicket.photo} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* History trail */}
                {activeTicket.history && activeTicket.history.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action History Log</h5>
                    <div className="space-y-2 border-l-2 border-slate-200 pl-4 py-1">
                      {activeTicket.history.map((evt, idx) => (
                        <div key={idx} className="relative text-xs">
                          <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400 border border-white" />
                          <div className="font-bold text-slate-800 capitalize">{evt.action.replace(/_/g, ' ')}</div>
                          {evt.employee && (
                            <div className="text-[10px] text-slate-500 font-bold">{evt.employee.name} ({evt.employee.role})</div>
                          )}
                          {evt.notes && (
                            <p className="text-slate-650 mt-0.5 italic">"{evt.notes}"</p>
                          )}
                          <div className="text-[9px] text-slate-400 mt-0.5">{new Date(evt.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESCALATE MODAL */}
      <AnimatePresence>
        {escalateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#8B1A1A] text-base uppercase flex items-center gap-1.5">
                  <ArrowUpRight className="w-5 h-5" /> Escalate Grievance
                </h4>
                <button onClick={() => setEscalateModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleEscalateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Reason for Escalation
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={escalateNotes}
                    onChange={(e) => setEscalateNotes(e.target.value)}
                    placeholder="Provide a mandatory reason/notes for escalating this complaint to the next authority level..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-800 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#8B1A1A] hover:bg-red-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Confirm Escalation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESOLVE/CLOSE MODAL */}
      <AnimatePresence>
        {closeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-emerald-600 text-base uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-5 h-5" /> Resolve Grievance
                </h4>
                <button onClick={() => setCloseModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCloseSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Resolution Notes
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    placeholder="Outline the actions taken to successfully resolve this grievance..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 outline-none px-4 py-3 rounded-xl text-slate-800 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Mark as Resolved
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
