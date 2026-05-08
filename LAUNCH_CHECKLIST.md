# Launch Checklist — Healthy You By Ruhma

Manual steps required before/at production cutover. The codebase is at
`v0.9.0` (pre-launch); everything below is operator work outside the repo.

For the full operational runbook see `plan/14-cutover.md`.

---

## 1. Environment variables (Vercel project → Settings → Environment Variables)

```
NEXT_PUBLIC_SITE_URL = https://dietitianruhma.com
RESEND_API_KEY       = re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL     = ruhma@dietitianruhma.com   # destination inbox
CONTACT_FROM_EMAIL   = hello@mail.dietitianruhma.com
```

`NEXT_PUBLIC_SITE_URL` drives the canonical URL in `lib/seo.ts`,
`app/sitemap.ts`, and `app/robots.ts`. Without it set, sitemap/robots emit
the default placeholder.

## 2. Resend (transactional email)

1. Resend dashboard → Domains → Add `mail.dietitianruhma.com` (or chosen
   sending subdomain).
2. Publish the SPF/DKIM/DMARC TXT records at the registrar.
3. Wait for "Verified" green tick (typically 10–60 minutes).
4. Create an API key with **Sending access only**, paste into Vercel as
   `RESEND_API_KEY`.
5. Submit one real `/contact` form on the preview deploy and confirm
   delivery to `CONTACT_TO_EMAIL`.

If Resend isn't acceptable, swap providers in `app/api/contact/route.ts`
(or wherever the server action lives) — the form submission flow is the
only consumer of the API key.

## 3. Vercel project setup

1. `vercel link` (or import the repo via dashboard) to project
   `healthy-you-by-ruhma` under your team.
2. Set Production Branch = `main`.
3. Confirm `pnpm` is detected (engine pin in `package.json`).
4. First deploy → verify the preview URL renders the home page and all
   16 prerendered routes plus the dynamic OG image routes.

## 4. Analytics

Pick **one**:

- **Plausible** (recommended) — add `dietitianruhma.com` in Plausible,
  drop the snippet into `app/layout.tsx` (single `<script>` in `<head>`),
  redeploy. No env var needed.
- **Vercel Analytics** — Vercel project → Analytics → Enable. The
  `@vercel/analytics` package is **not** currently installed; if you go
  this route, `pnpm add @vercel/analytics` and mount `<Analytics />` in
  `app/layout.tsx`.

## 5. Booking widget — `/programs/consultation`

The page currently links to email/WhatsApp as a placeholder. To wire a
real booking widget:

1. Create a Cal.com or Calendly account; configure a 30-minute
   consultation event type matching the program copy.
2. Add the embed snippet (Cal.com `<Cal />` element or Calendly inline
   widget) to `app/programs/[slug]/page.tsx` rendering for the
   `consultation` slug only.
3. Re-test the booking flow end to end.

## 6. Library `buyUrl` — replace placeholders

Each MDX in `content/library/` has frontmatter:

```yaml
buyUrl: https://example.com/buy/<slug>
```

Replace each with the real external checkout URL (Gumroad / Lemon
Squeezy / Amazon KDP / Stripe payment link):

- `content/library/diabetes-essentials.mdx`
- `content/library/pcos-guidebook.mdx`
- `content/library/skin-secrets.mdx`

Verify each URL in an incognito tab from a non-VPN connection — confirm
the price is in PKR (or has a clear conversion) and the page does not
404 or require login.

## 7. DNS cutover

Follow `plan/14-cutover.md` §5 step-by-step. Summary:

1. **T-2 days**: lower TTL on apex A and `www` CNAME to 300s at the
   registrar. Do **not** touch MX/TXT/SPF/DKIM/DMARC.
2. **T-1 day**: add `dietitianruhma.com` and `www.dietitianruhma.com` in
   Vercel project Domains. Note the assigned A IP.
3. **T-0**: at the registrar, change apex A → Vercel IP, `www` CNAME →
   `cname.vercel-dns.com`. Save.
4. **T+5 min**: wait for SSL provision (Vercel Domains panel turns
   green).
5. **T+10 min**: run smoke and redirect checks against
   `https://dietitianruhma.com`.
6. **T+20 min**: put the Hostinger site behind a "We've moved." static
   `index.html` (rename `index.php` → `index.php.preserved`).

## 8. Search Console

After DNS flips and SSL is live:

1. Verify ownership of `https://dietitianruhma.com` in Google Search
   Console (DNS-TXT method survives registrar changes).
2. **Sitemaps → Submit** `https://dietitianruhma.com/sitemap.xml`.
   Confirm parsed without errors and shows ~17 URLs.
3. **URL Inspection** on 3 sample old URLs (`/about-me`, `/shop`,
   `/diet-plannig-program`) — confirm 308 → new path live test.
4. **Request indexing** for the 5 hero pages (`/`, `/about`,
   `/services`, `/programs/diet-planning`, `/library`).
5. Monitor **Pages → Indexing** daily for 1 week. Old URLs should
   transition to "Page with redirect"; new URLs should appear under
   "Indexed" within 1–7 days.
6. Watch **Crawl stats** for 4xx/5xx spikes — none expected.

## 9. Retire local WordPress stack (Day +7 after launch)

Only after 7 days of clean operation and Dr. Ruhma's sign-off:

```bash
cd "/home/duh/Documents/website backup (1)/_local"
sudo docker compose up -d
sleep 10
sudo docker exec dietitianruhma-local-db-1 \
  mariadb-dump -uroot -proot wordpress \
  > "/home/duh/Documents/website backup (1)/database.final.sql"
sudo docker compose down -v   # destructive: drops the volume
```

Then archive the snapshot directory per `plan/14-cutover.md` §8.

## 10. Day +30

Cancel Hostinger hosting plan (keep the domain registration). If
Hostinger also hosted email, migrate MX records to Google Workspace or
Zoho **before** cancellation.
