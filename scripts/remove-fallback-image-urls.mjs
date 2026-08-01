import fs from 'node:fs/promises';

const file = 'src/styles.css';
let css = await fs.readFile(file, 'utf8');
css = css
  .replace("background:url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2200&q=90') center/cover;", 'background-position:center;background-size:cover;')
  .replace("background:url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85') center/cover;", 'background-position:center;background-size:cover;');
await fs.writeFile(file, css);
