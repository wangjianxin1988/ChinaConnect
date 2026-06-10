// Schema.org JSON-LD generators for structured data
// Supports LocalBusiness, FAQPage, BreadcrumbList, HowTo, Recipe, and more

import type { CityInfo, EventSEOData, FAQItem, RestaurantSEOData } from "@/types/seo";

const SITE_URL = "https://chinaconnect.xyz";
const SITE_NAME = "ChinaConnect";
const SITE_DESCRIPTION =
  "Connect with China's finest culinary experiences - Michelin stars, Black Pearl restaurants, and local favorites.";

// ============================================================================
// LocalBusiness Schema
// ============================================================================

export interface LocalBusinessSchemaOptions {
  city: CityInfo;
  description?: string;
  imageUrl?: string;
}

export function generateLocalBusinessSchema(options: LocalBusinessSchemaOptions) {
  const { city, description, imageUrl } = options;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/city/${city.slug}#business`,
    name: `${SITE_NAME} - ${city.name}`,
    description:
      description ||
      `${SITE_NAME} helps you discover the best restaurants in ${city.name}, China. Find Michelin-starred restaurants, Black Pearl establishments, and local favorites.`,
    url: `${SITE_URL}/city/${city.slug}`,
    image: {
      "@type": "ImageObject",
      url: imageUrl || `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressCountry: city.countryCode,
    },
    areaServed: {
      "@type": "City",
      name: city.name,
    },
    sameAs: [
      "https://twitter.com/chinaconnect",
      "https://instagram.com/chinaconnect",
      "https://facebook.com/chinaconnect",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@chinaconnect.com",
      availableLanguage: ["English", "Chinese", "Japanese", "Korean"],
    },
    priceRange: "$$-$$$$",
    servesCuisine: ["Chinese", "International"],
  };
}

// ============================================================================
// Restaurant Schema
// ============================================================================

export function generateRestaurantSchema(restaurant: RestaurantSEOData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/food/${restaurant.id}#restaurant`,
    name: restaurant.name,
    image: restaurant.imageUrl || `${SITE_URL}/og-image.png`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.lat,
      longitude: restaurant.lng,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressRegion: restaurant.district,
      addressCountry: "CN",
    },
    servesCuisine: restaurant.cuisine,
    priceRange: getPriceRange(restaurant.avgPrice),
    telephone: restaurant.phone,
    url: `${SITE_URL}/food/${restaurant.id}`,
  };

  if (restaurant.openingHours?.length) {
    schema.openingHoursSpecification = restaurant.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "22:00",
      description: hours,
    }));
  }

  // Michelin star indicator
  if (restaurant.type === "michelin" && restaurant.star) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: getRatingFromStars(restaurant.star),
      bestRating: 3,
      worstRating: 1,
      description: `${restaurant.star} Michelin Star${restaurant.star > 1 ? "s" : ""}`,
    };
    schema.starRating = {
      "@type": "Rating",
      ratingValue: restaurant.star.toString(),
      bestRating: "3",
    };
  }

  // Black Pearl indicator
  if (restaurant.type === "blackpearl" && restaurant.diamond) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: getRatingFromDiamonds(restaurant.diamond),
      bestRating: 3,
      worstRating: 1,
      description: `${restaurant.diamond} Black Pearl Diamond${restaurant.diamond > 1 ? "s" : ""}`,
    };
  }

  return schema;
}

// ============================================================================
// TouristAttraction Schema
// ============================================================================

export function generateTouristAttractionSchema(restaurant: RestaurantSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `${SITE_URL}/food/${restaurant.id}#attraction`,
    name: restaurant.name,
    description: restaurant.description || `Discover ${restaurant.name} in ${restaurant.city}`,
    image: restaurant.imageUrl || `${SITE_URL}/og-image.png`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.lat,
      longitude: restaurant.lng,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "CN",
    },
    url: `${SITE_URL}/food/${restaurant.id}`,
  };
}

// ============================================================================
// FAQPage Schema
// ============================================================================

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ============================================================================
// BreadcrumbList Schema
// ============================================================================

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// HowTo Schema (GEO Optimization for AI Search)
// ============================================================================

export interface HowToStep {
  name: string;
  text: string;
  imageUrl?: string;
}

export interface HowToSchemaOptions {
  name: string;
  description: string;
  imageUrl?: string;
  steps: HowToStep[];
  totalTime?: string;
}

export function generateHowToSchema(options: HowToSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: options.name,
    description: options.description,
    image: options.imageUrl
      ? {
          "@type": "ImageObject",
          url: options.imageUrl,
          width: 1200,
          height: 630,
        }
      : undefined,
    totalTime: options.totalTime || "PT30M",
    step: options.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.imageUrl
        ? {
            "@type": "ImageObject",
            url: step.imageUrl,
          }
        : undefined,
    })),
  };
}

// ============================================================================
// Recipe Schema (GEO Optimization for AI Search)
// ============================================================================

export interface RecipeSchemaOptions {
  name: string;
  description: string;
  imageUrl?: string;
  author?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  ingredients?: string[];
  instructions?: string[];
}

