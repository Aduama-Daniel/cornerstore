import axios from 'axios';
import { paystackConfig } from '../config/paystack.js';

/**
 * Verify a Paystack transaction
 * @param {string} reference - The transaction reference to verify
 * @returns {Promise<Object>} - The verification response data
 */
export async function verifyTransaction(reference) {
  try {
    const response = await axios.get(
      `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify transaction');
  }
}

/**
 * Initialize a Paystack transaction (if needed backend-side)
 * @param {string} email - Customer email
 * @param {number} amount - Amount in kobo/pesewas
 * @returns {Promise<Object>} - The initialization response
 */
export async function initializeTransaction(email, amount) {
  try {
    const response = await axios.post(
      `${paystackConfig.baseUrl}/transaction/initialize`,
      { email, amount: Math.round(amount * 100) }, // Amount in kobo
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize transaction');
  }
}
