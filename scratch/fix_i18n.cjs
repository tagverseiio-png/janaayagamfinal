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
  if (!fs.existsSync(filepath)) return;
  
  let code = fs.readFileSync(filepath, 'utf8');

  // Fix i18n destructuring
  code = code.replace(/const\s+{\s*t\s*}\s*=\s*useTranslation\(\);/g, 'const { t, i18n } = useTranslation();');
  // Also if it was already like const { t, i18n } it will not match, which is fine

  // If the map uses `typeof i18n !== 'undefined' && i18n ? i18n.language : 'en'`, we can just simplify it now that we've ensured i18n exists
  code = code.replace(/typeof i18n !== 'undefined' && i18n \? i18n\.language : 'en'/g, "i18n?.language || 'en'");

  fs.writeFileSync(filepath, code);
  console.log('Fixed i18n in', filepath);
});
