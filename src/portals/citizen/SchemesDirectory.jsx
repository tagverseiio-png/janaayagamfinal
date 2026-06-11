import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Filter, BookOpen, Users, GraduationCap, Briefcase, Heart, Zap, Star, ChevronRight } from 'lucide-react';

export default function SchemesDirectory() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'All', label: tLabel('All', 'அனைத்தும்'), icon: Star },
    { id: 'Women', label: tLabel('Women Welfare', 'மகளிர் நலம்'), icon: Heart },
    { id: 'Education', label: tLabel('Education', 'கல்வி'), icon: GraduationCap },
    { id: 'Employment', label: tLabel('Employment', 'வேலைவாய்ப்பு'), icon: Briefcase },
    { id: 'Health', label: tLabel('Health', 'சுகாதாரம்'), icon: Heart },
    { id: 'Rural', label: tLabel('Rural', 'ஊரகம்'), icon: Users },
    { id: 'Energy', label: tLabel('Energy', 'மின்சாரம்'), icon: Zap }
  ];

  const schemes = [
    {
      id: 1,
      name: tLabel('Magalir Urimai Thogai', 'மகளிர் உரிமைத் தொகை'),
      category: 'Women',
      eligibility: tLabel('Women heads of households', 'குடும்பத் தலைவிகள்'),
      description: tLabel('Monthly assistance of ₹1000 for eligible women heads of families.', 'தகுதியுள்ள குடும்பத் தலைவிகளுக்கு மாதம் ரூ.1000 நிதியுதவி.'),
      benefits: '₹1000/month'
    },
    {
      id: 2,
      name: tLabel('Pudhumai Penn Scheme', 'புதுமைப் பெண் திட்டம்'),
      category: 'Education',
      eligibility: tLabel('Girls from Govt schools for higher education', 'அரசுப் பள்ளியில் பயின்ற மாணவிகள்'),
      description: tLabel('₹1000 per month for girls pursuing higher education who studied in Govt schools from 6th to 12th.', '6 முதல் 12-ஆம் வகுப்பு வரை அரசுப் பள்ளியில் பயின்று உயர்கல்வி கற்கும் மாணவிகளுக்கு மாதம் ரூ.1000.'),
      benefits: '₹1000/month'
    },
    {
      id: 3,
      name: tLabel('Naan Mudhalvan', 'நான் முதல்வன்'),
      category: 'Employment',
      eligibility: tLabel('Students and Youth', 'மாணவர்கள் மற்றும் இளைஞர்கள்'),
      description: tLabel('Skill development and career guidance for students across Tamil Nadu.', 'தமிழக மாணவர்களுக்கான திறன் மேம்பாடு மற்றும் தொழில் வழிகாட்டுதல்.'),
      benefits: 'Skill Training'
    },
    {
      id: 4,
      name: tLabel('Makkalai Thedi Maruthuvam', 'மக்களைத் தேடி மருத்துவம்'),
      category: 'Health',
      eligibility: tLabel('All citizens above 45 and those with NCDs', '45 வயதிற்கு மேற்பட்டவர்கள்'),
      description: tLabel('Healthcare services at the doorstep for non-communicable diseases.', 'தொற்றாத நோய்களுக்கான மருத்துவ சேவைகளை வீட்டு வாசலிலேயே வழங்குதல்.'),
      benefits: 'Home Healthcare'
    },
    {
      id: 5,
      name: tLabel('Chief Minister’s Comprehensive Health Insurance', 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீடு'),
      category: 'Health',
      eligibility: tLabel('Families with annual income below ₹1.2L', 'ஆண்டு வருமானம் ரூ.1.2 லட்சத்திற்கு கீழ் உள்ள குடும்பங்கள்'),
      description: tLabel('Cashless treatment in empaneled hospitals for critical illnesses.', 'தேர்வு செய்யப்பட்ட மருத்துவமனைகளில் பணமில்லா மருத்துவ சிகிச்சை.'),
      benefits: 'Up to ₹5 Lakhs'
    }
  ];

  const filteredSchemes = schemes.filter(s => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-50 space-y-3">
        <div className="flex items-center gap-3 h-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
            {tLabel('Govt Schemes', 'அரசு திட்டங்கள்')}
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={tLabel('Search schemes...', 'திட்டங்களைத் தேடுங்கள்...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#8B1A1A]/20 transition-all outline-none"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-[#8B1A1A] text-white border-[#8B1A1A] shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredSchemes.length > 0 ? (
          filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4 active:scale-[0.99] transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-50 text-[#8B1A1A] text-[9px] font-black px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter">
                      {scheme.category}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-black text-slate-800 leading-tight">
                    {scheme.name}
                  </h3>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-100 shrink-0">
                  {scheme.benefits}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                {scheme.description}
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {tLabel('Eligibility', 'தகுதி')}
                </p>
                <p className="text-xs font-bold text-slate-600">
                  {scheme.eligibility}
                </p>
              </div>

              <button className="w-full bg-slate-50 hover:bg-slate-100 text-[#8B1A1A] font-black text-xs py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all">
                <span>{tLabel('View Details & Apply', 'விவரங்களைப் பார்த்து விண்ணப்பிக்கவும்')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              {tLabel('No schemes found matching your search.', 'உங்கள் தேடலுக்கு ஏற்ற திட்டங்கள் எதுவும் இல்லை.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
