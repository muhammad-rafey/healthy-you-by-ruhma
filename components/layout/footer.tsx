import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { site } from "@/content/site";

// Inline Instagram glyph — lucide-react no longer ships this mark for
// trademark reasons, so we hand-roll a minimal stroke-based version that
// matches the lucide visual weight.
function Instagram({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function NewsletterForm() {
  // TODO(phase-6): Wire to real newsletter provider (Buttondown / Resend Audiences).
  // The /api/newsletter route currently returns 202 as a placeholder.
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="flex w-full max-w-sm items-center gap-2"
      aria-label="Newsletter signup"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@inbox.com"
        className="border-ink/30 text-ink placeholder:text-ink/40 focus:border-mauve flex-1 rounded-none border-0 border-b bg-transparent px-0 py-2 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="text-mauve hover:text-mauve-deep text-sm font-medium tracking-wide underline-offset-4 hover:underline"
      >
        Subscribe →
      </button>
    </form>
  );
}

export function Footer() {
  const whatsappDigits = site.contact.whatsapp.replace(/[^0-9]/g, "");

  return (
    <footer className="border-ink/10 bg-cream mt-32 border-t">
      <div className="mx-auto w-full max-w-[88rem] px-6 py-20 lg:px-10">
        {/* Tagline */}
        <p className="font-display text-ink text-[28px] leading-tight tracking-tight md:text-[32px]">
          {site.tagline}
        </p>

        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
          {site.footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-ink/60 text-[11px] font-medium tracking-[0.16em] uppercase">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.items.map((item) => {
                  const external = "external" in item && item.external;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-ink-soft hover:text-mauve text-sm transition"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter occupies the 5th column on lg+, full width below */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-ink/60 text-[11px] font-medium tracking-[0.16em] uppercase">
              Newsletter
            </h3>
            <p className="text-ink-soft mt-5 text-sm">
              Quiet, occasional dispatches on hormones, food, and the body.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-ink/10 mt-16 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-ink-soft text-xs">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-5">
            <li>
              <a
                href={site.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram — @${site.contact.instagram}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                aria-label={`Email — ${site.contact.email}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <Mail className="h-4 w-4" />
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp — ${site.contact.whatsappDisplay}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
