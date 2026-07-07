const fs = require('fs');
const path = 'src/pages/ai.astro';
let text = fs.readFileSync(path, 'utf8');
text = text.replace('client:only="react"', 'client:load');
fs.writeFileSync(path, text, 'utf8');
console.log('Replaced client:only with client:load');
