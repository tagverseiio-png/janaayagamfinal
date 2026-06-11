import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Phone, Shield, Flame, Activity, Heart, Users, Landmark, Zap, AlertTriangle, Dog, Brain, HelpCircle } from 'lucide-react';

export default function SOSContact() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const helplines = [
    { category: 'CORE', items: [
      { name: tLabel('Police', 'காவல்துறை'), number: '100', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
      { name: tLabel('Fire', 'தீயணைப்புத் துறை'), number: '101', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
      { name: tLabel('Ambulance', 'ஆம்புலன்ஸ்'), number: '108', icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
      { name: tLabel('Health', 'சுகாதாரத் துறை'), number: '104', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ]},
    { category: 'WOMEN & CHILDREN', items: [
      { name: tLabel('Women Helpline', 'பெண்கள் உதவி எண்'), number: '1091', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
      { name: tLabel('Women in Distress', 'துன்பத்தில் உள்ள பெண்கள்'), number: '181', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
      { name: tLabel('Child Helpline', 'குழந்தைகள் உதவி எண்'), number: '1098', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' }
    ]},
    { category: 'GOVERNMENT', items: [
      { name: tLabel('CM Helpline', 'முதல்வர் உதவி எண்'), number: '1100', icon: Landmark, color: 'text-[#8B1A1A]', bg: 'bg-red-50' },
      { name: tLabel('Disaster Management', 'பேரிடர் மேலாண்மை'), number: '1077', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
      { name: tLabel('GCC (Chennai)', 'சென்னை மாநகராட்சி'), number: '1913', icon: Landmark, color: 'text-blue-700', bg: 'bg-blue-50' },
      { name: tLabel('TANGEDCO (Electricity)', 'மின்சார வாரியம்'), number: '9498794987', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' }
    ]},
    { category: 'OTHERS', items: [
      { name: tLabel('Animal Helpline', 'விலங்குகள் உதவி எண்'), number: '1962', icon: Dog, color: 'text-emerald-700', bg: 'bg-emerald-50' },
      { name: tLabel('Mental Health', 'மனநலம்'), number: '14416', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { name: tLabel('Health Control Room', 'சுகாதாரக் கட்டுப்பாட்டு அறை'), number: '1075', icon: HelpCircle, color: 'text-red-700', bg: 'bg-red-50' }
    ]}
  ];

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-50 flex items-center gap-3 h-14">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
          {tLabel('SOS Contacts', 'அவசர தொடர்புகள்')}
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Primary CTA */}
        <div className="bg-red-600 rounded-3xl p-6 shadow-xl shadow-red-200 text-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-black">{tLabel('Emergency Response', 'அவசரக்கால பதில்')}</h3>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{tLabel('Immediate Assistance', 'உடனடி உதவி')}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <Phone className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          
          <a
            href="tel:112"
            className="w-full bg-white text-red-600 font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all"
          >
            <Phone className="w-6 h-6 fill-red-600" />
            <span>{tLabel('CALL 112', 'அழைக்கவும் 112')}</span>
          </a>
          <p className="text-[10px] text-center font-bold opacity-70 uppercase tracking-tighter">
            {tLabel('Single Emergency Number for India', 'இந்தியாவிற்கான ஒற்றை அவசர எண்')}
          </p>
        </div>

        {/* Helplines List */}
        <div className="space-y-8">
          {helplines.map((group) => (
            <div key={group.category} className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {group.items.map((item) => (
                  <a
                    key={item.number}
                    href={`tel:${item.number}`}
                    className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between shadow-sm active:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-800">{item.name}</p>
                        <p className="text-xs font-mono font-bold text-slate-400 tracking-tighter">{item.number}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
