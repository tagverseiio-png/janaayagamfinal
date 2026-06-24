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
