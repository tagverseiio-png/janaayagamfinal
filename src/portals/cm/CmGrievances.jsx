import React from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Building, 
  PieChart as PieChartIcon, ArrowDownToLine 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import grievancesData from '../../mock/cm/grievances.json';

export default function CmGrievances() {
  const { kpis, departments, categoryMix, inflowChannels } = grievancesData;

  const getRateColor = (rate) => {
    if (rate < 70) return 'text-rose-600';
    if (rate <= 80) return 'text-amber-500';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <header>
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
          Citizen Voice
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-[#8B1A1A]" />
          Grievance Resolution Center
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Live tracking across CM Helpline 1100, Ungaludan Stalin, e-Sevai and social monitoring.
        </p>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-rose-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-rose-50 rounded-xl">
            <FileText className="w-6 h-6 text-rose-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Open Tickets</div>
          <div className="text-4xl font-black text-rose-600">{kpis.openTickets.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Resolved 30D</div>
          <div className="text-4xl font-black text-emerald-600">{kpis.resolved30D.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-rose-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-rose-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">SLA Breaches</div>
          <div className="text-4xl font-black text-rose-600">{kpis.slaBreaches.toLocaleString()}</div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DEPARTMENT DRILLDOWN */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <Building className="w-5 h-5 text-[#8B1A1A]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Department Drilldown</p>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Performance by Department</h2>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="py-4 px-6 font-semibold">Department</th>
                  <th className="py-4 px-6 font-semibold text-right">Open</th>
                  <th className="py-4 px-6 font-semibold text-right">Resolved 30D</th>
                  <th className="py-4 px-6 font-semibold text-right">SLA Breaches</th>
                  <th className="py-4 px-6 font-semibold text-center">Rate (%)</th>
                  <th className="py-4 px-6 font-semibold text-right">Avg Hrs</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {departments.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-6 text-right font-mono font-medium">{d.open.toLocaleString()}</td>
                    <td className="py-3 px-6 text-right font-mono font-medium text-emerald-600">{d.resolved30D.toLocaleString()}</td>
                    <td className="py-3 px-6 text-right font-mono font-bold text-rose-500">{d.slaBreaches}</td>
                    <td className="py-3 px-6 text-center font-mono font-black">
                      <span className={getRateColor(d.rate)}>{d.rate}%</span>
                    </td>
                    <td className="py-3 px-6 text-right font-mono font-medium text-slate-600">{d.avgHrs}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CATEGORY MIX */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <PieChartIcon className="w-5 h-5 text-[#8B1A1A]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">By Type</p>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Category Mix</h2>
            </div>
          </div>
          <div className="p-6 h-[250px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {categoryMix.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-600 truncate group-hover:text-slate-900 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <ArrowDownToLine className="w-5 h-5 text-[#8B1A1A]" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Inflow Channels</p>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Where Citizens Reach Us</h2>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {inflowChannels.map(channel => (
            <div key={channel.id} className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {channel.name}
              </div>
              <div className="text-3xl font-black text-slate-800 font-mono">
                {channel.pct}%
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                  style={{ width: `${channel.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
