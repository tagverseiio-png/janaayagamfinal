import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
 Zap, AlertTriangle, Send, X, ShieldAlert, CheckCircle, Info
} from 'lucide-react';

import api from '../../services/api';

export default function CrisisMode() {
 const { t } = useTranslation();
 const [crisisActive, setCrisisActive] = useState(false);
 const [confirmModalOpen, setConfirmModalOpen] = useState(false);
 const [directiveText, setDirectiveText] = useState('');
 const [targetDistrict, setTargetDistrict] = useState('all');

  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    api.get('/metadata/jurisdictions?level=DISTRICT')
      .then(res => setDistricts(res.data))
      .catch(err => console.error("Failed to fetch districts", err));
  }, []);

 useEffect(() => {
 const active = localStorage.getItem('jn_crisis_mode') === 'true';
 setCrisisActive(active);
 }, []);

 const handleCrisisToggle = () => {
 if (crisisActive) {
 // Deactivate directly
 localStorage.setItem('jn_crisis_mode', 'false');
 setCrisisActive(false);
 toast.info('Emergency Crisis Mode Deactivated. General SLAs restored.');
 } else {
 setConfirmModalOpen(true);
 }
 };

 const confirmCrisisActivation = () => {
 localStorage.setItem('jn_crisis_mode', 'true');
 setCrisisActive(true);
 setConfirmModalOpen(false);
 toast.success('CRISIS EMERGENCY PROTOCOL INITIATED');
 };

 const handleSendDirective = async (e) => {
 e.preventDefault();
 if (!directiveText.trim()) {
 toast.error('Directive instructions cannot be empty');
 return;
 }

 try {
   await api.post('/announcements', {
     title: 'MINISTERIAL CRISIS DIRECTIVE',
     text: directiveText,
     district: targetDistrict === 'all' ? 'All' : targetDistrict
   });
   const targetName = targetDistrict === 'all' ? 'All Wards & Districts' : `${targetDistrict} District`;
   toast.success(`Ministerial decree dispatched to ${targetName}.`);
   setDirectiveText('');
 } catch (err) {
   toast.error('Failed to dispatch directive');
 }
 };

 const englishBanner = "Crisis mode activated. All collectors notified. SLA reduced to 24 hours.";
 const tamilBanner = "அவசர நிலை அறிவிக்கப்பட்டது. அனைவருக்கும் அறிவிப்பு அனுப்பப்பட்டது. காலக்கெடு 24 மணிநேரமாகக் குறைக்கப்பட்டது.";

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6 pb-12"
 >
 {/* Title */}
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-600">
 <Zap className="w-5 h-5" />
 </div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 State Grievance Crisis Room
 </h2>
 </div>

 {/* Emergency Crisis Activator Grid */}
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
 <div className="max-w-md space-y-2">
 <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 ">
 Statewide SLA Emergency Decree
 </h3>
 <p className="text-xs text-slate-500 font-medium leading-relaxed">
 Activating Crisis Mode reduces statewide ticket SLAs to 24 hours and flags all local district administrations to implement immediate emergency resolutions.
 </p>
 </div>

 {/* Big Red Button Activator */}
 <motion.button
 onClick={handleCrisisToggle}
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 className={`w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center font-black transition-all shadow-xl select-none ${
 crisisActive
 ? 'bg-white border-slate-700 hover:bg-slate-700 text-white shadow-slate-500/10'
 : 'bg-rose-600 border-rose-500 hover:bg-rose-700 text-white shadow-rose-600/20 animate-pulse'
 }`}
 >
 <Zap className="w-8 h-8 fill-white mb-2" />
 <span className="text-xs uppercase tracking-widest text-center px-4 leading-normal">
 {crisisActive ? 'DEACTIVATE CRISIS' : t('activate_crisis')}
 </span>
 </motion.button>
 </div>

 {/* Dynamic Crisis Alert Success Banner */}
 <AnimatePresence>
 {crisisActive && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-rose-600 text-white p-6 rounded-3xl space-y-3 shadow-md relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
 <div className="flex items-center gap-2.5">
 <ShieldAlert className="w-6 h-6 animate-bounce shrink-0" />
 <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
 State SLA Emergency Banner
 </span>
 </div>
 
 <div className="space-y-1 font-extrabold text-xs sm:text-sm leading-relaxed">
 <p>"{englishBanner}"</p>
 <p className="opacity-90 font-medium">"{tamilBanner}"</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Statewide Directive Composer */}
 <form onSubmit={handleSendDirective} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
 <div className="flex items-center gap-2 text-[#9a0002] border-b pb-3 pl-1">
 <Info className="w-5 h-5 text-[#9a0002]" />
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
 Ministerial Executive Directive Composer
 </span>
 </div>

 <div className="space-y-1">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
 Executive Order / Directive Instructions
 </label>
 <textarea
 required
 rows={4}
 value={directiveText}
 onChange={(e) => setDirectiveText(e.target.value)}
 placeholder="Draft policy instructions, emergency relief directions, or specific grievance realignment mandates..."
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#9a0002] outline-none px-4 py-3 rounded-2xl text-slate-800 text-xs shadow-sm resize-none"
 ></textarea>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
 <div className="space-y-1">
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
 Send Directive to
 </label>
 <select
 value={targetDistrict}
 onChange={(e) => setTargetDistrict(e.target.value)}
 className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold"
 >
 <option value="all">All Districts (Statewide)</option>
 {districts.map(d => (
 <option key={d.name || d} value={d.name || d}>
 {d.name || d} District
 </option>
 ))}
 </select>
 </div>

 <button
 type="submit"
 className="w-full py-3.5 mt-4 rounded-xl bg-slate-950 hover:bg-[#9a0002] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
 >
 <span>{t('send_directive')}</span>
 <Send className="w-4 h-4" />
 </button>
 </div>
 </form>

 {/* CONFIRMATION MODAL: BEFORE CRISIS DECREE ACTIVATION */}
 <AnimatePresence>
 {confirmModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-center space-y-4"
 >
 <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-200">
 <AlertTriangle className="w-6 h-6 text-rose-600" />
 </div>
 
 <div className="space-y-2">
 <h4 className="font-black text-slate-800 text-base uppercase">
 Initiate Crisis Decree
 </h4>
 <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
 WARNING: Activating Crisis Mode is an emergency executive protocol. This notifies all District Collectors and overrides statewide ticket resolution SLAs to 24 hours. Confirm activation.
 </p>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => setConfirmModalOpen(false)}
 className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={confirmCrisisActivation}
 className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-750 text-white font-extrabold text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1"
 >
 <span>Yes, Activate</span>
 <Zap className="w-3.5 h-3.5" />
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </motion.div>
 );
}
