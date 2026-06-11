import React, { useState } from 'react';
import { Clock, AlertTriangle, ArrowDown, FileDown, Search, Filter, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgingQueue({ tickets = [], jurisdiction = {}, role = '' }) {
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Helper to calculate priority weight
  const getPriorityWeight = (priority = '') => {
    const p = priority.toUpperCase();
    if (p === 'CRITICAL') return 5;
    if (p === 'HIGH') return 3;
    if (p === 'MEDIUM') return 2;
    if (p === 'LOW') return 1;
    return 1;
  };

  // 2. Helper to calculate days open
  const getDaysOpen = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 3. Process and rank tickets
  const rankedTickets = tickets
    .filter(t => !['RESOLVED', 'CLOSED'].includes(t.status?.toUpperCase()))
    .map(t => {
      const daysOpen = getDaysOpen(t.createdAt);
      const priorityWeight = getPriorityWeight(t.priority);
      const claims = t.claimCount || 0;
      // Aging score formula: days open * priority weight * (claims + 1 to prevent 0 factor)
      const agingScore = daysOpen * priorityWeight * (claims + 1);

      return {
        ...t,
        daysOpen,
        agingScore,
      };
    })
    .sort((a, b) => b.agingScore - a.agingScore);

  // 4. Apply Filters
  const filteredTickets = rankedTickets.filter(t => {
    const matchesPriority = filterPriority === 'All' || t.priority?.toUpperCase() === filterPriority.toUpperCase();
    const matchesCategory = filterCategory === 'All' || t.categoryName?.toUpperCase().includes(filterCategory.toUpperCase()) || t.category?.toUpperCase().includes(filterCategory.toUpperCase());
    const matchesSearch = t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.district?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesCategory && matchesSearch;
  });

  // 5. Determine Color Band and Animations based on age
  const getAgeBand = (days) => {
    if (days > 30) {
      return {
        bg: 'bg-red-50 hover:bg-red-100/70 border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-200 text-red-900 border-red-300 animate-pulse',
        label: '>30 Days Critical Delay',
      };
    }
    if (days >= 7) {
      return {
        bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-150 text-amber-900 border-amber-300',
        label: '7-30 Days Delay',
      };
    }
    return {
      bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-200 text-emerald-900 border-emerald-300',
      label: 'New (<7 Days)',
    };
  };

  const handleExport = (type) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Ticket ID,Category,Days Open,Priority,Claims,Aging Score,Status"].join(",") + "\n"
      + filteredTickets.map(t => `${t.ticketNumber},${t.categoryName || t.category},${t.daysOpen},${t.priority},${t.claimCount},${t.agingScore},${t.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JanaNayagam_Aging_Grievances_${type.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-full overflow-hidden">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-700">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
              Aging Queue & Delays
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
              Grievance Hall of Shame (Worst-First)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 shrink-0">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search pending complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-250 outline-none rounded-xl focus:border-[#8B1A1A] transition-all"
          />
        </div>
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-250 outline-none rounded-xl cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-250 outline-none rounded-xl cursor-pointer"
          >
            <option value="All">All Sectors</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water">Water</option>
            <option value="Roads">PWD / Roads</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-black text-slate-400 text-sm uppercase">No Delayed Grievances</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1">All pending tickets are within normal compliance limits.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const band = getAgeBand(ticket.daysOpen);
            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${band.bg}`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-xs text-slate-800">{ticket.ticketNumber || ticket.id}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${band.badge}`}>
                      {band.label}
                    </span>
                    <span className="text-[9px] font-black uppercase bg-white/75 border border-slate-200 text-slate-655 px-2 py-0.5 rounded-full">
                      {ticket.categoryName || ticket.category || 'Grievance'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-normal line-clamp-2 pr-4">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase pt-1">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-[#8B1A1A]" /> {ticket.district || ticket.ward}</span>
                    <span>•</span>
                    <span>Claims: <strong className="text-slate-700">{ticket.claimCount || 0}</strong></span>
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0 shrink-0">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Aging Score</span>
                    <span className="text-lg font-black text-slate-850 font-mono flex items-center gap-0.5 justify-end">
                      {ticket.agingScore} <ArrowDown className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">DAYS DELAYED</span>
                    <strong className={`font-mono text-sm ${band.text}`}>{ticket.daysOpen} Days</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
