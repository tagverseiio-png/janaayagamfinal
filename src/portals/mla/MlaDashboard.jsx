import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, CheckCircle, MapPin, X, ArrowRight, 
  Map, Search, Download, Radio, Megaphone, Activity, TrendingUp, BarChart2, PieChart as PieChartIcon, 
  List, Phone, Shield, FileText, LogOut, Flag, Clock, Plus
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import StatCard from '../../shared/components/StatCard';
import AgingQueue from '../../shared/components/AgingQueue';
import api from '../../services/api';

export default function MlaDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Retrieve logged in user and constituency details
  const userName = localStorage.getItem('jn_name') || 'Official';
  const constituency = localStorage.getItem('jn_emp_constituency') || 'Constituency';
  const district = localStorage.getItem('jn_emp_district') || 'District';

  // State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [wardPerformanceFilter, setWardPerformanceFilter] = useState('all');
  const [mlaTickets, setMlaTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);



  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.categoryName || t.department?.name || 'Unknown',
        district: t.district || district,
        displayId: t.ticketNumber,
        id: t.id,
        description: t.description,
        ward: t.ward || t.jurisdiction?.name || 'Unknown'
      }));
      setMlaTickets(formatted);
    } catch (err) {
      console.error('Failed to fetch MLA tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    navigate('/');
  };

  // Enforce Flagging only - writes a history timeline event
  const handleFlagTicketSubmit = async (e) => {
    e.preventDefault();
    if (!flagReason.trim() || !selectedTicket) return;

    try {
      // Calls PATCH update ticket with notes to trigger MLA_FLAG history action in backend
      await api.patch(`/tickets/${selectedTicket.id}`, {
        notes: `MLA FLAG: ${flagReason}`
      });

      alert(`Ticket ${selectedTicket.displayId} successfully flagged.`);
      setShowFlagModal(false);
      setFlagReason('');
      setSelectedTicket(null);

      // Refresh list
      fetchTickets();
    } catch (err) {
      console.error('Failed to flag ticket:', err);
      alert('Failed to flag ticket. MLAs are restricted to VIEW + FLAG only.');
    }
  };



  const totalOpen = mlaTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const totalResolved = mlaTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = mlaTickets.length > 0 ? Math.round((totalResolved / mlaTickets.length) * 100) : 100;

  // Ward comparison data derived from tickets
  const defaultWards = ['Ward 170', 'Ward 171', 'Ward 172', 'Ward 173'];
  const uniqueWards = [...new Set([...defaultWards, ...mlaTickets.map(t => t.ward)])].filter(w => w && w !== 'Unknown');
  const wardComparisonData = uniqueWards.map(w => {
    const wardTickets = mlaTickets.filter(t => t.ward === w);
    const wOpen = wardTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const wResolved = wardTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const rate = wardTickets.length > 0 ? Math.round((wResolved / wardTickets.length) * 100) : 100;
    return { name: w, open: wOpen, resolved: wResolved, rate };
  }).sort((a, b) => a.rate - b.rate);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white border-l-8 border-l-[#FF6600] border-t-4 border-t-[#138808] rounded-3xl p-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6600] block">{district} District • {constituency} Constituency</span>
            <h1 className="text-2xl font-black text-[#8B1A1A] mt-1 leading-none">MLA Command Dashboard</h1>
          </div>
        </div>
        <div className="text-right bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Legislative Clock</span>
          <span className="text-xs font-mono font-black text-[#FF6600]">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <StatCard label={tLabel('Constituency Open', 'தொகுதி புகார்கள்')} value={totalOpen} icon={<Activity className="text-blue-500 w-5 h-5" />} color="blue" />
        <StatCard label={tLabel('Resolution Rate', 'தீர்வு விகிதம்')} value={`${resolutionRate}%`} icon={<CheckCircle className="text-emerald-500 w-5 h-5" />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
              Ward Performance Comparison
            </h3>
            <select
              value={wardPerformanceFilter}
              onChange={e => setWardPerformanceFilter(e.target.value)}
              className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg outline-none px-2 py-1"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="space-y-4">
            {wardComparisonData.filter(w => {
                if (wardPerformanceFilter === 'all') return true;
                if (wardPerformanceFilter === 'high') return w.rate >= 75;
                if (wardPerformanceFilter === 'moderate') return w.rate >= 50 && w.rate < 75;
                if (wardPerformanceFilter === 'low') return w.rate < 50;
                return true;
              }).map(w => (
              <div key={w.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700 uppercase text-[10px]">
                  <span className="font-black">{isNaN(w.name) ? w.name : `Ward ${w.name}`}</span>
                  <span>{w.rate}% resolved ({w.open} pending)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      w.rate < 50 ? 'bg-red-500' : w.rate < 75 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${w.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heat Map or Ward Map view */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/85 lg:col-span-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#FF6600]" /> Mylapore Ward Cluster Map
          </h3>
          <div style={{ height: '320px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} className="border border-slate-200">
            <MapContainer center={[13.0335, 80.2674]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {uniqueWards.map((w, idx) => {
                const count = mlaTickets.filter(t => t.ward === w && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
                if (count === 0) return null;
                // Simple jitter for multiple wards if we don't have exact coordinates
                const lat = 13.0335 + (idx * 0.002);
                const lng = 80.2674 + (idx * 0.002);
                return (
                  <CircleMarker key={w} center={[lat, lng]} radius={10 + count} fillColor="#FF6600" color="#fff" weight={1.5} fillOpacity={0.8}>
                    <Popup>{isNaN(w) ? w : `Ward ${w}`}<br/>Open Issues: {count}</Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F0EBE3]">
      {/* Header Ribbon */}
      <div className="bg-[#1E1E1E] text-white p-6 shadow-md flex justify-between items-center z-10 relative overflow-hidden shrink-0 border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF6600]" /> MLA COMMAND DASHBOARD
          </h1>
          <span className="text-[9px] text-[#FF6600] font-extrabold uppercase tracking-widest bg-[#FF6600]/10 border border-[#FF6600]/20 px-2 py-0.5 rounded mt-1.5 inline-block">
            {constituency} Constituency · {district}
          </span>
        </div>
        <div className="text-right bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">GIS Clock Lock</span>
          <span className="font-mono text-xs font-black text-[#FF6600]">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderDashboard()}
      </div>
    </div>
  );
}
