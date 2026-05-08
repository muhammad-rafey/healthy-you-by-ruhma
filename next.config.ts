import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [400, 800, 1200, 1600, 2400],
  },
  async redirects() {
    // 301/308 SEO continuity — every old WordPress URL gets a permanent home.
    // Master plan §6 URL/SEO continuity table.
    return [
      // Top-level renames
      { source: "/about-me", destination: "/about", permanent: true },
      { source: "/contact-me", destination: "/contact", permanent: true },

      // Programs (with WP typos corrected)
      {
        source: "/diet-plannig-program",
        destination: "/programs/diet-planning",
        permanent: true,
      },
      {
        source: "/coaching-program",
        destination: "/programs/coaching",
        permanent: true,
      },
      {
        source: "/conultation-call",
        destination: "/programs/consultation",
        permanent: true,
      },

      // Focus areas
      {
        source: "/hormonal-health",
        destination: "/focus/hormonal-health",
        permanent: true,
      },
      {
        source: "/weight-management",
        destination: "/focus/weight-management",
        permanent: true,
      },

      // Shop → Library
      { source: "/shop", destination: "/library", permanent: true },
      {
        source: "/shop/diabetes-essentials",
        destination: "/library/diabetes-essentials",
        permanent: true,
      },
      {
        source: "/shop/pcos-guidebook",
        destination: "/library/pcos-guidebook",
        permanent: true,
      },
      {
        source: "/shop/skin-secrets",
        destination: "/library/skin-secrets",
        permanent: true,
      },

      // Dropped commerce flows — point at /library
      { source: "/cart", destination: "/library", permanent: true },
      { source: "/checkout", destination: "/library", permanent: true },
      { source: "/my-account", destination: "/library", permanent: true },

      // Legal
      {
        source: "/refund_returns",
        destination: "/legal/refunds",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/legal/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
