import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, ChevronDown, ChevronUp, Calendar, MapPin, Check, 
  ThumbsUp, ThumbsDown, Send, Clock, ShieldAlert, RefreshCw, ArrowLeft, Search, SlidersHorizontal, Star, TrendingUp
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

import ErrorBoundary from '../../shared/components/ErrorBoundary';
import api, { getMediaUrl } from '../../services/api';
import { toast } from 'sonner';

/* ─── Configurable Window for Reopening Closed Tickets (in Days) ─── */
const REOPEN_WINDOW_DAYS = 7;

/* ─── Helper to normalize roles for robust comparison ─── */
const matchRole = (stepRole, assignedRole) => {
  if (!assignedRole) return false;
  const normalize = (r) => (r || '').toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/\./g, '');
  
  const sRole = normalize(stepRole);
  const aRole = normalize(assignedRole);
  
  if (sRole === aRole) return true;

  const aliases = {
    'AAE': ['ASSISTANT_AREA_ENGINEER', 'WARD_AEO', 'ASST_AREA_ENGINEER'],
    'ASSISTANT_AREA_ENGINEER': ['AAE', 'WARD_AEO', 'ASST_AREA_ENGINEER'],
    'AE': ['AREA_ENGINEER'],
    'AREA_ENGINEER': ['AE'],
    'DSI': ['DIVISION_SANITARY_INSPECTOR'],
    'DIVISION_SANITARY_INSPECTOR': ['DSI'],
    'SI': ['SANITARY_INSPECTOR'],
    'SANITARY_INSPECTOR': ['SI'],
    'HI': ['HEALTH_INSPECTOR'],
    'HEALTH_INSPECTOR': ['HI'],
    'CHI': ['CITY_HEALTH_OFFICER'],
    'CITY_HEALTH_OFFICER': ['CHI'],
    'MINISTER': ['MINISTER_ELECTRICITY', 'MINISTER_ENERGY', 'MINISTER_HEALTH', 'CABINET_MINISTER', 'HONORABLE_MINISTER', 'HONORABLE_MINISTER_ENERGY', 'MINISTER_HIGHWAYS'],
    'JE': ['JUNIOR_ENGINEER'],
    'JUNIOR_ENGINEER': ['JE'],
    'AEE': ['ASSISTANT_EXECUTIVE_ENGINEER'],
    'ASSISTANT_EXECUTIVE_ENGINEER': ['AEE'],
    'EE': ['EXECUTIVE_ENGINEER'],
    'EXECUTIVE_ENGINEER': ['EE'],
    'SE': ['SUPERINTENDING_ENGINEER'],
    'SUPERINTENDING_ENGINEER': ['SE'],
    'CE': ['CHIEF_ENGINEER'],
    'CHIEF_ENGINEER': ['CE']
  };

  if (aliases[sRole] && aliases[sRole].includes(aRole)) return true;
  if (aliases[aRole] && aliases[aRole].includes(sRole)) return true;

  return false;
};

/* ─── Helper to format dates clean ─── */
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/* ─── Helper to format duration milliseconds to text ─── */
const formatDuration = (ms) => {
  if (!ms || ms < 0) return '';
  const mins = Math.floor(ms / (1000 * 60));
  if (mins < 60) return `Handled here for ${mins} min${mins !== 1 ? 's' : ''}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Handled here for ${hrs} hr${hrs !== 1 ? 's' : ''}`;
  const days = Math.floor(hrs / 24);
  return `Handled here for ${days} day${days !== 1 ? 's' : ''}`;
};

/* ─── Category Emojis ─── */
const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electricity') || cat === 'electricity') return '⚡';
  if (cat.includes('sanitation') || cat.includes('health') || cat === 'sanitation') return '🧹';
  if (cat.includes('roads') || cat === 'roads') return '🛣️';
  if (cat.includes('water') || cat === 'water') return '💧';
  if (cat.includes('revenue') || cat === 'revenue') return '📜';
  return '📋';
};

