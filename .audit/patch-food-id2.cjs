const fs = require("fs");
const p = "src/pages/[lang]/food/[id].astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  '<img src={r.imageUrl} alt={r.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />',
  '<img src={r.imageUrl} alt={jaFood(r.name)} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />'
);
s = s.replace(
  '<p class="font-medium text-gray-900 text-sm line-clamp-1">{r.name}</p>',
  '<p class="font-medium text-gray-900 text-sm line-clamp-1">{jaFood(r.name)}</p>'
);
s = s.replace(
  '<p class="text-xs text-gray-500">{r.cuisine}</p>',
  '<p class="text-xs text-gray-500">{jaFood(r.cuisine)}</p>'
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
