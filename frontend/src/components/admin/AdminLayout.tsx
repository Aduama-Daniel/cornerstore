'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: 'Dashboard' },
        { name: 'Products', href: '/admin/products', icon: 'Products' },
        { name: 'Categories', href: '/admin/categories', icon: 'Categories' },
        { name: 'Brands', href: '/admin/brands', icon: 'Brands' },
        { name: 'Colors', href: '/admin/colors', icon: 'Colors' },
        { name: 'Collections', href: '/admin/collections', icon: 'Collections' },
        { name: 'Reviews', href: '/admin/reviews', icon: 'Reviews' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminCredentials');
        router.push('/admin/login');
    };

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div>
                        <Link href="/admin" className="text-2xl font-bold text-gray-900">
                            Cornerstore Admin
                        </Link>
                        {title && <p className="mt-1 text-sm text-gray-500">{title}</p>}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-md px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex gap-8">
                    <aside className="hidden w-64 flex-shrink-0 lg:block">
                        <nav className="sticky top-24 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive(item.href)
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{item.name}</span>
                                    <span className="text-[0.65rem] uppercase tracking-[0.25em] opacity-60">{item.icon}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    <main className="min-w-0 flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
