const fs = require('fs');
const path = require('path');

const group1 = [
  'src/portals/cm/CmDashboard.jsx',
  'src/portals/minister/MinisterDashboard.jsx',
  'src/portals/collector/CollectorDashboard.jsx',
  'src/portals/dept-secretary/SecretaryDashboard.jsx'
];

const group2 = [
  'src/portals/mla/MlaDashboard.jsx',
  'src/portals/dro/DroDashboard.jsx',
  'src/portals/vao/VaoDashboard.jsx',
  'src/portals/ward-officer/WardDashboard.jsx'
];

// Map block to remove / move
const mapStartString = '      {/* ══ LIVE DISTRICT RADAR SECTION ══ */}';
const mapRegex = /\s*\{\/\* ══ LIVE DISTRICT RADAR SECTION ══ \*\/\}[\s\S]*?(?=<\/motion\.div>|<\/div>\s*\)\s*;\s*\})/g;

// Fix Group 1: Remove the injected map completely
group1.forEach(file => {
  const filepath = path.join('c:\\jananayagam', file);
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');
  
  // Custom exact regex for the block injected at the bottom:
  // It starts with `{/* ══ LIVE DISTRICT RADAR SECTION ══ */}` and ends with `</div>\n\n      </div>\n`
  // Actually, we can just split at the start string and then find the end of the div.
  
  const startIndex = code.indexOf(mapStartString);
  if (startIndex !== -1) {
    // Find the end of the map block
    const afterStart = code.substring(startIndex);
    // The map block has exactly one root `div`
    // We can just use the map block string I used to inject it:
    
    // Let's use a simpler approach: the injected block is followed closely by </motion.div> or </div>);
    const splitStr = code.substring(0, startIndex);
    // But we need to keep the closing tags!
    let remainder = afterStart;
    const endMatch = remainder.match(/(<\/motion\.div>|<\/div>\s*\)\s*;\s*\})/);
    if (endMatch) {
      code = splitStr + endMatch[0] + remainder.substring(endMatch.index + endMatch[0].length);
      fs.writeFileSync(filepath, code);
      console.log('Fixed Group 1:', file);
    }
  }
});

// Fix Group 2: Move the map to below stat cards
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
  
  // Remove map block from original location
  code = code.substring(0, startIndex) + remainder.substring(endMatch.index);
  
  // Find stat cards grid end
  // Stat cards start with `{/* KPI Stats Grid` or similar, or `grid grid-cols-2`
  // And end when the grid div closes.
  
  // Let's just locate the first `grid grid-cols-2` or similar stat card container
  const gridMatch = code.match(/<div className="grid grid-cols-2 [^>]+gap-3[^>]*>/);
  if (gridMatch) {
    const gridStart = gridMatch.index;
    // Find the matching closing </div> for this grid
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
      // Insert map block right after gridEnd
      code = code.substring(0, gridEnd) + '\n\n' + mapBlock + code.substring(gridEnd);
      fs.writeFileSync(filepath, code);
      console.log('Fixed Group 2:', file);
    } else {
      console.log('Failed to parse grid end in:', file);
    }
  } else {
    // If not found, look for another heuristic
    console.log('Grid not found in:', file);
  }
});
