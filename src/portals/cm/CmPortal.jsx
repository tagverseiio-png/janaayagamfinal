import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, ShieldAlert, Zap, AlertTriangle, FileText } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import CmDashboard from './CmDashboard';
import CmEmergency from './CmEmergency';
import CmEscalations from './CmEscalations';
import CabinetReport from './CabinetReport';
import StatePage from './StatePage';

export default function CmPortal() {
 const { t } = useTranslation();

 const sidebarLinks = [
 {
 label: t('dashboard'),
 path: '/cm',
 icon: <BarChart2 />
 },
 {
 label: t('state_tickets'),
 path: '/cm/state',
 icon: <ShieldAlert />
 },
 {
 label: t('crisis_mode'),
 path: '/cm/emergency',
 icon: <Zap />
 },
 {
 label: t('all_escalations'),
 path: '/cm/escalations',
 icon: <AlertTriangle />
 },
 {
 label: t('cabinet_report'),
 path: '/cm/report',
 icon: <FileText />
 }
 ];

 return (
 <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Hon'ble Chief Minister (CM) Control Center">
 <Routes>
 <Route path="/" element={<CmDashboard />} />
 <Route path="/state" element={<StatePage />} />
 <Route path="/emergency" element={<CmEmergency />} />
 <Route path="/escalations" element={<CmEscalations />} />
 <Route path="/report" element={<CabinetReport />} />
 </Routes>
 </PortalLayout>
 );
}
