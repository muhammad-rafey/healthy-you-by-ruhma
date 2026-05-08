import { cn } from "@/lib/cn";

interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  dropcap?: boolean;
  as?: "div" | "article";
}

export function Prose({
  dropcap = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: ProseProps) {
  return (
    <Tag className={cn("prose-editorial", dropcap && "has-dropcap", className)} {...rest}>
      {children}
    </Tag>
  );
}
