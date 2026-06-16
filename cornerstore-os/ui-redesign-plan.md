# Cornerstore UI Redesign Plan

Date: 2026-06-13
Owner: Frontend redesign loop

## Why redesign

The current frontend is themed as a **premium-fashion editorial magazine** (warm beige/cream,
Crimson Pro serif, uppercase letter-spaced typography, "Editorial Layers", "London /
Copenhagen / Worldwide", "Personal Styling"). The actual business is a **Ghana-based online
convenience / catalogue store** that sells everyday useful items, confirms local availability,
takes Paystack payments, and supports WhatsApp ordering.

The visual language fights the business. We are replacing the editorial-fashion direction with a
**modern convenience-store** direction without rebuilding the app or touching business logic.

## Design direction

Reference feel: Jumia simplicity + modern grocery/convenience clarity + Apple spacing
discipline + clean startup trust + practical Ghanaian e-commerce.

Principles:
- Clean, bold, premium-but-not-luxury, friendly, practical.
- Mobile-first. Two-column product grid on phones.
- Strong product focus, clear CTAs, generous but disciplined spacing.
- Trust and delivery messaging surfaced early and honestly (no invented stock/reviews/scarcity).

## Design system changes

### Color (repoint shared Tailwind tokens so the whole app shifts at once)
- Page surface (`cream`): warm beige `#FAF7F2` -> clean `#F7F8FA`.
- Ink (`contrast`/`charcoal`): `#2E2E2C` -> `#0F172A` (slate ink).
- Muted (`neutral`/`warm-gray`): warm `#8B857D` -> `#64748B` (cool slate).
- Hairline (`sand`): `#D4C8B8` -> `#E2E8F0`.
- Soft surface (`warm-beige`/`primary`): `#E8DDCF` -> brand-tinted `#E7F3EC`.
- NEW `brand` green scale (primary CTA + trust): DEFAULT `#0E8A57`, dark `#0A6B43`,
  light `#E7F3EC`, soft `#F1F8F4`. Green = fresh/convenience + trust + Ghana, and pairs
  naturally with the existing WhatsApp flow.
- Keep red for sale/price-drop, amber for "confirm availability" notices.

### Typography
- Headings: switch from Crimson Pro serif -> **Plus Jakarta Sans** (clean, friendly, premium).
- Body: keep **Manrope**.
- Remove the duplicate Google-Fonts loading path where practical.

### Components / tokens
- Buttons: `btn-primary` (solid brand green pill), `btn-dark` (ink pill), `btn-secondary`
  (outline), `btn-whatsapp` (WhatsApp green), normal-case friendly labels.
- `card` (white, hairline border, soft shadow, hover lift), `chip` (category pill),
  `badge` (status), `input-field` (clean, brand focus ring).
- Consistent radii, shadows, spacing scale, section paddings.

## Scope (customer-facing)

1. Design tokens + globals + fonts (system foundation).
2. Header: real category nav, persistent search, cleaner mobile menu.
3. HeroCarousel -> conversion hero (keeps admin hero-advert products, adds search + trust).
4. Homepage: hero, search, category shortcuts, trending, how-ordering-works, delivery/payment
   reassurance, trust copy.
5. ProductCard + ProductGrid: modern card, consistent ratio, availability cue, 2-col mobile,
   better empty state.
6. Search page: light theme, helpful no-result state that points to chatbot + request item.
7. Chatbot: friendlier launcher with label, branded readable window.
8. Footer: Ghana positioning, corrected links, removal of false London/Copenhagen/styling claims.
9. ProductInfo / Shop / Cart: inherit tokens; restyle CTAs and hero copy.

## Preserved (no logic changes)

Routes, product data structure, cart logic, checkout logic, WhatsApp order logic
(`NEXT_PUBLIC_WHATSAPP_NUMBER` + `wa.me`), Gemini chatbot API calls, search API, analytics,
env vars, Paystack, Firebase auth, admin.

## Not doing here

No payment/price changes, no fake reviews, no false scarcity, no invented stock, no secrets,
no functional removals, no full rebuild.
