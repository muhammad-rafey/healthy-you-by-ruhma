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
import { cn } from "@/lib/cn";
import { SERVICES_FAQ } from "@/lib/services-data";

export function ServicesFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="services-faq-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <FadeUp>
            <Eyebrow>Common questions</Eyebrow>
            <Heading as="h2" id="services-faq-heading" variant="h1" className="mt-4 max-w-[14ch]">
              Before you book.
            </Heading>
            <p className="text-ink-soft mt-6 max-w-[36ch] text-[17px] leading-[1.6]">
              The questions that come up most. If yours isn&rsquo;t here,{" "}
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
              {SERVICES_FAQ.map(({ q, a }, i) => (
                <AccordionItem
                  key={q}
                  value={`item-${i}`}
                  className="border-ink/10 border-b not-last:border-b"
                >
                  <AccordionTrigger
                    className={cn(
                      "text-ink hover:text-mauve-deep w-full py-6 text-left text-[20px] leading-snug font-medium",
                      "transition-colors duration-300 ease-out",
                      "[&_[data-faq-q]]:relative [&_[data-faq-q]]:bg-no-repeat",
                      "[&_[data-faq-q]]:[background-image:linear-gradient(to_right,var(--color-mauve),var(--color-mauve))]",
                      "[&_[data-faq-q]]:[background-size:0%_1px]",
                      "[&_[data-faq-q]]:[background-position:0_100%]",
                      "[&_[data-faq-q]]:transition-[background-size]",
                      "[&_[data-faq-q]]:duration-300",
                      "[&_[data-faq-q]]:ease-out",
                      "[&_[data-faq-q]]:motion-reduce:transition-none",
                      "hover:[&_[data-faq-q]]:[background-size:100%_1px]",
                      "focus-visible:[&_[data-faq-q]]:[background-size:100%_1px]",
                      "hover:no-underline",
                    )}
                  >
                    <span data-faq-q>{q}</span>
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
