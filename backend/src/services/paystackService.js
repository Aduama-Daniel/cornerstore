import crypto from 'node:crypto';
import { paystackConfig } from '../config/paystack.js';

async function paystackRequest(path, options = {}) {
  if (!paystackConfig.secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const response = await fetch(`${paystackConfig.baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${paystackConfig.secretKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.status) {
    throw new Error(data?.message || `Paystack request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Verify a Paystack transaction
 * @param {string} reference - The transaction reference to verify
 * @returns {Promise<Object>} - The verification response data
 */
export async function verifyTransaction(reference) {
  try {
    return await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
  } catch (error) {
    console.error('Paystack verification error:', error.message);
    throw new Error(error.message || 'Failed to verify transaction');
  }
}

/**
 * Initialize a Paystack transaction (if needed backend-side)
 * @param {string} email - Customer email
 * @param {number} amount - Amount in kobo/pesewas
 * @returns {Promise<Object>} - The initialization response
 */
export async function initializeTransaction(email, amount, metadata = {}) {
  try {
    return await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: 'GHS',
        metadata,
      }),
    });
  } catch (error) {
    console.error('Paystack initialization error:', error.message);
    throw new Error(error.message || 'Failed to initialize transaction');
  }
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = paystackConfig.webhookSecret || paystackConfig.secretKey;

  if (!secret || !rawBody || !signature) {
    return false;
  }

  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
