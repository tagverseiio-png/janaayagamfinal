import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutUs() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  return (
    <div className="min-h-screen bg-[#F0EBE3] pb-20">
      <div className="bg-white sticky top-0 z-50 border-b border-slate-200">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-start text-[#8B1A1A]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-base font-black text-slate-800 tracking-wide">
            {tLabel("About Us", "எங்களை பற்றி")}
          </h2>
          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-[#8B1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">JanaNayagam</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {tLabel("JanaNayagam is the official civic grievance redressal portal of Tamil Nadu. It bridges the gap between citizens and the government by ensuring accountability, transparency, and rapid action.", "ஜனநாயகம் என்பது தமிழ்நாட்டின் அதிகாரப்பூர்வ குடிமைப் புகார் தீர்வு தளமாகும். இது பொறுப்புக்கூறல், வெளிப்படைத்தன்மை மற்றும் விரைவான நடவடிக்கையை உறுதி செய்வதன் மூலம் குடிமக்களுக்கும் அரசாங்கத்திற்கும் இடையிலான இடைவெளியைக் குறைக்கிறது.")}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 mb-0.5">{tLabel("Citizen First", "மக்கள் முதலில்")}</h3>
              <p className="text-xs text-slate-500 font-bold">{tLabel("Empowering every voice.", "ஒவ்வொரு குரலுக்கும் அதிகாரம்.")}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 mb-0.5">{tLabel("Built with Love in TN", "தமிழ்நாட்டில் உருவாக்கப்பட்டது")}</h3>
              <p className="text-xs text-slate-500 font-bold">{tLabel("For the people, by the people.", "மக்களுக்காக, மக்களால்.")}</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
          JanaNayagam v1.0.0 © 2026<br/>
          Government of Tamil Nadu
        </p>
      </div>
    </div>
  );
}
