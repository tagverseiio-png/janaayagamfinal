const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(srcDir, (err, files) => {
  if (err) throw err;
  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Pattern for data imports
    const patterns = [
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/seedData['"];/g,
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/data\/seedData['"];/g,
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/droSeedData['"];/g,
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/wardSeedData['"];/g,
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/collectorSeedData['"];/g,
      /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\.\/data\/mlaSeedData['"];/g,
      /import\s+\{\s*droSeedData\s*\}\s+from\s+['"]\.\.\/\.\.\/data\/droSeedData['"];/g,
      /import\s+\{\s*collectorSeedData\s*\}\s+from\s+['"]\.\.\/\.\.\/data\/collectorSeedData['"];/g,
    ];

    patterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        const fullMatch = match[0];
        const imports = match[1].split(',').map(s => s.trim());
        
        // Generate empty declarations
        let declarations = '';
        imports.forEach(imp => {
          if (imp === 'STATE_STATS') {
             declarations += `const STATE_STATS = { totalOpen: 0, totalResolved: 0, criticalPriority: 0, breachDistricts: 0, cmEscalations: 0, activeSectors: 0 };\n`;
          } else if (imp === 'DISTRICT_STATS') {
             declarations += `const DISTRICT_STATS = {};\n`;
          } else if (imp === 'getCategoryCount') {
             declarations += `const getCategoryCount = () => [];\n`;
          } else if (imp === 'getTicketsByWard' || imp === 'getTicketsByDistrict' || imp === 'getTicketsByStatus' || imp === 'getTicketsByCategory' || imp === 'normalizeDept' || imp === 'getCurrentStep' || imp === 'getProgressPercent' || imp === 'getNextRole' || imp === 'getFirstResponder') {
             declarations += `const ${imp} = () => [];\n`;
          } else {
             declarations += `const ${imp} = [];\n`;
          }
        });

        content = content.replace(fullMatch, declarations);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
