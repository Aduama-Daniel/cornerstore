# Current Website Audit

Audit loop date: 2026-06-13

## Purpose

Assess whether the existing Cornerstore website is ready for product testing and paid traffic. This was a code-level audit only. No UI, payment, pricing, checkout, or application code was changed.

## Current State

Cornerstore is a functioning full-stack store with:

- Next.js 14 App Router, React, TypeScript, and Tailwind CSS
- Fastify API, MongoDB, and Firebase customer authentication
- Product catalog, collections, search, wishlist, reviews, cart, checkout, Paystack, customer accounts, and admin pages
- Guest cart persistence and authenticated server cart
- Responsive layouts across most customer-facing components
- Cloudinary/static media and a catalog import workflow

The visual foundation is stronger than the operating and measurement foundation. The website should not receive meaningful paid traffic until the Critical issues in `conversion-issues.md` are resolved.

## Pages Reviewed

### Storefront

- `/`
- `/shop`
- `/product/[slug]`
- `/collections`
- `/collections/[slug]`
- `/search`
- `/wishlist`
- `/cart`
- `/checkout`

### Customer And Support

- `/login`
- `/signup`
- `/account`
- `/account/orders`
- `/account/orders/[id]`
- `/account/wishlist`
- `/about`
- `/contact`
- `/faq`
- `/shipping`
- `/care`
- `/size-guide`
- `/privacy`
- `/terms`
- `/accessibility`

### Other Public Surface

- `/listing-options` is an internal design-comparison page exposed as a public route.

## Customer Journey Review

### Homepage

Working:

- Responsive hero and category sections
- Admin-selected hero products with fallback slides
- Clear links into shop and collections
- Product data is server-fetched and cached for five minutes

Issues:

- Copy describes Cornerstore as a fashion/editorial platform and sometimes describes implementation features instead of customer value.
- Generic Unsplash imagery dominates key category areas.
- The footer claims London, Copenhagen, worldwide reach, premium apparel, and styling services, which does not match the Ghana sourcing model.

### Product Listing And Collections

Working:

- Product cards contain image, price, department/brand, wishlist, and quick view.
- Desktop category, price, color, size, origin, and stock filters exist.
- Catalog and collection grids respond across breakpoints.

Issues:

- All filtering is hidden below the `lg` breakpoint, with no mobile filter control.
- Header/footer collection links still target `womens`, `mens`, `accessories`, and `new-arrivals`, while the current manifest categories are appliances and home/lifestyle products.
- “In stock” filtering checks product status only, not inventory quantities.
- The shop fetches at most the backend default of 50 products and has no pagination or load-more control.
- Product grids mark the first eight images as priority, increasing mobile bandwidth.

### Product Detail

Working:

- Media gallery, zoom, variants, inventory display, quantity, wishlist, specifications, related products, recently viewed, and reviews exist.
- Layout stacks on mobile and uses a two-column desktop presentation.

Issues:

- Generic fashion claims such as ethical materials, dry cleaning, and timeless style appear on appliances and home goods.
- Shipping and return claims conflict with other pages and contain unverified promises.
- The page has no product-specific metadata, canonical URL, Open Graph data, or product structured data.
- Reviews are auto-approved and all reviewers are labelled “Verified Buyer” without purchase verification.
- Product view tracking only updates local recently viewed state; it does not call the analytics endpoint.

### Cart And Checkout

Working:

- Guest and authenticated carts exist.
- Customers can update quantity or remove items.
- Checkout collects Ghana region, city, town, GPS/street address, email, and phone.
- Paystack UI is dynamically loaded and the backend contains a verification path.

Issues:

- Guest checkout passes an empty email to Paystack instead of the submitted checkout email.
- Browser-supplied totals are stored by the backend.
- Payment verification cannot currently import because `axios` is undeclared.
- Amount mismatches are logged but accepted.
- Cart and order variant/inventory enforcement is incomplete.
- Checkout creates an order and clears the server cart before payment is verified.
- Desktop checkout uses a two-column grid but spans the form across both columns, pushing the order summary below instead of beside it.
- Free Ghana-wide delivery is shown as settled fact although delivery economics and coverage are MISSING.

### Accounts And Support

Working:

- Firebase email/password and Google authentication exist.
- Authenticated customers can view owned orders and tracking state.

