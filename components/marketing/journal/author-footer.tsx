// components/marketing/journal/author-footer.tsx
//
// Small portrait + 1-paragraph "About Dr. Ruhma" tail used at the bottom
// of every journal post (master §3.11). Links into /about for the full
// bio.

import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

export function AuthorFooter() {
  return (
    <section aria-label="About the author" className="bg-cream py-[clamp(64px,8vw,112px)]">
      <Container>
        <div className="border-cream-deep mx-auto flex max-w-[680px] items-start gap-6 border-t pt-12">
          <div className="bg-cream-deep relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/media/about/portrait-secondary-400.webp"
              alt={site.practitioner}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="text-ink-soft text-[15px] leading-[1.65]">
            <p>
              <span className="text-ink font-medium">{site.practitioner}</span> is a clinical
              dietitian based in Faisalabad. She runs {site.name} — a practice focused on hormonal
              health, PCOS, and sustainable weight management.{" "}
              <Link
                href="/about"
                className="text-mauve hover:text-mauve-deep underline underline-offset-4"
              >
                More about her work →
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
