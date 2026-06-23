import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Search, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { TN_CONSTITUENCIES, TN_DISTRICTS } from '../../data/constituencies';
import { ticketService } from '../../services/ticketService';
import { getScopeFilter } from '../../services/scope';
import { departments as deptData, wards as wardData } from '../../mock';

export default function ConstituencyMatrix() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [expandedAC, setExpandedAC] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const rawTickets = await ticketService.getTickets(getScopeFilter({ role: 'CM' }));
        
        // Enrich tickets with department and constituency mappings
        const formatted = rawTickets.map(t => {
          const dept = deptData.find(d => d.id === t.departmentId);
          const ward = wardData.find(w => w.id === t.wardId);
          
          let constituencyName = '';
          if (ward && ward.constituencyId) {
            // e.g. "25-Mylapore" -> "Mylapore"
            const parts = ward.constituencyId.split('-');
            constituencyName = parts.length > 1 ? parts[1] : ward.constituencyId;
          }

          return {
            ...t,
            department: { name: dept ? dept.name : t.departmentId },
            ward: constituencyName, // Map to constituency name so existing grouping logic works
            jurisdiction: { name: constituencyName }
          };
        });

        setTickets(formatted);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch tickets for constituency matrix', err);
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Activity className="w-8 h-8 animate-spin text-[#8B1A1A]" /></div>;

  // Process data for the 234 constituencies
  const matrixData = TN_CONSTITUENCIES.map(ac => {
    // We'll loosely match ticket ward/jurisdiction to the AC name or district
    // In a real system, the ticket would explicitly have an `assemblyConstituency` field.
    // For now, we'll map any ticket whose jurisdiction string includes the AC name.
    const acTickets = tickets.filter(t => 
      (t.ward && t.ward.includes(ac.name)) || 
      (t.jurisdiction?.name && t.jurisdiction.name.includes(ac.name))
    );

    const total = acTickets.length;
    const resolved = acTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const pending = total - resolved;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Department breakdown
    const deptBreakdown = {};
    acTickets.forEach(t => {
      const deptName = t.department?.name || 'Unassigned';
      if (!deptBreakdown[deptName]) {
        deptBreakdown[deptName] = { pending: 0, resolved: 0 };
      }
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        deptBreakdown[deptName].resolved += 1;
      } else {
        deptBreakdown[deptName].pending += 1;
      }
    });

    return {
      ...ac,
      total,
      resolved,
      pending,
      rate,
      deptBreakdown
    };
  });

  // Filter
  const filteredData = matrixData.filter(ac => {
    const matchesDistrict = districtFilter === 'All' || ac.district === districtFilter;
    const matchesSearch = ac.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ac.acNo.toString() === searchQuery;
    return matchesDistrict && matchesSearch;
  });

  const toggleRow = (acNo) => {
    setExpandedAC(expandedAC === acNo ? null : acNo);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Map className="w-5 h-5 text-[#8B1A1A]" /> Assembly Constituency Matrix
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Zero-Exclusion 234 Constituency Grievance Mapping
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none cursor-pointer"
            >
              <option value="All">All Districts</option>
              {TN_DISTRICTS.sort().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search AC Name or No..." 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#8B1A1A]"
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4">AC No.</th>
                <th className="p-4">Constituency</th>
                <th className="p-4">District</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-center">Pending <span className="text-red-500">●</span></th>
                <th className="p-4 text-center">Resolved <span className="text-emerald-500">●</span></th>
                <th className="p-4 w-48">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700">
              {filteredData.map(ac => (
                <React.Fragment key={ac.acNo}>
                  <tr 
                    onClick={() => toggleRow(ac.acNo)}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${expandedAC === ac.acNo ? 'bg-slate-50' : ''}`}
                  >
                    <td className="p-4 text-slate-400">
                      {expandedAC === ac.acNo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{ac.acNo}</td>
                    <td className="p-4 font-black">{ac.name}</td>
                    <td className="p-4 text-slate-500">{ac.district}</td>
                    <td className="p-4 text-center font-mono">{ac.total}</td>
                    <td className="p-4 text-center font-mono text-red-600">{ac.pending}</td>
                    <td className="p-4 text-center font-mono text-emerald-600">{ac.resolved}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-right">{ac.rate}%</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                           {ac.total > 0 && (
                             <>
                               <div className="h-full bg-emerald-500" style={{ width: `${ac.rate}%` }}></div>
                               <div className="h-full bg-red-500" style={{ width: `${100 - ac.rate}%` }}></div>
                             </>
                           )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* EXPANDED SUB-PANEL (Department Drill-Down) */}
                  <AnimatePresence>
                    {expandedAC === ac.acNo && (
                      <tr className="bg-slate-50/80">
                        <td colSpan="8" className="p-0">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-slate-200"
                          >
                            <div className="p-6 ml-12">
                              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">
                                Departmental Pending Breakdown — {ac.name}
                              </h4>
                              {Object.keys(ac.deptBreakdown).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {Object.entries(ac.deptBreakdown).map(([dept, counts]) => (
                                    <div key={dept} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                      <span className="truncate mr-2" title={dept}>{dept}</span>
                                      <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
                                        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{counts.pending} P</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{counts.resolved} R</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-400 font-bold text-xs">No grievances recorded for this constituency.</div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No constituencies match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
