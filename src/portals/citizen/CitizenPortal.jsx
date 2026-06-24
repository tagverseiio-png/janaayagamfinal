import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle, MapPin, Users, User, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

import SubmitTicket from './SubmitTicket';
import MyTickets from './MyTickets';
import CivicFeed from './CivicFeed';
import EscalationHierarchy from './EscalationHierarchy';
import SOSContact from './SOSContact';
import ReferAFriend from './ReferAFriend';
import VolunteerSignup from './VolunteerSignup';
import VolunteerDashboard from './VolunteerDashboard';
import LocationSettings from '../../shared/components/LocationSettings';
import ProfilePage from '../../shared/components/ProfilePage';

export default function CitizenPortal() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const livingAddr = localStorage.getItem('jn_living_address');
    const hasPrompted = sessionStorage.getItem('jn_location_prompted');
    if (!livingAddr && !hasPrompted) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('jn_location_prompted', 'true');
    }
  }, []);

  const prevTicketsRef = useRef([]);

  useEffect(() => {
    let active = true;

    const checkStatusChanges = async () => {
      try {
        const res = await api.get('/tickets');
        if (!active) return;
        
        const newTickets = res.data;
        const prevTickets = prevTicketsRef.current;
        
        if (prevTickets.length > 0) {
          newTickets.forEach(ticket => {
            const prev = prevTickets.find(t => t.id === ticket.id);
            if (prev) {
              const prevStatus = prev.status.toUpperCase();
              const newStatus = ticket.status.toUpperCase();
              const prevRole = prev.assignedTo?.role;
              const newRole = ticket.assignedTo?.role;

              if (prevStatus !== newStatus || prevRole !== newRole) {
                let msg = "";
                const ticketNo = ticket.ticketNumber;
                
                if (newStatus === 'ESCALATED') {
                  const roleName = ticket.assignedTo?.role || tLabel('Higher Authority', 'உயர் அதிகாரி');
                  msg = tLabel(
                    `Update on #JN-${ticketNo}: Your grievance has been escalated to the ${roleName}.`,
                    `செய்தி #JN-${ticketNo}: உங்கள் புகார் ${roleName}க்கு மேல்முறையீடு செய்யப்பட்டுள்ளது.`
                  );
                } else if (newStatus === 'RESOLVED') {
                  msg = tLabel(
                    `Update on #JN-${ticketNo}: Your grievance has been resolved by the department.`,
                    `செய்தி #JN-${ticketNo}: உங்கள் புகார் துறை மூலம் தீர்க்கப்பட்டது.`
                  );
                } else if (newStatus === 'CLOSED') {
                  msg = tLabel(
                    `Update on #JN-${ticketNo}: Grievance closed successfully.`,
                    `செய்தி #JN-${ticketNo}: புகார் வெற்றிகரமாக மூடப்பட்டது.`
                  );
                } else if (newStatus === 'REOPENED') {
                  msg = tLabel(
                    `Update on #JN-${ticketNo}: Grievance reopened.`,
                    `செய்தி #JN-${ticketNo}: புகார் மீண்டும் திறக்கப்பட்டது.`
                  );
                } else {
                  msg = tLabel(
                    `Update on #JN-${ticketNo}: Grievance status updated to ${newStatus}.`,
                    `செய்தி #JN-${ticketNo}: புகாரின் நிலை ${newStatus} ஆக மாற்றப்பட்டுள்ளது.`
                  );
                }
                
                toast.info(msg, { duration: 7000 });
              }
            }
          });
        }
        prevTicketsRef.current = newTickets;
      } catch (err) {
        console.error('Failed to poll tickets for notifications:', err);
      }
    };

    checkStatusChanges();
    const interval = setInterval(checkStatusChanges, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [prevTicketsRef, i18n.language]);



  const citizenName = localStorage.getItem('jn_name') || '';

  // Language Switch
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    toast.success(newLang === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  const handleLogout = () => {
    localStorage.removeItem('jn_emp_role');
    localStorage.removeItem('jn_emp_dept');
    localStorage.removeItem('jn_emp_jurisdiction');
    localStorage.removeItem('jn_emp_constituency');
    localStorage.removeItem('jn_emp_district');
    localStorage.removeItem('jn_lang');
    toast.success(tLabel('Logged out successfully', 'வெற்றிகரமாக வெளியேறப்பட்டது'));
    navigate('/', { replace: true });
  };

  // Active Tab Helpers
  const path = location.pathname;
  const isMapActive = path === '/citizen' || path === '/citizen/';
  const isSubmitActive = path === '/citizen/submit';
  const isTrackActive = path === '/citizen/tickets';
  const isFeedActive = path === '/citizen/feed';
  const isProfileActive = path === '/citizen/profile' || path.startsWith('/citizen/profile/');

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen font-sans">
      
      {/* Responsive container — always full width */}
      <div className="min-h-screen bg-[#F0EBE3] flex flex-col relative pb-[66px] w-full">
        
        {/* ══ 1. HEADER ══ */}
        <header className="sticky top-0 z-50 bg-white px-4 py-3 flex justify-between items-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-b border-slate-100">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/citizen')}>
            <Shield className="w-5 h-5 text-[#8B1A1A]" />
            <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase">
              JanaNayagam
            </h1>
          </div>

          <div className="flex items-center gap-2.5 select-none">
            {/* Language switches */}
            <button
              onClick={toggleLanguage}
              className="text-[10px] font-black px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[#8B1A1A] cursor-pointer"
            >
              {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            
            {/* Profile Settings Avatar */}
            <button
              onClick={() => navigate('/citizen/profile')}
              className="relative w-7 h-7 bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/20 rounded-full flex items-center justify-center font-extrabold text-[10px] hover:bg-[#8B1A1A]/20 transition-all cursor-pointer shadow-sm"
              title={tLabel("Location Settings", "இருப்பிட அமைப்புகள்")}
            >
              {citizenName.slice(0, 2).toUpperCase()}
              {!localStorage.getItem('jn_living_address') && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-colors cursor-pointer"
              title={tLabel("Logout", "வெளியேறு")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>

        {/* ══ 2. MAIN CONTENT AREA ══ */}
        <main className="flex-1 relative">
          <Routes>
            <Route path="/" element={<Navigate to="/citizen/feed" replace />} />
            <Route path="/submit" element={<SubmitTicket />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/feed" element={<CivicFeed />} />
            <Route path="/hierarchy" element={<EscalationHierarchy />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/location" element={<LocationSettings />} />
            <Route path="/volunteer-signup" element={<VolunteerSignup />} />
            <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
            <Route path="/sos" element={<SOSContact />} />
            <Route path="/refer" element={<ReferAFriend />} />
          </Routes>
        </main>

        {/* ══ 3. FIXED BOTTOM TAB BAR — always full width ══ */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] h-[66px] flex justify-around items-center px-2 select-none shrink-0">
          
          {/* Tab 1: Live Feed */}
          <button
            onClick={() => navigate('/citizen/feed')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isFeedActive || isMapActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <Users className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Feed', 'ஊட்டம்')}
            </span>
          </button>

          {/* Tab 2: File Issue */}
          <button
            onClick={() => navigate('/citizen/submit')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isSubmitActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('File Issue', 'புகார்')}
            </span>
          </button>

          {/* Tab 3: Track */}
          <button
            onClick={() => navigate('/citizen/tickets')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isTrackActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Track', 'கண்காணி')}
            </span>
          </button>

          {/* Tab 4: Profile */}
          <button
            onClick={() => navigate('/citizen/profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isProfileActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Profile', 'சுயவிவரம்')}
            </span>
          </button>

        </nav>

        {/* ══ 4. WELCOME DIALOG MODAL (One-Time Prompt) ══ */}
        {showWelcomeModal && (
          <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm">
                  <Shield className="w-6 h-6 text-[#8B1A1A]" />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  {tLabel("Update Living Address", "வசிப்பிட முகவரியை அமைக்கவும்")}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  {tLabel(
                    "JanaNayagam routes your local complaints to the correct Ward Officer based on your Current Living Address. Your Aadhaar address is locked to Madurai, but you can set your active ward in Chennai.",
                    "ஜனநாயகம் உங்கள் வசிப்பிட வார்டின் அடிப்படையில் புகார்களை வழிநடத்துக்கிறது. உங்கள் ஆதார் முகவரி மதுரையுடன் பூட்டப்பட்டுள்ளது, ஆனால் நீங்கள் சென்னையில் வார்டை அமைக்கலாம்."
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShowWelcomeModal(false);
                    navigate('/citizen/profile/location');
                  }}
                  style={{ backgroundColor: '#8B1A1A' }}
                  className="w-full text-white font-extrabold text-xs py-3 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-white/90" />
                  <span>{tLabel("Configure Address Now", "முகவரியை இப்போது அமை")}</span>
                </button>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>{tLabel("Skip for Now", "பிறகு செய்கிறேன்")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
