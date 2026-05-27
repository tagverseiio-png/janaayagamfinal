import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

export default function SlaTimer({ sla_deadline }) {
 const { t } = useTranslation();
 const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

 function calculateTimeLeft() {
 if (!sla_deadline) return { totalMs: 0, text: '', status: 'breached' };
 
 const diff = new Date(sla_deadline) - new Date();
 if (diff <= 0) {
 return { totalMs: diff, text: t('breached'), status: 'breached' };
 }

 const hours = Math.floor(diff / (1000 * 60 * 60));
 const minutes = Math.floor((diff / (1000 * 60)) % 60);

 return {
 totalMs: diff,
 text: `${hours}h ${minutes}m ${t('remaining')}`,
 status: hours >= 12 ? 'safe' : hours >= 4 ? 'warning' : 'danger'
 };
 }

 useEffect(() => {
 setTimeLeft(calculateTimeLeft());
 const timerId = setInterval(() => {
 setTimeLeft(calculateTimeLeft());
 }, 60000); // update every minute

 return () => clearInterval(timerId);
 }, [sla_deadline, t]);

 const colors = {
 safe: 'text-emerald-600 bg-emerald-50 border-emerald-200 ',
 warning: 'text-amber-600 bg-amber-50 border-amber-200 ',
 danger: 'text-rose-600 bg-rose-50 border-rose-200 ',
 breached: 'text-rose-700 bg-rose-100 border-rose-300 animate-pulse'
 };

 const currentColorClass = colors[timeLeft.status] || colors.safe;

 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${currentColorClass}`}>
 <Clock className="w-3.5 h-3.5 shrink-0" />
 <span>{timeLeft.text}</span>
 </span>
 );
}
