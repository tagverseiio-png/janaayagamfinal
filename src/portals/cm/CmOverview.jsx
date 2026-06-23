import React from 'react';
import { 
  Bot, TrendingDown, Activity, Building, Award, AlertOctagon,
  AlertTriangle, CheckCircle, TrendingUp, Radar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  statePulse, departments, emergencies, ministers, cmInsights
} from '../../mock/cm';

export default function CmOverview() {
  const navigate = useNavigate();

  const renderScoreDot = (status) => {
    const colors = {
      green: 'bg-emerald-500 shadow-sm',
      yellow: 'bg-amber-500 shadow-sm',
      red: 'bg-rose-500 shadow-sm'
    };
    return <div className={`w-3 h-3 rounded-full ${colors[status] || colors.green}`} />;
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* SECTION 1 — STATE PULSE (wide hero) */}
      <section>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden flex flex-col xl:flex-row gap-8 xl:items-center">
          
          <div className="flex flex-1 items-center gap-8">
            <div className="flex-1 border-r border-slate-100 pr-8">
              <div className="flex items-center gap-2 mb-2 text-[#8B1A1A]">
                <Activity className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Statewide Grievances</span>
              </div>
              <div className="flex items-end gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/cm/grievances')}>
                <div className="text-6xl font-black text-slate-800 tracking-tight">{statePulse.totalGrievancesState.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>{statePulse.prevPct}% vs last month</span>
                </div>
              </div>
            </div>

            <div className="flex-1 border-r border-slate-100 px-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/cm/grievances')}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Resolution</div>
              <div className="text-4xl font-black text-emerald-600">{statePulse.overallResolutionRate}%</div>
            </div>

            <div className="flex-1 px-8">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">District Health Matrix</div>
              <div className="flex gap-4">
                <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 cursor-pointer hover:border-emerald-200" onClick={() => navigate('/cm/districts')}>
                  <div className="text-2xl font-bold text-emerald-600">{statePulse.districtsGreen}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Green</div>
                </div>
                <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 cursor-pointer hover:border-amber-200" onClick={() => navigate('/cm/districts')}>
                  <div className="text-2xl font-bold text-amber-500">{statePulse.districtsYellow}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Yellow</div>
                </div>
                <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 cursor-pointer hover:border-rose-200" onClick={() => navigate('/cm/districts')}>
                  <div className="text-2xl font-bold text-rose-600">{statePulse.districtsRed}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Red</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex xl:flex-col gap-3 border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-8 shrink-0">
             <button 
                onClick={() => navigate('/cm/ai-briefing')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#701515] text-white px-5 py-3 rounded-xl transition-all shadow-sm"
              >
                <Bot className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Generate AI Briefing</span>
              </button>
              <button 
                onClick={() => navigate('/cm/crisis-radar')}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-5 py-3 rounded-xl transition-all shadow-sm"
              >
                <Radar className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">View Crisis Radar</span>
              </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-6">
        {/* SECTION 2 — Department Performance */}
        <section className="col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#8B1A1A] flex items-center gap-2">
            <Building className="w-4 h-4" />
            Department Performance Matrix
          </h2>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                  <th className="py-4 px-5 font-semibold">Department & Minister</th>
                  <th className="py-4 px-5 font-semibold text-right">Volume</th>
                  <th className="py-4 px-5 font-semibold text-right">Resolution</th>
                  <th className="py-4 px-5 font-semibold text-right">Avg Close</th>
                  <th className="py-4 px-5 font-semibold text-right">Escalations</th>
                  <th className="py-4 px-5 font-semibold text-center">Status</th>
                  <th className="py-4 px-5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {departments.map(dept => (
                  <tr key={dept.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{dept.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{dept.minister}</div>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-medium text-slate-600">{dept.total.toLocaleString()}</td>
                    <td className="py-4 px-5 text-right">
                      <span className={`font-mono font-bold ${dept.resolutionPct > 90 ? 'text-emerald-600' : dept.resolutionPct > 80 ? 'text-amber-500' : 'text-rose-600'}`}>
                        {dept.resolutionPct}%
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-medium text-slate-600">{dept.avgClosureHrs}h</td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-rose-500">{dept.escalationPct}%</td>
                    <td className="py-4 px-5 text-center flex justify-center mt-2">
                      {renderScoreDot(dept.status)}
                    </td>
                    <td className="py-4 px-5 text-center">
                       <button 
                         onClick={() => navigate(`/cm/districts?dept=${dept.id}`)}
                         className="text-[9px] font-black uppercase tracking-widest bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1 rounded border border-rose-200 transition-colors"
                       >
                         INTERVENE
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 7 — AI STATE BRIEFING */}
        <section className="col-span-1 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#8B1A1A] flex items-center gap-2">
            <Bot className="w-4 h-4" />
            State Intelligence Briefing
          </h2>
          <div 
            className="bg-gradient-to-br from-[#8B1A1A]/5 to-slate-50 border border-[#8B1A1A]/10 rounded-2xl p-6 relative h-[calc(100%-2rem)] cursor-pointer hover:border-[#8B1A1A]/30 transition-colors"
            onClick={() => navigate('/cm/ai-briefing')}
          >
            <div className="space-y-4 relative z-10">
              {cmInsights.map(insight => (
                <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 shadow-sm">
                  {insight.type === 'critical' ? <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> : 
                   insight.type === 'warning' ? <Activity className="w-5 h-5 text-amber-500 shrink-0" /> : 
                   <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* SECTION 4 — Cabinet Rankings */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#8B1A1A] flex items-center gap-2">
            <Award className="w-4 h-4" />
            Cabinet Performance (Ministers)
          </h2>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-2 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => navigate('/cm/ministers')}>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold rounded-tl-lg">Minister</th>
                  <th className="py-3 px-4 text-center font-semibold">Dept Score</th>
                  <th className="py-3 px-4 text-right font-semibold">Escalated to CM</th>
                  <th className="py-3 px-4 text-center font-semibold rounded-tr-lg">Trend</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {ministers.sort((a,b) => b.deptScore - a.deptScore).map(m => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-500">{m.department}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[#8B1A1A] font-bold">{m.deptScore}/100</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">{m.escalationsToCm}</td>
                    <td className="py-3 px-4 text-center">
                      {m.performanceTrend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500 inline" /> :
                       m.performanceTrend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-500 inline" /> :
                       <TrendingUp className="w-4 h-4 text-slate-400 inline rotate-45" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6 — Emergency State Desk */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#8B1A1A] flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            Active State Emergencies
          </h2>
          <div className="space-y-3">
            {emergencies.map(em => (
              <div 
                key={em.id} 
                onClick={() => navigate('/cm/crisis-radar')}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex gap-4 items-center cursor-pointer hover:border-rose-200 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest animate-pulse border border-rose-200">
                      {em.status}
                    </span>
                    {em.crossDept && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-amber-200">Cross-Dept</span>}
                    <span className="text-[10px] font-mono font-bold text-slate-400">{em.pendingHrs}h pending</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{em.type} — {em.district}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{em.department} Dept · {em.locality}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-rose-500">{em.citizensAffected.toLocaleString()}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Affected</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
