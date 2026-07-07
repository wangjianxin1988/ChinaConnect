const fs = require('fs');
const path = 'src/pages/ai.astro';
let text = fs.readFileSync(path, 'utf8');
text = text.replace('client:load', 'client:only="react"');
fs.writeFileSync(path, text, 'utf8');
console.log('Restored client:only');
