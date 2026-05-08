import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";
import { ContactForm } from "@/components/marketing/contact/contact-form";
import { ContactDetails } from "@/components/marketing/contact/contact-details";
import { ContactFaq } from "@/components/marketing/contact/contact-faq";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Dr. Ruhma about diet planning, coaching, consultations, PCOS, or weight management. Replies within 1 business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${site.name}`,
    description:
      "Get in touch with Dr. Ruhma about diet planning, coaching, consultations, PCOS, or weight management.",
    url: "/contact",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contact · ${site.name}`,
  url: `${site.url}/contact`,
  description:
    "Contact form and details for Healthy You by Ruhma. Reach out about diet planning, coaching, consultations, PCOS, or weight management.",
  mainEntity: {
    "@type": "Organization",
    name: site.name,
    email: site.contact.email,
    url: site.url,
    sameAs: [site.contact.instagramUrl],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container as="main" className="py-20 sm:py-28">
        <header className="mb-16 max-w-2xl md:mb-20">
          <Eyebrow as="p" className="mb-4 block">
            Contact
          </Eyebrow>
          <LetterStagger
            as="h1"
            text="Let’s talk."
            className="font-display text-ink block text-[clamp(40px,7vw,88px)] leading-[1.02] font-medium tracking-[-0.03em]"
          />
          <FadeUp delay={0.2}>
            <p className="text-ink-soft mt-6 max-w-[44ch] text-[17px] leading-[1.65]">
              Tell us a little about what you’re working on and we’ll reply with the right next
              step. No drip campaigns, no automated funnels — a real reply, usually within a
              business day.
            </p>
          </FadeUp>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          <FadeUp delay={0.1}>
            <ContactForm />
          </FadeUp>
          <FadeUp delay={0.25}>
            <ContactDetails />
          </FadeUp>
        </div>

        <FadeUp as="section" className="mt-28 max-w-3xl">
          <ContactFaq />
        </FadeUp>
      </Container>
    </>
  );
}
