import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LayoutDashboard, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export default function VolunteerDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const ward = localStorage.getItem('jn_ward_name') || 'Ward 1';

  const stats = [
    { label: tLabel('Ward Open', 'வார்டு திறந்த புகார்கள்'), value: 24, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: tLabel('Escalated by Me', 'என்னால் அனுப்பப்பட்டவை'), value: 8, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: tLabel('Resolved', 'தீர்க்கப்பட்டவை'), value: 42, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-50 flex items-center gap-3 h-14">
        <button onClick={() => navigate('/citizen')} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
          {tLabel('Volunteer Dashboard', 'தன்னார்வலர் டாஷ்போர்டு')}
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Ward Info */}
        <div className="bg-[#8B1A1A] rounded-3xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">{tLabel('Active Jurisdiction', 'செயலில் உள்ள வார்டு')}</p>
              <h3 className="text-lg font-black">{ward}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Mock */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{tLabel('Recent Actions', 'சமீபத்திய நடவடிக்கைகள்')}</h4>
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">
                    {tLabel(`Escalated ticket #TN-882${i} to Ward Officer`, `புகார் #TN-882${i}-ஐ வார்டு அதிகாரிக்கு அனுப்பியது`)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">{i} {tLabel('hours ago', 'மணி நேரத்திற்கு முன்பு')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
