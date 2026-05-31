const fs = require('fs');
let content = fs.readFileSync('src/data/seedData.js', 'utf8');
const replacement = `, timeline: [ { role: 'Citizen', label: 'Issue Filed', completedAt: '2026-05-28 03:30 PM', status: 'done' }, { role: 'VAO', label: 'Village Verification & Site Inspection', completedAt: '2026-05-28 03:50 PM', status: 'done' }, { role: 'AEO', label: 'AEO Assessment', completedAt: null, status: 'current' }, { role: 'Deputy AE', label: 'Deputy Area Engineer Review', completedAt: null, status: 'pending' } ] }`;
content = content.replace(/(lat:\s*[\d.]+,\s*lng:\s*[\d.]+)\s*\}/g, '$1' + replacement);
fs.writeFileSync('src/data/seedData.js', content);
console.log('updated seedData.js');
