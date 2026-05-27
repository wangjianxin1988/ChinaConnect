// Breadcrumb Navigation Component
// Renders breadcrumb navigation with JSON-LD structured data

import { generateBreadcrumbSchema } from "@/lib/seo/schema-org";
import { useEffect } from "react";

export interface BreadcrumbItem {
  name: string;
  href: string;
  /** If true, this item won't be linked (current page) */
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Show schema.org JSON-LD (default: true) */
  includeSchema?: boolean;
  /** Custom className for container */
  className?: string;
  /** Custom separator character */
  separator?: string;
  /** Show schema only (for embedding in existing structures) */
  schemaOnly?: boolean;
}

const DEFAULT_SEPARATOR = "/";
const SITE_URL = "https://chinaconnect.com";
const SCHEMA_ID = "breadcrumb-schema";

/**
 * Generate breadcrumb schema from items
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string = SITE_URL) {
  const schemaItems = items.map((item) => ({
    name: item.name,
    url: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}`,
  }));

  return generateBreadcrumbSchema(schemaItems);
}

/**
 * Breadcrumb component for React/Astro pages
 */
export function Breadcrumb({
  items,
  includeSchema = true,
  className = "",
  separator = DEFAULT_SEPARATOR,
  schemaOnly = false,
}: BreadcrumbProps) {
  const validItems = items.filter((item) => item.name && item.href);
  const schema = includeSchema ? getBreadcrumbSchema(validItems) : null;

  // Inject JSON-LD schema safely using useEffect
  useEffect(() => {
    if (!schema) return;

    // Remove existing script if present
    const existing = document.getElementById(SCHEMA_ID);
    if (existing) {
      existing.remove();
    }

    // Create and inject new script
    const script = document.createElement("script");
    script.id = SCHEMA_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const toRemove = document.getElementById(SCHEMA_ID);
      if (toRemove) {
        toRemove.remove();
      }
    };
  }, [schema]);

  if (schemaOnly) {
    return null; // Schema-only mode doesn't render HTML
  }

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumb-nav ${className}`}>
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1;
          const isCurrent = item.isCurrent || isLast;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {separator}
                </span>
              )}
              {isCurrent ? (
                <span
                  className="text-gray-600 font-medium"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items for a city page
 */
export function generateCityBreadcrumbs(
  citySlug: string,
  cityName: string,
  currentPage?: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Cities", href: "/#cities" },
    { name: cityName, href: `/city/${citySlug}` },
  ];

  if (currentPage) {
    items.push({ name: currentPage, href: "#", isCurrent: true });
  }

  return items;
}

/**
 * Generate breadcrumb items for a restaurant page
 */
export function generateRestaurantBreadcrumbs(
  citySlug: string,
  cityName: string,
  restaurantName: string,
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Cities", href: "/#cities" },
    { name: cityName, href: `/city/${citySlug}` },
    { name: "Restaurants", href: `/city/${citySlug}#food` },
    { name: restaurantName, href: "#", isCurrent: true },
  ];
}

/**
 * Generate breadcrumb items for a guide page
 */
export function generateGuideBreadcrumbs(guideName: string, section?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guide" },
    {
      name: guideName,
      href: `/guide/${guideName.toLowerCase().replace(/\s+/g, "-")}`,
    },
  ];

  if (section) {
    items.push({ name: section, href: "#", isCurrent: true });
  }

  return items;
}

/**
 * Generate breadcrumb items for food listing page
 */
export function generateFoodBreadcrumbs(
  citySlug?: string,
  cityName?: string,
  cuisine?: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Food", href: "/food" },
  ];

  if (citySlug && cityName) {
    items.push({ name: cityName, href: `/city/${citySlug}#food` });
  }

  if (cuisine) {
    items.push({ name: cuisine, href: "#", isCurrent: true });
  }

  return items;
}

/**
 * Generate breadcrumb items for AI chat page
 */
export function generateAIBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "AI Assistant", href: "/ai", isCurrent: true },
  ];
}

/**
 * Generate breadcrumb items for emergency page
 */
export function generateEmergencyBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Emergency", href: "/emergency", isCurrent: true },
  ];
}

/**
 * Generate breadcrumb items for community page
 */
export function generateCommunityBreadcrumbs(section?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Community", href: "/community" },
  ];

  if (section) {
    items.push({ name: section, href: "#", isCurrent: true });
  }

  return items;
}
