import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { 
  Zap, BarChart2, ShieldAlert, AlertTriangle, LayoutDashboard,
  User, LogOut, Bell, Clock as ClockIcon
} from 'lucide-react';

import MinisterDashboard from './MinisterDashboard';
import MinisterDeptView from './MinisterDeptView';
import CrisisMode from './CrisisMode';
import EscalateCm from './EscalateCm';
import Analytics from './Analytics';

const DummyPage = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] bg-white rounded-2xl border border-slate-200">
    <div className="text-center">
      <h2 className="text-2xl font-black text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-2">Under Construction</p>
    </div>
  </div>
);

export default function MinisterPortal() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ministerName = localStorage.getItem('jn_name') || 'State Minister';
  const deptName = localStorage.getItem('jn_emp_dept') || 'Electricity & Energy Resources';
  const isHealth = deptName.toLowerCase().includes('health') || deptName.toLowerCase().includes('sanit');

  const sidebarLinks = [
    { label: 'Dashboard', path: '/minister', end: true, icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Department Tickets', path: '/minister/dept', icon: <ShieldAlert className="w-5 h-5" /> },
    { label: 'Analytics', path: '/minister/analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Crisis Mode', path: '/minister/crisis', icon: <Zap className="w-5 h-5" /> },
    { label: 'Escalate to CM', path: '/minister/escalate', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Reports', path: '/minister/reports', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F0EBE3] text-slate-800 font-sans flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="p-2 bg-[#8B1A1A]/10 rounded-lg">
            <Zap className="w-5 h-5 text-[#8B1A1A]" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[11px] font-black tracking-wider text-[#8B1A1A] uppercase leading-tight">
              {isHealth ? (
                <>Health &<br />Sanitation</>
              ) : (
                <>Electricity<br />Minister</>
              )}
            </h1>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Navigation</div>
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

        {/* Profile + Logout — same style as CM Portal */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B1A1A]/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#8B1A1A]" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 truncate max-w-[150px]" title={ministerName}>
                {ministerName}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 truncate max-w-[150px]" title={deptName}>
                {isHealth ? 'Health Dept.' : 'Electricity Dept.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* TOP BAR */}
        <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="px-8 h-16 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black tracking-wider text-slate-800 uppercase">
                {isHealth ? 'Health & Sanitation' : 'Electricity'} Minister Command Center
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Government of Tamil Nadu</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-medium tracking-wide text-slate-600">
                  {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
              <button className="relative p-2 text-slate-400 hover:text-[#8B1A1A] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-200"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-bold shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md transition-colors duration-200 group"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors duration-200" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">
          <div className="max-w-[1500px] mx-auto">
            <Routes>
              <Route path="/" element={<MinisterDashboard />} />
              <Route path="/portfolios" element={<MinisterDeptView />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/crisis" element={<CrisisMode />} />
              <Route path="/escalate" element={<EscalateCm />} />
              <Route path="/reports" element={<DummyPage title="Reports" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
