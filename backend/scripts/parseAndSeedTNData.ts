import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Parsing Tamil Nadu Data Markdown...');
  const dataPath = path.resolve(__dirname, '../../docs/TamilNadu_JanaNayagam_Data.md');
  const data = fs.readFileSync(dataPath, 'utf-8');
  const lines = data.split('\n');

  const districts: {name: string}[] = [];
  const lokSabha: {name: string, district: string}[] = [];
  const assembly: {name: string, district: string, lokSabha: string}[] = [];
  const taluks: {name: string, parentDistIndex: number}[] = [];

  let parsingDistricts = false;
  let parsingAssembly = false;
  let parsingLokSabha = false;
  let parsingTaluks = false;

  let talukCount = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('**Tamil Nadu – 38 Districts with Taluks**')) {
      parsingDistricts = true;
      parsingAssembly = false;
      parsingLokSabha = false;
      parsingTaluks = false;
      continue;
    } else if (line.includes('**Tamil Nadu – 234 Assembly')) {
      parsingAssembly = true;
      parsingDistricts = false;
      parsingLokSabha = false;
      parsingTaluks = false;
      continue;
    } else if (line.includes('**Tamil Nadu – 39 Parliamentary')) {
      parsingLokSabha = true;
      parsingDistricts = false;
      parsingAssembly = false;
      parsingTaluks = false;
      continue;
    } else if (line.includes('**Taluks List**')) {
      parsingTaluks = true;
      parsingDistricts = false;
      parsingAssembly = false;
      parsingLokSabha = false;
      continue;
    }

    if (line.startsWith('|') && !line.includes(':-') && !line.includes('**')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) continue;

      if (parsingDistricts) {
        const no = parts[1];
        const name = parts[2];
        if (!isNaN(parseInt(no))) {
          districts.push({ name: name.replace(/\s*\(.*?\)/g, '').trim() });
        }
      } else if (parsingAssembly) {
        const no = parts[1];
        const name = parts[2];
        const dist = parts[4];
        const ls = parts[5];
        if (!isNaN(parseInt(no))) {
          assembly.push({ 
            name: name.replace(/\s*\(.*?\)/g, '').trim(), 
            district: dist.split('/')[0].trim(), // Use primary district
            lokSabha: ls.split('/')[0].trim() 
          });
        }
      } else if (parsingLokSabha) {
        const no = parts[1];
        const name = parts[2];
        const dist = parts[4];
        if (!isNaN(parseInt(no))) {
          lokSabha.push({ 
            name: name.replace(/\s*\(.*?\)/g, '').trim(), 
            district: dist.split('/')[0].trim() 
          });
        }
      } else if (parsingTaluks) {
        const list = parts[1];
        if (list && list.length > 3) {
          const arr = list.split(',').map(x => x.trim().replace(/\s*\(.*?\)/g, '').trim());
          arr.forEach(t => {
            if (t.length > 2) {
              taluks.push({ name: t, parentDistIndex: talukCount - 1 });
            }
          });
          talukCount++;
        }
      }
    }
  }

  console.log(`Found: ${districts.length} Districts, ${lokSabha.length} Lok Sabha, ${assembly.length} Assembly, ${taluks.length} Taluks (used as Wards/Zones)`);

  console.log('Clearing existing Jurisdictions (this may fail if there are foreign key constraints like Employees or Tickets tied to them)');
  try {
      await prisma.jurisdiction.deleteMany({});
  } catch(e) {
      console.log('Could not clear jurisdictions safely. Let us create them alongside.');
  }

  console.log('Seeding STATE...');
  const state = await prisma.jurisdiction.create({
    data: { name: 'Tamil Nadu', level: 'STATE' }
  });

  console.log('Seeding DISTRICTS...');
  const districtMap: Record<string, string> = {};
  for (const d of districts) {
    const created = await prisma.jurisdiction.create({
      data: {
        name: d.name,
        level: 'DISTRICT',
        parentId: state.id
      }
    });
    districtMap[d.name] = created.id;
  }

  // Fallback map for name variations
  const resolveDistrictId = (name: string) => {
    if (districtMap[name]) return districtMap[name];
    const key = Object.keys(districtMap).find(k => k.includes(name) || name.includes(k));
    if (key) return districtMap[key];
    return state.id; // Fallback to state
  };

  console.log('Seeding LOK SABHA...');
  const lsMap: Record<string, string> = {};
  for (const ls of lokSabha) {
    const pId = resolveDistrictId(ls.district);
    const created = await prisma.jurisdiction.create({
      data: {
        name: ls.name,
        level: 'LOK_SABHA',
        parentId: pId
      }
    });
    lsMap[ls.name] = created.id;
  }

  console.log('Seeding ASSEMBLY CONSTITUENCIES...');
  const asMap: Record<string, string> = {};
  for (const a of assembly) {
    const pId = resolveDistrictId(a.district);
    const created = await prisma.jurisdiction.create({
      data: {
        name: a.name,
        level: 'CONSTITUENCY',
        parentId: pId
      }
    });
    asMap[a.name] = created.id;
  }

  console.log('Seeding TALUKS as WARD level...');
  for (const t of taluks) {
    const distName = districts[t.parentDistIndex]?.name;
    const pId = distName ? resolveDistrictId(distName) : state.id;
    await prisma.jurisdiction.create({
      data: {
        name: t.name,
        level: 'WARD',
        parentId: pId
      }
    });
  }

  console.log('Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
