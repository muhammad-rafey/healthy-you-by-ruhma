"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

const CONDENSE_THRESHOLD = 64;

/** Returns true if `pathname` is inside `href`'s namespace.
 *  Exact match for "/", prefix match for nested routes,
 *  but only when `href` itself is at least one segment deep
 *  (so "/about" doesn't accidentally match "/" only). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const clean = href.replace(/\/$/, "");
  return pathname === clean || pathname.startsWith(clean + "/");
}

/** Group nav slugs that share a "section" so the underline highlights
 *  e.g. /focus/weight-management when the nav item is /focus/hormonal-health. */
function isActiveSection(pathname: string, href: string): boolean {
  if (href.startsWith("/focus")) return pathname.startsWith("/focus");
  if (href.startsWith("/programs") || href === "/services")
    return pathname.startsWith("/programs") || pathname === "/services";
  if (href.startsWith("/library")) return pathname.startsWith("/library");
  if (href.startsWith("/journal")) return pathname.startsWith("/journal");
  return isActive(pathname, href);
}

export function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > CONDENSE_THRESHOLD);
  });

  // Close the sheet on route change. We track the previous pathname in a ref
  // and only call setOpen when it actually changes, so we don't trigger a
  // cascading render on first paint (react-hooks/set-state-in-effect).
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: condensed ? 10 : 22,
        paddingBottom: condensed ? 10 : 22,
        backgroundColor: condensed ? "rgba(244, 240, 238, 0.85)" : "rgba(244, 240, 238, 0)",
        backdropFilter: condensed ? "blur(10px)" : "blur(0px)",
        borderBottomColor: condensed ? "rgba(26, 26, 26, 0.08)" : "rgba(26, 26, 26, 0)",
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b"
      data-condensed={condensed}
    >
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="text-ink flex items-center gap-2"
        >
          <Image
            src="/wordmark.svg"
            alt={site.name}
            width={168}
            height={28}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => {
            const active = isActiveSection(pathname, item.href);
            if (item.cta) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-ink/15 bg-ink text-cream rounded-full border px-4 py-2 text-sm font-medium transition",
                    "hover:bg-mauve-deep hover:border-mauve-deep",
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-ink/80 hover:text-ink relative text-sm tracking-wide transition",
                  "after:bg-mauve after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform",
                  "hover:after:scale-x-100",
                  active && "text-ink after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="text-ink rounded-md p-2 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="border-ink/10 bg-cream w-[88vw] max-w-sm border-l p-0"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <SheetTitle className="font-display text-ink text-lg">Menu</SheetTitle>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-ink rounded-md p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col px-6 pb-10">
              {site.nav.map((item) => {
                const active = isActiveSection(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-ink/10 font-display text-ink/80 border-b py-4 text-2xl tracking-tight transition",
                      active && "text-ink",
                      item.cta &&
                        "bg-ink text-cream mt-6 rounded-full border-0 py-3 text-center text-base",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