export default function MyTickets() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rating & Reopen state variables
  const [activeRating, setActiveRating] = useState(0);
  const [reopenText, setReopenText] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);
  
  // Manual Escalation State
  const [escalatingTicket, setEscalatingTicket] = useState(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Fetch tickets from the backend
  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      toast.error(tLabel('Failed to load grievances', 'புகார்களை ஏற்றுவதில் தோல்வி'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Poll every 30 seconds for live escalation updates
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen to incoming state to expand a specific ticket automatically
  useEffect(() => {
    if (location.state?.ticketId && tickets.length > 0) {
      const found = tickets.find(
        t => t.ticketNumber === location.state.ticketId || t.id === location.state.ticketId
      );
      if (found) {
        setExpandedId(found.id);
        // Clear location state to avoid re-expanding on route changes
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, tickets]);

  const triggerRefresh = () => {
    setRefreshing(true);
    fetchTickets(true).then(() => {
      toast.success(tLabel("Refreshed successfully", "வெற்றிகரமாக புதுப்பிக்கப்பட்டது"));
    });
  };

  // Status handlers
  const handleConfirmResolved = async (ticketId) => {
    if (activeRating === 0) {
      toast.error(tLabel("Please provide a rating before confirming.", "தயவுசெய்து உறுதிப்படுத்துவதற்கு முன் மதிப்பீட்டை வழங்கவும்."));
      return;
    }
    try {
      await api.patch(`/tickets/${ticketId}`, {
        status: 'CLOSED',
        rating: activeRating,
        notes: `Citizen confirmed resolution with ${activeRating} stars.`
      });
      toast.success(tLabel("Grievance marked as resolved and closed. Thank you!", "புகார் தீர்க்கப்பட்டு மூடப்பட்டது. நன்றி!"));
      setActiveRating(0);
      fetchTickets(true);
    } catch (err) {
      console.error('Failed to close ticket:', err);
      toast.error(tLabel('Failed to update ticket status', 'புகார் நிலையை புதுப்பிப்பதில் தோல்வி'));
    }
  };

  const handleReopenSubmit = async (e, ticketId) => {
    e.preventDefault();
    if (reopenText.trim().length < 10) {
      toast.error(tLabel("Please describe the issue clearly (minimum 10 characters).", "பிரச்சினையை தெளிவாக விவரிக்கவும் (குறைந்தது 10 எழுத்துக்கள்)."));
      return;
    }
    try {
      await api.patch(`/tickets/${ticketId}`, {
        status: 'REOPENED',
        reopenReason: reopenText.trim(),
        notes: `REOPENED by Citizen: ${reopenText.trim()}`
      });
      toast.success(tLabel("Grievance reopened successfully.", "புகார் வெற்றிகரமாக மீண்டும் திறக்கப்பட்டது."));
      setReopenText('');
      setShowReopenForm(false);
      fetchTickets(true);
    } catch (err) {
      console.error('Failed to reopen ticket:', err);
      toast.error(tLabel('Failed to reopen grievance', 'புகாரை மீண்டும் திறப்பதில் தோல்வி'));
    }
  };

  const handleEscalateSubmit = async (e, ticketId) => {
    if (e) e.preventDefault();
    if (escalationReason.trim().length < 10) {
      toast.error(tLabel("Please provide a reason for escalation (minimum 10 characters).", "மேல்முறையீட்டிற்கான காரணத்தை வழங்கவும் (குறைந்தது 10 எழுத்துக்கள்)."));
      return;
    }
    try {
      setSubmittingEscalation(true);
      await api.patch(`/tickets/${ticketId}`, {
        status: 'ESCALATED',
        notes: escalationReason.trim()
      });
      toast.success(tLabel("Grievance escalated to the next level of authority.", "புகார் அடுத்த நிலை அதிகாரிக்கு மேல்முறையீடு செய்யப்பட்டது."));
      setEscalatingTicket(null);
      setEscalationReason('');
      fetchTickets(true);
    } catch (err) {
      console.error('Failed to escalate ticket:', err);
      const errMsg = err.response?.data?.error || 'Failed to escalate grievance';
      toast.error(tLabel(errMsg, 'மேல்முறையீடு செய்ய முடியவில்லை'));
    } finally {
      setSubmittingEscalation(false);
    }
  };

  // Status Style Chip resolver
  const getStatusChipConfig = (ticket) => {
    const status = ticket.status.toUpperCase();
    if (status === 'SUBMITTED') {
      return { label: tLabel('Submitted', 'பதிவானது'), classes: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    if (status === 'ASSIGNED') {
      return { label: tLabel('Assigned', 'ஒதுக்கப்பட்டது'), classes: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (status === 'IN_PROGRESS') {
      return { label: tLabel('In Progress', 'நடவடிக்கையில்'), classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (status === 'RESOLVED') {
      return { label: tLabel('Resolved', 'தீர்க்கப்பட்டது'), classes: 'bg-emerald-50 text-emerald-700 border-emerald-250' };
    }
    if (status === 'CLOSED') {
      return { label: tLabel('Closed', 'மூடப்பட்டது'), classes: 'bg-slate-800 text-white border-slate-700' };
    }
    if (status === 'REOPENED') {
      return { label: tLabel('Reopened', 'மீண்டும் திறக்கப்பட்டது'), classes: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (status === 'ESCALATED') {
      const roleName = ticket.assignedTo?.role || tLabel('Higher Officer', 'உயர் அதிகாரி');
      return { 
        label: tLabel(`ESCALATED — ${roleName}`, `மேல்முறையீடு — ${roleName}`),
        classes: 'bg-orange-50 text-orange-700 border-orange-200 font-black' 
      };
    }
    return { label: status, classes: 'bg-slate-50 text-slate-600' };
  };

  // SLA Calculation helper
  const getSlaBadge = (ticket) => {
    const status = ticket.status.toUpperCase();
    const isActive = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'].includes(status);
    if (!isActive) return null;

    const deadline = ticket.deadline ? new Date(ticket.deadline) : new Date(new Date(ticket.createdAt).getTime() + 48*60*60*1000);
    const diffMs = deadline - new Date();
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs < 0) {
      return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-red-300 bg-red-100 text-red-800 animate-pulse uppercase tracking-wider shrink-0 shadow-xs">
          🚨 SLA BREACHED
        </span>
      );
    }

    if (diffHrs < 8) {
      return (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-orange-300 bg-orange-100 text-orange-850 uppercase tracking-wider shrink-0 shadow-xs">
          ⏰ {Math.round(diffHrs)} hrs left
        </span>
      );
    }

    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-250 bg-emerald-50 text-emerald-800 uppercase tracking-wider shrink-0 shadow-xs">
        ⏱️ {Math.round(diffHrs)} hrs left
      </span>
    );
  };

  // Reopen window check for CLOSED status
  const isReopenWindowActive = (ticket) => {
    if (ticket.status.toUpperCase() !== 'CLOSED') return false;
    const closedDate = new Date(ticket.updatedAt);
    const diffTime = Math.abs(new Date() - closedDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= REOPEN_WINDOW_DAYS;
  };

  // Stepper steps builder from SINGLE SOURCE OF TRUTH department chains
  const buildTimelineStepper = (ticket) => {
    const status = ticket.status.toUpperCase();
    const dbSteps = ticket.hierarchySteps || [];

    // 1. Submitted Step
    const steps = [
      {
        key: 'SUBMITTED',
        role: 'Citizen',
        title: tLabel('Submitted', 'சமர்ப்பிக்கப்பட்டது'),
        desc: tLabel('Grievance registered in system', 'புகார் கணினியில் பதிவு செய்யப்பட்டுள்ளது')
      }
    ];

    // 2. Intermediate officer roles from database config
    dbSteps.forEach(s => {
      const role = s.role;
      let title = s.label || role;
      let desc = tLabel('Escalated — under review', 'மேல்முறையீடு — ஆய்வில் உள்ளது');

      if (role === 'Assistant Area Engineer' || role === 'AAE') {
        title = tLabel('Assistant Area Engineer', 'உதவிப் பகுதிப் பொறியாளர்');
        desc = tLabel('Under review & field work assignment', 'மதிப்பாய்வு மற்றும் களப்பணி ஒதுக்கீடு');
      } else if (role === 'Area Engineer' || role === 'AE') {
        title = tLabel('Area Engineer', 'பகுதிப் பொறியாளர்');
        desc = tLabel('Escalated — area-level review', 'மேல்முறையீடு — பகுதி அளவிலான ஆய்வு');
      } else if (role === 'Junior Engineer' || role === 'JE') {
        title = tLabel('Junior Engineer (JE)', 'இளநிலைப் பொறியாளர் (JE)');
        desc = tLabel('Inspects and assigns road crew', 'சாலைப் பணியாளர்களை ஆய்வு செய்து நியமிக்கிறார்');
      } else if (role === 'Assistant Executive Engineer' || role === 'AEE') {
        title = tLabel('Assistant Executive Engineer (AEE)', 'உதவிச் செயற்பொறியாளர் (AEE)');
        desc = tLabel('Escalated — divisional review', 'மேல்முறையீடு — கோட்ட அளவிலான ஆய்வு');
      } else if (role === 'Executive Engineer' || role === 'EE') {
        title = tLabel('Executive Engineer (EE)', 'செயற்பொறியாளர் (EE)');
        desc = tLabel('Escalated — district-level review', 'மேல்முறையீடு — மாவட்ட அளவிலான ஆய்வு');
      } else if (role === 'Superintending Engineer' || role === 'SE') {
        title = tLabel('Superintending Engineer (SE)', 'மேற்பார்வைப் பொறியாளர் (SE)');
        desc = tLabel('Escalated — regional-level review', 'மேல்முறையீடு — மண்டல அளவிலான ஆய்வு');
      } else if (role === 'Chief Engineer' || role === 'CE') {
        title = tLabel('Chief Engineer (CE)', 'தலைமைப் பொறியாளர் (CE)');
        desc = tLabel('Escalated — statewide department review', 'மேல்முறையீடு — மாநில அளவிலான ஆய்வு');
      } else if (role.includes('Minister')) {
        title = tLabel(role, role);
        desc = tLabel(`Escalated to Hon'ble ${role}`, `மதிப்பிற்குரிய ${role}க்கு அனுப்பப்பட்டது`);
      } else if (role === 'Division Sanitary Inspector' || role === 'DSI') {
        title = tLabel('Division Sanitary Inspector', 'வட்டார சுகாதார ஆய்வாளர்');
        desc = tLabel('Under review at ward level', 'வார்டு அளவிலான மதிப்பாய்வு');
      }

      steps.push({
        key: role.toUpperCase().replace(/\s+/g, '_'),
        role: role,
        title,
        desc
      });
    });

    // 3. Resolved Step
    steps.push({
      key: 'RESOLVED',
      role: 'Resolved',
      title: tLabel('Resolved', 'தீர்க்கப்பட்டது'),
      desc: tLabel('Issue marked as resolved by department', 'சிக்கல் தீர்க்கப்பட்டதாக துறை அறிவித்துள்ளது')
    });

    // Find current active step index
    let activeIdx = 0;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      activeIdx = steps.length - 1; 
    } else if (['ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'].includes(status)) {
      const currentRole = ticket.assignedTo?.role;
      const idx = steps.findIndex(s => matchRole(s.role, currentRole));
      activeIdx = idx === -1 ? 1 : idx;
    }

    // Determine completion status, timestamps, and skipping rules
    const history = ticket.history || [];
    const timestamps = {};
    timestamps[0] = ticket.createdAt; // Submitted is always filed time

    // Find entry times for steps from history
    for (let i = 1; i < steps.length; i++) {
      const step = steps[i];
      const assignEvent = history.find(h => 
        h.employee?.role && matchRole(step.role, h.employee.role)
      );
      if (assignEvent) {
        timestamps[i] = assignEvent.createdAt;
      } else if (i <= activeIdx) {
        // Fallback estimate if history is clean or seeded
        timestamps[i] = new Date(new Date(ticket.createdAt).getTime() + i * 15 * 60 * 1000).toISOString();
      }
    }

    // Calculate step durations and skipped state
    const stepStates = [];
    
    // Find resolving role index for resolution skipping logic
    let resolverIdx = steps.length - 1; // default is last officer
    if (['RESOLVED', 'CLOSED'].includes(status)) {
      const resolveEv = history.find(h => h.action.includes('RESOLVED'));
      const resolverRole = resolveEv?.employee?.role || ticket.assignedTo?.role;
      if (resolverRole) {
        const idx = steps.findIndex(s => matchRole(s.role, resolverRole));
        if (idx !== -1) resolverIdx = idx;
      }
    }

    steps.forEach((step, idx) => {
      let stepState = 'pending'; // completed, current, skipped, pending
      let durationStr = '';

      if (['RESOLVED', 'CLOSED'].includes(status)) {
        if (idx === 0 || (idx >= 1 && idx <= resolverIdx)) {
          stepState = 'completed';
        } else {
          stepState = 'skipped';
        }
      } else {
        if (idx < activeIdx) {
          stepState = 'completed';
        } else if (idx === activeIdx) {
          stepState = 'current';
        } else {
          stepState = 'pending';
        }
      }

      // Calculate Duration for completed intermediate steps
      if (stepState === 'completed' && idx < steps.length - 1) {
        // Find next completed/valid step index
        let nextValidIdx = null;
        for (let next = idx + 1; next < steps.length; next++) {
          if (timestamps[next]) {
            nextValidIdx = next;
            break;
          }
        }
        if (nextValidIdx !== null && timestamps[idx] && timestamps[nextValidIdx]) {
          const diffMs = new Date(timestamps[nextValidIdx]) - new Date(timestamps[idx]);
          durationStr = formatDuration(diffMs);
        }
      }

      stepStates.push({
        ...step,
        state: stepState,
        time: timestamps[idx] ? formatDateTime(timestamps[idx]) : '',
        duration: durationStr
      });
    });

    return { loading: false, steps: stepStates, activeIdx, error: null };
  };

  // Calculations for counts in filters
  const counts = {
    all: tickets.length,
    active: tickets.filter(t => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'].includes(t.status.toUpperCase())).length,
    resolved: tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status.toUpperCase())).length,
  };

  // Filters & Sorting logic
  const processedTickets = tickets
    .filter(t => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const idMatches = t.ticketNumber.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const titleMatches = t.title.toLowerCase().includes(q);
        const descMatches = t.description.toLowerCase().includes(q);
        if (!idMatches && !titleMatches && !descMatches) return false;
      }

      // 2. Status Tab Filter
      const status = t.status.toUpperCase();
      if (filter === 'all') return true;
      if (filter === 'active') return ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'].includes(status);
      if (filter === 'resolved') return ['RESOLVED', 'CLOSED'].includes(status);
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'updated') return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });

  // Empty state texts
  const getEmptyStateText = () => {
    switch(filter) {
      case 'active':
        return { title: tLabel("No active grievances", "செயலில் உள்ள புகார்கள் இல்லை"), desc: tLabel("All your submitted grievances are resolved or closed.", "நீங்கள் சமர்ப்பித்த அனைத்து புகார்களும் தீர்க்கப்பட்டுள்ளன.") };
      case 'resolved':
        return { title: tLabel("No resolved grievances yet", "தீர்க்கப்பட்ட புகார்கள் இல்லை"), desc: tLabel("When officers resolve your issue, it will show up here for your verification.", "அதிகாரிகள் தீர்க்கும்போது, உங்கள் சரிபார்ப்புக்காக அவை இங்கு தோன்றும்.") };
      default:
        return { title: tLabel("No grievances yet", "புகார்கள் இன்னும் பதியப்படவில்லை"), desc: tLabel("Need assistance? File a grievance and track its resolution progress here.", "உதவி தேவையா? புகாரைப் பதிவு செய்து, அதன் தீர்வு முன்னேற்றத்தை இங்கே கண்காணிக்கவும்.") };
    }
  };

  const emptyState = getEmptyStateText();

  return (
    <div className="min-h-screen bg-[#F0EBE3] pb-24 font-sans select-none">
      
      {/* ══ HEADER ══ */}
      <div className="bg-white sticky top-0 z-40 border-b border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="h-16 px-4 flex justify-between items-center w-full max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/citizen')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:text-[#8B1A1A] cursor-pointer hover:bg-red-50/50 transition-all"
            title={tLabel("Back to Home", "முகப்புக்கு")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">
            {tLabel("Track My Grievances", "என் புகார்கள் கண்காணிப்பு")}
          </h2>

          <button 
            onClick={triggerRefresh}
            disabled={refreshing}
            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#8B1A1A] cursor-pointer hover:bg-red-50/50 transition-all ${refreshing ? 'animate-spin text-[#8B1A1A]' : ''}`}
            title={tLabel("Refresh", "புதுப்பி")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-3xl mx-auto space-y-4">
        
        {/* ══ SEARCH & SORT CONTROLS ══ */}
        <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={tLabel("Search by Ticket ID / Title...", "புகார் எண் / தலைப்பில் தேடவும்...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/70 focus:border-[#8B1A1A] outline-none pl-10 pr-4 py-3 rounded-xl text-slate-700 text-xs font-bold transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <SlidersHorizontal className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-455 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 focus:border-[#8B1A1A] outline-none pl-10 pr-8 py-3 rounded-xl text-slate-700 text-xs font-black appearance-none cursor-pointer"
              >
                <option value="newest">{tLabel("Recent ▾", "புதியவை ▾")}</option>
                <option value="oldest">{tLabel("Oldest ▴", "பழையவை ▴")}</option>
                <option value="updated">{tLabel("Last Updated 🗘", "புதுப்பிக்கப்பட்டவை 🗘")}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-4 w-3 h-3 text-slate-455 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ══ SIMPLIFIED FILTER TABS ══ */}
        <div className="bg-white rounded-2xl border border-slate-200/85 p-1.5 flex gap-1 shadow-xs">
          {[
            { id: 'all', en: 'ALL', ta: 'அனைத்தும்' },
            { id: 'active', en: 'ACTIVE', ta: 'செயலில்' },
            { id: 'resolved', en: 'RESOLVED', ta: 'தீர்க்கப்பட்டவை' }
          ].map(tab => {
            const active = filter === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  setExpandedId(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  active
                    ? 'bg-[#8B1A1A] text-white shadow-sm'
                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span>{tLabel(tab.en, tab.ta)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-550'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ══ LOADING STATE ══ */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-[#8B1A1A] animate-spin" />
            <p className="text-xs font-bold text-slate-500">{tLabel("Loading grievances...", "புகார்கள் ஏற்றப்படுகின்றன...")}</p>
          </div>
        ) : processedTickets.length === 0 ? (
          
          /* ══ EMPTY STATE ══ */
          <div className="text-center py-16 px-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center max-w-md mx-auto">
            <span className="text-5xl block mb-4">📋</span>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              {emptyState.title}
            </h4>
            <p className="text-[11.5px] text-slate-500 font-bold mt-1.5 leading-relaxed text-center">
              {emptyState.desc}
            </p>
            <button
              onClick={() => navigate('/citizen/submit')}
              className="mt-6 bg-[#8B1A1A] text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-md hover:bg-[#6b1414] transition-all cursor-pointer"
            >
              {tLabel("File a New Grievance", "புதிய புகாரைப் பதிவு செய்")}
            </button>
          </div>

        ) : (
          
          /* ══ GRIEVANCE LIST ══ */
          <div className="space-y-3">
            {processedTickets.map(ticket => {
              const statusKey = ticket.status.toUpperCase();
              const displayStatus = getStatusChipConfig(ticket);
              const isExpanded = expandedId === ticket.id;
              
              const createdDate = new Date(ticket.createdAt);
              const updatedTimeStr = formatDateTime(ticket.updatedAt);
              const filedDateStr = createdDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              
              const stepperData = buildTimelineStepper(ticket);

              return (
                <div
                  key={ticket.id}
                  id={`ticket-${ticket.id}`}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-slate-350 shadow-md' : 'border-slate-200/80 hover:border-slate-300 shadow-xs'}`}
                >
                  
                  {/* Card Header Tap Area */}
                  <div 
                    onClick={() => {
                      setExpandedId(isExpanded ? null : ticket.id);
                      setShowReopenForm(false);
                      setReopenText('');
                    }}
                    className="p-4 cursor-pointer select-none"
                  >
                    
                    {/* Line 1: ID, Category Emoji, Title */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg shrink-0 mt-0.5" title={ticket.department?.name}>
                          {getCategoryIcon(ticket.department?.name)}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-mono text-slate-450 font-black tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                              #JN-{ticket.ticketNumber}
                            </span>
                            <span className="text-[10px] font-black uppercase bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/15 px-1.5 py-0.5 rounded-md">
                              {ticket.ward || tLabel('Constituency', 'தொகுதி')}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 mt-1.5 leading-snug line-clamp-1">
                            {ticket.title}
                          </h4>
                        </div>
                      </div>

                      {/* Status Chip */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 shadow-xxs transition-all ${displayStatus.classes}`}>
                        {displayStatus.label}
                      </span>
                    </div>

                    {/* Line 2: Details metadata */}
                    <div className="flex items-center justify-between mt-3 text-[10.5px] font-extrabold text-slate-455 border-t border-slate-100 pt-2.5">
                      <div className="flex gap-4">
                        <span>{tLabel(`Filed: ${filedDateStr}`, `பதிவு: ${filedDateStr}`)}</span>
                        <span>🤝 {ticket.claimCount} {tLabel("Claims", "கோரிக்கைகள்")}</span>
                      </div>
                      
                      {/* SLA Warning */}
                      {getSlaBadge(ticket)}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 border-t border-slate-100 overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          
                          {/* 1. Description */}
                          <div>
                            <span className="text-[9.5px] font-black text-slate-450 block tracking-widest uppercase">
                              {tLabel("Citizen Grievance Description", "புகார் விளக்கம்")}
                            </span>
                            <p className="text-xs font-bold text-slate-700 mt-1 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed shadow-xxs">
                              {ticket.description}
                            </p>
                          </div>

                          {/* 2. Before/After Proof Photos */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Before Photo */}
                            <div>
                              <span className="text-[9.5px] font-black text-slate-450 block tracking-widest uppercase mb-1">
                                📸 {tLabel("Grievance Photo (Before)", "புகார் புகைப்படம் (முன்)")}
                              </span>
                              {ticket.photo ? (
                                <div className="aspect-video w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xxs">
                                  <img src={getMediaUrl(ticket.photo)} alt="Before Grievance" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="aspect-video w-full rounded-xl border border-slate-200/50 bg-slate-100 flex items-center justify-center text-[10.5px] font-extrabold text-slate-400 shadow-xxs">
                                  {tLabel("No photo attached", "புகைப்படம் இணைக்கப்படவில்லை")}
                                </div>
                              )}
                            </div>

                            {/* After Photo (Resolved/Closed status) */}
                            {['RESOLVED', 'CLOSED'].includes(statusKey) && (
                              <div>
                                <span className="text-[9.5px] font-black text-emerald-600 block tracking-widest uppercase mb-1">
                                  📷 {tLabel("Resolution Proof (After)", "தீர்வுக்கான சான்று (பின்)")}
                                </span>
                                {ticket.proofPhoto ? (
                                  <div className="aspect-video w-full rounded-xl border border-emerald-200 overflow-hidden bg-slate-900 shadow-xxs">
                                    <img src={getMediaUrl(ticket.proofPhoto)} alt="Resolution Proof" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="aspect-video w-full rounded-xl border border-slate-250 bg-slate-100 flex items-center justify-center text-[10.5px] font-extrabold text-slate-400 shadow-xxs">
                                    {tLabel("No resolution proof image", "தீர்வு படம் இல்லை")}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 3. GPS Map Pin Location */}
                          {ticket.lat && ticket.lng && (
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-black text-slate-450 block tracking-widest uppercase">
                                📍 {tLabel("GPS Pin Location", "வரைபடத்தில் இருப்பிடம்")}
                              </span>
                              <div className="bg-white border border-slate-200 p-1.5 rounded-xl shadow-xxs">
                                <ErrorBoundary>
                                  <div style={{ height: '140px', width: '100%' }} className="rounded-lg overflow-hidden relative z-10">
                                    <MapContainer
                                      center={[ticket.lat, ticket.lng]}
                                      zoom={15}
                                      zoomControl={false}
                                      scrollWheelZoom={false}
                                      dragging={false}
                                      doubleClickZoom={false}
                                      style={{ height: '100%', width: '100%' }}
                                    >
                                      <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; Carto'
                                      />
                                      <CircleMarker
                                        center={[ticket.lat, ticket.lng]}
                                        radius={8}
                                        fillColor="#8B1A1A"
                                        color="white"
                                        weight={2}
                                        fillOpacity={0.9}
                                      />
                                    </MapContainer>
                                  </div>
                                </ErrorBoundary>
                                <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-400 mt-1.5 px-1">
                                  <span>LAT: {ticket.lat.toFixed(6)} | LNG: {ticket.lng.toFixed(6)}</span>
                                  <span>{tLabel("Geo-Stamped GPS", "புவிக்குறியீடு")}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. Dynamic Stepper Timeline */}
                          <div className="border-t border-slate-200/50 pt-3">
                            <span className="text-[9.5px] font-black text-slate-450 block tracking-widest uppercase mb-4">
                              ⏳ {tLabel("Department Official Escallation Stepper", "அதிகாரபூர்வ துறை நிலைகளின் காலவரிசை")}
                            </span>
                            
                            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                              {stepperData.loading && (
                                <div className="text-xs font-bold text-slate-500 flex items-center gap-2 py-2">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8B1A1A]" />
                                  {tLabel("Loading status chain...", "நிலையை ஏற்றுகிறது...")}
                                </div>
                              )}
                              {stepperData.error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
                                  {stepperData.error}
                                </div>
                              )}
                              {!stepperData.loading && !stepperData.error && stepperData.steps.map((step, idx) => {
                                const isCompleted = step.state === 'completed';
                                const isActive = step.state === 'current';
                                const isSkipped = step.state === 'skipped';
                                const isReopenedState = statusKey === 'REOPENED' && isActive;

                                let iconBg = 'bg-slate-200 border border-slate-350 text-slate-500';
                                let dotContent = <span className="text-[9px]">{idx + 1}</span>;
                                let cardBorder = 'border-slate-100 bg-slate-50/50';

                                if (isCompleted) {
                                  iconBg = 'bg-[#8B1A1A] border-none text-white flex items-center justify-center shadow-xs';
                                  dotContent = <span className="text-[9px] font-black">✓</span>;
                                  cardBorder = 'border-slate-250 bg-white';
                                } else if (isActive) {
                                  if (isReopenedState) {
                                    iconBg = 'bg-red-500 border-none text-white flex items-center justify-center relative shadow-xs';
                                    dotContent = <ShieldAlert className="w-2.5 h-2.5 text-white animate-pulse" />;
                                    cardBorder = 'border-red-300 bg-red-50/30 border-l-[3px] border-l-red-500';
                                  } else {
                                    iconBg = 'bg-amber-500 border-none text-white flex items-center justify-center relative shadow-xs';
                                    dotContent = <Clock className="w-2.5 h-2.5 text-white animate-pulse" />;
                                    cardBorder = 'border-amber-200 bg-amber-50/30 border-l-[3px] border-l-amber-500';
                                  }
                                } else if (isSkipped) {
                                  iconBg = 'bg-slate-100 border border-slate-200 text-slate-300';
                                  dotContent = <span className="text-[9px]">◌</span>;
                                  cardBorder = 'border-slate-150 bg-slate-100/30 opacity-45 line-through';
                                } else {
                                  cardBorder = 'border-slate-100 bg-slate-50/30 opacity-60';
                                }

                                // Fetch latest action note for active step
                                const stepActionNotes = ticket.history?.[0]?.notes;

                                return (
                                  <div key={step.key} className="relative flex flex-col items-start select-none">
                                    
                                    {/* Indicator Circle */}
                                    <div 
                                      style={{ left: '-24px' }}
                                      className={`absolute top-1.5 w-[14px] h-[14px] rounded-full border border-white flex items-center justify-center z-10 ${iconBg}`}
                                    >
                                      {dotContent}
                                    </div>

                                    {/* Stepper Details */}
                                    <div className={`w-full rounded-xl p-3 border flex justify-between items-center transition-all ${cardBorder}`}>
                                      <div className="flex-1 min-w-0 pr-2">
                                        <h5 className={`text-[12px] font-black flex items-center gap-1.5 flex-wrap ${isActive ? (isReopenedState ? 'text-red-800' : 'text-amber-800') : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                          <span>{idx + 1}. {step.title}</span>
                                          {isSkipped && (
                                            <span className="text-[8.5px] font-bold bg-slate-200/60 text-slate-500 border border-slate-300/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                              {tLabel("Skipped", "தவிர்க்கப்பட்டது")}
                                            </span>
                                          )}
                                        </h5>
                                        
                                        {/* Sub-label for In-Progress details under active level */}
                                        {isActive && !isReopenedState && (
                                          <span className="text-[10.5px] text-amber-700 font-bold block mt-1 bg-amber-100/40 border border-amber-200/30 p-1.5 rounded-lg">
                                            ⚙️ {tLabel("In Progress: Under Active Action", "நடவடிக்கையில் உள்ளது: செயலிலுள்ள பணிகள்")}
                                            {stepActionNotes && <span className="block text-[9.5px] text-slate-500 font-medium mt-0.5">({stepActionNotes})</span>}
                                          </span>
                                        )}

                                        {isReopenedState && (
                                          <span className="text-[10.5px] text-red-700 font-bold block mt-1 bg-red-100/40 border border-red-200/30 p-1.5 rounded-lg">
                                            ⚠️ {tLabel("Reopened: Sent back for Priority Action", "மீண்டும் திறக்கப்பட்டது: முன்னுரிமைப் பணிகள்")}
                                            {ticket.reopenReason && <span className="block text-[9.5px] text-slate-500 font-medium mt-0.5">({ticket.reopenReason})</span>}
                                          </span>
                                        )}

                                        {!isActive && (
                                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5 leading-tight">
                                            {step.desc}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                        {step.time && (
                                          <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100/50 border border-slate-200/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                                            {step.time}
                                          </span>
                                        )}
                                        {step.duration && (
                                          <span className="text-[9px] font-black text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50 uppercase tracking-wide">
                                            {step.duration}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4.5 ACTIVE STATE ACTIONS (escalate) */}
                          {['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(statusKey) && (
                            <div className="border-t border-slate-200/50 pt-4 flex justify-between items-center">
                              <p className="text-[10px] text-slate-400 font-bold max-w-[180px]">
                                {tLabel("Not satisfied with progress? Escalate to a senior official.", "நடவடிக்கையில் அதிருப்தியா? உயர் அதிகாரிக்கு மேல்முறையீடு செய்யவும்.")}
                              </p>
                              <button
                                onClick={() => {
                                  setEscalatingTicket(ticket);
                                  setEscalationReason('');
                                }}
                                className="h-10 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[11px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>{tLabel("Escalate Grievance", "மேல்முறையீடு")}</span>
                              </button>
                            </div>
                          )}

                          {/* 5. RESOLVED STATE ACTIONS (star rating feedback, confirm resolved, reopen issue) */}
                          {statusKey === 'RESOLVED' && (
                            <div className="border-t border-slate-200/50 pt-4 space-y-3">
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2.5">
                                <span className="text-lg">🎉</span>
                                <div>
                                  <h5 className="text-[13px] font-black text-emerald-800 uppercase tracking-wider">{tLabel("Department Resolution Notice", "துறை தீர்வு அறிவிப்பு")}</h5>
                                  <p className="text-[10.5px] font-bold text-emerald-700 mt-0.5">
                                    {tLabel(`Resolved on ${updatedTimeStr}`, `${updatedTimeStr} அன்று தீர்க்கப்பட்டது`)}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xxs space-y-4">
                                <div className="text-center space-y-1">
                                  <h6 className="text-[12px] font-black text-slate-800">
                                    {tLabel("Was your issue properly resolved? Give feedback", "உங்கள் பிரச்சினை சரியாக தீர்க்கப்பட்டதா? மதிப்பீடு செய்க")}
                                  </h6>
                                  <p className="text-[10px] text-slate-400 font-bold">
                                    {tLabel("Providing a star rating is required to confirm resolved.", "தீர்க்கப்பட்டதை உறுதிசெய்ய மதிப்பீடு வழங்குவது அவசியமாகும்.")}
                                  </p>
                                </div>

                                {/* Interactive Rating selector */}
                                <div className="flex justify-center py-1.5">
                                  <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setActiveRating(star)}
                                        className="transform hover:scale-125 transition-transform cursor-pointer"
                                      >
                                        <Star 
                                          className={`w-8 h-8 ${star <= activeRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-slate-350'}`} 
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {showReopenForm ? (
                                  <form onSubmit={(e) => handleReopenSubmit(e, ticket.id)} className="space-y-3 pt-2">
                                    <span className="text-[9.5px] font-black text-red-600 block tracking-widest uppercase">
                                      ⚠️ {tLabel("Provide Reason for Reopening (Min 10 characters)", "மீண்டும் திறப்பதற்கான காரணம் (குறைந்தது 10 எழுத்துக்கள்)")}
                                    </span>
                                    <textarea
                                      required
                                      rows={2}
                                      value={reopenText}
                                      onChange={(e) => setReopenText(e.target.value)}
                                      placeholder={tLabel("Describe why the issue is not resolved or explain the remaining issue...", "பிரச்சினை ஏன் தீர்க்கப்படவில்லை என்பதை விவரிக்கவும்...")}
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 outline-none p-3 rounded-xl text-slate-700 text-xs font-bold resize-none shadow-inner"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowReopenForm(false);
                                          setReopenText('');
                                        }}
                                        className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[11px] uppercase cursor-pointer"
                                      >
                                        {tLabel("Back", "பின்செல்")}
                                      </button>
                                      <button
                                        type="submit"
                                        className="h-11 flex-1 bg-red-650 text-white font-extrabold text-[11px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:bg-red-700 transition-all cursor-pointer"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{tLabel("Reopen Issue", "புகாரை மீண்டும் திறக்கவும்")}</span>
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Reopen Trigger */}
                                    <button
                                      type="button"
                                      onClick={() => setShowReopenForm(true)}
                                      className="h-12 bg-white border border-red-200 hover:bg-red-50/50 text-red-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                      <span>{tLabel("No, Reopen", "இல்லை, மீண்டும் திற")}</span>
                                    </button>

                                    {/* Confirm Resolved Trigger */}
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmResolved(ticket.id)}
                                      className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>{tLabel("✓ Confirm Resolved", "✓ தீர்க்கப்பட்டது")}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 6. CLOSED STATE ACTIONS & RATINGS */}
                          {statusKey === 'CLOSED' && (
                            <div className="border-t border-slate-200/50 pt-4 space-y-3">
                              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 shadow-xxs space-y-3">
                                
                                {/* Feedbacks display */}
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                                    {tLabel("Citizen Rating Feedback", "பொதுமக்கள் மதிப்பீடு")}
                                  </span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star}
                                        className={`w-4 h-4 ${star <= (ticket.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Check reopen window constraints */}
                                {isReopenWindowActive(ticket) ? (
                                  <div className="pt-2 border-t border-slate-200/60">
                                    {showReopenForm ? (
                                      <form onSubmit={(e) => handleReopenSubmit(e, ticket.id)} className="space-y-3">
                                        <textarea
                                          required
                                          rows={2}
                                          value={reopenText}
                                          onChange={(e) => setReopenText(e.target.value)}
                                          placeholder={tLabel("Describe why you are reopening this closed issue (Min 10 characters)...", "மூடப்பட்ட புகாரை மீண்டும் திறப்பதற்கான காரணம் (குறைந்தது 10 எழுத்துக்கள்)...")}
                                          className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 outline-none p-3 rounded-xl text-slate-700 text-xs font-bold resize-none shadow-inner"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowReopenForm(false);
                                              setReopenText('');
                                            }}
                                            className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[11px] uppercase cursor-pointer"
                                          >
                                            {tLabel("Cancel", "ரத்து")}
                                          </button>
                                          <button
                                            type="submit"
                                            className="h-10 flex-1 bg-red-650 text-white font-extrabold text-[11px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:bg-red-700 transition-all cursor-pointer"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>{tLabel("Reopen Grievance", "புகாரை மீண்டும் திற")}</span>
                                          </button>
                                        </div>
                                      </form>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <p className="text-[10px] text-slate-450 font-bold text-center">
                                          {tLabel(`Closed on ${updatedTimeStr}. You can reopen this closed grievance within ${REOPEN_WINDOW_DAYS} days.`, `${updatedTimeStr} அன்று மூடப்பட்டது. ${REOPEN_WINDOW_DAYS} நாட்களுக்குள் மீண்டும் திறக்கலாம்.`)}
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => setShowReopenForm(true)}
                                          className="h-10 px-6 bg-white border border-red-200 hover:bg-red-50/50 text-red-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all w-full sm:w-auto"
                                        >
                                          <ThumbsDown className="w-4 h-4" />
                                          <span>{tLabel("↻ Reopen Closed Issue", "↻ புகாரை மீண்டும் திற")}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-450 font-bold text-center pt-2 border-t border-slate-200/60">
                                    {tLabel(`Closed on ${updatedTimeStr}. Reopen window has expired (7 days).`, `${updatedTimeStr} அன்று மூடப்பட்டது. மீண்டும் திறக்கும் காலம் முடிவடைந்துவிட்டது (7 நாட்கள்).`)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 7. REOPENED REASON NOTICE DISPLAY */}
                          {statusKey === 'REOPENED' && ticket.reopenReason && (
                            <div className="border-t border-slate-200/50 pt-4">
                              <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 space-y-2 text-red-900 select-none">
                                <div className="flex items-center gap-2 font-black text-xs text-red-800 uppercase tracking-wider">
                                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                  <span>{tLabel("Reopen Request Registered", "மீண்டும் திறக்கப்பட்ட கோரிக்கை")}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9.5px] font-bold text-slate-450 block tracking-widest uppercase">
                                    {tLabel("Citizen Reopen Observations", "மீண்டும் திறப்பதற்கான உங்களின் குறிப்பு")}
                                  </span>
                                  <p className="text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-red-200/40">
                                    {ticket.reopenReason}
                                  </p>
                                </div>
                                <p className="text-[10px] text-red-700 font-bold pt-1 leading-normal">
                                  {tLabel("🗘 Grievance has been routed back to department officers for priority intervention.", "🗘 புகார் முன்னுரிமை நடவடிக்கைகளுக்காக துறை அதிகாரிகளுக்கு மீண்டும் அனுப்பப்பட்டுள்ளது.")}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ ESCALATION DIALOG MODAL ══ */}
      {escalatingTicket && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 shrink-0">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {tLabel('Escalate Grievance', 'புகாரை மேல்முறையீடு செய்')}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  {tLabel(`Ticket #JN-${escalatingTicket.ticketNumber}`, `புகார் #JN-${escalatingTicket.ticketNumber}`)}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => handleEscalateSubmit(e, escalatingTicket.id)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-0.5">
                  {tLabel('Reason for Escalation (Min 10 characters)', 'மேல்முறையீட்டுக்கான காரணம் (குறைந்தது 10 எழுத்துக்கள்)')}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={3}
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder={tLabel('Explain why you are escalating this issue (e.g. prolonged delay, poor response)...', 'ஏன் இந்த புகாரை மேல்முறையீடு செய்கிறீர்கள் என்பதை விளக்கவும்...')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 outline-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 transition-colors resize-none leading-relaxed shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalatingTicket(null)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  {tLabel('Cancel', 'ரத்து செய்')}
                </button>
                <button
                  type="submit"
                  disabled={submittingEscalation}
                  style={{ backgroundColor: '#EA580C' }}
                  className="w-full text-white font-extrabold text-xs py-3 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingEscalation ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{tLabel('Confirm Escalate', 'உறுதி செய்')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
