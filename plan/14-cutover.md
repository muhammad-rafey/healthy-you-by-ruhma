# Plan 14 — Production Cutover

> **This is an SRE runbook, not a feature plan.** It is meant to be executed top-to-bottom on cutover day with a printed copy beside the laptop. Every command is given absolute. Every "press the button" step is given an exact UI path. Every "wait" has a bound. If anything in the **Pre-cutover checklist** is red, the cutover does not happen — full stop.

---

## 1. Goal

Swap `dietitianruhma.com` (apex + `www`) from the current Hostinger-hosted WordPress + Elementor + WooCommerce site to the Vercel-hosted Next.js redesign produced by Plans 00–13, with:

- Zero data loss (WP DB and `wp-content/` archived offline before retirement).
- A measured, reversible DNS change.
- All 18 legacy URLs serving 308 redirects to the new IA on the first request after propagation.
- Search Console transitioning indexed URLs old → new with no crawl-error spike.
- Email (Resend), analytics (Plausible), and external ebook checkout (Gumroad/Lemon Squeezy/etc.) all live and verified within the first 60 minutes after DNS flips.
- Week-1 traffic dip ≤ 10% per master plan §9.

The cutover itself is a ~30-minute change window, framed by a 1–2 day TTL pre-stage, a 24-hour intensive monitoring tail, and a 30-day Hostinger account retirement. The whole envelope is two weeks calendar time, but the irreversible window is roughly 30 minutes.

---

## 2. Pre-requisites

All of the following prior plans must be **complete, merged to `main`, and deployed to Vercel preview** before this plan begins:

| Plan | Title                 | Done means                                                                                                     |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| 00   | Setup                 | Repo `muhammad-rafey/healthy-you-by-ruhma` exists, Vercel project linked, `main` builds.                       |
| 01   | Design system         | Tokens, fonts, motion utilities, `/_kit` route ships.                                                          |
| 02   | Layout shell          | Nav + Footer + redirects in `next.config.ts` + `robots.ts` + `sitemap.ts`.                                     |
| 03   | Home                  | `/` ships with hero + "nourish" moment + pillars + featured ebook + testimonials + CTA.                        |
| 04   | About                 | `/about` ships with mauve numerals philosophy section.                                                         |
| 05   | Services              | `/services` ships with editorial numbered cards.                                                               |
| 06   | Programs (×3)         | `/programs/diet-planning`, `/programs/coaching`, `/programs/consultation` ship.                                |
| 07   | Focus (×2)            | `/focus/hormonal-health`, `/focus/weight-management` ship.                                                     |
| 08   | Library               | `/library` index + `/library/[slug]` detail with `buyUrl` external link-out.                                   |
| 09   | Journal               | `/journal` index + `/journal/[slug]` template (placeholder content acceptable).                                |
| 10   | Contact               | `/contact` server-action form posting to Resend.                                                               |
| 11   | Legal                 | `/legal/privacy`, `/legal/terms`, `/legal/refunds`.                                                            |
| 12   | SEO + OG              | `next-sitemap`, JSON-LD, `@vercel/og` dynamic OG, per-page metadata.                                           |
| 13   | Polish + Verification | `scripts/check-redirects.ts` green for all 18 redirects on preview. Lighthouse 95+ on every route. axe-core 0. |

If any row is not green, **stop**.

### Data inputs that must be confirmed by Dr. Ruhma before scheduling

The cutover **does not start** until these are written into the repo and shipped on `main`:

