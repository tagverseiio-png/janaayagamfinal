import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ShieldAlert, UserCheck, Building2, Landmark, FileText, Award, ArrowLeft, Zap, Hammer } from 'lucide-react';
import api from '../../services/api';

const deptIcons = {
  Electricity: <Zap className="w-5 h-5 text-white" />,
  Roads: <Hammer className="w-5 h-5 text-white" />,
  'Electricity (TANGEDCO/EB)': <Zap className="w-5 h-5 text-white" />,
  'Highways & Minor Ports': <Hammer className="w-5 h-5 text-white" />
};

const deptColors = {
  Electricity: "#F59E0B",
  Roads: "#F97316",
  'Electricity (TANGEDCO/EB)': "#F59E0B",
  'Highways & Minor Ports': "#F97316"
};

export default function EscalationHierarchy() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState('');
  const [hierarchies, setHierarchies] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  useEffect(() => {
    api.get('/metadata/hierarchy')
      .then(res => {
        setHierarchies(res.data);
        if (res.data.length > 0) {
          setSelectedDept(res.data[0].department);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch hierarchies:', err);
        setLoading(false);
      });
  }, []);

  const getSteps = () => {
    const activeH = hierarchies.find(h => h.department === selectedDept);
    if (!activeH) return [];

    const steps = [
      {
        num: 1,
        role: "You (Citizen)",
        tamilRole: "நீங்கள் (குடிமகன்)",
        desc: "Submit complaint",
        tamilDesc: "புகாரைச் சமர்ப்பிக்கவும்",
        sla: "Instant",
        tamilSla: "உடனடி",
        color: "#3B82F6", 
        icon: <User className="w-5 h-5 text-white" />
      }
    ];

    activeH.steps.forEach((step, idx) => {
      steps.push({
        num: idx + 2,
        role: step.role,
        tamilRole: step.role,
        desc: `Verification & Action (${step.role})`,
        tamilDesc: `சரிபார்ப்பு மற்றும் நடவடிக்கை (${step.role})`,
        sla: `${step.slaDays} Day${step.slaDays > 1 ? 's' : ''} SLA`,
        color: deptColors[selectedDept] || "#8B1A1A",
        icon: idx === activeH.steps.length - 1 ? <Award className="w-5 h-5 text-white" /> : <ShieldAlert className="w-5 h-5 text-white" />
      });
    });

    return steps;
  };

  const steps = getSteps();

  return (
    <div className="pb-24 select-none">
      {/* ══ PAGE HEADER ══ */}
      <div className="bg-white sticky top-0 z-50 border-b border-[#DDE1E7] shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button
            onClick={() => navigate('/citizen')}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            style={{ minWidth: '44px', minHeight: '44px' }}
            title={tLabel("Back to Home", "முகப்புக்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
          </button>

          <h2 className="text-base font-black text-slate-800 tracking-wide">
            {tLabel("Escalation Matrix", "மேல்முறையீட்டு கட்டமைப்பு")}
          </h2>

          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Department Selector */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {hierarchies.map(h => (
            <button
              key={h.department}
              onClick={() => setSelectedDept(h.department)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${
                selectedDept === h.department 
                  ? 'bg-[#8B1A1A] border-[#8B1A1A] text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {h.department}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="mb-6 select-none">
          <h2 className="text-xl font-black text-[#8B1A1A]">
            {tLabel(`How your ${selectedDept} complaint travels`, `உங்கள் ${selectedDept} புகார் எப்படி செல்கிறது`)}
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {tLabel("Statewide digital escalation matrix", "மாநிலம் தழுவிய டிஜிட்டல் மேல்முறையீட்டு கட்டமைப்பு")}
          </p>
        </div>

      {/* Timeline flowchart */}
      <div className="relative pl-6 space-y-8 select-none">
        
        {/* Central connecting line */}
        <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

        {steps.map((step, idx) => (
          <div key={step.num} className="relative flex gap-4 items-start">
            
            {/* Circle Icon and Step Badge */}
            <div
              style={{ backgroundColor: step.color }}
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105"
            >
              {step.icon}
              {/* Step number badge */}
              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xs">
                <span className="text-[9px] font-black text-slate-700">{step.num}</span>
              </div>
            </div>

            {/* Information Card */}
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-slate-100/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-extrabold text-sm text-slate-800">
                  {tLabel(step.role, step.tamilRole)}
                </h3>
                <span style={{ color: step.color, background: step.color + '14', border: `1px solid ${step.color}30` }} className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0">
                  {tLabel(step.sla, step.tamilSla)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {tLabel(step.desc, step.tamilDesc)}
              </p>
            </div>
            
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-8 bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 rounded-xl p-4 text-center select-none shadow-inner">
        <p className="text-xs text-[#8B1A1A] font-extrabold">
          {tLabel("Your complaint is tracked at every step.", "உங்கள் புகார் ஒவ்வொரு கட்டத்திலும் கண்காணிக்கப்படுகிறது.")}
        </p>
      </div>
      </div>
    </div>
  );
}
