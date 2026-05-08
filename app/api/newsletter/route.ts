import { NextResponse } from "next/server";

// TODO(phase-6): Wire to real newsletter provider (Buttondown / Resend Audiences).
// Until then, the form posts here and gets a 202 so dev never 404s.
export async function POST() {
  return NextResponse.json(
    { ok: true, message: "Subscription pending — wiring scheduled for Phase 6." },
    { status: 202 },
  );
}
