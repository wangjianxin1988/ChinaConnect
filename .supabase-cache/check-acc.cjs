const fs = require('fs');
const text = fs.readFileSync('src/pages/account.astro', 'utf8');
console.log('First 200 chars:');
console.log(JSON.stringify(text.substring(0, 200)));
