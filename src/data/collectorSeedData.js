export const collectorSeedData = {
  stats: {
    districtName: 'Madurai',
    totalOpenDistrict: 384,
    escalatedToCollector: 56,
    wardBreaches: 12
  },
  wardData: [
    { name: '12', taluk: 'Madurai North', open: 24, avgDays: 5, status: 'warning' },
    { name: '45', taluk: 'Madurai South', open: 41, avgDays: 12, status: 'breached' },
    { name: '28', taluk: 'Thirumangalam', open: 18, avgDays: 4, status: 'safe' },
    { name: '71', taluk: 'Melur', open: 35, avgDays: 8, status: 'warning' }
  ],
  tickets: [
    {
      id: 'COL-4001',
      category: 'electricity',
      title: 'Power grid failure due to severe storm, entire village blacked out',
      description: 'Requesting disaster relief funds and EB manpower mobilization.',
      status: 'escalated',
      priority: 'critical',
      district: 'Madurai',
      taluk: 'Madurai North',
      ward: '12',
      citizen_name: 'VAO - North Block',
      created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'COL-4002',
      category: 'infrastructure',
      title: 'Bridge collapse in Melur bypassing highway',
      description: 'Immediate diversion of heavy vehicles required. PWD contractor missing.',
      status: 'escalated',
      priority: 'critical',
      district: 'Madurai',
      taluk: 'Melur',
      ward: '71',
      citizen_name: 'Traffic Police',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'COL-4003',
      category: 'water',
      title: 'Contaminated drinking water supply in South Madurai',
      description: 'Suspected sewage mixing with corporation drinking water pipes.',
      status: 'in_progress',
      priority: 'high',
      district: 'Madurai',
      taluk: 'Madurai South',
      ward: '45',
      citizen_name: 'Resident Welfare Assoc.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'COL-4004',
      category: 'health',
      title: 'Dengue outbreak reports increasing from Thirumangalam',
      description: 'Need collector order to dispatch emergency medical camps.',
      status: 'open',
      priority: 'high',
      district: 'Madurai',
      taluk: 'Thirumangalam',
      ward: '28',
      citizen_name: 'Health Inspector',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }
  ]
};
