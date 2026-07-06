type AnalyticsEvent =
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_viewed'
  | 'begin_checkout'
  | 'payment_started'
  | 'payment_failed'
  | 'purchase'
  | 'order_submitted'
  | 'search'
  | 'search_result_click'
  | 'select_item'
  | 'view_category'
  | 'whatsapp_checkout_clicked'
  | 'pay_on_delivery_selected'
  | 'upfront_payment_selected';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_KEY = 'cs_session_id';

/** Anonymous per-browser session id so the funnel can be stitched together. */
function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

/** Fire-and-forget delivery to Cornerstore's own analytics store. */
function sendToBackend(event: AnalyticsEvent, params: Record<string, unknown>) {
  try {
    const payload = JSON.stringify({
      event,
      params,
      sessionId: getSessionId(),
      path: window.location.pathname,
      ts: Date.now(),
    });
    const url = `${API_URL}/api/analytics/events`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics must never break the storefront.
  }
}

export function trackEvent(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  sendToBackend(event, params);

  window.gtag?.('event', event, params);

  if (event === 'purchase' || event === 'order_submitted') {
    window.fbq?.('track', 'Purchase', params);
  } else if (event === 'add_to_cart') {
    window.fbq?.('track', 'AddToCart', params);
  } else if (event === 'view_item') {
    window.fbq?.('track', 'ViewContent', params);
  } else if (event === 'begin_checkout') {
    window.fbq?.('track', 'InitiateCheckout', params);
  } else if (event === 'search') {
    window.fbq?.('track', 'Search', params);
  }
}
