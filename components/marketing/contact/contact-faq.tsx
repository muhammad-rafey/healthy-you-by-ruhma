"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CONTACT_FAQ } from "@/lib/contact-data";
import { cn } from "@/lib/cn";

export function ContactFaq() {
  return (
    <section aria-labelledby="contact-faq-title" className="flex flex-col gap-8">
      <h2
        id="contact-faq-title"
        className="font-display text-ink text-[clamp(28px,3.4vw,40px)] leading-[1.1] font-medium tracking-[-0.02em]"
      >
        Before you write
      </h2>

      <Accordion type="single" collapsible className="border-ink/10 border-t">
        {CONTACT_FAQ.map(({ q, a }, i) => (
          <AccordionItem
            key={q}
            value={`item-${i}`}
            className="border-ink/10 border-b not-last:border-b"
          >
            <AccordionTrigger
              className={cn(
                "text-ink hover:text-mauve-deep w-full py-6 text-left text-[19px] leading-snug font-medium",
                "transition-colors duration-300 ease-out hover:no-underline",
              )}
            >
              <span>{q}</span>
            </AccordionTrigger>
            <AccordionContent className="text-ink-soft pr-8 pb-6 text-[17px] leading-[1.6]">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
