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
  instagram: string;
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
    "sameAs": [site.facebook, site.instagram].filter(Boolean),
  };
}

/**
 * FAQPage schema — used on homepage (5 FAQs) and the /faq/ page (all 10).
 */
export function buildFAQSchema(faqs: { q: string; a: string }[]) {
  return {
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
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.name,
      "item": c.url,
    })),
  };
}


/**
 * Person schema for the /about/ page — Keith's profile.
 */
export function buildPersonSchema(opts: {
  url: string;
  name: string;
  jobTitle: string;
  alumniOf: string;
  worksFor: string;
  worksForUrl: string;
  image?: string;
  knowsAbout?: string[];
}) {
  return {
    "@type": "Person",
    "name": opts.name,
    "jobTitle": opts.jobTitle,
    "url": opts.url,
    ...(opts.image ? { "image": opts.image } : {}),
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": opts.alumniOf,
    },
    "worksFor": {
      "@type": "LocalBusiness",
      "name": opts.worksFor,
      "url": opts.worksForUrl,
    },
    ...(opts.knowsAbout ? { "knowsAbout": opts.knowsAbout } : {}),
  };
}

/**
 * Service schema for /services/[slug]/ pages.
 */
export function buildServiceSchema(opts: {
  url: string;
  name: string;
  description: string;
  fromPrice: number;
  businessId: string; // e.g. https://keithsk9care.co.uk/#business
  areaServed: string[];
}) {
  return {
    "@type": "Service",
    "serviceType": "Dog grooming",
    "name": opts.name,
    "description": opts.description,
    "url": opts.url,
    "provider": { "@id": opts.businessId },
    "areaServed": opts.areaServed.map((name) => ({
      "@type": "Place",
      "name": name,
    })),
    "offers": {
      "@type": "Offer",
      "price": opts.fromPrice,
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": opts.fromPrice,
        "priceCurrency": "GBP",
        "valueAddedTaxIncluded": true,
        "description": `From £${opts.fromPrice}`,
      },
    },
  };
}


/**
 * Review schema for the /reviews/ page.
 * Each review becomes one ItemListElement; AggregateRating is computed separately.
 */
export function buildReviewSchema(opts: {
  url: string;
  businessId: string;
  businessName: string;
  reviews: { id: string; author: string; date: string; rating: number; body: string; service?: string }[];
}) {
  return {
    "@type": "ItemList",
    "itemListElement": opts.reviews.map((r, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Review",
        "@id": `${opts.url}#${r.id}`,
        "author": { "@type": "Person", "name": r.author },
        "datePublished": r.date,
        "reviewBody": r.body,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.rating,
          "bestRating": 5,
          "worstRating": 1,
        },
        "itemReviewed": { "@id": opts.businessId, "@type": "LocalBusiness", "name": opts.businessName },
      },
    })),
  };
}

export function buildAggregateRatingSchema(opts: {
  businessId: string;
  ratings: number[];
}) {
  const total = opts.ratings.reduce((a, b) => a + b, 0);
  const avg = total / opts.ratings.length;
  return {
    "@type": "AggregateRating",
    "itemReviewed": { "@id": opts.businessId },
    "ratingValue": Math.round(avg * 10) / 10,
    "bestRating": 5,
    "worstRating": 1,
    "ratingCount": opts.ratings.length,
    "reviewCount": opts.ratings.length,
  };
}

/**
 * WebSite entity for the homepage @graph — completes the SOP home archetype
 * (LocalBusiness/Organization + WebSite). `publisher` links to the business node.
 */
export function buildWebSiteSchema(opts: { url: string; name: string; businessId: string }) {
  return {
    "@type": "WebSite",
    "@id": `${opts.url}/#website`,
    "url": opts.url,
    "name": opts.name,
    "publisher": { "@id": opts.businessId },
    "inLanguage": "en-GB",
  };
}

/**
 * Combine one or more schema entities into a single JSON-LD `@graph` block, so
 * every page emits exactly ONE <script type="application/ld+json"> (RVTC Gold
 * Standard point 5). Falsy entries (e.g. an absent FAQ or empty reviews) are
 * dropped, and the shared @context lives once at the top of the graph.
 */
export function buildGraph(entities: Array<object | null | undefined | false>) {
  return {
    "@context": "https://schema.org",
    "@graph": entities.filter(Boolean),
  };
}
