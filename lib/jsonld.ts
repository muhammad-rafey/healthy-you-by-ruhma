// lib/jsonld.ts
//
// JSON-LD schema builders. Per Phase 13 audit:
//   - Home emits WebSite + Person + Organization (graph)
//   - About emits Person (richer)
//   - Service / Article / Product / BlogPosting / ContactPage live with
//     their pages (programs, focus, library, journal, contact)
//   - BreadcrumbList helper exposed for non-home pages to call

import { site } from "@/content/site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/wordmark.svg`,
    founder: {
      "@type": "Person",
      name: site.practitioner,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    sameAs: [site.contact.instagramUrl],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en-PK",
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.practitioner,
    jobTitle: "Clinical Dietitian",
    url: `${site.url}/about`,
    image: `${site.url}/media/home/hero-portrait-1080.webp`,
    worksFor: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    knowsAbout: [
      "Clinical dietetics",
      "PCOS",
      "Hormonal health",
      "Weight management",
      "Nutrition counseling",
    ],
    sameAs: [site.contact.instagramUrl],
  };
}

/**
 * BreadcrumbList — pass an ordered list of [label, path] crumbs.
 * The site root ("Home" / "/") is prepended automatically.
 */
export function breadcrumbSchema(crumbs: ReadonlyArray<readonly [label: string, path: string]>) {
  const all: ReadonlyArray<readonly [string, string]> = [["Home", "/"], ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([label, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: label,
      item: `${site.url}${path === "/" ? "" : path}`,
    })),
  };
}