- [ ] **Real ebook `buyUrl`s** for all 3 ebooks (`content/library/diabetes-essentials.mdx`, `pcos-guidebook.mdx`, `skin-secrets.mdx`). Each must resolve to a working external checkout (Gumroad / Lemon Squeezy / Amazon KDP / Stripe payment link). Verify each one in an incognito tab from a non-VPN connection — confirm the price displays in PKR or with a clear conversion, and that the page doesn't 404 or require login.
- [ ] **Real WhatsApp handle** (full international format, e.g., `+92 3XX XXXXXXX`) wired into `content/site.ts` and `/contact`. Click-test on mobile that `wa.me/<number>` opens WhatsApp.
- [ ] **Real Instagram handle** confirmed (currently presumed `@dietitianruhma`; verify by visiting). Wired into footer + `/contact`.
- [ ] **Real testimonial copy**: minimum 3 quotes for the Home testimonials grid (each: ≥ 12 words, attribution name + 1-line context), 2 quotes for `/programs/diet-planning`, 2 quotes for `/programs/coaching`. If real ones are not yet collected, the page must visibly omit the testimonial section (not show placeholders) — see master §9 "Content fidelity."
- [ ] **Resend domain verified**: `mail.dietitianruhma.com` (or whichever sending subdomain we register) shows "Verified" in Resend dashboard, with SPF/DKIM/DMARC records published at the registrar. Send one real test from `/contact` form on the preview deploy and confirm it arrives in the inbox `m.rafey659@gmail.com` (or Dr. Ruhma's chosen inbox).
- [ ] **Plausible site added**: `dietitianruhma.com` exists in the Plausible account, the snippet is in `app/layout.tsx`, and a manual click on the preview deploy registers in the Plausible Realtime view within 30 seconds.
- [ ] **Backup of the current Hostinger DB** is fresh. The existing `/home/duh/Documents/website backup (1)/database.sql` is the Backuply snapshot. If the live site has changed since (new orders, new posts, or the contact form has captured new submissions), pull a fresh dump from Hostinger's cPanel → phpMyAdmin → Export, and overwrite. Until cutover, the live WP is still the source of truth, so do this re-dump as close to T-0 as practical (T-2 hours is ideal).

### Final pre-flight (run T-30 min on cutover day)

```bash
# from repo root, on main
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
pnpm tsx scripts/check-redirects.ts --base https://<preview-or-current-vercel-domain>.vercel.app
pnpm tsx scripts/post-cutover-smoke.ts --base https://<preview-or-current-vercel-domain>.vercel.app
```

All four must exit 0. The smoke script is permitted to run against the Vercel preview URL (not the production domain) at this stage — it will be re-run against the production domain after DNS flips.

---

## 3. Dependencies

Operational only — **no new code dependencies introduced by this plan**. Inputs needed:

- Registrar / DNS provider login for `dietitianruhma.com` (likely Hostinger's panel; confirm with Dr. Ruhma which registrar holds the domain — Hostinger may be the registrar, may be a reseller of Namecheap/GoDaddy, or the domain may be parked elsewhere).
- Vercel team/project access (to attach the domain).
- Hostinger cPanel/hPanel access (to put the WP site into maintenance mode without deleting it).
- Resend dashboard access (to flip the verified sending domain from preview → production).
- Plausible dashboard access.
- Google Search Console verified property for `dietitianruhma.com` (verify ownership now if not already; DNS-TXT verification will survive the registrar change as long as we preserve the TXT record during the cutover).
- A second device on a different network (mobile data, not the home Wi-Fi) for independent DNS resolution checks.

---

## 4. Files to create / modify

### New files

#### `CUTOVER_RUNBOOK.md` (repo root)

A trimmed, command-only mirror of this plan, kept at the repo root so the operator can `cat CUTOVER_RUNBOOK.md` on cutover day without leaving the terminal. Must contain:

- The **Cutover step-by-step** section verbatim (§5 below) with timestamps.
- The **Rollback** section verbatim (§7 below).
- The **Monitoring** checklists for first-24h and week-1 (§6 below).
- A "Last verified prior values" block left blank, to be filled in **at T-1 hour** with the current Hostinger A record IP, AAAA (if any), `www` CNAME target, MX records, and TXT records. This block is the rollback target.

The full plan rationale stays here in `plan/14-cutover.md`; `CUTOVER_RUNBOOK.md` is the operational excerpt.

#### `scripts/post-cutover-smoke.ts`

Hits 10 routes on a configurable base URL, asserts HTTP 200 and the presence of an expected text snippet on each. Runs in CI on every PR against the Vercel preview, runs by hand against `https://dietitianruhma.com` immediately after DNS flips, and again at T+1h, T+6h, T+24h.

```ts
// scripts/post-cutover-smoke.ts
// usage: pnpm tsx scripts/post-cutover-smoke.ts --base https://dietitianruhma.com
import { parseArgs } from "node:util";

type Check = { path: string; expect: string; name: string };

const CHECKS: Check[] = [
  { name: "Home", path: "/", expect: "nourish" },
  { name: "About", path: "/about", expect: "Dr. Ruhma" },
  { name: "Services", path: "/services", expect: "Program 01" },
  { name: "Diet Planning", path: "/programs/diet-planning", expect: "Sample week" },
  { name: "Coaching", path: "/programs/coaching", expect: "8 weeks" },
  { name: "Consultation", path: "/programs/consultation", expect: "consultation" },
  { name: "Hormonal", path: "/focus/hormonal-health", expect: "hormones" },
  { name: "Library", path: "/library", expect: "The Library" },
  { name: "PCOS Guidebook", path: "/library/pcos-guidebook", expect: "Guidebook" },
  { name: "Contact", path: "/contact", expect: "Let" }, // matches "Let's talk"
];

const { values } = parseArgs({
  options: {
    base: { type: "string" },
    timeout: { type: "string", default: "10000" },
  },
});

const base = (values.base ?? "").replace(/\/$/, "");
if (!base) {
  console.error("--base required (e.g. --base https://dietitianruhma.com)");
  process.exit(2);
}
const timeoutMs = Number(values.timeout);

let failed = 0;
for (const c of CHECKS) {
  const url = `${base}${c.path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    const body = await res.text();
    const okStatus = res.status === 200;
    const okBody = body.toLowerCase().includes(c.expect.toLowerCase());
    if (okStatus && okBody) {
      console.log(`OK   ${c.name.padEnd(16)} ${url}`);
    } else {
      failed++;
      console.error(`FAIL ${c.name.padEnd(16)} ${url} status=${res.status} bodyMatch=${okBody}`);
    }
  } catch (e) {
    failed++;
    console.error(`FAIL ${c.name.padEnd(16)} ${url} error=${(e as Error).message}`);
  } finally {
    clearTimeout(t);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${CHECKS.length} checks failed`);
  process.exit(1);
}
console.log(`\nAll ${CHECKS.length} checks passed against ${base}`);
```

Add an npm script in `package.json`:

```json
{
  "scripts": {
    "smoke": "tsx scripts/post-cutover-smoke.ts"
  }
}
```

### Files to modify

- `README.md` — add a `## Production cutover` section linking to `CUTOVER_RUNBOOK.md`.
- `next.config.ts` — confirm (do not add) that `redirects()` returns the 18-entry array from master §6 with `permanent: true` (which yields HTTP 308 in Next 15). The test `pnpm tsx scripts/check-redirects.ts` from Plan 13 must already be passing.

No source code changes specific to cutover are required — the Next.js app is host-agnostic; the cutover is a DNS + monitoring exercise.

---

## 5. Step-by-step tasks

All times are wall-clock relative to **T-0**, the moment the DNS A record at the registrar is changed to Vercel's IP. Cutover day is scheduled for a **Tuesday or Wednesday morning Pakistan time (UTC+5)** — weekday-quiet hours with the registrar's support staff awake, and avoiding Friday so we have working days to react to issues.

### T-7 days — Schedule and announce internally

- Confirm cutover date with Dr. Ruhma. Calendar block 4 hours: 1 hour pre-flight, 30 min cutover, 2.5 hour active monitoring tail.
- Confirm she is available by phone/WhatsApp during the window for go/no-go decisions on rollback.
- Send the Pre-cutover checklist (§2) as a PDF / shared doc to her with each box checked off.
- Create the Communication assets (§10) so they're ready to schedule.

### T-2 days — Lower DNS TTLs (the "pre-stage")

This is the single most-skipped step in DNS migrations and the one that determines whether a rollback is 5 minutes or 24 hours. Do not skip.

1. Log in to the registrar/DNS provider for `dietitianruhma.com`.
2. For each existing record on the apex and `www`, change TTL from its current value (typically 3600s or 14400s on Hostinger) to **300s**:
   - `dietitianruhma.com` A record (→ Hostinger IP) — TTL 300
   - `dietitianruhma.com` AAAA record if present — TTL 300
   - `www.dietitianruhma.com` CNAME or A record — TTL 300
   - **Do not** lower TTL on MX, TXT (SPF/DKIM/DMARC), or unrelated subdomains. Email continuity is independent of the website cutover; we touch only web records.
3. Note the **previous TTL** in `CUTOVER_RUNBOOK.md` "Last verified prior values" block.
4. Wait. The lowered TTL only takes effect after the _previous_ TTL has expired in resolvers worldwide. If the old TTL was 14400s (4h), the lower TTL is fully effective at T-2 days minus 4 hours — i.e., comfortably before T-0. If it was higher (24h), bring this step forward to T-3 days.
5. Verify from a clean resolver that the lowered TTL has propagated:
   ```bash
   dig +short dietitianruhma.com A @1.1.1.1
   dig dietitianruhma.com A @1.1.1.1 | grep -E "^dietitianruhma\.com"
   # second line shows TTL — should be < 300 once propagated
   ```

### T-1 day — Stage the Vercel domain

The domain can be attached to the Vercel project **before** the DNS change. Vercel will show "Invalid Configuration" until the records point at it; that is expected and harmless.

1. Vercel dashboard → project `healthy-you-by-ruhma` → Settings → Domains.
2. Add `dietitianruhma.com`. Vercel will show two options:
   - **A record** for the apex, pointing at `76.76.21.21` (Vercel's anycast IP — confirm the exact IP shown by Vercel at the time, do not hard-code from this plan).
   - Or **nameserver delegation** to Vercel — **do not pick this**. We're keeping DNS at the current registrar so non-web records (MX, TXT) stay untouched.
3. Add `www.dietitianruhma.com`. Vercel will say to point it at `cname.vercel-dns.com` via CNAME.
4. Vercel will also auto-set `www` as a redirect to apex (or vice versa, configurable). **Decision: apex is canonical, `www` 308-redirects to apex.** This matches the redirect table in master §6.
5. Record the Vercel-assigned A record IP in `CUTOVER_RUNBOOK.md`. This is the value we'll write at the registrar at T-0.
6. Leave the domain in "Invalid Configuration" state in Vercel — that's expected until DNS is repointed.

### T-2 hours — Final WP backup

```bash
# pull a fresh DB dump from Hostinger
# preferred: Hostinger hPanel → Databases → phpMyAdmin → select wp DB → Export → SQL → Save
# copy to: /home/duh/Documents/website backup (1)/database.sql
# verify size > 50 MB and contains a recent wp_posts entry
```

The existing `database.sql` in the local backup folder is the Backuply snapshot from when the project started. If WooCommerce orders, contact form submissions, or new posts have happened since, this fresh dump captures them. After the cutover the WP DB is frozen forever; this is the last write.

Also, snapshot the live `wp-content/uploads/` if it's been growing. Run this from a Hostinger SSH or use their File Manager → Compress → Download. (Skip if confirmed unchanged since the original snapshot.)

### T-30 min — Pre-flight (last checks)

1. From the repo root on `main`:
   ```bash
   git pull --ff-only
   pnpm install --frozen-lockfile
   pnpm build
   ```
2. In Vercel dashboard, confirm the production deployment matches the latest `main` commit SHA. Re-deploy if not.
3. From the repo root:
   ```bash
   # against the Vercel preview URL (not the prod domain — that's still WP)
   pnpm tsx scripts/check-redirects.ts --base https://healthy-you-by-ruhma-<branch>.vercel.app
   pnpm smoke -- --base https://healthy-you-by-ruhma-<branch>.vercel.app
   ```
4. Independently verify each of the 18 redirects with `curl -I` against the preview deploy:
   ```bash
   curl -sI https://<preview>.vercel.app/about-me | grep -E "^(HTTP|location)"
   # expect HTTP/2 308 and location: /about
   ```
5. Open the registrar DNS panel in the browser and have it ready.
6. Open Vercel project → Domains in another tab.
7. Open Plausible Realtime in another tab.
8. Open Resend dashboard in another tab.
9. Have a terminal with `dig +short dietitianruhma.com @1.1.1.1` ready for spam-firing.
10. Announce in WhatsApp to Dr. Ruhma: "Going at T-0 in 30 min. Will text when site is live."

### T-0 — DNS flip

1. **Note the current values** at the registrar in `CUTOVER_RUNBOOK.md` "Last verified prior values":
   - `dietitianruhma.com` A → `<Hostinger IP, e.g., 145.14.158.xxx>`
   - `dietitianruhma.com` AAAA → `<value or none>`
   - `www.dietitianruhma.com` CNAME → `<value, possibly dietitianruhma.com>`
   - TTL → `300` (already lowered)
2. **Edit the apex A record**: change value to the Vercel-assigned IP. Keep TTL at 300.
3. **Edit the `www` record**: change to a CNAME pointing at `cname.vercel-dns.com`. If the registrar disallows CNAME on `www` (rare; some require A record at `www`), use the same Vercel apex IP as an A record instead. Keep TTL at 300.
4. **Save**.
5. Mark T-0 in `CUTOVER_RUNBOOK.md` with the actual UTC timestamp.

### T+1 min to T+10 min — Watch SSL provision

1. In the Vercel Domains panel, both domains will tick from "Invalid Configuration" → "Verifying" → "Valid Configuration" → SSL certificate issued.
2. Typical: 1–5 min. Outliers: up to 30 min if Let's Encrypt is rate-limited.
3. From your terminal (every ~30s):
   ```bash
   dig +short dietitianruhma.com @1.1.1.1
   dig +short www.dietitianruhma.com @1.1.1.1
   ```
   Wait until the apex resolves to the new Vercel IP.
4. Once Vercel shows green "Valid Configuration":
   ```bash
   curl -sI https://dietitianruhma.com/ | head -5
   curl -sI https://www.dietitianruhma.com/ | head -5
   ```
   Expect HTTP/2 200 on apex and HTTP/2 308 with `location: https://dietitianruhma.com/` on `www`.

### T+10 min — Smoke + redirect verification on production domain

```bash
pnpm smoke -- --base https://dietitianruhma.com
pnpm tsx scripts/check-redirects.ts --base https://dietitianruhma.com
```

Both must exit 0. If either fails, jump to the **Rollback** section (§7).

Also manually click through:

- Home → "Book a consultation" CTA
- `/library/pcos-guidebook` → "Buy on [Platform] →" external link (verify it lands on the right product page on the external store; do not buy)
- `/contact` → submit a real message (use a "TEST <timestamp>" prefix). Verify it arrives in the inbox via Resend within 60 seconds.

### T+15 min — SEO

1. Google Search Console → property `https://dietitianruhma.com` → Sitemaps → Submit `https://dietitianruhma.com/sitemap.xml`. Confirm it parses with no errors and shows the expected URL count (~16).
2. Use the URL Inspection tool on 3 sample old URLs:
   - `https://dietitianruhma.com/about-me` → "URL is not on Google" (expected) and "Live test" → fetch shows 308 → `/about` and the new page renders.
   - `https://dietitianruhma.com/shop` → 308 → `/library`.
   - `https://dietitianruhma.com/diet-plannig-program` → 308 → `/programs/diet-planning`.
3. Request indexing for the 5 hero pages: `/`, `/about`, `/services`, `/programs/diet-planning`, `/library`.

### T+20 min — Hostinger maintenance mode

The Hostinger WP site is now unreachable for end users (DNS now points at Vercel) but is still live for anyone with the IP or a stale cache. **Do not delete the Hostinger site yet.** We keep it for 24 hours as a rollback target.

1. Log in to Hostinger hPanel → Websites → `dietitianruhma.com` → File Manager → `public_html/`.
2. Rename `index.php` to `index.php.preserved` (so direct hits don't bootstrap WP).
3. Upload a `index.html` with the contents:
   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <meta name="robots" content="noindex" />
       <title>Healthy You By Ruhma</title>
       <style>
         body {
           font-family: system-ui;
           background: #f4f0ee;
           color: #1a1a1a;
           display: flex;
           min-height: 100vh;
           align-items: center;
           justify-content: center;
           padding: 2rem;
           text-align: center;
         }
       </style>
     </head>
     <body>
       <main>
         <h1>We've moved.</h1>
         <p>Visit <a href="https://dietitianruhma.com">dietitianruhma.com</a>.</p>
       </main>
     </body>
   </html>
   ```
4. The Hostinger LiteSpeed will serve this for any direct-IP hits or stale-cache visitors. The DB and `wp-content` remain untouched on disk.

### T+30 min — Cutover window closes

Notify Dr. Ruhma: "Site is live on the new platform. Old links redirect. Monitoring for 24 hours, then full retirement of the old hosting in 7 days."

Schedule the IG / email announcement (§10) for **T+2 hours**, after we're confident there are no smoke-test failures. We don't drive a traffic spike at the new site until we've watched it idle-warm for at least 90 minutes.

---

## 6. Monitoring

### First 24 hours

Active watch every 30 minutes for the first 4 hours, hourly for hours 4–12, and a check at the 24-hour mark.

| Source                            | What to watch                                  | Alarm threshold                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel Logs (project → Logs)      | 5xx errors, function errors, build errors      | Any 5xx → investigate immediately. Vercel sends email on hard failure; configure alerts to `m.rafey659@gmail.com`.                                                                                 |
| Vercel Logs                       | Cold-start latency on RSC routes               | TTFB > 1.5s for > 5% of requests → look at MDX render cost or image optimization queue.                                                                                                            |
| Plausible Realtime                | Steady traffic flow                            | Zero events for > 15 min during PK working hours → snippet broken. Steady but lower than baseline → DNS still propagating, expected.                                                               |
| Plausible — last 24h              | Traffic vs. previous Tuesday/Wednesday         | Dip 5–15% expected from DNS propagation tail. Dip > 25% → escalate, investigate redirects and indexing.                                                                                            |
| Search Console — Crawl stats      | Crawl request count and response codes         | Spike in 4xx/5xx → check redirects. Spike in 308 is **good** — that's old URLs being recrawled and learning the new mapping.                                                                       |
| Search Console — Indexing → Pages | "Page with redirect" count rising              | Healthy: count grows for old URLs. Unhealthy: any old URL appears under "Not found (404)" — means a redirect is missing or wrong.                                                                  |
| Resend dashboard                  | Contact form deliveries                        | Submit one test/hour from `/contact`. Each must arrive. If a delivery fails, check sending domain DNS still resolves SPF/DKIM.                                                                     |
| Plausible — Goals                 | `Library / Buy / <slug>` outbound click events | At least one click on each ebook within 24h is a healthy signal that the external flow is being used. Zero clicks for 48h on all 3 → check the buttons render and the `target="_blank"` is intact. |

Re-run smoke at T+1h, T+6h, T+24h:

```bash
pnpm smoke -- --base https://dietitianruhma.com
pnpm tsx scripts/check-redirects.ts --base https://dietitianruhma.com
```

### Week 1

Daily check (10 min, end of working day Pakistan time):

- Search Console → **Indexing → Pages**: track the transition. Old URLs should move from "Indexed" → "Page with redirect" within 3–7 days. New URLs should appear under "Indexed" within 1–7 days. If a new URL hasn't been crawled by day 5, request indexing manually.
- Search Console → **Performance → Search results**: compare 7-day average impressions and clicks to the prior 7-day average. **Target: ≤10% dip** (master §9). If dip > 15% by day 7, dig into Coverage report for missed redirects.
- Plausible → **Top Sources**: confirm referrers haven't collapsed (a referrer collapse = social/email links broken).
- Plausible → **Top Pages**: the URL distribution should look like the IA — `/`, `/about`, `/library`, programs. If `/shop` or `/about-me` show traffic > 0, the redirect is working (Plausible records the original requested URL in some configurations) — verify via Search Console that the _crawled_ version is the redirected one.
- Resend → **Logs**: weekly delivery rate ≥ 99%. Bounces on contact form submissions = either user typo'd their email (fine) or the from/reply-to domain has a DKIM regression (urgent).
- Vercel → **Web Analytics → Web Vitals**: real-user LCP < 2.0s on the homepage on the 75th percentile per master §9.

### Synthetic uptime (optional but recommended)

Set up free-tier UptimeRobot or BetterStack on `https://dietitianruhma.com/` and `https://dietitianruhma.com/library/pcos-guidebook` (the highest-value conversion page) at 5-minute interval. Alert email + WhatsApp.

---

## 7. Rollback

The rollback target is the **prior Hostinger configuration**, which is preserved at T-0 in `CUTOVER_RUNBOOK.md` "Last verified prior values" and on disk at `/home/duh/Documents/website backup (1)/`.

### When to roll back

- Vercel deploy is non-functional (5xx on `/`, can't be hot-fixed within 15 min).
- A critical regression is discovered post-cutover (e.g., contact form silently dropping submissions, all ebook `buyUrl`s 404, navigation broken on mobile).
- SSL certificate fails to provision after 30 minutes.
- Search Console flags a structural problem (e.g., wholesale `noindex` shipped accidentally).

### When NOT to roll back

- Traffic dip in the first 6 hours — that's DNS propagation, not a problem.
- A single redirect missing — fix forward by adding it to `next.config.ts` and redeploying; this is a 5-minute fix, not a rollback case.
- A typo on the new site — fix forward.
- Plausible numbers look weird in the first hour — Plausible buffers; re-check at T+2h.

### How to roll back

1. **Revert the DNS A record** at the registrar to the Hostinger IP recorded in `CUTOVER_RUNBOOK.md`.
2. **Revert the `www` CNAME/A record** to its prior value.
3. Keep TTL at 300 — we may need to flip again.
4. On Hostinger File Manager → `public_html/`: rename `index.html` → `index.html.maintenance`, rename `index.php.preserved` → `index.php`. WP is live again.
5. Verify in 5–10 minutes:
   ```bash
   dig +short dietitianruhma.com @1.1.1.1   # should show Hostinger IP
   curl -sI https://dietitianruhma.com/      # should be the WP site, 200
   ```
6. Notify Dr. Ruhma: "Rolled back to old site. Investigating."
7. In Vercel, leave the domain attached but don't worry about the "Invalid Configuration" state.
8. Open a Sev-1 issue in the GitHub repo describing the problem, gather evidence, and re-attempt cutover only after the root cause is fixed and re-verified on preview.

The full propagation of the rollback is bounded by the 300s TTL we pre-staged, so within 10 minutes worldwide. The 24-hour Hostinger maintenance-mode page catches anyone whose resolver is even slower.

---

## 8. WP backup retirement

Only execute these steps **after**:

- 7 calendar days have elapsed since cutover.
- Search Console shows old URLs cleanly transitioning to redirects (no 404 spikes).
- No critical bugs were filed in the past 7 days.
- Dr. Ruhma signs off on retirement.

### Day +7 — Final archive

1. Take a final fresh `database.sql` dump from the local Docker WP (which has been the development/reference copy):
   ```bash
   cd "/home/duh/Documents/website backup (1)/_local"
   sudo docker compose up -d
   # wait 10s for DB to be ready
   sudo docker exec dietitianruhma-local-db-1 \
     mariadb-dump -uroot -proot wordpress \
     > "/home/duh/Documents/website backup (1)/database.final.sql"
   sudo docker compose down
   ```
2. Verify the dump:
   ```bash
   ls -lh "/home/duh/Documents/website backup (1)/database.final.sql"
   # expect ~50–60 MB
   head -5 "/home/duh/Documents/website backup (1)/database.final.sql"
   # expect MySQL dump headers
   ```

### Day +7 — Drop the local Docker volume

```bash
cd "/home/duh/Documents/website backup (1)/_local"
sudo docker compose down -v   # destructive: drops the DB volume. Intentional.
```

This is the operation called out in master §8 Phase 7. The DB content is preserved in `database.final.sql`, so this `down -v` only frees the local docker volume.

### Day +7 — Tar the snapshot directory

```bash
cd /home/duh/Documents
tar -czf "healthy-you-by-ruhma-wp-archive-$(date +%Y%m%d).tar.gz" "website backup (1)"
# move outside the dev tree
mv "healthy-you-by-ruhma-wp-archive-$(date +%Y%m%d).tar.gz" ~/Archives/
ls -lh ~/Archives/healthy-you-by-ruhma-wp-archive-*.tar.gz
```

Optionally upload the tarball to a private cloud bucket (Backblaze B2 / Google Drive personal). **Do not** push to the GitHub repo — it contains PII (orders, comments, secrets in `wp_options`).

### Day +30 — Cancel Hostinger hosting

After 30 days of stable operation:

- Hostinger hPanel → Hosting → cancel the WP plan for `dietitianruhma.com`.
- Confirm the **domain registration** stays separate. If Hostinger is also the registrar, do not let the domain expire — transfer to a registrar of choice (Cloudflare Registrar is the cheapest) before the renewal date, **or** keep just the registrar bill (typically $10–15/yr) on Hostinger.
- Email DNS continuity: the MX records still point at Hostinger's mail servers (or wherever email is hosted) — confirm this with Dr. Ruhma. If Hostinger's hosting cancellation also cuts off email, set up Google Workspace / Zoho Mail before cancellation.

### What gets deleted vs. archived

| Asset                                     | Action                                       | Where it ends up                                           |
| ----------------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| Live Hostinger WP files                   | Delete (after archive verified)              | Gone                                                       |
| Live Hostinger WP DB                      | Dumped to `database.final.sql` before delete | `~/Archives/healthy-you-by-ruhma-wp-archive-<date>.tar.gz` |
| Local Docker stack                        | `docker compose down -v`                     | Volume gone; compose file preserved in archive tarball     |
| `/home/duh/Documents/website backup (1)/` | Tar + move to `~/Archives/`                  | Archive tarball                                            |
| Domain `dietitianruhma.com`               | Keep                                         | Renew at registrar                                         |
| MX records                                | Keep                                         | Don't touch unless email is moving                         |
| Vercel project                            | Keep                                         | Live                                                       |

---

## 9. Post-launch backlog

Tracked separately, **not blocking cutover**. Promote to plans 15+ when ready:

- **Real journal posts** — currently 2 placeholders; commission Dr. Ruhma to write 4–6 evergreen posts (PCOS basics, weight management myths, sample meal planning) over the first month. The `/journal` IA is built; it just needs MDX entries dropped into `content/journal/`.
- **Newsletter wiring** — decision pending: Buttondown ($9/mo, content-creator-friendly, simple) vs. Resend Audiences (free with our existing Resend account, more developer-DIY). Recommend **Buttondown** for editorial cadence; revisit if open rates are weak.
- **Real testimonial collection** — currently placeholders or omitted. Set up a simple intake (Google Form or just WhatsApp) for clients post-program. Aim for 8–12 written testimonials in the first 90 days, rotated across Home / programs.
- **Sentry / error tracking** — Vercel Logs covers most cases for a marketing site, but Sentry's free tier (5K events/mo) catches client-side errors we'd otherwise miss. Add when the first weird bug surfaces.
- **Structured-data refinements** — once Search Console accumulates 30 days of data, look at the Enhancements report. Add `Recipe`, `FAQPage`, `Article` JSON-LD where the data exists.
- **Ebook bundle / cross-sell** — once external store pricing is finalized, consider a bundle landing page at `/library/bundle` linking to a multi-ebook checkout.
- **Booking widget on `/programs/consultation`** — currently a link to email/WhatsApp. Wire Cal.com or Calendly when Dr. Ruhma's account is set up.
- **Multilingual (Urdu)** — defer indefinitely; brand audience is English-comfortable. If demanded, App Router has clean i18n primitives.

---

## 10. Communication checklist

### Day-of announcement asset (single page, schedule for T+2h)

- **Instagram post** — square 1080×1080, brand cream background, "We've redesigned." Epilogue 96px headline, 2-line body in Inter, CTA "Visit dietitianruhma.com" in mauve. Caption: 3–5 sentences personal note from Dr. Ruhma — what's new, what's the same (her care, her programs), an invite to explore. Post + Story.
- **Email blast** — if the existing WP site has a MailPoet/Mailchimp list, export it now and send via Buttondown (set it up ahead of time) or one-shot via Resend Broadcasts. Subject: "A new home for Healthy You By Ruhma". Body: ~150 words, link to home.
- **WhatsApp Status** — same image as IG post, posted to Dr. Ruhma's status. 1-line caption.

### Pre-write the messages now (T-7d)

- Draft the IG caption.
- Draft the email body.
- Schedule the IG post for T+2h via Meta Business Suite (or send Dr. Ruhma the asset and have her post manually at the agreed time).
- Schedule the email for T+3h (after IG, so the timing reads "saw on IG → got the email → already at the new site").

### Don't do at cutover

- **Don't** announce on cutover day morning to "drum up traffic." We want the site to bake idle for 90 minutes first. Premature traffic spike during DNS propagation = some users land on Hostinger, some on Vercel, and the inconsistency erodes trust.
- **Don't** post in industry / medical / professional groups at launch. That comes after week 1 is clean.

---

## 11. Acceptance criteria

The cutover is **complete and accepted** when all of the following are true:

- [ ] `https://dietitianruhma.com/` returns HTTP 200 and renders the new Next.js home page (visible: "nourish" moment).
- [ ] `https://www.dietitianruhma.com/` returns HTTP 308 to `https://dietitianruhma.com/`.
- [ ] All 18 redirects in master §6 return HTTP 308 to the correct target, verified by `pnpm tsx scripts/check-redirects.ts --base https://dietitianruhma.com`.
- [ ] `pnpm smoke -- --base https://dietitianruhma.com` passes 10/10.
- [ ] SSL: A+ on SSL Labs (https://www.ssllabs.com/ssltest/analyze.html?d=dietitianruhma.com), no mixed-content warnings.
- [ ] Vercel Logs: zero unexplained 5xx in the first 24 hours.
- [ ] Plausible: traffic registering in Realtime; 24-hour count within 25% of prior baseline (DNS propagation tail accounts for the rest).
- [ ] Search Console: sitemap submitted, parsed without errors. No spike in 4xx/5xx in Crawl Stats. At least 5 new URLs indexed within 7 days.
- [ ] Resend: at least one real contact form submission delivered to inbox.
- [ ] Plausible Goals: at least one outbound `Library / Buy / <slug>` event registered within 7 days (confirms external store flow used).
- [ ] **Week-1 traffic dip ≤ 10%** vs. equivalent prior 7-day window in Search Console (master §9 target).
- [ ] Dr. Ruhma has clicked through every page on her own device and signed off.

When all rows are checked: the cutover is closed. Move to **§8 WP backup retirement** at Day +7, and to **§9 Post-launch backlog** for plans 15+.

---

## 12. Out of scope

Explicitly **not part of this plan**:

- Any Next.js feature work, copy edits, design tweaks. These ship as normal PRs after cutover.
- Newsletter integration build-out (deferred — see §9).
- Real journal post authoring (deferred — see §9).
- Testimonial intake automation (deferred — see §9).
- Sentry / structured monitoring beyond Vercel Logs + Plausible (deferred — see §9).
- Multi-language support.
- E-commerce (still external link-out per master §7 decision 1).
- Email server changes — MX records left alone unless Dr. Ruhma's email host is also moving (not in scope here).
- Domain transfer to a different registrar (post-launch backlog if at all).
- Google Workspace / Zoho Mail setup if Hostinger email is being canceled — handle as a separate, dedicated runbook.
- Performance optimization beyond what Plan 13 already verified (Lighthouse 95+, LCP < 2.0s). Real-user issues that emerge get filed as bugs, not chased preemptively.
- Backups of the _new_ Vercel/Next.js site beyond the GitHub repo itself. The MDX content lives in git; that is the backup. The contact form persists nothing on disk (Resend delivers and forgets); there is no DB to back up.

---

## Appendix A — Useful one-liners

```bash
# DNS sanity
dig +short dietitianruhma.com @1.1.1.1
dig +short dietitianruhma.com @8.8.8.8
dig +short www.dietitianruhma.com @1.1.1.1
dig +short www.dietitianruhma.com @8.8.8.8
# multi-resolver (Linux)
for r in 1.1.1.1 8.8.8.8 9.9.9.9 208.67.222.222; do
  echo "$r => $(dig +short dietitianruhma.com @$r)"
done

# HTTP sanity
curl -sI https://dietitianruhma.com/ | head -10
curl -sI https://www.dietitianruhma.com/ | head -5
curl -sI https://dietitianruhma.com/about-me | grep -i location

# Cert
echo | openssl s_client -servername dietitianruhma.com -connect dietitianruhma.com:443 2>/dev/null \
  | openssl x509 -noout -dates -issuer -subject

# Smoke + redirects
pnpm smoke -- --base https://dietitianruhma.com
pnpm tsx scripts/check-redirects.ts --base https://dietitianruhma.com
```

## Appendix B — Decision log (fill during cutover)

| Time (UTC) | Event                              | Decision / Action    | Operator |
| ---------- | ---------------------------------- | -------------------- | -------- |
|            | TTL lowered at registrar           | Saved with TTL=300   |          |
|            | Domain attached on Vercel          | apex + www added     |          |
|            | T-0 DNS flip                       | A record → Vercel IP |          |
|            | SSL provisioned                    | Vercel green         |          |
|            | Smoke passed                       | 10/10                |          |
|            | Redirects passed                   | 18/18                |          |
|            | Sitemap submitted to GSC           |                      |          |
|            | Hostinger maintenance page up      |                      |          |
|            | T+1h smoke                         |                      |          |
|            | T+24h smoke                        |                      |          |
|            | Day +7 archive completed           |                      |          |
|            | Day +30 Hostinger hosting canceled |                      |          |
