// SEO FAQ Data for Cities
// Contains frequently asked questions optimized for SEO and AI search

import type { FAQItem } from "@/types/seo";

// ============================================================================
// General China Travel FAQs
// ============================================================================

export const GENERAL_CHINA_FAQS: FAQItem[] = [
  {
    question: "Do I need a visa to visit China?",
    questionEn: "Do I need a visa to visit China?",
    answer:
      "Most visitors to China require a visa. However, citizens of some countries can use visa-free transit for short stays (72-144 hours) in designated cities. Check with the Chinese embassy or consulate in your country for specific requirements based on your nationality.",
    answerEn:
      "Most visitors to China require a visa. However, citizens of some countries can use visa-free transit for short stays (72-144 hours) in designated cities. Check with the Chinese embassy or consulate in your country for specific requirements based on your nationality.",
  },
  {
    question: "What is the best time to visit China?",
    questionEn: "What is the best time to visit China?",
    answer:
      "The best time to visit China is during spring (April-May) and autumn (September-October) when weather is mild and comfortable. Avoid national holidays when tourist sites are extremely crowded.",
    answerEn:
      "The best time to visit China is during spring (April-May) and autumn (September-October) when weather is mild and comfortable. Avoid national holidays when tourist sites are extremely crowded.",
  },
  {
    question: "Is it safe to travel to China?",
    questionEn: "Is it safe to travel to China?",
    answer:
      "China is generally very safe for travelers. Violent crime is rare, and petty theft is less common than in many Western countries. Use normal precautions, especially in crowded tourist areas.",
    answerEn:
      "China is generally very safe for travelers. Violent crime is rare, and petty theft is less common than in many Western countries. Use normal precautions, especially in crowded tourist areas.",
  },
  {
    question: "What payment methods are accepted in China?",
    questionEn: "What payment methods are accepted in China?",
    answer:
      "Mobile payment apps Alipay and WeChat Pay are the dominant payment methods in China. Most restaurants, shops, and hotels accept these. International credit cards are less commonly accepted, especially outside major cities. Cash is still accepted but becoming less common.",
    answerEn:
      "Mobile payment apps Alipay and WeChat Pay are the dominant payment methods in China. Most restaurants, shops, and hotels accept these. International credit cards are less commonly accepted, especially outside major cities. Cash is still accepted but becoming less common.",
  },
  {
    question: "Can I use my phone data in China?",
    questionEn: "Can I use my phone data in China?",
    answer:
      "You can use international roaming with your home carrier, but it's often expensive. We recommend purchasing a local SIM card or an eSIM from China Mobile, China Unicom, or China Telecom for affordable data access.",
    answerEn:
      "You can use international roaming with your home carrier, but it's often expensive. We recommend purchasing a local SIM card or an eSIM from China Mobile, China Unicom, or China Telecom for affordable data access.",
  },
  {
    question: "Is WiFi available in China?",
    questionEn: "Is WiFi available in China?",
    answer:
      "WiFi is widely available in hotels, airports, and cafes in major cities. However, many foreign websites and apps (Google, Facebook, YouTube, etc.) are blocked in China without a VPN.",
    answerEn:
      "WiFi is widely available in hotels, airports, and cafes in major cities. However, many foreign websites and apps (Google, Facebook, YouTube, etc.) are blocked in China without a VPN.",
  },
  {
    question: "What should I know about Chinese etiquette?",
    questionEn: "What should I know about Chinese etiquette?",
    answer:
      "Key etiquette tips: (1) Remove shoes when entering homes. (2) Accept business cards with both hands. (3) Don't stick chopsticks upright in rice. (4) Tipping is not customary. (5) Blowing your nose is considered rude - spit quietly instead. (6) Bargaining is expected at markets.",
    answerEn:
      "Key etiquette tips: (1) Remove shoes when entering homes. (2) Accept business cards with both hands. (3) Don't stick chopsticks upright in rice. (4) Tipping is not customary. (5) Blowing your nose is considered rude - spit quietly instead. (6) Bargaining is expected at markets.",
  },
  {
    question: "How do I get around in Chinese cities?",
    questionEn: "How do I get around in Chinese cities?",
    answer:
      "Major Chinese cities have efficient metro systems. Taxis and ride-sharing (Didi) are affordable. High-speed trains connect cities. For short distances, bikes and e-bikes are popular. Apps like Amap (高德地图) provide navigation in Chinese.",
    answerEn:
      "Major Chinese cities have efficient metro systems. Taxis and ride-sharing (Didi) are affordable. High-speed trains connect cities. For short distances, bikes and e-bikes are popular. Apps like Amap (高德地图) provide navigation in Chinese.",
  },
];

