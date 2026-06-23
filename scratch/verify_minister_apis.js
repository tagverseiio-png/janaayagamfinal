import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testMinisterFlow(username) {
  console.log(`\n======================================`);
  console.log(`Testing Minister Login: ${username}`);
  console.log(`======================================`);
  
  try {
    // 1. Login
    const loginRes = await axios.post(`${BASE_URL}/auth/employee/login`, {
      username,
      password: 'admin123'
    });
    
    const { token, employee } = loginRes.data;
    console.log(`✓ Login Successful!`);
    console.log(`  Name: ${employee.name}`);
    console.log(`  Role: ${employee.role}`);
    console.log(`  Department: ${employee.department?.name}`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Fetch stats
    const statsRes = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log(`✓ Stats Fetch Successful!`);
    console.log(`  Total Tickets in Scope: ${statsRes.data.totalTickets}`);
    console.log(`  Total Resolved: ${statsRes.data.totalResolved}`);
    console.log(`  Total Open: ${statsRes.data.totalOpen}`);
    console.log(`  Health Score: ${statsRes.data.healthScore}`);
    console.log(`  District Performance:`, statsRes.data.districtPerformance);
    
    // 3. Fetch tickets
    const ticketsRes = await axios.get(`${BASE_URL}/api/tickets`, { headers }).catch(err => {
      // Fallback in case route matches standard /tickets
      return axios.get(`${BASE_URL}/tickets`, { headers });
    });
    console.log(`✓ Tickets Fetch Successful!`);
    console.log(`  Number of tickets returned: ${ticketsRes.data.length}`);
    if (ticketsRes.data.length > 0) {
      console.log(`  First ticket summary:`);
      console.log(`    Number: ${ticketsRes.data[0].ticketNumber}`);
      console.log(`    Title: ${ticketsRes.data[0].title}`);
      console.log(`    Department Name: ${ticketsRes.data[0].departmentName}`);
    }
  } catch (err) {
    console.error(`✗ Error testing ${username}:`, err.response?.data || err.message);
  }
}

async function run() {
  await testMinisterFlow('minister_electricity');
  await testMinisterFlow('minister_health');
}

run();
