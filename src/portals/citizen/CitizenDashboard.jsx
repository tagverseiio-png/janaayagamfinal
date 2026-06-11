import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { Landmark, AlertTriangle, Activity, Handshake, BookOpen, PhoneCall, Share2, Radio } from 'lucide-react';
import TnMap from '../../shared/components/TnMap';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import api from '../../services/api';

export default function CitizenDashboard() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const isTa = lang === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const livingAddr = localStorage.getItem('jn_living_address');
  const isVolunteer = localStorage.getItem('jn_is_volunteer') === 'true';
  
  const [stats, setStats] = React.useState({ totalActive: 0, totalResolved: 0, totalEscalated: 0 });

  React.useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats({
        totalActive: res.data.totalOpen || 0,
        totalResolved: res.data.totalResolved || 0,
        totalEscalated: res.data.totalEscalated || 0
      });
    }).catch(console.error);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 pb-24 px-4 pt-4 max-w-5xl mx-auto"
    >
      
      {/* ══ 0. LIVING LOCATION EMPTY WARNING BANNER ══ */}
      {!livingAddr && (
        <button
          onClick={() => navigate('/citizen/profile/location')}
          className="w-full bg-[#FFF3CD] hover:bg-[#FFEBA8] border border-[#FFEBA8] text-[#856404] rounded-[16px] p-4 shadow-sm flex items-start gap-3 text-left transition-all"
        >
          <AlertTriangle className="w-5 h-5 text-[#856404] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider">
              {tLabel('Location Update Required', 'இருப்பிட முகவரி தேவை')}
            </h4>
            <p className="text-[11px] font-bold leading-normal text-[#856404]/80">
              {tLabel('Set your living address to enable ticket submissions and route grievances correctly.', 'புகார்களைச் சமர்ப்பிக்க உங்கள் வசிப்பிட முகவரியை அமைக்கவும்.')}
            </p>
          </div>
        </button>
      )}
      
      {/* ══ 1. TOP SECTION — HERO BANNER CARD ══ */}
      <div 
        className="w-full rounded-[16px] p-5 text-white relative overflow-hidden shadow-md select-none"
        style={{
          background: 'linear-gradient(135deg, #8B1A1A 0%, #A32A2A 100%)',
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {/* Pill Badge */}
            <span className="inline-block text-[9px] font-black tracking-widest bg-red-800/60 border border-red-500/20 text-white rounded-full px-2.5 py-0.5 uppercase">
              {tLabel('Govt of Tamil Nadu', 'தமிழ்நாடு அரசு')}
            </span>
            <h2 className="text-[19px] sm:text-xl font-black leading-tight max-w-[240px] md:max-w-none">
              {tLabel('CM Public Grievance Redressal System', 'முதல்வரின் பொது மக்கள் குறைதீர்ப்பு தளம்')}
            </h2>
          </div>
          <div className="shrink-0 p-2 bg-white/10 rounded-full border border-white/5 shadow-inner">
            <Landmark className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* ══ 2. QUICK ACTION GRID (2x2 on mobile, 4 cols on desktop) ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        
        {/* Card 1: Become a JanaNayagam */}
        <button
          onClick={() => navigate(isVolunteer ? '/citizen/volunteer-dashboard' : '/citizen/volunteer-signup')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-red-50 rounded-xl w-fit">
            <Handshake className="w-6 h-6 text-[#8B1A1A]" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Become a JanaNayagam', 'ஜனநாயகமாக மாறுங்கள்')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Volunteer for your ward', 'உங்கள் வார்டுக்கு சேவை செய்யுங்கள்')}
            </p>
          </div>
        </button>

        {/* Card 2: Schemes */}
        <button
          onClick={() => navigate('/citizen/schemes')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-teal-50 rounded-xl w-fit">
            <BookOpen className="w-6 h-6 text-[#14B8A6]" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Schemes', 'திட்டங்கள்')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Govt schemes for you', 'உங்களுக்கான அரசு திட்டங்கள்')}
            </p>
          </div>
        </button>

        {/* Card 3: SOS Contact */}
        <button
          onClick={() => navigate('/citizen/sos')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-blue-50 rounded-xl w-fit">
            <PhoneCall className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('SOS Contact', 'அவசர தொடர்பு')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Emergency helplines', 'அவசர உதவி எண்கள்')}
            </p>
          </div>
        </button>

        {/* Card 4: Refer a Friend */}
        <button
          onClick={() => navigate('/citizen/refer')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-indigo-50 rounded-xl w-fit">
            <Share2 className="w-6 h-6 text-indigo-800" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Refer a Friend', 'நண்பரைப் பரிந்துரைக்கவும்')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Invite others to JanaNayagam', 'ஜனநாயகத்திற்கு மற்றவர்களை அழைக்கவும்')}
            </p>
          </div>
        </button>

      </div>

      {/* ══ 3. LIVE DISTRICT RADAR SECTION ══ */}
      <div className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8B1A1A] animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-700">
              {tLabel('Live District Radar', 'நேரடி மாவட்ட ரேடார்')}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase">SECURE</span>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden relative mb-3 border border-slate-100" style={{ zIndex: 0 }}>
          <TnMap 
            lang={lang} 
            citizenMode={true} 
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
                return dMap[ud] || [13.0827, 80.2707];
              })()
            }
          />
        </div>

        {/* Stats Row Below Map (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center select-none">
          <div>
            <p className="text-sm font-black text-slate-800">{stats.totalActive}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('ACTIVE', 'செயலில்')}
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">{stats.totalResolved}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('RESOLVED', 'தீர்க்கப்பட்டவை')}
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">{stats.totalEscalated}</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('ESCALATED', 'மேல்முறையீடு')}
            </p>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
