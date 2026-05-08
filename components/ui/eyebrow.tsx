import { cn } from "@/lib/cn";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "p" | "div";
}

export function Eyebrow({ as: Tag = "span", className, children, ...rest }: EyebrowProps) {
  return (
    <Tag className={cn("type-eyebrow", className)} {...rest}>
      {children}
    </Tag>
  );
}