Issues:

- `/forgot-password`, `/account/addresses`, and `/account/settings` are linked but do not exist.
- “Remember me” has no behavior.
- Order details use legacy address fields (`state`, `zipCode`, `country`) instead of checkout fields (`region`, `town`).
- A visible encoding error appears in the order-item separator.
- Contact page has no phone, email, WhatsApp, form, or other working contact method.
- Newsletter forms have no submit handler or service integration.

## Mobile Responsiveness

The code generally uses mobile-first grids, responsive type, flexible buttons, and constrained modal/chat layouts. Product, cart, checkout, account, and support pages stack appropriately.

Primary mobile risks:

- Shop and collection filters are completely inaccessible below 1024px.
- Product listing uses one card per row below 640px, resulting in long browsing pages.
- The full-screen mobile hero is visually heavy for a commerce landing page.
- Eight listing images are eagerly prioritized even on small screens.
- Hover-dependent gallery controls are less discoverable on touch devices.
- No device/browser visual QA evidence is recorded.

## SEO Basics

Present:

- Semantic headings on most pages
- Next.js image component on most customer product media
- Global title and description
- Server-rendered homepage, shop, collection detail, and product detail content

Missing or incorrect:

- Global metadata still says “Premium Fashion.”
- No route-specific metadata or `generateMetadata`.
- No canonical URLs.
- No Open Graph or Twitter metadata.
- No sitemap.
- No robots configuration.
- No Web App manifest.
- No product, organization, breadcrumb, or review structured data.
- Missing products render a custom message instead of Next.js `notFound()`, risking a soft 404.
- Search, account, checkout, admin, and internal listing-option routes have no explicit `noindex` policy.

## Analytics And Testing Readiness

Existing:

- Backend product-view and trending-product services
- An unused add-to-cart tracking function
- Order analytics services and dashboard

Missing:

- Product view call from the frontend
- Product impression
- Add to cart
- Checkout start
- Payment initiation and verified payment
- Availability failure
- Campaign, source, and ad attribution
- Dispatch, delivery, cancellation, and refund funnel events
- Consent/privacy decision for ad and analytics tooling
- Reliable revenue metrics because payment statuses conflict

No analytics data was invented or estimated.

## Performance Risks

- `ProductGrid` assigns priority loading to eight product images per grid.
- Homepage loads multiple product queries and several remote Unsplash images.
- Google fonts are loaded through both `next/font` and CSS `@import`.
- Recently viewed and cart hydration fetch the general product list instead of an ID-specific set.
- Collections are entirely client-fetched, delaying meaningful content and SEO.
- Product reviews require two client requests after page load.
- Chatbot code is included globally in the root layout.
- Product-card hover image rotation can create repeated image/video work across a grid.
- Catalog pagination is absent.

## Trust Signals

Positive:

- Paystack is named clearly.
- Delivery address fields are Ghana-specific.
- Product specifications, model number, origin, reviews, and inventory UI exist.
- Privacy, terms, shipping, FAQ, accessibility, and about pages exist.

Weak or misleading:

- No real business contact method is displayed.
- No Ghana location, service coverage, fulfilment process, or availability-confirmation explanation is displayed.
- Return windows conflict.
- Free shipping and international shipping claims are unverified.
- “Verified Buyer” is not actually verified.
- Generic ethical/premium/craftsmanship claims are not product evidence.
- Social links point to generic platform homepages.
- Newsletter forms do nothing.
- Current copy contains fashion, London, Copenhagen, and worldwide language unrelated to the stated model.

## Conclusion

The site can support product testing after a focused stabilization pass. The first gate is not a redesign: it is making checkout trustworthy, protecting admin operations, accurately representing products and fulfilment, and measuring the ad-to-order funnel.

Detailed severity, fixes, business impact, and approval requirements are in `conversion-issues.md`.

## Commands Run

Inspection only:

- `find`, `rg`, `sed`, `nl`, `wc`, and a read-only Node command for route/category comparison
- No validation command was required because no application code was modified

Previous validation from the earlier audit remains:

- Frontend TypeScript: PASS
- Frontend production build: PASS
- Backend JavaScript syntax: PASS
- ESLint: not configured
- Catalog validation: FAIL, 74 missing generated images
- Paystack service import: FAIL, undeclared `axios`
