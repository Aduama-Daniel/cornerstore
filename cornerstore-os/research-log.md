# Research Log

Last updated: 2026-06-13

Use this log for product sourcing, customer, competitor, fulfilment, and policy evidence.

## Existing Research

| Date | Topic | Question | Method/source | Evidence | Finding | Confidence | Owner | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-13 | Current catalog | Does each candidate have supporting research sources? | Repository audit of catalog manifest | 44 of 48 products have empty `researchSources` | Most catalog claims lack traceable research evidence | High | MISSING | Add dated source evidence before activation |
| 2026-06-13 | Ambiguous products | Which photographed products should not be imported? | Catalog exception records | 3 source sets have model/price ambiguity | Keep excluded until re-photographed or verified | High | MISSING | Revisit source location |

## Product Validation Loop

Date: 2026-06-13

### Scope And Limits

- Scores are screening estimates, not proof of demand, stock, margin, safety, or product quality.
- Local availability means likelihood of finding the product through Ghana retailers, marketplaces, or physical sourcing. Every exact SKU still requires physical confirmation.
- Acquisition cost, delivery cost, advertising cost, target margin, warranty treatment, and selling price remain `MISSING`.
- No product was added to MongoDB, the catalog manifest, or the live website.
- Marketplace listings are availability signals only; they are not approved Cornerstore suppliers.

### Current Ghana Availability Signals

