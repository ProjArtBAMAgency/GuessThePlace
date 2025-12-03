import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raw = fs.readFileSync(path.join(__dirname, 'zones.geojson'), 'utf-8');
const zonesData = JSON.parse(raw);

const zonesById = new Map();
for(const feature of zonesData.features){
    const id = feature.properties.id;
    zonesById.set(id, feature);
}

export { zonesData, zonesById };