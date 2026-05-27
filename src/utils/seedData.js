export function seedAllDummyData() {
  const isSeeded = localStorage.getItem('jn_seeded_all');
  if (isSeeded) return;

  const existing = JSON.parse(localStorage.getItem('jn_tickets') || '[]');

  const newTickets = [
    // Ward Officer Specific
    {
      id: '3001', category: 'water', description: 'Pipeline burst near Velachery Main Road.',
      status: 'open', priority: 'high', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Rahul K.', raised_by: 'citizen'
    },
    // BDO Specific (Escalated from Ward)
    {
      id: '3002', category: 'roads', description: 'Contractor abandoned road work halfway. 3 weeks delay.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Anita M.', raised_by: 'citizen'
    },
    // DRO Specific (Revenue/Land)
    {
      id: '3003', category: 'public_nuisance', description: 'Encroachment on lake bed by private builders.',
      status: 'in_progress', priority: 'critical', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Venkat R.', raised_by: 'citizen'
    },
    // Collector Specific
    {
      id: '3004', category: 'electricity', description: 'Entire village power grid failure due to storm. Waiting on collector disaster funds.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), ward: '12', district: 'Madurai',
      citizen_name: 'Murugan T.', raised_by: 'vao'
    },
    // MLA Specific
    {
      id: '3005', category: 'infrastructure', description: 'Request for new primary health center in village.',
      status: 'open', priority: 'medium', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), ward: '45', district: 'Madurai',
      citizen_name: 'Village Council', raised_by: 'citizen'
    },
    // Dept Secretary Specific
    {
      id: '3006', category: 'water', description: 'Metro water plant upgrade delay affecting 5 districts.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Chennai',
      citizen_name: 'System Alert', raised_by: 'system'
    },
    // Minister Specific
    {
      id: '3007', category: 'roads', description: 'State highway tender corruption allegations.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Salem',
      citizen_name: 'Whistleblower', raised_by: 'citizen'
    },
    // CM Specific
    {
      id: '3008', category: 'infrastructure', description: 'Major flood relief funds misappropriation in delta districts.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Thanjavur',
      citizen_name: 'Intelligence Bureau', raised_by: 'system'
    }
  ];

  localStorage.setItem('jn_tickets', JSON.stringify([...existing, ...newTickets]));
  localStorage.setItem('jn_seeded_all', 'true');
}
