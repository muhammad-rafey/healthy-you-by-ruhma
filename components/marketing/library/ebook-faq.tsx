// components/marketing/library/ebook-faq.tsx
//
// 5-question FAQ shared across all three ebook detail pages, sourced from
// LIBRARY_FAQ. Reuses the shadcn Accordion primitive — visually mirrors the
// program-faq layout (eyebrow + heading on the left, accordion on the right).

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import { LIBRARY_FAQ } from "@/lib/library-data";
import { cn } from "@/lib/cn";

interface EbookFaqProps {
  slug: string;
}

export function EbookFaq({ slug }: EbookFaqProps) {
  return (
    <section id="faq" aria-labelledby={`${slug}-faq-heading`} className="bg-cream py-24 md:py-32">
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <FadeUp>
            <Eyebrow>Questions</Eyebrow>
            <Heading as="h2" id={`${slug}-faq-heading`} variant="h1" className="mt-4 max-w-[14ch]">
              Before you buy.
            </Heading>
            <p className="text-ink-soft mt-6 max-w-[36ch] text-[17px] leading-[1.6]">
              The questions readers ask most. If yours isn&rsquo;t here,{" "}
              <a
                href="/contact"
                className="text-mauve hover:text-mauve-deep underline-offset-4 hover:underline"
              >
                send a note
              </a>
              .
            </p>
          </FadeUp>
        </div>

        <div className="md:col-span-8">
          <FadeUp delay={0.15}>
            <Accordion type="single" collapsible className="border-ink/10 border-t">
              {LIBRARY_FAQ.map(({ q, a }, i) => (
                <AccordionItem
                  key={q}
                  value={`${slug}-faq-${i}`}
                  className="border-ink/10 border-b not-last:border-b"
                >
                  <AccordionTrigger
                    className={cn(
                      "text-ink hover:text-mauve-deep w-full py-6 text-left text-[20px] leading-snug font-medium",
                      "transition-colors duration-300 ease-out",
                      "hover:no-underline",
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
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
