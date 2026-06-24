import React, { useState } from 'react';
import { Camera, MapPin, Check, X, ShieldAlert, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getNextRole } from '../../data/hierarchyData';

import { getMediaUrl } from '../../services/api';
import { departments } from '../../mock';

export default function TicketActionModals({ 
  activeTicket, 
  modalState, 
  setModalState, 
  onSubmitAction,
  role
}) {
  const { t } = useTranslation();
  const [resolveStep, setResolveStep] = useState(1);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [showGeoCamera, setShowGeoCamera] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [targetDept, setTargetDept] = useState('');

  // Dummy coordinates for simulation
  const resolutionLat = '12.9784';
  const resolutionLng = '80.2185';
  const dummyCoords = { lat: '12.9784', lng: '80.2185' };
  const resolutionAddress = 'Velachery, Chennai';

  if (!activeTicket) return null;



  const handleResolveSubmit = (e) => {
    if (e) e.preventDefault();
    
    let finalPhoto = resolutionPhoto;
    if (!finalPhoto) {
      const cat = (activeTicket.categoryName || activeTicket.category || '').toLowerCase();
      if (cat.includes('elect')) finalPhoto = '/jana_feed_media/electicity_fixed.jpeg';
      else if (cat.includes('sanit') || cat.includes('health')) finalPhoto = '/jana_feed_media/santi_fixed.jpeg';
    }

    onSubmitAction(activeTicket.id, 'resolve', {
      resolution_text: resolutionNotes,
      resolution_proof: finalPhoto,
      resolution_lat: resolutionLat,
      resolution_lng: resolutionLng,
      resolution_address: resolutionAddress
    });
    setModalState(null);
    setResolveStep(1);
    setResolutionNotes('');
    setResolutionPhoto('');
  };

  const handleAssignSubmit = (e) => {
    if (e) e.preventDefault();
    onSubmitAction(activeTicket.id, 'assign', {
      assigned_agent: agentName,
      assignment_notes: assignmentNotes
    });
    setModalState(null);
    setAgentName('');
    setAssignmentNotes('');
  };

  const handleReassignSubmit = (e) => {
    if (e) e.preventDefault();
    onSubmitAction(activeTicket.id, 'reassign', {
      target_department: targetDept,
      reassign_notes: escalationNotes
    });
    setModalState(null);
    setTargetDept('');
    setEscalationNotes('');
  };

  const handleEscalateConfirm = () => {
    const category = activeTicket?.categoryName || (typeof activeTicket?.category === 'string' ? activeTicket?.category : activeTicket?.category?.name) || 'Water';
    const nextAuthority = getNextRole(category, role);
    
    onSubmitAction(activeTicket.id, 'escalate', { 
      escalateToRole: nextAuthority,
      notes: escalationNotes
    });
    setModalState(null);
    setEscalationNotes('');
  };

  const getEscalateConfirmText = () => {
    const category = activeTicket?.categoryName || (typeof activeTicket?.category === 'string' ? activeTicket?.category : activeTicket?.category?.name) || 'Water';
    const nextAuthority = getNextRole(category, role);
    
    return `Are you sure you want to escalate this grievance? It will be removed from your queue and routed directly to the ${nextAuthority} for immediate intervention.`;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* View Modal */}
      <AnimatePresence>
        {modalState === 'view' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#8B1A1A] text-base uppercase">
                  Ticket #{activeTicket.displayId || activeTicket.id}
                </h4>
                <button onClick={() => setModalState(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Photo Evidence Section (Only show if photo_url exists) */}
                {activeTicket.photo_url && (
                  <div className="relative w-full h-[180px] rounded-xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200 group">
                    <img 
                      src={getMediaUrl(activeTicket.photo_url)} 
                      alt="Ticket Evidence" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3 bg-[#8B1A1A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      CITIZEN UPLOADED
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Issue Description</span>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{activeTicket.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${activeTicket.lat || '13.0827'},${activeTicket.lng || '80.2707'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden relative block hover:border-[#8B1A1A] hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity group-hover:opacity-30" style={{ backgroundImage: 'url(https://maps.googleapis.com/maps/api/staticmap?center=Chennai&zoom=12&size=400x400&sensor=false)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Location Details</span>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1 group-hover:text-[#8B1A1A] transition-colors"><MapPin className="w-3 h-3 text-[#8B1A1A]"/> {activeTicket.ward || 'Unknown'}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 flex justify-between items-center">
                        {activeTicket.lat ? `${activeTicket.lat}, ${activeTicket.lng}` : '13.0827° N, 80.2707° E'}
                        <span className="text-[8px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 group-hover:text-[#8B1A1A] group-hover:border-[#8B1A1A]">OPEN MAP</span>
                      </p>
                    </div>
                  </a>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">SLA Deadline</span>
                    <p className="text-xs font-black text-rose-600">{new Date(activeTicket.sla_deadline).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{activeTicket.status}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Priority Level</span>
                  <div className="flex items-center gap-3">
                    <select
                      value={activeTicket.priority || 'P3'}
                      onChange={(e) => onSubmitAction(activeTicket.id, 'set_priority', { priority: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 p-2 focus:outline-none focus:border-[#8B1A1A]"
                    >
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Standard</option>
                    </select>
                    <span className="text-[10px] font-bold text-slate-400">
                      ({activeTicket.prioritySource === 'auto' ? 'auto' : `set by ${localStorage.getItem('jn_emp_name') || 'officer'}`})
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                   <button 
                     onClick={() => setModalState('reassign')}
                     className="text-[10px] font-black uppercase text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                   >
                     Reassign Department
                   </button>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={() => setModalState(null)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  Close Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve Modal */}
      <AnimatePresence>
        {modalState === 'resolve' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#8B1A1A] text-base uppercase">
                  Resolve Ticket #{activeTicket.displayId || activeTicket.id}
                </h4>
                <button onClick={() => setModalState(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Step 1: Observations */}
              {resolveStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Resolution Observations Notes (Required)
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={300}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Detail specific repairs, parts replaced, or works completed (min 10 chars, max 300)..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-800 text-xs shadow-sm resize-none leading-relaxed font-bold"
                    ></textarea>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pl-1 pt-0.5">
                      <span>Min 10 characters</span>
                      <span>{resolutionNotes.length}/300</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalState(null)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={resolutionNotes.trim().length < 10}
                      onClick={() => setResolveStep(2)}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      Next: Capture Photo →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Geo-Tagged Photo */}
              {resolveStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Geo-Tagged Camera Verification (Required)
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setShowGeoCamera(true)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Hidden file input for simulation */}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Camera className="w-8 h-8 text-emerald-600 animate-pulse" />
                      <span className="font-extrabold text-xs text-slate-700">Launch Resolution Camera</span>
                      <span className="text-[10px] font-bold text-slate-400">Captures frame coordinates and geocodes details</span>
                    </button>

                    {resolutionPhoto && (
                      <div className="relative w-full aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-md mt-2 group select-none">
                        <img src={resolutionPhoto} alt="Resolution proof" className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-[#4CAF50] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                          <MapPin className="w-2.5 h-2.5 text-white" />
                          <span>📍 LOCATION VERIFIED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResolveStep(1)}
                      className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!resolutionPhoto}
                      onClick={() => setResolveStep(3)}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      Next: Stamp GPS Coords →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Stamping details */}
              {resolveStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Resolution Metadatas & GPS Stamp
                    </label>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 select-none text-[10px] font-extrabold text-[#4CAF50] uppercase tracking-wider">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>GIS Coordinate Lock Successful</span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">VERIFIED COORDINATES</span>
                          <p className="font-mono font-black text-slate-800">{resolutionLat}°N, {resolutionLng}°E</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">GEOCODED MUNICIPAL STREET</span>
                          <p className="font-bold text-slate-700 leading-normal">{resolutionAddress}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 pt-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">RESOLVED BY</span>
                            <p className="font-black text-slate-800">{localStorage.getItem('jn_name') || 'WARD OFFICER'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">TIMESTAMP</span>
                            <p className="font-black text-slate-800">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResolveStep(2)}
                      className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResolveSubmit}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      ✓ Resolve Grievance
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Escalate Modal */}
      <AnimatePresence>
        {modalState === 'escalate' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                  Escalate Grievance
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
                  {getEscalateConfirmText()}
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                  Escalation Reason/Notes (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={200}
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  placeholder="Explain why this grievance is being escalated (required)..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-850 text-xs shadow-sm resize-none leading-relaxed font-bold"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setModalState(null); setEscalationNotes(''); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!escalationNotes.trim()}
                  onClick={handleEscalateConfirm}
                  className="flex-1 py-3 rounded-xl bg-rose-650 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-700 text-white font-extrabold text-xs uppercase transition-colors shadow-md"
                >
                  Yes, Escalate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reassign Modal */}
      <AnimatePresence>
        {modalState === 'reassign' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-indigo-600 text-base uppercase">
                  Reassign Department
                </h4>
                <button onClick={() => setModalState(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleReassignSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Target Department
                  </label>
                  <select
                    required
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 outline-none px-4 py-3 rounded-xl text-slate-800 text-sm shadow-sm"
                  >
                    <option value="" disabled>Select a department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Reassignment Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={escalationNotes}
                    onChange={(e) => setEscalationNotes(e.target.value)}
                    placeholder="Why is this being reassigned?"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 outline-none px-4 py-3 rounded-xl text-slate-800 text-sm shadow-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setModalState(null); setTargetDept(''); setEscalationNotes(''); }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!targetDept || !escalationNotes.trim()}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase transition-all shadow-md"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {modalState === 'assign' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-black text-[#8B1A1A] text-base uppercase">
                  Dispatch Field Agent
                </h4>
                <button onClick={() => setModalState(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Section Officer)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-800 text-sm shadow-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Assignment Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="E.g., Take the JCB machine to clear the debris..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-800 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalState(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase shadow-md transition-colors flex justify-center items-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Dispatch Agent</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
