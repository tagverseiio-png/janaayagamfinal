import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LayoutDashboard, CheckCircle2, Clock, AlertCircle, TrendingUp, Send, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export default function VolunteerDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const ward = localStorage.getItem('jn_volunteer_ward') || localStorage.getItem('jn_ward_name') || 'Ward 1';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'escalated' | 'resolved'
  const [escalatingTicket, setEscalatingTicket] = useState(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets?scope=ward');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      toast.error(tLabel('Error fetching ward tickets', 'வார்டு புகார்களைப் பெறுவதில் பிழை'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleEscalateClick = (ticket) => {
    setEscalatingTicket(ticket);
    setEscalationReason('');
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
      toast.error(tLabel('Escalation reason is mandatory', 'மேல்முறையீட்டிற்கான காரணம் கட்டாயமாகும்'));
      return;
    }

    try {
      setSubmitting(true);
      await api.patch(`/tickets/${escalatingTicket.id}`, {
        status: 'ESCALATED',
        notes: escalationReason
      });
      toast.success(tLabel('Ticket escalated successfully!', 'புகார் வெற்றிகரமாக மேல்முறையீடு செய்யப்பட்டது!'));
      setEscalatingTicket(null);
      fetchTickets();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to escalate ticket';
      toast.error(tLabel(errMsg, 'மேல்முறையீடு செய்ய முடியவில்லை'));
    } finally {
      setSubmitting(false);
    }
  };

  // Group tickets
  const openTickets = tickets.filter(t => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status));
  const escalatedTickets = tickets.filter(t => t.status === 'ESCALATED');
  const resolvedTickets = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));

  const stats = [
    { label: tLabel('Ward Open', 'வார்டு திறந்தவை'), value: openTickets.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', tab: 'open' },
    { label: tLabel('Escalated', 'மேல்முறையீடு'), value: escalatedTickets.length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'escalated' },
    { label: tLabel('Resolved', 'தீர்க்கப்பட்டவை'), value: resolvedTickets.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'resolved' }
  ];

  const getActiveList = () => {
    if (activeTab === 'open') return openTickets;
    if (activeTab === 'escalated') return escalatedTickets;
    return resolvedTickets;
  };

  const activeList = getActiveList();

  return (
    <div className="pb-24 min-h-screen bg-slate-50 font-sans selection:bg-[#8B1A1A]/10 selection:text-[#8B1A1A]">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-40 flex items-center gap-3 h-14">
        <button onClick={() => navigate('/citizen')} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
          {tLabel('Volunteer Dashboard', 'தன்னார்வலர் டாஷ்போர்டு')}
        </h2>
      </div>

      <div className="p-4 space-y-5">
        {/* Ward Info */}
        <div 
          className="rounded-3xl p-5 text-white shadow-md relative overflow-hidden select-none"
          style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #A32A2A 100%)' }}
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">{tLabel('Volunteer Jurisdiction', 'தன்னார்வலர் வார்டு')}</p>
              <h3 className="text-lg font-black">{ward}</h3>
            </div>
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/5">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 select-none">
          {stats.map((stat) => (
            <button
              key={stat.tab}
              onClick={() => setActiveTab(stat.tab)}
              className={`rounded-2xl p-3 border transition-all text-left flex flex-col justify-between h-24 bg-white ${
                activeTab === stat.tab 
                  ? 'border-[#8B1A1A] shadow-[0_4px_12px_rgba(139,26,26,0.08)] scale-[1.02]' 
                  : 'border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg w-fit ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="mt-1">
                <p className="text-lg font-black text-slate-800 leading-none">{stat.value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Tickets Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeTab === 'open' && tLabel('Open Ward Issues', 'வார்டு திறந்த புகார்கள்')}
              {activeTab === 'escalated' && tLabel('Escalated Issues', 'மேல்முறையீடு செய்யப்பட்டவை')}
              {activeTab === 'resolved' && tLabel('Resolved Ward Issues', 'தீர்க்கப்பட்ட புகார்கள்')}
            </h4>
            <span className="text-[9px] font-black bg-slate-150 text-slate-500 rounded-full px-2 py-0.5">
              {activeList.length}
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center justify-center space-y-2.5">
              <Loader2 className="w-7 h-7 text-[#8B1A1A] animate-spin" />
              <p className="text-xs font-bold text-slate-450">{tLabel('Loading tickets...', 'புகார்கள் ஏற்றப்படுகின்றன...')}</p>
            </div>
          ) : activeList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-1.5 select-none">
              <CheckCircle2 className="w-10 h-10 text-slate-350 mx-auto" />
              <p className="text-xs font-black text-slate-700">{tLabel('No tickets in this category', 'இந்தப் பிரிவில் புகார்கள் இல்லை')}</p>
              <p className="text-[10px] font-bold text-slate-400">{tLabel('Everything is clean and updated in your ward.', 'உங்கள் வார்டில் அனைத்தும் சரியாக உள்ளன.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeList.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-slate-150/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-200 transition-colors space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-[#8B1A1A] tracking-wider bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {ticket.categoryName}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-sm text-slate-800 leading-snug">
                        {ticket.title}
                      </h5>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                      ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      ticket.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-bold leading-normal">
                    {ticket.description}
                  </p>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-bold select-none">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>

                    {activeTab === 'open' && (
                      <button
                        onClick={() => handleEscalateClick(ticket)}
                        style={{ color: '#8B1A1A' }}
                        className="font-black flex items-center gap-1 hover:underline cursor-pointer border border-[#8B1A1A]/10 bg-[#8B1A1A]/5 rounded-lg px-2.5 py-1 text-[10px] transition-all hover:bg-[#8B1A1A]/10"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{tLabel('Escalate to AE', 'AE-க்கு அனுப்பு')}</span>
                      </button>
                    )}

                    {activeTab === 'escalated' && (
                      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                        <Clock className="w-3 h-3 animate-pulse" />
                        {tLabel('Escalated to Supervisor', 'அதிகாரியின் கவனத்தில்')}
                      </span>
                    )}

                    {activeTab === 'resolved' && (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        {ticket.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Escalation Dialog Modal */}
      {escalatingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100 shrink-0">
                <TrendingUp className="w-5 h-5 text-[#8B1A1A]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {tLabel('Escalate Issue', 'புகாரை மேல்முறையீடு செய்')}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  {tLabel(`Ticket #${escalatingTicket.ticketNumber}`, `புகார் #${escalatingTicket.ticketNumber}`)}
                </p>
              </div>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-0.5">
                  {tLabel('Reason for Escalation (Mandatory)', 'மேல்முறையீட்டுக்கான காரணம் (கட்டாயம்)')}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={3}
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder={tLabel('Explain why this issue needs higher-level intervention...', 'ஏன் இந்த புகாரை மேல் அதிகாரிக்கு அனுப்ப வேண்டும் என்பதை விளக்கவும்...')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalatingTicket(null)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  {tLabel('Cancel', 'ரத்து செய்')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#8B1A1A' }}
                  className="w-full text-white font-extrabold text-xs py-3 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{tLabel('Confirm Escalate', 'உறுதி செய்')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
