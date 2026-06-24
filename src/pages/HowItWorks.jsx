import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, MapPin, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HowItWorks() {
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
            {tLabel("How It Works", "இது எப்படி செயல்படுகிறது")}
          </h2>
          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-rose-50 text-[#8B1A1A] rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{tLabel("1. Submit an Issue", "1. புகாரை சமர்ப்பிக்கவும்")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tLabel("Easily report any civic issue like electricity blackout, broken roads, or sanitation problems. Attach a photo and location.", "மின்சாரம், சாலை அல்லது சுகாதாரம் போன்ற ஏதேனும் குடிமைப் புகார்களை எளிதாக தெரிவிக்கவும். புகைப்படம் மற்றும் இருப்பிடத்தை இணைக்கவும்.")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{tLabel("2. Automatic Routing", "2. தானியங்கி வழிகாட்டுதல்")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tLabel("Our system automatically identifies your ward and directly forwards the issue to the relevant Ward Officer and Department.", "எங்கள் அமைப்பு தானாகவே உங்கள் வார்டை அடையாளம் கண்டு, புகாரை சம்பந்தப்பட்ட அதிகாரிக்கு அனுப்புகிறது.")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-1">{tLabel("3. Quick Resolution", "3. விரைவான தீர்வு")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tLabel("The officer inspects and resolves the issue. If delayed, it escalates to higher officials (MLA, Minister, or CM) automatically.", "அதிகாரி சிக்கலைத் தீர்க்கிறார். தாமதமானால், அது தானாகவே உயர் அதிகாரிகளுக்கு செல்லும்.")}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
