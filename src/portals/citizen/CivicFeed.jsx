import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Sliders, ThumbsUp, Share2, 
  MapPin, User, Radio, X
} from 'lucide-react';
import TnMap from '../../shared/components/TnMap';
import { toast } from 'sonner';
import mockAnnouncements from '../../mock/announcements.json';

// Emojis mapping for stories
const storyEmojis = {
  critical: '🚨',
  roads: '🛣️',
  water: '💧',
  electricity: '⚡',
  health: '🏥',
  education: '🏫',
  agriculture: '🌾',
  welfare: '🤝'
};
import api, { getMediaUrl } from '../../services/api';

export default function CivicFeed() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Active filters and sort states
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStory, setActiveStory] = useState(null);
  const [sortOption, setSortOption] = useState('Recent'); // 'Recent' | 'Most Upvoted' | 'Nearby'
  const [visibleCount, setVisibleCount] = useState(6);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [readStories, setReadStories] = useState({});

  const userWard = localStorage.getItem('jn_ward_name') || 'Your Ward';
  const userDistrict = localStorage.getItem('jn_district') || 'Chennai';

  // Dynamic claims tracking
  const [claimsState, setClaimsState] = useState({});
  const [stats, setStats] = useState({ totalActive: 0, totalResolved: 0, totalEscalated: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Sync claims from localStorage
    const savedClaims = {};
    for (let id = 1; id <= 100; id++) {
      if (localStorage.getItem(`jn_claimed_${id}`) === 'true') {
        savedClaims[id] = true;
      }
    }
    setClaimsState(savedClaims);
  }, []);

  const [allItems, setAllItems] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, deptsRes, statsRes] = await Promise.all([
          api.get('/tickets?feed=true'),
          api.get('/metadata/departments'),
          api.get('/dashboard/stats').catch(() => ({ data: {} }))
        ]);
        
        setStats({
          totalActive: statsRes.data.totalOpen || 0,
          totalResolved: statsRes.data.totalResolved || 0,
          totalEscalated: statsRes.data.criticalPriority || 0
        });

        try {
          const annData = mockAnnouncements.filter(a => a.district === userDistrict);
          setAnnouncements(annData || []);
        } catch (err) {
          setAnnouncements([]);
        }

        const formatted = ticketsRes.data.map(t => {
          let photo = t.photo_url || t.photo || null;
          
          // MOCK IMAGE LOGIC
          if (!photo) {
            const cat = (t.categoryName || t.department?.name || '').toLowerCase();
            const status = (t.status || '').toUpperCase();
            const isFixed = status === 'RESOLVED' || status === 'CLOSED';

            if (cat.includes('elect')) {
              photo = isFixed ? '/jana_feed_media/electicity_fixed.jpeg' : '/jana_feed_media/electiciry_reported.jpeg';
            } else if (cat.includes('sanit') || cat.includes('health')) {
              photo = isFixed ? '/jana_feed_media/santi_fixed.jpeg' : '/jana_feed_media/santi_reported.jpeg';
            }
          }

          return {
            id: t.id,
            ticketNumber: t.ticketNumber,
            category: t.categoryName || 'Unknown',
            title: t.title,
            desc: t.description,
            ward: t.ward || 'Unknown',
            time: new Date(t.created_at).toLocaleDateString(),
            claimCount: t.claimCount || 0,
            upvotes: t.claimCount || 0,
            status: t.status,
            priority: t.priority,
            location: t.ward || 'Unknown',
            photo: photo,
            assignedTo: t.assignedTo
          };
        });
        setAllItems(formatted);
        setDepartments(deptsRes.data);
      } catch (err) {
        console.error('Failed to fetch feed data:', err);
      }
    };
    fetchData();
  }, []);

  const handleClaimToggle = async (id) => {
    const isAlreadyClaimed = !!claimsState[id];
    if (isAlreadyClaimed) {
      toast.info(tLabel("Already claimed.", "ஏற்கனவே உரிமை கோரப்பட்டது."));
      return;
    }

    try {
      await api.post('/tickets/claim', { ticketId: id });
      setClaimsState(prev => ({ ...prev, [id]: true }));
      localStorage.setItem(`jn_claimed_${id}`, 'true');
      
      setAllItems(prev => prev.map(item => 
        item.id === id ? { ...item, claimCount: item.claimCount + 1, upvotes: (item.upvotes || 0) + 1 } : item
      ));

      toast.success(tLabel("Claim added successfully!", "உரிமை வெற்றிகரமாக சேர்க்கப்பட்டது!"));
    } catch (err) {
      const errMsg = err.response?.data?.error || tLabel("Failed to add claim.", "உரிமையைச் சேர்க்க முடியவில்லை.");
      toast.error(errMsg);
    }
  };

  const handleShare = async (title, ticketNumber) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: tLabel(`Help resolve this issue on JanaNayagam: ${title}`, `இந்த சிக்கலைத் தீர்க்க உதவுங்கள்: ${title}`),
          url: window.location.origin + `/track?id=${ticketNumber}`
        });
      } catch (err) {
        copyLink(ticketNumber);
      }
    } else {
      copyLink(ticketNumber);
    }
  };

  const copyLink = (ticketNumber) => {
    navigator.clipboard.writeText(`${window.location.origin}/track?id=${ticketNumber}`);
    toast.success(tLabel("Link copied!", "இணைப்பு நகலெடுக்கப்பட்டது!"));
  };

  const toggleSortOption = () => {
    if (sortOption === 'Recent') setSortOption('Most Upvoted');
    else if (sortOption === 'Most Upvoted') setSortOption('Nearby');
    else setSortOption('Recent');
    toast.success(tLabel(`Sorted by: ${sortOption}`, `வரிசைப்படுத்தப்பட்டது: ${sortOption}`));
  };

  // Stories mapping
  const storiesList = [
    { id: 'critical', emoji: storyEmojis.critical, label: tLabel('Critical', 'அதிமுக்கியம்') },
    ...departments.slice(0, 5).map(d => ({
      id: d.id,
      emoji: storyEmojis[d.slug] || '📋',
      label: d.name.split(' ')[0]
    }))
  ];

  const handleStoryTap = (storyId) => {
    setReadStories(prev => ({ ...prev, [storyId]: true }));
    if (activeStory === storyId) {
      setActiveStory(null);
      setActiveCategory('All');
    } else {
      setActiveStory(storyId);
      if (storyId === 'critical') {
        setActiveCategory('All');
      } else {
        const dept = departments.find(d => d.id === storyId);
        setActiveCategory(dept ? dept.name : 'All');
      }
    }
  };

  // Filtering and Sorting Processors
  let processedItems = allItems;

  if (activeCategory !== 'All') {
    processedItems = processedItems.filter(t => 
      t.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
      t.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }

  if (activeStory === 'critical') {
    processedItems = processedItems.filter(t => t.priority === 'CRITICAL');
  }

  // Sort logic
  if (sortOption === 'Most Upvoted') {
    processedItems.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sortOption === 'Recent') {
    processedItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }

  processedItems = processedItems.slice(0, visibleCount);

  // Smooth scroll helper for trending issues
  const scrollToTicket = (id) => {
    setActiveCategory('All');
    setActiveStory(null);
    setTimeout(() => {
      const el = document.getElementById(`feed-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('ring-2', 'ring-amber-500', 'transition-all');
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
      }
    }, 150);
  };

  // Categories lists for tabs
  const categoriesTabs = ['All', ...departments.map(d => d.name)];

  const getCategoryLabel = (name) => {
    if (name === 'All') return tLabel('All', 'அனைத்தும்');
    // Try to find translation in our dictionary
    const slug = departments.find(d => d.name === name)?.slug || name.toLowerCase().split(' ')[0];
    return t(`categories.${slug}`, name);
  };

  const getTrendEmoji = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('water')) return '💧';
    if (cat.includes('road') || cat.includes('pot hole')) return '🛣️';
    if (cat.includes('elect')) return '⚡';
    if (cat.includes('sanit')) return '🧹';
    return '📋';
  };

  const categoryColorThemes = {
    Roads: 'bg-red-50 text-[#8B1A1A] border-red-100',
    Electricity: 'bg-yellow-50 text-amber-600 border-yellow-100'
  };

  return (
    <div className="pb-24 overflow-x-hidden select-none">
      
      {/* ══ 1. PAGE HEADER & LOCATION STRIP ══ */}
      <div className="bg-white sticky top-0 z-50 border-b border-[#DDE1E7] shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          {/* Back button left arrow inside bar */}
          <button
            onClick={() => navigate('/citizen')}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            title={tLabel("Back to Home", "முகப்புக்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <h2 className="text-base font-black text-slate-800 tracking-wide">
            {tLabel("Civic Feed", "குடிமக்கள் ஊட்டம்")}
          </h2>

          <button 
            onClick={toggleSortOption}
            className="w-11 h-11 flex items-center justify-end text-slate-400 hover:text-slate-600"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* ── CM BROADCAST HIGH-PRIORITY BANNER ── */}
      {announcements.length > 0 && showBanner && (
        <div className="w-full bg-[#0055aa] text-white p-4 shadow-sm relative overflow-hidden animate-in slide-in-from-top duration-500 shrink-0">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2 bg-white/20 rounded-full shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded border border-white/10">
                  CM Office Broadcast
                </span>
                <span className="text-[9px] font-bold opacity-60">
                  {new Date(announcements[0].createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm font-black leading-tight">{announcements[0].title}</h3>
              <p className="text-[11px] font-bold leading-normal opacity-90 line-clamp-2">
                {announcements[0].text}
              </p>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ══ 3. SORT ROW ══ */}
      <div className="flex justify-between items-center px-4 py-2 shrink-0 select-none">
        <span className="text-[12px] text-slate-400 font-extrabold uppercase">
          {processedItems.length} {tLabel("issues in your area", "சிக்கல்கள் உங்கள் பகுதியில்")}
        </span>

        <button
          onClick={toggleSortOption}
          className="bg-white border border-[#DDE1E7] px-3 py-1 rounded-[12px] text-[11px] font-black text-slate-650 flex items-center gap-1 shadow-xs cursor-pointer active:bg-slate-50"
        >
          <span>🔃</span>
          <span>{sortOption === 'Recent' ? tLabel('Recent ▼', 'சமீபத்திய ▼') : sortOption === 'Most Upvoted' ? tLabel('Upvoted ▼', 'வாக்குகள் ▼') : tLabel('Nearby ▼', 'அருகிலுள்ள ▼')}</span>
        </button>
      </div>

      {/* ══ 4. FEED CARDS ══ */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1 select-none">
        {processedItems.map(item => {
          const hasClaimed = !!claimsState[item.id];
          const displayClaims = item.claimCount;

          return (
            <div 
              key={item.id}
              id={`feed-card-${item.id}`}
              className="bg-white border border-[#DDE1E7] rounded-[24px] overflow-hidden flex flex-col shadow-sm h-full"
            >
              {/* Photo (social-media style) */}
              <div className="relative w-full aspect-video md:aspect-square bg-slate-100 group">
                {item.photo ? (
                  <img 
                    src={getMediaUrl(item.photo)} 
                    alt="Issue proof" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No photo</span>
                  </div>
                )}
                
                {/* Category & Ward Overlays */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-[#8B1A1A] text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 uppercase tracking-widest">
                    {item.category}
                  </span>
                  <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border border-white/10 uppercase tracking-widest flex items-center gap-1.5 w-fit">
                    <MapPin className="w-3 h-3 text-white" />
                    {item.ward}
                  </span>
                </div>

                {/* Status Chip */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-2 uppercase tracking-widest shadow-lg ${
                    item.status === 'RESOLVED' || item.status === 'CLOSED'
                      ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                      : item.status === 'ESCALATED'
                        ? 'bg-orange-500/90 text-white border-orange-400/50'
                        : 'bg-[#8B1A1A]/90 text-white border-red-400/50'
                  }`}>
                    {item.status === 'ESCALATED' && item.assignedTo?.role
                      ? `ESCALATED — ${item.assignedTo.role}`
                      : item.status}
                  </span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-800 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                {/* Unified Claim Stats */}
                <div className="flex items-center gap-2 py-1">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                           <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ))}
                   </div>
                   <span className="text-xs font-black text-[#8B1A1A]">
                      {displayClaims} {tLabel('Citizens Claimed', 'குடிமக்கள் உரிமை கோரினர்')}
                   </span>
                </div>

                {/* ACTION BUTTONS ROW */}
                <div className="flex items-center gap-3 w-full">
                  {/* Claim Button */}
                  <button
                    onClick={() => handleClaimToggle(item.id)}
                    className={`flex items-center justify-center gap-2 flex-1 h-12 rounded-2xl font-black text-sm transition-all shadow-md active:scale-[0.98] ${
                      hasClaimed 
                        ? 'bg-red-50 text-[#8B1A1A] border border-red-100 cursor-default' 
                        : 'bg-[#8B1A1A] text-white hover:bg-[#6b1414]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasClaimed ? 'fill-[#8B1A1A]' : ''}`} />
                    <span>{hasClaimed ? tLabel('Claimed', 'உரிமை கோரப்பட்டது') : tLabel('Claim Issue', 'உரிமை கோரு')}</span>
                  </button>

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(item.title, item.ticketNumber)}
                    className="flex items-center justify-center gap-2 w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ══ 10. INFINITE SCROLL INDICATOR ══ */}
      <div className="p-4 pt-6 text-center select-none space-y-3 shrink-0">
        <span className="text-[12px] text-slate-400 font-extrabold uppercase">
          {tLabel(`Showing ${processedItems.length} of ${allItems.length} issues in your area`, `காட்டப்படுகிறது ${processedItems.length} ${allItems.length} புகார்களில்`)}
        </span>
        
        {visibleCount < allItems.length ? (
          <button
            onClick={() => {
              setVisibleCount(prev => prev + 3);
              toast.success(tLabel("Loaded 3 more complaints successfully!", "கூடுதலாக 3 புகார்கள் வெற்றிகரமாக ஏற்றப்பட்டன!"));
            }}
            className="w-full h-11 border border-[#DDE1E7] dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            {tLabel("Load More Issues", "கூடுதல் விவரங்களை ஏற்று")}
          </button>
        ) : (
          <div className="text-xs text-slate-400 font-bold py-2 bg-slate-50 border rounded-xl select-none">
            ✓ {tLabel("All local complaints fully loaded", "அனைத்து புகார்களும் முழுமையாக ஏற்றப்பட்டன")}
          </div>
        )}
      </div>

    </div>
  );
}
