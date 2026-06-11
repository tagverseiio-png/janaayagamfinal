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
      name: tLabel('Kalaignar Magalir Urimai Thittam', 'கலைஞர் மகளிர் உரிமைத் திட்டம்'),
      category: 'Women',
      eligibility: tLabel('Women heads of families, family income < ₹2.5L/yr, land holding < 5 acres', 'குடும்பத் தலைவிகள், குடும்ப ஆண்டு வருமானம் < ₹2.5 லட்சம், நிலம் < 5 ஏக்கர்'),
      description: tLabel('Monthly financial assistance of ₹1,000 to improve livelihood and self-respect of eligible women heads of families.', 'தகுதியுள்ள குடும்பத் தலைவிகளின் வாழ்வாதாரம் மற்றும் சுயமரியாதையை மேம்படுத்த மாதம் ரூ.1000 நிதியுதவி.'),
      benefits: '₹1,000 / month'
    },
    {
      id: 2,
      name: tLabel('Pudhumai Penn Scheme', 'புதுமைப் பெண் திட்டம்'),
      category: 'Education',
      eligibility: tLabel('Girls pursuing higher education who studied in Govt schools from 6th to 12th', '6 முதல் 12-ஆம் வகுப்பு வரை அரசுப் பள்ளியில் பயின்று உயர்கல்வி கற்கும் மாணவிகள்'),
      description: tLabel('Provides ₹1,000 per month directly to the bank accounts of girls to encourage pursuit of higher professional degrees.', 'மாணவிகளின் உயர்கல்வி சேர்க்கையை அதிகரிக்க நேரடியாக அவர்களது வங்கிக் கணக்கில் மாதம் ரூ.1,000 செலுத்துதல்.'),
      benefits: '₹1,000 / month'
    },
    {
      id: 3,
      name: tLabel('Chief Minister’s Breakfast Scheme', 'முதலமைச்சரின் காலை உணவுத் திட்டம்'),
      category: 'Education',
      eligibility: tLabel('Students in Govt Primary schools (Classes 1 to 5)', 'அரசுத் தொடக்கப் பள்ளிகளில் 1 முதல் 5 ஆம் வகுப்பு வரை பயிலும் மாணவர்கள்'),
      description: tLabel('Provides free nutritious breakfast to primary school students on all working days to reduce malnutrition and dropout rates.', 'ஊட்டச்சத்துக் குறைபாட்டைக் குறைக்கவும், இடைநிற்றலைத் தவிர்க்கவும் தொடக்கப் பள்ளி மாணவர்களுக்கு இலவச காலை உணவு.'),
      benefits: 'Free Breakfast'
    },
    {
      id: 4,
      name: tLabel('NEEDS (New Entrepreneur-cum-Enterprise Development)', 'புதிய தொழில்முனைவோர் மற்றும் தொழில் நிறுவன மேம்பாட்டு திட்டம்'),
      category: 'Employment',
      eligibility: tLabel('Educated youth (Degree/Diploma) aged 21-35 (up to 45 for special categories)', '21-35 வயதுடைய படித்த இளைஞர்கள் (பட்டம்/டிப்ளமோ பெற்றவர்கள்)'),
      description: tLabel('Assists educated youth in starting manufacturing or service enterprises with state subsidies up to 25% and loan support.', '25% வரை அரசு மானியத்துடன் உற்பத்தி அல்லது சேவைத் தொழில்களைத் தொடங்க படித்த இளைஞர்களுக்கு உதவுதல்.'),
      benefits: '25% State Subsidy'
    },
    {
      id: 5,
      name: tLabel('CMCHIS (CM Comprehensive Health Insurance)', 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீடு (CMCHIS)'),
      category: 'Health',
      eligibility: tLabel('Families residing in TN with annual family income below ₹1.2 Lakhs', 'ஆண்டு வருமானம் ரூ.1.2 லட்சத்திற்கு குறைவாக உள்ள தமிழ்நாட்டுக் குடும்பங்கள்'),
      description: tLabel('Provides cashless tertiary healthcare treatment up to ₹5 Lakhs per family per year in empaneled public and private hospitals.', 'பொது மற்றும் தனியார் மருத்துவமனைகளில் குடும்பத்திற்கு ஆண்டிற்கு ரூ.5 லட்சம் வரை பணமில்லா உயர் சிகிச்சை.'),
      benefits: 'Up to ₹5 Lakhs / yr'
    },
    {
      id: 6,
      name: tLabel('MLACDS (Constituency Development Scheme)', 'சட்டமன்ற உறுப்பினர் தொகுதி மேம்பாட்டுத் திட்டம் (MLACDS)'),
      category: 'Rural',
      eligibility: tLabel('Infrastructure projects proposed by MLAs in their respective constituencies', 'சட்டமன்ற உறுப்பினர்களால் அந்தந்த தொகுதிகளில் பரிந்துரைக்கப்படும் உள்கட்டமைப்பு பணிகள்'),
      description: tLabel('Enables MLAs to execute small infrastructure works such as drinking water supply, libraries, and roads in their constituencies.', 'தொகுதியில் குடிநீர் விநியோகம், நூலகங்கள் மற்றும் சாலைகள் போன்ற உள்கட்டமைப்புப் பணிகளை மேற்கொள்ள நிதி வழங்கப்படுகிறது.'),
      benefits: '₹3 Crores / MLA'
    },
    {
      id: 7,
      name: tLabel('Solar Rooftop Subsidy Scheme', 'சூரிய ஒளி கூரை மானியத் திட்டம்'),
      category: 'Energy',
      eligibility: tLabel('Residential consumers installing grid-connected solar systems up to 3 kW', '3 கிலோவாட் வரை சூரிய ஒளி மின் உற்பத்தி அலகு நிறுவும் குடியிருப்புப் பயனாளிகள்'),
      description: tLabel('Promotes clean energy generation by offering state and central financial subsidies to residential buildings installing solar panels.', 'குடியிருப்பு கட்டிடங்களில் சூரிய ஒளியில் மின்சாரம் தயாரித்து பயன்படுத்த மாநில மற்றும் மத்திய அரசு மானியங்களை வழங்குதல்.'),
      benefits: 'Up to 40% Subsidy'
    },
    {
      id: 8,
      name: tLabel('Naan Mudhalvan', 'நான் முதல்வன் திட்டம்'),
      category: 'Employment',
      eligibility: tLabel('College students and youth across Tamil Nadu', 'தமிழகக் கல்லூரி மாணவர்கள் மற்றும் இளைஞர்கள்'),
      description: tLabel('State-of-the-art skill development training, career counseling, and industry-oriented certifications for TN youth.', 'தொழில்துறைக்குத் தேவையான திறன் பயிற்சி, தொழில் வழிகாட்டுதல் மற்றும் சான்றிதழ்களை வழங்குதல்.'),
      benefits: 'Free Industry Training'
    },
    {
      id: 9,
      name: tLabel('Makkalai Thedi Maruthuvam', 'மக்களைத் தேடி மருத்துவம்'),
      category: 'Health',
      eligibility: tLabel('Elderly, chronically ill, and patients requiring NCD screenings', 'முதியவர்கள், படுக்கையிலுள்ள நோயாளிகள் மற்றும் தொற்றா நோயால் பாதிக்கப்பட்டவர்கள்'),
      description: tLabel('Door-to-door delivery of essential medicines, physical therapy, and diagnostic services directly to citizens homes.', 'அத்தியாவசிய மருந்துகள், இயன்முறை சிகிச்சை மற்றும் மருத்துவச் சேவைகளை நேரடியாக வீடுகளுக்கேச் சென்று வழங்குதல்.'),
      benefits: 'Doorstep Healthcare'
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
