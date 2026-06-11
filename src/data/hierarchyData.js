export const DEPT_HIERARCHY = {
  Water: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'WARD_AEO', label: 'Ward (AEO)' },
    { role: 'AREA_ENGINEER', label: 'Area Engineer' },
    { role: 'COMMISSIONER', label: 'Commissioner' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Electricity: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'AAE', label: 'Assistant Area Engineer' },
    { role: 'AE', label: 'Area Engineer' },
    { role: 'Minister', label: 'Minister' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Sanitation: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'DSI', label: 'Division Sanitary Inspector (DSI)' },
    { role: 'SANITARY_INSPECTOR', label: 'Sanitary Inspector (SI)' },
    { role: 'HEALTH_INSPECTOR', label: 'Health Inspector' },
    { role: 'CITY_HEALTH_OFFICER', label: 'City Health Officer' },
    { role: 'DEPT_COMMISSIONER', label: 'Department Commissioner' },
    { role: 'COMMISSIONER', label: 'Commissioner' },
    { role: 'Minister', label: 'Minister' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Roads: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'WARD_AEO', label: 'Ward (AEO)' },
    { role: 'AREA_ENGINEER', label: 'Area Engineer' },
    { role: 'COMMISSIONER', label: 'Commissioner' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Higher Education': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Principal', label: 'Principal Assessment' },
    { role: 'Regional Director', label: 'Regional Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Revenue: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'Revenue Inspector', label: 'RI Field Inspection' },
    { role: 'Tahsildar', label: 'Tahsildar Review' },
    { role: 'RDO', label: 'RDO Assessment' },
    { role: 'Collector', label: 'Collector Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Police: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Sub-Inspector', label: 'SI Verification' },
    { role: 'Inspector', label: 'Inspector Review' },
    { role: 'DSP', label: 'DSP Assessment' },
    { role: 'SP', label: 'SP Approval' },
    { role: 'IG', label: 'IG Review' },
    { role: 'DGP', label: 'DGP Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Agriculture: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'Agriculture Officer', label: 'AO Field Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'District Officer', label: 'District Officer Approval' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Animal Husbandry': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Veterinary Officer', label: 'Veterinary Officer Assessment' },
    { role: 'Asst. Director', label: 'Assistant Director Review' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Transport: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'MVO', label: 'MVO Assessment' },
    { role: 'Regional Transport Officer', label: 'RTO Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Housing: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'AE', label: 'AE Assessment' },
    { role: 'Executive Engineer', label: 'Executive Engineer Review' },
    { role: 'SE', label: 'SE Clearance' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Highways: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'AE', label: 'AE Assessment' },
    { role: 'Deputy Engineer', label: 'Deputy Engineer Review' },
    { role: 'Executive Engineer', label: 'Executive Engineer Clearance' },
    { role: 'Chief Engineer', label: 'Chief Engineer Final Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Forest: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Forest Guard', label: 'Forest Guard Assessment' },
    { role: 'Range Officer', label: 'Range Officer Review' },
    { role: 'DFO', label: 'DFO Clearance' },
    { role: 'PCCF', label: 'PCCF Final Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Fisheries: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Fisheries Officer', label: 'Fisheries Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'District Officer', label: 'District Officer Clearance' },
    { role: 'Director', label: 'Director Final Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Welfare: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'CDO', label: 'CDO Assessment' },
    { role: 'Deputy CDO', label: 'Deputy CDO Review' },
    { role: 'District Officer', label: 'District Officer Approval' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Social Welfare': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'CDO', label: 'CDO Assessment' },
    { role: 'Deputy CDO', label: 'Deputy CDO Review' },
    { role: 'District Officer', label: 'District Officer Approval' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Adi Dravidar Welfare': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Project Officer', label: 'Project Officer Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'BC/MBC Welfare': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Project Officer', label: 'Project Officer Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Differently Abled Welfare': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Project Officer', label: 'Project Officer Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Women & Child Development': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'CDPO', label: 'CDPO Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Rural Development': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VPDO', label: 'VPDO First Response' },
    { role: 'BDO', label: 'BDO Assessment' },
    { role: 'District RD Officer', label: 'District RD Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Panchayat: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Panchayat Secretary', label: 'Panchayat Secretary First Response' },
    { role: 'Block Panchayat Officer', label: 'BPO Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Municipality: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Exec Officer', label: 'Ward Exec Officer First Response' },
    { role: 'Deputy Commissioner', label: 'Deputy Commissioner Assessment' },
    { role: 'Commissioner', label: 'Commissioner Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Corporation: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Executive', label: 'Ward Executive First Response' },
    { role: 'Zonal Officer', label: 'Zonal Officer Assessment' },
    { role: 'Commissioner', label: 'Commissioner Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Fire & Rescue': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Fireman', label: 'Fireman Assessment' },
    { role: 'Station Officer', label: 'Station Officer Review' },
    { role: 'Divisional Officer', label: 'Divisional Officer Clearance' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Registrar: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Sub-Registrar', label: 'Sub-Registrar Assessment' },
    { role: 'District Registrar', label: 'District Registrar Review' },
    { role: 'IGR', label: 'IGR Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Labour: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Labour Officer', label: 'Labour Officer Assessment' },
    { role: 'Deputy Labour Commissioner', label: 'DLC Review' },
    { role: 'Commissioner', label: 'Commissioner Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Legal Metrology': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Inspector', label: 'Inspector Assessment' },
    { role: 'Asst. Controller', label: 'Assistant Controller Review' },
    { role: 'Controller', label: 'Controller Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Food Safety': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Food Safety Officer', label: 'FSO Assessment' },
    { role: 'Designated Officer', label: 'Designated Officer Review' },
    { role: 'Commissioner', label: 'Commissioner Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Cooperative: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Asst. Cooperative Officer', label: 'ACO Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Handlooms & Textiles': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Inspector', label: 'Inspector Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Tourism: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Tourism Officer', label: 'Tourism Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Industries: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Project Officer', label: 'Project Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Environment: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Environmental Officer', label: 'Environmental Officer Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Information: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'District Information Officer', label: 'DIO Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Archaeology: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Field Officer', label: 'Field Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Tamil Development': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'District Officer', label: 'District Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Adi Dravidar Housing': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'First Verification' },
    { role: 'Project Officer', label: 'Project Officer Assessment' },
    { role: 'District Officer', label: 'District Officer Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Slum Clearance': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Field Officer', label: 'Field Officer Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Postal Services': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Postman', label: 'Postman Assessment' },
    { role: 'Postmaster', label: 'Postmaster Review' },
    { role: 'Superintendent', label: 'Superintendent Clearance' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Civil Supplies': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'Depot Officer', label: 'Depot Officer Assessment' },
    { role: 'Taluk Supply Officer', label: 'TSO Review' },
    { role: 'District Officer', label: 'District Officer Clearance' },
    { role: 'Commissioner', label: 'Commissioner Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  'Sports & Youth Affairs': [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'First Verification' },
    { role: 'District Sports Officer', label: 'DSO Assessment' },
    { role: 'Deputy Director', label: 'Deputy Director Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ]
};

// Map a citizen category (any case) to a department hierarchy key
export const normalizeDept = (category) => {
  if (!category) return 'Water';
  let catStr = category;
  if (typeof category === 'object') {
    catStr = category.name || category.code || 'Water';
  }
  const normalizedCategory = catStr.toLowerCase().trim();
  const keyMap = {
    'roads': 'Roads',
    'pwd': 'Roads',
    'water': 'Water',
    'electricity': 'Electricity',
    'eb': 'Electricity',
    'sanitation': 'Sanitation',
    'health': 'Sanitation',
    'health & sanitation': 'Sanitation',
    'health and sanitation': 'Sanitation',
    'education': 'Education',
    'higher education': 'Higher Education',
    'revenue': 'Revenue',
    'police': 'Police',
    'agriculture': 'Agriculture',
    'animal husbandry': 'Animal Husbandry',
    'transport': 'Transport',
    'rto': 'Transport',
    'housing': 'Housing',
    'highways': 'Highways',
    'forest': 'Forest',
    'fisheries': 'Fisheries',
    'welfare': 'Welfare',
    'social welfare': 'Social Welfare',
    'adi dravidar welfare': 'Adi Dravidar Welfare',
    'bc/mbc welfare': 'BC/MBC Welfare',
    'differently abled welfare': 'Differently Abled Welfare',
    'women & child development': 'Women & Child Development',
    'rural development': 'Rural Development',
    'panchayat': 'Panchayat',
    'municipality': 'Municipality',
    'corporation': 'Corporation',
    'fire & rescue': 'Fire & Rescue',
    'registrar': 'Registrar',
    'labour': 'Labour',
    'legal metrology': 'Legal Metrology',
    'food safety': 'Food Safety',
    'cooperative': 'Cooperative',
    'handlooms & textiles': 'Handlooms & Textiles',
    'tourism': 'Tourism',
    'industries': 'Industries',
    'environment': 'Environment',
    'information': 'Information',
    'archaeology': 'Archaeology',
    'tamil development': 'Tamil Development',
    'sports & youth affairs': 'Sports & Youth Affairs',
    'adi dravidar housing': 'Adi Dravidar Housing',
    'slum clearance': 'Slum Clearance',
    'postal services': 'Postal Services',
    'civil supplies': 'Civil Supplies'
  };

  const mappedKey = keyMap[normalizedCategory];
  
  if (mappedKey && DEPT_HIERARCHY[mappedKey]) {
    return mappedKey;
  }
  
  // Fallback Capitalization logic
  const key = catStr.charAt(0).toUpperCase() + catStr.slice(1).toLowerCase();
  return DEPT_HIERARCHY[key] ? key : 'Water';
};

// First official a freshly filed ticket is routed to (index 0 is the Citizen)
export const getFirstResponder = (category) => DEPT_HIERARCHY[normalizeDept(category)][1].role;

// Helper to normalize roles for robust comparison
export const normalizeRole = (role) => (role || '').toUpperCase().replace(/\s+/g, '_');

// Next role up the chain after the current holder (never past 'Resolved')
export const getNextRole = (category, currentRole) => {
  const h = DEPT_HIERARCHY[normalizeDept(category)];
  if (!h) return 'Higher Authority';
  
  const target = normalizeRole(currentRole);
  const idx = h.findIndex(s => normalizeRole(s.role) === target);
  return h[Math.min((idx < 0 ? 1 : idx) + 1, h.length - 1)].role;
};

// Get current step index based on ticket assignedTo role
export const getCurrentStep = (category, assignedTo) => {
  const hierarchy = DEPT_HIERARCHY[normalizeDept(category)];
  if (!hierarchy) return 0;
  
  const target = normalizeRole(assignedTo);
  const idx = hierarchy.findIndex(h => normalizeRole(h.role) === target);
  return idx === -1 ? 1 : idx;
};

// Get progress percentage
export const getProgressPercent = (category, assignedTo) => {
  const hierarchy = DEPT_HIERARCHY[normalizeDept(category)];
  const idx = getCurrentStep(category, assignedTo);
  return Math.round((idx / (hierarchy.length - 1)) * 100);
};

// Abbreviated / legacy role names → their canonical chain role
const ROLE_ALIASES = { SI: 'Sanitary Inspector', DE: 'Deputy Engineer', DAE: 'Deputy AE', RI: 'Revenue Inspector' };

// Resolve any assignedTo to a real role in the department chain.
// Out-of-chain roles (e.g. escalated to BDO/Collector/Minister) map to the top dept role.
export const canonicalRole = (category, role) => {
  const chain = DEPT_HIERARCHY[normalizeDept(category)];
  if (!chain) return role;
  const aliased = ROLE_ALIASES[role] || role;
  const normalizedAliased = normalizeRole(aliased);
  if (chain.some(s => normalizeRole(s.role) === normalizedAliased)) return aliased;
  return chain[chain.length - 2].role;
};

// Build a timeline aligned to the chain from the current owner role
export const buildTimeline = (category, assignedTo, createdAt) => {
  const chain = DEPT_HIERARCHY[normalizeDept(category)];
  if (!chain) return [];
  const cur = getCurrentStep(category, assignedTo);
  const resolved = normalizeRole(assignedTo) === 'RESOLVED';
  return chain.map((s, i) => ({
    role: s.role,
    label: s.label,
    completedAt: (i < cur || (resolved && i === cur)) ? createdAt : null,
    status: i < cur ? 'done' : i === cur ? (resolved ? 'done' : 'current') : 'pending',
  }));
};
