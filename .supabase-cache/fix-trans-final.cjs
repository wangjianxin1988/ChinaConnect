const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

const navOld = [
  '  nav: {',
  '    home: string;',
  '    cities: string;',
  '    restaurants: string;',
  '    aiChat: string;',
  '    guide: string;',
  '',
  '  };'
].join(NL);
const navNew = [
  '  nav: {',
  '    home: string;',
  '    cities: string;',
  '    restaurants: string;',
  '    aiChat: string;',
  '    guide: string;',
  '    business: string;',
  '    tagline: string;',
  '    [key: string]: string;',
  '  };'
].join(NL);

if (!text.includes(navOld)) { console.log('NAV OLD NOT FOUND'); process.exit(1); }
text = text.replace(navOld, navNew);
console.log('NAV replaced');

const homeOld = [
  '  home: {',
  '    heroTitle: string;',
  '    heroSubtitle: string;',
  '    heroDesc: string;',
  '    heroCTA: string;',
  '    exploreCities: string;',
  '    statsCities: string;',
  '    statsRestaurants: string;',
  '    statsAttractions: string;',
  '    statsAI: string;',
  '    featuresTitle: string;',
  '    featuresSubtitle: string;',
  '    ctaTitle: string;',
  '    ctaSubtitle: string;',
  '    citiesTitle: string;',
  '    citiesSubtitle: string;',
  '    exploreGuide: string;',
  '    viewAllCities: string;',
  '    exploreBeijing: string;',
  '    chatWithAI: string;',
  '  };'
].join(NL);
const homeNew = [
  '  home: {',
  '    heroTitle: string;',
  '    heroSubtitle: string;',
  '    heroCTA: string;',
  '    exploreCities: string;',
  '    statsCities: string;',
  '    statsRestaurants: string;',
  '    statsAttractions: string;',
  '    statsAI: string;',
  '    featuresTitle: string;',
  '    ctaTitle: string;',
  '    ctaSubtitle: string;',
  '    [key: string]: string;',
  '  };'
].join(NL);

if (!text.includes(homeOld)) { console.log('HOME OLD NOT FOUND'); process.exit(1); }
text = text.replace(homeOld, homeNew);
console.log('HOME replaced');

const citiesOld = [
  '  cities: {',
  '    title: string;',
  '    subtitle: string;',
  '    attractions: string;',
  '    restaurants: string;',
  '    transport: string;',
  '    hotels: string;',
  '    payment: string;',
  '    culturalTips: string;',
  '    emergency: string;',
  '    recommendedTime: string;',
  '    ticketPrice: string;',
  '    openingHours: string;',
  '  };'
].join(NL);
const citiesNew = [
  '  cities: {',
  '    title: string;',
  '    subtitle: string;',
  '    exploreGuide: string;',
  '    attractions: string;',
  '    restaurants: string;',
  '    transport: string;',
  '    hotels: string;',
  '    payment: string;',
  '    culturalTips: string;',
  '    emergency: string;',
  '    recommendedTime: string;',
  '    ticketPrice: string;',
  '    openingHours: string;',
  '    [key: string]: string;',
  '  };'
].join(NL);

if (!text.includes(citiesOld)) { console.log('CITIES OLD NOT FOUND'); process.exit(1); }
text = text.replace(citiesOld, citiesNew);
console.log('CITIES replaced');

fs.writeFileSync(path, text, 'utf8');
console.log('DONE');
