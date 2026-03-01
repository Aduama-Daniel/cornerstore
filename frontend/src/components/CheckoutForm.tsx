'use client';

import { useState } from 'react';

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
}

interface CheckoutFormProps {
  onSubmit: (address: ShippingAddress) => void;
  loading: boolean;
  initialValues?: Partial<ShippingAddress>;
}

export default function CheckoutForm({ onSubmit, loading, initialValues }: CheckoutFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: initialValues?.fullName || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    region: initialValues?.region || 'Greater Accra',
    town: initialValues?.town || '',
    saveAddress: false,
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
              onChange={handleChange}
              required
              className="input-field"
              placeholder="024 000 0000"
            />
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
      <div className="bg-warm-beige p-4 rounded">
        <p className="text-sm text-neutral">
          <strong>Note:</strong> You will be redirected to Paystack to complete your payment securely.
        </p>
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
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
