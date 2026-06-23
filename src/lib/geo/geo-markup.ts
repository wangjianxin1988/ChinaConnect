// @ts-nocheck
// GEO (Generative Engine Optimization) Markup Generators
// Generates structured data optimized for AI search engines and assistants

import { generateHowToSchema, generateQASchema, generateRecipeSchema } from "@/lib/seo/schema-org";
import type { FAQItem } from "@/types/seo";

const SITE_URL = "https://chinaconnect.xyz";
const SITE_NAME = "ChinaConnect";

// ============================================================================
// HowTo Schemas (for Step-by-Step Guides)
// ============================================================================

export interface HowToGuide {
  title: string;
  description: string;
  imageUrl?: string;
  totalTime?: string;
  tools?: string[];
  steps: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    tip?: string;
  }>;
}

/**
 * Generate HowTo schema for a guide (e.g., "How to get from airport to city center")
 */
export function generateAirportTransferHowTo(city: string, steps: HowToGuide["steps"]) {
  return generateHowToSchema({
    name: `How to get from ${city} Airport to City Center`,
    description: `Step-by-step guide for traveling from ${city} airport to the city center, including public transport, taxi, and private transfer options.`,
    imageUrl: `${SITE_URL}/og-image.png`,
    totalTime: "PT30M",
    steps: steps.map((step) => ({
      name: step.title,
      text: step.description,
      imageUrl: step.imageUrl,
    })),
  });
}

/**
 * Generate HowTo schema for visa application
 */
export function generateVisaApplicationHowTo(country: string, visaType: string) {
  return generateHowToSchema({
    name: `How to Apply for a ${visaType} Visa for ${country}`,
    description: `Complete step-by-step guide for applying for a ${visaType} visa to enter ${country}.`,
    totalTime: "PT2H",
    steps: [
      {
        name: "Check visa requirements",
        text: "Determine if you need a visa based on your nationality and the type of visa you need.",
      },
      {
        name: "Gather required documents",
        text: "Prepare your passport, application form, photos, and supporting documents.",
      },
      {
        name: "Submit application",
        text: "Submit your visa application at the embassy, consulate, or through the online portal.",
      },
      {
        name: "Pay visa fees",
        text: "Pay the applicable visa fees as required.",
      },
      {
        name: "Attend interview (if required)",
        text: "Some visa categories require an in-person interview at the embassy.",
      },
      {
        name: "Wait for processing",
        text: "Allow sufficient time for visa processing, which can take 5-15 business days.",
      },
      {
        name: "Receive your visa",
        text: "Collect your passport with the visa stamp or receive it by mail.",
      },
    ],
  });
}

/**
 * Generate HowTo schema for payment setup
 */
export function generatePaymentSetupHowTo(method: "Alipay" | "WeChat Pay") {
  const steps =
    method === "Alipay"
      ? [
          {
            name: "Download Alipay app",
            text: "Download the Alipay app from App Store or Google Play.",
          },
          { name: "Register with phone number", text: "Sign up using your Chinese phone number." },
          {
            name: "Complete identity verification",
            text: "Upload your passport and complete face verification.",
          },
          { name: "Link bank card", text: "Add your international credit or debit card." },
          {
            name: "Add funds",
            text: "Transfer money to your Alipay account or link a card for direct payments.",
          },
          { name: "Start using", text: "Scan QR codes to pay at restaurants, shops, and hotels." },
        ]
      : [
          { name: "Download WeChat", text: "Download WeChat from App Store or Google Play." },
          { name: "Register account", text: "Sign up with your phone number." },
          { name: "Upgrade to WeChat Pay", text: "Go to Me > Pay > Upgrade to WeChat Pay." },
          {
            name: "Complete identity verification",
            text: "Add your passport and perform face verification.",
          },
          {
            name: "Link payment method",
            text: "Add an international card or link a Chinese bank account.",
          },
          { name: "Start using", text: "Use WeChat Pay to scan QR codes or make in-app payments." },
        ];

  return generateHowToSchema({
    name: `How to Set Up and Use ${method}`,
    description: `Complete guide to setting up ${method} on your smartphone for payments in China.`,
    totalTime: "PT15M",
    steps: steps.map((step) => ({
      name: step.name,
      text: step.text,
    })),
  });
}

// ============================================================================
// Recipe Schemas (for Food Content)
// ============================================================================

export interface Recipe {
  name: string;
  description: string;
  imageUrl?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  ingredients?: string[];
  instructions?: string[];
  cuisine?: string;
  author?: string;
}

/**
 * Generate Recipe schema for a Chinese dish
 */
export function generateDishRecipe(recipe: Recipe) {
  return generateRecipeSchema({
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime || "PT15M",
    cookTime: recipe.cookTime || "PT30M",
    totalTime: "PT45M",
    servings: recipe.servings || "4 servings",
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    author: recipe.author || SITE_NAME,
  });
}

/**
 * Generate Recipe schema for a specific famous Chinese dish
 */
export function generateFamousDishRecipe(
  dishName: string,
  cityName: string,
  ingredients: string[],
  instructions: string[],
) {
  return generateDishRecipe({
    name: dishName,
    description: `Authentic ${dishName} recipe from ${cityName}. Learn to cook this traditional Chinese dish at home.`,
    prepTime: "PT20M",
    cookTime: "PT40M",
    servings: "4 servings",
    ingredients,
    instructions,
    cuisine: "Chinese",
  });
}

// ============================================================================
// Q&A Schemas (for FAQ Content)
// ============================================================================

