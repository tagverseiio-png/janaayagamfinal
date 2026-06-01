import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import WardDashboard from './WardDashboard';
import TicketInbox from './TicketInbox';

export default function WardOfficerPortal() {
 const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/ward-officer',
      icon: <BarChart2 />
    },
    {
      label: 'Ward Tickets',
      path: '/ward-officer/tickets',
      icon: <FileText />
    },
    {
      label: 'File Issue',
      path: '/ward-officer/file-issue',
      icon: <FileText />
    },
    {
      label: 'Escalate',
      path: '/ward-officer/escalate',
      icon: <FileText />
    },
    {
      label: 'Ward Report',
      path: '/ward-officer/report',
      icon: <FileText />
    }
  ];

 return (
 <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Ward Officer Portal">
 <Routes>
 <Route path="/" element={<WardDashboard />} />
 <Route path="/inbox" element={<TicketInbox />} />
 </Routes>
 </PortalLayout>
 );
}
