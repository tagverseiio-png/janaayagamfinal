import React, { useState, useMemo } from 'react';
import { 
  Map, Activity, Shield, TrendingUp, TrendingDown, 
  Search, AlertTriangle, AlertOctagon, CheckCircle
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import districtsData from '../../mock/cm/districts.json';

export default function CmDistricts() {
  const [selectedDistrict, setSelectedDistrict] = useState(
    districtsData.find(d => d.name === 'Chennai') || districtsData[0]
  );
  
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived filtered data for the table
  const filteredData = useMemo(() => {
    let data = [...districtsData];
    
    if (filter !== 'ALL') {
      const statusMap = { 'CRITICAL': 'red', 'WARNING': 'yellow', 'GOOD': 'green' };
      data = data.filter(d => d.status === statusMap[filter]);
    }
    
    if (searchQuery.trim()) {
      data = data.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Sort worst first by default
    return data.sort((a, b) => a.performanceScore - b.performanceScore);
  }, [filter, searchQuery]);

  const getStatusColor = (status) => {
    if (status === 'red') return 'bg-rose-500';
    if (status === 'yellow') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusBgText = (status) => {
    if (status === 'red') return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (status === 'yellow') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* PAGE HEADER */}
      <header>
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
          Administrative Performance
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Map className="w-8 h-8 text-[#8B1A1A]" />
          District Intelligence
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          Live performance, grievances, women safety, scheme reach and collector accountability across all 38 districts.
        </p>
      </header>

      {/* TOP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT: Map */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col h-[500px] relative">
          <MapContainer 
            center={[11.1271, 78.6569]} 
            zoom={7} 
            style={{ height: '100%', width: '100%', background: '#F8FAFC' }} 
            scrollWheelZoom={true}
          >
            {/* Using a light minimal basemap to match Citizen Portal Theme */}
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
              attribution='&copy; CARTO' 
            />
            
            {districtsData.map((d) => (
              <CircleMarker 
                key={d.id} 
                center={[d.lat, d.lng]} 
                radius={d.status === 'red' ? 12 : d.status === 'yellow' ? 9 : 7}
                fillColor={d.status === 'red' ? '#EF4444' : d.status === 'yellow' ? '#F59E0B' : '#10B981'}
                color={selectedDistrict.id === d.id ? '#8B1A1A' : '#ffffff'} 
                weight={selectedDistrict.id === d.id ? 3 : 1.5} 
                fillOpacity={0.9}
                eventHandlers={{
                  click: () => setSelectedDistrict(d)
                }}
              >
                <Popup>
                  <div className="font-sans">
                    <strong className="block text-sm text-slate-800">{d.name}</strong>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Score: {d.performanceScore}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Good</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Watch</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Critical</div>
          </div>
        </div>

        {/* RIGHT: Selected District Detail */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
              {selectedDistrict.name === 'Chennai' ? 'Tamil Nadu Capital' : `${selectedDistrict.region} Region`}
            </div>
            <h2 className="text-3xl font-black text-[#8B1A1A] tracking-tight">{selectedDistrict.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-600">Collector: {selectedDistrict.collector}</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 grid grid-cols-2 gap-x-6 gap-y-8 content-start overflow-y-auto">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Performance</div>
              <div className={`text-3xl font-black ${selectedDistrict.performanceScore < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                {selectedDistrict.performanceScore}<span className="text-base text-slate-400">/100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Satisfaction</div>
              <div className="text-3xl font-black text-emerald-600">
                {selectedDistrict.satisfaction}<span className="text-base text-emerald-600/50">/100</span>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Women Safety</div>
              <div className="text-2xl font-black text-slate-800">
                {selectedDistrict.womenSafety}<span className="text-sm text-slate-400">/100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Scheme Reach</div>
              <div className="text-2xl font-black text-slate-800">
                {selectedDistrict.schemeReach}%
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Open Grievances</div>
              <div className="text-2xl font-black text-slate-800">{selectedDistrict.openGrievances}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Resolved 30D</div>
              <div className="text-2xl font-black text-slate-800">{selectedDistrict.resolved30D.toLocaleString()}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Avg Resolution</div>
              <div className="text-2xl font-black text-slate-800">{selectedDistrict.avgResolution}h</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Singapenne Open</div>
              <div className="text-2xl font-black text-slate-800">{selectedDistrict.singapenneOpen}</div>
            </div>
          </div>

          {selectedDistrict.activeCrisisSignals > 0 ? (
            <div className="m-4 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0 animate-pulse" />
              <div className="text-xs font-bold leading-tight">
                ⚠ {selectedDistrict.activeCrisisSignals} active crisis signal(s). Escalate to collector.
              </div>
            </div>
          ) : (
             <div className="m-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs font-bold leading-tight">
                District parameters nominal. No active crisis signals.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <Activity className="w-5 h-5 text-[#8B1A1A]" />
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
               All Districts · Sorted by Need
             </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all w-64"
              />
            </div>
            
            <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl">
               {['ALL', 'CRITICAL', 'WARNING', 'GOOD'].map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === f 
                       ? 'bg-white shadow-sm text-[#8B1A1A]' 
                       : 'text-slate-500 hover:text-slate-800'
                   }`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">District</th>
                <th className="py-4 px-6 font-semibold">Region</th>
                <th className="py-4 px-6 font-semibold text-center">Score</th>
                <th className="py-4 px-6 font-semibold text-right">Open</th>
                <th className="py-4 px-6 font-semibold text-right">Res. (hrs)</th>
                <th className="py-4 px-6 font-semibold text-center">Women Safety</th>
                <th className="py-4 px-6 font-semibold text-center">Reach (%)</th>
                <th className="py-4 px-6 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {filteredData.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSelectedDistrict(d)}
                  className={`border-b border-slate-100 transition-colors cursor-pointer ${selectedDistrict.id === d.id ? 'bg-[#8B1A1A]/5' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{d.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{d.region}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono font-black">
                      <span className={d.performanceScore < 60 ? 'text-rose-600' : 'text-slate-800'}>
                        {d.performanceScore}
                      </span>
                      {d.performanceScore > 85 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : 
                       d.performanceScore < 60 ? <TrendingDown className="w-3 h-3 text-rose-500" /> : 
                       <TrendingUp className="w-3 h-3 text-slate-400 rotate-45" />}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-medium">{d.openGrievances}</td>
                  <td className="py-4 px-6 text-right font-mono font-medium">{d.avgResolution}</td>
                  <td className="py-4 px-6 text-center font-mono font-medium">{d.womenSafety}</td>
                  <td className="py-4 px-6 text-center font-mono font-medium">{d.schemeReach}</td>
                  <td className="py-4 px-6 text-center">
                     <span className={`inline-block px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getStatusBgText(d.status)}`}>
                       {d.status === 'red' ? 'CRITICAL' : d.status === 'yellow' ? 'WARNING' : 'GOOD'}
                     </span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-bold">No districts found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