// ============================================================================
// City-Specific FAQs
// ============================================================================

export interface CityFAQData {
  citySlug: string;
  cityName: string;
  cityNameEn: string;
  faqs: FAQItem[];
}

export const CITY_FAQ_DATA: CityFAQData[] = [
  {
    citySlug: "beijing",
    cityName: "北京",
    cityNameEn: "Beijing",
    faqs: [
      {
        question: "What are the must-visit attractions in Beijing?",
        questionEn: "What are the must-visit attractions in Beijing?",
        answer:
          "Beijing's top attractions include the Forbidden City, Temple of Heaven, Summer Palace, Great Wall (specifically Badaling or Mutianyu sections), Tiananmen Square, and the Ming Tombs. Book tickets in advance as they sell out quickly.",
        answerEn:
          "Beijing's top attractions include the Forbidden City, Temple of Heaven, Summer Palace, Great Wall (specifically Badaling or Mutianyu sections), Tiananmen Square, and the Ming Tombs. Book tickets in advance as they sell out quickly.",
      },
      {
        question: "How do I visit the Great Wall from Beijing?",
        questionEn: "How do I visit the Great Wall from Beijing?",
        answer:
          "The Great Wall is about 1-2 hours from Beijing by bus or train. Popular sections include Badaling (most touristy, accessible by bus), Mutianyu (scenic, fewer crowds), and Jinshanling (wild wall, for hikers). Book tours through your hotel or use high-speed rail to Badaling.",
        answerEn:
          "The Great Wall is about 1-2 hours from Beijing by bus or train. Popular sections include Badaling (most touristy, accessible by bus), Mutianyu (scenic, fewer crowds), and Jinshanling (wild wall, for hikers). Book tours through your hotel or use high-speed rail to Badaling.",
      },
      {
        question: "What is the best way to travel around Beijing?",
        questionEn: "What is the best way to travel around Beijing?",
        answer:
          "Beijing's metro is extensive and affordable. Taxis are cheap but traffic can be heavy. Didi (Chinese Uber) is convenient. For tourists, the Beijing Transportation Card works on metro and buses. Avoid driving as parking is difficult.",
        answerEn:
          "Beijing's metro is extensive and affordable. Taxis are cheap but traffic can be heavy. Didi (Chinese Uber) is convenient. For tourists, the Beijing Transportation Card works on metro and buses. Avoid driving as parking is difficult.",
      },
      {
        question: "Is Beijing good for food?",
        questionEn: "Is Beijing good for food?",
        answer:
          "Beijing offers excellent traditional Beijing cuisine including Peking duck, hot and sour soup, and Mongolian hot pot. Explore hole-in-the-wall restaurants and night markets for authentic local food at affordable prices.",
        answerEn:
          "Beijing offers excellent traditional Beijing cuisine including Peking duck, hot and sour soup, and Mongolian hot pot. Explore hole-in-the-wall restaurants and night markets for authentic local food at affordable prices.",
      },
    ],
  },
  {
    citySlug: "shanghai",
    cityName: "上海",
    cityNameEn: "Shanghai",
    faqs: [
      {
        question: "What are the top attractions in Shanghai?",
        questionEn: "What are the top attractions in Shanghai?",
        answer:
          "Must-see attractions include The Bund, Nanjing Road shopping district, Yu Garden, French Concession, Shanghai Tower observation deck, and the Shanghai Museum. For modern attractions, visit the Shanghai Disney Resort or Enjoy DISNEY.",
        answerEn:
          "Must-see attractions include The Bund, Nanjing Road shopping district, Yu Garden, French Concession, Shanghai Tower observation deck, and the Shanghai Museum. For modern attractions, visit the Shanghai Disney Resort or Enjoy DISNEY.",
      },
      {
        question: "What is the best time to visit Shanghai?",
        questionEn: "What is the best time to visit Shanghai?",
        answer:
          "The best time to visit Shanghai is during spring (March-May) and autumn (September-November) when weather is pleasant. Summers are hot and humid, while winters are cold but rarely snowy. Avoid Chinese National Day (October 1-7) for fewer crowds.",
        answerEn:
          "The best time to visit Shanghai is during spring (March-May) and autumn (September-November) when weather is pleasant. Summers are hot and humid, while winters are cold but rarely snowy. Avoid Chinese National Day (October 1-7) for fewer crowds.",
      },
      {
        question: "How do I get from Shanghai Pudong Airport to the city center?",
        questionEn: "How do I get from Shanghai Pudong Airport to the city center?",
        answer:
          "From Pudong Airport, you can take Metro Line 2 to the city center (about 90 minutes, 8 yuan). Maglev train reaches 431 km/h and takes you to Longyang Road metro station in 8 minutes (50 yuan). Taxis and Didi are also available (about 150-200 yuan).",
        answerEn:
          "From Pudong Airport, you can take Metro Line 2 to the city center (about 90 minutes, 8 yuan). Maglev train reaches 431 km/h and takes you to Longyang Road metro station in 8 minutes (50 yuan). Taxis and Didi are also available (about 150-200 yuan).",
      },
      {
        question: "Is Shanghai expensive for travelers?",
        questionEn: "Is Shanghai expensive for travelers?",
        answer:
          "Shanghai can be expensive for luxury experiences but budget travelers can manage. Street food costs 20-50 yuan per meal, while mid-range restaurants are 100-300 yuan. Museums are mostly free. Hotels range from 200 yuan (budget) to 2000+ yuan (luxury).",
        answerEn:
          "Shanghai can be expensive for luxury experiences but budget travelers can manage. Street food costs 20-50 yuan per meal, while mid-range restaurants are 100-300 yuan. Museums are mostly free. Hotels range from 200 yuan (budget) to 2000+ yuan (luxury).",
      },
    ],
  },
  {
    citySlug: "chengdu",
    cityName: "成都",
    cityNameEn: "Chengdu",
    faqs: [
      {
        question: "Where can I see pandas in Chengdu?",
        questionEn: "Where can I see pandas in Chengdu?",
        answer:
          "The Chengdu Research Base of Giant Panda Breeding is the best place to see pandas outside of captivity. It's located about 10km from the city center and is open 7am-6pm. Book tickets online in advance, especially for weekends.",
        answerEn:
          "The Chengdu Research Base of Giant Panda Breeding is the best place to see pandas outside of captivity. It's located about 10km from the city center and is open 7am-6pm. Book tickets online in advance, especially for weekends.",
      },
      {
        question: "What is Chengdu known for?",
        questionEn: "What is Chengdu known for?",
        answer:
          "Chengdu is famous for giant pandas, spicy Sichuan cuisine, laid-back teahouse culture, giant Buddha statues at Leshan, and being the gateway to Jiuzhaigou Valley. It's also known for its relaxed lifestyle and beautiful women.",
        answerEn:
          "Chengdu is famous for giant pandas, spicy Sichuan cuisine, laid-back teahouse culture, giant Buddha statues at Leshan, and being the gateway to Jiuzhaigou Valley. It's also known for its relaxed lifestyle and beautiful women.",
      },
      {
        question: "How spicy is Sichuan food?",
        questionEn: "How spicy is Sichuan food?",
        answer:
          "Sichuan cuisine is known for its bold, spicy flavors using Sichuan peppercorns and chili beans. Dishes like mapo tofu, hot pot, and dan dan noodles can be very spicy. If you can't handle heat, ask for 'bu yao la' (not spicy) when ordering.",
        answerEn:
          "Sichuan cuisine is known for its bold, spicy flavors using Sichuan peppercorns and chili beans. Dishes like mapo tofu, hot pot, and dan dan noodles can be very spicy. If you can't handle heat, ask for 'bu yao la' (not spicy) when ordering.",
      },
    ],
  },
  {
    citySlug: "xian",
    cityName: "西安",
    cityNameEn: "Xi'an",
    faqs: [
      {
        question: "How do I visit the Terracotta Warriors?",
        questionEn: "How do I visit the Terracotta Warriors?",
        answer:
          "The Terracotta Warriors are located about 40km from Xi'an city center. Take bus 306 or 307 from Xi'an Railway Station (5 yuan, 1 hour). Tours are also available. The site is open 8:30am-6pm (summer) or 8:30am-5pm (winter). Buy tickets (150 yuan) at the entrance.",
        answerEn:
          "The Terracotta Warriors are located about 40km from Xi'an city center. Take bus 306 or 307 from Xi'an Railway Station (5 yuan, 1 hour). Tours are also available. The site is open 8:30am-6pm (summer) or 8:30am-5pm (winter). Buy tickets (150 yuan) at the entrance.",
      },
      {
        question: "What else can I see in Xi'an besides the Terracotta Warriors?",
        questionEn: "What else can I see in Xi'an besides the Terracotta Warriors?",
        answer:
          "Other attractions include the Ancient City Wall (bike rental available), Big Wild Goose Pagoda, Small Wild Goose Pagoda, Muslim Quarter (great for street food), Shaanxi History Museum, and the Great Mosque.",
        answerEn:
          "Other attractions include the Ancient City Wall (bike rental available), Big Wild Goose Pagoda, Small Wild Goose Pagoda, Muslim Quarter (great for street food), Shaanxi History Museum, and the Great Mosque.",
      },
      {
        question: "Is Xi'an's Muslim Quarter worth visiting?",
        questionEn: "Is Xi'an's Muslim Quarter worth visiting?",
        answer:
          "Yes! The Muslim Quarter is a vibrant night market with incredible street food including roujiamo (Chinese burger), yang rou chuan (lamb skewers), and various noodle dishes. It's also a great place to buy souvenirs and experience local culture.",
        answerEn:
          "Yes! The Muslim Quarter is a vibrant night market with incredible street food including roujiamo (Chinese burger), yang rou chuan (lamb skewers), and various noodle dishes. It's also a great place to buy souvenirs and experience local culture.",
      },
    ],
  },
  {
    citySlug: "hangzhou",
    cityName: "杭州",
    cityNameEn: "Hangzhou",
    faqs: [
      {
        question: "What is Hangzhou famous for?",
        questionEn: "What is Hangzhou famous for?",
        answer:
          "Hangzhou is famous for West Lake (Xihu), Longjing tea, the Grand Canal, and being the headquarters of Alibaba. It's considered one of China's most beautiful cities with a relaxed, romantic atmosphere.",
        answerEn:
          "Hangzhou is famous for West Lake (Xihu), Longjing tea, the Grand Canal, and being the headquarters of Alibaba. It's considered one of China's most beautiful cities with a relaxed, romantic atmosphere.",
      },
      {
        question: "How much time do I need for West Lake?",
        questionEn: "How much time do I need for West Lake?",
        answer:
          "You can see West Lake's main highlights in half a day, but 1-2 days is ideal to fully explore. Must-sees include the Broken Island, Leifeng Pagoda, Lingyin Temple, and the scenic bike path around the lake.",
        answerEn:
          "You can see West Lake's main highlights in half a day, but 1-2 days is ideal to fully explore. Must-sees include the Broken Island, Leifeng Pagoda, Lingyin Temple, and the scenic bike path around the lake.",
      },
    ],
  },
  {
    citySlug: "guangzhou",
    cityName: "广州",
    cityNameEn: "Guangzhou",
    faqs: [
      {
        question: "What is Cantonese food known for?",
        questionEn: "What is Cantonese food known for?",
        answer:
          "Cantonese (Guangdong) cuisine is known for its delicate flavors, fresh ingredients, and dim sum. Signature dishes include dim sum, white-cut chicken, char siu (barbecued pork), fresh seafood, and congee. Guangzhou is considered the food capital of China.",
        answerEn:
          "Cantonese (Guangdong) cuisine is known for its delicate flavors, fresh ingredients, and dim sum. Signature dishes include dim sum, white-cut chicken, char siu (barbecued pork), fresh seafood, and congee. Guangzhou is considered the food capital of China.",
      },
      {
        question: "What are the top attractions in Guangzhou?",
        questionEn: "What are the top attractions in Guangzhou?",
        answer:
          "Top attractions include the Canton Tower (China's tallest TV tower), Chen Clan Ancestral Hall, Shamian Island, the modern Guangzhou Opera House, and the massive Southern China Botanical Garden. For shopping, visit Beijing Road or Shangxiajiu Pedestrian Street.",
        answerEn:
          "Top attractions include the Canton Tower (China's tallest TV tower), Chen Clan Ancestral Hall, Shamian Island, the modern Guangzhou Opera House, and the massive Southern China Botanical Garden. For shopping, visit Beijing Road or Shangxiajiu Pedestrian Street.",
      },
    ],
  },
];

