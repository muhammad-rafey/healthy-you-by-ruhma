"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  GA_ID,
  getConsent,
  getConsentServerSnapshot,
  setConsent,
  subscribeConsent,
} from "@/lib/analytics";

export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getConsentServerSnapshot);

  if (!GA_ID || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="bg-paper border-ink/10 fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-2xl flex-col gap-4 border px-5 py-4 shadow-lg md:flex-row md:items-center md:gap-6 md:px-6"
    >
      <p className="text-ink-soft text-[14px] leading-[1.55]">
        We use Google Analytics cookies to understand how visitors use the site so we can improve
        it. Nothing is shared with advertisers. See our{" "}
        <Link
          href="/legal/privacy"
          className="text-mauve hover:text-mauve-deep underline underline-offset-4"
        >
          privacy policy
        </Link>
        .
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
          Decline
        </Button>
        <Button variant="default" size="sm" onClick={() => setConsent("granted")}>
          Accept
        </Button>
      </div>
    </div>
  );
}
