// Right-column contact details. All values come from content/site.ts so
// updates flow from a single source. Map embed deferred — there is no
// public practice address to render, per the master plan.

import { site } from "@/content/site";

const wa = site.contact.whatsapp.replace(/\D+/g, "");
const waHref = `https://wa.me/${wa}`;
const igHref = site.contact.instagramUrl;
const igHandle = `@${site.contact.instagram}`;

export function ContactDetails() {
  return (
    <aside aria-label="Contact details" className="flex flex-col gap-10">
      <Detail label="Email" href={`mailto:${site.contact.email}`} value={site.contact.email} />
      <Detail label="WhatsApp" href={waHref} value={site.contact.whatsappDisplay} external />
      <Detail label="Instagram" href={igHref} value={igHandle} external />

      <div className="border-ink/10 flex flex-col gap-3 border-t pt-8">
        <p className="type-eyebrow text-ink/70 !text-[11px] tracking-[0.18em]">Response time</p>
        <p className="text-ink-soft text-[16px] leading-[1.6]">
          Typically replies within 1 business day.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="type-eyebrow text-ink/70 !text-[11px] tracking-[0.18em]">Hours</p>
        <p className="text-ink-soft text-[16px] leading-[1.6]">Lahore, Pakistan · GMT+5</p>
      </div>
    </aside>
  );
}

interface DetailProps {
  label: string;
  href: string;
  value: string;
  external?: boolean;
}

function Detail({ label, href, value, external }: DetailProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-eyebrow text-ink/70 !text-[11px] tracking-[0.18em]">{label}</p>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-display text-ink hover:text-mauve text-[clamp(20px,2vw,26px)] leading-[1.2] font-medium underline-offset-4 transition-colors hover:underline"
      >
        {value}
      </a>
    </div>
  );
}
