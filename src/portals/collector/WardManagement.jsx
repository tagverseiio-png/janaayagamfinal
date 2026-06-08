import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
 Settings, Layers, Users, MapPin, AlertCircle, X, ShieldAlert, ArrowRight, Check
} from 'lucide-react';import api from '../../services/api';

export default function WardManagement() {
 const { t } = useTranslation();
 const [tickets, setTickets] = useState([]);
 const [expandedWards, setExpandedWards] = useState({});

 const toggleWardExpand = (wardName) => {
 setExpandedWards(prev => ({ ...prev, [wardName]: !prev[wardName] }));
 };
 
  // Wards administrative state (dynamic)
  const [wards, setWards] = useState([]);

 // Officer list for reassignment dropdown
 const availableOfficers = [
 'Suresh M.', 'Anitha K.', 'Karthik Raj S.', 'Ramya V.', 
 'Selvam P.', 'Divya N.', 'Manoj S.', 'Priya R.', 
 'Ganesh P.', 'Subha S.', 'Naveen Kumar', 'Vimala Devi',
 'Arun Kumar A.', 'Meenakshi R.'
 ];

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const formatted = res.data.map(t => ({
        ...t,
        category: t.department?.name || 'Unknown',
        district: t.jurisdiction?.name || 'Unknown',
        id: t.ticketNumber,
        ward: t.jurisdiction?.name || 'Unknown'
      }));
      setTickets(formatted);

      // Generate dynamic wards list from tickets
      const wardSet = new Set();
      const dynamicWards = [];
      formatted.forEach(t => {
        if (!wardSet.has(t.ward)) {
          wardSet.add(t.ward);
          dynamicWards.push({
            name: t.ward,
            taluk: 'District Assigned',
            officer: 'Pending Assignment'
          });
        }
      });
      setWards(dynamicWards);
    } catch (err) {
      console.error('Failed to fetch tickets for ward management:', err);
    }
  };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6 pb-12"
 >
 {/* Title */}
 <div className="flex justify-between items-center">
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-[#8B1A1A]/5 rounded-xl border border-[#8B1A1A]/15 text-[#8B1A1A] ">
 <Layers className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 {t('ward_management')}
 </h2>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
 Supervise administrative boundaries and ward officer assignments
 </p>
 </div>
 </div>

 </div>

 {/* Ward Administration Table */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
 
 {/* Desktop View */}
 <div className="hidden md:block overflow-x-auto rounded-2xl border">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
 <th className="px-5 py-3.5">Ward Name</th>
 <th className="px-5 py-3.5">Taluk Name</th>
 <th className="px-5 py-3.5">Open Tickets</th>
 <th className="px-5 py-3.5">Assigned Ward Officer</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 ">
 {wards.map(ward => {
 const openCount = getOpenCount(ward.name);
 return (
 <tr key={ward.name} className="hover:bg-slate-50/50 ">
 <td className="px-5 py-4 flex items-center gap-2">
 <MapPin className="w-4 h-4 text-[#8B1A1A]" />
 <span className="font-extrabold text-slate-800 ">Ward {ward.name}</span>
 </td>
 <td className="px-5 py-4 text-slate-500 font-medium">{ward.taluk} Taluk</td>
 <td className="px-5 py-4 font-mono text-rose-600">{openCount} active</td>
 <td className="px-5 py-4">
 {/* Officer Reassign Select Dropdown */}
 <select
 value={ward.officer}
 onChange={(e) => handleOfficerChange(ward.name, e.target.value)}
 className="bg-slate-50 border rounded-xl py-1.5 px-3.5 font-bold text-slate-700 cursor-pointer outline-none focus:border-[#8B1A1A]"
 >
 {availableOfficers.map(officer => (
 <option key={officer} value={officer}>
 {officer}
 </option>
 ))}
 </select>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Mobile View - Convert Table Rows to Expandable Cards */}
 <div className="md:hidden flex flex-col gap-3">
 {wards.map(ward => {
 const openCount = getOpenCount(ward.name);
 const isExpanded = !!expandedWards[ward.name];
 return (
 <div 
 key={ward.name} 
 onClick={() => toggleWardExpand(ward.name)}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5 transition-all active:bg-slate-100/55 cursor-pointer"
 >
 <div className="flex justify-between items-center w-full">
 <div className="flex items-center gap-1.5">
 <MapPin className="w-4 h-4 text-[#8B1A1A]" />
 <span className="font-extrabold text-slate-850 ">Ward {ward.name}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
 {openCount} active
 </span>
 <span className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-90' : ''}`}>
 ▶
 </span>
 </div>
 </div>

 {isExpanded && (
 <div className="pt-2.5 border-t border-slate-200/50 space-y-2.5 text-xs text-slate-550 ">
 <div className="flex justify-between">
 <span className="font-bold">Taluk:</span>
 <span className="font-black text-slate-855 ">{ward.taluk} Taluk</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="font-bold">Assigned Ward Officer:</span>
 <div onClick={(e) => e.stopPropagation()}>
 <select
 value={ward.officer}
 onChange={(e) => handleOfficerChange(ward.name, e.target.value)}
 className="w-full bg-white border rounded-xl py-2 px-3 font-bold text-slate-700 cursor-pointer outline-none focus:border-[#8B1A1A]"
 >
 {availableOfficers.map(officer => (
 <option key={officer} value={officer}>
 {officer}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>

 </div>

 </motion.div>
 );
}
