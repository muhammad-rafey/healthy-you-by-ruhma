import Image from "next/image";

interface BotanicalDividerProps {
  variant?: "fennel" | "mint" | "citrus" | "leaf" | "seed" | "sprig" | "root" | "pestle";
  className?: string;
}

export function BotanicalDivider({ variant = "leaf", className }: BotanicalDividerProps) {
  return (
    <div aria-hidden className={`bg-cream flex justify-center py-10 md:py-14 ${className ?? ""}`}>
      <Image
        src={`/illustrations/${variant}.svg`}
        alt=""
        width={56}
        height={56}
        className="h-12 w-auto opacity-30 md:h-14"
      />
    </div>
  );
}
