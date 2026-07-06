export type ProductFulfillment = {
  originType: 'local' | 'international';
  paymentMode: 'pay_on_delivery' | 'upfront' | 'both';
  deliveryLabel: string;
  paymentLabel: string;
  returnLabel: string;
};

type ProductLike = {
  origin?: string;
  originType?: 'local' | 'international';
  paymentMode?: 'pay_on_delivery' | 'upfront' | 'both';
  estimatedDeliveryLabel?: string;
  returnEligible?: boolean;
};

const INTERNATIONAL_ORIGINS = new Set(['china', 'international', 'imported', 'overseas']);

export function getProductFulfillment(product: ProductLike): ProductFulfillment {
  const explicitOrigin = product.originType;
  const legacyOrigin = product.origin?.toLowerCase();
  const originType =
    explicitOrigin || (legacyOrigin && INTERNATIONAL_ORIGINS.has(legacyOrigin) ? 'international' : 'local');
  const paymentMode = product.paymentMode || (originType === 'international' ? 'upfront' : 'both');
  const deliveryLabel =
    product.estimatedDeliveryLabel || (originType === 'international' ? '3-5 weeks delivery' : 'Local delivery');

  return {
    originType,
    paymentMode,
    deliveryLabel,
    paymentLabel:
      paymentMode === 'upfront'
        ? 'Upfront payment required'
        : paymentMode === 'pay_on_delivery'
          ? 'Pay on Delivery'
          : 'Pay on Delivery may be available',
    returnLabel: product.returnEligible === false ? 'Return limits apply' : 'Return eligible if policy conditions are met',
  };
}

