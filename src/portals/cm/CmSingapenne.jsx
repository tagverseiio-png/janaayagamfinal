import React from 'react';
import { 
  Heart, AlertTriangle, AlertOctagon, Clock, Activity, 
  MapPin, BarChart3 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import singapenneData from '../../mock/cm/singapenne.json';

export default function CmSingapenne() {
  const { kpis, districtHotspots, incidentTypes } = singapenneData;

  const renderTrend = (val, suffix = '') => {
    if (val < 0) return <span className="text-emerald-500 font-bold text-sm">↓ {val}{suffix} vs 30d</span>;
    if (val > 0) return <span className="text-rose-500 font-bold text-sm">↑ +{val}{suffix} vs 30d</span>;
    return <span className="text-slate-400 font-bold text-sm">— No change</span>;
  };

  const getPriorityColor = (p) => {
    if (p === 'P1') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'P2') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <header>
        <p className="text-[10px] font-black tracking-widest uppercase text-rose-600 mb-1">
          சிங்கப் பெண்ணே · Singapenne Priority
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-600" />
          Women's Safety War Room
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Real-time women's safety monitoring, P1 response tracking and district-wise incident intelligence.
        </p>
      </header>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-amber-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-amber-50 rounded-xl">
            <Heart className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">State Safety Index</div>
          <div className="flex items-end gap-1">
            <div className="text-4xl font-black text-amber-500">{kpis.stateSafetyIndex}</div>
            <div className="text-sm font-bold text-amber-500/50 mb-1">/100</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-rose-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-rose-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Open Cases</div>
          <div className="text-4xl font-black text-rose-600 mb-2">{kpis.openCases}</div>
          {renderTrend(kpis.openCasesTrend)}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-rose-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-rose-50 rounded-xl">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">P1 Critical</div>
          <div className="text-4xl font-black text-rose-600">{kpis.p1Critical}</div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-200 transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 p-2 bg-emerald-50 rounded-xl">
            <Clock className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Avg Response</div>
          <div className="text-4xl font-black text-emerald-600 mb-2">{kpis.avgResponse} <span className="text-lg text-emerald-600/50">min</span></div>
          {renderTrend(kpis.avgResponseTrend, ' min')}
        </div>
      </div>

      {/* LOWER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DISTRICT HOTSPOTS */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <MapPin className="w-5 h-5 text-[#8B1A1A]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">District Hotspots</p>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Open Cases by District</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {districtHotspots.map((h) => (
                <div key={h.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${getPriorityColor(h.priority)}`}>
                      {h.priority}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{h.district}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{h.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Open</div>
                      <div className="text-lg font-black text-rose-600">{h.openCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Response</div>
                      <div className="text-sm font-bold text-slate-700">{h.responseMin}m</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Score</div>
                      <div className="text-sm font-bold text-slate-700">{h.score}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INCIDENT TYPES CHART */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <BarChart3 className="w-5 h-5 text-[#8B1A1A]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Pattern</p>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Incident Types</h2>
            </div>
          </div>
          <div className="flex-1 p-6 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={incidentTypes} 
                layout="vertical"
                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 700 }}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={24}>
                  {incidentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
