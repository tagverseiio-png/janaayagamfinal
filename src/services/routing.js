import { officers, hierarchy } from '../mock/index.js';

/**
 * Derives the initial assigned officer for a new ticket.
 * It searches for the lowest-level officer (e.g. AAE or DSI) in the department's hierarchy
 * whose jurisdictionId matches the provided wardId.
 * @param {string} wardId 
 * @param {string} departmentId 
 * @returns {string|null} assignedOfficerId
 */
export const resolveAssignedOfficer = (wardId, departmentId) => {
  const deptHierarchy = hierarchy[departmentId];
  if (!deptHierarchy) return null;

  // We want the lowest level. Assuming hierarchy arrays are ordered lowest to highest 
  // (e.g. ["AAE", "AE", ...]). 
  // We'll search for an officer that matches the wardId and is in the department.
  // The first matching officer found should ideally be the bottom-level one for that ward.
  const eligibleOfficers = officers.filter(o => 
    o.departmentId === departmentId && o.jurisdictionId === wardId
  );

  if (eligibleOfficers.length > 0) {
    return eligibleOfficers[0].id;
  }
  
  // If no ward officer found, maybe it goes straight to the AE? 
  // Simplified: return null if unassigned, so it hits the unassigned queue.
  return null;
};

/**
 * Resolves the parent officer ID for escalation.
 * @param {string} currentOfficerId 
 * @returns {string|null} parentOfficerId
 */
export const resolveEscalationOfficer = (currentOfficerId) => {
  const currentOfficer = officers.find(o => o.id === currentOfficerId);
  return currentOfficer ? currentOfficer.parentOfficerId : null;
};
