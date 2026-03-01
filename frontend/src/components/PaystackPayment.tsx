'use client';

import { usePaystackPayment } from 'react-paystack';
import { formatPrice } from '@/lib/currency';

interface PaystackPaymentProps {
    email: string;
    amount: number; // in GH₵
    onSuccess: (reference: string) => void;
    onClose: () => void;
    disabled?: boolean;
    metadata?: Record<string, any>;
}

export default function PaystackPayment({
    email,
    amount,
    onSuccess,
    onClose,
    disabled = false,
    metadata = {}
}: PaystackPaymentProps) {
    const config = {
        reference: `CRN-${Date.now()}`,
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in pesewas (kobo)
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        currency: 'GHS', // Ghana Cedis
        metadata: {
            custom_fields: [
                {
                    display_name: 'Order ID',
                    variable_name: 'order_id',
                    value: metadata.orderId || 'N/A'
                },
                {
                    display_name: 'Customer Name',
                    variable_name: 'customer_name',
                    value: metadata.customerName || 'N/A'
                }
            ],
            ...metadata
        }
    };

    const initializePayment = usePaystackPayment(config);

    const handlePayment = () => {
        initializePayment({
            onSuccess: (reference: any) => {
                // Payment successful
                onSuccess(reference.reference);
            },
            onClose: () => {
                // Payment closed/cancelled
                onClose();
            }
        });
    };

    return (
        <button
            onClick={handlePayment}
            disabled={disabled}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {disabled ? 'Processing...' : `Pay ${formatPrice(amount)}`}
        </button>
    );
}
