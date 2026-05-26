// Unit tests for SEO library functions

import {
  generateBreadcrumbSchema,
  generateEventSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateRestaurantSchema,
  generateWebsiteSchema,
} from "@/lib/schema";
import type { CityInfo, EventSEOData, FAQItem, RestaurantSEOData } from "@/types/seo";
import { describe, expect, it } from "vitest";

// Restaurant schema tests
describe("generateRestaurantSchema", () => {
  it("generates valid Restaurant schema", () => {
    const restaurant: RestaurantSEOData = {
      id: "test-123",
      name: "鼎泰丰",
      nameEn: "Din Tai Fung",
      cuisine: "Chinese",
      city: "北京",
      address: "朝阳区建国门外大街1号",
      lat: 39.9042,
      lng: 116.4074,
      avgPrice: 150,
      phone: "+86-10-12345678",
      type: "michelin",
      star: 1,
      imageUrl: "https://example.com/image.jpg",
    };

    const schema = generateRestaurantSchema(restaurant);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Restaurant");
    expect(schema.name).toBe("鼎泰丰");
    expect(schema.telephone).toBe("+86-10-12345678");
  });

  it("sets correct price range for budget restaurant", () => {
    const restaurant: RestaurantSEOData = {
      id: "test-1",
      name: "Test Restaurant",
      cuisine: "Chinese",
      city: "Beijing",
      address: "Test Address",
      lat: 39.9,
      lng: 116.4,
      avgPrice: 80,
      type: "local",
    };

    const schema = generateRestaurantSchema(restaurant);
    expect(schema.priceRange).toBe("$");
  });

  it("sets correct price range for mid-range restaurant", () => {
    const restaurant: RestaurantSEOData = {
      id: "test-2",
      name: "Test Restaurant",
      cuisine: "Chinese",
      city: "Beijing",
      address: "Test Address",
      lat: 39.9,
      lng: 116.4,
      avgPrice: 250,
      type: "local",
    };

    const schema = generateRestaurantSchema(restaurant);
    expect(schema.priceRange).toBe("$$");
  });

  it("sets correct price range for high-end restaurant", () => {
    const restaurant: RestaurantSEOData = {
      id: "test-3",
      name: "Test Restaurant",
      cuisine: "Chinese",
      city: "Beijing",
      address: "Test Address",
      lat: 39.9,
      lng: 116.4,
      avgPrice: 600,
      type: "michelin",
      star: 2,
    };

    const schema = generateRestaurantSchema(restaurant);
    expect(schema.priceRange).toBe("$$$$");
  });

  it("includes opening hours when provided", () => {
    const restaurant: RestaurantSEOData = {
      id: "test-4",
      name: "Test Restaurant",
      cuisine: "Chinese",
      city: "Beijing",
      address: "Test Address",
      lat: 39.9,
      lng: 116.4,
      avgPrice: 100,
      type: "local",
      openingHours: ["Mon-Fri 09:00-22:00", "Sat-Sun 10:00-21:00"],
    };

    const schema = generateRestaurantSchema(restaurant);
    expect(schema.openingHoursSpecification).toBeDefined();
  });
});

// FAQ schema tests
describe("generateFAQSchema", () => {
  it("generates valid FAQPage schema", () => {
    const faqs: FAQItem[] = [
      {
        question: "How do I make a reservation?",
        answer:
          "You can make a reservation through our website or by calling the restaurant directly.",
      },
      {
        question: "Is the restaurant wheelchair accessible?",
        answer: "Yes, our restaurants are fully wheelchair accessible.",
      },
    ];

    const schema = generateFAQSchema(faqs);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].name).toBe("How do I make a reservation?");
  });

  it("handles empty FAQ array", () => {
    const schema = generateFAQSchema([]);
    expect(schema.mainEntity).toHaveLength(0);
  });
});

// LocalBusiness schema tests
describe("generateLocalBusinessSchema", () => {
  it("generates valid LocalBusiness schema for a city", () => {
    const city: CityInfo = {
      slug: "beijing",
      name: "北京",
      nameEn: "Beijing",
      lat: 39.9042,
      lng: 116.4074,
      country: "China",
      countryCode: "CN",
    };

    const schema = generateLocalBusinessSchema(city);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 39.9042,
      longitude: 116.4074,
    });
  });
});

// Event schema tests
describe("generateEventSchema", () => {
  it("generates valid Event schema", () => {
    const event: EventSEOData = {
      id: "event-123",
      name: "Beijing Food Festival 2026",
      description: "Annual food festival celebrating Chinese cuisine",
      location: "Beijing, China",
      lat: 39.9042,
      lng: 116.4074,
      startDate: "2026-06-01T10:00:00+08:00",
      endDate: "2026-06-03T22:00:00+08:00",
      organizer: "ChinaConnect",
      imageUrl: "https://example.com/event.jpg",
    };

    const schema = generateEventSchema(event);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Event");
    expect(schema.name).toBe("Beijing Food Festival 2026");
    expect(schema.eventStatus).toBe("https://schema.org/EventScheduled");
    expect(schema.eventAttendanceMode).toBe("https://schema.org/OfflineEventAttendanceMode");
  });
});

// Breadcrumb schema tests
describe("generateBreadcrumbSchema", () => {
  it("generates valid BreadcrumbList schema", () => {
    const items = [
      { name: "Home", url: "https://chinaconnect.com/" },
      { name: "Beijing", url: "https://chinaconnect.com/beijing" },
      { name: "Test Restaurant", url: "https://chinaconnect.com/food/test-123" },
    ];

    const schema = generateBreadcrumbSchema(items);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe("Home");
  });
});

// WebSite schema tests
describe("generateWebsiteSchema", () => {
  it("generates valid WebSite schema with SearchAction", () => {
    const schema = generateWebsiteSchema();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.potentialAction).toBeDefined();
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
    expect(schema.potentialAction.target["@type"]).toBe("EntryPoint");
  });
});

// Organization schema tests
describe("generateOrganizationSchema", () => {
  it("generates valid Organization schema", () => {
    const schema = generateOrganizationSchema();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("ChinaConnect");
    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint.availableLanguage).toContain("English");
    expect(schema.contactPoint.availableLanguage).toContain("Chinese");
  });
});
