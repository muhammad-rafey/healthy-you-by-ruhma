import { Container } from "@/components/ui/container";
import { FadeUp } from "@/components/motion/fade-up";

interface MissionStatementProps {
  statement: string;
  excerpt?: string;
}

export function MissionStatement({ statement, excerpt }: MissionStatementProps) {
  return (
    <section aria-label="Mission statement" className="bg-cream py-24 md:py-32 lg:py-40">
      <Container width="narrow" className="text-center">
        <FadeUp>
          <p className="font-display text-ink text-[clamp(32px,4vw,56px)] leading-[1.1] font-medium tracking-[-0.02em]">
            {statement}
          </p>
        </FadeUp>
        {excerpt ? (
          <FadeUp delay={0.1}>
            <p className="text-ink-soft mt-8 font-sans text-[18px] leading-[1.6] italic">
              {excerpt}
            </p>
          </FadeUp>
        ) : null}
      </Container>
    </section>
  );
}
