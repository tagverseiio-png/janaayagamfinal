import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DEPT_HIERARCHY, normalizeDept, getCurrentStep, getProgressPercent } from '../../data/hierarchyData';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function TrackTicket() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const initialTicketId = location.state?.ticketId || '';
  
  const [ticketId, setTicketId] = useState(initialTicketId);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTicketId) {
      searchTicket(initialTicketId);
    }
  }, [initialTicketId]);

  const searchTicket = async (searchId = ticketId) => {
    try {
      const res = await api.get('/tickets');
      const allTickets = res.data;
      
      const found = allTickets.find(t => 
        t.ticketNumber.toLowerCase() === searchId.toLowerCase() || 
        t.ticketNumber.toLowerCase() === searchId.replace(/^JN-?/i, '').toLowerCase() ||
        t.id.toLowerCase() === searchId.toLowerCase()
      );

      if (found) {
        setTicket({
          ...found,
          id: found.ticketNumber,
          category: found.department?.name || 'Unknown',
          district: found.jurisdiction?.name || 'Unknown'
        });
        setError('');
      } else {
        setError('Ticket not found. Check your Ticket ID.');
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Error fetching ticket data.');
    }
  };

  const deptKey = ticket ? (ticket.categoryName || (typeof ticket.category === 'string' ? ticket.category : ticket.category?.name) || 'Water') : null;
  const hierarchy = ticket ? DEPT_HIERARCHY[normalizeDept(deptKey)] : [];
  const assignedToRole = ticket?.assignedTo ? (typeof ticket.assignedTo === 'string' ? ticket.assignedTo : ticket.assignedTo.role) : null;
  const currentStep = ticket ? getCurrentStep(deptKey, assignedToRole) : 0;
  const progress = ticket ? getProgressPercent(deptKey, assignedToRole) : 0;

  const statusColor = { Open: 'bg-yellow-100 text-yellow-700', 'In Progress': 'bg-blue-100 text-blue-700', Escalated: 'bg-red-100 text-red-700', Resolved: 'bg-green-100 text-green-700' };
  const priorityColor = { Critical: 'text-red-600', High: 'text-orange-500', Medium: 'text-yellow-600', Low: 'text-green-600' };

  return (
    <div className="min-h-screen bg-[#F0EBE3] p-4">
      <div className="max-w-2xl mx-auto pb-20">

        {/* Back Button */}
        <div className="mt-4 mb-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#8B1A1A] font-extrabold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back', 'Back')}
          </button>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4 mt-4">
          <h2 className="text-[#8B1A1A] font-extrabold text-lg tracking-widest mb-1 uppercase">{t('trackComplaint')}</h2>
          <p className="text-slate-500 text-xs mb-4">{t('enterTicketId')}</p>
          <div className="flex gap-2">
            <input
              value={ticketId}
              onChange={e => setTicketId(e.target.value)}
              placeholder="e.g. JN-1001"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#FF6600]"
              onKeyDown={e => e.key === 'Enter' && searchTicket()}
            />
            <button
              onClick={() => searchTicket()}
              className="bg-gradient-to-r from-[#003366] to-[#0055aa] text-white px-5 py-3 rounded-xl font-bold text-sm hover:from-[#FF6600] hover:to-[#ff802b] transition-all"
            >
              Track →
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {ticket && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Ticket Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8B1A1A]"></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-400 font-bold tracking-widest">TICKET ID</p>
                  <p className="text-[#8B1A1A] font-extrabold text-xl">{ticket.id}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColor[ticket.status] || 'bg-slate-100 text-slate-700'}`}>
                  {ticket.status}
                </span>
              </div>

              <p className="text-slate-700 font-semibold text-sm mb-1">{ticket.description}</p>
              <p className="text-slate-400 text-xs mb-3">{ticket.jurisdictionName || ticket.district}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="text-slate-700 font-bold text-sm">{ticket.category}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Priority</p>
                  <p className={`font-bold text-sm capitalize ${priorityColor[ticket.priority] || 'text-slate-700'}`}>{ticket.priority}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Filed On</p>
                  <p className="text-slate-700 font-bold text-sm">{new Date(ticket.createdAt || ticket.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold">Tracking Completion Status</span>
                  <span className="font-black text-[#8B1A1A]">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#8B1A1A] h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {ticket.status !== 'Resolved' && ticket.status !== 'resolved' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                  <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest">⏰ SLA DEADLINE</p>
                  <p className="text-amber-900 font-extrabold text-sm mt-0.5">
                    {new Date(ticket.slaDeadline || ticket.sla_deadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              {(ticket.status === 'Resolved' || ticket.status === 'resolved') && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-4">
                  <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">✅ ISSUE RESOLVED</p>
                  <p className="text-emerald-900 font-extrabold text-sm mt-0.5">
                    Resolved on {new Date(ticket.resolvedAt || ticket.resolved_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Hierarchy Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
              <p className="text-[10px] text-slate-400 font-black tracking-widest mb-6 border-b pb-2 uppercase">
                OFFICIAL {normalizeDept(deptKey)} DEPARTMENT PIPELINE
              </p>

              <div className="relative">
                {hierarchy.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  const isPending = idx > currentStep;

                  return (
                    <div key={idx} className="flex gap-3 mb-0 relative">
                      {/* Step indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 z-10 transition-colors
                          ${isDone ? 'bg-[#10B981] border-[#10B981] text-white shadow-md' : ''}
                          ${isCurrent ? 'bg-white border-[#FF6600] text-[#FF6600] animate-pulse shadow-md' : ''}
                          ${isPending ? 'bg-slate-50 border-slate-200 text-slate-400' : ''}
                        `}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        {idx < hierarchy.length - 1 && (
                          <div className={`w-0.5 h-full absolute top-8 left-4 -ml-[0.5px] ${isDone ? 'bg-[#10B981]' : 'border-l-[2px] border-dotted border-slate-300 bg-transparent'}`} />
                        )}
                      </div>

                      {/* Step content */}
                      <div className={`flex-1 pb-6 pl-2 ${isPending ? 'opacity-50' : ''}`}>
                        <div className={`rounded-xl p-3.5 border transition-all ${isCurrent ? 'border-[#FF6600] bg-orange-50/50 shadow-sm' : 'border-slate-100 bg-slate-50/50'}`}>
                          <p className={`font-black text-sm uppercase tracking-wide flex items-center gap-2 ${isCurrent ? 'text-[#FF6600]' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                            {step.role === 'Citizen' ? 'Citizen (You)' : step.role}
                            {isCurrent && <span className="text-[9px] bg-[#FF6600] text-white px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">CURRENT</span>}
                          </p>
                          <p className="text-slate-500 font-medium text-xs mt-1">{step.label}</p>
                          {isDone && ticket.timeline && ticket.timeline[idx] && ticket.timeline[idx].completedAt && (
                            <p className="text-emerald-600 text-[10px] font-bold mt-2 uppercase tracking-wide">
                              ✓ Completed {ticket.timeline[idx].completedAt}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Citizen Name */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filed By</p>
                <p className="text-slate-800 font-extrabold text-sm mt-0.5 capitalize">{ticket.citizenName || ticket.citizen_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currently With</p>
                <p className="text-[#8B1A1A] font-extrabold text-sm mt-0.5 capitalize">
                  {ticket.assignedTo ? (typeof ticket.assignedTo === 'string' ? ticket.assignedTo : ticket.assignedTo.name || ticket.assignedTo.role) : 'Unassigned'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
