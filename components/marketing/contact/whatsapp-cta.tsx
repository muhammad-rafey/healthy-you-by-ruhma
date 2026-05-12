// components/marketing/contact/whatsapp-cta.tsx
//
// Single CTA card that replaces the email contact form. Opens WhatsApp with
// a prefill that adapts to the topic the visitor came in for (set by callers
// like /programs/coaching using `/contact?topic=coaching`).

import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

const PREFILLS: Record<string, string> = {
  coaching: "Hi Dr. Ruhma, I'd like to ask about the Coaching Program.",
  consultation: "Hi Dr. Ruhma, I'd like to book a consultation call.",
  "pcos-hormonal": "Hi Dr. Ruhma, I'd like to ask about PCOS / hormonal support.",
  "weight-management": "Hi Dr. Ruhma, I'd like to ask about weight management.",
};

const DEFAULT_PREFILL = "Hi Dr. Ruhma, I'd like to ask about your services.";

interface WhatsappCtaProps {
  topic?: string;
}

export function WhatsappCta({ topic }: WhatsappCtaProps = {}) {
  const wa = site.contact.whatsapp.replace(/\D+/g, "");
  const prefill = (topic && PREFILLS[topic]) ?? DEFAULT_PREFILL;
  const href = `https://wa.me/${wa}?text=${encodeURIComponent(prefill)}`;

  return (
    <div
      role="region"
      aria-label="Message Dr. Ruhma on WhatsApp"
      className="bg-paper border-ink/10 mx-auto flex max-w-2xl flex-col items-center gap-7 border px-8 py-14 text-center md:px-12 md:py-16"
    >
      <p className="font-display text-ink max-w-[26ch] text-[clamp(24px,3vw,32px)] leading-[1.2]">
        WhatsApp is the fastest way to reach the practice.
      </p>
      <p className="text-ink-soft max-w-[44ch] text-[16px] leading-[1.6]">
        Send a note about what you&rsquo;re working on — what&rsquo;s been tried, what isn&rsquo;t
        working, what you&rsquo;d like to be different. I read every message personally and reply
        within one business day.
      </p>
      <Button asChild variant="default" size="lg">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-event-name="cta_click"
          data-event-label={`whatsapp_${topic ?? "general"}`}
        >
          Message on WhatsApp →
        </a>
      </Button>
      <p className="text-ink-soft text-[13px]">
        Or reach me at{" "}
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mauve hover:text-mauve-deep underline underline-offset-4"
        >
          {site.contact.whatsappDisplay}
        </a>
        .
      </p>
    </div>
  );
}
