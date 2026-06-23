import React, { useMemo } from 'react';
import { 
  Users, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import ministersData from '../../mock/cm/ministers.json';

export default function CmMinisters() {
  
  // Sort ministers by KPI score descending
  const rankedMinisters = useMemo(() => {
    return [...ministersData].sort((a, b) => b.kpiScore - a.kpiScore);
  }, []);

  const getGradeStyle = (grade) => {
    if (grade === 'A+') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (grade === 'A') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (grade === 'B') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-rose-500" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const getGradientForScore = (score) => {
    if (score >= 85) return 'from-amber-400 to-emerald-500';
    if (score >= 75) return 'from-rose-400 to-amber-500';
    return 'from-rose-600 to-rose-400';
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <header>
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
          Cabinet Accountability
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Users className="w-8 h-8 text-[#8B1A1A]" />
          Ministerial Scorecard
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Measured on file disposal, scheme execution, field presence and citizen satisfaction in owned portfolios.
        </p>
      </header>

      {/* MINISTER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedMinisters.map((m, idx) => {
          const rank = idx + 1;
          const isTop = rank === 1;

          return (
            <div 
              key={m.id} 
              className={`bg-white shadow-sm rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-md ${
                isTop ? 'border-2 border-rose-500' : 'border border-slate-200'
              }`}
            >
              {/* Top Row: Rank & Grade */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    isTop ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{rank}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</div>
                    <h2 className="text-base font-black text-slate-900 truncate max-w-[150px]">{m.name}</h2>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-black border ${getGradeStyle(m.grade)}`}>
                  {m.grade}
                </div>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-6 truncate">
                Hon. Minister - {m.portfolio}
              </div>

              {/* KPI Score */}
              <div className="flex items-end gap-2 mb-3">
                <div className="text-4xl font-black text-slate-800 tracking-tight">{m.kpiScore}</div>
                <div className="text-xs font-bold text-slate-400 mb-1">/100 KPI</div>
                <div className="ml-auto mb-1">
                  {getTrendIcon(m.trend)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getGradientForScore(m.kpiScore)}`}
                  style={{ width: `${m.kpiScore}%` }}
                />
              </div>

              {/* 2x2 Stat Grid */}
              <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-white p-3">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cleared</div>
                  <div className="text-lg font-black text-slate-800">{m.cleared.toLocaleString()}</div>
                </div>
                <div className="bg-white p-3">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending</div>
                  <div className={`text-lg font-black ${m.pending > 300 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {m.pending.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-3">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Field Visits</div>
                  <div className="text-lg font-black text-slate-800">{m.fieldVisits}<span className="text-xs text-slate-400">/mo</span></div>
                </div>
                <div className="bg-white p-3">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Schemes</div>
                  <div className="text-lg font-black text-slate-800">{m.schemes}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
