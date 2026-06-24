import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

export default function Analytics() {
  const { t } = useTranslation();

  // Mock data for Grievance Trends (Line Chart)
  const grievanceTrendsData = [
    { name: 'Jan', new: 4000, resolved: 2400 },
    { name: 'Feb', new: 3000, resolved: 1398 },
    { name: 'Mar', new: 2000, resolved: 9800 },
    { name: 'Apr', new: 2780, resolved: 3908 },
    { name: 'May', new: 1890, resolved: 4800 },
    { name: 'Jun', new: 2390, resolved: 3800 },
  ];

  // Mock data for Resolution Time by Department (Bar Chart)
  const resolutionTimeData = [
    { name: 'Roads', days: 12 },
    { name: 'Water', days: 8 },
    { name: 'Electricity', days: 5 },
    { name: 'Health', days: 15 },
    { name: 'Education', days: 20 },
  ];

  // Mock data for District Comparison (Pie Chart)
  const districtData = [
    { name: 'Chennai', value: 4000 },
    { name: 'Coimbatore', value: 3000 },
    { name: 'Madurai', value: 2000 },
    { name: 'Salem', value: 1500 },
    { name: 'Trichy', value: 1000 },
  ];
  const COLORS = ['#003366', '#9a0002', '#ffc658', '#4caf50', '#ff9800'];

  // Mock data for Officer Efficiency (Composed Chart)
  const officerEfficiencyData = [
    { name: 'Zone A', tickets: 120, efficiency: 85 },
    { name: 'Zone B', tickets: 80, efficiency: 90 },
    { name: 'Zone C', tickets: 150, efficiency: 75 },
    { name: 'Zone D', tickets: 90, efficiency: 95 },
    { name: 'Zone E', tickets: 110, efficiency: 80 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="bg-gradient-to-r from-[#003366] to-[#9a0002] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <h2 className="text-2xl font-black mt-3">
          Analytics & Reports
        </h2>
        <p className="text-xs text-rose-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Statewide Performance Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grievance Trends */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Grievance Trends (6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grievanceTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="new" name="New Tickets" stroke="#9a0002" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#003366" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Avg Resolution Time (Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTimeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="days" name="Days to Resolve" fill="#ffc658" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Comparison */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Open Tickets by District</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={districtData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Officer Efficiency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Zone Efficiency Score (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={officerEfficiencyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar yAxisId="left" dataKey="tickets" name="Tickets Handled" fill="#003366" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#4caf50" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
