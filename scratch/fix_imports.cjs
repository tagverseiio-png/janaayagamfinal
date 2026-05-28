const fs = require('fs');
const path = require('path');

const files = [
  'src/portals/vao/VaoDashboard.jsx',
  'src/portals/ward-officer/WardDashboard.jsx',
  'src/portals/bdo/BdoPortal.jsx',
  'src/portals/dro/DroDashboard.jsx',
  'src/portals/collector/CollectorDashboard.jsx',
  'src/portals/dept-secretary/SecretaryDashboard.jsx',
  'src/portals/minister/MinisterDashboard.jsx',
  'src/portals/mla/MlaDashboard.jsx',
  'src/portals/cm/CmDashboard.jsx'
];

files.forEach(file => {
  const filepath = path.join('c:\\jananayagam', file);
  if (!fs.existsSync(filepath)) {
    console.log('File not found:', filepath);
    return;
  }
  
  let code = fs.readFileSync(filepath, 'utf8');

  // Check if TnMap import is actually in the file
  if (!code.includes("from '../../shared/components/TnMap'") && !code.includes("from '../../../shared/components/TnMap'")) {
    // Add right after the first line (which is usually import React...)
    const lines = code.split('\n');
    lines.splice(1, 0, "import TnMap from '../../shared/components/TnMap';");
    code = lines.join('\n');
    fs.writeFileSync(filepath, code);
    console.log('Added import to', filepath);
  } else {
    console.log('Import already exists in', filepath);
  }
});
