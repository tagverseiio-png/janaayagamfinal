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

const mapJsxBlock = `
      {/* ══ LIVE DISTRICT RADAR SECTION ══ */}
      <div className="bg-white rounded-[16px] p-4 border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-6">
        
        <div className="flex justify-between items-center mb-3 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8B1A1A] animate-pulse" />
            <h3 className="font-extrabold text-sm text-slate-700">
              Live District Radar
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase">SECURE</span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-100">
          <TnMap 
            lang={typeof i18n !== 'undefined' && i18n ? i18n.language : 'en'} 
            citizenMode={false} 
            height="220px" 
            center={
              (() => {
                const ud = typeof window !== 'undefined' ? localStorage.getItem('jn_district') : null;
                const dMap = {
                  "Chennai": [13.0827, 80.2707],
                  "Madurai": [9.9252, 78.1198],
                  "Coimbatore": [11.0168, 76.9558],
                  "Salem": [11.6643, 78.1460],
                  "Trichy": [10.7905, 78.7047]
                };
                return dMap[ud] || [10.8505, 78.6677];
              })()
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center select-none">
          <div>
            <p className="text-sm font-black text-slate-800">1,204</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ACTIVE</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#4CAF50]">8,432</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">RESOLVED</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#F44336]">89</p>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">ESCALATED</p>
          </div>
        </div>

      </div>
`;

files.forEach(file => {
  const filepath = path.join('c:\\jananayagam', file);
  if (!fs.existsSync(filepath)) {
    console.log('File not found:', filepath);
    return;
  }
  
  let code = fs.readFileSync(filepath, 'utf8');

  // Inject TnMap import if missing
  if (!code.includes('TnMap')) {
    code = code.replace(/import\s+.*?['"].*?['"];?\n/, match => `${match}import TnMap from '../../shared/components/TnMap';\n`);
  }

  // Inject Radio if missing
  if (!code.includes('Radio,')) {
    code = code.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/, (match, p1) => {
      if (p1.includes('Radio')) return match;
      return `import { ${p1.trim()}, Radio } from 'lucide-react'`;
    });
  }

  // Since BdoPortal.jsx contains multiple subcomponents, we specifically want to target the BdoDashboard component's return statement.
  if (file.includes('BdoPortal.jsx')) {
    // Find BdoDashboard return statement end:
    const searchStr = '  </div>\n  </div>\n  );\n}';
    if (code.includes(searchStr)) {
       code = code.replace(searchStr, mapJsxBlock + searchStr);
    } else {
       console.log('Failed to match insertion point for BdoPortal');
    }
  } else {
    // Other files use <motion.div> or <div> wrapper for their dashboard.
    // Insert just before the final closing tag of the main component return.
    
    // Check if the dashboard ends with </motion.div> or </div>
    const motionIdx = code.lastIndexOf('</motion.div>');
    const divIdx = code.lastIndexOf('</div>');
    
    // We want the last closing tag before `);`
    // Let's use a regex to find the outermost closing tag of the return block
    // Actually, simply replacing the LAST occurrence of `</motion.div>` if it exists, else `</div>` is usually safe.
    if (motionIdx > divIdx) {
      code = code.slice(0, motionIdx) + mapJsxBlock + code.slice(motionIdx);
    } else {
      // Find the last </div> before the final export/function close
      const match = code.match(/<\/div>\s*\)\s*;\s*\}\s*$/);
      if (match) {
        code = code.substring(0, match.index) + mapJsxBlock + code.substring(match.index);
      } else {
        // Fallback
        code = code.slice(0, divIdx) + mapJsxBlock + code.slice(divIdx);
      }
    }
  }

  fs.writeFileSync(filepath, code);
  console.log('Updated', filepath);
});
