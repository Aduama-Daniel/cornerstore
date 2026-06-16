# Frontend UI Audit (Redesign Loop)

Date: 2026-06-13
Scope: Customer-facing visual layer only. No business/payment logic reviewed for change here.

## Stack identified

- Next.js 14 (App Router), React 18, TypeScript.
- Tailwind CSS 3 with custom tokens in `tailwind.config.js` + component classes in
  `src/app/globals.css`.
- Fonts via `next/font` (layout) **and** a Google Fonts `@import` (globals) — duplicated.
- State via React contexts: Cart, Auth, Wishlist, RecentlyViewed, Toast.
- Data via `src/lib/api.ts` (Fastify backend). Currency `src/lib/currency.ts` (GH₵).
- WhatsApp ordering via `NEXT_PUBLIC_WHATSAPP_NUMBER` + `wa.me` in `ProductInfo.tsx`.
- Gemini chatbot via `api.chat.sendMessage` in `Chatbot.tsx`.

## Customer-facing surface

Pages: `/`, `/shop`, `/product/[slug]`, `/collections`, `/collections/[slug]`, `/search`,
`/cart`, `/checkout`, `/wishlist`, `/account*`, `/login`, `/signup`, and info pages
(`/about`, `/contact`, `/faq`, `/shipping`, `/care`, `/size-guide`, `/privacy`, `/terms`,
`/accessibility`).

Shared components: `Header`, `Footer`, `Chatbot`, `HeroCarousel`, `ProductGrid`,
`ProductCard`, `QuickViewModal`, `ProductInfo`, `ProductImages`, skeletons.

## Old UI problems found

1. **Wrong identity.** Themed as a premium-fashion editorial magazine (Crimson Pro serif,
   warm beige/cream, uppercase letter-spacing, "Editorial Layers", "Skincare Rituals"),
   contradicting the Ghana convenience/catalogue business.
2. **False/again off-brand copy.** Footer claimed "London / Copenhagen / Worldwide",
   "premium apparel", "Personal Styling". Header mobile menu pushed an "editorial fashion"
   mood blurb.
3. **Broken/irrelevant nav.** Header + footer linked `womens`, `mens`, `accessories`,
   `new-arrivals` collections that do not match the catalogue.
4. **Search not central.** No persistent search in the header; search lived on a dark
   editorial page and the no-result state did not steer users to the assistant or to
   requesting the item.
5. **Weak product cards.** 3:4 fashion ratio, faint price, low-contrast neutral text, a
   single card per row on mobile, decorative hover-only actions.
6. **Generic chatbot.** Plain "AI Assistant" launcher, beige header, no suggested prompts,
   tight bubbles.
7. **Heavy hero.** Full-height dark image carousel with marketing-jargon stat tiles
   ("Hero Adverts: Live") rather than a clear value prop + search + CTA.
8. **Inconsistent system.** Pill radii up to 2rem, ad-hoc `bg-[#fbf8f4]` / `bg-white/72`
   surfaces, uppercase tracked microtext everywhere; no clear button/badge/card vocabulary.
9. **Mobile filters inaccessible** on `/shop` below the `lg` breakpoint (no control at all).

## What had to be preserved (and was)

Routes, product data shape, cart/checkout/Paystack logic, WhatsApp order construction,
Gemini chatbot calls + payload rendering (products, order status), search API, wishlist,
analytics tracker mount, env vars, Firebase auth, admin. No prices, reviews, or stock
were invented or changed.

## Files changed in this loop

Design system: `tailwind.config.js`, `src/app/globals.css`, `src/app/layout.tsx`.
Components: `Header.tsx`, `Footer.tsx`, `HeroCarousel.tsx`, `ProductCard.tsx`,
`ProductGrid.tsx`, `Chatbot.tsx`, `ProductInfo.tsx`,
`skeletons/ProductCardSkeleton.tsx`, `skeletons/ProductGridSkeleton.tsx`.
Pages: `src/app/page.tsx`, `src/app/search/page.tsx`, `src/app/shop/ShopClient.tsx`.
Tooling: `.claude/launch.json` (preview dev server).
