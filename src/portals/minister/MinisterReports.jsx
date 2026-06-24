import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { FileText, Download, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const monthlyTrends = [
  { month: 'Jan', filed: 312, resolved: 278, escalated: 34 },
  { month: 'Feb', filed: 285, resolved: 251, escalated: 29 },
  { month: 'Mar', filed: 398, resolved: 342, escalated: 56 },
  { month: 'Apr', filed: 421, resolved: 389, escalated: 48 },
  { month: 'May', filed: 367, resolved: 318, escalated: 41 },
  { month: 'Jun', filed: 445, resolved: 401, escalated: 63 },
];

const resolutionByDistrict = [
  { district: 'Chennai', rate: 92, tickets: 1245 },
  { district: 'Coimbatore', rate: 87, tickets: 834 },
  { district: 'Madurai', rate: 83, tickets: 712 },
  { district: 'Salem', rate: 79, tickets: 589 },
  { district: 'Tiruchi', rate: 85, tickets: 634 },
  { district: 'Tirunelveli', rate: 76, tickets: 423 },
];

const categoryBreakdown = [
  { name: 'Electricity', value: 38, color: '#F59E0B' },
  { name: 'Sanitation', value: 28, color: '#10B981' },
  { name: 'Roads', value: 18, color: '#6366F1' },
  { name: 'Water', value: 10, color: '#3B82F6' },
  { name: 'Other', value: 6, color: '#94A3B8' },
];

const officerPerformance = [
  { name: 'Er. Karthikeyan', resolved: 145, avg_days: 2.1, rating: 4.8 },
  { name: 'Er. Mohanraj',    resolved: 132, avg_days: 2.8, rating: 4.6 },
  { name: 'M. Saravanan',    resolved: 119, avg_days: 3.2, rating: 4.4 },
  { name: 'K. Priyadharshini', resolved: 98, avg_days: 2.5, rating: 4.7 },
  { name: 'D. Ramesh Babu',  resolved: 87,  avg_days: 3.8, rating: 4.2 },
];

const slaData = [
  { week: 'W1', within_sla: 88, breached: 12 },
  { week: 'W2', within_sla: 91, breached: 9 },
  { week: 'W3', within_sla: 85, breached: 15 },
  { week: 'W4', within_sla: 94, breached: 6 },
  { week: 'W5', within_sla: 90, breached: 10 },
  { week: 'W6', within_sla: 96, breached: 4 },
];

const KPICard = ({ icon: Icon, label, value, sub, trend, color = '#8B1A1A' }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-xs font-bold text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

export default function MinisterReports() {
  const [period, setPeriod] = useState('6M');
  const deptName = localStorage.getItem('jn_emp_dept') || 'Electricity & Energy Resources';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{deptName} — Performance Summary</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {['1M', '3M', '6M', '1Y'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-black transition-colors ${period === p ? 'bg-[#8B1A1A] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#8B1A1A] text-white text-xs font-black rounded-xl shadow hover:bg-[#7a1515] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={FileText}     label="Total Tickets Filed"   value="2,228"  sub="Last 6 months"   trend={+12} color="#8B1A1A" />
        <KPICard icon={CheckCircle}  label="Resolution Rate"       value="89.4%"  sub="Dept average"    trend={+5}  color="#10B981" />
        <KPICard icon={Clock}        label="Avg Resolution Time"   value="2.7 days" sub="Target: 3 days" trend={+8}  color="#F59E0B" />
        <KPICard icon={AlertTriangle} label="Escalated to CM"      value="271"    sub="Last 6 months"   trend={-18} color="#EF4444" />
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-800 mb-1">Monthly Ticket Trends</h2>
        <p className="text-xs text-slate-400 mb-5">Filed vs Resolved vs Escalated</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyTrends}>
            <defs>
              <linearGradient id="gradFiled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B1A1A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            <Area type="monotone" dataKey="filed"    name="Filed"    stroke="#8B1A1A" fill="url(#gradFiled)"    strokeWidth={2.5} dot={{ r: 4, fill: '#8B1A1A' }} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" fill="url(#gradResolved)" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} />
            <Line  type="monotone" dataKey="escalated" name="Escalated" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: '#EF4444' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row: District Resolution + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* District Resolution Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 mb-1">Resolution Rate by District</h2>
          <p className="text-xs text-slate-400 mb-5">% of tickets resolved within SLA</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resolutionByDistrict} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="rate" name="Resolution %" radius={[0, 6, 6, 0]}>
                {resolutionByDistrict.map((d) => (
                  <Cell key={d.district} fill={d.rate >= 90 ? '#10B981' : d.rate >= 80 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 mb-1">Ticket Category Breakdown</h2>
          <p className="text-xs text-slate-400 mb-5">Distribution across departments</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {categoryBreakdown.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-bold text-slate-600 flex-1">{c.name}</span>
                  <span className="text-xs font-black text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-800 mb-1">SLA Compliance — Weekly</h2>
        <p className="text-xs text-slate-400 mb-5">% tickets resolved within SLA vs breached</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={slaData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            <Bar dataKey="within_sla" name="Within SLA" fill="#10B981" radius={[4,4,0,0]} />
            <Bar dataKey="breached"   name="Breached"   fill="#FCA5A5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Officer Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-black text-slate-800">Top Officer Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by tickets resolved this quarter</p>
          </div>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">#</th>
                <th className="text-left py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">Officer</th>
                <th className="text-right py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">Resolved</th>
                <th className="text-right py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">Avg Days</th>
                <th className="text-right py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody>
              {officerPerformance.map((o, i) => (
                <tr key={o.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pr-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-800">{o.name}</td>
                  <td className="py-3 text-right font-black text-slate-700">{o.resolved}</td>
                  <td className="py-3 text-right">
                    <span className={`font-black ${o.avg_days <= 2.5 ? 'text-emerald-600' : o.avg_days <= 3.5 ? 'text-amber-600' : 'text-red-500'}`}>
                      {o.avg_days}d
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-black text-amber-500">★ {o.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
