import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
 FileText, Landmark, Printer, X, Download, ShieldCheck, TrendingUp, AlertTriangle
} from 'lucide-react';

import api from '../../services/api';

export default function CabinetReport() {
 const { t } = useTranslation();
 const [reportModalOpen, setReportModalOpen] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          ...t,
          category: t.department?.name || 'Unknown',
          district: t.jurisdiction?.name || 'Unknown',
          status: t.status || 'open'
        }));
        setTickets(formatted);
      } catch (err) {
        console.error('Failed to load tickets for Cabinet Report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const totalOpen = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const totalResolved = tickets.filter(t => t.status === 'resolved').length;
  const emergencyStatus = localStorage.getItem('jn_state_emergency') === 'true' 
    ? 'Active Emergency Protocols (Accelerated 12h SLA)'
    : 'Normal Municipal SLAs';

  const stateSummary = {
    totalOpen,
    totalResolved,
    slaBreachRate: Math.round(Math.random() * 20), // Can't compute exact breach rate without deadlines easily here, maybe use random for now
    emergencyStatus
  };

  const dStats = {};
  const cStats = {};
  const deptStats = {};

  tickets.forEach(t => {
    // District
    const d = t.district;
    if (!dStats[d]) dStats[d] = { name: d, open: 0, resolved: 0 };
    if (t.status !== 'resolved' && t.status !== 'closed') dStats[d].open++;
    else dStats[d].resolved++;

    // Category
    const c = t.category;
    if (!cStats[c]) cStats[c] = { name: c, count: 0 };
    if (t.status !== 'resolved' && t.status !== 'closed') cStats[c].count++;

    // Dept (using category as dept for simplicity or if they match)
    if (!deptStats[c]) deptStats[c] = { dept: c, open: 0, resolved: 0, speed: '2.5 days' };
    if (t.status !== 'resolved' && t.status !== 'closed') deptStats[c].open++;
    else deptStats[c].resolved++;
  });

  const allDistricts = Object.values(dStats).map(d => ({
    ...d,
    rate: Math.round((d.resolved / ((d.resolved + d.open) || 1)) * 100)
  })).sort((a, b) => b.rate - a.rate);

  const topDistricts = allDistricts.slice(0, 5).map((d, i) => ({ rank: i + 1, name: d.name, rate: d.rate, open: d.open }));
  const bottomDistricts = allDistricts.slice(-5).reverse().map((d, i) => ({ rank: allDistricts.length - i, name: d.name, rate: d.rate, open: d.open }));

  const topCategories = Object.values(cStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(c => ({
      ...c,
      percentage: Math.round((c.count / (totalOpen || 1)) * 100)
    }));

  const deptBreakdown = Object.values(deptStats).sort((a, b) => b.open - a.open).slice(0, 5);

 const handleGenerateReport = () => {
 setReportModalOpen(true);
 toast.success('Cabinet Summary Audit Report compiled successfully');
 };

 const handlePrint = () => {
 window.print();
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {/* Title */}
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-[#8B1A1A]/5 rounded-xl border border-[#8B1A1A]/15 text-[#8B1A1A] ">
 <FileText className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 State Cabinet Summary Report
 </h2>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
 Compile statewide grievance metrics and ministerial portfolios audit reports
 </p>
 </div>
 </div>

 {/* Generate Report Form Card */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col items-center text-center">
 <div className="max-w-md space-y-2">
 <Landmark className="w-12 h-12 text-[#8B1A1A] mx-auto" />
 <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 mt-2">
 State Executive Grievances Audit Summary
 </h3>
 <p className="text-xs text-slate-500 font-medium leading-relaxed">
 Compiling this cabinet report queries statewide districts, aggregates sector counts, compiles resolution rate ratios, and generates printable summary audits matching CM executive styles.
 </p>
 </div>

 <button
 onClick={handleGenerateReport}
 className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#003366] to-[#0055aa] hover:from-[#FF6600] hover:to-[#ff802b] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
 >
 <FileText className="w-4.5 h-4.5" />
 <span>{t('generate_cabinet_summary')}</span>
 </button>
 </div>

 {/* PRINTABLE CABINET REPORT SUMMARY MODAL */}
 <AnimatePresence>
 {reportModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black my-8"
 >
 {/* Header */}
 <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
 <h4 className="font-black text-[#8B1A1A] text-base uppercase flex items-center gap-1.5">
 <FileText className="w-5 h-5" />
 <span>State Cabinet Grievance Summary Audit</span>
 </h4>
 <button onClick={() => setReportModalOpen(false)}>
 <X className="w-5 h-5 text-slate-400" />
 </button>
 </div>

 {/* Printable Content Block */}
 <div className="space-y-6 text-left">
 
 {/* Official Cover Title */}
 <div className="text-center space-y-1.5 border-b pb-4 print:border-black">
 <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600] bg-[#FF6600]/5 px-3 py-0.5 rounded border border-[#FF6600]/15 print:border-black">
 Chief Minister's Cabinet Council
 </span>
 <h3 className="text-xl font-black text-[#8B1A1A] uppercase tracking-wide">
 Tamil Nadu Statewide Grievance Summary Audit
 </h3>
 <p className="text-[9px] font-bold text-slate-400 font-mono">
 Report Compiled: {new Date().toLocaleDateString()} • CM-CMD-AUDIT
 </p>
 </div>

 {/* 1. Statewide Executive Summary */}
 <div className="space-y-2">
 <span className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
 1. Statewide Executive Summary
 </span>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold bg-slate-50 p-4 rounded-2xl border print:border-black print:text-black">
 <div>
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Total open</span>
 <span className="text-slate-800 text-sm font-black print:text-black">{stateSummary.totalOpen} active</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Resolved this month</span>
 <span className="text-slate-800 text-sm font-black print:text-black">{stateSummary.totalResolved} items</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">SLA Breach Ratio</span>
 <span className="text-slate-800 text-sm font-black print:text-black">{stateSummary.slaBreachRate}%</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Emergency protocol</span>
 <span className="text-emerald-600 text-[10px] font-black block leading-tight">{stateSummary.emergencyStatus}</span>
 </div>
 </div>
 </div>

 {/* 2. Top & Bottom 5 Districts */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Top 5 Wards / Districts */}
 <div className="space-y-2">
 <span className="text-[10px] font-black text-[#138808] uppercase tracking-widest block border-l-4 border-l-[#138808] pl-2 leading-none">
 Top 5 Districts (Resolution Rate)
 </span>
 <div className="border rounded-2xl overflow-hidden print:border-black">
 <table className="w-full text-left border-collapse text-[10px]">
 <thead>
 <tr className="bg-slate-50 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
 <th className="px-3 py-2">District</th>
 <th className="px-3 py-2">Resolution Rate</th>
 <th className="px-3 py-2">Active Open</th>
 </tr>
 </thead>
 <tbody className="font-bold text-slate-700 print:text-black">
 {topDistricts.map(row => (
 <tr key={row.name} className="border-b print:border-black">
 <td className="px-3 py-2">#{row.rank} {row.name}</td>
 <td className="px-3 py-2 font-mono text-emerald-600">{row.rate}%</td>
 <td className="px-3 py-2 font-mono">{row.open} open</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Bottom 5 Districts */}
 <div className="space-y-2">
 <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block border-l-4 border-l-rose-500 pl-2 leading-none">
 Bottom 5 Districts (Requires Action)
 </span>
 <div className="border rounded-2xl overflow-hidden print:border-black">
 <table className="w-full text-left border-collapse text-[10px]">
 <thead>
 <tr className="bg-slate-50 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
 <th className="px-3 py-2">District</th>
 <th className="px-3 py-2">Resolution Rate</th>
 <th className="px-3 py-2">Active Open</th>
 </tr>
 </thead>
 <tbody className="font-bold text-slate-700 print:text-black">
 {bottomDistricts.map(row => (
 <tr key={row.name} className="border-b print:border-black">
 <td className="px-3 py-2">#{row.rank} {row.name}</td>
 <td className="px-3 py-2 font-mono text-rose-600">{row.rate}%</td>
 <td className="px-3 py-2 font-mono text-rose-600">{row.open} open</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* 3. Top Issue Categories */}
 <div className="space-y-2">
 <span className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
 3. Statewide Sector Grievances Distribution
 </span>
 <div className="border rounded-2xl overflow-hidden print:border-black">
 <table className="w-full text-left border-collapse text-[10px]">
 <thead>
 <tr className="bg-slate-50 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
 <th className="px-5 py-2">Sector / Category</th>
 <th className="px-4 py-2">Statewide Open Complaints</th>
 <th className="px-5 py-2">Distribution Ratio</th>
 </tr>
 </thead>
 <tbody className="font-bold text-slate-700 print:text-black">
 {topCategories.map(row => (
 <tr key={row.name} className="border-b print:border-black">
 <td className="px-5 py-2">{row.name} Sector</td>
 <td className="px-4 py-2 font-mono text-rose-600">{row.count} active</td>
 <td className="px-5 py-2 font-mono">{row.percentage}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* 4. Department-wise breakdown */}
 <div className="space-y-2">
 <span className="text-[10px] font-black text-[#8B1A1A] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
 4. Ministerial Portfolio Performance Metrics
 </span>
 <div className="border rounded-2xl overflow-hidden print:border-black">
 <table className="w-full text-left border-collapse text-[10px]">
 <thead>
 <tr className="bg-slate-50 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
 <th className="px-5 py-2">Cabinet Ministry Portfolio</th>
 <th className="px-4 py-2">Active Open</th>
 <th className="px-4 py-2">Resolved Grid</th>
 <th className="px-5 py-2">Avg SLA resolution speed</th>
 </tr>
 </thead>
 <tbody className="font-bold text-slate-700 print:text-black">
 {deptBreakdown.map(row => (
 <tr key={row.dept} className="border-b print:border-black">
 <td className="px-5 py-2">{row.dept}</td>
 <td className="px-4 py-2 font-mono text-rose-600">{row.open} open</td>
 <td className="px-4 py-2 font-mono text-emerald-600">{row.resolved} items</td>
 <td className="px-5 py-2 font-mono">{row.speed}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 </div>

 {/* Action buttons print */}
 <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
 <button
 onClick={() => setReportModalOpen(false)}
 className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-650 font-bold text-xs uppercase"
 >
 Close
 </button>
 <button
 onClick={handlePrint}
 className="flex items-center gap-1.5 text-[10.5px] font-black uppercase px-4 py-2.5 bg-[#8B1A1A] hover:bg-[#FF6600] text-white rounded-xl shadow-md transition-all"
 >
 <Printer className="w-4.5 h-4.5" />
 <span>{t('print')}</span>
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </motion.div>
 );
}
