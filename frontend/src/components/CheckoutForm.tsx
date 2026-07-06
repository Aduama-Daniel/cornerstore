'use client';

import { useState } from 'react';
import Link from 'next/link';

// ... imports
import { GHANA_REGIONS } from '@/lib/constants';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  town?: string;
  saveAddress: boolean;
  acceptedTerms: boolean;
}

interface CheckoutFormProps {
  onSubmit: (address: ShippingAddress) => void;
  loading: boolean;
  initialValues?: Partial<ShippingAddress>;
}

const GHANA_PHONE_REGEX = /^(?:\+?233|0)(?:2[034567]|5[045679])\d{7}$/;

export function isValidGhanaPhone(value: string) {
  return GHANA_PHONE_REGEX.test(value.replace(/[\s-]/g, ''));
}

export default function CheckoutForm({ onSubmit, loading, initialValues }: CheckoutFormProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: initialValues?.fullName || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    region: initialValues?.region || 'Greater Accra',
    town: initialValues?.town || '',
    saveAddress: false,
    acceptedTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidGhanaPhone(formData.phone)) {
      setPhoneError('Enter a valid Ghana mobile number, e.g. 024 000 0000 or +233 24 000 0000.');
      document.getElementById('phone')?.focus();
      return;
    }
    setPhoneError(null);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                setPhoneError(null);
                handleChange(e);
              }}
              required
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              className="input-field"
              placeholder="024 000 0000"
            />
            {phoneError && (
              <p id="phone-error" role="alert" className="mt-2 text-sm text-red-600">
                {phoneError}
              </p>
            )}
            <p className="mt-1.5 text-xs text-neutral">
              We use this number to coordinate delivery. WhatsApp-reachable numbers help.
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm mb-2">
              Street Address / Digital Address (GPS) *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              autoComplete="street-address"
              className="input-field"
              placeholder="House No, Street Name or GPS Address (e.g. GA-123-4567)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm mb-2">
                Region *
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="input-field"
              >
                {GHANA_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Accra"
              />
            </div>
          </div>

          <div>
            <label htmlFor="town" className="block text-sm mb-2">
              Town / Area (Optional)
            </label>
            <input
              type="text"
              id="town"
              name="town"
              value={formData.town}
              onChange={handleChange}
              className="input-field"
              placeholder="East Legon"
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="saveAddress"
              name="saveAddress"
              checked={formData.saveAddress}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-contrast focus:ring-contrast"
            />
            <label htmlFor="saveAddress" className="text-sm cursor-pointer">
              Save this address for future orders
            </label>
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="rounded-2xl bg-warm-beige p-4">
        <p className="text-sm text-neutral">
          <strong>Payment note:</strong> International items require upfront payment. Eligible local items may support Pay on Delivery depending on location and order details. Secure online payments are processed through Paystack.
        </p>
      </div>

      <div className="rounded-2xl border border-sand bg-white p-4">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-neutral">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={formData.acceptedTerms}
            onChange={handleChange}
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-contrast focus:ring-contrast"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="font-semibold text-contrast underline">Terms & Conditions</Link>,{' '}
            <Link href="/shipping" className="font-semibold text-contrast underline">Delivery Policy</Link>, and{' '}
            <Link href="/returns" className="font-semibold text-contrast underline">Returns Policy</Link>.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>

      <p className="text-xs text-center text-neutral">
        Delivery fees and timelines can vary by location, item size, and delivery method.
      </p>
    </form>
  );
}
