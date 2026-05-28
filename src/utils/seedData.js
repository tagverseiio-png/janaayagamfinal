export function seedAllDummyData() {
  const isSeeded = localStorage.getItem('jn_seeded_v2');
  if (isSeeded) return;

  const newTickets = [];
  const categories = ['water', 'roads', 'electricity', 'health', 'infrastructure', 'public_nuisance', 'sanitation', 'revenue'];
  const districts = ['Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Trichy', 'Vellore', 'Erode', 'Tirunelveli', 'Thanjavur'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'resolved', 'escalated'];
  const names = ['Rahul K.', 'Anita M.', 'Venkat R.', 'Murugan T.', 'Village Council', 'System Alert', 'Whistleblower', 'Priya S.', 'Ravi K.', 'Lakshmi V.'];
  const raised_by_options = ['citizen', 'vao', 'system'];

  for (let i = 1; i <= 150; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const dist = districts[Math.floor(Math.random() * districts.length)];
    const prio = priorities[Math.floor(Math.random() * priorities.length)];
    const stat = statuses[Math.floor(Math.random() * statuses.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const rb = raised_by_options[Math.floor(Math.random() * raised_by_options.length)];
    
    // Past dates for creation (0 to 60 days ago)
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    // SLA deadline
    const hoursToSLA = Math.floor(Math.random() * 72) - 24; // Some breached, some not
    const slaDeadline = new Date(Date.now() + hoursToSLA * 60 * 60 * 1000);

    newTickets.push({
      id: `4000${i}`,
      category: cat,
      description: `Mock grievance report regarding ${cat} issues in ${dist}. Needs immediate attention from the concerned department.`,
      status: stat,
      priority: prio,
      created_at: createdAt.toISOString(),
      sla_deadline: slaDeadline.toISOString(),
      ward: Math.floor(Math.random() * 200).toString(),
      district: dist,
      citizen_name: name,
      raised_by: rb
    });
  }

  // Add specific critical escalations to ensure the higher portals have meaningful data
  const criticalTickets = [
    {
      id: '3001', category: 'water', description: 'Pipeline burst near Velachery Main Road.',
      status: 'open', priority: 'high', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Rahul K.', raised_by: 'citizen'
    },
    {
      id: '3002', category: 'roads', description: 'Contractor abandoned road work halfway. 3 weeks delay.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Anita M.', raised_by: 'citizen'
    },
    {
      id: '3003', category: 'public_nuisance', description: 'Encroachment on lake bed by private builders.',
      status: 'in_progress', priority: 'critical', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), ward: '142', district: 'Chennai',
      citizen_name: 'Venkat R.', raised_by: 'citizen'
    },
    {
      id: '3004', category: 'electricity', description: 'Entire village power grid failure due to storm. Waiting on collector disaster funds.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), ward: '12', district: 'Madurai',
      citizen_name: 'Murugan T.', raised_by: 'vao'
    },
    {
      id: '3006', category: 'water', description: 'Metro water plant upgrade delay affecting 5 districts.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Chennai',
      citizen_name: 'System Alert', raised_by: 'system'
    },
    {
      id: '3007', category: 'roads', description: 'State highway tender corruption allegations.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Salem',
      citizen_name: 'Whistleblower', raised_by: 'citizen'
    },
    {
      id: '3008', category: 'infrastructure', description: 'Major flood relief funds misappropriation in delta districts.',
      status: 'escalated', priority: 'critical', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      sla_deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), ward: 'All', district: 'Thanjavur',
      citizen_name: 'Intelligence Bureau', raised_by: 'system'
    }
  ];

  const allTickets = [...newTickets, ...criticalTickets];
  localStorage.setItem('jn_tickets', JSON.stringify(allTickets));
  localStorage.setItem('jn_seeded_v2', 'true');
}
