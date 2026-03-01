interface OrderStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳'
    },
    processing: {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '⚙️'
    },
    shipped: {
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '📦'
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌'
    },
    refunded: {
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '💰'
    }
};

export default function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
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
            title={`Order status: ${config.label}`}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
