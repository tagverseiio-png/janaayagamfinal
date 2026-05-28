export const mlaSeedData = {
  stats: {
    totalOpen: 142,
    criticalIssues: 18,
    resolved: 1856,
    escalated: 34,
    pending7Days: 45
  },
  tickets: [
    {
      id: 'TK-8001',
      category: 'ROADS',
      title: 'Major arterial road requires relaying after monsoon damage',
      ward: 'Ward 142',
      city: 'Chennai',
      citizen: 'Velachery Residents Welfare Assoc.',
      status: 'OPEN',
      priority: 'CRITICAL',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'TK-8002',
      category: 'WATER',
      title: 'Desilting of main storm water drain pending before upcoming rains',
      ward: 'Ward 145',
      city: 'Chennai',
      citizen: 'Prakash R.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'TK-8003',
      category: 'ELECTRICITY',
      title: 'Request for additional street lights near government school',
      ward: 'Ward 140',
      city: 'Chennai',
      citizen: 'Government High School PTA',
      status: 'ESCALATED',
      priority: 'MEDIUM',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'TK-8004',
      category: 'HEALTH',
      title: 'Primary Health Center lacking essential monsoon medicines',
      ward: 'Ward 147',
      city: 'Chennai',
      citizen: 'Dr. Srinivasan',
      status: 'OPEN',
      priority: 'CRITICAL',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'TK-8005',
      category: 'INFRASTRUCTURE',
      title: 'Bus shelter roof collapsed, needs immediate reconstruction',
      ward: 'Ward 143',
      city: 'Chennai',
      citizen: 'Transport Union',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};
