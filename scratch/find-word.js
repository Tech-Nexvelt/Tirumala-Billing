const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      search(full);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('@react-pdf/renderer') || content.includes('pdf')) {
        console.log(`Found in: ${full}`);
      }
    }
  }
}

search(path.join(__dirname, '../src'));
