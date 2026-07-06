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

const suggestions = [
    'What do you sell?',
    'Find me a kettle',
    'Track my order',
    'How does delivery work?',
];

function ProductPreview({ product, onClick }: { product: any; onClick: () => void }) {
    const productMedia = getPreferredMedia(product.mainMedia?.length ? product.mainMedia : product.images || []);

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group w-28 flex-shrink-0 overflow-hidden rounded-xl border border-sand bg-white transition-shadow hover:shadow-card"
            onClick={onClick}
        >
            <div className="relative aspect-square bg-sand/40">
                {productMedia ? (
                    productMedia.type === 'video' ? (
                        <video src={productMedia.url} className="h-full w-full object-cover" muted playsInline loop preload="metadata" />
                    ) : (
                        <Image src={productMedia.url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="112px" />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral/30">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
            </div>
            <div className="p-2">
                <p className="truncate text-xs font-semibold text-contrast">{product.name}</p>
                <p className="mt-0.5 text-xs font-bold text-brand">{formatPrice(product.price)}</p>
            </div>
        </Link>
    );
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: 'Hi 👋 I\'m your Cornerstore shopping assistant. Tell me what you need — I can help you find products, check delivery, or track an order.' }
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

    const send = async (text: string) => {
        const userMessage = text.trim();
        if (!userMessage || loading) return;

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        send(input);
    };

    const showSuggestions = messages.length === 1 && !loading;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group cs-chat-launcher fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full shadow-soft transition-all hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-brand/30 sm:bottom-6 sm:right-6 ${isOpen ? 'bg-contrast p-3.5 text-white' : 'bg-brand p-3.5 pr-4 text-white sm:p-4 sm:pr-5'}`}
                aria-label={isOpen ? 'Close chat' : 'Open shopping assistant'}
            >
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="hidden text-sm font-semibold sm:inline">Ask Cornerstore</span>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-x-3 bottom-20 z-[100] flex h-[72vh] max-h-[640px] flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-soft sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[24rem]">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-sand bg-brand px-4 py-3.5 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </span>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold leading-tight">Cornerstore Assistant</h3>
                            <p className="flex items-center gap-1.5 text-[0.7rem] text-white/80">
                                <span className="h-1.5 w-1.5 rounded-full bg-white/90" /> Online · usually replies fast
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto bg-cream p-4">
                        {messages.map((msg, index) => (
                            <div key={index} className="flex flex-col space-y-2">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md border border-sand bg-white text-contrast shadow-sm'}`}>
                                        {msg.content}
                                    </div>
                                </div>

                                {msg.payload?.products?.length > 0 && (
                                    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-1 pb-1 pt-1">
                                        {msg.payload.products.map((product: any) => (
                                            <ProductPreview key={product._id} product={product} onClick={() => setIsOpen(false)} />
                                        ))}
                                    </div>
                                )}

                                {msg.payload?.order && (
                                    <div className="flex justify-start">
                                        <div className="w-full max-w-[90%] rounded-2xl border border-sand bg-white p-3.5 text-sm shadow-sm">
                                            <div className="mb-2.5 flex items-center gap-2 border-b border-sand pb-2 font-semibold">
                                                <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h13v8H3zM16 10h3l2 2v3h-5z" /></svg>
                                                Order Status
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-1.5 text-[0.82rem]">
                                                <div className="text-neutral">Status</div>
                                                <div className="font-semibold capitalize">{msg.payload.order.status}</div>
                                                <div className="text-neutral">Payment</div>
                                                <div className="font-semibold capitalize">{msg.payload.order.paymentStatus}</div>
                                                {msg.payload.order.carrier && (
                                                    <>
                                                        <div className="text-neutral">Carrier</div>
                                                        <div>{msg.payload.order.carrier}</div>
                                                    </>
                                                )}
                                            </div>
                                            {msg.payload.order.trackingUrl && (
                                                <a href={msg.payload.order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 border-t border-sand pt-2.5 text-sm font-semibold text-brand hover:underline">
                                                    Track package →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {showSuggestions && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {suggestions.map((s) => (
                                    <button key={s} onClick={() => send(s)} className="rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-medium text-contrast transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-dark">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-bl-md border border-sand bg-white px-4 py-3 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral/50" style={{ animationDelay: '0ms' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral/50" style={{ animationDelay: '150ms' }}></div>
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-neutral/50" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="border-t border-sand bg-white p-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for a product or help..."
                                className="w-full rounded-full border border-sand bg-cream py-2.5 pl-4 pr-11 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand p-2 text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
                                aria-label="Send message"
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
