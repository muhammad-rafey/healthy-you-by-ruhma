"use client";

import Image from "next/image";
import { ImageReveal } from "@/components/motion/image-reveal";

export function HeroPortrait() {
  return (
    <ImageReveal direction="up" className="bg-shell relative aspect-[3/4] w-full overflow-hidden">
      <Image
        src="/media/home/hero-portrait-1080.webp"
        alt="Dr. Ruhma, clinical dietitian, photographed in natural light."
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
      />
    </ImageReveal>
  );
}
