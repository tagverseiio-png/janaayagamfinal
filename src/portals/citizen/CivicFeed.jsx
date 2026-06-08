import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Sliders, ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  Heart, Droplet, Lightbulb, Trash2, BookOpen, Leaf, HeartHandshake, User, Send 
} from 'lucide-react';
import { toast } from 'sonner';

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
import api from '../../services/api';

export default function CivicFeed() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Active filters and sort states
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStory, setActiveStory] = useState(null);
  const [sortOption, setSortOption] = useState('Recent'); // 'Recent' | 'Most Upvoted' | 'Nearby'
  const [visibleCount, setVisibleCount] = useState(6);
  const [openMenuId, setOpenMenuId] = useState(null);

  const userWard = localStorage.getItem('jn_ward_name') || 'Your Ward';
  const userDistrict = localStorage.getItem('jn_district') || 'Chennai';

  // Dynamic comments tracking
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [cardComments, setCardComments] = useState({
    1: [
      { author: 'Sivakumar P.', text: tLabel('This pothole has been there since last monsoon. Needs urgent fix.', 'இந்த பள்ளம் கடந்த பருவமழை முதல் உள்ளது. உடனே சரிசெய்ய வேண்டும்.'), time: '1 hr ago', likes: 4 },
      { author: 'Meera R.', text: tLabel('Bus drivers are swerving dangerous to avoid it.', 'பேருந்துகள் இதைத் தவிர்க்க ஆபத்தான முறையில் திரும்புகின்றன.'), time: '30 mins ago', likes: 2 }
    ],
    2: [
      { author: 'Arun Kumar', text: tLabel('Extremely dark and unsafe for women walking home.', 'பெண்கள் நடந்து செல்ல மிகவும் இருட்டாகவும் பாதுகாப்பற்றதாகவும் உள்ளது.'), time: '4 hrs ago', likes: 5 }
    ],
    3: [
      { author: 'Karthik S.', text: tLabel('Metrowater officials said it was due to valve leakage repair.', 'மெட்ரோவாட்டர் அதிகாரிகள் இது வால்வு கசிவு பழுது காரணமாக என்று கூறினர்.'), time: '12 hrs ago', likes: 9 },
      { author: 'Janaki Raman', text: tLabel('Water tankers are taking advantage of this shortage!', 'தண்ணீர் லாரிகள் இந்த தட்டுப்பாட்டை தங்களுக்கு சாதகமாக பயன்படுத்துகின்றன!'), time: '8 hrs ago', likes: 6 }
    ],
    4: [
      { author: 'Rajesh N.', text: tLabel('Finally garbage was cleared yesterday evening.', 'வழியாக நேற்று மாலை குப்பை அகற்றப்பட்டது.'), time: '1 day ago', likes: 1 }
    ],
    5: [
      { author: 'Soundar G.', text: tLabel('Compund walls collapsed during the rain. Kids are playing nearby.', 'மழையில் சுவர் இடிந்து விழுந்தது. குழந்தைகள் அருகில் விளையாடுகிறார்கள்.'), time: '2 days ago', likes: 3 }
    ],
    6: [
      { author: 'Dr. Priya', text: tLabel('Shortage of insulin vials is causing severe panic.', 'இன்சுலின் மருந்து பற்றாக்குறை பெரும் பீதியை ஏற்படுத்துகிறது.'), time: '3 days ago', likes: 12 }
    ]
  });

  // Upvotes state synced with localStorage
  const [upvotesState, setUpvotesState] = useState({});

  // Stories Read state tracking
  const [readStories, setReadStories] = useState({
    critical: false,
    roads: false,
    water: false,
    electricity: false,
    health: false,
    education: false,
    agriculture: false,
    welfare: false
  });

  // Load state on mount
  useEffect(() => {
    // Sync upvotes from localStorage
    const savedVotes = {};
    for (let id = 1; id <= 12; id++) {
      if (localStorage.getItem(`jn_upvoted_${id}`) === 'true') {
        savedVotes[id] = true;
      }
    }
    setUpvotesState(savedVotes);
  }, []);

  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        const formatted = res.data.map(t => ({
          id: t.id, // we might need ticketNumber or id
          ticketNumber: t.ticketNumber,
          category: t.department?.name || 'Unknown',
          title: t.title,
          desc: t.description,
          ward: t.jurisdiction?.name || 'Unknown',
          time: new Date(t.createdAt).toLocaleDateString(),
          timeTa: new Date(t.createdAt).toLocaleDateString(),
          upvotes: 0,
          status: t.status,
          priority: t.priority,
          location: t.jurisdiction?.name || 'Unknown',
          locationTa: t.jurisdiction?.name || 'Unknown',
          photo: t.photo || null
        }));
        setAllItems(formatted);
      } catch (err) {
        console.error('Failed to fetch feed tickets:', err);
      }
    };
    fetchTickets();
  }, []);

  const handleUpvoteToggle = (id) => {
    const isAlreadyVoted = !!upvotesState[id];
    const nextVal = !isAlreadyVoted;
    setUpvotesState(prev => ({ ...prev, [id]: nextVal }));

    if (nextVal) {
      localStorage.setItem(`jn_upvoted_${id}`, 'true');
      toast.success(tLabel("Upvoted successfully! Verified face count logged.", "வெற்றிகரமாக வாக்களிக்கப்பட்டது! குறை உறுதி செய்யப்பட்டது."));
    } else {
      localStorage.removeItem(`jn_upvoted_${id}`);
      toast.info(tLabel("Upvote removed.", "வாக்கு திரும்பப் பெறப்பட்டது."));
    }
  };

  const handleShare = async (title, id) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: tLabel('Check out this civic complaint on JanaNayagam:', 'ஜனநாயகத்தில் இந்த புகாரைப் பாருங்கள்:'),
          url: window.location.href
        });
      } catch (err) {
        // Fallback
        copyLink(id);
      }
    } else {
      copyLink(id);
    }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/citizen/feed#complaint-${id}`);
    toast.success(tLabel("Link copied!", "இணைப்பு நகலெடுக்கப்பட்டது!"));
  };

  const handleCommentToggle = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendComment = (id) => {
    const text = commentInputs[id] || '';
    if (!text.trim()) return;

    const newComment = {
      author: localStorage.getItem('jn_name') || 'Citizen',
      text: text.trim(),
      time: tLabel('Just now', 'இப்போதுதான்'),
      likes: 0
    };

    setCardComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newComment]
    }));

    setCommentInputs(prev => ({ ...prev, [id]: '' }));
    toast.success(tLabel("Comment added successfully!", "கருத்து வெற்றிகரமாக சேர்க்கப்பட்டது!"));
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
    { id: 'roads', emoji: storyEmojis.roads, label: tLabel('Roads', 'சாலைகள்') },
    { id: 'water', emoji: storyEmojis.water, label: tLabel('Water', 'குடிநீர்') },
    { id: 'electricity', emoji: storyEmojis.electricity, label: tLabel('Electric', 'மின்சாரம்') },
    { id: 'health', emoji: storyEmojis.health, label: tLabel('Health', 'சுகாதாரம்') },
    { id: 'education', emoji: storyEmojis.education, label: tLabel('Education', 'கல்வி') },
    { id: 'agriculture', emoji: storyEmojis.agriculture, label: tLabel('Agri', 'வேளாண்மை') },
    { id: 'welfare', emoji: storyEmojis.welfare, label: tLabel('Welfare', 'நலத்திட்டம்') }
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
        const catMap = {
          roads: 'Roads',
          water: 'Water',
          electricity: 'Electricity',
          health: 'Health',
          education: 'Education',
          agriculture: 'Agriculture',
          welfare: 'Welfare'
        };
        setActiveCategory(catMap[storyId] || 'All');
      }
    }
  };

  // Filtering and Sorting Processors
  let processedItems = allItems.slice(0, visibleCount);

  if (activeCategory !== 'All') {
    processedItems = processedItems.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (activeStory === 'critical') {
    processedItems = processedItems.filter(t => t.priority === 'critical');
  }

  // Sort logic
  if (sortOption === 'Most Upvoted') {
    processedItems.sort((a, b) => {
      const vA = a.upvotes + (upvotesState[a.id] ? 1 : 0);
      const vB = b.upvotes + (upvotesState[b.id] ? 1 : 0);
      return vB - vA;
    });
  } else if (sortOption === 'Recent') {
    processedItems.sort((a, b) => b.id - a.id);
  }

  // Smooth scroll helper for trending issues
  const scrollToTicket = (id) => {
    setFilter('all');
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
  const categoriesTabs = ['All', 'Roads', 'Water', 'Electricity', 'Health', 'Education', 'Sanitation', 'Agriculture'];
  const categoriesTabsTa = ['அனைத்தும்', 'சாலைகள்', 'குடிநீர்', 'மின்சாரம்', 'சுகாதாரம்', 'கல்வி', 'சுகாதாரம்', 'வேளாண்மை'];

  const categoryColorThemes = {
    Roads: 'bg-red-50 text-[#8B1A1A] border-red-100',
    Water: 'bg-blue-50 text-blue-600 border-blue-100',
    Electricity: 'bg-yellow-50 text-amber-600 border-yellow-100',
    Health: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Education: 'bg-purple-50 text-purple-650 border-purple-100',
    Sanitation: 'bg-teal-50 text-teal-600 border-teal-100',
    Agriculture: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Welfare: 'bg-[#FFF0EE] text-[#8B1A1A] border-red-100'
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

        {/* Location Strip below top bar */}
        <div className="bg-[#FFF0EE] px-4 py-2.5 flex items-center gap-1.5 w-full select-none shrink-0 border-t border-red-100/50">
          <span className="text-xs">📍</span>
          <span className="text-[12px] font-black text-[#8B1A1A] leading-none uppercase tracking-wide">
            {tLabel(`${userWard}, ${userDistrict} — Your neighbourhood`, `${userWard}, ${userDistrict} — உங்கள் சுற்றுப்புறம்`)}
          </span>
        </div>
      </div>

      {/* ══ 6. INSTAGRAM STORIES ROW ══ */}
      <div className="h-[96px] bg-white border-b border-slate-100 overflow-x-auto hide-scrollbar flex items-center gap-4 px-4 py-3 shrink-0 select-none">
        {storiesList.map((story) => {
          const isRead = !!readStories[story.id];
          const isCritical = story.id === 'critical';
          const isActive = activeStory === story.id;

          let ringColor = isRead ? 'border-slate-350' : 'border-[#8B1A1A]';
          if (isCritical) {
            ringColor = 'border-red-650 animate-pulse scale-102';
          }
          if (isActive) {
            ringColor = 'border-amber-500 scale-102 border-[3px]';
          }

          return (
            <div 
              key={story.id}
              onClick={() => handleStoryTap(story.id)}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 text-center"
            >
              <div className={`w-[52px] h-[52px] rounded-full border-2 p-0.5 flex items-center justify-center bg-white shadow-xs ${ringColor}`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center text-lg ${
                  isCritical 
                    ? 'bg-red-50 animate-bounce' 
                    : story.id === 'water' 
                      ? 'bg-blue-50' 
                      : story.id === 'electricity' 
                        ? 'bg-yellow-50' 
                        : 'bg-slate-50'
                }`}>
                  {story.emoji}
                </div>
              </div>
              <span className={`text-[10px] font-black tracking-wide ${isActive ? 'text-[#8B1A1A]' : 'text-slate-400'}`}>
                {story.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ══ 7. TRENDING SECTION ══ */}
      <div className="p-4 shrink-0 select-none">
        <div className="bg-[#FFFBF0] border border-amber-250/50 border-l-[4px] border-l-amber-500 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {tLabel(`Trending in ${userWard}`, `${userWard} இல் பரவலாக பேசப்படுவது`)}
            </h4>
          </div>

          <div className="space-y-2">
            {allItems.slice(0, 3).map(trend => (
              <div 
                key={trend.id}
                onClick={() => scrollToTicket(trend.id)}
                className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 border-b border-amber-100/30 pb-1.5 last:border-0 last:pb-0 cursor-pointer"
              >
                <span className="truncate max-w-[210px] flex items-center gap-1">
                  <span>{trend.category === 'Water' ? '💧' : trend.category === 'Roads' ? '🛣️' : '⚡'}</span>
                  <span className="truncate">{trend.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {trend.upvotes} upvotes · {trend.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 2. FILTER TABS ══ */}
      <div className="overflow-x-auto hide-scrollbar flex items-center gap-2 px-4 py-1 shrink-0 select-none">
        {categoriesTabs.map((cat, idx) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveStory(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors border cursor-pointer ${
                isActive
                  ? 'bg-[#8B1A1A] text-white border-[#8B1A1A] shadow-xs'
                  : 'bg-white text-slate-500 border-[#DDE1E7] hover:border-slate-350'
              }`}
            >
              {tLabel(cat, categoriesTabsTa[idx])}
            </button>
          );
        })}
      </div>

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
      <div className="px-4 space-y-4 pt-1 select-none">
        {processedItems.map(item => {
          const hasVoted = !!upvotesState[item.id];
          const displayUpvotes = item.upvotes + (hasVoted ? 1 : 0);
          const isCommentsOpen = !!expandedComments[item.id];
          const comments = cardComments[item.id] || [];

          return (
            <div 
              key={item.id}
              id={`feed-card-${item.id}`}
              className="bg-white border border-[#DDE1E7] rounded-[12px] p-[14px] flex flex-col gap-3 shadow-xs"
            >
              
              {/* TOP ROW: Social Header */}
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2.5">
                  {/* Category icon circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-slate-100 ${categoryColorThemes[item.category] || 'bg-slate-50 text-slate-600'}`}>
                    {item.category === 'Roads' ? (
                      <span className="text-sm">🛣️</span>
                    ) : item.category === 'Water' ? (
                      <span className="text-sm">💧</span>
                    ) : item.category === 'Electricity' ? (
                      <span className="text-sm">⚡</span>
                    ) : item.category === 'Sanitation' ? (
                      <span className="text-sm">🧹</span>
                    ) : item.category === 'Education' ? (
                      <span className="text-sm">🏫</span>
                    ) : item.category === 'Health' ? (
                      <span className="text-sm">🏥</span>
                    ) : (
                      <span className="text-sm">📋</span>
                    )}
                  </div>

                  <div>
                    <h5 className={`text-[13px] font-black uppercase leading-none ${
                      item.category === 'Roads' ? 'text-red-700' : item.category === 'Water' ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {tLabel(item.category, item.category)}
                    </h5>
                    <span className="text-[11px] text-slate-400 font-bold block mt-1 leading-none">
                      Ward {item.ward} · {isTa ? item.timeTa : item.time}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${
                    item.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'escalated'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-[#FFF0EE] text-[#8B1A1A] border-red-150'
                  }`}>
                    {tLabel(item.status.toUpperCase(), item.status.toUpperCase())}
                  </span>

                  {/* Three dot actions dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-10 text-xs font-bold py-1 overflow-hidden">
                        <button 
                          onClick={() => { setOpenMenuId(null); copyLink(item.id); }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          {tLabel("Copy Link", "இணைப்பை நகலெடு")}
                        </button>
                        <button 
                          onClick={() => { setOpenMenuId(null); toast.info(tLabel('Reported for review', 'மதிப்பாய்வுக்கு புகாரளிக்கப்பட்டது')); }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
                        >
                          {tLabel("Report Post", "பதிலைப் புகாரளி")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION */}
              <div className="space-y-1">
                <h4 className="text-[15px] font-black text-slate-800 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[13px] text-slate-500 font-bold leading-normal">
                  {item.desc}
                </p>
                
                {/* Photo Evidence overlay */}
                {item.photo && (
                  <div className="w-full h-[180px] rounded-lg overflow-hidden border border-slate-100 mt-2 shadow-xs bg-slate-900 select-none">
                    <img src={item.photo} alt="Civic feed post proof" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* LOCATION ROW */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold leading-none">
                <span>📍</span>
                <span>{isTa ? item.locationTa : item.location}</span>
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="border-t border-[#F0F0F0] pt-1 flex items-center justify-around w-full">
                
                {/* Upvotes */}
                <button
                  onClick={() => handleUpvoteToggle(item.id)}
                  className={`flex items-center justify-center gap-1.5 flex-1 h-9 font-black text-xs transition-colors cursor-pointer rounded-lg ${
                    hasVoted 
                      ? 'text-[#8B1A1A] bg-red-50/50' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-[#8B1A1A]' : ''}`} />
                  <span>{tLabel(`Upvote · ${displayUpvotes}`, `வாக்கு · ${displayUpvotes}`)}</span>
                </button>

                {/* Comment triggers */}
                <button
                  onClick={() => handleCommentToggle(item.id)}
                  className={`flex items-center justify-center gap-1.5 flex-1 h-9 font-black text-xs transition-colors cursor-pointer rounded-lg ${
                    isCommentsOpen 
                      ? 'text-[#8B1A1A] bg-red-50/50' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{tLabel(`Comment · ${comments.length}`, `கருத்து · ${comments.length}`)}</span>
                </button>

                {/* Share fallback buttons */}
                <button
                  onClick={() => handleShare(item.title, item.id)}
                  className="flex items-center justify-center gap-1.5 flex-1 h-9 font-black text-xs text-slate-500 hover:bg-slate-50 cursor-pointer rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{tLabel("Share", "பகிர்")}</span>
                </button>

              </div>

              {/* Expandable Comments Drawer panel */}
              {isCommentsOpen && (
                <div className="border-t border-slate-100/80 pt-3.5 space-y-4">
                  {/* Comments lists */}
                  <div className="space-y-3">
                    {comments.map((comm, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-[9px] select-none shrink-0">
                          {comm.author.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-2.5 relative border border-slate-100">
                          <div className="flex justify-between items-center text-[10.5px] font-black text-slate-800 dark:text-slate-200">
                            <span>{comm.author}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{comm.time}</span>
                          </div>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-350 font-bold mt-1 leading-normal">
                            {comm.text}
                          </p>
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-1.5 pl-0.5">
                            <span>👍 {comm.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment composer Row */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <div className="w-7 h-7 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-black text-xs select-none shrink-0">
                      KA
                    </div>
                    <div className="flex-1 flex items-center bg-slate-50 border border-[#DDE1E7] rounded-full px-3 py-1 select-none">
                      <input
                        type="text"
                        value={commentInputs[item.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                        placeholder={tLabel("Add a comment...", "கருத்து சேர்க்கவும்...")}
                        className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 h-[28px]"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(item.id); }}
                      />
                      <button 
                        onClick={() => handleSendComment(item.id)}
                        className="p-1 text-[#8B1A1A] hover:opacity-80 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* ══ 10. INFINITE SCROLL INDICATOR ══ */}
      <div className="p-4 pt-6 text-center select-none space-y-3 shrink-0">
        <span className="text-[12px] text-slate-400 font-extrabold uppercase">
          {tLabel(`Showing ${processedItems.length} of 24 issues in your area`, `காட்டப்படுகிறது ${processedItems.length} 24 புகார்களில்`)}
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
