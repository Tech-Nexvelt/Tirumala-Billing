const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/app/(app)/billing/new/page.tsx');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('pdf') || line.includes('PDF')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
