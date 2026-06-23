// Mock data for JanaNayagam Citizen Grievance Platform
export const grievances = [
  {
    id: "GRV-001",
    title: "Pothole on Main Street",
    description: "There is a massive pothole in front of the supermarket. It's causing traffic and is dangerous for two-wheelers.",
    category: "roads",
    location: "Main Street, Zone 1",
    status: "New",
    citizenName: "Muthu Kumar",
    assignedOfficer: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: []
  },
  {
    id: "GRV-002",
    title: "No water supply for 3 days",
    description: "Our street hasn't received drinking water for the past 3 days. Please resolve immediately.",
    category: "water",
    location: "Kamarajar Salai, Zone 3",
    status: "Assigned",
    citizenName: "Lakshmi",
    assignedOfficer: "OFF-101",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: [
      { id: 1, text: "Assigned to Water Dept inspector.", author: "Admin", timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
    ]
  },
  {
    id: "GRV-003",
    title: "Street lights not working",
    description: "The street lights in our area are not working for the past week. It is completely dark.",
    category: "electricity",
    location: "Gandhi Nagar, Zone 2",
    status: "In Progress",
    citizenName: "Ramesh",
    assignedOfficer: "OFF-102",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    notes: [
      { id: 1, text: "Inspected the area. Faulty transformer. Repair work scheduled.", author: "Rajesh (EB)", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
    ]
  }
];

export const officers = [
  { id: "OFF-101", name: "Karthik (Water Dept)", department: "Water", zone: "Zone 3" },
  { id: "OFF-102", name: "Rajesh (EB)", department: "Electricity", zone: "Zone 2" },
  { id: "OFF-103", name: "Suresh (Highways)", department: "Roads", zone: "Zone 1" }
];

export const categories = [
  { id: "water", label: "Water" },
  { id: "roads", label: "Roads" },
  { id: "electricity", label: "Electricity" },
  { id: "sanitation", label: "Sanitation" },
  { id: "other", label: "Other" }
];
