import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color }) {
 const iconBgs = {
 red: 'bg-rose-50 text-[#8B1A1A] ',
 rose: 'bg-rose-50 text-[#8B1A1A] ',
 blue: 'bg-blue-50 text-[#8B1A1A] ',
 green: 'bg-emerald-50 text-emerald-600 ',
 emerald: 'bg-emerald-50 text-emerald-600 ',
 orange: 'bg-amber-50 text-amber-600 ',
 amber: 'bg-amber-50 text-amber-600 ',
 grey: 'bg-slate-50 text-slate-600 ',
 slate: 'bg-slate-50 text-slate-600 '
 };

 const activeIconBg = iconBgs[color] || iconBgs.blue;

 return (
 <motion.div 
 whileHover={{ y: -1 }}
 transition={{ duration: 0.15 }}
 className="bg-white border border-slate-200 rounded-[12px] p-4 flex items-center justify-between shadow-sm relative overflow-hidden select-none w-full"
 >
 <div className="space-y-1">
 <span className="text-[24px] md:text-[28px] font-black text-slate-800 tracking-tight leading-none block">
 {value}
 </span>
 <span className="text-[12px] md:text-[13px] font-bold text-slate-400 uppercase tracking-wider block">
 {label}
 </span>
 </div>
 
 {icon && (
 <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activeIconBg}`}>
 {React.cloneElement(icon, { className: 'w-4 h-4' })}
 </div>
 )}
 </motion.div>
 );
}