export interface QAPair {
  question: string;
  answer: string;
}

/**
 * Generate QA schema for general questions
 */
export function generateGeneralQA(qas: QAPair[]) {
  return generateQASchema(qas, `${SITE_NAME} - Frequently Asked Questions`);
}

/**
 * Generate city-specific FAQ schema
 */
export function generateCityFAQ(cityName: string, faqs: FAQItem[]) {
  const qas: QAPair[] = faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `${cityName} Travel FAQ`,
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      },
    })),
  };
}

/**
 * Generate payment FAQ schema
 */
export function generatePaymentFAQ(faqs: FAQItem[]) {
  return generateCityFAQ("Payment in China", faqs);
}

/**
 * Generate transport FAQ schema
 */
export function generateTransportFAQ(faqs: FAQItem[]) {
  return generateCityFAQ("Transportation in China", faqs);
}

// ============================================================================
// GEO-Enhanced Content Schemas
// ============================================================================

/**
 * Generate TravelAction schema for city visits
 */
export function generateTravelActionSchema(cityName: string, country = "China") {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    name: `Visit ${cityName}`,
    description: `Travel and explore ${cityName}, ${country}`,
    agent: {
      "@type": "Audience",
      name: "International travelers",
    },
    location: {
      "@type": "City",
      name: cityName,
      address: {
        "@type": "PostalAddress",
        addressCountry: country,
      },
    },
  };
}

/**
 * Generate TouristInformationCenter schema
 */
export function generateTouristInfoSchema(cityName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    name: `${cityName} Tourist Information`,
    description: `Official tourist information center for ${cityName}, ${country}`,
    url: `${SITE_URL}/city/${cityName.toLowerCase().replace(/\s+/g, "-")}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "CN",
    },
    telephone: "+86-10-1234-5678",
    openingHours: "Mo-Su 08:00-20:00",
  };
}

/**
 * Generate lodging business schema for hotels
 */
export function generateHotelSchema(options: {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  priceRange: string;
  rating?: number;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: options.name,
    description: options.description || `Stay at ${options.name} in ${options.city}`,
    image: `${SITE_URL}/og-image.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: options.address,
      addressLocality: options.city,
      addressCountry: "CN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: options.lat,
      longitude: options.lng,
    },
    priceRange: options.priceRange,
    aggregateRating: options.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: options.rating.toString(),
          bestRating: "5",
        }
      : undefined,
  };
}

// ============================================================================
// GEO-Enhanced Article Schemas
// ============================================================================

/**
 * Generate Article schema for blog posts/guides
 */
export function generateArticleSchema(options: {
  title: string;
  description: string;
  author?: string;
  publishedDate: string;
  modifiedDate?: string;
  imageUrl?: string;
  section?: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    name: options.title,
    description: options.description,
    author: options.author
      ? {
          "@type": "Person",
          name: options.author,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
        },
    datePublished: options.publishedDate,
    dateModified: options.modifiedDate || options.publishedDate,
    image: options.imageUrl || `${SITE_URL}/og-image.png`,
    articleSection: options.section,
    keywords: options.tags?.join(", "),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate AboutPage schema
 */
export function generateAboutSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME} - Your AI-powered guide to exploring China`,
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description: `${SITE_NAME} helps travelers discover the best of China through AI-powered recommendations.`,
      foundingDate: "2024",
      areaServed: {
        "@type": "Country",
        name: "China",
      },
    },
  };
}

// ============================================================================
// GEO Special Purpose Schemas
// ============================================================================

/**
 * Generate AskAction schema for Q&A content
 */
export function generateAskActionSchema(question: string, answer: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AskAction",
    name: question,
    description: question,
    resultComment: {
      "@type": "Answer",
      text: answer,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

/**
 * Generate Guide schema for travel guides
 */
export function generateGuideSchema(options: {
  title: string;
  description: string;
  location: string;
  stepCount?: number;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Guide",
    name: options.title,
    description: options.description,
    about: {
      "@type": "Place",
      name: options.location,
    },
    numberOfSteps: options.stepCount || 5,
    image: options.imageUrl || `${SITE_URL}/og-image.png`,
  };
}

/**
 * Generate reservation schema for restaurant bookings
 */
export function generateReservationSchema(options: {
  restaurantName: string;
  restaurantUrl: string;
  priceRange: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishmentReservation",
    name: `Book a table at ${options.restaurantName}`,
    description: `Make a reservation at ${options.restaurantName}`,
    url: options.restaurantUrl,
    priceRange: options.priceRange,
    reservationStatus: "https://schema.org/ReservationStatus",
    reservationAction: {
      "@type": "ReserveAction",
      name: "Book table",
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate all GEO schemas for a city page
 */
export function generateCityGEOSchemas(
  cityName: string,
  faqs: FAQItem[],
  popularQuestions: QAPair[],
) {
  return [
    generateCityFAQ(cityName, faqs),
    generateTravelActionSchema(cityName),
    generateGeneralQA(popularQuestions),
  ];
}

/**
 * Generate all GEO schemas for a restaurant page
 */
export function generateRestaurantGEOSchemas(
  _restaurantName: string,
  _cityName: string,
  dishRecipes?: Recipe[],
) {
  const schemas = [];

  // Add recipe schemas for famous dishes
  if (dishRecipes) {
    for (const recipe of dishRecipes) {
      schemas.push(generateDishRecipe(recipe));
    }
  }

  return schemas;
}

// Country constant
const country = "China";
