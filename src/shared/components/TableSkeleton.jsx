import React from 'react';

export default function TableSkeleton({ rows = 5, cols = 4 }) {
 return (
 <div className="w-full overflow-hidden border border-slate-200 rounded-3xl bg-white shadow-sm">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 ">
 {Array.from({ length: cols }).map((_, i) => (
 <th key={i} className="px-5 py-3.5">
 <div className="h-3 bg-slate-200 rounded w-16"></div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {Array.from({ length: rows }).map((_, r) => (
 <tr key={r} className="hover:bg-slate-50/50 ">
 {Array.from({ length: cols }).map((_, c) => (
 <td key={c} className="px-5 py-4">
 <div className="skeleton-box"></div>
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
