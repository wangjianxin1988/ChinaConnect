import fs from "node:fs";

// 1. WeatherWidget: add missing JA_DESC entries
const p1 = "src/components/city/WeatherWidget.tsx";
let s1 = fs.readFileSync(p1, "utf8");
const oldMap = '    "drizzle": "霧雨",\n  };';
const newMap = '    "drizzle": "霧雨",\n    "light drizzle": "霧雨",\n    "moderate drizzle": "霧雨",\n    "dense drizzle": "霧雨",\n    "light intensity drizzle": "弱い霧雨",\n    "shower drizzle": "霧雨",\n  };';
if (s1.includes(oldMap)) { s1 = s1.split(oldMap).join(newMap); console.log("JA_DESC patched"); }
else console.error("NOT FOUND: JA_DESC anchor");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);

// 2. city page: add weatherI18n const + pass lang/i18n to WeatherWidget
const p2 = "src/pages/[lang]/city/[slug].astro";
let s2 = fs.readFileSync(p2, "utf8");

const anchor = 'const isJapanese = lang === "ja";\nconst langPrefix = lang === "en" ? "" : `/${lang}`;';
const addition = anchor + `
const weatherI18n = {
  cityPage: {
    weatherHumidity: translations[lang]?.cityPage?.weatherHumidity,
    weatherWind: translations[lang]?.cityPage?.weatherWind,
    weatherFeels: translations[lang]?.cityPage?.weatherFeels,
    weatherForecast: translations[lang]?.cityPage?.weatherForecast,
    weatherDemo: translations[lang]?.cityPage?.weatherDemo,
    weatherNA: translations[lang]?.cityPage?.weatherNA,
    weatherNotAvailable: translations[lang]?.cityPage?.weatherNotAvailable,
  },
  weather: {
    toggleUnit: lang === "ja" ? "温度単位を切り替え" : "Toggle temperature unit",
    toggleUnitCelsius: "°C",
    toggleUnitFahrenheit: "°F",
    rainProbability: lang === "ja" ? "降水確率" : "rain",
  },
};`;
if (s2.includes(anchor)) { s2 = s2.split(anchor).join(addition); console.log("weatherI18n added"); }
else console.error("NOT FOUND: langPrefix anchor");

const oldW = `<WeatherWidget
            city={city.nameEn}
            lat={city.coordinates.lat}
            lng={city.coordinates.lng}
            client:only="react"
          />`;
const newW = `<WeatherWidget
            city={city.nameEn}
            lat={city.coordinates.lat}
            lng={city.coordinates.lng}
            lang={lang}
            i18n={weatherI18n}
            client:only="react"
          />`;
if (s2.includes(oldW)) { s2 = s2.split(oldW).join(newW); console.log("WeatherWidget props added"); }
else console.error("NOT FOUND: WeatherWidget usage");
fs.writeFileSync(p2 + ".tmp", s2);
fs.renameSync(p2 + ".tmp", p2);
