import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const containerVariants = cva("mx-auto w-full px-6 sm:px-8 lg:px-12", {
  variants: {
    width: {
      narrow: "max-w-[720px]", // longread / legal / about mission
      default: "max-w-[1200px]", // standard sections
      wide: "max-w-[1440px]", // hero, library editorial spreads
      full: "max-w-none px-0 sm:px-0 lg:px-0", // image full-bleed
    },
  },
  defaultVariants: {
    width: "default",
  },
});

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  as?: "div" | "section" | "article" | "main";
}

export function Container({
  as: Tag = "div",
  width,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag className={cn(containerVariants({ width }), className)} {...rest}>
      {children}
    </Tag>
  );
}
