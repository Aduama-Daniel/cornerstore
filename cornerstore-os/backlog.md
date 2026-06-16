# Cornerstore Website Audit Backlog

Updated: 2026-06-13

Do not start paid product testing until the Critical gate is cleared.

## UI Redesign Loop — Done (2026-06-13)

The Full UI Redesign Loop replaced the fashion-editorial theme with a modern Ghana
convenience-store visual system. This moved several "Important" items forward:

- Partly resolves **I-02/I-03**: header, footer, homepage, hero copy, and metadata now
  describe the Ghana convenience-store proposition; removed London/Copenhagen/"premium
  apparel"/"Personal Styling"; nav/footer no longer link `womens/mens/accessories`.
  (Still pending: final approved positioning copy on the long-form `/about` page.)
- Resolves **I-01**: `/shop` filters are now reachable on mobile via a Filters toggle.
- Advances **N-01/N-02**: two-column mobile product grid + a lighter hero are now live
  (treat as the new baseline rather than an A/B test).
- New design system (tokens, buttons, cards, badges, inputs, shadows, empty/loading
  states) documented in `ui-redesign-plan.md` and `frontend-ui-audit.md`.

Note: the redesign is visual only. The Critical Gate (admin auth, payment integrity,
server-authoritative totals, analytics funnel, claim/availability policy, verified-buyer)
is unchanged and still blocks paid traffic.

### UI follow-ups

Done in the redesign loop (second pass, 2026-06-13):

- Re-themed the dark editorial heroes on `/cart`, `/checkout`, `/wishlist`,
  `/collections`, and `/collections/[slug]` to the light system.
- Restyled the shared `InfoPageTemplate` (covers `/faq`, `/shipping`, `/care`,
  `/size-guide`, `/privacy`, `/terms`, `/accessibility`) to the light system.
- Rewrote `/about` to the Ghana convenience-store proposition with real imagery.
- Resolved the duplicate font load (now next/font + CSS variables only).
- Added curated product/lifestyle imagery (real WinningStar kettle shots already in the
  repo) to the homepage hero fallback, an appliance spotlight band, and `/about`.

Still open:

- Add real category data/slugs to header/footer + per-category images once confirmed.
- Add product-detail out-of-stock cue parity with the new card availability cue.
- Replace remaining icon-only category tiles with category photography when assets exist.

## Critical Gate

| Rank | Issue | Task | Approval | Status |
| --- | --- | --- | --- | --- |
| 1 | C-01 | Protect all admin commerce and analytics APIs; add unauthorized-access tests | Yes | Ready for approval |
| 2 | C-02, C-04 | Repair and verify guest Paystack flow, dependency, amount/currency enforcement, payment states, idempotency, and webhook reconciliation | Yes | Ready for approval |
| 3 | C-03 | Make all order totals server-authoritative | Yes | Ready for approval |
| 4 | C-05 | Preserve variants and implement availability recheck/reservation/decrement rules | Yes | Ready for approval |
| 5 | C-06, I-12 | Approve and implement the minimum ad-to-delivery event schema and attribution | Yes | Ready for approval |
| 6 | C-07 | Approve one product-claim, shipping, returns, and availability policy; remove false generic claims | Yes | Ready for approval |
| 7 | C-08 | Make “Verified Buyer” evidence-based and stop automatic public approval under that label | Yes | Ready for approval |

## Important Before Ads

| Rank | Issue | Task | Approval | Status |
| --- | --- | --- | --- | --- |
| 8 | I-01 | Expose existing shop and collection filters through a mobile drawer | No | Ready |
| 9 | I-02, I-03 | Align header, footer, homepage, about, metadata, and category links with the approved Ghana marketplace proposition | Yes | Blocked by positioning decision |
| 10 | I-04 | Add a real customer support channel and operating hours | Yes | Blocked by contact details |
| 11 | I-05 | Remove or implement broken password, address, and settings links | Partial | Ready |
| 12 | I-06, I-07, I-17 | Add SEO metadata, index controls, sitemap, robots, canonicals, structured data, and proper 404 behavior | Partial | Ready after domain/copy approval |
| 13 | I-08 | Connect or remove newsletter forms | Yes | Blocked by provider decision |
| 14 | I-09 | Make stock filtering inventory-aware and add catalog pagination/load-more | No | Ready |
| 15 | I-10 | Correct the desktop checkout grid after checkout-change approval | Yes | Ready for approval |
| 16 | I-11 | Add secure guest order recovery and confirmed notifications | Yes | Ready for workflow decision |
| 17 | I-13, I-14 | Reduce eager media/font/script work and server-render collection content | No | Ready |
| 18 | I-15 | Correct Ghana address display and encoding on order details | No | Ready |
| 19 | I-16 | Remove, gate, or `noindex` the public listing-options route | No | Ready |

## Nice-To-Have Experiments

| Rank | Issue | Task | Approval | Status |
| --- | --- | --- | --- | --- |
| 20 | N-01 | Test a compact two-column mobile product grid | Yes | Wait for baseline analytics |
| 21 | N-02 | Test a shorter mobile hero | Yes | Wait for baseline analytics |
| 22 | N-03, N-07 | Improve touch controls and reduced-motion behavior | No | Ready |
| 23 | N-04 | Replace generic social links with real profiles | Yes | Blocked by profile details |
| 24 | N-05, N-06 | Normalize currency labels and make searches shareable | No | Ready |
| 25 | N-08 | Optimize review media | No | Ready |

## UI Redesign Follow-ups (post-redesign)

Done across the redesign + imagery/polish + product-page passes:

- New convenience-store visual system; header/footer/hero/cards/grid/search/chatbot redesigned.
- All dark editorial heroes re-themed light; shared `InfoPageTemplate` restyled; `/about` rewritten to the Ghana proposition.
- Hero lifestyle image + appliance spotlight band added for visual intrigue.
- Product detail scroll-within-scroll removed (sticky gallery + natural page scroll).
- Category links wired to real catalog categories via `/shop?category=<slug>`.
- Font loading de-duplicated (next/font CSS variables; dropped Google Fonts `@import`).

Remaining UI improvements:

- Replace the single reused kettle lifestyle/spotlight imagery with per-category photography as the catalogue grows.
- Add a mobile sticky add-to-cart / WhatsApp bar on the product page for long pages.
- Per-category landing imagery on `/collections` and homepage category tiles.
- Configure ESLint (`npm run lint` still blocked by Next.js interactive first-run setup).
- Product-specific SEO metadata / OG images (still open, I-06).

## Recommended First Three Fixes

1. Secure admin commerce APIs.
2. Stabilize guest payment and server-authoritative order verification.
3. Instrument the minimum paid-traffic funnel before spending on ads.
