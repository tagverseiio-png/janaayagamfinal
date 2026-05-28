const fs = require('fs');
const path = require('path');

const group2 = [
  'src/portals/dro/DroDashboard.jsx',
  'src/portals/vao/VaoDashboard.jsx',
  'src/portals/ward-officer/WardDashboard.jsx'
];

const mapStartString = '      {/* ══ LIVE DISTRICT RADAR SECTION ══ */}';

group2.forEach(file => {
  const filepath = path.join('c:\\jananayagam', file);
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');
  
  const startIndex = code.indexOf(mapStartString);
  if (startIndex === -1) {
    console.log('Map block not found in Group 2:', file);
    return;
  }
  
  let remainder = code.substring(startIndex);
  const endMatch = remainder.match(/(<\/motion\.div>|<\/div>\s*\)\s*;\s*\})/);
  if (!endMatch) {
    console.log('Could not find end of map block for Group 2:', file);
    return;
  }
  
  // Extract the map block
  const mapBlock = remainder.substring(0, endMatch.index);
  
  // Remove map block from original location at the bottom
  code = code.substring(0, startIndex) + remainder.substring(endMatch.index);
  
  // Find stat cards grid end
  // We can look for `<div className="stat-grid-3">`, `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`, or `<div className="stat-grid">`
  const gridMatch = code.match(/<div className="(stat-grid-3|stat-grid|grid grid-cols-1 sm:grid-cols-3 gap-4)">/);
  
  if (gridMatch) {
    const gridStart = gridMatch.index;
    let openTags = 0;
    let gridEnd = -1;
    let i = gridStart;
    while (i < code.length) {
      if (code.substr(i, 4) === '<div') openTags++;
      if (code.substr(i, 5) === '</div') {
        openTags--;
        if (openTags === 0) {
          gridEnd = i + 6; // include closing bracket
          break;
        }
      }
      i++;
    }
    
    if (gridEnd !== -1) {
      code = code.substring(0, gridEnd) + '\n\n' + mapBlock + code.substring(gridEnd);
      fs.writeFileSync(filepath, code);
      console.log('Fixed Group 2:', file);
    } else {
      console.log('Failed to parse grid end in:', file);
    }
  } else {
    console.log('Grid not found in:', file);
  }
});
