import fs from 'node:fs/promises';
import path from 'node:path';

const source = 'C:/Users/acer/Downloads/KPS_INN_3_modified2.html';
const html = await fs.readFile(source, 'utf8');
const root = path.resolve('src/assets');

await Promise.all(['logo', 'rooms', 'gallery', 'icons'].map(folder => fs.mkdir(path.join(root, folder), { recursive: true })));

const base64Logo = html.match(/src="data:image\/png;base64,([^"]+)"/i)?.[1];
if (!base64Logo) throw new Error('The original HTML contains no embedded PNG logo.');
await fs.writeFile(path.join(root, 'logo', 'kps-inn-logo.png'), Buffer.from(base64Logo, 'base64'));

const images = [
  ['gallery', 'reception.jpg', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'],
  ['rooms', 'standard-room.jpg', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80'],
  ['rooms', 'deluxe-room.jpg', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80'],
  ['rooms', 'family-suite.jpg', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'hotel-room.jpg', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'bedroom-interior.jpg', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'hotel-building.jpg', 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'restaurant-dining.jpg', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'hotel-lobby.jpg', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'comfort-room.jpg', 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'premium-suite.jpg', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'executive-lounge.jpg', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'luxury-bathroom.jpg', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80'],
  ['gallery', 'pool-layout.jpg', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80'],
];

await Promise.all(images.map(async ([folder, name, url]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${name}: ${response.status}`);
  await fs.writeFile(path.join(root, folder, name), Buffer.from(await response.arrayBuffer()));
}));

console.log(`Extracted 1 embedded logo and ${images.length} original external images.`);
