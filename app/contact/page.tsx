import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";
import { WhatsappCta } from "@/components/marketing/contact/whatsapp-cta";
import { ContactDetails } from "@/components/marketing/contact/contact-details";
import { ContactFaq } from "@/components/marketing/contact/contact-faq";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Dr. Ruhma on WhatsApp for hormonal health, weight management, coaching, or consultation enquiries. Replies within 1 business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${site.name}`,
    description:
      "Reach Dr. Ruhma on WhatsApp for hormonal health, weight management, coaching, or consultation enquiries.",
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
    "Contact details for Healthy You by Ruhma. Reach out via WhatsApp about coaching, consultations, PCOS, or weight management.",
  mainEntity: {
    "@type": "Organization",
    name: site.name,
    email: site.contact.email,
    url: site.url,
    sameAs: [site.contact.instagramUrl],
  },
};

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const raw = params.topic;
  const topic = typeof raw === "string" ? raw : undefined;

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
              Tell me a little about what you&rsquo;re working on and I&rsquo;ll reply with the
              right next step. No drip campaigns, no automated funnels — a real reply, usually
              within a business day.
            </p>
          </FadeUp>
        </header>

        <FadeUp delay={0.1}>
          <WhatsappCta topic={topic} />
        </FadeUp>

        <FadeUp delay={0.2} className="mx-auto mt-20 max-w-2xl">
          <ContactDetails />
        </FadeUp>

        <FadeUp as="section" className="mt-28 max-w-3xl">
          <ContactFaq />
        </FadeUp>
      </Container>
    </>
  );
}