// ============================================================================
// Payment FAQs
// ============================================================================

export const PAYMENT_FAQS: FAQItem[] = [
  {
    question: "Can I use my credit card in China?",
    questionEn: "Can I use my credit card in China?",
    answer:
      "International credit cards (Visa, Mastercard, Amex) are accepted at major hotels, upscale restaurants, and large shopping malls. However, many smaller establishments, local restaurants, and street markets only accept Alipay or WeChat Pay. Always carry some cash as backup.",
    answerEn:
      "International credit cards (Visa, Mastercard, Amex) are accepted at major hotels, upscale restaurants, and large shopping malls. However, many smaller establishments, local restaurants, and street markets only accept Alipay or WeChat Pay. Always carry some cash as backup.",
  },
  {
    question: "How do I set up Alipay as a foreigner?",
    questionEn: "How do I set up Alipay as a foreigner?",
    answer:
      "Download Alipay and sign up with your phone number. Go to 'Me' > 'Bank Cards' to add your international card. For full functionality (including QR payments), you need to complete identity verification with your passport. You can add money through your linked card.",
    answerEn:
      "Download Alipay and sign up with your phone number. Go to 'Me' > 'Bank Cards' to add your international card. For full functionality (including QR payments), you need to complete identity verification with your passport. You can add money through your linked card.",
  },
  {
    question: "Do I need a Chinese bank account for mobile payments?",
    questionEn: "Do I need a Chinese bank account for mobile payments?",
    answer:
      "Not necessarily. Apps like Alipay and WeChat Pay now allow foreign credit/debit cards to be linked for payments without a Chinese bank account. However, having a Chinese bank account provides better functionality and higher payment limits.",
    answerEn:
      "Not necessarily. Apps like Alipay and WeChat Pay now allow foreign credit/debit cards to be linked for payments without a Chinese bank account. However, having a Chinese bank account provides better functionality and higher payment limits.",
  },
  {
    question: "Is it safe to use mobile payments in China?",
    questionEn: "Is it safe to use mobile payments in China?",
    answer:
      "Mobile payments in China are very secure when you take basic precautions: use strong passwords, enable biometric authentication, don't share verification codes, and keep your phone secure. Alipay and WeChat Pay both have strong buyer protection policies.",
    answerEn:
      "Mobile payments in China are very secure when you take basic precautions: use strong passwords, enable biometric authentication, don't share verification codes, and keep your phone secure. Alipay and WeChat Pay both have strong buyer protection policies.",
  },
];

