import React from 'react';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
 const { t } = useTranslation();
 const normalized = (status || '').toLowerCase().replace(' ', '_');

 const styles = {
 open: 'bg-blue-50 text-[#8B1A1A] border-blue-200 ',
 in_progress: 'bg-amber-50 text-amber-600 border-amber-200 ',
 assigned: 'bg-amber-50 text-amber-600 border-amber-200 ',
 resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200 ',
 escalated: 'bg-rose-50 text-rose-600 border-rose-200 ',
 closed: 'bg-slate-100 text-slate-600 border-slate-200 '
 };

 const getTranslationKey = () => {
 if (normalized === 'assigned' || normalized === 'in_progress') return 'status_labels.in_progress';
 if (normalized === 'open') return 'status_labels.open';
 if (normalized === 'resolved') return 'status_labels.resolved';
 if (normalized === 'escalated') return 'status_labels.escalated';
 if (normalized === 'closed') return 'status_labels.closed';
 return 'status_labels.open';
 };

 const currentStyle = styles[normalized] || styles.open;

 return (
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${currentStyle}`}>
 {t(getTranslationKey())}
 </span>
 );
}
