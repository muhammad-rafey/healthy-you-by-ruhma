import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import { ImageReveal } from "@/components/motion/image-reveal";
import { cn } from "@/lib/cn";

export type ServiceCardProgram = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  priceFrom: number;
  currency: string;
  heroImage: string;
  heroAlt: string;
  href: string;
};

interface ServiceCardProps {
  program: ServiceCardProgram;
  /** Card index (0-based). Determines left/right alternation on desktop. */
  index: number;
  /** Whether to wrap the image in <ImageReveal> (only the first card by default). */
  reveal?: boolean;
}

export function ServiceCard({ program, index, reveal = false }: ServiceCardProps) {
  // Indices 0 and 2: image left, text right. Index 1: image right, text left.
  const imageOnLeft = index % 2 === 0;
  const formattedPrice = new Intl.NumberFormat("en-PK").format(program.priceFrom);

  const imageInner = (
    <div className="bg-cream-deep relative aspect-[4/5] w-full overflow-hidden">
      <Image
        src={program.heroImage}
        alt={program.heroAlt}
        fill
        sizes="(min-width: 1024px) 58vw, (min-width: 768px) 58vw, 100vw"
        className={cn(
          "object-cover transition-transform duration-[600ms] ease-out",
          "group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
        )}
        priority={index === 0}
      />
    </div>
  );

  return (
    <FadeUp>
      <article
        className={cn(
          "group relative grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 lg:gap-16",
          "py-12 md:py-20",
        )}
      >
        <Link
          href={program.href}
          aria-label={`Explore ${program.title}`}
          tabIndex={-1}
          className={cn(
            "relative block overflow-hidden md:col-span-7",
            imageOnLeft ? "md:order-1" : "md:order-2",
          )}
        >
          {reveal ? (
            <ImageReveal direction="up" delay={0.1}>
              {imageInner}
            </ImageReveal>
          ) : (
            imageInner
          )}
        </Link>

        <div
          className={cn(
            "flex flex-col justify-center md:col-span-5",
            imageOnLeft ? "md:order-2" : "md:order-1",
          )}
        >
          <Eyebrow>{program.eyebrow}</Eyebrow>

          <Heading as="h2" variant="h1" className="mt-4">
            <Link
              href={program.href}
              className={cn(
                "relative inline bg-no-repeat",
                "[background-image:linear-gradient(to_right,var(--color-mauve),var(--color-mauve))]",
                "[background-size:0%_1px] [background-position:0_100%]",
                "transition-[background-size] duration-300 ease-out",
                "group-hover:[background-size:100%_1px]",
                "focus-visible:[background-size:100%_1px]",
                "motion-reduce:transition-none",
              )}
            >
              {program.title}
            </Link>
          </Heading>

          <p className="text-ink-soft mt-5 max-w-[44ch] text-[17px] leading-[1.6]">
            {program.description}
          </p>

          <div className="mt-6">
            <span
              className={cn(
                "bg-shell text-mauve-deep inline-flex items-center rounded-full px-4 py-1.5",
                "text-[12px] font-medium tracking-[0.16em] uppercase",
              )}
            >
              From {program.currency} {formattedPrice}
            </span>
          </div>

          <Link
            href={program.href}
            className={cn(
              "text-ink mt-8 inline-flex items-center gap-2 self-start",
              "border-b border-transparent pb-1 text-[14px] font-medium",
              "transition-colors duration-300 ease-out",
              "hover:border-mauve hover:text-mauve-deep",
              "focus-visible:border-mauve focus-visible:text-mauve-deep focus-visible:outline-none",
            )}
          >
            Explore
            <span
              aria-hidden
              className={cn(
                "inline-block transition-transform duration-300 ease-out",
                "group-hover:translate-x-1 motion-reduce:transition-none",
              )}
            >
              →
            </span>
          </Link>
        </div>
      </article>
    </FadeUp>
  );
}
