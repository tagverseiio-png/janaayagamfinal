import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BarChart2, FileText, TrendingUp, ArrowUpRight, Shield, MapPin, Plus, Trash2, Camera, 
 AlertTriangle, CheckCircle, ChevronRight, Layers, Users, Map, Radio } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import TnMap from '../../shared/components/TnMap';
import GeoCamera from '../../shared/components/GeoCamera';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const getCategoryCount = () => [];


// Subcomponent: BdoDashboard
function BdoDashboard({ bdoNotes, handleSaveNote, handleDeleteNote, setShowGeoCamera, noteTitle, setNoteTitle, noteText, setNoteText, notePhoto, handlePhotoUpload }) {
 const { i18n } = useTranslation();
 const isTa = i18n.language === 'ta';
 const tLabel = (en, ta) => isTa ? ta : en;
 const fileInputRef = React.useRef(null);

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
 {/* Left side: Overview card + Form Note */}
 <div className="space-y-6">
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm select-none">
 <span className="text-[10px] font-black bg-red-50 text-[#8B1A1A] px-2.5 py-1 rounded-full uppercase tracking-wider">
 Block Development Officer
 </span>
 <h2 className="text-xl font-black text-slate-850 mt-3">
 {tLabel("Welcome, BDO", "வரவேற்கிறோம், பி.டி.ஓ")}
 </h2>
 <p className="text-xs text-slate-500 mt-1">
 Velachery Taluk Division · Rural Development
 </p>
 </div>

 {/* Add Field Note Form */}
 <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
 <div className="flex items-center gap-2 text-[#8B1A1A] select-none">
 <Layers className="w-5 h-5" />
 <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
 {tLabel("Add Field Observation Note", "கள ஆய்வு குறிப்பு சேர்க்க")}
 </h3>
 </div>

 <form onSubmit={handleSaveNote} className="space-y-4">
 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
 Subject / Location
 </label>
 <input
 type="text"
 required
 value={noteTitle}
 onChange={(e) => setNoteTitle(e.target.value)}
 placeholder="e.g. RS Puram Lake Desilting Inspection"
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-800 text-xs shadow-sm font-bold"
 />
 </div>

 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
 Inspection Findings
 </label>
 <textarea
 required
 rows={3}
 value={noteText}
 onChange={(e) => setNoteText(e.target.value)}
 placeholder="Provide specific notes from inspection..."
 className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-850 text-xs shadow-sm resize-none leading-relaxed font-bold"
 ></textarea>
 </div>

 {/* Add Optional Geo Photo */}
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
 Evidence Geo Photo (Optional)
 </label>
 
 <div className="flex items-center gap-3">
 <input 
    type="file" 
    accept="image/*" 
    ref={fileInputRef} 
    onChange={handlePhotoUpload} 
    className="hidden" 
 />
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="bg-white border border-[#8B1A1A]/30 text-[#8B1A1A] hover:bg-red-50 rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
 >
 <Camera className="w-4 h-4" />
 <span>{tLabel("📷 Add Geo Photo", "📷 படம் சேர்")}</span>
 </button>

 {notePhoto && (
 <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
 <img src={notePhoto} alt="BDO Note stamp preview" className="w-full h-full object-cover" />
 </div>
 )}
 </div>
 </div>

 <button
 type="submit"
 style={{ backgroundColor: '#8B1A1A' }}
 className="w-full py-3 rounded-xl hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
 >
 <Plus className="w-4 h-4 text-white" />
 <span>{tLabel("Save Field Note", "குறிப்பைச் சேமி")}</span>
 </button>
 </form>
 </div>
 </div>

 {/* Right side: List of BDO Notes */}
 <div className="space-y-4">
 <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider pl-1 select-none">
 {tLabel("Field Observations Log", "கள ஆய்வு குறிப்புகள் பதிவேடு")}
 </h3>

 {bdoNotes.map((note) => (
 <div
 key={note.id}
 className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5 relative"
 >
 <button
 onClick={() => handleDeleteNote(note.id)}
 className="absolute top-4 right-4 text-slate-450 hover:text-red-600 transition-colors p-1"
 title="Delete observation"
 >
 <Trash2 className="w-4 h-4" />
 </button>

 <div className="space-y-1">
 <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
 {new Date(note.created_at).toLocaleDateString()} · {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 <h4 className="font-black text-sm text-slate-800 pr-6">
 {note.title}
 </h4>
 </div>

 <p className="text-xs text-slate-650 leading-relaxed font-bold">
 {note.text}
 </p>

 {note.photo && (
 <div className="w-full aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-950 shadow-sm relative">
 <img src={note.photo} alt="BDO Field proof" className="w-full h-full object-cover" />
 {note.lat && (
 <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
 <MapPin className="w-2.5 h-2.5" />
 <span>{note.lat}°N, {note.lng}°E</span>
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>

      {/* ══ LIVE DISTRICT RADAR SECTION ══ */}
      <div className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-6">
        
        <div className="flex justify-between items-center mb-3 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8B1A1A] animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-700">
              Live District Radar
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase">SECURE</span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-100">
          <TnMap 
            lang={i18n?.language || 'en'} 
            citizenMode={false} 
            height="220px" 
            center={
              (() => {
                const ud = typeof window !== 'undefined' ? localStorage.getItem('jn_district') : null;
                const dMap = {
                  "Chennai": [13.0827, 80.2707],
                  "Madurai": [9.9252, 78.1198],
                  "Coimbatore": [11.0168, 76.9558],
                  "Salem": [11.6643, 78.1460],
                  "Trichy": [10.7905, 78.7047]
                };
                return dMap[ud] || [10.8505, 78.6677];
              })()
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center select-none">
          <div>
            <p className="text-sm font-black text-slate-800">1,204</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ACTIVE</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">8,432</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">RESOLVED</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">89</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ESCALATED</p>
          </div>
        </div>
      </div>
      
 </div>
 );
}

// Subcomponent: BdoTickets (Ward performance)
function BdoTickets() {
 const { i18n } = useTranslation();
 const isTa = i18n.language === 'ta';
 const tLabel = (en, ta) => isTa ? ta : en;

 const wards = [
 { name: '140', taluk: 'Velachery', officer: 'Suresh M.', open: 5, breach: true },
 { name: '141', taluk: 'Velachery', officer: 'Anitha K.', open: 1, breach: false },
 { name: '142', taluk: 'Velachery', officer: 'Karthik Raj S.', open: 8, breach: true },
 { name: '143', taluk: 'Velachery', officer: 'Ramya V.', open: 2, breach: false }
 ];

 return (
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 select-none">
 <div className="pb-2">
 <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
 {tLabel("Ward Performance Dashboard", "வார்டு செயல்பாட்டு விபரம்")}
 </h3>
 <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
 Taluk divisions statistics and SLA warnings
 </p>
 </div>

 {/* Desktop View Table */}
 <div className="hidden md:block overflow-x-auto rounded-2xl border">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
 <th className="px-5 py-3.5">Ward Name</th>
 <th className="px-5 py-3.5">Assigned Officer</th>
 <th className="px-5 py-3.5">Open Complaints</th>
 <th className="px-5 py-3.5">SLA SLA Breach status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700 ">
 {wards.map(w => (
 <tr key={w.name} className="hover:bg-slate-50/50">
 <td className="px-5 py-4 flex items-center gap-1.5">
 <MapPin className="w-4 h-4 text-[#8B1A1A]" />
 <span>Ward {w.name}</span>
 </td>
 <td className="px-5 py-4">{w.officer}</td>
 <td className="px-5 py-4 text-rose-600 font-mono">{w.open} active</td>
 <td className="px-5 py-4">
 {w.breach ? (
 <span className="text-[10px] bg-red-100 text-red-750 px-2 py-0.5 rounded-full uppercase font-black">
 Breach Warning
 </span>
 ) : (
 <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-black">
 SLA Clean
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile View Ward Cards */}
 <div className="md:hidden flex flex-col gap-3">
 {wards.map(w => (
 <div 
 key={w.name}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
 >
 <div className="flex justify-between items-center w-full">
 <div className="flex items-center gap-1.5">
 <MapPin className="w-4 h-4 text-[#8B1A1A]" />
 <span className="font-extrabold text-slate-800 ">Ward {w.name}</span>
 </div>
 {w.breach && (
 <span className="text-[10px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full uppercase font-black">
 Breach
 </span>
 )}
 </div>
 
 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 font-bold">
 <div>
 <span>Officer:</span>
 <p className="font-black text-slate-700 mt-0.5">{w.officer}</p>
 </div>
 <div className="text-right">
 <span>Grievances:</span>
 <p className="font-black text-rose-600 mt-0.5">{w.open} Active</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

// Subcomponent: BdoAnalytics
function BdoAnalytics() {
 const { i18n } = useTranslation();
 const isTa = i18n.language === 'ta';
 const tLabel = (en, ta) => isTa ? ta : en;

 return (
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 select-none">
 <div className="pb-2">
 <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
 {tLabel("Grievance Category Insights", "பகுப்பாய்வு அறிக்கை")}
 </h3>
 <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
 Scroll horizontally on mobile to review all analytical graphs
 </p>
 </div>

 {/* Horizontal Scroll Chart Container */}
 <div className="overflow-x-auto -webkit-overflow-scrolling-touch hide-scrollbar border border-slate-100 rounded-2xl p-4 bg-slate-50 ">
 <div style={{ width: '100%', height: '300px', minHeight: '300px' }} className="min-w-[500px] relative pb-6 pt-4 px-4">
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={getCategoryCount()}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="count" fill="#8B1A1A" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
}

// Subcomponent: BdoEscalate (Escalate BDO to Collector)
function BdoEscalate() {
 const { i18n } = useTranslation();
 const isTa = i18n.language === 'ta';
 const tLabel = (en, ta) => isTa ? ta : en;

 const handleSubmit = (e) => {
 e.preventDefault();
 toast.success(tLabel("Grievance Escalation report dispatched to District Collector!", "வருவாய் அறிக்கை மாவட்ட ஆட்சியருக்கு அனுப்பப்பட்டது!"));
 };

 return (
 <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-lg mx-auto space-y-4 select-none">
 <div className="flex items-center gap-2 text-[#8B1A1A] pb-2 border-b border-slate-100 ">
 <ArrowUpRight className="w-5 h-5" />
 <h3 className="font-extrabold text-sm text-slate-850 uppercase tracking-wide">
 {tLabel("Escalate to Collector", "மாவட்ட ஆட்சியருக்கு மேல்முறையீடு")}
 </h3>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
 Escalation Title
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Critical drainage bottleneck in Velachery Sector 2"
 className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-xs font-bold focus:border-[#8B1A1A]"
 />
 </div>

 <div className="space-y-1">
 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
 Justification & Case Details
 </label>
 <textarea
 required
 rows={4}
 placeholder="Outline why this requires collector-level intervention..."
 className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-xs font-bold focus:border-[#8B1A1A]"
 />
 </div>

 <button
 type="submit"
 style={{ backgroundColor: '#8B1A1A' }}
 className="w-full py-3.5 rounded-xl hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
 >
 Dispatch Escalation
 </button>
 </form>
 </div>
 );
}

export default function BdoPortal() {
 const { t, i18n } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();

 const isTa = i18n.language === 'ta';
 const tLabel = (en, ta) => isTa ? ta : en;

 const [bdoNotes, setBdoNotes] = useState([]);
 const [noteTitle, setNoteTitle] = useState('');
 const [noteText, setNoteText] = useState('');
 const [notePhoto, setNotePhoto] = useState('');
 const [noteLat, setNoteLat] = useState('');
 const [noteLng, setNoteLng] = useState('');
 const [showGeoCamera, setShowGeoCamera] = useState(false);

 const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNotePhoto(URL.createObjectURL(file));
      setNoteLat('13.0827');
      setNoteLng('80.2707');
    }
 };

 const loadBdoNotes = () => {
 const list = JSON.parse(localStorage.getItem('jn_bdo_notes') || '[]');
 if (list.length === 0) {
 const mockNotes = [
 {
 id: 'note-1',
 title: "Velachery Canal Bund Desilting",
 text: "Inspected the local storm water canal bund desilting work in Sector 3. Desilting completed for 450 meters. Flow capacity is upgraded to handle heavy monsoons.",
 photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
 lat: "12.9792",
 lng: "80.2223",
 created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
 }
 ];
 localStorage.setItem('jn_bdo_notes', JSON.stringify(mockNotes));
 setBdoNotes(mockNotes);
 } else {
 setBdoNotes(list);
 }
 };

 useEffect(() => {
 loadBdoNotes();
 }, []);

 const handleSaveNote = (e) => {
 e.preventDefault();
 if (!noteTitle.trim()) {
 toast.error(tLabel("Please enter note title.", "தயவுசெய்து குறிப்பு தலைப்பை உள்ளிடவும்."));
 return;
 }
 if (!noteText.trim()) {
 toast.error(tLabel("Please enter inspection notes.", "தயவுசெய்து ஆய்வு குறிப்புகளை உள்ளிடவும்."));
 return;
 }

 const newNote = {
 id: 'note-' + Date.now(),
 title: noteTitle.trim(),
 text: noteText.trim(),
 photo: notePhoto,
 lat: noteLat,
 lng: noteLng,
 created_at: new Date().toISOString()
 };

 const updated = [newNote, ...bdoNotes];
 localStorage.setItem('jn_bdo_notes', JSON.stringify(updated));
 setBdoNotes(updated);

 // Clear form
 setNoteTitle('');
 setNoteText('');
 setNotePhoto('');
 setNoteLat('');
 setNoteLng('');
 toast.success(tLabel("Inspection field note saved successfully!", "ஆய்வு களக் குறிப்பு வெற்றிகரமாக சேமிக்கப்பட்டது!"));
 };

 const handleDeleteNote = (noteId) => {
 const updated = bdoNotes.filter(n => n.id !== noteId);
 localStorage.setItem('jn_bdo_notes', JSON.stringify(updated));
 setBdoNotes(updated);
 toast.info(tLabel("Field note deleted.", "களக் குறிப்பு நீக்கப்பட்டது."));
 };

 const handleCameraCapture = (photoData) => {
 setNotePhoto(photoData.imageUrl);
 setNoteLat(photoData.lat.toString());
 setNoteLng(photoData.lng.toString());
 setShowGeoCamera(false);
 toast.success(tLabel("Inspection photo geo-stamped!", "ஆய்வுப் படம் வெற்றிகரமாக இணைக்கப்பட்டது!"));
 };

 const sidebarLinks = [
 {
 label: tLabel('Summary & Notes', 'முகப்பு & குறிப்புகள்'),
 path: '/bdo',
 icon: <Layers />
 },
 {
 label: tLabel('Wards Performance', 'வார்டு செயல்பாடுகள்'),
 path: '/bdo/tickets',
 icon: <FileText />
 },
 {
 label: tLabel('Analytics', 'விவரம்'),
 path: '/bdo/analytics',
 icon: <TrendingUp />
 },
 {
 label: tLabel('Escalate', 'மேல்முறையீடு'),
 path: '/bdo/escalate',
 icon: <ArrowUpRight />
 }
 ];

 return (
 <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Block Development Officer (BDO)">
 {showGeoCamera && (
 <div className="fixed inset-0 z-[200] max-w-md mx-auto bg-black">
 <GeoCamera 
 onCapture={handleCameraCapture}
 onClose={() => setShowGeoCamera(false)}
 userName="BDO VELACHERY"
 userWard="Velachery Block"
 />
 </div>
 )}

 <Routes>
 <Route 
 path="/" 
 element={
 <BdoDashboard 
 bdoNotes={bdoNotes}
 handleSaveNote={handleSaveNote}
 handleDeleteNote={handleDeleteNote}
 setShowGeoCamera={setShowGeoCamera}
 noteTitle={noteTitle}
 setNoteTitle={setNoteTitle}
 noteText={noteText}
 setNoteText={setNoteText}
 notePhoto={notePhoto}
 handlePhotoUpload={handlePhotoUpload}
 />
 } 
 />
 <Route path="/tickets" element={<BdoTickets />} />
 <Route path="/analytics" element={<BdoAnalytics />} />
 <Route path="/escalate" element={<BdoEscalate />} />
 </Routes>
 </PortalLayout>
 );
}
