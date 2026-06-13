import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, Map, Award, Megaphone } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import StateCommand from './StateCommand';
import ConstituencyMatrix from './ConstituencyMatrix';
import CabinetRankings from './CabinetRankings';
import CmAnnouncements from './CmAnnouncements';

export default function CmPortal() {
 const { t } = useTranslation();

 const sidebarLinks = [
 {
 label: 'State Command',
 path: '/cm',
 icon: <BarChart2 />
 },
 {
 label: 'Grievances Matrix',
 path: '/cm/constituencies',
 icon: <Map />
 },
 {
 label: 'Cabinet Rankings',
 path: '/cm/cabinet',
 icon: <Award />
 },
 {
 label: 'CM Announcements',
 path: '/cm/announcements',
 icon: <Megaphone />
 }
 ];

 return (
 <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Chief Minister Command Center">
 <Routes>
 <Route path="/" element={<StateCommand />} />
 <Route path="/constituencies" element={<ConstituencyMatrix />} />
 <Route path="/cabinet" element={<CabinetRankings />} />
 <Route path="/announcements" element={<CmAnnouncements />} />
 {/* Fallback for old routes to avoid breaking */}
 <Route path="*" element={<Navigate to="/cm" replace />} />
 </Routes>
 </PortalLayout>
 );
}
