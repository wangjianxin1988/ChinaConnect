// Manual German translations for de residue fields (92) following fr/ru/ar conventions.
import fs from "node:fs";

const DE = {
  // beijing
  "beijing.hotels.1.address": "8, Jinyu-Hutong, Wangfujing",
  "beijing.hotels.2.address": "Fortune Plaza, 7, Dongsanhuan-Mittelstraße, Chaoyang",
  // changsha
  "changsha.hotels.10.address": "Furong-Mittelstraße, Bezirk Yuhua",
  "changsha.restaurants.14.address": "IFS Internationales Finanzzentrum",
  "changsha.restaurants.32.address": "183, Gastronomiestraße, Neustadt, Changsha",
  // chongqing
  "chongqing.hotels.2.address": "139, Zhongshan-San-Straße, Yuzhong",
  "chongqing.attractions.46.highlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.20.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.23.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.25.address": "190, Gastronomiestraße, Bezirk Neustadt, Chongqing",
  "chongqing.restaurants.25.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.26.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.27.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.28.dishHighlights.2": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.29.cuisine": "Mao Xue Wang (scharfes Ragout aus Entenblut, Spezialität aus Chongqing)",
  "chongqing.restaurants.31.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.32.cuisine": "Mao Xue Wang (scharfes Ragout aus Entenblut, Spezialität aus Chongqing)",
  "chongqing.restaurants.33.cuisine": "Mao Xue Wang (scharfes Ragout aus Entenblut, Spezialität aus Chongqing)",
  "chongqing.restaurants.34.cuisine": "Mao Xue Wang (scharfes Ragout aus Entenblut, Spezialität aus Chongqing)",
  "chongqing.restaurants.34.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.35.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.36.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.37.cuisine": "Mao Xue Wang (scharfes Ragout aus Entenblut, Spezialität aus Chongqing)",
  "chongqing.restaurants.42.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.45.dishHighlights.2": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.46.address": "42, Gastronomiestraße der Altstadt, Chongqing",
  "chongqing.restaurants.46.dishHighlights.0": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.47.address": "103, Gastronomiestraße der Neustadt, Chongqing",
  "chongqing.restaurants.48.address": "125, Gastronomiestraße der Innenstadt, Chongqing",
  "chongqing.restaurants.48.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  "chongqing.restaurants.49.address": "178, Gastronomiestraße der Altstadt, Chongqing",
  "chongqing.restaurants.49.dishHighlights.1": "Mao Xue Wang (scharfes Entenblut-Ragout)",
  // guilin
  "guilin.hotels.7.address": "1, Chengzhong-Straße, Yangshuo",
  "guilin.restaurants.32.address": "126, Gastronomiestraße, Neustadt, Guilin",
  "guilin.restaurants.37.address": "141, Gastronomiestraße, Neustadt, Guilin",
  // harbin
  "harbin.attractions.19.address": "Bezirk Xiangfang, Ortsteil oa",
  // kunming
  "kunming.hotels.4.address": "88, Frühlingsstadtstraße, Kunming",
  "kunming.hotels.5.address": "168, Peking-Straße, Kunming",
  "kunming.hotels.8.address": "388, Ostringstraße, Kunming",
  "kunming.attractions.2.address": "99, Straße des ethnischen Dorfs Yunnan, Kunming",
  // ningbo
  "ningbo.restaurants.39.address": "136, Gastronomiestraße, Neustadt, Ningbo",
  "ningbo.restaurants.42.address": "138, Gastronomiestraße, Neustadt, Ningbo",
  // qingdao
  "qingdao.restaurants.14.cuisine": "Xinbailey Internationaler Club",
  // sanya
  "sanya.hotels.1.address": "Tourismus-Resort Yalong-Bucht",
  "sanya.restaurants.32.address": "144, Gastronomiestraße, Bezirk Neustadt, Sanya",
  "sanya.restaurants.33.address": "69, Gastronomiestraße, Bezirk Neustadt, Sanya",
  "sanya.restaurants.34.address": "175, Gastronomiestraße, Bezirk Neustadt, Sanya",
  // shanghai
  "shanghai.transport.arrival.0.to": "Internationaler Flughafen Shanghai Pudong (PVG) / Flughafen Hongqiao (SHA)",
  "shanghai.hotels.0.address": "32, The Bund, 32, Zhongshan-Dongyi-Straße, Huangpu",
  "shanghai.hotels.6.address": "1218, Mittlere Ringstraße, Jing'an",
  "shanghai.hotels.7.address": "333, Chengdu-Nordstraße, Jing'an",
  "shanghai.hotels.8.address": "88, Mittlere Henan-Straße, Huangpu",
  "shanghai.hotels.9.address": "20, Nanjing-Oststraße, Huangpu",
  "shanghai.hotels.11.address": "380, Shaanxi-Nordstraße, Jing'an",
  "shanghai.hotels.12.address": "368, Jianguo-Liu-Straße, Huangpu",
  "shanghai.hotels.13.address": "Hotel Conrad, 500, Yincheng-Mittelstraße, Pudong",
  "shanghai.attractions.0.address": "Zhongshan-East-One-Straße, Bezirk Huangpu",
  "shanghai.attractions.8.highlights.1": "TRON Lightcycle Power Run (Lichtzyklus-Rennen)",
  "shanghai.attractions.38.address": "1, Shugang-Straße, Pudong (Lingang)",
  "shanghai.attractions.43.address": "600, Zhongshan-East-2-Straße, Bezirk Huangpu",
  "shanghai.restaurants.1.address": "Hotel New Hastings, 88, Nanjing-Oststraße, Huangpu",
  "shanghai.restaurants.3.address": "Einkaufszentrum ifc, 8, Century-Allee, Pudong",
  "shanghai.restaurants.10.address": "45, Tianzifang, Taikang-Straße, Huangpu",
  "shanghai.restaurants.11.address": "Bund Center, 500, Nanjing-Oststraße, Huangpu",
  "shanghai.restaurants.13.address": "169, Nanjing-Weststraße, Huangpu",
  "shanghai.restaurants.16.address": "18, Zhongshan-Dongyi-Straße, Huangpu",
  "shanghai.restaurants.17.address": "98, Huaihai-Mittelstraße, Xuhui",
  // shenzhen
  "shenzhen.hotels.6.address": "Great China Finanzzentrum, Futian",
  "shenzhen.hotels.7.address": "9028-1, Shennan-Allee, Overseas Chinese Town",
  "shenzhen.hotels.10.address": "3031, Shennan-Allee, Futian",
  "shenzhen.attractions.45.address": "Yangmeikeng, Nanao-Straße, neuer Bezirk Dapeng, Shenzhen",
  "shenzhen.restaurants.5.address": "Einkaufszentrum MixC, Kouan-Straße, Luohu",
  "shenzhen.restaurants.7.address": "COCO Park, Fuhua-Straße, Futian",
  "shenzhen.restaurants.9.address": "Einkaufszentrum MixC, Kouan-Straße, Luohu",
  "shenzhen.restaurants.26.address": "116, Gastronomiestraße, Neustadt, Shenzhen",
  "shenzhen.restaurants.27.address": "35, Gastronomiestraße, Neustadt, Shenzhen",
  "shenzhen.restaurants.34.address": "189, Gastronomiestraße, Neustadt, Shenzhen",
  // suzhou
  "suzhou.attractions.30.address": "Yuanrong Times Square, Industriepark Suzhou",
  // tianjin
  "tianjin.hotels.4.address": "11, Zweite Allee, TEDA",
  "tianjin.attractions.46.address": "Dagukou, neues Gebiet Binhai, Tianjin",
  "tianjin.restaurants.48.address": "138, Gastronomiestraße, Bezirk Neustadt, Tianjin",
  // xiamen
  "xiamen.restaurants.17.address": "Neustadt Jimei, Chengyi-Park",
  "xiamen.restaurants.35.address": "118, Gastronomiestraße, Neustadt Xiamen",
  "xiamen.restaurants.38.address": "48, Gastronomiestraße, Neustadt Xiamen",
  "xiamen.restaurants.49.address": "133, Gastronomiestraße, Bezirk Neustadt, Xiamen",
  // xian
  "xian.attractions.16.address": "Neustadt Jinghe, neues Gebiet Xixian",
  "xian.attractions.19.address": "Yanta-Südstraße, neues Gebiet Qujiang",
  // yantai
  "yantai.attractions.25.highlights.1": "Konsulat",
  "yantai.restaurants.25.address": "98, Gastronomiestraße, Bezirk Neustadt, Yantai",
  // zhangjiajie
  "zhangjiajie.hotels.6.address": "Yongding-Allee, Zhangjiajie",
  "zhangjiajie.hotels.15.address": "Yongding-Allee, Zhangjiajie",
  "zhangjiajie.restaurants.29.address": "Internationales Hotel Zhangjiajie",
};

function setPath(city, path, value) {
  const parts = path.split(".");
  let cur = city;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

let applied = 0;
for (const [key, value] of Object.entries(DE)) {
  const [cityName, field] = [key.split(".")[0], key.split(".").slice(1).join(".")];
  const file = `src/data/cities-i18n/de/${cityName}.json`;
  const city = JSON.parse(fs.readFileSync(file, "utf8"));
  setPath(city, field, value);
  fs.writeFileSync(file, JSON.stringify(city, null, 2) + "\n", "utf8");
  applied++;
}
console.log(`applied ${applied} German fixes`);
