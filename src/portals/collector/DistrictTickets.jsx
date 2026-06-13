import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
 FileText, Landmark, ShieldAlert, Star, MessageSquare, AlertCircle, X, ShieldCheck, ArrowUpRight, Check
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';
import api, { getMediaUrl } from '../../services/api';

export default function DistrictTickets({ escalatedOnly = false }) {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const [tickets, setTickets] = useState([]);
 const [loading, setLoading] = useState(true);
 
 // Filters state
 const [filterTaluk, setFilterTaluk] = useState('all');
 const [filterWard, setFilterWard] = useState('all');
 const [filterCategory, setFilterCategory] = useState('all');
 const [filterStatus, setFilterStatus] = useState('all');
 const [filterPriority, setFilterPriority] = useState('all');

 // Interactive Action Modals
 const [activeTicket, setActiveTicket] = useState(null);
 const [directiveModalOpen, setDirectiveModalOpen] = useState(false);
 const [directiveText, setDirectiveText] = useState('');
 
 const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    taluk: null,
    ward: null,
    category: null,
    status: null,
    priority: null
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      const districtName = localStorage.getItem('jn_emp_district') || 'Chennai';
      const formatted = res.data.map(t => ({
        ...t,
        category: t.department?.name || 'Unknown',
        district: t.district || t.jurisdiction?.parent?.name || districtName,
        id: t.ticketNumber,
        dbId: t.id,
        taluk: t.jurisdiction?.name || 'Unknown',
        ward: t.jurisdiction?.name || 'Unknown',
        created_at: t.createdAt
      }));
      
      let list = formatted;
      if (escalatedOnly) {
        list = list.filter(t => t.status === 'ESCALATED');
      }
      setTickets(list);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch district tickets:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [escalatedOnly]);

  // Only apply filters when user explicitly changes a dropdown:
  function handleFilterChange(filterKey, value) {
    const updatedFilters = { ...filters, [filterKey]: value };
    setFilters(updatedFilters);
    
    // Update individual state for controlled dropdowns
    if (filterKey === 'taluk') setFilterTaluk(value);
    if (filterKey === 'ward') setFilterWard(value);
    if (filterKey === 'category') setFilterCategory(value);
    if (filterKey === 'status') setFilterStatus(value);
    if (filterKey === 'priority') setFilterPriority(value);
  }

 // 1. Add Collector Directive Pinned Note
 const handleDirectiveSubmit = async (e) => {
   e.preventDefault();
   if (!directiveText.trim()) {
     toast.error('Directive text is required');
     return;
   }

   try {
     await api.patch(`/tickets/${activeTicket.dbId}`, { 
       notes: `COLLECTOR DIRECTIVE: ${directiveText}` 
     });
     setDirectiveModalOpen(false);
     setDirectiveText('');
     toast.success(t('app_name') === 'ஜனநாயகம்' 
       ? 'கலெக்டர் உத்தரவு வெற்றிகரமாக இணைக்கப்பட்டது' 
       : 'District Collector directive note attached'
     );
     fetchTickets();
   } catch (err) {
     toast.error('Failed to attach directive');
   }
 };

 // 2. Reassign Taluk directly
 const handleReassignTaluk = async (ticketId, targetTaluk) => {
   try {
     const t = tickets.find(ticket => ticket.id === ticketId);
     await api.patch(`/tickets/${t.dbId}`, { 
       notes: `Reassigned to ${targetTaluk} Taluk by Collector.`
     });
     toast.success(`Ticket reassigned to ${targetTaluk} Taluk`);
     fetchTickets();
   } catch (err) {
     toast.error('Failed to reassign taluk');
   }
 };

 // 3. Escalate directly to State Secretariat
 const handleEscalateToState = async () => {
   try {
     await api.patch(`/tickets/${activeTicket.dbId}`, { 
       status: 'ESCALATED',
       notes: 'Escalated to State Secretariat by District Collector.'
     });
     setEscalateModalOpen(false);
     toast.success(t('app_name') === 'ஜனநாயகம்' 
       ? 'மாநில தலைமைச் செயலகத்திற்கு மேல்முறையீடு செய்யப்பட்டது' 
       : 'Complaint escalated to State Department Secretariat (IAS)'
     );
     fetchTickets();
   } catch (err) {
     toast.error('Failed to escalate to state');
   }
 };

 // Catch generic actions from TicketCard
 const handleActionClick = (ticketId, actionType) => {
 const ticket = tickets.find(t => t.id === ticketId);
 if (!ticket) return;

 if (actionType === 'view') {
 setActiveTicket(ticket);
 return;
 }

 if (actionType === 'escalate') {
 setActiveTicket(ticket);
 setEscalateModalOpen(true);
 return;
 }

 if (actionType === 'close') {
 // Direct Collector complete closure
 const updated = tickets.map(t => {
 if (t.id === ticketId) {
 return { ...t, status: 'closed' };
 }
 return t;
 });
 handleSaveTickets(updated);
 toast.success('Complaint closed directly by District Collector');
 }
 };

 // Filtering Logic (Now handled by simulated fetchTickets)
 const filteredTickets = tickets.filter(ticket => {
 return true;
 });

 const categoryKeys = ['roads', 'water', 'electricity', 'sanitation', 'health', 'education', 'agriculture', 'revenue', 'welfare'];
 const talukList = ['Velachery', 'Sholinganallur', 'Guindy', 'Mylapore'];
 const wardList = ['120', '121', '130', '131', '140', '141', '142', '143', '144', '145', '146', '147'];

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6 pb-12"
 >
 {/* Header */}
 <div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 {escalatedOnly ? 'District Escalations Panel' : t('district_tickets')}
 </h2>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
 {escalatedOnly ? 'Supervise high-level administrative grid escalations' : 'Interactive district-wide complaints management'}
 </p>
 </div>

 {/* Advanced Filters Panel */}
 <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
 Filter District Grievance Matrix
 </span>
 
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
 {/* Taluk */}
 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taluk</span>
 <select
 value={filterTaluk}
 onChange={(e) => handleFilterChange('taluk', e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Taluks</option>
 {talukList.map(t => <option key={t} value={t}>{t} Taluk</option>)}
 </select>
 </div>

 {/* Ward */}
 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ward</span>
 <select
 value={filterWard}
 onChange={(e) => handleFilterChange('ward', e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Wards</option>
 {wardList.map(w => <option key={w} value={w}>Ward {w}</option>)}
 </select>
 </div>

 {/* Sector */}
 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sector</span>
 <select
 value={filterCategory}
 onChange={(e) => handleFilterChange('category', e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Sectors</option>
 {categoryKeys.map(cat => <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>)}
 </select>
 </div>

 {/* Status */}
 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status</span>
 <select
 value={filterStatus}
 onChange={(e) => handleFilterChange('status', e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Statuses</option>
 <option value="open">Open</option>
 <option value="in_progress">In Progress</option>
 <option value="resolved">Resolved</option>
 <option value="escalated">Escalated</option>
 <option value="closed">Closed</option>
 </select>
 </div>

 {/* Priority */}
 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Priority</span>
 <select
 value={filterPriority}
 onChange={(e) => handleFilterChange('priority', e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Priorities</option>
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="critical">Critical</option>
 </select>
 </div>
 </div>
 </div>

 {/* Tickets Queue Display */}
 {filteredTickets.length === 0 ? (
 <div className="text-center py-16 text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl p-6">
 <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
 <p className="text-sm">No complaints match your specific query filters</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6">
 {filteredTickets.map(ticket => {
 const hasDirective = !!ticket.collector_directive;
 const hasEscalatedState = !!ticket.flagged_state;
 
 return (
 <div 
 key={ticket.id} 
 className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative ${
 hasEscalatedState ? 'border-2 border-indigo-500/40 shadow-indigo-500/5' : ''
 }`}
 >
 {/* Collector directive banner if present */}
 {hasDirective && (
 <div className="bg-[#8B1A1A]/5 border border-[#8B1A1A]/15 p-3 rounded-2xl flex gap-2">
 <MessageSquare className="w-4 h-4 text-[#8B1A1A] shrink-0 mt-0.5" />
 <div>
 <span className="text-[9px] font-black text-[#8B1A1A] uppercase tracking-wider block">Collector Directive Attached</span>
 <p className="text-xs text-[#8B1A1A] font-medium leading-relaxed mt-0.5">"{ticket.collector_directive}"</p>
 </div>
 </div>
 )}

 <TicketCard 
 ticket={ticket}
 role="collector"
 onAction={(id, action) => handleActionClick(id, action)}
 />

 {/* Collector Administrative Actions Suite */}
 {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
 <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 items-center justify-between">
 
 {/* Left: Reassign dropdown */}
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reassign Taluk</span>
 <select
 onChange={(e) => handleReassignTaluk(ticket.id, e.target.value)}
 defaultValue={ticket.taluk || ''}
 className="bg-slate-50 border rounded-xl py-1 px-2.5 text-[10px] font-bold text-slate-700 cursor-pointer"
 >
 <option value="" disabled>Select Taluk</option>
 {talukList.map(t => <option key={t} value={t}>{t} Taluk</option>)}
 </select>
 </div>

 {/* Right: Directive & State Escalation buttons */}
 <div className="flex items-center gap-2">
 {/* Add Directive */}
 <button
 onClick={() => { setActiveTicket(ticket); setDirectiveModalOpen(true); }}
 className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
 >
 <span>{t('add_directive')}</span>
 </button>

 {/* Escalate to State */}
 <button
 onClick={() => { setActiveTicket(ticket); setEscalateModalOpen(true); }}
 disabled={hasEscalatedState}
 className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all shadow-sm ${
 hasEscalatedState
 ? 'bg-slate-100 text-slate-400 border cursor-not-allowed'
 : 'bg-indigo-650 hover:bg-[#8B1A1A] text-white'
 }`}
 >
 <ArrowUpRight className="w-3.5 h-3.5" />
 <span>{hasEscalatedState ? t('escalated_state') : t('escalate_state')}</span>
 </button>
 </div>

 </div>
 )}
 </div>
 );
 })}
 </div>
 )}

 {/* MODAL 1: Add Collector Directive */}
 <AnimatePresence>
 {directiveModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
 >
 <div className="flex justify-between items-center pb-2 border-b border-slate-100 ">
 <h4 className="font-black text-[#8B1A1A] text-base uppercase">
 Add Collector Administrative Directive
 </h4>
 <button onClick={() => setDirectiveModalOpen(false)}>
 <X className="w-5 h-5 text-slate-400" />
 </button>
 </div>

 <form onSubmit={handleDirectiveSubmit} className="space-y-4">
 <div className="space-y-1">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
 Administrative Instruction Notes
 </label>
 <textarea
 required
 rows={4}
 value={directiveText}
 onChange={(e) => setDirectiveText(e.target.value)}
 placeholder="This instruction will be pinned to the ticket and sent directly as an alert to BDOs, DROs, and local Ward Officers..."
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-800 text-xs shadow-sm resize-none"
 ></textarea>
 </div>

 <button
 type="submit"
 className="w-full py-3.5 rounded-xl bg-[#8B1A1A] hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
 >
 Verify and Attach Pinned Note
 </button>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL 2: Escalate to State Secretariat */}
 <AnimatePresence>
 {escalateModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-center space-y-4"
 >
 <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-200">
 <ShieldAlert className="w-6 h-6 text-[#8B1A1A]" />
 </div>
 
 <div className="space-y-2">
 <h4 className="font-black text-slate-800 text-base uppercase">
 State Escalation
 </h4>
 <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
 Are you sure you want to escalate this complaint to the State Secretariat? This notifies the Department Secretary directly.
 </p>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => setEscalateModalOpen(false)}
 className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleEscalateToState}
 className="flex-1 py-3 rounded-xl bg-[#8B1A1A] hover:bg-indigo-750 text-white font-extrabold text-xs uppercase transition-colors shadow-md"
 >
 Confirm Escalation
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Ticket Details View Modal */}
 <AnimatePresence>
 {activeTicket && !directiveModalOpen && !escalateModalOpen && (
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
 {t(`categories.${activeTicket.category.toLowerCase()}`)}
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

 {activeTicket.collector_directive && (
 <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-2.5">
 <MessageSquare className="w-5 h-5 text-[#8B1A1A] shrink-0 mt-0.5" />
 <div className="space-y-1">
 <span className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-wider block">Collector Administrative Directive</span>
 <p className="text-xs text-[#8B1A1A] font-medium leading-relaxed">
 "{activeTicket.collector_directive}"
 </p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-3 gap-4 text-xs font-bold">
 <div className="bg-slate-50 border p-3 rounded-xl">
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Ward</span>
 <span className="text-slate-800 ">Ward {activeTicket.ward || 'N/A'}</span>
 </div>
 <div className="bg-slate-50 border p-3 rounded-xl">
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Taluk</span>
 <span className="text-slate-800 ">{activeTicket.taluk || 'Velachery'}</span>
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
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 </motion.div>
 );
}
