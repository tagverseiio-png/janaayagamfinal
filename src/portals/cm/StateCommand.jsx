import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle, Clock, TrendingUp, Grid, BarChart3, AlertOctagon, ChevronRight, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import StatCard from '../../shared/components/StatCard';
import api from '../../services/api';
import { TN_CONSTITUENCIES } from '../../data/constituencies';

const DISTRICT_COORDS = {
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
  'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  'Dindigul': { lat: 10.3624, lng: 77.9695 },
  'Thoothukudi': { lat: 8.7642, lng: 78.1348 },
  'Tiruppur': { lat: 11.1085, lng: 77.3411 },
  'Tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'Tiruvarur': { lat: 10.7726, lng: 79.6368 },
  'Villupuram': { lat: 11.9401, lng: 79.4861 },
  'Cuddalore': { lat: 11.7480, lng: 79.7714 },
  'Kanniyakumari': { lat: 8.0883, lng: 77.5385 },
  'Theni': { lat: 10.0104, lng: 77.4768 },
  'Namakkal': { lat: 11.2189, lng: 78.1674 },
  'Karur': { lat: 10.9601, lng: 78.0766 }
};

export default function StateCommand() {
  const [stats, setStats] = useState({
    totalOpen: 0,
    totalResolved: 0,
    criticalPriority: 0,
    totalTickets: 0,
    resolutionRate: 0,
    healthScore: 0,
    districtPerformance: [],
    heatmapData: [],
    departments: [],
    districts: [],
    districtMarkers: []
  });

  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState(['Statewide']);

  const addToScope = (item) => {
    if (scope.length >= 3) return; // Cap at Dept -> Dist
    if (scope.includes(item)) return;
    setScope([...scope, item]);
  };

  const resetScope = (index) => {
    setScope(scope.slice(0, index + 1));
  };

  useEffect(() => {
    const fetchCommandStats = async () => {
      try {
        // Bypass localhost API calls to prevent hanging
        const mockDashboardStats = {
          totalOpen: 14500,
          totalResolved: 48000,
          criticalPriority: 850,
          totalTickets: 62500,
          resolutionRate: 76.8,
          avgResolutionTime: 42
        };
        let tickets = []; // We will fill this entirely with massive dummy data below


        // --- INJECT MASSIVE DUMMY DATA FOR DEMONSTRATION PURPOSES ---
        const dummyDepartments = ['Electricity', 'Health & Sanitation', 'Water (TWAD)', 'PWD / Roads', 'Revenue', 'Police', 'Transport'];
        const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
        
        const massiveDummy = [];
        TN_CONSTITUENCIES.forEach(c => {
          const count = Math.floor(Math.random() * 60) + 10;
          for(let i = 0; i < count; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const dept = dummyDepartments[Math.floor(Math.random() * dummyDepartments.length)];
            
            massiveDummy.push({
              id: `dummy-${c.no}-${i}`,
              department: { name: dept },
              district: c.district,
              status: status,
            });
          }
        });
        
        tickets = [...tickets, ...massiveDummy];
        // -----------------------------------------------------------


        const districtsSet = new Set();
        const deptsSet = new Set();
        tickets.forEach(t => {
          if (t.district) districtsSet.add(t.district);
          if (t.department?.name) deptsSet.add(t.department.name);
        });

        const districts = Array.from(districtsSet).sort();
        const departments = Array.from(deptsSet).sort();

        const heatmapData = departments.map(dept => {
          const row = { department: dept };
          districts.forEach(dist => {
            const pendingCount = tickets.filter(t => 
              t.department?.name === dept && 
              t.district === dist && 
              t.status !== 'RESOLVED' && 
              t.status !== 'CLOSED'
            ).length;
            row[dist] = pendingCount;
          });
          return row;
        });

        const agingCount = tickets.filter(t => t.status === 'ESCALATED').length;

        const districtMarkers = districts.map(dName => {
          const coords = DISTRICT_COORDS[dName] || { lat: 11.1271, lng: 78.6569 };
          const pending = tickets.filter(t => t.district === dName && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
          return { name: dName, ...coords, open: pending };
        });

        const districtPerformance = districts.map(d => {
          const dTickets = tickets.filter(t => t.district === d);
          const total = dTickets.length;
          const open = dTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
          const resolved = total - open;
          const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
          return { name: d, total, open, resolved, rate };
        });

        setStats({
          ...mockDashboardStats,
          heatmapData,
          departments,
          districts,
          agingCount,
          districtMarkers,
          districtPerformance
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch command stats:', err);
        setLoading(false);
      }
    };
    fetchCommandStats();
  }, []);

  if (loading || !stats) return <div className="p-8 flex justify-center"><Activity className="w-8 h-8 animate-spin text-[#8B1A1A]" /></div>;

  const getHeatmapColor = (val, maxVal) => {
    if (val === 0) return 'bg-slate-50 text-slate-400';
    if (!maxVal || maxVal === 0) return 'bg-red-500 text-white';
    
    const intensity = val / maxVal;
    if (intensity < 0.2) return 'bg-orange-100 text-orange-800';
    if (intensity < 0.5) return 'bg-orange-300 text-orange-900';
    if (intensity < 0.8) return 'bg-red-500 text-white shadow-sm';
    return 'bg-red-700 text-white shadow-md font-black ring-1 ring-red-900/50';
  };

  const heatmapData = Array.isArray(stats?.heatmapData) ? stats.heatmapData : [];
  const districts = Array.isArray(stats?.districts) ? stats.districts : [];
  const districtPerformance = Array.isArray(stats?.districtPerformance) ? stats.districtPerformance : [];
  const districtMarkers = Array.isArray(stats?.districtMarkers) ? stats.districtMarkers : [];

  let maxPending = 0;
  heatmapData.forEach(row => {
    districts.forEach(d => {
      if (row[d] > maxPending) maxPending = row[d];
    });
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#8B1A1A]" /> State Command Center
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Tamil Nadu Macro-Governance Overview
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-black text-[#8B1A1A]">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Dynamic Breadcrumb Scope */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          {scope.map((s, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              <button 
                onClick={() => resetScope(idx)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  idx === scope.length - 1 ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Grievances" value={stats.totalTickets} icon={<BarChart3 className="text-blue-500 w-5 h-5" />} color="blue" />
        <StatCard label="Resolution Rate" value={`${stats.resolutionRate}%`} icon={<CheckCircle className="text-emerald-500 w-5 h-5" />} color="green" />
        <StatCard label="Avg. Resolution Time" value={`${stats.avgResolutionTime || '48'} hrs`} icon={<Clock className="text-purple-500 w-5 h-5" />} color="indigo" />
        <StatCard label="Total Pending" value={stats.totalOpen} icon={<Activity className="text-amber-500 w-5 h-5" />} color="orange" />
        <StatCard label="Aging (Critical)" value={stats.agingCount || 0} icon={<AlertOctagon className="text-red-600 w-5 h-5" />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DISTRICT PERFORMANCE LEAGUE */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#8B1A1A] rotate-180" />
                District Performance League
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Sorted by highest pending volume (Worst First)
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {[...districtPerformance].sort((a,b) => b.open - a.open).map((d, index) => (
              <div 
                key={d.name} 
                className="space-y-1.5 text-xs cursor-pointer group"
                onClick={() => addToScope(d.name)}
              >
                <div className="flex justify-between font-bold text-slate-700 uppercase text-[10px] group-hover:text-[#8B1A1A]">
                  <span className="font-black">
                    <span className="text-slate-400 mr-1">#{index + 1}</span> 
                    {d.name}
                  </span>
                  <span className={d.rate < 60 ? 'text-[#8B1A1A]' : 'text-slate-500'}>
                    {d.rate}% res. ({d.open} pending)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${d.rate}%` }}></div>
                  <div className="h-full bg-red-500" style={{ width: `${100 - d.rate}%` }}></div>
                </div>
              </div>
            ))}
            {districtPerformance.length === 0 && (
              <div className="text-center text-slate-400 py-8 text-xs font-bold">No district data available.</div>
            )}
          </div>
        </div>

        {/* PENDING INTENSITY HEATMAP */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 lg:col-span-2 flex flex-col h-[500px] overflow-hidden">
          <div className="mb-4 border-b border-slate-100 pb-3 shrink-0 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-[#8B1A1A]" />
                Pending Intensity Matrix
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Department × District Backlog Severity
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              <span>Low</span>
              <div className="w-3 h-3 bg-orange-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-orange-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-700 rounded-sm"></div>
              <span>Severe</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar border border-slate-100 rounded-xl relative">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead className="bg-slate-50 sticky top-0 z-10 font-black text-slate-600 uppercase tracking-widest">
                <tr>
                  <th className="p-3 border-b border-r border-slate-200 bg-white sticky left-0 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Department</th>
                  {districts.map(d => (
                    <th key={d} className="p-3 border-b border-r border-slate-200 whitespace-nowrap bg-slate-50 text-center">
                      {d.substring(0,8)}.
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-bold text-slate-700">
                {heatmapData.map(row => (
                  <tr key={row.department}>
                    <td 
                      className="p-3 border-b border-r border-slate-200 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate max-w-[12rem] cursor-pointer hover:text-[#8B1A1A]" 
                      title={row.department}
                      onClick={() => addToScope(row.department)}
                    >
                      {row.department}
                    </td>
                    {districts.map(d => {
                      const val = row[d] || 0;
                      return (
                        <td key={d} className={`border-b border-r border-slate-100 text-center ${getHeatmapColor(val, maxPending)}`}>
                          <div className="flex items-center justify-center w-full h-full min-h-[2.5rem]">
                            {val > 0 ? val : '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {heatmapData.length === 0 && (
                  <tr>
                    <td colSpan={districts.length + 1} className="p-8 text-center text-slate-400">
                      Insufficient cross-matrix data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STATE GRIEVANCE CLUSTERMAP */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/85">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-[#8B1A1A]" /> State Grievance Clustermap (Pending Load)
        </h3>
        <div style={{ height: '450px', width: '100%', borderRadius: '20px', overflow: 'hidden' }} className="border border-slate-200 shadow-inner">
          <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            {districtMarkers.map((d, i) => (
              <CircleMarker 
                key={i} 
                center={[d.lat, d.lng]} 
                radius={d.open > 50 ? 20 : d.open > 20 ? 14 : d.open > 5 ? 8 : 5}
                fillColor={d.open > 50 ? '#EF4444' : d.open > 20 ? '#F59E0B' : '#10B981'}
                color="#fff" 
                weight={1.5} 
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="text-[10px] uppercase font-sans font-bold">
                    <strong className="block border-b border-slate-100 pb-1 mb-1 text-slate-800">{d.name} District</strong>
                    <span className="text-red-655 block">Pending Issues: {d.open}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Low Backlog</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Moderate Backlog</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Severe Backlog</div>
        </div>
      </div>

    </div>
  );
}
