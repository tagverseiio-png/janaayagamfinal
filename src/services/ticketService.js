import { tickets as initialTickets, ticketEvents as initialEvents, notifications as initialNotifs, departments } from '../mock/index.js';
import { resolveAssignedOfficer, resolveEscalationOfficer } from './routing.js';

// In-memory data persistence for the session
let localTickets = [...initialTickets];
let localEvents = [...initialEvents];
let localNotifications = [...initialNotifs];

// Helper to calculate haversine distance (approx)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

export const ticketService = {
  getTickets: async (scopePredicate) => {
    return localTickets.filter(scopePredicate).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getTicketById: async (id) => {
    return localTickets.find(t => t.id === id);
  },

  checkDuplicates: async (lat, lng, categoryId) => {
    // Return tickets within 7.5m with same category
    return localTickets.filter(t => {
      if (t.categoryId !== categoryId) return false;
      const distance = getDistance(lat, lng, t.lat, t.lng);
      return distance <= 7.5;
    });
  },

  createTicket: async (payload) => {
    const assignedOfficerId = resolveAssignedOfficer(payload.wardId, payload.departmentId);
    
    const newTicket = {
      id: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      citizenId: payload.citizenId,
      wardId: payload.wardId,
      departmentId: payload.departmentId,
      categoryId: payload.categoryId,
      status: "SUBMITTED",
      photoUrl: payload.photoUrl || "",
      lat: payload.lat,
      lng: payload.lng,
      assignedOfficerId: assignedOfficerId,
      claimCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localTickets.push(newTicket);
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId: newTicket.id,
      actorId: payload.citizenId,
      fromStatus: null,
      toStatus: "SUBMITTED",
      atrText: "Citizen submitted grievance",
      timestamp: new Date().toISOString()
    });

    return newTicket;
  },

  claimTicket: async (ticketId, citizenId) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    ticket.claimCount += 1;
    ticket.updatedAt = new Date().toISOString();
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId,
      actorId: citizenId,
      fromStatus: ticket.status,
      toStatus: ticket.status,
      atrText: "Citizen claimed duplicate ticket",
      timestamp: new Date().toISOString()
    });
    
    return ticket;
  },

  assignTicket: async (ticketId) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    const oldStatus = ticket.status;
    ticket.status = "IN_PROGRESS";
    ticket.updatedAt = new Date().toISOString();
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId,
      actorId: ticket.assignedOfficerId,
      fromStatus: oldStatus,
      toStatus: "IN_PROGRESS",
      atrText: "Officer assigned and started work",
      timestamp: new Date().toISOString()
    });
    return ticket;
  },

  resolveTicket: async (ticketId, officerId, evidenceUrl) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    const oldStatus = ticket.status;
    ticket.status = "RESOLVED";
    ticket.photoUrl = evidenceUrl || ticket.photoUrl;
    ticket.updatedAt = new Date().toISOString();
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId,
      actorId: officerId,
      fromStatus: oldStatus,
      toStatus: "RESOLVED",
      atrText: "Officer resolved the grievance",
      timestamp: new Date().toISOString()
    });
    
    localNotifications.push({
      id: `NOTIF-${Date.now()}`,
      userId: ticket.citizenId,
      ticketId: ticket.id,
      type: "TICKET_RESOLVED",
      message: `Your ticket ${ticket.id} has been resolved by the department. Please confirm.`,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    return ticket;
  },

  escalateTicket: async (ticketId, officerId, atrText) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    const parentOfficerId = resolveEscalationOfficer(officerId);
    if (parentOfficerId) {
      ticket.assignedOfficerId = parentOfficerId;
      ticket.updatedAt = new Date().toISOString();
      
      localEvents.push({
        id: `EVT-${Date.now()}`,
        ticketId,
        actorId: officerId,
        fromStatus: ticket.status,
        toStatus: ticket.status,
        atrText: atrText || "Ticket escalated to higher authority",
        timestamp: new Date().toISOString()
      });
    }
    return ticket;
  },

  confirmResolution: async (ticketId) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    ticket.status = "CLOSED";
    ticket.updatedAt = new Date().toISOString();
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId,
      actorId: ticket.citizenId,
      fromStatus: "RESOLVED",
      toStatus: "CLOSED",
      atrText: "Citizen confirmed resolution",
      timestamp: new Date().toISOString()
    });
    return ticket;
  },

  reopenTicket: async (ticketId) => {
    const ticket = localTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    ticket.status = "ASSIGNED";
    ticket.updatedAt = new Date().toISOString();
    
    localEvents.push({
      id: `EVT-${Date.now()}`,
      ticketId,
      actorId: ticket.citizenId,
      fromStatus: "RESOLVED",
      toStatus: "ASSIGNED",
      atrText: "Citizen reopened the ticket due to dissatisfaction",
      timestamp: new Date().toISOString()
    });
    return ticket;
  },
  
  getNotifications: async (userId) => {
    return localNotifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};
