import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, Bell, Bot, User, Clock as ClockIcon, Activity, 
  Map, Users, LayoutDashboard, FileText, Gift, Award,
  Radar, Megaphone, LogOut
} from 'lucide-react';
import { statePulse } from '../../mock/cm';
import CmOverview from './CmOverview';
import CmDistricts from './CmDistricts';
import CmSingapenne from './CmSingapenne';
import CmGrievances from './CmGrievances';
import CmMinisters from './CmMinisters';
import CmCrisisRadar from './CmCrisisRadar';
import CmAiBriefing from './CmAiBriefing';

// Simple dummy components for unbuilt routes
const DummyPage = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] bg-white rounded-2xl border border-slate-200">
    <div className="text-center">
      <h2 className="text-2xl font-black text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-2">Under Construction</p>
    </div>
  </div>
);

export default function CmPortal() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeEmergenciesCount = statePulse.activeEmergencies;

  const sidebarLinks = [
    { label: 'Overview', path: '/cm', end: true, icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Districts', path: '/cm/districts', icon: <Map className="w-5 h-5" /> },
    { label: 'Singapenne', path: '/cm/singapenne', icon: <Users className="w-5 h-5" /> },
    { label: 'Grievances', path: '/cm/grievances', icon: <FileText className="w-5 h-5" /> },
    { label: 'Ministers', path: '/cm/ministers', icon: <Award className="w-5 h-5" /> },
    { label: 'Crisis Radar', path: '/cm/crisis-radar', icon: <Radar className="w-5 h-5" /> },
    { label: 'Announcements', path: '/cm/announcements', icon: <Megaphone className="w-5 h-5" /> },
    { label: 'AI Briefing', path: '/cm/ai-briefing', icon: <Bot className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F0EBE3] text-slate-800 font-sans selection:bg-[#8B1A1A]/20 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-40">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="p-2 bg-[#8B1A1A]/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#8B1A1A]" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[11px] font-black tracking-wider text-[#8B1A1A] uppercase leading-tight">State<br/>Command</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Main Navigation</div>
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold ${
                  isActive 
                    ? 'bg-[#8B1A1A] text-white shadow-md shadow-[#8B1A1A]/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#8B1A1A]/10 rounded-full flex items-center justify-center">
               <User className="w-5 h-5 text-[#8B1A1A]" />
             </div>
             <div>
               <div className="text-xs font-black text-slate-800">Hon'ble CM</div>
               <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Administrator</div>
             </div>
           </div>
           
           <button 
             onClick={handleLogout} 
             className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors"
           >
             <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* TOP NAV BAR */}
        <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="px-8 h-16 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black tracking-wider text-slate-800 uppercase">CM Governance Command Center</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Apex State Dashboard · Tamil Nadu</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-medium tracking-wide text-slate-600">
                  {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
              
              <button className="relative p-2 text-slate-400 hover:text-[#8B1A1A] transition-colors">
                <Bell className="w-5 h-5" />
                {activeEmergenciesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse">
                    {activeEmergenciesCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-8">
          <div className="max-w-[1500px] mx-auto">
            <Routes>
              <Route path="/" element={<CmOverview />} />
              <Route path="/districts" element={<CmDistricts />} />
              <Route path="/singapenne" element={<CmSingapenne />} />
              <Route path="/grievances" element={<CmGrievances />} />
              <Route path="/ministers" element={<CmMinisters />} />
              <Route path="/crisis-radar" element={<CmCrisisRadar />} />
              <Route path="/announcements" element={<DummyPage title="State Announcements" />} />
              <Route path="/ai-briefing" element={<CmAiBriefing />} />
              <Route path="*" element={<Navigate to="/cm" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
