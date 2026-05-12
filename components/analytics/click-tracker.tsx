"use client";

import { useEffect } from "react";
import { classifyLink, trackEvent, type EventParams } from "@/lib/analytics";

const TRACKED_SELECTOR = 'a, button, [role="button"]';

function deriveLabel(el: Element): string {
  const explicit = el.getAttribute("data-event-label");
  if (explicit) return explicit;
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim();
  const text = el.textContent?.trim() ?? "";
  if (text) return text.slice(0, 80);
  return "unlabeled";
}

export function ClickTracker() {
  useEffect(() => {
    function onClick(ev: MouseEvent) {
      const target = ev.target as Element | null;
      if (!target) return;
      const el = target.closest(TRACKED_SELECTOR);
      if (!el) return;

      const isLink = el.tagName === "A";
      const name = el.getAttribute("data-event-name") ?? "click";
      const params: EventParams = {
        element_type: isLink ? "link" : "button",
        label: deriveLabel(el),
      };

      if (isLink) {
        const href = (el as HTMLAnchorElement).getAttribute("href");
        const { kind, host } = classifyLink(href);
        params.href = href ?? "";
        params.link_kind = kind;
        params.link_host = host;
        params.is_outbound = kind !== "internal";
      }

      trackEvent(name, params);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
