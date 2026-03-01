'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/currency';

interface Message {
    role: 'user' | 'model';
    content: string;
    payload?: any;
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
        console.log('[CHATBOT] User message:', { text: userMessage, timestamp: new Date().toISOString() });
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // Filter out the initial greeting from history sent to API
            const history = messages.slice(1);
            console.log('[CHATBOT] Sending to API with', history.length, 'history items');

            console.log('[CHATBOT] Calling API endpoint...');
            const response = await api.chat.sendMessage(userMessage, history);

            console.log('[CHATBOT] API Response received:', {
                success: response.success,
                hasData: !!response.data,
                hasResponse: !!response.data?.response,
                timestamp: new Date().toISOString()
            });

            if (response.success && response.data) {
                console.log('[CHATBOT] Valid response, adding message to state');
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: response.data.response,
                    payload: response.data.payload
                }]);
            } else {
                console.warn('[CHATBOT] Invalid response format:', response);
                setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('[CHATBOT] Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack',
                timestamp: new Date().toISOString()
            });
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I could not reach the server. Please check your connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => {
                    console.log('Toggling chat, new state:', !isOpen);
                    setIsOpen(!isOpen);
                }}
                className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-contrast ${isOpen ? 'bg-neutral text-white rotate-90' : 'bg-contrast text-white'
                    }`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[100] w-80 md:w-96 bg-white border border-neutral/20 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[600px] h-[500px]">
                    {/* Header */}
                    <div className="bg-warm-beige p-4 border-b border-neutral/10 flex justify-between items-center">
                        <h3 className="font-serif font-medium text-lg">Cornerstore Assistant</h3>
                        <span className="text-xs text-neutral bg-white px-2 py-0.5 rounded-full border border-neutral/10">Gemini 2.0</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, index) => (
                            <div key={index} className="flex flex-col space-y-2">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user'
                                            ? 'bg-contrast text-white rounded-br-none'
                                            : 'bg-white border border-neutral/10 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>

                                {msg.payload && msg.payload.products && msg.payload.products.length > 0 && (
                                    <div className="flex overflow-x-auto gap-3 pb-2 pt-1 px-1 custom-scrollbar">
                                        {msg.payload.products.map((product: any) => (
                                            <Link
                                                href={`/product/${product.slug}`}
                                                key={product._id}
                                                className="flex-shrink-0 w-32 bg-white border border-neutral/10 rounded-md overflow-hidden hover:shadow-md transition-shadow group"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className="aspect-[3/4] relative bg-neutral/5">
                                                    {(product.mainMedia?.[0]?.url || product.images?.[0]) ? (
                                                        <Image
                                                            src={product.mainMedia?.[0]?.url || product.images?.[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            sizes="128px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral/30">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs font-medium truncate">{product.name}</p>
                                                    <p className="text-xs text-neutral mt-0.5">{formatPrice(product.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {msg.payload && msg.payload.order && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-neutral/10 p-3 rounded-lg shadow-sm w-full max-w-[80%] text-sm">
                                            <div className="font-medium border-b border-neutral/10 pb-2 mb-2">Order Status</div>
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
                                                <div className="mt-3 pt-2 border-t border-neutral/10">
                                                    <a href={msg.payload.order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-contrast hover:underline flex items-center gap-1">
                                                        Track Package <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
                                <div className="bg-white border border-neutral/10 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-neutral/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about our products..."
                                className="w-full pl-4 pr-10 py-2 border border-neutral/20 rounded-full focus:outline-none focus:border-contrast focus:ring-1 focus:ring-contrast text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-1 top-1 p-1.5 bg-contrast text-white rounded-full disabled:opacity-50 hover:bg-black transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
