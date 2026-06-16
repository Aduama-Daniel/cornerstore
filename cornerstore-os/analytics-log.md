# Analytics Log

## Current Instrumentation

| Event/metric | Status | Location | Notes |
| --- | --- | --- | --- |
| Local recently viewed | Working | Browser localStorage | Retained for 30 days |
| Backend product view | Endpoint exists, not connected | `/api/analytics/track/view/:productId` | Product page does not send it |
| Trending products | Partial | MongoDB aggregation | Depends on missing view events |
| Add to cart | Function exists, not connected | Backend analytics service | No route/call found |
| Checkout started | MISSING | MISSING | |
| Order created | Database record only | Orders collection | Not an explicit analytics event |
| Payment verified | Partial | Order update | Status naming breaks revenue reports |
| Delivered order | Partial | Order status | No funnel/event model |
| Acquisition source/campaign | MISSING | MISSING | |

## Funnel Definition

1. Product impression
2. Product detail view
3. Add to cart
4. Checkout started
5. Availability confirmed
6. Payment initiated
7. Payment verified
8. Product sourced/reserved
9. Dispatched
10. Delivered
11. Returned/refunded

## Weekly Metrics

| Week | Sessions | Product views | Add-to-cart rate | Checkout rate | Payment success | Availability failure | Delivery success | Refund rate | Revenue | Contribution profit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
