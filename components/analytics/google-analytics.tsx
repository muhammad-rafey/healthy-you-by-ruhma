"use client";

import { useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_ID, getConsent, getConsentServerSnapshot, subscribeConsent } from "@/lib/analytics";

export function GoogleAnalyticsLoader() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getConsentServerSnapshot);

  if (!GA_ID || consent !== "granted") return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
