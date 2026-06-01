import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export default function LanguageToggle() {
 const { lang: currentLang, toggleLang } = useLanguage();

 const switchLanguage = (lng) => {
 toggleLang(lng);
 toast.success(lng === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
 };

 return (
 <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shadow-inner">
 <button
 onClick={() => switchLanguage('en')}
 className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
 currentLang === 'en'
 ? 'bg-[#8B1A1A] text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-800 '
 }`}
 >
 English
 </button>
 <button
 onClick={() => switchLanguage('ta')}
 className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
 currentLang === 'ta'
 ? 'bg-[#8B1A1A] text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-800 '
 }`}
 >
 தமிழ்
 </button>
 </div>
 );
}
