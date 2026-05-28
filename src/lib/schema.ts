// Schema.org JSON-LD generators for structured data

import type { CityInfo, EventSEOData, FAQItem, RestaurantSEOData } from "@/types/seo";

const SITE_URL = "https://chinaconnect.com";
const SITE_NAME = "ChinaConnect";
const SITE_DESCRIPTION =
  "Connect with China's finest culinary experiences - Michelin stars, Black Pearl restaurants, and local favorites.";

// LocalBusiness schema
export function generateLocalBusinessSchema(city: CityInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SITE_NAME} - ${city.name}`,
    description: `${SITE_NAME} helps you discover the best restaurants in ${city.name}, China. Find Michelin-starred restaurants, Black Pearl establishments, and local favorites.`,
    url: `${SITE_URL}/${city.slug}`,
    image: `${SITE_URL}/og-image.png`,
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
    sameAs: ["https://twitter.com/chinaconnect", "https://instagram.com/chinaconnect"],
  };
}

// Restaurant schema
export function generateRestaurantSchema(restaurant: RestaurantSEOData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
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

// TouristAttraction schema
export function generateTouristAttractionSchema(restaurant: RestaurantSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
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

// FAQPage schema
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

// Event schema
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

// BreadcrumbList schema
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

// WebSite schema with SearchAction
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
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

// Organization schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: ["https://twitter.com/chinaconnect", "https://instagram.com/chinaconnect"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@chinaconnect.com",
      availableLanguage: ["English", "Chinese"],
    },
  };
}

// Helper functions
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

// Batch generate all schemas for a restaurant
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
