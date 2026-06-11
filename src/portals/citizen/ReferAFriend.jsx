import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Share2, MessageCircle, Gift, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferAFriend() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const referralCode = "JANA-7721-TN";
  const referralLink = `https://jananayagam.tn.gov.in/join?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(tLabel('Referral link copied!', 'பரிந்துரை இணைப்பு நகலெடுக்கப்பட்டது!'));
  };

  const shareWhatsApp = () => {
    const text = tLabel(
      `Join JanaNayagam with me and help build a better Tamil Nadu! Use my link: ${referralLink}`,
      `என்னுடன் ஜனநாயகத்தில் இணைந்து சிறந்த தமிழ்நாட்டை உருவாக்க உதவுங்கள்! எனது இணைப்பைப் பயன்படுத்தவும்: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JanaNayagam',
          text: tLabel('Join JanaNayagam and help build a better Tamil Nadu!', 'ஜனநாயகத்தில் இணைந்து சிறந்த தமிழ்நாட்டை உருவாக்க உதவுங்கள்!'),
          url: referralLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm sticky top-0 z-50 flex items-center gap-3 h-14">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-[#8B1A1A]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
          {tLabel('Refer a Friend', 'நண்பரைப் பரிந்துரைக்கவும்')}
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Illustration/Icon */}
        <div className="text-center space-y-4 py-8">
          <div className="w-24 h-24 bg-[#8B1A1A]/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-[#8B1A1A]/20">
            <Gift className="w-10 h-10 text-[#8B1A1A]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800">
              {tLabel('Invite Others to JanaNayagam', 'ஜனநாயகத்திற்கு மற்றவர்களை அழைக்கவும்')}
            </h3>
            <p className="text-xs font-bold text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              {tLabel('Spread the word and help your ward get prioritized for civic issues.', 'விழிப்புணர்வைப் பரப்புங்கள் மற்றும் உங்கள் வார்டு பிரச்சனைகளுக்கு முன்னுரிமை பெற உதவுங்கள்.')}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm text-center space-y-1">
            <Users className="w-5 h-5 text-blue-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">12</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLabel('Total Refers', 'மொத்த பரிந்துரைகள்')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm text-center space-y-1">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">Gold</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLabel('Badge Status', 'பேட்ஜ் நிலை')}</p>
          </div>
        </div>

        {/* Referral Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-md space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {tLabel('Your Unique Referral Link', 'உங்கள் தனித்துவமான இணைப்பு')}
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 gap-3">
              <p className="text-xs font-bold text-slate-600 truncate flex-1">{referralLink}</p>
              <button onClick={copyToClipboard} className="text-[#8B1A1A] hover:bg-[#8B1A1A]/10 p-2 rounded-xl transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={shareWhatsApp}
              className="w-full bg-[#25D366] text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{tLabel('Share on WhatsApp', 'வாட்ஸ்அப்பில் பகிரவும்')}</span>
            </button>
            <button
              onClick={nativeShare}
              className="w-full bg-slate-800 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>{tLabel('Share via...', 'இதன் மூலம் பகிரவும்...')}</span>
            </button>
          </div>
        </div>

        {/* Info/Benefits Section */}
        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <Gift className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-wider">{tLabel('Why Refer?', 'ஏன் பரிந்துரைக்க வேண்டும்?')}</h4>
            <p className="text-[10px] text-blue-600 font-bold leading-normal">
              {tLabel('More active citizens in your ward means faster verification of local issues and quicker resolution times from the govt.', 'உங்கள் வார்டில் அதிக செயலில் உள்ள குடிமக்கள் இருந்தால், உள்ளூர் சிக்கல்கள் விரைவாக சரிபார்க்கப்படும்.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
