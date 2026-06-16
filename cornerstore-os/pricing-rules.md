# Pricing Rules

Last updated: 2026-06-13

## Principle

No product price should be published from shelf price alone. The selling price must be explainable from a dated cost record and approved assumptions.

## Required Inputs

- Product acquisition cost: MISSING per product
- Sourcing transport cost: MISSING
- Packaging cost: MISSING
- Customer delivery subsidy: MISSING
- Paystack fee: MISSING
- Expected returns/refunds allowance: MISSING
- Advertising/customer acquisition allowance: MISSING
- Damage, stock-out, and price-change allowance: MISSING
- Target contribution margin: MISSING
- Tax treatment: MISSING

## Calculation

Use:

`landed_cost = acquisition_cost + sourcing_transport + packaging + operational_allowances`

`minimum_price = (landed_cost + customer_delivery_subsidy + fixed_payment_fee) / (1 - variable_payment_rate - return_rate - target_margin_rate)`

All inputs must use the same currency, Ghana cedis, and must be retained with the price decision.

## Approval Rules

- Never use `MISSING` inputs as zero.
- Record source cost and source date.
- Record the approved selling price, expected gross profit, and expected contribution profit.
- Recheck the source cost before activating or promoting a product.
- Define a maximum acceptable source-price increase: MISSING.
- Define rounding convention: MISSING.
- Define markdown and discount authority: MISSING.
- Shipping advertised as free must be funded in the price or marketing budget.
- Checkout totals must be recalculated on the backend from current product and delivery rules.

## Current State

The catalog manifest contains selling prices but no explicit acquisition costs, margin calculations, fee assumptions, or approval record. Therefore current margin quality is MISSING.
