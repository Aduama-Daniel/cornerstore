interface PaymentStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusConfig = {
    paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓'
    },
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳'
    },
    failed: {
        label: 'Failed',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '✗'
    }
};

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.color}
        ${sizeClasses[size]}
      `}
            title={`Payment status: ${config.label}`}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
