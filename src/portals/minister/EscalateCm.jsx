import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
 AlertTriangle, Send, Camera, History, ShieldAlert, X, ArrowRight 
} from 'lucide-react';

export default function EscalateCm() {
 const { t } = useTranslation();
 const [justification, setJustification] = useState('');
 const [evidence, setEvidence] = useState('');
 const [urgency, setUrgency] = useState('Urgent');
 const [history, setHistory] = useState([]);
 
 // Confirmation Modal state
 const [confirmModalOpen, setConfirmModalOpen] = useState(false);

 useEffect(() => {
 const list = JSON.parse(localStorage.getItem('jn_cm_escalations') || '[]');
 setHistory(list);
 }, []);

 const handlePhotoUpload = (e) => {
 const file = e.target.files[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 setEvidence(reader.result);
 toast.success('Performance audit spreadsheet attached');
 };
 reader.readAsDataURL(file);
 }
 };

 const handleFormSubmit = (e) => {
 e.preventDefault();
 if (!justification.trim() || justification.length < 20) {
 toast.error('Detailed policy justification is required (min 20 chars)');
 return;
 }
 setConfirmModalOpen(true);
 };

 const executeCmEscalation = () => {
 const escId = 'CM-ESC-' + Math.floor(1000 + Math.random() * 9000).toString();
 const newEsc = {
 id: escId,
 justification,
 urgency,
 created_at: new Date().toISOString(),
 status: 'pending',
 evidence
 };

 const updated = [newEsc, ...history];
 localStorage.setItem('jn_cm_escalations', JSON.stringify(updated));
 setHistory(updated);
 setConfirmModalOpen(false);

 const isTamil = t('app_name') === 'ஜனநாயகம்';
 const successMsg = isTamil
 ? `முதலமைச்சருக்கு வெற்றிகரமாக மேல்முறையீடு செய்யப்பட்டது. ID: #${escId}`
 : `Policy issue escalated to Chief Minister (CM). ID: #${escId}`;

 toast.success(successMsg);

 // Reset form
 setJustification('');
 setEvidence('');
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6 pb-12"
 >
 {/* Title */}
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
 <AlertTriangle className="w-5 h-5" />
 </div>
 <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">
 Direct Chief Minister (CM) Escalation
 </h2>
 </div>

 <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
 
 {/* Mandate Justification */}
 <div className="space-y-1.5">
 <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
 1. Mandatory Policy Justification Details
 </label>
 <textarea
 required
 rows={4}
 value={justification}
 onChange={(e) => setJustification(e.target.value)}
 placeholder="Outline the critical statewide policy details, inter-departmental blocks, or strategic guidelines that necessitate Chief Minister intervention..."
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#9a0002] outline-none px-4 py-3 rounded-2xl text-slate-800 text-xs shadow-sm resize-none"
 ></textarea>
 </div>

 {/* Supporting evidence */}
 <div className="space-y-1.5">
 <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
 2. Supporting Evidence / Performance Audit Report
 </label>
 <div className="flex items-center gap-4">
 <label className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-350 shadow-sm rounded-xl px-4 py-3 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
 <Camera className="w-4 h-4 text-[#9a0002]" />
 <span>Attach Audit File</span>
 <input 
 type="file" 
 accept="image/*" 
 onChange={handlePhotoUpload} 
 className="hidden" 
 />
 </label>

 {evidence && (
 <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
 <img src={evidence} alt="Evidence" className="w-full h-full object-cover" />
 <button
 type="button"
 onClick={() => setEvidence('')}
 className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[8px] font-black uppercase"
 >
 Delete
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Urgency */}
 <div className="space-y-2">
 <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
 3. Urgency Classification
 </label>
 <div className="flex gap-4 pl-1">
 {['Urgent', 'Emergency'].map(level => (
 <label key={level} className="flex items-center gap-2 text-xs font-extrabold cursor-pointer text-slate-700 ">
 <input
 type="radio"
 name="urgency"
 value={level}
 checked={urgency === level}
 onChange={() => setUrgency(level)}
 className="w-4 h-4 text-[#9a0002] border-slate-300 focus:ring-[#9a0002]"
 />
 <span>{level}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Action Button */}
 <button
 type="submit"
 className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 hover:from-[#9a0002] hover:to-rose-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
 >
 <span>Dispatch Executive CM Escalation</span>
 <Send className="w-4 h-4" />
 </button>

 </form>



 {/* CONFIRMATION MODAL: BEFORE CM ESCALATION DISPATCH */}
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
 <ShieldAlert className="w-6 h-6 text-rose-600" />
 </div>
 
 <div className="space-y-2">
 <h4 className="font-black text-slate-800 text-base uppercase">
 Verify CM Escalation
 </h4>
 <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
 Are you sure you want to escalate this policy issue to the Chief Minister's Executive Office? This represents an emergency cabinet-level appeal.
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
 onClick={executeCmEscalation}
 className="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-[#9a0002] text-white font-extrabold text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1.5"
 >
 <span>Yes, Dispatch</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </motion.div>
 );
}
