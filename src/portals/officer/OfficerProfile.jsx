import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, MapPin, Phone, Briefcase, ChevronLeft, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { officers, tickets } from '../../mock';
import TicketCard from '../../shared/components/TicketCard';

export default function OfficerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [officerTickets, setOfficerTickets] = useState([]);

  useEffect(() => {
    const found = officers.find(o => o.id === id);
    if (found) {
      setOfficer(found);
      const ot = tickets.filter(t => t.assignedOfficerId === id);
      setOfficerTickets(ot);
    }
  }, [id]);

  if (!officer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0055aa] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Officer Profile...</p>
      </div>
    );
  }

  const resolved = officerTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const inProgress = officerTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const escalated = officerTickets.filter(t => t.status === 'ESCALATED').length;
  const resolutionRate = officerTickets.length > 0 ? Math.round((resolved / officerTickets.length) * 100) : 0;
  const escalationRate = officerTickets.length > 0 ? Math.round((escalated / officerTickets.length) * 100) : 0;
  
  const performanceRating = resolutionRate > 80 ? 'Excellent' : resolutionRate > 60 ? 'Good' : 'Needs Improvement';
  const performanceColor = resolutionRate > 80 ? 'text-emerald-600 bg-emerald-50' : resolutionRate > 60 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <div className="bg-[#0055aa] text-white p-6 sticky top-0 z-30 shadow-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors -ml-3 mb-4 cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-[#0055aa]" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{officer.name}</h1>
            <div className="flex items-center gap-2 text-white/80 mt-1 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>{officer.role}</span>
              <span className="opacity-50">•</span>
              <Briefcase className="w-4 h-4" />
              <span>{officer.departmentId}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 mt-1 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Jurisdiction: {officer.jurisdictionId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Activity className="w-4 h-4" /> Total Cases
            </div>
            <div className="text-2xl font-black text-slate-800">{officerTickets.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Resolution Rate
            </div>
            <div className="text-2xl font-black text-emerald-600">{resolutionRate}%</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Escalation Rate
            </div>
            <div className="text-2xl font-black text-rose-600">{escalationRate}%</div>
          </div>
          <div className={`p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between ${performanceColor}`}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              Performance Rating
            </div>
            <div className="text-xl font-black">{performanceRating}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Current Workload
          </h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-500">{inProgress}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-500">{resolved}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-500">{escalated}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Escalated</div>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            Recent Tickets
          </h3>
          <div className="space-y-4">
            {officerTickets.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 font-medium">
                No tickets assigned to this officer.
              </div>
            ) : (
              officerTickets.slice(0, 10).map(t => (
                <TicketCard 
                  key={t.id} 
                  ticket={t} 
                  onAction={() => {}} 
                  role="Officer" 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
