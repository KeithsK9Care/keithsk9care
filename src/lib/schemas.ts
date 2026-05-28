/**
 * Schema.org JSON-LD builders for Keith's K9 Care.
 *
 * Used by Layout.astro for the sitewide LocalBusiness + AnimalCareService block,
 * and per-page in index.astro etc. for FAQPage / BreadcrumbList / Person /
 * Service / Offer schema.
 *
 * All builders return plain objects — stringify at the call site.
 */

interface SiteShape {
  url: string;
  name: string;
  tagline: string;
  phoneIntl: string;
  email: string;
  priceRange: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postcode: string;
    country: string;
    lat: number;
    lng: number;
  };
  hours: { day: string; open: string; close: string }[];
  serviceArea: string[];
  facebook: string;
}

interface ServiceShape {
  slug: string;
  name: string;
  summary: string;
  fromPrice: number;
}

/**
 * Sitewide LocalBusiness + AnimalCareService schema.
 * Injected by Layout.astro on every page.
 */
export function buildLocalBusinessSchema(site: SiteShape, services: ServiceShape[]) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AnimalCareService"],
    "@id": `${site.url}/#business`,
    "name": site.name,
    "description": site.tagline,
    "url": site.url,
    "telephone": site.phoneIntl,
    "email": site.email,
    "image": `${site.url}/assets/logo.png`,
    "logo": `${site.url}/assets/logo.png`,
    "priceRange": site.priceRange,
    "currenciesAccepted": "GBP",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": site.address.street,
      "addressLocality": site.address.locality,
      "addressRegion": site.address.region,
      "postalCode": site.address.postcode,
      "addressCountry": site.address.country,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": site.address.lat,
      "longitude": site.address.lng,
    },
    "areaServed": site.serviceArea.map((name) => ({
      "@type": "Place",
      "name": name,
    })),
    "openingHoursSpecification": site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": `https://schema.org/${h.day}`,
      "opens": h.open,
      "closes": h.close,
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dog Grooming Services",
      "itemListElement": services.map((s) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": s.name,
          "description": s.summary,
          "url": `${site.url}/services/${s.slug}/`,
        },
        "price": s.fromPrice,
        "priceCurrency": "GBP",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": s.fromPrice,
          "priceCurrency": "GBP",
          "valueAddedTaxIncluded": true,
          "description": `From £${s.fromPrice}`,
        },
      })),
    },
    "sameAs": [site.facebook],
  };
}

/**
 * FAQPage schema — used on homepage (5 FAQs) and the /faq/ page (all 10).
 */
export function buildFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };
}

/**
 * BreadcrumbList schema — for non-home pages.
 * crumbs is an ordered list from root to current page.
 */
export function buildBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.name,
      "item": c.url,
    })),
  };
}
