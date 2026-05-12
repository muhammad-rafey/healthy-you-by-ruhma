import { sendGAEvent } from "@next/third-parties/google";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const CONSENT_KEY = "hbr-ga-consent";
export const CONSENT_EVENT = "hbr-consent-change";

export type ConsentState = "granted" | "denied";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: ConsentState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getConsentServerSnapshot(): ConsentState | null {
  return null;
}

export type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (!GA_ID) return;
  if (getConsent() !== "granted") return;
  sendGAEvent("event", name, params);
}

export type LinkKind = "whatsapp" | "purchase" | "email" | "phone" | "outbound" | "internal";

export function classifyLink(href: string | null | undefined): {
  kind: LinkKind;
  host: string;
} {
  if (!href) return { kind: "internal", host: "" };
  if (href.startsWith("mailto:")) return { kind: "email", host: "" };
  if (href.startsWith("tel:")) return { kind: "phone", host: "" };
  if (href.startsWith("/") || href.startsWith("#")) return { kind: "internal", host: "" };

  let host = "";
  try {
    host = new URL(
      href,
      typeof window !== "undefined" ? window.location.origin : "http://x",
    ).hostname.toLowerCase();
  } catch {
    return { kind: "internal", host: "" };
  }

  if (typeof window !== "undefined" && host === window.location.hostname) {
    return { kind: "internal", host };
  }
  if (host === "wa.me" || host.endsWith(".whatsapp.com") || host === "whatsapp.com") {
    return { kind: "whatsapp", host };
  }
  if (host.endsWith("gumroad.com") || host.endsWith("lemonsqueezy.com")) {
    return { kind: "purchase", host };
  }
  return { kind: "outbound", host };
}
