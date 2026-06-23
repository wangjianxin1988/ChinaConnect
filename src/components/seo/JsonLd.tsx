// @ts-nocheck
// Schema.org JSON-LD React component
// Injects structured data scripts into the page head

import { useEffect } from "react";

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

// Inject JSON-LD script into document head
export function JsonLd({ schema }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "json-ld-schema";

    // Support both single schema object and array of schemas
    if (Array.isArray(schema)) {
      // Use @graph for multiple schemas
      const graphSchema = {
        "@context": "https://schema.org",
        "@graph": schema,
      };
      script.textContent = JSON.stringify(graphSchema);
    } else {
      script.textContent = JSON.stringify(schema);
    }

    // Remove existing script if present
    const existing = document.getElementById("json-ld-schema");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const toRemove = document.getElementById("json-ld-schema");
      if (toRemove) {
        toRemove.remove();
      }
    };
  }, [schema]);

  return null;
}

// Convenience components for common schema types
export function RestaurantJsonLd(props: Record<string, unknown>) {
  return <JsonLd schema={{ "@context": "https://schema.org", "@type": "Restaurant", ...props }} />;
}

export function LocalBusinessJsonLd(props: Record<string, unknown>) {
  return (
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "LocalBusiness", ...props }} />
  );
}

export function FAQPageJsonLd(props: Record<string, unknown>) {
  return <JsonLd schema={{ "@context": "https://schema.org", "@type": "FAQPage", ...props }} />;
}

export function TouristAttractionJsonLd(props: Record<string, unknown>) {
  return (
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "TouristAttraction", ...props }} />
  );
}

export function EventJsonLd(props: Record<string, unknown>) {
  return <JsonLd schema={{ "@context": "https://schema.org", "@type": "Event", ...props }} />;
}

export function BreadcrumbJsonLd(props: Record<string, unknown>) {
  return (
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "BreadcrumbList", ...props }} />
  );
}

export function WebSiteJsonLd(props: Record<string, unknown>) {
  return <JsonLd schema={{ "@context": "https://schema.org", "@type": "WebSite", ...props }} />;
}

export function OrganizationJsonLd(props: Record<string, unknown>) {
  return (
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "Organization", ...props }} />
  );
}
