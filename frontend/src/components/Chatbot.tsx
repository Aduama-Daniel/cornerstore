'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getPreferredMedia } from '@/lib/media';
import { formatPrice } from '@/lib/currency';

interface Message {
    role: 'user' | 'model';
    content: string;
    payload?: any;
}

function ProductPreview({ product, onClick }: { product: any; onClick: () => void }) {
    const productMedia = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (hovered) {
            video.currentTime = 0;
            void video.play().catch(() => {});
        } else {
            video.pause();
            video.currentTime = 0;
        }
    }, [hovered]);

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group w-32 flex-shrink-0 overflow-hidden rounded-md border border-neutral/10 bg-white transition-shadow hover:shadow-md"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="relative aspect-[3/4] bg-neutral/5">
                {productMedia ? (
                    productMedia.type === 'video' ? (
                        <>
                            <video ref={videoRef} src={productMedia.url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" muted playsInline loop preload="metadata" />
</>
                    ) : (
                        <Image src={productMedia.url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="128px" />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral/30">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
            </div>
            <div className="p-2">
                <p className="truncate text-xs font-medium">{product.name}</p>
                <p className="mt-0.5 text-xs text-neutral">{formatPrice(product.price)}</p>
            </div>
        </Link>
    );
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: 'Hi there! I can help you find products or answer questions about our store. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const history = messages.slice(1);
            const response = await api.chat.sendMessage(userMessage, history);

            if (response.success && response.data) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: response.data.response,
                    payload: response.data.payload
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('[CHATBOT] Error details:', error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I could not reach the server. Please check your connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 z-[100] rounded-full p-3 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-contrast focus:ring-offset-2 sm:bottom-6 sm:right-6 sm:p-4 ${isOpen ? 'bg-neutral text-white rotate-90' : 'bg-contrast text-white'}`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-x-3 bottom-20 z-[100] flex h-[70vh] max-h-[620px] flex-col overflow-hidden rounded-2xl border border-neutral/20 bg-white shadow-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-96">
                    <div className="flex items-center justify-between border-b border-neutral/10 bg-warm-beige p-4">
                        <h3 className="font-serif text-lg font-medium">Cornerstore Assistant</h3>
                        <span className="rounded-full border border-neutral/10 bg-white px-2 py-0.5 text-xs text-neutral">Gemini 2.0</span>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4">
                        {messages.map((msg, index) => (
                            <div key={index} className="flex flex-col space-y-2">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'rounded-br-none bg-contrast text-white' : 'rounded-bl-none border border-neutral/10 bg-white text-gray-800 shadow-sm'}`}>
                                        {msg.content}
                                    </div>
                                </div>

                                {msg.payload?.products?.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
                                        {msg.payload.products.map((product: any) => (
                                            <ProductPreview key={product._id} product={product} onClick={() => setIsOpen(false)} />
                                        ))}
                                    </div>
                                )}

                                {msg.payload?.order && (
                                    <div className="flex justify-start">
                                        <div className="w-full max-w-[85%] rounded-lg border border-neutral/10 bg-white p-3 text-sm shadow-sm">
                                            <div className="mb-2 border-b border-neutral/10 pb-2 font-medium">Order Status</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="text-neutral">Status:</div>
                                                <div className="font-medium capitalize">{msg.payload.order.status}</div>
                                                <div className="text-neutral">Payment:</div>
                                                <div className="font-medium capitalize">{msg.payload.order.paymentStatus}</div>
                                                {msg.payload.order.carrier && (
                                                    <>
                                                        <div className="text-neutral">Carrier:</div>
                                                        <div>{msg.payload.order.carrier}</div>
                                                    </>
                                                )}
                                            </div>
                                            {msg.payload.order.trackingUrl && (
                                                <div className="mt-3 border-t border-neutral/10 pt-2">
                                                    <a href={msg.payload.order.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-contrast hover:underline">
                                                        Track Package
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-lg rounded-bl-none border border-neutral/10 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-neutral/10 bg-white p-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about our products..."
                                className="w-full rounded-full border border-neutral/20 py-2 pl-4 pr-10 text-sm focus:border-contrast focus:outline-none focus:ring-1 focus:ring-contrast"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-1 top-1 rounded-full bg-contrast p-1.5 text-white transition-colors hover:bg-black disabled:opacity-50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

