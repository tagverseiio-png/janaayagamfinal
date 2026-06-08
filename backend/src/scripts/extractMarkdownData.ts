import fs from 'fs';
import path from 'path';

const markdownPath = path.resolve(__dirname, '../../../docs/TamilNadu_JanaNayagam_Data.md');
const outputPath = path.resolve(__dirname, '../data/tn_jurisdictions.json');

const data = {
  districts: [],
  lokSabhaConstituencies: [],
  assemblyConstituencies: [],
  blocks: {},
  corporations: [],
  chennaiZones: [],
  municipalities: []
};

function parseMarkdown() {
  const content = fs.readFileSync(markdownPath, 'utf8');
  const lines = content.split('\n');

  let parsingMode = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.includes('**Tamil Nadu – 39 Parliamentary (Lok Sabha) Constituencies**')) {
      parsingMode = 'loksabha';
      continue;
    } else if (line.includes('**Tamil Nadu – 234 Assembly (Vidhan Sabha) Constituencies**')) {
      parsingMode = 'assembly';
      continue;
    } else if (line.includes('**Tamil Nadu – 38 Districts with Taluks**')) {
      parsingMode = 'districts';
      continue;
    } else if (line.includes('**Tamil Nadu – Panchayat Unions (Blocks) by District**')) {
      parsingMode = 'blocks';
      continue;
    } else if (line.includes('**ALL 21 MUNICIPAL CORPORATIONS IN TAMIL NADU (2022)**')) {
      parsingMode = 'corporations';
      continue;
    } else if (line.includes('**GREATER CHENNAI CORPORATION – 15 Zones & 200 Wards**')) {
      parsingMode = 'chennai_zones';
      continue;
    } else if (line.includes('**Tamil Nadu – Selected Key Municipalities')) {
      parsingMode = 'municipalities';
      continue;
    } else if (line.includes('**Notable Areas / Localities**') || line.includes('**Tamil Nadu – Urban Ward Count by District')) {
      parsingMode = null; // stop 
    }

    if (parsingMode === 'loksabha') {
      const match = line.match(/^\|(\d+)\|([^|]+)\|([^|]*)\|([^|]+)\|/);
      if (match) {
        data.lokSabhaConstituencies.push({
          id: parseInt(match[1].trim()),
          name: match[2].trim(),
          district: match[4].trim()
        });
      }
    } else if (parsingMode === 'assembly') {
      const match = line.match(/^\|(\d+)\|([^|]+)\|([^|]*)\|([^|]+)\|([^|]+)\|/);
      if (match) {
        data.assemblyConstituencies.push({
          id: parseInt(match[1].trim()),
          name: match[2].trim(),
          type: match[3].trim(),
          district: match[4].trim(),
          lokSabha: match[5].trim()
        });
      }
    } else if (parsingMode === 'districts') {
      const match = line.match(/^\|(\d+)\|([^|]+)\|([^|]+)\|([^|]+)\|(\d+)\|(\d+)\|(\d+)\|/);
      if (match) {
        data.districts.push({
          id: parseInt(match[1].trim()),
          name: match[2].trim(),
          hq: match[3].trim(),
          talukCount: parseInt(match[7].trim())
        });
      }
    } else if (parsingMode === 'corporations') {
      const match = line.match(/^\|(\d+)\|([^|]+)\|([^|]+)\|(\d+)\|/);
      if (match) {
        data.corporations.push({
          id: parseInt(match[1].trim()),
          name: match[2].trim(),
          district: match[3].trim(),
          wardCount: parseInt(match[4].trim())
        });
      }
    } else if (parsingMode === 'chennai_zones') {
      const match = line.match(/^\|(\d+)\|([^|]+)\|(\d+)\s*–\s*(\d+)\|(\d+)\|/);
      if (match) {
        data.chennaiZones.push({
          zoneId: parseInt(match[1].trim()),
          name: match[2].trim(),
          startWard: parseInt(match[3].trim()),
          endWard: parseInt(match[4].trim()),
          wardCount: parseInt(match[5].trim())
        });
      }
    } else if (parsingMode === 'municipalities') {
      const match = line.match(/^\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/);
      if (match && !match[1].includes('**') && !match[1].includes(':-')) {
        const district = match[1].trim();
        const municipality = match[2].trim();
        const wards = match[4].trim();
        
        if (wards !== '—' && parseInt(wards) > 0) {
          data.municipalities.push({
            district,
            name: municipality,
            wardCount: parseInt(wards)
          });
        }
      }
    } else if (parsingMode === 'blocks') {
      const match = line.match(/^\|([^|]+)\|([^|]+)\|/);
      if (match && !match[1].includes('**') && !match[1].includes(':-')) {
        const district = match[1].trim();
        const blocksList = match[2].trim().split(',').map(b => b.trim());
        
        const isValidDistrict = data.districts.some(d => d.name === district) || district === 'Nilgiris' || district === 'Kanyakumari';
        
        if (isValidDistrict && district !== 'Chennai') {
          data.blocks[district] = blocksList;
        }
      }
    }
  }

  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Extracted ${data.lokSabhaConstituencies.length} Lok Sabha constituencies.`);
  console.log(`Extracted ${data.districts.length} districts.`);
  console.log(`Extracted ${data.assemblyConstituencies.length} assembly constituencies.`);
  console.log(`Extracted blocks for ${Object.keys(data.blocks).length} districts.`);
  console.log(`Extracted ${data.municipalities.length} municipalities.`);
  console.log(`Data saved to ${outputPath}`);
}

parseMarkdown();
