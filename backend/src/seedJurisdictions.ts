import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataPath = path.resolve(__dirname, './data/tn_jurisdictions.json');

async function main() {
  let wardCount = 0;
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found. Please run extraction script first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log('Cleaning existing Jurisdictions...');
  await prisma.employee.updateMany({ data: { jurisdictionId: null } });
  await prisma.ticket.updateMany({ data: { jurisdictionId: null } });
  await prisma.jurisdiction.deleteMany({});

  console.log('Creating State Node...');
  const stateNode = await prisma.jurisdiction.create({
    data: {
      level: 'STATE',
      name: 'Tamil Nadu'
    }
  });

  console.log('Creating Districts...');
  const districtMap = new Map<string, string>(); // name -> id
  for (const dist of data.districts) {
    const dNode = await prisma.jurisdiction.create({
      data: {
        level: 'DISTRICT',
        name: dist.name,
        parentId: stateNode.id
      }
    });
    districtMap.set(dist.name, dNode.id);
  }

  console.log('Creating Blocks and Block Wards...');
  let blockCount = 0;
  for (const [district, blocks] of Object.entries(data.blocks)) {
    const parentId = districtMap.get(district) || districtMap.get(district.replace(' (former district)', ''));
    if (!parentId) continue;
    
    for (const block of blocks as string[]) {
      const blockNode = await prisma.jurisdiction.create({
        data: {
          level: 'BLOCK',
          name: block.replace('(part)', '').trim(),
          parentId
        }
      });
      blockCount++;

      // Generate generic wards for blocks (rural areas)
      for (let i = 1; i <= 15; i++) {
        await prisma.jurisdiction.create({
          data: {
            level: 'WARD',
            name: `Ward ${i}`,
            parentId: blockNode.id
          }
        });
        wardCount++;
      }
    }
  }

  console.log('Creating Assembly Constituencies...');
  let acCount = 0;
  for (const ac of data.assemblyConstituencies) {
    let parentId = districtMap.get(ac.district);
    if (!parentId) parentId = stateNode.id;

    await prisma.jurisdiction.create({
      data: {
        level: 'CONSTITUENCY',
        name: ac.name,
        parentId
      }
    });
    acCount++;
  }

  console.log('Creating Lok Sabha Constituencies...');
  let lsCount = 0;
  if (data.lokSabhaConstituencies) {
    for (const ls of data.lokSabhaConstituencies) {
      const primaryDistrict = ls.district.split('/')[0].trim();
      let parentId = districtMap.get(primaryDistrict) || stateNode.id;

      await prisma.jurisdiction.create({
        data: {
          level: 'LOK_SABHA',
          name: ls.name,
          parentId
        }
      });
      lsCount++;
    }
  }

  console.log('Creating Corporations and Wards...');
  let corpCount = 0;

  if (data.corporations) {
    for (const corp of data.corporations) {
      // Find parent district
      let parentId = districtMap.get(corp.district);
      if (!parentId && corp.district === 'Chennai') parentId = districtMap.get('Chennai');
      if (!parentId) parentId = stateNode.id;

      const corpNode = await prisma.jurisdiction.create({
        data: {
          level: 'CORPORATION',
          name: corp.name,
          parentId
        }
      });
      corpCount++;

      // If it's Chennai, we have specific Zones and Wards
      if (corp.name === 'Greater Chennai Corporation' && data.chennaiZones) {
        for (const zone of data.chennaiZones) {
          const zoneNode = await prisma.jurisdiction.create({
            data: {
              level: 'ZONE',
              name: `Zone ${zone.zoneId}: ${zone.name}`,
              parentId: corpNode.id
            }
          });

          // Generate exact wards for this zone
          for (let i = zone.startWard; i <= zone.endWard; i++) {
            await prisma.jurisdiction.create({
              data: {
                level: 'WARD',
                name: `Ward ${i}`,
                parentId: zoneNode.id
              }
            });
            wardCount++;
          }
        }
      } else {
        // For other corporations, generate generic wards
        for (let i = 1; i <= corp.wardCount; i++) {
          await prisma.jurisdiction.create({
            data: {
              level: 'WARD',
              name: `Ward ${i}`,
              parentId: corpNode.id
            }
          });
          wardCount++;
        }
      }
    }
  }

  console.log('Creating Municipalities...');
  let muniCount = 0;
  if (data.municipalities) {
    for (const muni of data.municipalities) {
      let parentId = districtMap.get(muni.district) || stateNode.id;

      const muniNode = await prisma.jurisdiction.create({
        data: {
          level: 'MUNICIPALITY',
          name: muni.name,
          parentId
        }
      });
      muniCount++;

      // Generate Wards
      for (let i = 1; i <= muni.wardCount; i++) {
        await prisma.jurisdiction.create({
          data: {
            level: 'WARD',
            name: `Ward ${i}`,
            parentId: muniNode.id
          }
        });
        wardCount++;
      }
    }
  }

  console.log('Seeding Complete!');
  console.log(`State: 1`);
  console.log(`Districts: ${districtMap.size}`);
  console.log(`Blocks: ${blockCount}`);
  console.log(`Assembly Constituencies: ${acCount}`);
  console.log(`Lok Sabha Constituencies: ${lsCount}`);
  console.log(`Corporations: ${corpCount}`);
  console.log(`Municipalities: ${muniCount}`);
  console.log(`Wards Generated: ${wardCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
