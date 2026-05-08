import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";
import { loadLibrary } from "@/lib/mdx";

const PKR = new Intl.NumberFormat("en-PK");

export async function FeaturedEbook() {
  const { frontmatter } = await loadLibrary("pcos-guidebook");
  const { title, description, price, salePrice, currency } = frontmatter;

  const hasSale = typeof salePrice === "number" && salePrice < price;
  const displayPrice = hasSale ? salePrice : price;
  const savings = hasSale ? Math.round(((price - salePrice!) / price) * 100) : 0;

  return (
    <section aria-labelledby="featured-ebook-heading" className="bg-cream py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
        <FadeUp className="md:col-span-6">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
            <Image
              src="/media/library/pcos-cover-1200.webp"
              alt={`${title} — cover`}
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain md:drop-shadow-[0_30px_60px_rgba(26,26,26,0.18)]"
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.12} className="md:col-span-6">
          <Eyebrow>Featured guidebook · 02</Eyebrow>
          <Heading as="h2" id="featured-ebook-heading" variant="h1" className="mt-4">
            {title}.
          </Heading>
          <p className="text-ink-soft mt-6 max-w-lg text-[17px] leading-relaxed">{description}</p>

          <div className="mt-8 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-ink text-[28px] leading-none font-medium">
              {currency} {PKR.format(displayPrice)}
            </span>
            {hasSale && (
              <>
                <span className="text-ink-soft text-[14px] line-through">
                  {currency} {PKR.format(price)}
                </span>
                <span className="bg-shell text-mauve-deep rounded-full px-3 py-1 text-[12px] font-medium tracking-[0.04em] uppercase">
                  Save {savings}%
                </span>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild variant="default" size="lg">
              <Link href="/library/pcos-guidebook">Open the guidebook →</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/library">Browse the library</Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
