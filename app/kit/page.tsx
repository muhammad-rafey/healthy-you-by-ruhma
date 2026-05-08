import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Prose } from "@/components/ui/prose";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";

const TOKENS = [
  { name: "cream", value: "#F4F0EE", className: "bg-cream" },
  { name: "cream-deep", value: "#E8E1D8", className: "bg-cream-deep" },
  { name: "shell", value: "#E7D3CC", className: "bg-shell" },
  { name: "ink", value: "#1A1A1A", className: "bg-ink" },
  { name: "ink-soft", value: "#3E3E3E", className: "bg-ink-soft" },
  { name: "mauve", value: "#895575", className: "bg-mauve" },
  { name: "mauve-deep", value: "#6E3F5C", className: "bg-mauve-deep" },
  { name: "moss", value: "#5D6B4E", className: "bg-moss" },
  { name: "paper", value: "#FFFFFF", className: "bg-paper" },
];

const ILLUSTRATIONS = ["fennel", "mint", "citrus", "leaf", "root", "sprig", "seed", "pestle"];

export default function KitPage() {
  return (
    <main className="bg-cream text-ink-soft min-h-screen pb-32">
      <Container width="default" className="space-y-24 py-16">
        {/* Page header */}
        <header className="border-ink/10 space-y-4 border-b pb-10">
          <Eyebrow>Internal · Visual QA</Eyebrow>
          <Heading variant="display" as="h1">
            Design system kit
          </Heading>
          <p className="type-body max-w-[60ch]">
            Every token, type style, primitive, and motion in one scrollable page. If something here
            looks wrong, the whole site looks wrong.
          </p>
        </header>

        {/* 1. Color tokens */}
        <section className="space-y-6">
          <Eyebrow>01 — Color tokens</Eyebrow>
          <Heading variant="h2" as="h2">
            Palette
          </Heading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TOKENS.map((t) => (
              <div key={t.name} className="space-y-2">
                <div className={`${t.className} border-ink/10 h-24 w-full rounded-sm border`} />
                <div className="space-y-0.5">
                  <p className="type-small text-ink font-medium">{t.name}</p>
                  <p className="type-caption">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Type scale */}
        <section className="space-y-8">
          <Eyebrow>02 — Type scale</Eyebrow>
          <Heading variant="h2" as="h2">
            Editorial typography
          </Heading>

          <div className="space-y-10">
            <div className="space-y-2">
              <Eyebrow>Display XL · Epilogue · 600 · -0.04em</Eyebrow>
              <p className="type-display-xl">nourish</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Display · Epilogue · 500 · -0.03em</Eyebrow>
              <p className="type-display">Get transformed into your dream version</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>H1 · Epilogue · 500 · -0.02em</Eyebrow>
              <p className="type-h1">My mission is to make you shine from inside.</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>H2 · Inter · 500 · -0.01em</Eyebrow>
              <p className="type-h2">What&apos;s included in the program</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Eyebrow · Inter · 500 · 0.16em uppercase</Eyebrow>
              <p className="type-eyebrow">Section label</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Body · Inter · 400 · 1.6 line-height · 17px</Eyebrow>
              <p className="type-body max-w-[60ch]">
                Nourishing you inside out for healthy you throughout. The body copy reads at 17px
                with generous line-height — editorial weight for long-form content like the focus
                pages and journal posts.
              </p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Small · Inter · 400 · 14px</Eyebrow>
              <p className="type-small">Secondary metadata, form helper text, breadcrumbs.</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Caption · Inter · italic · 13px · 0.04em</Eyebrow>
              <p className="type-caption">Photograph: Dr. Ruhma at the practice, Lahore, 2024.</p>
            </div>
          </div>
        </section>

        {/* 3. Primitives */}
        <section className="space-y-8">
          <Eyebrow>03 — Primitives</Eyebrow>
          <Heading variant="h2" as="h2">
            Composable building blocks
          </Heading>

          <div className="space-y-6">
            <div className="space-y-2">
              <Eyebrow>&lt;Heading&gt; variants</Eyebrow>
              <Heading variant="display-xl">moment</Heading>
              <Heading variant="display">Page title</Heading>
              <Heading variant="h1">Section heading</Heading>
              <Heading variant="h2">Subsection</Heading>
              <Heading variant="h1" tone="mauve">
                Mauve tone
              </Heading>
              <Heading variant="h1" tone="moss">
                Moss tone
              </Heading>
            </div>

            <div className="border-ink/10 space-y-2 border-t pt-6">
              <Eyebrow>&lt;Container&gt; widths</Eyebrow>
              <div className="bg-cream-deep p-4">
                <Container width="narrow" className="bg-paper p-4">
                  narrow (720)
                </Container>
              </div>
              <div className="bg-cream-deep p-4">
                <Container width="default" className="bg-paper p-4">
                  default (1200)
                </Container>
              </div>
              <div className="bg-cream-deep p-4">
                <Container width="wide" className="bg-paper p-4">
                  wide (1440)
                </Container>
              </div>
            </div>

            <div className="border-ink/10 space-y-4 border-t pt-6">
              <Eyebrow>&lt;Button&gt; variants</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Default (ink)</Button>
                <Button variant="mauve">Mauve</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default" size="sm">
                  Small
                </Button>
                <Button variant="default" size="default">
                  Default
                </Button>
                <Button variant="default" size="lg">
                  Large
                </Button>
              </div>
            </div>

            <div className="border-ink/10 space-y-2 border-t pt-6">
              <Eyebrow>&lt;Prose&gt; with drop-cap</Eyebrow>
              <Prose dropcap>
                <p>
                  Hormonal health is not one switch. The body runs on a network of signals —
                  cortisol when stressed, insulin after a meal, estrogen and progesterone on a
                  monthly rhythm — and each one affects the others. When clients tell me &ldquo;my
                  hormones are off,&rdquo; the work is to figure out{" "}
                  <em>which one, when, and why</em>.
                </p>
                <h2>Where this shows up</h2>
                <p>
                  In practice, hormonal imbalance arrives wearing three masks. Sometimes it&apos;s
                  PCOS. Sometimes it&apos;s thyroid. Sometimes it&apos;s cortisol you didn&apos;t
                  realise was running the show.
                </p>
                <blockquote>
                  The body is patient. It will wait years for you to listen before it raises its
                  voice.
                </blockquote>
                <p>
                  <a href="#">Read more on the journal →</a>
                </p>
              </Prose>
            </div>
          </div>
        </section>

        {/* 4. Motion */}
        <section className="space-y-8">
          <Eyebrow>04 — Motion (3 only)</Eyebrow>
          <Heading variant="h2" as="h2">
            Master §1 motion components
          </Heading>

          <div className="space-y-12">
            <div className="space-y-3">
              <Eyebrow>&lt;FadeUp&gt; · 600ms · ease-out · on scroll</Eyebrow>
              {[0, 1, 2].map((i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="bg-paper border-ink/10 type-body border p-6">
                    Block {i + 1} fades up when scrolled into view (16px → 0).
                  </div>
                </FadeUp>
              ))}
            </div>

            <div className="border-ink/10 space-y-3 border-t pt-8">
              <Eyebrow>&lt;ImageReveal&gt; · 1.2s · clip-path wipe · on mount</Eyebrow>
              <ImageReveal direction="up" className="aspect-[4/3] w-full max-w-2xl">
                <div className="bg-shell flex h-full w-full items-center justify-center">
                  <span className="type-display text-mauve-deep">photo</span>
                </div>
              </ImageReveal>
            </div>

            <div className="border-ink/10 space-y-3 border-t pt-8">
              <Eyebrow>&lt;LetterStagger&gt; · 800ms · on mount</Eyebrow>
              <LetterStagger text="nourish" as="h1" className="type-display-xl" />
            </div>
          </div>
        </section>

        {/* 5. Botanical illustrations */}
        <section className="space-y-6">
          <Eyebrow>05 — Botanical SVG set</Eyebrow>
          <Heading variant="h2" as="h2">
            Section anchors
          </Heading>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {ILLUSTRATIONS.map((name) => (
              <figure key={name} className="space-y-2">
                <div className="bg-paper border-ink/10 text-ink flex aspect-square items-center justify-center border">
                  <Image
                    src={`/illustrations/${name}.svg`}
                    alt=""
                    width={80}
                    height={80}
                    className="h-20 w-20"
                    aria-hidden
                  />
                </div>
                <figcaption className="type-caption">{name}.svg</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 6. Reduced motion check */}
        <section className="border-ink/10 space-y-4 border-t pt-10">
          <Eyebrow>06 — Reduced motion</Eyebrow>
          <p className="type-body max-w-[60ch]">
            Toggle <code className="bg-cream-deep px-1">prefers-reduced-motion: reduce</code>
            in DevTools (Rendering tab → Emulate CSS media feature). All three motion components
            above should render their final state with no animation. The global CSS rule also kills
            any stray transitions.
          </p>
        </section>
      </Container>
    </main>
  );
}
