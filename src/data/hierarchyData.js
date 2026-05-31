export const DEPT_HIERARCHY = {
  Water: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'Village Verification & Site Inspection' },
    { role: 'AEO', label: 'AEO Assessment & Assignment' },
    { role: 'Deputy AE', label: 'Deputy Area Engineer Review' },
    { role: 'Area Engineer', label: 'Area Engineer Approval' },
    { role: 'GM', label: 'GM Final Review' },
    { role: 'Executive Director', label: 'Executive Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Electricity: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'Ward Officer First Response' },
    { role: 'Lineman', label: 'Lineman Site Inspection' },
    { role: 'Deputy AE', label: 'Deputy AE Assessment' },
    { role: 'Asst AE', label: 'Assistant Area Engineer Review' },
    { role: 'Area Engineer', label: 'Area Engineer Approval' },
    { role: 'Super Agent', label: 'Super Agent Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Roads: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'Ward Officer Inspection' },
    { role: 'AE', label: 'Assistant Engineer Assessment' },
    { role: 'Deputy Engineer', label: 'Deputy Engineer Review' },
    { role: 'Executive Engineer', label: 'Executive Engineer Approval' },
    { role: 'SE', label: 'Superintending Engineer Clearance' },
    { role: 'Chief Engineer', label: 'Chief Engineer Final Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Sanitation: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'Ward Officer Response' },
    { role: 'Sanitary Inspector', label: 'SI Site Inspection' },
    { role: 'DSI', label: 'Division Sanitary Inspector Review' },
    { role: 'Health Inspector', label: 'Health Inspector Assessment' },
    { role: 'City Health Officer', label: 'CHO Approval' },
    { role: 'Commissioner', label: 'Commissioner Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Revenue: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'Revenue Inspector', label: 'RI Field Inspection' },
    { role: 'Tahsildar', label: 'Tahsildar Review' },
    { role: 'RDO', label: 'RDO Assessment' },
    { role: 'DRO', label: 'DRO Final Review' },
    { role: 'Collector', label: 'Collector Approval' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Health: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Ward Officer', label: 'Ward Officer Response' },
    { role: 'Medical Officer', label: 'Medical Officer Assessment' },
    { role: 'Medical Superintendent', label: 'MS Review' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
  Education: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'Headmaster', label: 'Headmaster Response' },
    { role: 'BEO', label: 'Block Education Officer Review' },
    { role: 'DEO', label: 'DEO Assessment' },
    { role: 'Director', label: 'Director Approval' },
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
  Welfare: [
    { role: 'Citizen', label: 'Issue Filed' },
    { role: 'VAO', label: 'VAO Verification' },
    { role: 'CDO', label: 'CDO Assessment' },
    { role: 'Deputy CDO', label: 'Deputy CDO Review' },
    { role: 'District Officer', label: 'District Officer Approval' },
    { role: 'Director', label: 'Director Clearance' },
    { role: 'Resolved', label: 'Issue Resolved' },
  ],
};

// Map a citizen category (any case) to a department hierarchy key
export const normalizeDept = (category) => {
  if (!category) return 'Water';
  const key = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return DEPT_HIERARCHY[key] ? key : 'Water';
};

// First official a freshly filed ticket is routed to (index 0 is the Citizen)
export const getFirstResponder = (category) => DEPT_HIERARCHY[normalizeDept(category)][1].role;

// Next role up the chain after the current holder (never past 'Resolved')
export const getNextRole = (category, currentRole) => {
  const h = DEPT_HIERARCHY[normalizeDept(category)];
  const idx = h.findIndex(s => s.role === currentRole);
  return h[Math.min((idx < 0 ? 1 : idx) + 1, h.length - 1)].role;
};

// Get current step index based on ticket assignedTo role
export const getCurrentStep = (category, assignedTo) => {
  const hierarchy = DEPT_HIERARCHY[normalizeDept(category)];
  const idx = hierarchy.findIndex(h => h.role === assignedTo);
  return idx === -1 ? 1 : idx;
};

// Get progress percentage
export const getProgressPercent = (category, assignedTo) => {
  const hierarchy = DEPT_HIERARCHY[normalizeDept(category)];
  const idx = getCurrentStep(category, assignedTo);
  return Math.round((idx / (hierarchy.length - 1)) * 100);
};