// ============================================================================
// Transport FAQs
// ============================================================================

export const TRANSPORT_FAQS: FAQItem[] = [
  {
    question: "How do I buy train tickets in China?",
    questionEn: "How do I buy train tickets in China?",
    answer:
      "You can buy train tickets through the 12306 website/app (in Chinese), at station ticket counters, or from authorized travel agencies. For high-speed trains, book 1-2 weeks in advance for popular routes. You'll need your passport for booking and boarding.",
    answerEn:
      "You can buy train tickets through the 12306 website/app (in Chinese), at station ticket counters, or from authorized travel agencies. For high-speed trains, book 1-2 weeks in advance for popular routes. You'll need your passport for booking and boarding.",
  },
  {
    question: "Should I take high-speed rail or fly between Chinese cities?",
    questionEn: "Should I take high-speed rail or fly between Chinese cities?",
    answer:
      "For distances under 1000km, high-speed rail is often faster (door-to-door) and more comfortable. Trains have no luggage restrictions, arrive in city centers, and feature WiFi on most routes. Flying is better for distances over 1500km or when time is critical.",
    answerEn:
      "For distances under 1000km, high-speed rail is often faster (door-to-door) and more comfortable. Trains have no luggage restrictions, arrive in city centers, and feature WiFi on most routes. Flying is better for distances over 1500km or when time is critical.",
  },
  {
    question: "How do I use the metro in Chinese cities?",
    questionEn: "How do I use the metro in Chinese cities?",
    answer:
      "Metro systems are efficient and affordable. Buy single-journey tokens at stations or use transportation cards (like Suakcard in Shanghai or Yikatong in Beijing). Metro apps with English options are available in major cities. Look for signs in pinyin alongside Chinese characters.",
    answerEn:
      "Metro systems are efficient and affordable. Buy single-journey tokens at stations or use transportation cards (like Suakcard in Shanghai or Yikatong in Beijing). Metro apps with English options are available in major cities. Look for signs in pinyin alongside Chinese characters.",
  },
  {
    question: "Is Didi safe to use in China?",
    questionEn: "Is Didi safe to use in China?",
    answer:
      "Yes, Didi (China's ride-hailing giant) is generally safe and much more reliable than taxis. The app has English support and allows cash payments. You can track your ride in real-time and share your trip with contacts. Always verify the license plate matches before entering.",
    answerEn:
      "Yes, Didi (China's ride-hailing giant) is generally safe and much more reliable than taxis. The app has English support and allows cash payments. You can track your ride in real-time and share your trip with contacts. Always verify the license plate matches before entering.",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get FAQs for a specific city
 */
export function getCityFAQs(citySlug: string): FAQItem[] {
  const cityData = CITY_FAQ_DATA.find((c) => c.citySlug === citySlug);
  return cityData?.faqs || [];
}

/**
 * Get all city slugs
 */
export function getAllCitySlugs(): string[] {
  return CITY_FAQ_DATA.map((c) => c.citySlug);
}

/**
 * Get FAQ data for a city
 */
export function getCityFAQData(citySlug: string): CityFAQData | undefined {
  return CITY_FAQ_DATA.find((c) => c.citySlug === citySlug);
}

/**
 * Combine city-specific FAQs with general FAQs
 */
export function getCombinedCityFAQs(citySlug: string): FAQItem[] {
  const cityFAQs = getCityFAQs(citySlug);
  return [...cityFAQs, ...GENERAL_CHINA_FAQS];
}

/**
 * Generate FAQ schema for a city
 */
export function generateCityFAQSchema(citySlug: string) {
  const cityData = getCityFAQData(citySlug);
  if (!cityData) return null;

  const faqs = getCombinedCityFAQs(citySlug);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `${cityData.cityNameEn} Travel FAQ`,
    description: `Frequently asked questions about traveling to ${cityData.cityNameEn}, ${cityData.cityName}`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.questionEn || faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answerEn || faq.answer,
      },
    })),
  };
}
