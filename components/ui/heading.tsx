import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const headingVariants = cva("", {
  variants: {
    variant: {
      "display-xl": "type-display-xl",
      display: "type-display",
      h1: "type-h1",
      h2: "type-h2",
    },
    tone: {
      ink: "text-ink",
      mauve: "text-mauve",
      "mauve-deep": "text-mauve-deep",
      moss: "text-moss",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "h1",
    tone: "ink",
    align: "left",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface HeadingProps
  extends
    Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

const variantToTag: Record<NonNullable<HeadingProps["variant"]>, HeadingTag> = {
  "display-xl": "h1",
  display: "h1",
  h1: "h1",
  h2: "h2",
};

export function Heading({ as, variant, tone, align, className, children, ...rest }: HeadingProps) {
  const Tag = (as ?? variantToTag[variant ?? "h1"]) as HeadingTag;
  return (
    <Tag className={cn(headingVariants({ variant, tone, align }), className)} {...rest}>
      {children}
    </Tag>
  );
}
