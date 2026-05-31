import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Landmark, AlertTriangle, Activity, Users, Building, Radio } from 'lucide-react';
import TnMap from '../../shared/components/TnMap';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const grievancePoints = [
  { lat: 13.0827, lng: 80.2707, count: 12, type: 'critical', area: 'Chennai Central' },
  { lat: 13.0569, lng: 80.2425, count: 8, type: 'high', area: 'Adyar' },
  { lat: 13.1067, lng: 80.2206, count: 5, type: 'medium', area: 'Ambattur' },
  { lat: 13.0878, lng: 80.2785, count: 15, type: 'critical', area: 'Royapuram' },
  { lat: 13.0525, lng: 80.2500, count: 3, type: 'low', area: 'Velachery' },
  { lat: 13.0732, lng: 80.2609, count: 7, type: 'high', area: 'T. Nagar' },
];

const getColor = (type) => {
  if (type === 'critical') return '#ef4444';
  if (type === 'high') return '#f97316';
  if (type === 'medium') return '#eab308';
  return '#22c55e';
};

export default function CitizenDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const livingAddr = localStorage.getItem('jn_living_address');

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
        
        {/* Card 1: File Issue */}
        <button
          onClick={() => navigate('/citizen/submit')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-red-50 rounded-xl w-fit">
            <AlertTriangle className="w-6 h-6 text-[#8B1A1A]" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('File Issue', 'புகார் பதிவிடு')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Report new problem', 'புதிய புகார் அளிக்கவும்')}
            </p>
          </div>
        </button>

        {/* Card 2: Track Status */}
        <button
          onClick={() => navigate('/citizen/tickets')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-teal-50 rounded-xl w-fit">
            <Activity className="w-6 h-6 text-[#14B8A6]" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Track Status', 'புகார் நிலை')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('View active complaints', 'உங்கள் புகார்களைக் காண்க')}
            </p>
          </div>
        </button>

        {/* Card 3: Civic Feed */}
        <button
          onClick={() => navigate('/citizen/feed')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-blue-50 rounded-xl w-fit">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Civic Feed', 'குடிமை ஊட்டம்')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('See local problems', 'அயல் புகார்களை காண்க')}
            </p>
          </div>
        </button>

        {/* Card 4: Hierarchy */}
        <button
          onClick={() => navigate('/citizen/hierarchy')}
          className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#8B1A1A]/30 transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2 bg-indigo-50 rounded-xl w-fit">
            <Building className="w-6 h-6 text-indigo-800" />
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-[14.5px] text-slate-800">
              {tLabel('Hierarchy', 'அதிகார படிநிலை')}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {tLabel('Govt escalation flow', 'புகார் மேல்முறையீட்டு வழி')}
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
        <div className="rounded-xl overflow-hidden relative mb-3" style={{ height: 'clamp(200px, 30vw, 350px)', width: '100%', zIndex: 0 }}>
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={false}
            attributionControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='© Carto'
            />
            {grievancePoints.map((point, i) => (
              <CircleMarker
                key={i}
                center={[point.lat, point.lng]}
                radius={point.count * 0.8 + 6}
                fillColor={getColor(point.type)}
                color="white"
                weight={2}
                fillOpacity={0.85}
              >
                <Popup>{point.area}: {point.count} issues</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Stats Row Below Map (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center select-none">
          <div>
            <p className="text-sm font-black text-slate-800">1,204</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('ACTIVE', 'செயலில்')}
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">8,432</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('RESOLVED', 'தீர்க்கப்பட்டவை')}
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">89</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
              {tLabel('ESCALATED', 'மேல்முறையீடு')}
            </p>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
