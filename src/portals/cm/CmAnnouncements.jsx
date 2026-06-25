import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Send, Activity, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { TN_DISTRICTS } from '../../data/constituencies';

export default function CmAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastDistrict, setBroadcastDistrict] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleViewCitizenPortal = async () => {
    const testPhone = '9000000000';
    try {
      let res;
      try {
        res = await api.post('/auth/citizen/login', { phone: testPhone });
      } catch (err) {
        if (err.response?.data?.code === 'NOT_REGISTERED') {
          res = await api.post('/auth/citizen/signup', {
            phone: testPhone,
            name: 'CM Preview Citizen',
            district: 'Chennai'
          });
        } else {
          throw err;
        }
      }

      const { token, citizen } = res.data;

      // Clear employee session
      localStorage.removeItem('jn_emp_role');
      localStorage.removeItem('jn_emp_dept');
      localStorage.removeItem('jn_emp_jurisdiction');
      localStorage.removeItem('jn_emp_district');
      localStorage.removeItem('jn_emp_constituency');

      // Save citizen details
      localStorage.setItem('jn_token', token);
      localStorage.setItem('jn_user_id', citizen.id);
      localStorage.setItem('jn_role', 'citizen');
      localStorage.setItem('jn_name', citizen.name);
      localStorage.setItem('jn_is_volunteer', citizen.isVolunteer ? 'true' : 'false');
      localStorage.setItem('jn_volunteer_ward', citizen.volunteerWard || '');
      localStorage.setItem('jn_district', citizen.district || 'Chennai');
      localStorage.setItem('jn_living_district', citizen.district || 'Chennai');
      
      const completeAddress = `Parrys, ${citizen.district || 'Chennai'}, Tamil Nadu - 600001`;
      localStorage.setItem('jn_living_address', completeAddress);
      localStorage.setItem('jn_ward_name', 'Ward 1');
      localStorage.setItem('jn_ward_number', '1');
      localStorage.setItem('jn_living_ward', 'Ward 1');

      toast.success('Viewing Citizen Portal as Preview Citizen');
      navigate('/citizen/feed');
    } catch (err) {
      console.error('Failed to log in as preview citizen:', err);
      toast.error('Failed to redirect to Citizen Portal.');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/announcements', {
        title: broadcastTitle,
        text: broadcastText,
        district: broadcastDistrict
      });
      setAnnouncements([res.data, ...announcements]);
      setBroadcastTitle('');
      setBroadcastText('');
      setBroadcastDistrict('All');
      toast.success('Announcement broadcasted successfully!');
    } catch (err) {
      console.error('Failed to broadcast:', err);
      toast.error('Failed to broadcast announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Activity className="w-8 h-8 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#8B1A1A]" /> CM Announcements Broadcast
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Direct communication pipeline from the CM's office to the public
          </p>
        </div>
        <button
          onClick={handleViewCitizenPortal}
          className="px-4 py-2.5 bg-[#8B1A1A] hover:bg-red-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all self-start sm:self-center shrink-0 cursor-pointer"
        >
          View Citizen Portal
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* NEW BROADCAST FORM */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
              Create New Broadcast
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
              Dispatch statewide news feeds to citizens
            </span>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Announcement Title</label>
              <input
                type="text" required placeholder="Headline..."
                value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3 focus:border-[#8B1A1A]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Target Scope</label>
              <select
                value={broadcastDistrict}
                onChange={e => setBroadcastDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-3 outline-none cursor-pointer focus:border-[#8B1A1A]"
              >
                <option value="All">Statewide (All Citizens)</option>
                {TN_DISTRICTS.sort().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5 block">Announcement Body</label>
              <textarea
                rows={5} required
                value={broadcastText} onChange={e => setBroadcastText(e.target.value)}
                placeholder="Type statement contents..."
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl outline-none p-3 focus:border-[#8B1A1A] resize-none leading-relaxed"
              ></textarea>
            </div>

            <button 
              type="submit" disabled={submitting}
              className="w-full bg-[#8B1A1A] hover:bg-red-800 disabled:opacity-50 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              {submitting ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              Dispatch Broadcast
            </button>
          </form>
        </div>

        {/* BROADCAST HISTORY LOG */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
           <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                Recent Broadcasts
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                Active alerts currently visible to citizens
              </span>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase">
              {announcements.length} Active
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
            {announcements.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-8">No active announcements</p>
            ) : (
              announcements.map(a => (
                <div key={a.id} className="bg-blue-50 border border-blue-100 p-4 rounded-2xl relative">
                  <span className="bg-blue-100 text-blue-800 text-[8px] font-black uppercase px-2 py-0.5 rounded absolute top-3 right-3">
                    {a.district === 'All' ? 'Statewide' : a.district}
                  </span>
                  <h4 className="text-xs font-black text-blue-900 pr-16">{a.title}</h4>
                  <p className="text-xs font-bold text-blue-800/80 mt-1.5 leading-relaxed">{a.text}</p>
                  <div className="text-[9px] font-bold text-blue-500/70 mt-3 flex items-center justify-between">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
