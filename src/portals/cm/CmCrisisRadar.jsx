import React from 'react';
import { 
  Radar, AlertTriangle, AlertOctagon, Info
} from 'lucide-react';
import crisisData from '../../mock/cm/crisis.json';

export default function CmCrisisRadar() {
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <header>
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
          Early Warning
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Radar className="w-8 h-8 text-[#8B1A1A]" />
          Crisis Detection Radar
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          AI-fused signals from citizen feedback, field reports, social monitoring and field officer telemetry.
        </p>
      </header>

      {/* CRISIS CARDS LIST */}
      <div className="space-y-4">
        {crisisData.map(c => {
          const isCritical = c.severity === 'CRITICAL';
          
          return (
            <div 
              key={c.id} 
              className={`bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row items-stretch transition-shadow hover:shadow-md border-l-[6px] ${
                isCritical ? 'border-l-rose-500' : 'border-l-amber-500'
              }`}
            >
              {/* LEFT SIDE: Info */}
              <div className="flex-1 p-6 flex gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                  isCritical ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {isCritical ? <AlertOctagon className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.severity}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">·</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{c.category}</span>
                    <span className="text-[10px] font-bold text-slate-400">·</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{c.district}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-800 leading-tight mb-1">{c.title}</h2>
                  <div className="flex items-start gap-1.5 text-sm text-slate-600">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    <span>{c.action}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Mini-stats */}
              <div className="md:w-64 shrink-0 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-4 grid grid-rows-3 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Signal</span>
                  <span className={`font-black font-mono ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>{c.signal}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Source</span>
                  <span className="text-sm font-bold text-slate-700">{c.source}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detected</span>
                  <span className="text-sm font-bold text-slate-700">{c.detectedAgo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
