import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { FadeUp } from "@/components/motion/fade-up";
import { Credentials } from "./credentials";
import { PullQuote } from "./pull-quote";

interface BioProps {
  children: ReactNode;
  portrait: { src: string; alt: string };
  pullQuote: string;
  credentials: string[];
}

export function Bio({ children, portrait, pullQuote, credentials }: BioProps) {
  return (
    <section aria-label="Biography" className="bg-cream py-24 md:py-28 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeUp className="bio-prose lg:col-span-7 lg:col-start-1">{children}</FadeUp>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="space-y-10 lg:sticky lg:top-32">
              <FadeUp delay={0.1}>
                <div className="bg-shell relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeUp>

              <FadeUp delay={0.15}>
                <PullQuote>{pullQuote}</PullQuote>
              </FadeUp>

              <FadeUp delay={0.2}>
                <Credentials items={credentials} />
              </FadeUp>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
