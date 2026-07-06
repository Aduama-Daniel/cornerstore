export interface RepurposingDraft {
  _id: string;
  status: string;
  copyStatus: string;
  imageStatus: string;
  source: {
    platform: string;
    url: string;
    price: number;
    currency: string;
    importedAt?: string;
  };
  input: {
    category: string;
    department?: string;
    deliveryTimeline: string;
    adminNotes: string;
    nameHint: string;
    featureNotes: string;
    targetAudience: string;
    brandStyleNote: string;
  };
  originalScreenshot: { url: string } | null;
  copy: {
    name: string;
    shortDescription: string;
    description: string;
    keyFeatures: string[];
    suggestedCategory: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    imageAltText: string;
    deliveryNote: string;
    paymentNote: string;
    useCase: string;
    targetCustomer: string;
    qualityNotes: string;
    riskLevel: string;
    riskNotes: string[];
  } | null;
  imageInstructions: string;
  generatedImage: { url: string; status?: string; manual?: boolean } | null;
  imageVersions: Array<{ url: string; status?: string; createdAt?: string }>;
  imageAttempts: number;
  pricing: {
    sourceCostGhs: number;
    chinaShippingBufferGhs: number;
    internationalShippingBufferGhs: number;
    customsRiskBufferGhs: number;
    paymentFeeGhs: number;
    totalLandedCostGhs: number;
    suggestedPrice: number;
    estimatedProfitGhs: number;
    estimatedProfitPercent: number;
    exchangeRate: number;
    manualOverride?: boolean;
  } | null;
  risk: { level: string; notes: string[] };
  error: { stage: string; message: string } | null;
  publishedProductId: string | null;
  createdAt: string;
}

export const DRAFT_STATUS_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  ai_processing: 'AI Processing',
  copy_generated: 'Copy Generated',
  image_generated: 'Image Generated',
  needs_review: 'Needs Review',
  ready_to_publish: 'Ready To Publish',
  published: 'Published',
  rejected: 'Rejected',
  failed: 'Failed',
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  uploaded: 'bg-slate-100 text-slate-700',
  ai_processing: 'bg-blue-100 text-blue-700',
  copy_generated: 'bg-indigo-100 text-indigo-700',
  image_generated: 'bg-indigo-100 text-indigo-700',
  needs_review: 'bg-amber-100 text-amber-800',
  ready_to_publish: 'bg-emerald-100 text-emerald-700',
  published: 'bg-emerald-600 text-white',
  rejected: 'bg-slate-200 text-slate-600',
  failed: 'bg-red-100 text-red-700',
};

export const RISK_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  blocked: 'bg-red-600 text-white',
};

export const SOURCE_PLATFORMS = ['temu', 'alibaba', 'aliexpress', '1688', 'other'];

export const FULFILMENT_STATUS_LABELS: Record<string, string> = {
  customer_paid: 'Customer Paid',
  source_purchase_pending: 'Source Purchase Pending',
  purchased_from_supplier: 'Purchased From Supplier',
  awaiting_supplier_dispatch: 'Awaiting Supplier Dispatch',
  international_shipping: 'International Shipping',
  arrived_in_ghana: 'Arrived In Ghana',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function formatGhs(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `GH₵${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
