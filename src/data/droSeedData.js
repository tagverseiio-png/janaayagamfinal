export const droSeedData = {
  stats: {
    totalOpenRevenue: 142,
    pattaIssues: 89,
    encroachmentIssues: 53
  },
  talukData: [
    { name: 'Velachery', open: 24, avgDays: 5 },
    { name: 'Sholinganallur', open: 41, avgDays: 9 },
    { name: 'Guindy', open: 18, avgDays: 4 },
    { name: 'Mylapore', open: 12, avgDays: 6 }
  ],
  tickets: [
    {
      id: 'DRO-1001',
      category: 'revenue',
      sub_type: 'Patta',
      title: 'Name transfer in Patta pending for 4 months',
      district: 'Chennai',
      taluk: 'Velachery',
      ward: '142',
      citizen_name: 'Sundar R.',
      status: 'escalated',
      priority: 'high',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'DRO-1002',
      category: 'revenue',
      sub_type: 'Encroachment',
      title: 'Illegal commercial construction on poramboke lake bed',
      district: 'Chennai',
      taluk: 'Sholinganallur',
      ward: '145',
      citizen_name: 'Waterbody Protection Forum',
      status: 'in_progress',
      priority: 'critical',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'DRO-1003',
      category: 'revenue',
      sub_type: 'Boundary Dispute',
      title: 'Survey requested for agricultural land boundary marking',
      district: 'Chennai',
      taluk: 'Guindy',
      ward: '140',
      citizen_name: 'Rajendran M.',
      status: 'open',
      priority: 'medium',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'DRO-1004',
      category: 'revenue',
      sub_type: 'Patta',
      title: 'Joint Patta subdivision application rejected without valid reason',
      district: 'Chennai',
      taluk: 'Mylapore',
      ward: '147',
      citizen_name: 'Karthik S.',
      status: 'escalated',
      priority: 'high',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};
