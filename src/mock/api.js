import { grievances, officers, categories } from './data.js';

// Simulated delay for realistic API feel
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

let mockGrievances = [...grievances];

// // TODO: backend wiring - Replace this mock service with real API calls using fetch/axios
export const api = {
  // --- Grievance API ---
  getGrievances: async (filters = {}) => {
    await delay();
    let result = [...mockGrievances];
    
    if (filters.status) {
      result = result.filter(g => g.status === filters.status);
    }
    if (filters.category) {
      result = result.filter(g => g.category === filters.category);
    }
    if (filters.assignedOfficer) {
      result = result.filter(g => g.assignedOfficer === filters.assignedOfficer);
    }
    
    return result;
  },
  
  getGrievanceById: async (id) => {
    await delay();
    const grievance = mockGrievances.find(g => g.id === id);
    if (!grievance) throw new Error('Grievance not found');
    return grievance;
  },
  
  createGrievance: async (data) => {
    await delay(1200); // slightly longer for creation
    const newGrievance = {
      ...data,
      id: `GRV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'New',
      assignedOfficer: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    };
    mockGrievances.unshift(newGrievance);
    return newGrievance;
  },
  
  updateGrievanceStatus: async (id, status, noteText = '') => {
    await delay();
    const index = mockGrievances.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Grievance not found');
    
    mockGrievances[index].status = status;
    mockGrievances[index].updatedAt = new Date().toISOString();
    
    if (noteText) {
      mockGrievances[index].notes.push({
        id: Date.now(),
        text: noteText,
        author: 'System/Officer', // Would be actual logged in user
        timestamp: new Date().toISOString()
      });
    }
    
    return mockGrievances[index];
  },

  assignGrievance: async (grievanceId, officerId) => {
    await delay();
    const index = mockGrievances.findIndex(g => g.id === grievanceId);
    if (index === -1) throw new Error('Grievance not found');
    
    mockGrievances[index].assignedOfficer = officerId;
    mockGrievances[index].status = 'Assigned';
    mockGrievances[index].updatedAt = new Date().toISOString();
    
    mockGrievances[index].notes.push({
      id: Date.now(),
      text: `Grievance assigned to officer ${officerId}`,
      author: 'Admin',
      timestamp: new Date().toISOString()
    });
    
    return mockGrievances[index];
  },

  // --- Meta API ---
  getOfficers: async () => {
    await delay(400);
    return [...officers];
  },

  getCategories: async () => {
    await delay(200);
    return [...categories];
  }
};
