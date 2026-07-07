const fs = require('fs');
const text = fs.readFileSync('src/layouts/Layout.astro', 'utf8');
console.log('First 20 chars:', JSON.stringify(text.substring(0, 20)));
console.log('First 50:', JSON.stringify(text.substring(0, 50)));
