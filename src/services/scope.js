import { officers, wards } from '../mock/index.js';

/**
 * Returns an array of all descendant officer IDs recursively.
 */
const getDescendantOfficerIds = (officerId) => {
  let descendants = [];
  const children = officers.filter(o => o.parentOfficerId === officerId);
  for (const child of children) {
    descendants.push(child.id);
    descendants = descendants.concat(getDescendantOfficerIds(child.id));
  }
  return descendants;
};

/**
 * Returns a filter predicate function for tickets based on the current user's role.
 * @param {Object} currentUser - Can be an officer, citizen, MLA, etc.
 * @returns {Function} (ticket) => boolean
 */
export const getScopeFilter = (currentUser) => {
  if (!currentUser) return () => false;

  const role = currentUser.role || 'CITIZEN';

  switch(role) {
    case 'CM':
    case 'ADMIN':
      // Sees everything
      return () => true;

    case 'MLA':
      // Sees all departments, but only within their constituency.
      // We must get all wards belonging to their constituency.
      const mlaWards = wards
        .filter(w => w.constituencyId === currentUser.jurisdictionId)
        .map(w => w.id);
      return (ticket) => mlaWards.includes(ticket.wardId);

    case 'Minister':
      // Sees their entire department statewide
      return (ticket) => ticket.departmentId === currentUser.departmentId;

    case 'CITIZEN':
      // Sees only their own tickets
      return (ticket) => ticket.citizenId === currentUser.id;

    default:
      // Other Officer Roles (AAE, AE, Director, etc.)
      // They see tickets assigned directly to them, OR assigned to any of their descendants.
      // Additionally, if they are the lowest level, they see unassigned tickets in their ward.
      const visibleOfficerIds = [currentUser.id, ...getDescendantOfficerIds(currentUser.id)];
      
      return (ticket) => {
        if (visibleOfficerIds.includes(ticket.assignedOfficerId)) return true;
        // Also show unassigned tickets if the ticket's ward matches this officer's jurisdiction
        if (!ticket.assignedOfficerId && ticket.wardId === currentUser.jurisdictionId && ticket.departmentId === currentUser.departmentId) {
          return true;
        }
        return false;
      };
  }
};
