import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, AlertTriangle, FileText } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import VaoDashboard from './VaoDashboard';
import RaiseOnBehalf from './RaiseOnBehalf';
import VillageTickets from './VillageTickets';

export default function VaoPortal() {
 const { t } = useTranslation();

 // Seed VAO-specific dummy tickets if they don't exist
 useEffect(() => {
   const existing = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
   const hasVaoTickets = existing.some(t => t.raised_by === 'VAO');
   
   if (!hasVaoTickets) {
     const vaoTickets = [
       {
         id: '2042',
         category: 'public_nuisance',
         description: 'Illegal sand mining activities observed near the village riverbed.',
         status: 'open',
         priority: 'critical',
         created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
         sla_deadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
         ward: '142',
         district: 'Chennai',
         citizen_name: 'VAO Officer',
         raised_by: 'VAO'
       },
       {
         id: '2043',
         category: 'infrastructure',
         description: 'Panchayat record room roof is leaking. Needs immediate repair to protect land documents.',
         status: 'in_progress',
         priority: 'high',
         created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
         sla_deadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
         ward: '142',
         district: 'Chennai',
         citizen_name: 'VAO Officer',
         raised_by: 'VAO'
       },
       {
         id: '2044',
         category: 'roads',
         description: 'Main village approach road severely damaged due to heavy trucks.',
         status: 'resolved',
         priority: 'medium',
         created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
         sla_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
         ward: '142',
         district: 'Chennai',
         citizen_name: 'VAO Officer',
         raised_by: 'VAO'
       }
     ];
     localStorage.setItem('jn_tickets', JSON.stringify([...existing, ...vaoTickets]));
   }
 }, []);

 const sidebarLinks = [
 {
 label: t('dashboard'),
 path: '/vao',
 icon: <BarChart2 />
 },
 {
 label: t('file') + ' (On Behalf)',
 path: '/vao/raise',
 icon: <AlertTriangle />
 },
 {
 label: 'Village Tickets',
 path: '/vao/tickets',
 icon: <FileText />
 }
 ];

 return (
 <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Village Administrative Officer (VAO)">
 <Routes>
 <Route path="/" element={<VaoDashboard />} />
 <Route path="/raise" element={<RaiseOnBehalf />} />
 <Route path="/tickets" element={<VillageTickets />} />
 </Routes>
 </PortalLayout>
 );
}
