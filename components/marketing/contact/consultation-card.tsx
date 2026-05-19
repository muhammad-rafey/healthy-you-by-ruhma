import Link from "next/link";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { loadProgram } from "@/lib/content/load";

export async function ConsultationCard() {
  const { frontmatter: fm } = await loadProgram("consultation");

  const formattedPrice =
    fm.priceFrom !== undefined ? new Intl.NumberFormat("en-PK").format(fm.priceFrom) : null;
  const showLabel = !!fm.priceLabel || fm.priceFrom === undefined;

  return (
    <div className="bg-paper border-ink/10 mx-auto max-w-2xl border px-8 py-12 md:px-12 md:py-14">
      <Heading as="h2" variant="display" align="center">
        {fm.title}
      </Heading>
      <p className="text-ink-soft mx-auto mt-7 max-w-[44ch] text-center text-[17px] leading-[1.65]">
        {fm.description}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        <Button asChild variant="default" size="lg" data-event-label="contact_consultation">
          <Link href="/programs/consultation">{fm.ctaLabel}</Link>
        </Button>
        <span className="text-ink-soft text-[14px]">
          {showLabel ? (
            <span className="text-ink font-medium">{fm.priceLabel ?? "On consultation"}</span>
          ) : (
            <>
              <span className="text-mauve tracking-[0.16em] uppercase">From</span>{" "}
              <span className="text-ink ml-1 font-medium">
                {fm.currency} {formattedPrice}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
