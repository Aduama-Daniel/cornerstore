# Dashboard QA Checklist

## Route Inventory

### Core
- [x] `/admin` overview: protected, real KPIs, attention queue, recent activity, useful actions
- [ ] `/admin/login`: validation, loading/error states, redirect when authenticated
- [x] `/admin/analytics`: protected real revenue/orders/product/shipping data, date range, empty/error states

### Commerce
- [x] `/admin/orders`: protected list, search, filters, sort, pagination, bulk actions, export, responsive table
- [x] `/admin/orders/[id]`: protected detail, status history, shipping, payment actions, notes, no dead actions
- [x] `/admin/returns`: protected list, filters, pagination, valid status transitions, refund action
- [x] `/admin/products`: protected list, search/filter/sort, delete confirmation, responsive table
- [x] `/admin/products/new`: validation, media, prices, category/brand, stock/variations
- [x] `/admin/products/[id]/edit`: correct loading, validation, media, inventory/variations

### Catalogue
- [ ] `/admin/categories`: protected list, search, delete confirmation, valid edit route
- [ ] `/admin/categories/new`: validation and useful image input
- [x] `/admin/categories/[id]/edit`: missing route added
- [ ] `/admin/brands`: protected list, search, delete confirmation
- [ ] `/admin/brands/new`: validation
- [ ] `/admin/brands/[id]/edit`: loading/not-found/error states
- [x] `/admin/colors`: protected data source and authenticated mutations
- [x] `/admin/collections`: protected data source, feature toggle, delete, empty/error states
- [x] `/admin/collections/new`: protected product source and correct GHS prices
- [x] `/admin/collections/[id]/edit`: fetch by ID correctly and protected product source
- [x] `/admin/reviews`: protected data source, tabs/counts, moderation, responses, pin/delete

## Missing Areas
- [ ] Customers/users page: no admin route or aggregate API exists
- [x] Inventory page: added using the existing admin inventory APIs
- [ ] Settings/profile page: no route or settings API exists
- [x] Dedicated revenue page: analytics covers paid revenue; a separate page is not currently needed

## Shared Shell and Permissions
- [x] Use one consistent admin shell and navigation across every admin page
- [x] Add Orders, Analytics, Returns, and Inventory to navigation
- [x] Add responsive mobile navigation
- [x] Redirect unauthenticated users before protected content renders
- [x] Handle expired/invalid credentials consistently
- [x] Protect `/api/admin/orders`, `/api/admin/returns`, and `/api/admin/analytics` with admin auth
- [x] Send Basic auth credentials on every admin request
- [x] Remove public API reads from admin management screens where protected equivalents exist

## Data Accuracy
- [x] Revenue uses paid orders only
- [x] Average order value uses the same paid-order population as revenue
- [x] Recognize legacy `item_paid` alongside `paid`
- [x] Date-to filters include the full selected day
- [x] Analytics totals reconcile with order tables for the same period
- [x] Top products use paid order line items only
- [x] Low-stock and out-of-stock counts come from inventory records
- [x] Failed payments and pending orders are visible as attention items
- [x] Empty data renders explicit empty states instead of blank cards

## Interactions
- [x] Order general search covers order number, customer, email, phone
- [x] Search works with filters, sort, and pagination
- [x] Order bulk status update works with feedback
- [x] Order CSV export exports the selected or visible real rows
- [x] Print Invoice implemented; unsupported email action removed
- [x] Shipping modal is authenticated, keyboard accessible, and reports API errors
- [x] Product search is debounced and filters safely with missing fields
- [x] Product table supports useful sorting and clear-filter behavior
- [ ] All destructive actions use the shared confirmation dialog
- [x] Product forms prevent invalid prices, invalid discounts, and empty required fields

## Tables and Responsive UI
- [x] Main operational tables have horizontal overflow containers
- [ ] Mobile layouts show usable cards or essential columns
- [x] Long names/emails/descriptions wrap or truncate safely
- [ ] Status badges use one consistent vocabulary and palette
- [x] Main data pages expose loading, error, retry, and empty states
- [x] Main mutation buttons expose loading/disabled states

## Validation
- [ ] `npm run lint` (blocked by the repository's interactive ESLint setup prompt)
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] Quick-view browser smoke test completed without console errors
- [x] Protected admin endpoint returns 401 without credentials; public product API returns 200
- [ ] Desktop, tablet, and mobile dashboard checks completed