- Melcom currently shows broad local depth in kettles, blenders, cookers, and sandwich makers: [Melcom kitchen appliances](https://melcom.com/categories/electronics-appliances/home-kitchen-appliances.html?p=8).
- Supply Master in Accra lists kitchen scales, a handheld milk frother, and multiple rechargeable table lamps: [scales](https://supplymaster.store/collections/scales), [milk frother](https://supplymaster.store/products/decakila-handheld-milk-frother-6w-kmcf035b), [table lamps](https://supplymaster.store/collections/table-floor-lamps).
- Ghana marketplace results show multiple local listings for [portable blenders](https://jiji.com.gh/greater-accra/279-blenders/portable), [automatic umbrellas](https://jiji.com.gh/greater-accra/56-umbrellas), [ring lights](https://jiji.com.gh/greater-accra/388-ring-light), [rechargeable flashlights](https://jiji.com.gh/greater-accra/53-flashlights), and [digital kitchen scales](https://jiji.com.gh/greater-accra/279-kitchen-scales/electric).
- The existing Cornerstore catalog manifest already records candidate portable blenders, milk frothers, kitchen scales, automatic umbrellas, ring lights, searchlights, sandwich makers, kettles, and irons from a local sourcing visit.

Confidence: medium for product-type availability; low until an exact source, model, quantity, and dated cost are physically confirmed.

## Product Data And Addition Workflow

### Runtime Product Shape

Products are stored in MongoDB and can include:

- `name`, `slug`, `description`
- `price`, `discountPrice`
- `category`, `department`
- `brand`
- `origin`
- `status`
- `mainMedia`, `additionalMedia`, `images`
- `modelNumber`
- `specifications`
- `researchSources`
- `tags`
- `variations` and separate inventory records
- hero/featured/trending settings

### How Products Are Added

1. Admin product form:
   - Sends product data to `POST /api/admin/products`.
   - Supports core copy, category, department, brand, origin, media, tags, status, and hero settings.
   - Currently defaults to `active`, which conflicts with the Cornerstore publish rule requiring unverified products to remain `inactive`.
   - The current form does not expose every research/evidence field supported by the backend.

2. Catalog manifest import:
   - Reads `backend/src/scripts/catalog/catalog-manifest.json`.
   - Validates required fields, slugs, prices, and generated media.
   - Uploads catalog/lifestyle images to Cloudinary.
   - Upserts categories, brands, products, and inventory.
   - Correctly defaults imported candidates to `inactive`.

3. Legacy seed script:
   - Inserts old fashion sample data and random inventory.
   - Deletes existing catalog collections before inserting.
   - It is not suitable for product validation or production catalog management.

## Scoring Method

Each criterion is scored from 1 to 5:

- `1`: weak or high-friction
- `3`: plausible with meaningful validation needed
- `5`: strong fit based on current evidence

The score is an unweighted total out of 35. A high score does not override the physical publish gate.

Abbreviations:

- `Avail`: local availability likelihood
- `Visual`: visual appeal for ads
- `Deliver`: ease of delivery
- `Impulse`: impulse-buy potential
- `Margin`: margin potential
- `Low risk`: low complaint/return risk
- `Explain`: ease of explanation

## Product Scoring Table

| ID | Product idea | Existing catalog candidate | Avail | Visual | Deliver | Impulse | Margin | Low risk | Explain | Total /35 | Screening note |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| P01 | Compact automatic open/close umbrella | Yes | 5 | 4 | 5 | 5 | 4 | 4 | 5 | 32 | Clear demonstration, broad audience, small parcel; mechanism quality must be tested |
| P02 | Digital kitchen scale | Yes | 5 | 4 | 5 | 4 | 4 | 4 | 5 | 31 | Useful to bakers, meal-prep buyers, and small food sellers; calibration must be checked |
| P03 | Handheld electric milk frother | Yes | 4 | 5 | 5 | 4 | 4 | 4 | 5 | 31 | Fast transformation content and compact delivery; motor and whisk quality matter |
| P04 | Portable rechargeable blender | Yes | 5 | 5 | 4 | 5 | 4 | 3 | 5 | 31 | Strong lifestyle demo; battery, seal, blade, and cleaning complaints need testing |
| P05 | Rechargeable decorative table lamp | No adjacent catalog item | 4 | 5 | 4 | 4 | 4 | 4 | 5 | 30 | Highly visual room transformation; verify material, runtime, charging, and packaging |
| P06 | Rechargeable portable searchlight | Yes | 5 | 4 | 4 | 4 | 4 | 4 | 5 | 30 | Practical for outages, security, and outdoor use; brightness/runtime claims require proof |
| P07 | Rechargeable lint remover | No | 3 | 5 | 5 | 4 | 4 | 4 | 5 | 30 | Excellent before/after ad; local source and fabric-safety validation needed |
| P08 | Magnetic or clamp car phone holder | No | 5 | 4 | 5 | 5 | 4 | 3 | 5 | 31 | Broad car-owner utility; compatibility, grip, and heat complaints can be high |
| P09 | USB motion-sensor closet light | No | 4 | 5 | 5 | 5 | 4 | 3 | 5 | 31 | Strong dark-to-lit demonstration; adhesive and battery quality are common failure points |
| P10 | Phone tripod with remote shutter | No | 5 | 5 | 4 | 5 | 4 | 3 | 5 | 31 | Creator and family-photo angle; tripod stability and remote compatibility need testing |
| P11 | Rechargeable mini desktop fan | No | 5 | 5 | 4 | 5 | 4 | 3 | 5 | 31 | Obvious warm-weather use; noise, runtime, and motor quality can create complaints |
| P12 | Pull-cord manual mini food chopper | No | 4 | 5 | 4 | 5 | 4 | 4 | 5 | 31 | Strong food-prep demo without electrical failure risk; blade safety and bowl quality matter |
| P13 | Cable organizer kit | No | 4 | 4 | 5 | 4 | 4 | 5 | 5 | 31 | Cheap-to-ship organization content; bundle size must support enough absolute margin |
| P14 | Portable digital luggage scale | No | 4 | 3 | 5 | 3 | 4 | 5 | 5 | 29 | Easy to explain and low return risk; narrower travel audience and lower visual drama |
| P15 | Sink caddy or compact countertop organizer | No | 4 | 4 | 5 | 4 | 3 | 4 | 5 | 29 | Useful organization angle; dimensions and material quality must be explicit |
| P16 | Silicone air-fryer liner set | No | 4 | 4 | 5 | 4 | 4 | 3 | 5 | 29 | Easy bundle and demo; fit, food-contact evidence, and cleaning expectations are risks |
| P17 | Two-slice sandwich maker | Yes | 5 | 5 | 3 | 4 | 3 | 3 | 5 | 28 | Strong food video, but heavier delivery and electrical/warranty complaints reduce fit |
| P18 | Electric kettle | Yes | 5 | 4 | 3 | 3 | 3 | 3 | 5 | 26 | Very available and easy to explain, but competitive, bulkier, and less impulse-led |
| P19 | Portable travel steam iron | Yes | 4 | 5 | 4 | 4 | 3 | 3 | 5 | 28 | Before/after content is strong; heat, leakage, and fabric-damage complaints require care |
| P20 | Reusable food storage bag set | No | 4 | 4 | 5 | 3 | 3 | 4 | 5 | 28 | Easy delivery and simple utility; lower urgency and absolute margin may limit ad viability |

## Selected Top Five

Selection balances score, local sourcing evidence, visual demonstration, delivery simplicity, and portfolio diversity. It is not solely the numeric ranking.

### 1. Compact Automatic Open/Close Umbrella

- Target buyer: commuters, students, office workers, drivers, and gift buyers in urban Ghana
- Product angle: one-hand open/close convenience for sudden rain and daily movement
- Suggested content style:
  - Fast outdoor demonstration
  - Close-up of the button and folding sequence
  - Bag-size comparison
  - Rain simulation only if truthful and safely filmed
- Possible objections:
  - “Will the mechanism stop working?”
  - “Is it strong enough for wind?”
  - “Is it actually compact?”
  - “Will the fabric leak?”
- Information needed before listing:
  - Exact brand/model or unbranded identifier
  - Source and dated acquisition cost: `MISSING`
  - Open and closed dimensions
  - Weight
  - Rib count and material
  - Fabric material
  - Available colors
  - Repeated open/close test result
  - Light rain/leak test result
  - Warranty/return treatment
  - Current quantity and recheck owner
- Required images/videos:
  - Closed umbrella on a plain background
  - Fully open top and underside
  - Handle/button close-up
  - In-hand and inside-bag scale shots
  - Continuous open/close demonstration video
- Estimated risk: Low to medium
- Price fields:
  - Acquisition cost: `MISSING`
  - Landed cost: `MISSING`
  - Minimum viable selling price: `MISSING`
  - Test selling price: `MISSING`

### 2. Digital Kitchen Scale

- Target buyer: home bakers, meal-prep customers, health-conscious cooks, caterers, and small food sellers
- Product angle: remove guesswork from recipes, portions, and small-batch food preparation
- Suggested content style:
  - Rapid ingredient-weighing demo
  - Tare-function demonstration
  - Comparison between guessing and measured portions
  - Small-business packaging workflow
- Possible objections:
  - “Is it accurate?”
  - “What is the maximum capacity?”
  - “Does it include batteries?”
  - “Can the surface be cleaned?”
- Information needed before listing:
  - Exact model
  - Source and dated acquisition cost: `MISSING`
  - Maximum capacity and measurement increments
  - Supported units
  - Tare behavior
  - Battery type/inclusion
  - Platform material and dimensions
  - Calibration check using known weights
  - Display visibility
  - Warranty/return treatment
  - Current quantity and recheck owner
- Required images/videos:
  - Front, side, underside, display, and battery compartment
  - Scale beside common kitchen items
  - Tare and measurement demonstration
  - Known-weight accuracy check video
- Estimated risk: Low
- Price fields:
  - Acquisition cost: `MISSING`
  - Landed cost: `MISSING`
  - Minimum viable selling price: `MISSING`
  - Test selling price: `MISSING`

### 3. Handheld Electric Milk Frother

- Target buyer: coffee, tea, matcha, hot-chocolate, and home-breakfast enthusiasts
- Product angle: improve ordinary drinks at home with a quick visible transformation
- Suggested content style:
  - Short close-up foam transformation
  - Morning-routine video
  - Side-by-side drink before and after
  - Demonstrate only verified included attachments/functions
- Possible objections:
  - “Is it powerful enough?”
  - “Is it rechargeable or battery-powered?”
  - “Is it easy to clean?”
  - “Will the whisk bend or detach?”
- Information needed before listing:
  - Exact model
  - Source and dated acquisition cost: `MISSING`
  - Power source and charging connector
  - Included cable, stand, and whisk attachments
  - Speed settings
  - Food-contact material
  - Continuous run and recharge test
  - Cleaning instructions
  - Noise and wobble check
  - Warranty/return treatment
  - Current quantity and recheck owner
- Required images/videos:
  - Full kit and packaging
  - Whisk/attachment close-ups
  - Charging port or battery compartment
  - Continuous frothing demonstration with timestamp
  - Cleaning/rinse demonstration
- Estimated risk: Low to medium
- Price fields:
  - Acquisition cost: `MISSING`
  - Landed cost: `MISSING`
  - Minimum viable selling price: `MISSING`
  - Test selling price: `MISSING`

### 4. Portable Rechargeable Blender

- Target buyer: students, office workers, gym-goers, smoothie buyers, and people with compact kitchens
- Product angle: blend a single drink without setting up a full-size blender
- Suggested content style:
  - Ingredient-to-drink transformation
  - Desk, gym-bag, or small-kitchen lifestyle scene
  - Leak-test and cleaning sequence
  - Do not show ice or hard ingredients unless the exact model is verified for them
- Possible objections:
  - “Can it blend fruit properly?”
  - “Does it leak?”
  - “How long does the battery last?”
  - “Is it easy and safe to clean?”
  - “Can replacement parts be found?”
- Information needed before listing:
  - Exact brand/model
  - Source and dated acquisition cost: `MISSING`
  - Capacity
  - Blade count/material
  - Battery capacity and connector
  - Charging and tested-use duration
  - Cup and lid material
  - Safety-lock behavior
  - Leak test
  - Test using clearly documented soft ingredients
  - Cleaning process
  - Included accessories
  - Warranty/return treatment
  - Current quantity and recheck owner
- Required images/videos:
  - Product and complete packaging contents
  - Open cup, blade, seal, lid, and charging port
  - In-hand/bag-size comparison
  - Uncut blend, pour, leak, and cleaning demonstration
- Estimated risk: Medium
- Price fields:
  - Acquisition cost: `MISSING`
  - Landed cost: `MISSING`
  - Minimum viable selling price: `MISSING`
  - Test selling price: `MISSING`

### 5. Rechargeable Decorative Table Lamp

- Target buyer: renters, students, bedside readers, home-decor buyers, restaurants, and gift shoppers
- Product angle: quickly improve a bedside, desk, dining, or content-creation space without fixed wiring
- Suggested content style:
  - Dark-to-lit room transformation
  - Touch/dimming demonstration
  - Three room settings using the same lamp
  - Color/finish close-ups
- Possible objections:
  - “How bright is it?”
  - “How long does the battery last?”
  - “Is the finish plastic or metal?”
  - “Does it include a charger?”
  - “Will it arrive damaged?”
- Information needed before listing:
  - Exact model
  - Source and dated acquisition cost: `MISSING`
  - Dimensions and weight
  - Material and color variants
  - Light modes and control method
  - Charging connector and included cable
  - Tested runtime at each relevant brightness
  - Stability/tip test
  - Packaging/drop protection
  - Warranty/return treatment
  - Current quantity and recheck owner
- Required images/videos:
  - Lamp off and on in daylight
  - Dark-room output
  - Control and charging-port close-ups
  - Scale photo beside a book, bed, or desk
  - Continuous mode/dimming video
- Estimated risk: Low to medium
- Price fields:
  - Acquisition cost: `MISSING`
  - Landed cost: `MISSING`
  - Minimum viable selling price: `MISSING`
  - Test selling price: `MISSING`

## Physical Collection Checklist

Collect this for every shortlisted SKU before listing:

1. Exact product and model on product, package, and shelf label.
2. Source name, branch/location, contact, and evidence date.
3. Clear shelf/source price evidence and purchase receipt for one sample.
4. Quantity physically seen and restock/partner confirmation method.
5. Package dimensions, product dimensions, and packed weight.
6. Complete box contents and available variants.
7. Power, charging, material, capacity, and safety specifications copied from the exact unit.
8. A functional test recorded on video.
9. A failure-oriented test appropriate to the product: leak, repeated mechanism, calibration, runtime, grip, or stability.
10. Delivery packaging requirement and estimated delivery cost: `MISSING`.
11. Warranty, return, replacement, and damaged-item treatment: `MISSING`.
12. Acquisition, packaging, payment, delivery subsidy, ad allowance, and margin inputs required by `pricing-rules.md`.

## Recommended Next Product Experiment

Run a **three-product creative validation sprint** before listing or taking payment:

- Compact automatic umbrella
- Digital kitchen scale
- Portable rechargeable blender

Why this set:

- It tests three distinct demand angles: everyday convenience, practical precision, and lifestyle transformation.
- All three have current Ghana-local availability signals and existing Cornerstore catalog candidates.
- Their content can be produced from one physically purchased sample per product.

Experiment design:

1. Physically source and test one exact unit of each product.
2. Complete the evidence and landed-cost checklist.
3. Produce two truthful short-form videos per product:
   - direct demonstration
   - problem/solution lifestyle angle
4. Use a non-checkout validation destination until the website Critical audit issues are resolved:
   - waitlist, WhatsApp interest, or “notify me” flow approved by the business
5. Record impressions, qualified clicks, contact/waitlist intent, objections, and source availability failures.
6. Do not declare a winner from clicks alone. The winning candidate must also pass contribution-margin and fulfilment checks.

Budget, audience, test duration, success threshold, and channel: `MISSING` and require approval.

## Entry Rules

- Link or identify raw evidence.
- Separate observation from interpretation.
- Use `MISSING` for absent data.
- Do not overwrite old findings; add a dated entry when facts change.
- Keep every product inactive until the product and pricing publish gates are complete.