export function generateRecipeSchema(options: RecipeSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: options.name,
    description: options.description,
    image: options.imageUrl || `${SITE_URL}/og-image.png`,
    author: options.author
      ? {
          "@type": "Person",
          name: options.author,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
        },
    prepTime: options.prepTime || "PT15M",
    cookTime: options.cookTime || "PT30M",
    totalTime: options.totalTime || "PT45M",
    recipeYield: options.servings || "4 servings",
    recipeIngredient: options.ingredients || [],
    recipeInstructions: (options.instructions || []).map((instruction, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: instruction,
    })),
    nutrition: undefined,
    aggregateRating: undefined,
  };
}

// ============================================================================
// Event Schema
// ============================================================================

export function generateEventSchema(event: EventSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description || "A food event in China",
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      geo: {
        "@type": "GeoCoordinates",
        latitude: event.lat,
        longitude: event.lng,
      },
    },
    image: event.imageUrl || `${SITE_URL}/og-image.png`,
    organizer: event.organizer
      ? {
          "@type": "Organization",
          name: event.organizer,
        }
      : undefined,
    url: `${SITE_URL}/events/${event.id}`,
  };
}

// ============================================================================
// WebSite Schema with SearchAction
// ============================================================================

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ["en", "zh-CN", "ja", "ko"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ============================================================================
// Organization Schema
// ============================================================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    description: SITE_DESCRIPTION,
    sameAs: [
      "https://twitter.com/chinaconnect",
      "https://instagram.com/chinaconnect",
      "https://facebook.com/chinaconnect",
      "https://youtube.com/chinaconnect",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@chinaconnect.com",
      availableLanguage: [
        "English",
        "Chinese",
        "Japanese",
        "Korean",
        "Thai",
        "Vietnamese",
        "Russian",
        "French",
        "German",
        "Arabic",
        "Persian",
      ],
    },
  };
}

// ============================================================================
// Video Schema (for rich media SEO)
// ============================================================================

export interface VideoSchemaOptions {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  embedUrl?: string;
}

export function generateVideoSchema(options: VideoSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Video",
    name: options.name,
    description: options.description,
    thumbnailUrl: options.thumbnailUrl,
    uploadDate: options.uploadDate,
    duration: options.duration || "PT5M",
    embedUrl: options.embedUrl,
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

// ============================================================================
// SoftwareApplication Schema (for AI tools)
// ============================================================================

export function generateSoftwareSchema(appName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appName,
    description: description,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

// ============================================================================
// QAPage Schema (for AI Q&A content)
// ============================================================================

export interface QAPair {
  question: string;
  answer: string;
}

export function generateQASchema(qas: QAPair[], _pageTitle: string) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
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

// ============================================================================
// CollectionPage Schema (for city/food listings)
// ============================================================================

export interface CollectionPageSchemaOptions {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  numberOfItems?: number;
}

export function generateCollectionPageSchema(options: CollectionPageSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: options.url,
    image: options.imageUrl || `${SITE_URL}/og-image.png`,
    numberOfItems: options.numberOfItems,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: options.numberOfItems,
    },
  };
}

// ============================================================================
// AboutPage Schema
// ============================================================================

export function generateAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME} - Your AI-powered guide to exploring China. Discover the best restaurants, attractions, and travel tips.`,
    url: `${SITE_URL}/about`,
    mainEntity: generateOrganizationSchema(),
  };
}

// ============================================================================
// ContactPage Schema
// ============================================================================

export function generateContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE_NAME}`,
    description: `Get in touch with ${SITE_NAME}. We're here to help with your China travel questions.`,
    url: `${SITE_URL}/contact`,
    mainEntity: generateOrganizationSchema(),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPriceRange(avgPrice: number): string {
  if (avgPrice < 100) return "$";
  if (avgPrice < 300) return "$$";
  if (avgPrice < 500) return "$$$";
  return "$$$$";
}

function getRatingFromStars(stars: 1 | 2 | 3): number {
  return stars === 3 ? 3 : stars === 2 ? 2 : 1;
}

function getRatingFromDiamonds(diamonds: 1 | 2 | 3): number {
  return diamonds * 0.8 + 2;
}

// ============================================================================
// Batch Generation Functions
// ============================================================================

/**
 * Generate all schemas for a restaurant detail page
 */
export function generateAllRestaurantSchemas(restaurant: RestaurantSEOData, faqs?: FAQItem[]) {
  const schemas = [
    generateRestaurantSchema(restaurant),
    generateTouristAttractionSchema(restaurant),
  ];

  if (faqs?.length) {
    schemas.push(generateFAQSchema(faqs));
  }

  return schemas;
}

/**
 * Generate all schemas for a city page
 */
export function generateAllCitySchemas(
  city: CityInfo,
  faqs?: FAQItem[],
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [
    generateLocalBusinessSchema({ city }),
    generateWebsiteSchema(),
    generateOrganizationSchema(),
  ];

  if (faqs?.length) {
    schemas.push(generateFAQSchema(faqs));
  }

  return schemas;
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJsonLdScript(schemas: Record<string, unknown>[]): string {
  if (schemas.length === 1) {
    return JSON.stringify(schemas[0]);
  }
  return JSON.stringify(schemas);
}
