const fs = require('fs');

const data = fs.readFileSync('../../docs/TamilNadu_JanaNayagam_Data.md', 'utf-8');
const lines = data.split('\n');

const districts = [];
const lokSabha = [];
const assembly = [];
const taluks = [];

let parsingDistricts = false;
let parsingAssembly = false;
let parsingLokSabha = false;
let parsingTaluks = false;

let talukCount = 1;

for (let i=0; i<lines.length; i++) {
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
            const hq = parts[3];
            if (!isNaN(parseInt(no))) {
                districts.push({ name, hq });
            }
        } else if (parsingAssembly) {
            const no = parts[1];
            const name = parts[2];
            const reserved = parts[3];
            const dist = parts[4];
            const ls = parts[5];
            if (!isNaN(parseInt(no))) {
                assembly.push({ name, district: dist, lokSabha: ls });
            }
        } else if (parsingLokSabha) {
            const no = parts[1];
            const name = parts[2];
            const reserved = parts[3];
            const dist = parts[4];
            if (!isNaN(parseInt(no))) {
                lokSabha.push({ name, district: dist });
            }
        } else if (parsingTaluks) {
            const list = parts[1];
            const year = parts[2];
            if (list && list.length > 3) {
                const arr = list.split(',').map(x => x.trim());
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

console.log('Districts:', districts.length);
console.log('Assembly:', assembly.length);
console.log('Lok Sabha:', lokSabha.length);
console.log('Taluks:', taluks.length);

fs.writeFileSync('parsedData.json', JSON.stringify({ districts, assembly, lokSabha, taluks }, null, 2));
